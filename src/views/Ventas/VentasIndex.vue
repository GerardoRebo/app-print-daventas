<template>
  <v-card class="mb-2">
    <v-card-title>Historial Ventas</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <!-- Fecha inicio -->
        <v-col cols="12" md="3">
          <v-menu v-model="menuInicio" :close-on-content-click="false" transition="scale-transition" offset-y
            color="primary">
            <template #activator="{ props }">
              <v-text-field color="primary" v-bind="props" v-model="formattedDFecha" @update:model-value="updateDFecha"
                label="Fecha inicio" prepend-inner-icon="mdi-calendar" readonly clearable />
            </template>
            <v-date-picker v-model="dfecha" @update:model-value="menuInicio = false" color="primary" />
          </v-menu>
        </v-col>

        <!-- Fecha fin -->
        <v-col cols="12" md="3">
          <v-menu v-model="menuFin" :close-on-content-click="false" transition="scale-transition" offset-y
            color="primary">
            <template #activator="{ props }">
              <v-text-field v-bind="props" v-model="formattedHFecha" @update:model-value="updateHFecha"
                label="Fecha fin" prepend-inner-icon="mdi-calendar" readonly clearable color="primary" />
            </template>
            <v-date-picker v-model="hfecha" @update:model-value="menuFin = false" color="primary" />
          </v-menu>
        </v-col>

        <!-- Almacén -->
        <v-col cols="12" md="2">
          <v-select prepend-inner-icon="mdi-warehouse" v-model="filters.almacen_id" :items="almacenes" label="Almacén" clearable item-title="name"
            item-value="id" color="primary" />
        </v-col>
      </v-row>

      <v-row dense>
        <!-- Cliente -->
        <v-col cols="12" md="2">
          <v-autocomplete prepend-inner-icon="mdi-account" v-model="filters.cliente" :items="clientes" item-title="name" item-value="id" label="Cliente"
            return-object clearable @update:model-value="val => filters.cliente_id = val ? val.id : null"
            density="compact" variant="outlined" />
        </v-col>

        <!-- Tipo -->
        <v-col cols="12" md="2">
          <v-select prepend-inner-icon="mdi-cash" v-model="filters.tipo" :items="[
            { title: 'Efectivo', value: 'efectivo' },
            { title: 'Crédito', value: 'credito' },
          ]" label="Tipo" clearable color="primary" />
        </v-col>

        <!-- Consecutivo -->
        <v-col cols="12" md="2">
          <v-text-field v-model="filters.consecutivo" label="Consecutivo" placeholder="#" color="primary" clearable
            prepend-inner-icon="mdi-magnify" @keydown.enter="search = String(Date.now())"
            @click:prepend-inner="search = String(Date.now())" @click:clear="search = String(Date.now())" />
        </v-col>
        <!-- Turno -->
        <v-col cols="12" md="2">
          <v-text-field v-model="filters.turno_id" label="Corte" placeholder="#" color="primary" clearable
            prepend-inner-icon="mdi-magnify" @keydown.enter="search = String(Date.now())"
            @click:prepend-inner="search = String(Date.now())" @click:clear="search = String(Date.now())" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- Tabla -->
  <v-container fluid>
    <template v-if="loadingInitial">
      <v-skeleton-loader type="table" />
    </template>

    <template v-else>
      <v-data-table-server :search="search" :items="misventas.data" :items-length="misventas.total ?? 0"
        :loading="cargando" :headers="headers" @update:options="getMisVentas" fixed-header height="60vh"
        density="compact" color="primary" hover>

        <!-- Columna FECHA -->
        <template #item.pagado_en="{ item }">
          {{ moment(item.pagado_en).format("DD-MM-YYYY h:mm:ssa") }}
        </template>

        <!-- Cliente -->
        <template #item.cliente.name="{ item }">
          {{ item.cliente?.name }}
        </template>

        <!-- Almacén -->
        <template #item.almacen.name="{ item }">
          <strong>{{ item.almacen?.name }}</strong>
        </template>

        <!-- Total -->
        <template #item.total="{ item }">
          ${{ formatNumber(item.total) }}
        </template>

        <!-- Devuelto -->
        <template #item.total_devuelto="{ item }">
          {{ item.total_devuelto > 0 ? "Sí" : "No" }}
        </template>

        <!-- Estado -->
        <template #item.esta_cancelado="{ item }">
          <span :class="item.esta_cancelado ? 'text-error' : 'text-success'">
            {{ item.esta_cancelado ? "Cancelada" : "Activa" }}
          </span>
        </template>

        <!-- ACCIONES -->
        <template #item.actions="{ item }">
          <VentaRowActions :venta="item" @imprimir-venta="imprimirVenta" @cancelar-venta="cancelarVenta"
            @create-devolucion="createDevolucion" />
        </template>

      </v-data-table-server>
    </template>
  </v-container>
</template>

<script setup>
import moment from "moment-timezone";
import { ref, reactive, watch, onMounted, h } from "vue";
import { useRoute, useRouter } from "vue-router";

import PuntoVenta from "@js/apis/PuntoVenta";
import Devoluciones from "@js/apis/Devoluciones";
import VentaRowActions from "./VentaRowActions.vue";
import useMisFechas from "@js/composables/useMisFechas";
import { useUserStore } from "@js/s";
import { useCurrency } from '@js/composables/useCurrency';
const { formatNumber } = useCurrency('es-MX', 'MXN');

const s = useUserStore();
const { handleOpException } = s;

const route = useRoute();
const router = useRouter();

// Menús fechas
const menuInicio = ref(false);
const menuFin = ref(false);
const search = ref("");
const clientes = ref([]);
const almacenes = ref([]);

// Composable fechas
const { dfecha, hfecha, formattedDFecha, formattedHFecha, updateDFecha, updateHFecha } = useMisFechas();

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
});

// Filtros que sí deben ir a la URL
const filters = reactive({
  cliente: null,
  cliente_id: null,
  almacen_id: null,
  consecutivo: "",
  tipo: 'efectivo',
  turno_id: null,
});


// las columnas de la tabla
const headers = [
  { title: "ID", key: "id" },
  { title: "Fecha", key: "pagado_en" },
  { title: "Consecutivo", key: "consecutivo" },
  { title: "Corte", key: "turno_id" },
  { title: "Nombre", key: "nombre" },
  { title: "Cliente", key: "cliente.name" },
  { title: "Almacén", key: "almacen.name" },
  { title: "Total", key: "total" },
  { title: "Devuelto", key: "total_devuelto" },
  { title: "Estado", key: "esta_cancelado" },
  { title: "Acciones", key: "actions", sortable: false },
];

const misventas = ref([]);

const cargando = ref(false);
const loadingInitial = ref(true);

watch([dfecha, hfecha], () => {
  if (loadingInitial.value) return;
    
  getMisVentas(options.value)
});
// Cuando cambian los filtros, actualizar URL (sin fechas)
watch(
  () => ({
    cliente_id: filters.cliente_id,
    almacen_id: filters.almacen_id,
    tipo: filters.tipo,
  }),
  (newFilters) => {

    router.replace({
      name: route.name,
      query: {
        ...route.query,
        ...newFilters,
        page: 1,
      },
    });
    if (loadingInitial.value) return;
    console.log('here');

    search.value = String(Date.now())
  }
);


// Obtener ventas
async function getMisVentas(newOptions) {
  if (newOptions) {
    options.value = { ...options.value, ...newOptions };
  }

  try {
    cargando.value = true;

    const { page, itemsPerPage } = options.value;

    const { data } = await PuntoVenta.getMisVentas({
      items_per_page: itemsPerPage,
      page: page,
      dfecha: dfecha.value,
      hfecha: hfecha.value,
      ...filters,
    });

    misventas.value = data.ventas;
    clientes.value = data.clientes;
    almacenes.value = data.almacenes;

    // Mantener cliente seleccionado
    if (clientes.value.length && filters.cliente_id) {
      filters.cliente = clientes.value.find(
        c => c.id == filters.cliente_id
      ) || null;
    }

    // Mantener almacén seleccionado
    if (almacenes.value.length && filters.almacen_id) {
      filters.almacen = almacenes.value.find(
        a => a.id == filters.almacen_id
      ) || null;
    }

    // SI LA PÁGINA QUEDA VACÍA → regresar una página
    if (
      misventas.value.data.length === 0 &&
      options.value.page > 1
    ) {
      options.value.page--;
      return getMisVentas(options.value);
    }

  } catch (error) {
    handleOpException(error);
    alert("Ha ocurrido un error");
  } finally {
    cargando.value = false;
  }
}


function cancelarVenta(venta) {
  if (cargando.value) return;

  cargando.value = true;

  PuntoVenta.cancelarVenta(venta)
    .then(() => {
      cargando.value = false;
      getMisVentas(options.value);
    })
    .catch(handleOpException)
    .finally(() => (cargando.value = false));
}

function createDevolucion(venta) {
  Devoluciones.createDevolucion(venta)
    .then((response) => {
      router.push({
        name: "DevolucionesShow",
        params: {
          devolucion: response.data.id,
          venta: response.data.ventaticket_id,
        },
      });
    })
    .catch(handleOpException);
}

function imprimirVenta(ticketActual) {
  if (window.__TAURI__) {
    new WebviewWindow("ImprimirVentas", {
      url: `ventatickets/imprimir/${ticketActual}`,
      title: "Imprimir Venta",
    });
    return;
  }

  window.open(
    `${import.meta.env.VITE_APP_URL}/ventatickets/imprimir/${ticketActual}`,
    "_blank",
    "noreferrer"
  );
}
// Sync filtros desde la URL
onMounted(async () => {
  // Fechas ISO (YYYY-MM-DD) desde la URL
  if (route.query.dfecha) dfecha.value = new Date(route.query.dfecha);
  if (route.query.hfecha) hfecha.value = new Date(route.query.hfecha);

  // Otros filtros
  Object.keys(filters).forEach((key) => {
    if (route.query[key] !== undefined) filters[key] = route.query[key];
  });
  filters.cliente_id = route.query.cliente_id ?? null;
  filters.almacen_id = route.query.almacen_id ?? null;
  setTimeout(() => {
    loadingInitial.value = false;
  }, 800);
});
</script>

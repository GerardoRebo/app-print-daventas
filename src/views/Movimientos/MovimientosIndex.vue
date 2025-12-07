<template>
  <v-card class="mb-2" v-if="mdAndUp">
    <v-card-title>Historial Movimientos</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-col cols="12" sm="2">
          <v-menu v-model="menuInicio" :close-on-content-click="false" transition="scale-transition" offset-y
            color="primary">
            <template #activator="{ props }">
              <v-text-field color="primary" v-bind="props" v-model="formattedDFecha" @update:model-value="updateDFecha"
                label="Fecha inicio" prepend-inner-icon="mdi-calendar" readonly clearable />
            </template>
            <v-date-picker v-model="dfecha" @update:model-value="menuInicio = false" color="primary" />
          </v-menu>
        </v-col>
        <v-col cols="12" sm="2">
          <v-menu v-model="menuFin" :close-on-content-click="false" transition="scale-transition" offset-y
            color="primary">
            <template #activator="{ props }">
              <v-text-field v-bind="props" v-model="formattedHFecha" @update:model-value="updateHFecha"
                label="Fecha fin" prepend-inner-icon="mdi-calendar" readonly clearable color="primary" />
            </template>
            <v-date-picker v-model="hfecha" @update:model-value="menuFin = false" color="primary" />
          </v-menu>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="2">
          <v-select :items="[
            { value: '', title: 'Cualquier estado' },
            { value: 'P', title: 'Pendiente' },
            { value: 'R', title: 'Recibida' },
            { value: 'C', title: 'Cancelada' },
          ]" label="Estado" clearable prepend-inner-icon="mdi-list-status" v-model="estadomovimiento" hide-details></v-select>
        </v-col>
        <v-col cols="12" sm="2">
          <v-select prepend-inner-icon="mdi-handshake" clearable :items="proveedorsItems" label="Proveedor" v-model="proveedor"
            hide-details></v-select>
        </v-col>
        <v-col cols="12" sm="2">
          <v-select :items="almacensItems" prepend-inner-icon="mdi-warehouse" clearable label="Almacén" v-model="almacen"
            hide-details></v-select>
        </v-col>
        <v-col cols="12" sm="2">
          <v-select :items="tipoMovimientoItems" label="Tipo movimiento" clearable v-model="tipoMovimiento"
            hide-details></v-select>
        </v-col>
        <v-col cols="12" sm="2">
          <v-text-field label="Buscar por consecutivo" placeholder="Ingresa folio + Enter" v-model="folio" hide-details
            @keydown.stop.enter="getMisMovimientos" autocomplete="password" :append-inner-icon="'mdi-magnify'"
            @click:append-inner="getMisMovimientos" />
        </v-col>

      </v-row>
    </v-card-text>
  </v-card>
  <v-toolbar v-if="smAndDown" class="mb-2">
    <v-toolbar-title>Productos
    </v-toolbar-title>
    <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
      @click="drawer = true">
      Filtros
    </v-btn>
  </v-toolbar>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary
    v-if="smAndDown">
    <v-card>
      <v-container>
        <v-row dense class="mt-4">
          <v-col cols="12" sm="2">
            <v-date-input label="Desde" v-model="dfecha" hide-details></v-date-input>
          </v-col>
          <v-col cols="12" sm="2">
            <v-date-input label="Hasta" v-model="hfecha" hide-details></v-date-input>
          </v-col>
          <v-col cols="12" sm="1">
            <v-select :items="[
              { value: '', title: 'Cualquier estado' },
              { value: 'P', title: 'Pendiente' },
              { value: 'R', title: 'Recibida' },
              { value: 'C', title: 'Cancelada' },
            ]" label="Estado" v-model="estadomovimiento" max-width="200" hide-details></v-select>
          </v-col>
          <v-col cols="12" sm="1">
            <v-select :items="proveedorsItems" label="Proveedor" v-model="proveedor" max-width="200"
              hide-details></v-select>
          </v-col>
          <v-col cols="12" sm="1">
            <v-select :items="almacensItems" label="Almacén" v-model="almacen" max-width="200" hide-details></v-select>
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field label="Buscar por consecutivo" placeholder="Ingresa folio + Enter" v-model="folio" hide-details
              @keydown.stop.enter="getMisMovimientos" autocomplete="password" :append-inner-icon="'mdi-magnify'"
              @click:append-inner="getMisMovimientos" />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-navigation-drawer>
  <v-container fluid>
    <v-data-table-server :headers="tHeaders" :items="mismovimientos.data" :items-length="mismovimientos.total ?? 0"
      :loading="cargando" :search="search" @update:options="getMisMovimientos" fixed-header height="60vh"
      density="compact" hover color="primary">

      <!-- ID -->
      <template #item.id="{ item }">
        {{ item.id }}
      </template>

      <!-- Consecutivo -->
      <template #item.consecutivo="{ item }">
        {{ item.consecutivo }}
      </template>

      <!-- Fecha -->
      <template #item.enviada_en="{ item }">
        {{ moment(item.enviada_en).format("DD-MM-YYYY h:mm:ssa") }}
      </template>

      <!-- Usuario -->
      <template #item.user.name="{ item }">
        {{ item.user?.name }}
      </template>

      <!-- Origen -->
      <template #item.almacen_origen.name="{ item }">
        <strong>{{ item.almacen_origen?.name }}</strong>
      </template>

      <!-- Destino -->
      <template #item.almacen_destino.name="{ item }">
        <strong>{{ item.almacen_destino?.name ?? "" }}</strong>
      </template>

      <!-- Total -->
      <template #item.total_enviado="{ item }">
        <strong>{{ formatNumber(item.total_enviado) }}</strong>
      </template>

      <!-- Tipo -->
      <template #item.tipo="{ item }">
        <span class="font-bold">
          {{ item.tipo === "C" ? "Compra" :
            item.tipo === "T" ? "Transferencia" :
              item.tipo === "S" ? "S. Trans" : "" }}
        </span>
      </template>

      <!-- Proveedor -->
      <template #item.proveedor.name="{ item }">
        {{ item.proveedor?.name ?? "" }}
      </template>

      <!-- Estado -->
      <template #item.estado="{ item }">
        <span>
          {{
            item.estado === "C" ? "Cancelada" :
              item.estado === "P" ? "Pendiente" :
                item.estado === "R" ? "Recibida" :
                  "Borrador"
          }}
        </span>
      </template>

      <!-- Acciones -->
      <template #item.actions="{ item }">
        <router-link :to="{ name: 'MovimientosShow', params: { movimientoId: item.id } }" class="mx-1">
          <v-tooltip text="Ver" location="top">
            <template #activator="{ props }">
              <v-btn icon size="x-small" v-bind="props">
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </router-link>

        <v-tooltip text="Imprimir" location="top">
          <template #activator="{ props }">
            <v-btn icon size="x-small" class="mx-1" v-bind="props" @click="imprimirMovimiento(item.id)">
              <v-icon>mdi-cloud-print</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Cancelar" location="top" v-if="item.estado != 'C'">
          <template #activator="{ props }">
            <v-btn icon size="x-small" class="mx-1" v-bind="props" @click="cancelarMovimiento(item.id)">
              <v-icon>mdi-cancel</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <p class="text-error" v-if="item.estado == 'C'">
          Cancelada
        </p>
      </template>

    </v-data-table-server>

  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment-timezone"
import Movimientos from "@js/apis/Movimientos";
import Almacen from "@js/apis/Almacen";
import Proveedor from "@js/apis/Proveedor";
import useQuery from "@js/composables/useQuery";
import useDebounce from "@js/composables/useDebounce";
import { useUserStore } from "@js/s";
import useMisFechas from "@js/composables/useMisFechas";
import { useDisplay } from "vuetify";
import { reactive } from "vue";
const { xs, smAndDown, mdAndUp, mdAndDown } = useDisplay()
import { useCurrency } from '@js/composables/useCurrency';
const { formatNumber } = useCurrency('es-MX', 'MXN');
const s = useUserStore();
const { handleOpException } = s;
const route = useRoute();
const router = useRouter();
const { dfecha, hfecha, formattedDFecha, formattedHFecha, updateDFecha, updateHFecha } = useMisFechas();
const menuInicio = ref(false);
const menuFin = ref(false);
const { pushQuery } = useQuery();
let { debounce } = useDebounce();
// Composable fechas
const isAdmin = computed(() => {
  return s.roles.includes("Admin") || s.roles.includes("Owner");
});

const estadomovimiento = ref("");
const drawer = ref(true);
const proveedor = ref(null);
const proveedors = ref([]);
const mismovimientos = ref([]);
const almacens = ref([]);
const almacen = ref(null);
const tipoMovimiento = ref(null);
const folio = ref(null);
const cargando = ref(false);
const users = ref([]);
const page = ref(1);
const search = ref('');
// Filtros que sí deben ir a la URL
const filters = reactive({
  cliente: null,
  cliente_id: null,
  user: null,
  user_id: null,
  almacen_id: null,
  consecutivo: "",
  tipo: 'efectivo',
  turno_id: null,
});
const tHeaders = ref([
  { title: 'ID', key: 'id' },
  { title: 'Consecutivo', key: 'consecutivo' },
  { title: 'Fecha', key: 'enviada_en' },
  { title: 'Usuario', key: 'user.name' },
  { title: 'Almacén Origen', key: 'almacen_origen.name' },
  { title: 'Almacén Destino', key: 'almacen_destino.name' },
  { title: 'Total', key: 'total_enviado' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Proveedor', key: 'proveedor.name' },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'actions', sortable: false },
]);
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
});

const almacensItems = computed(() => [
  { title: 'Selecciona', value: null },
  ...almacens.value.map((item) => ({
    title: item.name,
    value: item.id.toString(),
  })),
]);
const tipoMovimientoItems = computed(() => [
  { title: 'Todos', value: null },
  { title: 'Compra', value: 'C' },
  { title: 'Transferencia', value: 'T' },
  { title: 'Solicitud de Transferencia', value: 'S' },
]);
const proveedorsItems = computed(() => [
  { title: 'Selecciona', value: null },
  ...proveedors.value.map((item) => ({
    title: item.name,
    value: item.id.toString(),
  })),
]);
watch(() => route.query, async () => {
  if (route.name != 'MovimientosIndex') {
    return
  }
  cargando.value = true;
  debounce(() => getMisMovimientos(), 1000);
})

watch(estadomovimiento, () => {
  pushQuery('estado', estadomovimiento.value)
});
watch(proveedor, () => {
  pushQuery('proveedor', proveedor.value)
});
watch(almacen, () => {
  pushQuery('almacen', almacen.value)
});
watch(tipoMovimiento, () => {
  pushQuery('tipoMovimiento', tipoMovimiento.value)
});
// const store = useStore();

function getMisMovimientos(newOptions) {
  if (newOptions) {
    options.value = { ...options.value, ...newOptions };
  }
  const { page, itemsPerPage } = options.value;
  cargando.value = true;
  Movimientos.getMisMovimientos({
    page: page,
    dfecha: dfecha.value,
    hfecha: hfecha.value,
    estadomovimiento: estadomovimiento.value,
    proveedor: proveedor.value,
    almacen: almacen.value,
    tipoMovimiento: tipoMovimiento.value,
    consecutivo: folio.value,
    items_per_page: itemsPerPage
  }
  )
    .then((response) => {
      mismovimientos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function getAllAlmacens() {
  Almacen.getAll()
    .then((response) => {
      almacens.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function getAllProveedors() {
  Proveedor.getAll()
    .then((response) => {
      proveedors.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function imprimirMovimiento(movimiento) {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirMovimientos', {
      url: `movimientos/imprimir/${movimiento}`,
      title: 'ImprimirMovimientos'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/movimientos/imprimir/${movimiento}/ `,
    "noreferrer",
    "_blank"
  );
}
function cancelarMovimiento(movimiento) {
  if (cargando.value) return;
  cargando.value = true;
  Movimientos.cancelarMovimiento(movimiento)
    .then(() => {
      cargando.value = false;
      inicializacion();
      getMisMovimientos(options.value);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;

    });
}
function inicializacion() {

  if (route.query.dfecha) {
    dfecha.value = moment(route.query.dfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.hfecha) {
    hfecha.value = moment(route.query.hfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.estado) {
    estadomovimiento.value = route.query.estado;
  }
  if (route.query.proveedor) {
    proveedor.value = route.query.proveedor;
  }
  if (route.query.page) {
    page.value = parseInt(route.query.page);
  }
  if (route.query.almacen) {
    almacen.value = route.query.almacen;
  }
  if (route.query.tipoMovimiento) {
    tipoMovimiento.value = route.query.tipoMovimiento;
  }
  // getMisMovimientos();
  getAllAlmacens();
  getAllProveedors();
}
inicializacion();
onMounted(() => {
});
</script>

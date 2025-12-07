<template>
  <v-card class="mb-2">
    <v-card-title>Cortes</v-card-title>
    <v-card-text>
      <v-row dense class="mb-3">

        <v-col cols="12" sm="2">
          <v-menu v-model="menuInicio" :close-on-content-click="false" transition="scale-transition" offset-y
            color="primary">
            <template #activator="{ props }">
              <v-text-field color="primary" v-bind="props" v-model="formattedDFecha" @update:model-value="updateDFecha"
                label="Fecha inicio" prepend-inner-icon="mdi-calendar" readonly clearable />
            </template>
            <v-date-picker v-model="dfecha" @update:model-value="menuInicio = false" color="primary" />
          </v-menu>
          <!-- <v-date-input label="Desde" v-model="filters.dfecha" @update:modelValue="triggerSearch" /> -->
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
          <!-- <v-date-input label="Hasta" v-model="filters.hfecha" @update:modelValue="triggerSearch" /> -->
        </v-col>
        <v-col cols="12" sm="3">
          <v-autocomplete v-model="filters.user_id" :items="users" item-title="name" item-value="id" label="Usuario"
            clearable @update:modelValue="triggerSearch" />
        </v-col>


        <!-- <v-col cols="12" sm="2">
          <v-text-field label="Buscar" placeholder="#, usuario…" v-model="filters.q" clearable
            prepend-inner-icon="mdi-magnify" @keydown.enter="triggerSearch" @click:clear="triggerSearch" />
        </v-col> -->
      </v-row>

    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-progress-linear color="primary" indeterminate v-if="false"></v-progress-linear>
    <v-data-table-server :headers="tHeaders" :items="miscortes.data" :items-length="miscortes.total ?? 0"
      :loading="loading" @update:options="getMisCortes" fixed-header height="60vh" density="compact" color="primary"
      hover>
      <!-- SLOT: ID -->
      <template #item.id="{ item }">
        <span>{{ item.id }}</span>
      </template>

      <!-- SLOT: USUARIO -->
      <template #item.usuario="{ item }">
        <p class="font-semibold" :class="item.termino_en == null ? 'text-green-600' : 'text-indigo-600'">
          {{ item.user.name }}
        </p>
      </template>

      <!-- SLOT: FECHA INICIO -->
      <template #item.inicio_en="{ item }">
        {{ moment(item.inicio_en).format("DD-MM-YYYY") }}
      </template>

      <!-- SLOT: FECHA CIERRE -->
      <template #item.termino_en="{ item }">
        {{ item.termino_en ? moment(item.termino_en).format("DD-MM-YYYY") : "Abierto" }}
      </template>

      <!-- SLOT: CONTADO -->
      <template #item.ventas_efectivo="{ item }">
        <span class="font-bold">{{ formatCurrency(item.ventas_efectivo) }}</span>
      </template>

      <!-- SLOT: CREDITO -->
      <template #item.ventas_credito="{ item }">
        {{ formatCurrency(item.ventas_credito) }}
      </template>

      <!-- SLOT: ABONOS -->
      <template #item.abonos_efectivo="{ item }">
        {{ formatCurrency(item.abonos_efectivo) }}
      </template>

      <!-- SLOT: COMPRAS -->
      <template #item.compras="{ item }">
        {{ formatCurrency(item.compras) }}
      </template>

      <!-- SLOT: GANANCIAS -->
      <template #item.acumulado_ganancias="{ item }">
        {{ formatCurrency(item.acumulado_ganancias) }}
      </template>

      <!-- SLOT: DEVOLUCIONES EFECTIVO -->
      <template #item.devoluciones_ventas_efectivo="{ item }">
        {{ formatCurrency(item.devoluciones_ventas_efectivo) }}
      </template>

      <!-- SLOT: DEVOLUCIONES CREDITO -->
      <template #item.devoluciones_ventas_credito="{ item }">
        {{ formatCurrency(item.devoluciones_ventas_credito) }}
      </template>

      <!-- SLOT: INGRESOS -->
      <template #item.acumulado_entradas="{ item }">
        <p class="cursor-pointer text-indigo-600" @click="$emit('getUserMovimientos', item.id)">
          {{ formatCurrency(item.acumulado_entradas) }}
        </p>
      </template>

      <!-- SLOT: SALIDAS -->
      <template #item.acumulado_salidas="{ item }">
        <p class="cursor-pointer text-indigo-600" @click="$emit('getUserMovimientos', item.id)">
          {{ formatCurrency(item.acumulado_salidas) }}
        </p>
      </template>

      <!-- SLOT: EFECTIVO SISTEMA -->
      <template #item.total_sistema="{ item }">
        {{ formatCurrency(item.total_sistema) }}
      </template>

      <!-- SLOT: EFECTIVO REAL -->
      <template #item.efectivo_al_cierre="{ item }">
        <p :class="item.total_sistema != item.efectivo_al_cierre ? 'text-red-600' : 'text-green-600'"
          class="font-semibold" :title="item.comments">
          {{ formatCurrency(item.efectivo_al_cierre) }}
        </p>
      </template>

      <!-- SLOT: ACCIONES -->
      <template #item.actions="{ item }">
        <router-link :to="{ name: 'AdminCortesShow', params: { corteId: item.id } }">
          <v-btn icon size="x-small">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </router-link>

        <v-btn :href="`/cortes/imprimir/${item.id}`" target="_blank" icon size="x-small">
          <v-icon>mdi-cloud-print</v-icon>
        </v-btn>
      </template>
    </v-data-table-server>
    <v-row class=" ma-1" justify="end">
      <v-pagination v-model="page" :length="miscortes.last_page" :total-visible="3"></v-pagination>
    </v-row>
  </v-container>
  <v-dialog v-model="isVisible" max-width="1200">
    <v-card>
      <v-card-title>Movimientos</v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="movimientos" items-per-page="5" show-select select-strategy="single">
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Cortes from "@js/apis/Cortes";
import useMisFechas from "@js/composables/useMisFechas";
import { useRoute, useRouter } from "vue-router";
import moment from "moment-timezone"
import { useCurrency } from '@js/composables/useCurrency';
const { formatCurrency } = useCurrency('es-MX', 'MXN');

const movimientos = ref([]);
const acumulados = ref(null);
const isVisible = ref(false);
const router = useRouter();
const route = useRoute();
const miscortes = ref({ data: [], total: 0 });
const loading = ref(false);
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
});
// Composable fechas
const { dfecha, hfecha, formattedDFecha, formattedHFecha, updateDFecha, updateHFecha } = useMisFechas();

const users = ref([]); // lista de usuarios obtenida del backend

const filters = ref({
  user_id: null,
  dfecha: null,
  hfecha: null,
});
const q = route.query;
if (q.user_id) filters.value.user_id = Number(q.user_id);
if (q.dfecha) dfecha.value = q.dfecha;
if (q.hfecha) hfecha.value = moment(q.hfecha, 'YYYY-MM-DD').toDate();
const menuInicio = ref(false);
const menuFin = ref(false);

const search = ref(String(Date.now())); // para refrescar tabla

const page = ref(1);

function triggerSearch() {
  search.value = String(Date.now());
  updateQueryString();
}
const tHeaders = ref([
  { title: 'Id', key: 'id' },
  { title: 'Usuario', key: 'usuario' },
  { title: 'Fecha Inicio', key: 'inicio_en' },
  { title: 'Fecha Cierre', key: 'termino_en' },
  { title: 'Venta Contado', key: 'ventas_efectivo' },
  { title: 'Venta Crédito', key: 'ventas_credito' },
  { title: 'Abono Crédito', key: 'abonos_efectivo' },
  { title: 'Compras Mercancia', key: 'compras' },
  { title: 'Acumulado Ganancias', key: 'acumulado_ganancias' },
  { title: 'Devoluciones Ventas', key: 'devoluciones_ventas_efectivo' },
  { title: 'Devoluciones Crédito', key: 'devoluciones_ventas_credito' },
  { title: 'Ingresos Efectivo', key: 'acumulado_entradas' },
  { title: 'Salidas Efectivo', key: 'acumulado_salidas' },
  { title: 'Efectivo Sistema', key: 'total_sistema' },
  { title: 'Efectivo Real', key: 'efectivo_al_cierre' },
  { title: 'Acciones', key: 'actions', sortable: false },
]);
const headers = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Cantidad', key: 'cantidad', align: 'start', sortable: false },
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: false },
  { title: 'Conceptos', key: 'conceptos', align: 'start', sortable: false },
  { title: 'Comentarios', key: 'comentarios', align: 'start', sortable: false },
]);

watch(dfecha, () => {
  getMisCortes();
});
watch(hfecha, () => {
  getMisCortes();
});
// const host = ref(import.meta.env.VITE_APP_URL);
function getMisCortes(newOptions) {
  if (newOptions) {
    options.value = { ...options.value, ...newOptions };
  }
  if (loading.value) return;
  loading.value = true;
  const { page, itemsPerPage } = options.value;
  console.log('here');

  Cortes.getMisCortes({
    page,
    items_per_page: itemsPerPage,
    user_id: filters.value.user_id,
    dfecha: dfecha.value ? moment(dfecha.value).format('YYYY-MM-DD') : null,
    hfecha: hfecha.value ? moment(hfecha.value).format('YYYY-MM-DD') : null,
  })
    .then((response) => {
      loading.value = false;
      miscortes.value = response.data.miscortes;
      acumulados.value = response.data.acumulados;
      users.value = response.data.users;
    })
    .catch((error) => {
      loading.value = false;
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}

function getUserMovimientos(turno) {
  Cortes.getUserMovimientos(turno)
    .then((response) => {
      movimientos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
  isVisible.value = true;
}
function updateQueryString() {
  router.push({
    name: route.name,
    query: {
      ...route.query,
      ...filters.value,
    },
  });
}
onMounted(() => {


});

</script>
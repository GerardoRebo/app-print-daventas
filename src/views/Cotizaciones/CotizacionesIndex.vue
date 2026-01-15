<template>
  <v-card class="mb-2">
    <v-card-title>Historial Cotizaciones</v-card-title>
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
      </v-row>
    </v-card-text>
  </v-card>
  <!-- Tabla -->
  <v-container fluid>
    <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
    <v-table density="compact" color="secondary">
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <TableRow v-for="venta in misventas.data" :key="venta.id" :cotizacion="venta" @imprimir-cotizacion="imprimirVenta"
          @cancelar-venta="cancelarVenta">
        </TableRow>
      </tbody>
    </v-table>
    <v-row class=" ma-1" justify="end">
      <v-pagination v-model="page" :length="misventas.last_page" :total-visible="3"></v-pagination>
    </v-row>
  </v-container>
</template>

<script setup>
import moment from "moment-timezone"
import { onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import Cotizacion from "@js/apis/Cotizacion";
import { useUserStore } from "@js/s";
import useMisFechas from "@js/composables/useMisFechas";
import TableRow from "./TableRow.vue";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";
const s = useUserStore();
const { handleOpException } = s;

const cargando = ref(false);
const misventas = ref([]);
const router = useRouter();
const route = useRoute();
const { processRequest } = useProcessRequest();
const { notify } = useNotification();

const tHeaders = ref([
  'Id',
  'Consecutivo',
  'Corte',
  'Fecha',
  'Cliente',
  'Almacén',
  'Total',
  'Status',
  '',
  '',
]);
// Menús fechas
const menuInicio = ref(false);
const menuFin = ref(false);

// Composable fechas
const { dfecha, hfecha, formattedDFecha, formattedHFecha, updateDFecha, updateHFecha } = useMisFechas();

const page = ref(1);
watch(page, (newVal) => {
  onPagination(newVal)
})
const onPagination = (page) => {
  router
    .push({ name: route.name, query: { ...route.query, page } })
    .catch(() => {
    }).finally(() => {
      getMisVentas()
    });
};

watch(() => route.query, () => {
  getMisVentas();
})

function getMisVentas() {
  processRequest(async () => {
    const response = await Cotizacion.getMisVentas(page.value, dfecha.value, hfecha.value);
    misventas.value = response.data;
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error");
    }
  });
}
function cancelarVenta(venta) {
  processRequest(async () => {
    await Cotizacion.cancelarVenta(venta);
    cargando.value = false;
    await getMisVentas();
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error");
    }
  });
}

function imprimirVenta(ticketActual) {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirVentas', {
      url: `cotizacions/imprimir/${ticketActual}`,
      title: 'Imprimir Venta'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/cotizacions/imprimir/${ticketActual}`,
    "_blank",
    "noreferrer"
  );
}
onMounted(() => {
  if (route.query.dfecha) {
    dfecha.value = moment(route.query.dfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.hfecha) {
    hfecha.value = moment(route.query.hfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.page) {
    page.value = parseInt(route.query.page);
  }
  getMisVentas()
});
</script>

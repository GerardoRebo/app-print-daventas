<template>
  <v-card class="mb-2">
    <v-card-title>Historial Cotizaciones</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-col cols="12" md="3">
          <v-date-input label="Desde" v-model="dfecha" max-width="368" hide-details></v-date-input>
        </v-col>
        <v-col cols="12" md="3">
          <v-date-input label="Hasta" v-model="hfecha" max-width="368" hide-details></v-date-input>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <!-- Tabla -->
  <v-container>
    <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
    <v-table density="compact" color="primary_d700">
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <TableRow v-for="venta in misventas.data" :key="venta.id" :venta="venta" @imprimir-venta="imprimirVenta"
          @cancelar-venta="cancelarVenta" @create-devolucion="createDevolucion">
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
import useMisFechas from "../../composables/useMisFechas";
import TableRow from "./TableRow.vue";
const s = useUserStore();
const { handleOpException } = s;

const cargando = ref(false);
const misventas = ref([]);
const router = useRouter();
const route = useRoute();

const tHeaders = ref([
  'Id',
  'Consecutivo',
  'Corte',
  'Nombre',
  'Fecha',
  'Cliente',
  'Almacén',
  'Total',
]);

const { dfecha, hfecha } = useMisFechas();

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
  Cotizacion.getMisVentas(page.value, dfecha.value, hfecha.value)
    .then((response) => {
      misventas.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function cancelarVenta(venta) {
  if (cargando.value) {
    return
  }
  cargando.value = true;
  Cotizacion.cancelarVenta(venta)
    .then(() => {
      getMisVentas();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false
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

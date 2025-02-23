<template>
  <v-card class="mb-2">
    <v-card-title>Historial Ventas</v-card-title>
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
  <v-container fluid>
    <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
    <v-table density="compact" color="primary_d700" fixed-header height="45vh">
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
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import TableRow from "@js/views/Ventas/TableRow.vue";
import PuntoVenta from "../../apis/PuntoVenta";
import Devoluciones from "../../apis/Devoluciones";
import { useUserStore } from "../../s";
import useMisFechas from "../../composables/useMisFechas";
import { useDisplay } from "vuetify";

const s = useUserStore();
const { dfecha, hfecha, formattedDFecha, formattedHFecha } = useMisFechas();

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
const { handleOpException } = s;
const tHeaders = ref([
  'Id',
  'Fecha',
  'Consecutivo',
  'Corte',
  'Nombre',
  'Cliente',
  'Almacén',
  'Total',
  'Devoluciones',
  'Status',
  'Acciones',
]);

const cargando = ref(false);
const misventas = ref([]);
const router = useRouter();
const route = useRoute();

watch(() => route.query, () => {
  getMisVentas();
})

function getMisVentas() {
  PuntoVenta.getMisVentas(page.value, formattedDFecha.value, formattedHFecha.value)
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
  PuntoVenta.cancelarVenta(venta)
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
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function imprimirVenta(ticketActual) {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirVentas', {
      url: `ventatickets/imprimir/${ticketActual}`,
      title: 'Imprimir Venta'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/ventatickets/imprimir/${ticketActual}`,
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

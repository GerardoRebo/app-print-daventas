<template>
  <v-card class="mb-2">
    <v-card-title>Historial Devoluciones</v-card-title>
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
    <v-table density="compact" color="primary_d700">
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <TableRow v-for="devolucion in misDevoluciones.data" :key="devolucion.id" :devolucion="devolucion"
          @imprimir-devolucion="imprimirVenta" @eliminar-devolucion="eliminarDevolucion">
        </TableRow>
      </tbody>
    </v-table>
    <v-row class=" ma-1" justify="end">
      <v-pagination v-model="page" :length="misDevoluciones.last_page" :total-visible="3"></v-pagination>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment-timezone"
import Devoluciones from "../../apis/Devoluciones";
import TableRow from "@js/views/Devoluciones/TableRow.vue";
import { useUserStore } from "../../s";
import useMisFechas from "../../composables/useMisFechas";
const { dfecha, hfecha, formattedDFecha, formattedHFecha } = useMisFechas();
const s = useUserStore();
const { handleOpException } = s;

const misDevoluciones = ref([]);
const route = useRoute();
const router = useRouter();
const tHeaders = ref([
  'Id',
  'Fecha',
  'Ticket Id',
  'Almacén Id',
  'Cliente',
  'Total',
  'Status',
  'Acciones',
]);
const page = ref(1);
watch(page, (newVal) => {
  onPagination(newVal)
})
const onPagination = (page) => {
  router
    .push({ name: route.name, query: { ...route.query, page } })
    .catch(() => {
    }).finally(() => {
      getMisDevoluciones()
    });
};
watch(() => route.query, () => {
  getMisDevoluciones();
})

function getMisDevoluciones() {
  Devoluciones.getMisDevoluciones(page.value, formattedDFecha.value, formattedHFecha.value)
    .then((response) => {
      misDevoluciones.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function eliminarDevolucion(devolucion) {
  Devoluciones.eliminarDevolucion(devolucion)
    .then(() => {
      getMisDevoluciones();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function imprimirVenta(ticketActual) {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirDevolución', {
      url: `devoluciones/imprimir/${ticketActual}`,
      title: 'Imprimir Devolución'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL
    }/devoluciones/imprimir/${ticketActual} `,
    "noreferrer",
    "_blank"
  );
}

onMounted(() => {
  if (route.query.dfecha) {
    dfecha.value = moment(route.query.dfecha, 'YYYY-MM-DD').toDate(); // Convert to JS Date
  }
  if (route.query.hfecha) {
    hfecha.value = moment(route.query.hfecha, 'YYYY-MM-DD').toDate(); // Convert to JS Date
  }

  getMisDevoluciones();
});

</script>

<style></style>
<template>
  <v-card class="mb-2">
    <v-card-title>Historial Devoluciones</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
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
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2"></v-progress-linear>
    <v-table density="compact" color="secondary">
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
import useMisFechas from "@js/composables/useMisFechas";
const s = useUserStore();
const { handleOpException } = s;

// Composable fechas
const { dfecha, hfecha, formattedDFecha, formattedHFecha, updateDFecha, updateHFecha } = useMisFechas();
const menuInicio = ref(false);
const menuFin = ref(false);
const misDevoluciones = ref([]);
const loading = ref(false);
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
  loading.value = true;
  Devoluciones.getMisDevoluciones(page.value, formattedDFecha.value, formattedHFecha.value)
    .then((response) => {
      misDevoluciones.value = response.data;
      loading.value = false;
    })
    .catch((error) => {
      loading.value = false;
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function eliminarDevolucion(devolucion) {
  loading.value = true;
  Devoluciones.eliminarDevolucion(devolucion)
    .then(() => {
      loading.value = false;
      getMisDevoluciones();
    })
    .catch((error) => {
      loading.value = false;
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
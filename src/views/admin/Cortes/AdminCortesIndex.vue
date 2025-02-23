<template>

  <v-card class="mb-2">
    <v-card-title>Cortes</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-col cols="12" sm="2">
          <v-date-input label="Desde" v-model="dfecha" hide-details></v-date-input>
        </v-col>
        <v-col cols="12" sm="2">
          <v-date-input label="Hasta" v-model="hfecha" hide-details></v-date-input>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container>
    <v-progress-linear color="accent" indeterminate v-if="false"></v-progress-linear>
    <v-table density="compact" color="primary_d700">
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <TableRow v-for="corte in miscortes.data" :key="corte.id" :corte="corte"
          @get-user-movimientos="getUserMovimientos">
        </TableRow>
      </tbody>
    </v-table>
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
import TableRow from "./TableRow.vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment-timezone"

const miscortes = ref([]);
const movimientos = ref([]);
const acumulados = ref(null);
const isVisible = ref(false);
const router = useRouter();
const route = useRoute();
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
      getMisCortes()
    });
};
const tHeaders = ref([
  'Id',
  'Usuario',
  'Fecha',
  'Venta Contado',
  'Venta Crédito',
  'Abono Crédito',
  'Compras Mercancia',
  'Acumulado Ganancias',
  'Devoluciones Ventas',
  'Devoluciones Crédito',
  'Ingresos Efectivo',
  'Salidas Efectivo',
  'Efectivo Sistema',
  'Efectivo Real',
  'Acciones',
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
function getMisCortes() {
  Cortes.getMisCortes(page.value, dfecha.value, hfecha.value)
    .then((response) => {
      miscortes.value = response.data.miscortes;
      acumulados.value = response.data.acumulados;
    })
    .catch((error) => {
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
  getMisCortes();
});
</script>
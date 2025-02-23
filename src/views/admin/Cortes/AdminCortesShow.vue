<template>
  <v-card class="mb-2">
    <v-card-title>Detalle de corte #{{ corteId }}</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-btn @click="isVisible = true">Totales</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <!-- Tabla -->
  <v-container fluid>
    <v-data-table :headers="headers" :items="corte?.ventatickets ?? []" items-per-page="-1" density="compact"
      fixed-header height="50vh">
      <template v-slot:item.consecutivo="{ item }">
        <router-link :to="{ name: 'VentasShow', params: { ventaId: item.id } }"
          class="text-decoration-none text-primary font-weight-bold">
          {{ item?.consecutivo }} <v-icon size="x-small">mdi-open-in-new</v-icon>
        </router-link>
      </template>
      <template v-slot:item.fecha="{ item }">
        {{ moment(item?.pagado_en).format('DD-MM-YYYY h:mm:ssa') }}
      </template>
      <template v-slot:item.cliente="{ item }">
        {{ item?.cliente?.name }}
      </template>
      <template v-slot:item.almacen="{ item }">
        {{ item?.almacen?.name }}
      </template>
      <template v-slot:item.devolucion="{ item }">
        {{ item.total_devuelto > 0 ? "Sí" : "No" }}
      </template>
      <template v-slot:item.status="{ item }">
        {{ item.esta_cancelado ? "Cancelada" : "Activa" }}
      </template>
    </v-data-table>
  </v-container>
  <v-dialog v-model="isVisible" max-width="1000">
    <v-card>
      <v-card-text>
        <CortesSumary :turno_actual="corte"></CortesSumary>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import moment from "moment-timezone"
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import TableRow from "@js/views/Ventas/TableRow.vue";
import Cortes from "@js/apis/Cortes";
import CortesSumary from "@js/components/CortesSumary.vue";
import { useUserStore } from "@js/s";
import { useDisplay } from "vuetify";

const s = useUserStore();

const { handleOpException } = s;

const headers = ref([
  { title: 'Fecha', key: 'fecha', align: 'start', sortable: false },
  { title: 'Consecutivo', key: 'consecutivo', align: 'start', sortable: false },
  { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
  { title: 'Cliente', key: 'cliente', align: 'start', sortable: false },
  { title: 'Almacen', key: 'almacen', align: 'start', sortable: false },
  { title: 'Total', key: 'total', align: 'start', sortable: false },
  { title: 'Efectivo', key: 'fp_efectivo', align: 'start', sortable: false },
  { title: 'Devoluciones', key: 'devolucion', align: 'start', sortable: false },
  { title: 'Status', key: 'status', align: 'start', sortable: false },
]);

const cargando = ref(false);
// const router = useRouter();
const route = useRoute();
const corteId = ref(route.params.corteId);
const corte = ref({});
const isVisible = ref(false);

watch(() => route.query, () => {
  getMisVentas();
})

function getCorte() {
  Cortes.show(corteId.value)
    .then((response) => {
      console.log(response.data);


      corte.value = response.data.corte;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
onMounted(() => {
  getCorte()
});


</script>

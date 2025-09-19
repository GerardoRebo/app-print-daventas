<template>
  <v-card class="mb-2">
    <v-card-title>Facturas</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-date-input label="Desde" v-model="dfecha" hide-details max-width="300"></v-date-input>
        <v-date-input label="Hasta" v-model="hfecha" hide-details max-width="300"></v-date-input>
      </v-row>
    </v-card-text>
  </v-card>
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
        <tr v-for="(factura, index) in facturas.data" :key="index" class="hover:bg-blue-200">
          <td>
            {{ factura.id }}
          </td>
          <td>
            <router-link :to="{ name: 'VentasShow', params: { ventaId: factura.ventaticket.id } }" class="text-primary">
              {{ factura.ventaticket?.consecutivo }}
            </router-link>
          </td>
          <td>
            <p v-if="factura.facturado_en">
              {{ moment(factura.facturado_en).format('DD-MM-YYYY h:mm a') }}
            </p>
          </td>
          <td>
            ${{ factura.subtotal }}
          </td>
          <td>
            ${{ factura.descuento }}
          </td>
          <td>
            ${{ factura.impuesto_traslado }}
          </td>
          <td>
            ${{ factura.impuesto_retenido }}
          </td>
          <td>
            ${{ factura.total }}
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-row class=" ma-1" justify="end">
      <v-pagination v-model="page" :length="facturas.last_page" :total-visible="3"></v-pagination>
    </v-row>
  </v-container>
</template>
<style scoped></style>
<script setup>
import moment from 'moment-timezone';
import { ref, reactive } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { computed, onMounted } from "vue";
import Organizacion from "../../../apis/Organizacion";
import { useMessagesStore } from "../../../s/messages";
import useMisFechas from '../../../composables/useMisFechas';
import { useRoute, useRouter } from 'vue-router';
const messages = useMessagesStore();

const cargando = ref(false);
const facturas = ref([]);
const { dfecha, hfecha } = useMisFechas();
const router = useRouter();
const route = useRoute();
const page = ref(1);
watch(page, (newVal) => {
  onPagination(newVal)
})
const onPagination = (page) => {
  router
    .push({ name: route.name, query: { ...route.query, page } })
    .catch(() => {
    }).finally(() => {
      getFacturas()
    });
};
watch([dfecha, hfecha], () => {
  getFacturas()
});

const tHeaders = ref([
  "Id",
  "Ticket Folio",
  "Fecha",
  "Descuento",
  "Impuesto Trasladado",
  "Impuesto Retenido",
  "Total",
  "Subtotal",
  "",
]);
const getFacturas = async () => {
  try {
    const { data } = await Organizacion.getFacturas({
      desde: dfecha.value,
      hasta: hfecha.value,
      page: page.value,
    })
    facturas.value = data.facturas
  } catch (error) {
    console.log(error);
  } finally {
    cargando.value = false
  }
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
  getFacturas()
})
</script>
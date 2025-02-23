<template>
  <v-card class="mb-2">
    <v-card-title>Facturas globales</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-date-input label="Desde" v-model="dfecha" hide-details max-width="300"></v-date-input>
        <v-date-input label="Hasta" v-model="hfecha" hide-details max-width="300"></v-date-input>
        <RouterLink :to="{ name: 'FacturasGlobalesCreate' }">
          <v-btn :loading="cargando" class="mx-4" prepend-icon="mdi-plus">Crear factura global</v-btn>
        </RouterLink>
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
            ${{ factura.subtotal }}
          </td>
          <td>
            ${{ factura.descuento }}
          </td>
          <td>
            ${{ factura.impuesto_traslado }}
          </td>
          <td>
            ${{ factura.total }}
          </td>
          <td>
            {{ moment(factura.created_at).format('DD-MM-YYYY h:mm a') }}
          </td>
          <td>
            <span v-if="factura.facturado_en">
              {{ moment(factura.facturado_en).format('DD-MM-YYYY h:mm a') }}
            </span>
            <span v-else>
              Pendiente...
            </span>
          </td>
          <td>
            <router-link :to="{ name: 'FacturasGlobalesShow', params: { facturaId: factura.id } }">
              <v-btn @click="true" size="x-small" icon>
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </router-link>
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
import { useToasterStore } from "../../../s/toaster";
import useMisFechas from '../../../composables/useMisFechas';
import { useRoute, useRouter } from 'vue-router';
const toasterStore = useToasterStore();

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
      getMisVentas()
    });
};
watch([dfecha, hfecha], () => {
  getFacturasGlobales()
});

const tHeaders = ref([
  "Id",
  "Subtotal",
  "Descuento",
  "Impuesto Trasladado",
  "Total",
  "Fecha creación",
  "Timbrado en",
  "Acciones",
]);
const getFacturasGlobales = async () => {
  try {
    const { data } = await Organizacion.getFacturasGlobales({
      desde: dfecha.value,
      hasta: hfecha.value,
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
  getFacturasGlobales()
})
</script>
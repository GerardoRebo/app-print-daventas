<template>
  <v-card class="mb-2">
    <v-card-title>Facturas globales</v-card-title>
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

        <!-- Botón crear -->
        <v-col cols="12" md="6" class="d-flex align-top">
          <RouterLink :to="{ name: 'FacturasGlobalesCreate' }">
            <v-btn :loading="cargando" prepend-icon="mdi-plus" color="primary" variant="elevated">Crear factura global</v-btn>
          </RouterLink>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-table density="compact" color="secondary">
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
            ${{ formatNumber(factura.subtotal) }}
          </td>
          <td>
            ${{ formatNumber(factura.descuento) }}
          </td>
          <td>
            ${{ formatNumber(factura.impuesto_traslado) }}
          </td>
          <td>
            <strong> ${{ formatNumber(factura.total) }}</strong>
          </td>
          <td>
            {{ moment(factura.created_at).format('DD-MM-YYYY h:mm a') }}
          </td>
          <td>
            <v-chip 
            v-if="factura.facturado_en"
            color="success"
            text-color="white"
            size="small"
          >
            {{ moment(factura.facturado_en).format('DD-MM-YYYY') }}
          </v-chip>
          <v-chip 
            v-else
            color="warning"
            text-color="black"
            size="small"
          >
            Pendiente
          </v-chip>
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
import useMisFechas from "@js/composables/useMisFechas";
import { useRoute, useRouter } from 'vue-router';
import { useCurrency } from '@js/composables/useCurrency';

const menuInicio = ref(false);
const menuFin = ref(false);
const cargando = ref(false);
const facturas = ref([]);
const { dfecha, hfecha, formattedDFecha, formattedHFecha, updateDFecha, updateHFecha } = useMisFechas();
const { formatNumber } = useCurrency('es-MX', 'MXN');
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
      getFacturasGlobales()
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
  getFacturasGlobales()
})
</script>
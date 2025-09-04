<template>
  <v-card class="mb-2">
    <v-card-title>Historial Precio </v-card-title>
    <v-card-subtitle>
      <router-link :to="{ name: 'ProductosIndex', query: { keyword: product.name } }"
        class="text-primary text-decoration-underline">
        {{ product.name }} {{ product.codigo }}
      </router-link>
    </v-card-subtitle>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-date-input label="Desde" v-model="dfecha" hide-details max-width="300"></v-date-input>
        <v-date-input label="Hasta" v-model="hfecha" hide-details max-width="300"></v-date-input>
      </v-row>
    </v-card-text>
    <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
  </v-card>
  <v-container fluid>
    <v-table density="compact" color="primary_d700">
      <thead>
        <tr>
          <th class="text-left" v-for="header in [
            'Id',
            'Usuario',
            'Fecha',
            'Precio Anteriror',
            'Precio Posterior',
            'Descripción',
          ]" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(historial, index) in historials.data" :key="index" class="hover:bg-blue-200">
          <td>{{ historial.id }}</td>
          <td>{{ historial.user?.name }}</td>
          <td>{{ historial.created_at }}</td>
          <td>{{ historial.precio_anterior }}</td>
          <td>{{ historial.precio_despues }}</td>
          <td>{{ historial.descripcion }}</td>
        </tr>
      </tbody>
    </v-table>
    <v-row class=" ma-1" justify="end">
      <v-pagination v-model="page" :length="historials.last_page" :total-visible="3"></v-pagination>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";

import { useRoute, useRouter } from "vue-router";
import Product from "../apis/Product";
import { useUserStore } from "../s";
import moment from 'moment-timezone';
import useMisFechas from "../composables/useMisFechas";
const { dfecha, hfecha } = useMisFechas();
const s = useUserStore();
const { handleOpException } = s;

const historials = ref([]);
const almacenActualId = ref(null);
const productActualId = ref(null);
const product = reactive({
  name: '',
  codigo: '',
});
const router = useRouter();
const route = useRoute();
const page = ref(1);
const cargando = ref(false);
watch(page, (newVal) => {
  onPagination(newVal)
})
const onPagination = (page) => {
  router
    .push({ name: route.name, query: { ...route.query, page } })
    .catch(() => {
    }).finally(() => {
      getHistorials()
    });
};
watch(dfecha, () => {
  getHistorials();
});
watch(hfecha, () => {
  getHistorials();
});
function getHistorials() {
  Product.getHistorialPrecio(
    page.value,
    dfecha.value,
    hfecha.value,
    almacenActualId.value,
    productActualId.value
  )
    .then((response) => {
      historials.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
onMounted(() => {
  almacenActualId.value = route.params.almacenId;
  productActualId.value = route.params.productId;

  Product.show(productActualId.value)
    .then((response) => {
      product.name = response.data.name;
      product.codigo = response.data.codigo;
      product.descripcion = response.data.descripcion;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
  if (route.query.dfecha) {
    dfecha.value = moment(route.query.dfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.hfecha) {
    hfecha.value = moment(route.query.hfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.page) {
    page.value = parseInt(route.query.page);
  }
  getHistorials();
});
</script>

<style></style>
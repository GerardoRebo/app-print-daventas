<template>
  <v-card>
    <v-card-text>
      <p class="font-weight-bold">Producto: {{ productActual.name }}</p>
      <p class="font-weight-bold">Codigo: {{ productActual.codigo }}</p>
      <v-divider></v-divider>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-data-table :headers="tHeaders" :items="misProducts" items-per-page="5">
      <template v-slot:item.actions="{ item }">
        <v-btn icon="mdi-pencil" size="small" color="primary_l200" @click="abrirModal(item.almacen_id)"></v-btn>
      </template>
    </v-data-table>
  </v-container>
  <v-dialog v-model="isVisible" max-width="600">
    <v-card>
      <v-card-title>Edita Min Max</v-card-title>
      <v-card-text>
        <v-text-field label="Minimo" autocomplete="password" v-model="product_form.min" />
        <v-text-field label="Maximo" autocomplete="password" v-model="product_form.max" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" variant="text" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="ajustarMinMax" color="accent" variant="outlined" :loading="cargando">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "@vue/runtime-core";

import Product from "@js/apis/Product";
import { useRoute } from "vue-router";
import { useProductActual } from "@js/composables/ProductActual";
import { useSnackBar } from "@js/composables/SnackBar";
const { snackbar, snackSuccess, snackError, snackWarning } = useSnackBar();

const props = defineProps(['productActualId'])
const almacenActualId = ref(null);
const misProducts = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const codigo = ref("");
const cargando = ref(false);
const product_form = reactive({
  min: null,
  max: null,
});
const route = useRoute();
const tHeaders = ref([
  { title: 'Almacen', key: 'nam', align: 'start', sortable: false },
  { title: 'Min', key: 'invmin', align: 'start', sortable: false },
  { title: 'Max', key: 'invmax', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const productActual = ref({
  name: '',
  codigo: '',
});
const productId = ref(route.params.productId);
useProductActual(productId.value, productActual, cargando, snackError);
watch(() => productId.value, () => {
  getAll();
}, { immediate: true });

function getAll() {
  Product.showextended(productId.value)
    .then((response) => {
      if (response.data) {
        misProducts.value = Object.values(response.data);
      }
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function ajustarMinMax() {
  Product.ajustarMinMax(
    productId.value,
    almacenActualId.value,
    product_form
  )
    .then(() => {
      isVisible.value = false;
      getAll();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function abrirModal(id) {
  almacenActualId.value = id;
  isVisible.value = true;
}
</script>

<style></style>
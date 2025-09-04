<template>
  <!-- header desktop -->
  <v-card class="mb-2">
    <v-card-text>
      <p class="font-weight-bold">Producto: {{ productActual.name }}</p>
      <p class="font-weight-bold">Codigo: {{ productActual.codigo }}</p>
      <v-divider></v-divider>
      <v-row dense class="mt-4">
        <v-text-field label="Código" autocomplete="password" v-model="codigo" @keydown.enter.stop="agregarCodigo"
          hide-details class="mx-2" max-width="300" ref="codigoRef" />
        <v-btn prepend-icon="mdi-check-circle" variant="outlined" color="primary" class="mx-2"
          @click="agregarCodigo">Agregar
        </v-btn>
      </v-row>
    </v-card-text>
    <v-progress-linear color="neutral300" model-value="100"></v-progress-linear>
  </v-card>
  <v-container fluid>
    <v-card>
      <v-card-text>
        <v-data-table :headers="tHeaders" :items="misCodigos" items-per-page="5">
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-trash-can" size="small" color="error" @click="eliminarCodigoEq(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref, watch } from "@vue/runtime-core";
import Codigo from "@js/apis/Codigo";
import { useRoute } from "vue-router";

const route = useRoute();

const props = defineProps(['productActualId'])
const misCodigos = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const codigo = ref("");
const productId = ref(route.params.productId);
const tHeaders = ref([
  { title: 'Código', key: 'code', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const productActual = ref({
  name: '',
  codigo: '',
});
watch(() => productId.value, () => {
  getAll();
}, { immediate: true });

function getAll() {
  Codigo.getAll(productId.value)
    .then((response) => {
      misCodigos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}

function agregarCodigo() {
  if (codigo.value === "") return alert('Campo Vacio');
  Codigo.agregar(codigo.value, productId.value)
    .then(() => {
      codigo.value = ""
      getAll();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function eliminarCodigoEq(codigo) {
  Codigo.eliminarCodigoEq(codigo)
    .then(() => {
      getAll();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
</script>

<style></style>
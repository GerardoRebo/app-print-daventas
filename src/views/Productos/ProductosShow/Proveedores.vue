<template>
  <v-card>
    <v-card-text>
      <p class="font-weight-bold">Producto: {{ productActual.name }}</p>
      <p class="font-weight-bold">Codigo: {{ productActual.codigo }}</p>
      <v-divider></v-divider>
      <v-row dense class="mt-4">
        <v-btn @click="abrirModal" prepend-icon="mdi-binoculars" variant="outlined" color="primary" class="mx-2">Buscar
          proveedor
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>

    <v-data-table :headers="tHeaders" :items="misProveedors" items-per-page="5">
      <template v-slot:item.actions="{ item }">
        <v-btn icon="mdi-trash-can" size="small" color="error" @click="quitarP(item.id)"></v-btn>
      </template>
    </v-data-table>
  </v-container>

  <v-dialog v-model="isVisible">
    <v-card>
      <v-card-title>Busca proveedor por nombre</v-card-title>
      <v-card-text>
        <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="headers" :items="proveedors" items-per-page="5">
          <template v-slot:item.actions="{ item }">
            <v-btn icon size="small" color="primary" @keydown.enter="agregarProveedor(item.id)"
              @click="agregarProveedor(item.id)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "@vue/runtime-core";
import Proveedor from "@js/apis/Proveedor";
import { useProductActual } from "../../../composables/ProductActual";
import { useRoute } from "vue-router";
import { useSnackBar } from "../../../composables/SnackBar";
const { snackbar, snackSuccess, snackError, snackWarning } = useSnackBar();

const proveedors = ref([]);
const misProveedors = ref([]);
const miProveedor = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const cargando = ref(false);
const productActual = ref({
  name: '',
  codigo: '',
});
const tHeaders = ref([
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const headers = ref([
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const productId = ref(null);
const route = useRoute();

productId.value = route.params.productId;

useProductActual(productId.value, productActual, cargando, snackError);

watch(() => route.params.productId, () => {
  showpp();
}, { immediate: true });

function showpp() {
  Proveedor.showPP(productId.value)
    .then((response) => {
      misProveedors.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function abrirModal() {
  isVisible.value = true;
  getAllProveedors();
}
function getAllProveedors() {
  Proveedor.getAll()
    .then((response) => {
      proveedors.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function agregarProveedor(proveedorActualId) {
  Proveedor.agregarP(proveedorActualId, productId.value)
    .then(() => {
      isVisible.value = false;
      showpp();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function quitarP(proveedorActualId) {
  Proveedor.quitarP(proveedorActualId, productId.value)
    .then(() => {
      showpp();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
</script>

<style></style>
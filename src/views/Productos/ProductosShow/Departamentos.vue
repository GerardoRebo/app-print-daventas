<template>
  <v-card>
    <v-card-text>
      <p class="font-weight-bold">Producto: {{ productActual.name }}</p>
      <p class="font-weight-bold">Codigo: {{ productActual.codigo }}</p>
      <v-divider></v-divider>
      <v-row dense class="mt-4">
        <v-btn @click="abrirModal" prepend-icon="mdi-binoculars" variant="outlined" color="primary" class="mx-2">Buscar
          departamentos
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>

    <v-data-table :headers="headers" :items="misDepartamentos" items-per-page="5">
      <template v-slot:item.actions="{ item }">
        <v-btn icon="mdi-trash-can" size="small" color="error" @click="quitarDepartamento(item.id)"></v-btn>
      </template>
    </v-data-table>

  </v-container>
  <v-dialog v-model="isVisible">
    <v-card>
      <v-card-title>Busca departamento por nombre</v-card-title>
      <v-card-text>
        <v-progress-linear color="accent" v-if="cargando"></v-progress-linear>
        <v-data-table :headers="headers" :items="departamentos" items-per-page="5">
          <template v-slot:item.actions="{ item }">
            <v-btn icon size="small" color="primary" @keydown.enter="agregarDepartamento(item.id)"
              @click="agregarDepartamento(item.id)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Departamento from "@js/apis/Departamento";
import { useSnackBar } from "@js/composables/SnackBar";
import { useNotification } from "@js/composables/useNotification";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useRoute } from "vue-router";
import { useProductActual } from "@js/composables/ProductActual";
const { snackbar, snackSuccess, snackError, snackWarning } = useSnackBar();
const { notify } = useNotification();
const { processRequest, concurrentRequest } = useProcessRequest();
const route = useRoute();

const departamentos = ref([]);
const misDepartamentos = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const cargando = ref(false);
const productId = ref(route.params.productId);
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
useProductActual(productId.value, productActual, cargando, snackError);

watch(() => productId.value, () => {
  showpd();
}, { immediate: true });

function showpd() {
  concurrentRequest(async () => {
    const response = await Departamento.showPD(productId.value);
    misDepartamentos.value = response.data;
  }, cargando, {
    onError: () => notify.error("Ha ocurrido un error")
  });
}
function abrirModal() {
  isVisible.value = true;
  getAllDepartamentos();
}
function getAllDepartamentos() {
  concurrentRequest(async () => {
    const response = await Departamento.getAll();
    departamentos.value = response.data;
  }, cargando, {
    onError: () => notify.error("Ha ocurrido un error")
  });
}
function agregarDepartamento(departamentoActualId) {
  processRequest(async () => {
    await Departamento.agregarD(departamentoActualId, productId.value);
    cargando.value = false;
    isVisible.value = false;
    showpd();
  }, cargando, {
    onError: () => notify.error("Ha ocurrido un error")
  });
}
function quitarDepartamento(departamentoActualId) {
  processRequest(async () => {
    await Departamento.quitarD(departamentoActualId, productId.value);
    cargando.value = false;
    isVisible.value = false;
    showpd();
  }, cargando, {
    onError: () => notify.error("Ha ocurrido un error")
  });
}
onMounted(() => {
});

</script>

<style></style>
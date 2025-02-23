<template>
  <!-- header desktop -->
  <v-card v-if="mdAndUp">
    <v-card-text>
      <p class="font-weight-bold">Producto: {{ productActual.name }}</p>
      <p class="font-weight-bold">Codigo: {{ productActual.codigo }}</p>
      <v-divider></v-divider>
      <v-row dense class="mt-4">
        <v-text-field label="Código" autocomplete="password" v-model="codigo" @keydown.enter.stop="searchProduct"
          hide-details class="mx-2" max-width="300" ref="codigoRef" />
        <v-text-field label="Nombre" id="name" autocomplete="off" v-model="product_form.name" hide-details class="mx-2"
          max-width="300" />
        <v-text-field label="Cantidad" id="cantidad" autocomplete="off" placeholder="Cantidad"
          @keydown.enter.stop="agregarComponente" v-model="product_form.cantidad" hide-details class="mx-2"
          max-width="300" />
        <v-btn @click="abrirModalBuscaProductsNombre" prepend-icon="mdi-magnify" variant="outlined" color="primary"
          class="mx-2">Buscar
        </v-btn>
        <v-btn prepend-icon="mdi-arrow-right-bold" variant="outlined" color="primary" class="mx-2"
          @click="agregarComponente">Agregar
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <!-- Mobile -->
  <v-card v-if="smAndDown">
    <v-card-text>
      <v-row class="my-2">
        <p class="font-weight-bold mx-4">Producto: {{ productActual.name }}</p>
        <p class="font-weight-bold">Codigo: {{ productActual.codigo }} </p>
      </v-row>
      <v-divider></v-divider>
      <v-row class="ma-2">
        <v-text-field label="Código" autocomplete="password" v-model="codigo" @keydown.enter.stop="searchProduct"
          hide-details ref="codigoRef" />
        <v-btn variant="outlined" color="primary" class="mx-2" icon size="x-small" @click="searchProduct">
          <v-icon>
            mdi-magnify
          </v-icon>
        </v-btn>
        <v-btn @click="abrirModalBuscaProductsNombre" variant="outlined" color="primary" class="mx-2" icon
          size="x-small">
          <v-icon>
            mdi-binoculars
          </v-icon>
        </v-btn>
      </v-row>
      <v-text-field label="Nombre" id="name" autocomplete="off" v-model="product_form.name" hide-details
        class="mx-2 mb-2" v-if="product_form.name" />
      <v-text-field label="Cantidad" id="cantidad" autocomplete="off" placeholder="Cantidad"
        v-model="product_form.cantidad" hide-details class="mx-2 mb-2" v-if="product_form.name" />
      <v-btn block color="accent" variant="outlined" prepend-icon="mdi-pencil-plus"
        v-if="codigo && product_form.cantidad" @keydown.enter.stop="agregarComponente">
        Agregar
      </v-btn>
    </v-card-text>
  </v-card>

  <v-container fluid>
    <v-data-table :headers="tHeaders" :items="components" items-per-page="5">
      <template v-slot:item.codigo="{ item }">
        {{ item.product_hijo.codigo }}
      </template>
      <template v-slot:item.name="{ item }">
        {{ item.product_hijo.name }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon="mdi-trash-can" size="small" color="error" @click="eliminarComponente(item.id)"></v-btn>
      </template>
    </v-data-table>
  </v-container>

  <!-- Busca Producto Nombre-->
  <v-dialog v-model="isVisible">
    <v-card>
      <v-card-title>Busca producto por nombre</v-card-title>
      <v-card-text>
        <v-text-field v-model="keyword" label="Buscar Producto" prepend-inner-icon="mdi-magnify" variant="outlined"
          hide-details single-line ref="keywordRef"></v-text-field>
        <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="headers" :items="products" items-per-page="5">
          <template v-slot:item.actions="{ item }">
            <v-btn prepend-icon="mdi-check" size="small" @keydown.enter="showProduct(item.id)"
              @click="showProduct(item.id)" color="primary">
              Agregar
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
  <DynamicSnack :snackbar="snackbar" />

</template>

<script setup>
import { watch } from "vue";
import {
  onMounted,
  onUnmounted,
  reactive,
  ref,
  nextTick,
  computed,
} from "@vue/runtime-core";

import Product from "@js/apis/Product";
import { useUserStore } from "@js/s";
import { useRoute } from "vue-router";
import DynamicSnack from "@js/components/DynamicSnack.vue";
import { useSnackBar } from "@js/composables/SnackBar";
import { useProcessRequest } from "@js/composables/ProcessRequest";
import { useDisplay } from "vuetify";

const route = useRoute();
const store = useUserStore();
const { xs, smAndDown, mdAndUp, mdAndDown } = useDisplay()
const { processRequest } = useProcessRequest();
const { snackbar, snackSuccess, snackError, snackWarning } = useSnackBar();
const { handleOpException } = store;

const productActual = ref({});
const productEncontradoId = ref(null);
const errors = ref([]);
const isVisible = ref(false);
const cargando = ref(false);
const codigo = ref("");
const codigoRef = ref(null);
const keyword = ref("");
const keywordRef = ref(null);
const components = ref([]);
const products = ref([]);
const product_form = reactive({
  name: "",
  cantidad: null,
});
const tHeaders = ref([
  { title: 'Código', key: 'codigo', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Cantidad', key: 'cantidad', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const headers = ref([
  { title: 'Código', key: 'codigo', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Costo', key: 'pcosto', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const posibleEnviar = computed(() => {

  return (productActual.value.id !== null &&
    productEncontradoId.value !== null &&
    product_form.cantidad !== null)
});
watch(keyword, () => {
  searchKeywordSimple();
});
watch(() => productActual.value.id, () => {
  getAll();
}, { immediate: true });
function onEscape(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    emptyValues();
    nextTick(() => { codigoRef.value.select() })
    isVisible.value = false;
  }
  if (e.key === "F9") {
    abrirModalBuscaProductsNombre()
  }
}
function abrirModalBuscaProductsNombre() {
  isVisible.value = true;
  nextTick(() => { keywordRef.value.select() })
  searchKeywordSimple();
}
function emptyValues() {
  codigo.value = "";
  productEncontradoId.value = null;
  product_form.name = "";
  product_form.codigo = "";
  product_form.cantidad = "";
}
function thisProduct() {
  processRequest(async () => {
    const { data } = await Product.show(route.params.productId)
    productActual.value.id = data.id;
    productActual.value.name = data.name;
    productActual.value.codigo = data.codigo;
  }, cargando, snackbar)
}
function searchProduct() {
  if (codigo.value == "") {
    snackWarning("Campo código vacio")
    return;
  }
  Product.searchCodeSimple(codigo.value)
    .then((response) => {
      if (response.data == "Producto No Encontrado") {
        emptyValues()
        nextTick(() => { codigoRef.value.select() })
        alert("Producto No Encontrado");
        return
      }
      productEncontradoId.value = response.data.id;
      codigo.value = response.data.codigo;
      product_form.name = response.data.name;
      product_form.cantidad = 1;

      nextTick(() => document.getElementById("cantidad").select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function searchKeywordSimple() {
  Product.searchKeywordSimple(keyword.value)
    .then((response) => {
      products.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function getAll() {
  Product.getComponents(productActual.value.id)
    .then((response) => {
      components.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function eliminarComponente(componente) {
  Product.eliminarComponente(componente)
    .then((response) => {
      getAll();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function agregarComponente() {
  if (!posibleEnviar.value) {
    alert('Falta un dato importante')
    return
  }
  processRequest(async () => {
    const { data } = await Product.agregarComponente(
      productActual.value.id,
      productEncontradoId.value,
      product_form.cantidad
    )
    getAll();
    emptyValues()
    nextTick(() => { codigoRef.value.select() })
  }, cargando, snackError)
}
function showProduct(productId) {
  Product.show(productId)
    .then((response) => {
      productEncontradoId.value = response.data.id;
      product_form.name = response.data.name;
      codigo.value = response.data.codigo;
      product_form.cantidad = 1;
      isVisible.value = false;
      nextTick(() => document.getElementById("cantidad").select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}

onMounted(() => {
  document.addEventListener("keydown", onEscape);
  nextTick(() => { codigoRef.value.select() })
  thisProduct()
});
onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});

</script>

<style></style>
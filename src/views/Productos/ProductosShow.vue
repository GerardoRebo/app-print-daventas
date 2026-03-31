<template>
  <v-toolbar color="neutral200">
    <v-toolbar-title class="text-primary_d500">Edicion Avanzada
      <router-link :to="{ name: 'ProductosIndex', query: { keyword: product.name } }"
        class="text-primary text-decoration-underline text-subtitle-2">
        Regresar al catálogo
      </router-link>
    </v-toolbar-title>
    <template v-slot:extension>
      <v-tabs fixed-tabs color="primary">
        <v-tab v-for="item in items" :key="item.title" :text="item.title" :to="{ name: item.to }"></v-tab>
      </v-tabs>
    </template>
  </v-toolbar>
  <router-view></router-view>
</template>

<script setup>
import { onMounted, ref, computed, reactive } from "vue";
import { useRoute } from "vue-router";
import Product from "../../apis/Product";
const route = useRoute();
const productActualId = ref(null);
const product = reactive({
  name: "",
  es_kit: false,
  consumible: "",
});

const allItems = [
  { title: "Edición Básica", to: "ProductosShowBasica" },
  { title: "Componentes kit", to: "ProductosShowComponentes", kitOnly: true },
  { title: "Proveedores", to: "ProductosShowProveedores" },
  { title: "Departamentos", to: "ProductosShowDepartamentos" },
  { title: "Min Max", to: "ProductosShowMinMax" },
  { title: "Codigos Producto", to: "ProductosShowCodigosEquivalentes" },
  { title: "Impuestos", to: "ProductosShowImpuestos" },
  { title: "Descuentos", to: "ProductosShowDescuentos" },
  { title: "Imagenes", to: "ProductosShowImagenes" },
  { title: "Consumibles", to: "ProductosShowConsumibles", consumibleOnly: true },
];

const items = computed(() =>
  allItems.filter((i) => (!i.kitOnly || product.es_kit) && (!i.consumibleOnly || product.consumible === "generico"))
);
onMounted(() => {
  productActualId.value = route.params.productId;
  Product.show(productActualId.value)
    .then((response) => {
      console.log(response.data);
      product.name = response.data.name;
      product.es_kit = response.data.es_kit;
      product.consumible = response.data.consumible;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
});
</script>

<style></style>

<template>
  <v-container>
    <v-card max-width="1200">
      <v-card-title>Edita Producto</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="7">
            <v-text-field label="Código" autocomplete="password"
              :error-messages="errors.codigo ? errors.codigo[0] : null" v-model="product_form.codigo" />
            <v-text-field label="Nombre" id="name" autocomplete="off"
              :error-messages="errors.name ? errors.name[0] : null" v-model="product_form.name" />
            <v-textarea label="Descripción" id="descripcion" autocomplete="off" :error-messages="errors.descripcion ? errors.descripcion[0] : null
              " v-model="product_form.descripcion" variant="outlined" />
            <v-text-field label="Porcentaje Deseado" id="porcentaje_ganancia" autocomplete="off" :error-messages="errors.porcentaje_ganancia
              ? errors.porcentaje_ganancia[0]
              : null
              " v-model="product_form.porcentaje_ganancia" />
            <v-text-field label="Precio Costo" id="pcosto" autocomplete="off"
              :error-messages="errors.pcosto ? errors.pcosto[0] : null" v-model="product_form.pcosto" />
            <v-select label="El producto es consumible:" v-model="product_form.consumible" :items="consumibleItems">
            </v-select>

          </v-col>
          <v-col cols="12" sm="5" class="px-8">
            <v-switch v-model="product_form.es_kit" label="El producto es kit?" density="compact" color="primary"
              :model-value="Boolean(product_form.es_kit)"
              @update:model-value="(value) => product_form.es_kit = value ? 1 : 0">
            </v-switch>
            <v-switch v-model="product_form.necesita_produccion" density="compact"
              label="El producto necesita producción" color="primary" v-if="!product_form.consumible"
              :model-value="Boolean(product_form.necesita_produccion)"
              @update:model-value="(value) => product_form.necesita_produccion = value ? 1 : 0">
            </v-switch>
            <v-switch v-model="product_form.usa_medidas" density="compact" label="Usa medidas" color="primary"
              v-if="!product_form.consumible" :model-value="Boolean(product_form.usa_medidas)"
              @update:model-value="(value) => product_form.usa_medidas = value ? 1 : 0">
            </v-switch>
            <v-switch v-model="product_form.prioridad" density="compact" label="El producto es prioritario"
              color="primary" :model-value="Boolean(product_form.prioridad)"
              @update:model-value="(value) => product_form.prioridad = value ? 1 : 0">
            </v-switch>
            <v-radio-group v-model="product_form.es_presentacion_de_compra">
              <template v-slot:label>
                <div>El producto es presentación de compra:</div>
              </template>
              <v-radio label="No" :value="0"></v-radio>
              <v-radio label="Sí" :value="1"></v-radio>
            </v-radio-group>
            <v-radio-group v-model="product_form.tventa">
              <template v-slot:label>
                <div>Tipo de venta:</div>
              </template>
              <v-radio label="Unidad" value="U"></v-radio>
              <v-radio label="Granel" value="G"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="editarProduct" :loading="cargando" color="primary" variant="outlined">Actualizar</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref, reactive, watch } from "@vue/runtime-core";
import Product from "@js/apis/Product";
import { useRoute } from "vue-router";
const route = useRoute();
const cargando = ref(false);
const product_form = ref({})
const consumibleItems = [
  { title: 'No es consumible', value: null },
  { title: 'Regular', value: 'regular' },
  { title: 'Genérico', value: 'generico' },
];
const errors = ref([]);

watch(
  () => route.params.productId,
  () => {
    showProduct();
  },
  { immediate: true }
);

function showProduct() {
  Product.show(route.params.productId)
    .then((response) => {
      product_form.value = response.data
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}

function editarProduct() {
  errors.value = [];
  if (product_form.value.es_kit) {
    product_form.value.es_consumible = 0;
  }
  if (!product_form.value.es_consumible) {
    product_form.value.tipo_consumible = null;
  }
  Product.update(route.params.productId, product_form.value)
    .then(() => {
      showProduct();
      alert("Acualización Realizada");
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
      }
      handleOpException(error);
    });
}

onMounted(() => {
});
</script>

<style></style>

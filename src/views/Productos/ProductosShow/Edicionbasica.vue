<template>
  <v-container>
    <v-card max-width="1200">
      <v-card-title>Edita Producto</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="7">
            <v-text-field
              label="Código"
              autocomplete="password"
              :error-messages="errors.codigo ? errors.codigo[0] : null"
              v-model="product_form.codigo"
            />
            <v-text-field
              label="Nombre"
              id="name"
              autocomplete="off"
              :error-messages="errors.name ? errors.name[0] : null"
              v-model="product_form.name"
            />
            <v-textarea
              label="Descripción"
              id="descripcion"
              autocomplete="off"
              :error-messages="
                errors.descripcion ? errors.descripcion[0] : null
              "
              v-model="product_form.descripcion"
              variant="outlined"
            />
            <v-text-field
              label="Porcentaje Deseado"
              id="porcentaje_ganancia"
              autocomplete="off"
              :error-messages="
                errors.porcentaje_ganancia
                  ? errors.porcentaje_ganancia[0]
                  : null
              "
              v-model="product_form.porcentaje_ganancia"
            />
            <v-text-field
              label="Precio Costo"
              id="pcosto"
              autocomplete="off"
              :error-messages="errors.pcosto ? errors.pcosto[0] : null"
              v-model="product_form.pcosto"
            />
            <v-col cols="12" sm="6" v-if="!product_form.es_kit">
              <v-switch
                v-model="product_form.es_consumible_generico"
                density="compact"
                color="primary"
                label="El producto es consumible generico:"
              >
              </v-switch>
            </v-col>
            <v-col cols="12" sm="6" v-if="!product_form.es_consumible_generico">
              <v-switch
                v-model="product_form.necesita_produccion"
                density="compact"
                label="El producto necesita producción:"
                color="primary"
              >
              </v-switch>
            </v-col>
            <v-col cols="12" sm="6" v-if="!product_form.es_consumible_generico">
              <v-switch
                v-model="product_form.usa_medidas"
                density="compact"
                label="Usa medidas"
                color="primary"
              >
              </v-switch>
            </v-col>
            <v-col cols="12" sm="6">
              <v-switch
                v-model="product_form.prioridad"
                density="compact"
                label="El producto es prioritario:"
                color="primary"
              >
              </v-switch>
            </v-col>
          </v-col>
          <v-col cols="12" sm="5">
            <v-radio-group v-model="product_form.es_kit">
              <template v-slot:label>
                <div>El producto es kit?:</div>
              </template>
              <v-radio label="No" :value="false"></v-radio>
              <v-radio label="Sí" :value="true"></v-radio>
            </v-radio-group>
            <v-radio-group v-model="product_form.tventa">
              <template v-slot:label>
                <div>Tipo de venta:</div>
              </template>
              <v-radio label="Unidad" value="U"></v-radio>
              <v-radio label="Granel" value="G"></v-radio>
            </v-radio-group>
            <v-radio-group v-model="product_form.prioridad">
              <template v-slot:label>
                <div>El producto es prioritario:</div>
              </template>
              <v-radio label="No" :value="false"></v-radio>
              <v-radio label="Sí" :value="true"></v-radio>
            </v-radio-group>
            <v-radio-group v-model="product_form.es_presentacion_de_compra">
              <template v-slot:label>
                <div>El producto es presentación de compra:</div>
              </template>
              <v-radio label="No" :value="0"></v-radio>
              <v-radio label="Sí" :value="1"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          @click="editarProduct"
          :loading="cargando"
          color="accent"
          variant="outlined"
          >Actualizar</v-btn
        >
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
const product_form = reactive({
  name: "",
  codigo: "",
  descripcion: "",
  porcentaje_ganancia: "",
  es_presentacion_de_compra: "1",
  tventa: "U",
  pcosto: "",
  prioridad: false,
  es_kit: 0,
  es_consumible_generico: 0,
  usa_medidas: false,
  necesita_produccion: false,
});
const errors = ref([]);

watch(
  () => route.params.productId,
  () => {
    showProduct();
  },
  { immediate: true }
);
watch(
  () => product_form.es_kit,
  (newVal) => {
    if (newVal) {
      product_form.es_consumible = 0;
    } else {
    }
  }
);
watch(
  () => product_form.es_consumible,
  (newVal) => {
    if (newVal) {
      product_form.tipo_consumible = "regular";
    } else {
      product_form.tipo_consumible = null;
    }
  }
);

function showProduct() {
  Product.show(route.params.productId)
    .then((response) => {
      product_form.name = response.data.name;
      product_form.codigo = response.data.codigo;
      product_form.descripcion = response.data.descripcion;
      product_form.porcentaje_ganancia = response.data.porcentaje_ganancia;
      product_form.es_presentacion_de_compra =
        response.data.es_presentacion_de_compra;
      product_form.pcosto = response.data.pcosto;
      product_form.es_kit = !!response.data.es_kit;
      product_form.es_consumible_generico =
        !!response.data.es_consumible_generico;
      product_form.necesita_produccion = !!response.data.necesita_produccion;
      product_form.usa_medidas = !!response.data.usa_medidas;
      product_form.tventa = response.data.tventa;
      product_form.prioridad = !!response.data.prioridad;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}

function editarProduct() {
  errors.value = [];
  if (product_form.es_kit) {
    product_form.es_consumible = 0;
  }
  if (!product_form.es_consumible) {
    product_form.tipo_consumible = null;
  }
  Product.update(route.params.productId, product_form)
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
  // productActualId.value = inject("productActualId");
});
</script>

<style></style>

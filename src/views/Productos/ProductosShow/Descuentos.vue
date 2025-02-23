<template>
  <v-card>
    <v-card-text>
      <p class="font-weight-bold">Producto: {{ productActual.name }}</p>
      <p class="font-weight-bold">Codigo: {{ productActual.codigo }}</p>
      <v-divider></v-divider>
      <v-row dense class="mt-4">
        <v-col cols="12" md="2">
          <v-text-field
            label="Desde"
            id="desde"
            autocomplete="off"
            placeholder="Cantidad"
            v-model="desde"
            hide-details
            class="mx-2"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            label="Hasta"
            id="hasta"
            autocomplete="off"
            placeholder="Cantidad"
            v-model="hasta"
            hide-details
            class="mx-2"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-radio-group inline v-model="porcentaje_type">
            <v-radio label="Porcentaje" :value="true"></v-radio>
            <v-radio label="Cantidad" :value="false"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            :label="porcentajeTypeString"
            id="hasta"
            autocomplete="off"
            :placeholder="porcentajeTypeString"
            v-model="porcentaje"
            hide-details
            class="mx-2"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-btn
            prepend-icon="mdi-arrow-right-bold"
            variant="outlined"
            color="primary"
            class="mx-2"
            @click="enviarDescuento()"
            >Agregar
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-data-table :headers="tHeaders" :items="misDescuentos">
    <template v-slot:item.tipo="{ item }">
      {{ item.porcentaje_type ? "Porcentaje" : "Cantidad" }}
    </template>
    <template v-slot:item.actions="{ item }">
      <v-btn
        icon="mdi-trash-can"
        size="small"
        color="error"
        @click="eliminarDescuento(item.id)"
      ></v-btn>
    </template>
  </v-data-table>
</template>

<script setup>
import Product from "@js/apis/Product";
import { computed, ref } from "vue";
import { nextTick, onMounted } from "vue";
import { useSnackBar } from "../../../composables/SnackBar";
import { useRoute } from "vue-router";
const { snackbar, snackSuccess, snackError, snackWarning } = useSnackBar();
const route = useRoute();
import { useProductActual } from "@js/composables/ProductActual";

const misDescuentos = ref([]);
const productActual = ref({});
const hasta = ref(null);
const desde = ref(null);
const cargando = ref(false);
const porcentaje_type = ref(true);
const porcentajeTypeString = computed(() => {
  return porcentaje_type.value ? "Porcentaje" : "Cantidad";
});

const porcentaje = ref(null);
const productId = ref(route.params.productId);
useProductActual(productId.value, productActual, cargando, snackError);

const tHeaders = ref([
  { title: "Desde", key: "desde", align: "start", sortable: false },
  { title: "Hasta", key: "hasta", align: "start", sortable: false },
  { title: "Descuento", key: "descuento", align: "start", sortable: false },
  { title: "Tipo", key: "tipo", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
]);
function getDescuentos() {
  Product.getDescuentos(productId.value)
    .then((response) => {
      // document.getElementById('desde').focus();
      misDescuentos.value = response.data;
    })
    .catch((error) => {
      console.log(error);

      // handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function enviarDescuento() {
  Product.enviarDescuento(
    desde.value,
    hasta.value,
    porcentaje.value,
    productId.value,
    porcentaje_type.value
  )
    .then(() => {
      porcentaje.value = null;
      desde.value = null;
      hasta.value = null;
      porcentaje_type.value = true;
      getDescuentos();
    })
    .catch((error) => {
      console.log(error);
      // handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function eliminarDescuento(id) {
  Product.eliminarDescuento(id)
    .then(() => {
      getDescuentos();
    })
    .catch((error) => {
      console.log(error);
      // handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
onMounted(() => {
  getDescuentos();
});
</script>

<style></style>

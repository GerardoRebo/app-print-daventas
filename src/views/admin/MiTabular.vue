<template>
  <v-card class="mb-2">
    <v-card-title>Tabular general</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-text-field label="Hasta" v-model="hasta" max-width="200" placeholder="$" hide-details class="mx-4" />
        <v-text-field label="Porcentaje" v-model="porcentaje" max-width="200" placeholder="%" hide-details />
        <v-btn @click="enviarTabular" :loading="cargando" class="mx-4">Agregar</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container>
    <v-table density="compact" color="primary_d700">
      <thead>
        <tr>
          <th class="text-left" v-for="header in headers" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tr v-for="(tabular, index) in misTabulares" :key="index">
        <td>{{ index }}</td>
        <td>{{ tabular }}%</td>
        <td>
          <v-btn @click="eliminarTabular(index)" :loading="cargando" size="small">Eliminar</v-btn>
        </td>
      </tr>
    </v-table>
  </v-container>
</template>

<script setup>
import Organizacion from "../../apis/Organizacion";
import { ref } from "@vue/reactivity";
import { nextTick, onMounted } from "@vue/runtime-core";

const misTabulares = ref([]);
const hasta = ref(null);
const hast = ref(null);
const cargando = ref(false);
const porcentaje = ref(null);
const headers = ref(['Hasta', 'Porcentaje', 'Acciones']);
function getTabulares() {
  Organizacion.getTabulares()
    .then((response) => {
      misTabulares.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function enviarTabular() {
  Organizacion.enviarTabular(hasta.value, porcentaje.value)
    .then(() => {
      porcentaje.value = null;
      hasta.value = null;
      getTabulares();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function eliminarTabular(index) {
  Organizacion.eliminarTabular(index)
    .then(() => {
      getTabulares();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
onMounted(() => {
  // nextTick(() => document.getElementById("hasta").select());
  getTabulares();
});
</script>

<style></style>
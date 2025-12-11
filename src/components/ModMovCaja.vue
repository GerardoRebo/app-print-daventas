<script setup>
import { ref } from "@vue/reactivity";
import { onMounted } from "@vue/runtime-core";
import Cortes from "../apis/Cortes";

const movimientos = ref([]);
const headers = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Cantidad', key: 'cantidad', align: 'start', sortable: false },
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: false },
  { title: 'Concepto', key: 'concepto', align: 'start', sortable: false },
  { title: 'Es Gasto', key: 'es_gasto', align: 'start', sortable: false },
  { title: 'Comentarios', key: 'comentarios', align: 'start', sortable: false },
]);
const model = defineModel();
const props = defineProps(['user'])
onMounted(() => {
  Cortes.getMisMovimientos(props.user).then((response) => {
    movimientos.value = response.data;
  })
})
</script>

<template>
  <v-dialog v-model="model" max-width="800">
    <v-card>
      <v-card-title>Movimientos de caja</v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="movimientos" items-per-page="5">
          <template v-slot:item.es_gasto="{ item }">
            <v-chip :color="item.es_gasto ? 'error' : 'primary'" text-color="white">
              {{ item.es_gasto ? 'Gasto' : 'No' }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
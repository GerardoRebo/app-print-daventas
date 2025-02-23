<template>
  <v-card class="mb-2">
    <v-card-title>Clientes con crédito</v-card-title>
    <v-card-text>
      <v-checkbox label="Incluir cuentas saldadas" v-model="todos"></v-checkbox>
    </v-card-text>
  </v-card>
  <!-- Tabla -->
  <v-container fluid>
    <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
    <v-data-table :headers="tHeaders" :items="creditos" dense>
      <template v-slot:item.precio_final="{ item }">
        <span>${{ item.precio_final }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <router-link :to="{ name: 'CreditosShow', params: { creditoId: item.id } }">
          <v-btn icon size="small">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </router-link>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import Creditos from "@js/apis/Creditos";
import { ref } from "@vue/reactivity";
import { onMounted, watch } from "@vue/runtime-core";
import { useUserStore } from "@js/s";
const s = useUserStore();
const { handleOpException } = s;

const creditos = ref([]);

const todos = ref(null);
const cargando = ref(false);
const tHeaders = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Email', key: 'email', align: 'start', sortable: false },
  { title: 'Saldo actual', key: 'saldo_actual', align: 'start', sortable: false },
  { title: 'Límite de crédito', key: 'limite_credito', align: 'start', sortable: false },
  { title: 'Último pago en ', key: 'ultimo_pago_en', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
watch(todos, () => {
  getCreditos();
});
function getCreditos() {
  Creditos.getCreditos(todos.value)
    .then((response) => {
      creditos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
onMounted(() => {
  getCreditos();
});
</script>
<template>
  <v-card class="mb-2">
    <v-card-text>
      <v-card-title>Catálogo conceptos</v-card-title>
      <v-row dense class="mt-4">
        <v-btn prepend-icon="mdi-check-circle" variant="outlined" color="primary" class="mx-2"
          @click="openCreateConcepto">Crear Concepto
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-card>
    <v-card-text>
      <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
      <v-data-table :headers="tHeaders" :items="conceptos">
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" color="primary" @click="openEditConcepto(item.id)"></v-btn>
          <v-btn icon="mdi-trash-can" size="small" color="error" @click="destroyConcepto(item.id)"></v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
  <v-dialog v-model="isVisible" max-width="800">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="concepto_form.name" label="Nombre"
          :error-messages="errors.name ? errors.name[0] : null"></v-text-field>
        <v-select :items="[
          { value: 'entrada', title: 'Entrada' },
          { value: 'salida', title: 'Salida' },
        ]" label="Tipo" v-model="concepto_form.tipo"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="handleSubmit" :loading="cargando" color="accent" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Concepto from "@js/apis/Concepto";

import { reactive, ref } from "@vue/reactivity";
import { computed, nextTick, onMounted } from "vue";
import { useUserStore } from "@js/s";
const s = useUserStore();
const { handleOpException } = s;

const concepto_form = reactive({
  name: "",
  tipo: "entrada",
});
const conceptoActualId = ref(null);
const conceptos = ref([]);
const errors = ref([]);
const cargando = ref(false);
const isVisible = ref(false);
const modalType = ref('create');
const tHeaders = ref([
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);

const title = computed(() => {
  if (modalType.value == "create") {
    return "Crea concepto"
  }
  return "Edita concepto"
})
function handleSubmit() {
  if (modalType.value == "create") {
    return enviarConcepto()
  }
  return editarConcepto()
}

function openCreateConcepto() {
  limpiarCampos();
  modalType.value = 'create';
  isVisible.value = true;
}
function limpiarCampos() {
  conceptoActualId.value = null;
  concepto_form.name = null;
  concepto_form.tipo = "entrada";
  errors.value = []
}
function openEditConcepto(conceptoId) {
  modalType.value = 'edit';
  isVisible.value = true;
  const co = conceptos.value.find(co => co.id === conceptoId)
  conceptoActualId.value = co.id;
  concepto_form.name = co.name;
  concepto_form.tipo = co.tipo;
}
function editarConcepto() {
  Concepto.update(conceptoActualId.value, concepto_form)
    .then(() => {
      getAllConceptos();
      limpiarCampos()
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      isVisible.value = false
    });
}

function getAllConceptos() {
  Concepto.getAll()
    .then((response) => {
      conceptos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}

function enviarConcepto() {
  if (cargando.value) return;
  cargando.value = true;
  Concepto.register(concepto_form)
    .then(() => {
      isVisible.value = false;
      getAllConceptos();
      limpiarCampos()
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function destroyConcepto(conceptoId) {
  if (cargando.value) return;
  cargando.value = true;
  Concepto.delete(conceptoId)
    .then(() => {
      getAllConceptos();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function abrirIsVisible() {
  isVisible.value = true;
  nextTick(() => document.getElementById("name").select());
}

onMounted(() => {
  getAllConceptos();
});
</script>

<style></style>
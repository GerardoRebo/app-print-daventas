<template>
  <v-card class="mb-2">
    <v-card-text>
      <v-card-title>Catálogo departamentos</v-card-title>
      <v-row dense class="mt-4">
        <v-btn prepend-icon="mdi-check-circle" variant="outlined" color="primary" class="mx-2"
          @click="openCreateDepartamento">Crear Departamento
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-card class="mx-8">
      <v-card-text>
        <v-text-field label="Bucar" id="keyword" autocomplete="password" v-model="keyword" hide-details class="mx-2" />
        <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="tHeaders" :items="departamentos">
          <template v-slot:item.activo="{ item }">
            {{ item.activo ? 'Sí' : 'No' }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" color="primary" @click="openEditDepartamento(item.id)"></v-btn>
            <v-btn icon="mdi-trash-can" size="small" color="error" @click="destroyDepartamento(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
  <v-dialog v-model="isVisible" max-width="800">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="departamento_form.name" label="Nombre"
          :error-messages="errors.name ? errors.name[0] : null"></v-text-field>
        <v-text-field v-model="departamento_form.porcentaje" label="Ingresa el porcentaje deseado (experimental)"
          :error-messages="errors.porcentaje ? errors.porcentaje[0] : null"></v-text-field>
        <v-select :items="[
          { value: true, title: 'Sí' },
          { value: false, title: 'No' },
        ]" label="Activo" v-model="departamento_form.activo"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="handleSubmit" :loading="cargando" color="accent" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Departamento from "@js/apis/Departamento";
import { reactive, ref } from "@vue/reactivity";
import { nextTick, watch } from "@vue/runtime-core";
import { computed, onMounted } from "vue";
import { useUserStore } from "@js/s";

const s = useUserStore();
const { handleOpException } = s;
const departamento_form = reactive({
  name: "",
  porcentaje: null,
  activo: true,
});
const keyword = ref("");
const departamentoActualId = ref(null);
const departamentos = ref([]);
const modalType = ref('create');
const errors = ref([]);
const isVisible = ref(false);
const cargando = ref(false);
const tHeaders = ref([
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Porcentaje', key: 'porcentaje', align: 'start', sortable: false },
  { title: 'Activo', key: 'activo', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false }
]);
watch(keyword, (newValue) => {
  search(newValue);
});
function openCreateDepartamento() {
  limpiarCampos();
  modalType.value = 'create';
  isVisible.value = true;
}
function enviarDepartamento() {
  if (cargando.value) return;
  cargando.value = true;
  Departamento.register(departamento_form)
    .then(() => {
      getAllDepartamentos();
      limpiarCampos();
      isVisible.value = false
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
function openEditDepartamento(departamentoId) {
  limpiarCampos();
  modalType.value = 'edit';
  isVisible.value = true;
  const de = departamentos.value.find(de => de.id === departamentoId)
  departamentoActualId.value = de.id;
  departamento_form.name = de.name;
  departamento_form.porcentaje = de.porcentaje;
  departamento_form.activo = !!de.activo;
}
function editarDepartamento() {
  if (cargando.value) return;
  cargando.value = true;
  Departamento.update(departamentoActualId.value, departamento_form)
    .then(() => {
      getAllDepartamentos();
      limpiarCampos();
      isVisible.value = false
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
function handleSubmit() {
  if (modalType.value == "create") {
    return enviarDepartamento()
  }
  return editarDepartamento()
}
const title = computed(() => {
  if (modalType.value == "create") {
    return "Crea departamento"
  }
  return "Edita departamento"
})

function getAllDepartamentos() {
  Departamento.getAll()
    .then((response) => {
      departamentos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
      /* if (error.response.status === 422) {
        errors.value = error.response.data.errors;
      } */
    });
}

function destroyDepartamento(departamentoId) {
  Departamento.delete(departamentoId)
    .then(() => {
      getAllDepartamentos();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function search(keyword) {
  Departamento.search(keyword)
    .then((response) => {
      departamentos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function limpiarCampos() {
  errors.value = []
  departamento_form.name = '';
  departamento_form.porcentaje = null;
  departamento_form.activo = true;
}
onMounted(() => {
  getAllDepartamentos();
  nextTick(() => document.getElementById("keyword").select());
});
</script>
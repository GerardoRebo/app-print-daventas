<template>
  <v-card class="mb-2">
    <v-card-text>
      <v-card-title>Catálogo proveedores</v-card-title>
      <v-row dense class="mt-4">
        <v-btn prepend-icon="mdi-check-circle" variant="outlined" color="primary" class="mx-2"
          @click="openCreateProvedor">Crear Proveedor
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-card>
      <v-card-text>
        <v-text-field label="Proveedor" id="keyword" autocomplete="password" v-model="keyword" hide-details
          class="mx-2" />
        <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="tHeaders" :items="proveedors">
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" color="primary" @click="openEditProveedor(item.id)"></v-btn>
            <v-btn icon="mdi-trash-can" size="small" color="error" @click="destroyProveedor(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
  <v-dialog v-model="isVisible" max-width="1000">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="proveedor_form.name" label="Nombre"
          :error-messages="errors.name ? errors.name[0] : null"></v-text-field>
        <v-text-field v-model="proveedor_form.telefono" label="Telefono" density="compact"
          :error-messages="errors.telefono ? errors.telefono[0] : null"></v-text-field>
        <v-text-field v-model="proveedor_form.email" label="Email" density="compact"
          :error-messages="errors.email ? errors.email[0] : null"></v-text-field>
        <v-text-field v-model="proveedor_form.direccion" label="Dirección" density="compact"
          :error-messages="errors.direccion ? errors.direccion[0] : null"></v-text-field>
        <v-textarea v-model="proveedor_form.notas" label="Notas" density="compact"
          :error-messages="errors.notas ? errors.notas[0] : null"></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="handleSubmit" :loading="cargando" color="accent" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Proveedor from "@js/apis/Proveedor";
import { reactive, ref } from "@vue/reactivity";
import { nextTick, watch } from "@vue/runtime-core";
import { computed, onMounted } from "vue";
import { useUserStore } from "@js/s";
const s = useUserStore();
const { handleOpException } = s;

const proveedor_form = reactive({
  name: "",
  telefono: "",
  email: "",
  direccion: "",
  notas: "",
});
const tHeaders = ref([
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Teléfono', key: 'telefono', align: 'start', sortable: false },
  { title: 'Notas', key: 'notas', align: 'start', sortable: false },
  { title: 'Dirección', key: 'direccion', align: 'start', sortable: false },
  { title: 'Email', key: 'email', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const keyword = ref("");
const proveedorActualId = ref(null);
const proveedors = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const cargando = ref(false);
const modalType = ref('create');
watch(keyword, (newValue) => {
  search(newValue);
});
function openCreateProvedor() {
  limpiarCampos();
  modalType.value = 'create';
  isVisible.value = true;
}
function handleSubmit() {
  if (modalType.value == "create") {
    return enviarProveedor()
  }
  return editarProveedor()
}
function openEditProveedor(clienteId) {
  limpiarCampos();
  modalType.value = 'edit';
  isVisible.value = true;
  const cl = proveedors.value.find(cl => cl.id === clienteId)
  proveedorActualId.value = cl.id;
  proveedor_form.name = cl.name;
  proveedor_form.telefono = cl.telefono;
  proveedor_form.notas = cl.notas;
  proveedor_form.direccion = cl.direccion;
  proveedor_form.email = cl.email;
}

const title = computed(() => {
  if (modalType.value == "create") {
    return "Crea proveedor"
  }
  return "Edita proveedor"
})
function editarProveedor() {
  Proveedor.update(proveedorActualId.value, proveedor_form)
    .then(() => {
      getAllProveedors();
      limpiarCampos();
      isVisible.value = false;
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
    });
}

function getAllProveedors() {
  Proveedor.getAll()
    .then((response) => {
      proveedors.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}

function enviarProveedor() {
  Proveedor.register(proveedor_form)
    .then(() => {
      limpiarCampos();
      getAllProveedors();
      isVisible.value = false;
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
    });
}
function destroyProveedor(proveedorId) {
  Proveedor.delete(proveedorId)
    .then(() => {
      getAllProveedors();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function search(keyword) {
  Proveedor.search(keyword)
    .then((response) => {
      proveedors.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function limpiarCampos() {
  errors.value = []
  proveedorActualId.value = null;
  proveedor_form.name = null;
  proveedor_form.telefono = null;
  proveedor_form.notas = null;
  proveedor_form.direccion = null;
  proveedor_form.email = null;
}
onMounted(() => {
  getAllProveedors();
  nextTick(() => document.getElementById("keyword").select());
});
</script>

<style></style>
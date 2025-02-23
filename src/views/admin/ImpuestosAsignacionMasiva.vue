<template>
  <v-card class="mb-2">
    <v-card-text>
      <v-card-title>Asignación masiva impuesto</v-card-title>
      <v-row dense class="mt-4">
        <v-btn @click="openCreateImpuesto" :loading="cargando" class="mx-4" prepend-icon="mdi-plus">
          Agregar impuesto</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container>

  </v-container>

</template>

<script setup>
import Impuesto from "../../apis/Impuesto";
import { reactive, ref } from "@vue/reactivity";
import { nextTick, watch } from "@vue/runtime-core";
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const keyword = ref("");
const impuestos = ref([]);
const cargando = ref(false);
const errors = ref([]);
const isVisible = ref(false);
const modalType = ref('create');
// const headers = ref([
//   { title: 'Nombre', key: 'descripcion', align: 'start', sortable: false },
//   { title: 'Tipo', key: 'tipo', align: 'start', sortable: false },
//   { title: 'Porcentaje', key: 'tasa_cuota', align: 'start', sortable: false },
//   { title: 'Activo', key: 'activo', align: 'start', sortable: false },
//   { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
// ]);
watch(keyword, (newValue) => {
  search(newValue);
});
const formatName = (name) => {
  if (name == 'retenido') {
    return 'Retencion'
  } else if (name == 'traslado') {
    return 'Traslado'
  };

}

const title = computed(() => {
  if (modalType.value == "create") {
    return "Agregar impuesto"
  }
  return "Edita impuesto"
})
function handleSubmit() {
  if (modalType.value == "create") {
    return enviarImpuesto()
  }
  return editarImpuesto()
}
function openEditImpuestos(impuestoId) {
  modalType.value = 'edit';
  isVisible.value = true;
  const im = impuestos.value.find(im => im.id === impuestoId)
  impuestoActualId.value = im.id;
  impuesto_form.c_impuesto = im.c_impuesto;
  impuesto_form.tipo = im.tipo;
  impuesto_form.tasa_cuota = im.tasa_cuota;
  impuesto_form.activo = im.activo;
}
function openCreateImpuesto() {
  limpiarCampos();
  modalType.value = 'create';
  isVisible.value = true;
}
function editarImpuesto() {
  Impuesto.update(impuestoActualId.value, impuesto_form)
    .then(() => {
      getAllImpuestos();
      limpiarCampos();
      isVisible.value = false
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {

    });
}

function getAllImpuestos() {
  Impuesto.getAll()
    .then((response) => {
      impuestos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}

function enviarImpuesto() {
  Impuesto.register(impuesto_form)
    .then(() => {
      isVisible.value = false;
      getAllImpuestos();
      limpiarCampos();
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {

    });
}
function destroyImpuesto(impuestoId) {
  Impuesto.delete(impuestoId)
    .then(() => {
      getAllImpuestos();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function search(keyword) {
  Impuesto.search(keyword)
    .then((response) => {
      impuestos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function limpiarCampos() {
  impuesto_form.impuesto = '';
  impuesto_form.activo = "1";
}
onMounted(() => {
  getAllImpuestos();
  // nextTick(() => document.getElementById("keyword").select());
});
</script>
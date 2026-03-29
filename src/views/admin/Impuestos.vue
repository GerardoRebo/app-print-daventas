<template>
  <v-card class="mb-2">
    <v-card-text>
      <v-card-title>Configuración de impuestos</v-card-title>
      <v-row dense class="mt-4">
        <v-btn @click="openCreateImpuesto" :loading="cargando" class="mx-4" prepend-icon="mdi-plus" color="primary">
          Agregar impuesto</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-data-table :headers="headers" :items="impuestos" items-per-page="5">
      <template v-slot:item.tipo="{ item }">
        {{ formatName(item.tipo) }}
      </template>
      <template v-slot:item.tasa_cuota="{ item }">
        %{{ item.tasa_cuota }}
      </template>
      <template v-slot:item.activo="{ item }">
        {{ item.activo ? 'Si' : 'No' }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn @click="openEditImpuestos(item.id)" size="small" prepend-icon="mdi-pencil" class="mx-4">Editar</v-btn>
        <v-btn @click="destroyImpuesto(item.id)" size="small" prepend-icon="mdi-delete" class="mx-4" :disabled="true">Eliminar</v-btn>
      </template>
    </v-data-table>
  </v-container>
  <v-dialog v-model="isVisible" max-width="800">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-select :items="taxOptionsItems" label="Elige el impuesto" v-model="impuesto_form.c_impuesto"
          :error-messages="errors.c_impuesto ? errors.c_impuesto[0] : null" />
        <v-text-field label="Tasa o cuota" v-model="impuesto_form.tasa_cuota"
          :error-messages="errors.tasa_cuota ? errors.tasa_cuota[0] : null"  />
        <v-select :items="[
          { value: 'traslado', title: 'Traslado' },
          { value: 'retenido', title: 'Retención' },
        ]" label="Tipo" v-model="impuesto_form.tipo" :error-messages="errors.tipo ? errors.tipo[0] : null" disabled/>
        <v-select :items="[
          { value: 'Tasa', title: 'Tasa' },
          { value: 'Cuota', title: 'Cuota' },
          { value: 'Exento', title: 'Exento' },
        ]" label="Tipo Factor" v-model="impuesto_form.tipo_factor"
          :error-messages="errors.tipo_factor ? errors.tipo_factor[0] : null" />
        <v-select :items="[
          { value: '1', title: 'Si' },
          { value: '0', title: 'No' },
        ]" label="Activo" v-model="impuesto_form.activo" :error-messages="errors.activo ? errors.activo[0] : null" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" variant="text">Cancelar</v-btn>
        <v-btn @click="handleSubmit" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Impuesto from "../../apis/Impuesto";
import { reactive, ref } from "@vue/reactivity";
import { nextTick, watch } from "@vue/runtime-core";
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useNotification } from "@js/composables/useNotification";
import { useProcessRequest } from "@js/composables/useProcessRequest";

const router = useRouter();
const { notify } = useNotification();
const { processRequest } = useProcessRequest();
const impuesto_form = reactive({
  c_impuesto: null,
  tasa_cuota: 0,
  tipo: 'traslado',
  tipo_factor: 'Tasa',
  activo: "1",
});
const taxOptionsItems = computed(() => [
  { title: 'Selecciona', value: null },
  ...taxOptions.value.map((item) => ({
    title: item.name,
    value: item.id.toString(),
  })),
]);
const keyword = ref("");
const impuestoActualId = ref(null);
const impuestos = ref([]);
const cargando = ref(false);
const errors = ref([]);
const isVisible = ref(false);
const modalType = ref('create');
const taxOptions = ref([
  {
    id: '002',
    name: 'IVA Mexico'
  },
  {
    id: '003',
    name: 'IEPS Mexico'
  },
]);
const headers = ref([
  { title: 'Nombre', key: 'descripcion', align: 'start', sortable: false },
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: false },
  { title: 'Tipo Factor', key: 'tipo_factor', align: 'start', sortable: false },
  { title: 'Porcentaje', key: 'tasa_cuota', align: 'start', sortable: false },
  { title: 'Activo', key: 'activo', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
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
const navigate = (id) => {
  router.push({ name: "ImpuestosAsignacionMasiva", params: { impuestoId: id } });
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
  processRequest(async () => {
    await Impuesto.update(impuestoActualId.value, impuesto_form);
    cargando.value = false;
    getAllImpuestos();
    limpiarCampos();
    isVisible.value = false;
  }, cargando, {
  });
}

function getAllImpuestos() {
  processRequest(async () => {
    const response = await Impuesto.getAll();
    impuestos.value = response.data;
  }, cargando, {
  });
}

function enviarImpuesto() {
  processRequest(async () => {
    await Impuesto.register(impuesto_form);
    cargando.value = false; 
    isVisible.value = false;
    await getAllImpuestos();
    limpiarCampos();
  }, cargando, {
  });
}
function destroyImpuesto(impuestoId) {
  if (!confirm('Estas seguro?')) {
    return;
  }
  processRequest(async () => {
    await Impuesto.delete(impuestoId);
    cargando.value = false;
    await getAllImpuestos();
  }, cargando, {
  });
}
function search(keyword) {
  processRequest(async () => {
    const response = await Impuesto.search(keyword);
    impuestos.value = response.data;
  }, cargando, {
  });
}
function limpiarCampos() {
  impuesto_form.impuesto = '';
  impuesto_form.activo = "1";
}
onMounted(() => {
  getAllImpuestos();
});
</script>
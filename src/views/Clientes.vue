<template>
  <v-container fluid class="py-0 mt-2">
    <v-card class="mb-2">
      <v-card-text>
        <v-card-title>Catálogo clientes</v-card-title>
        <v-row dense class="mt-4">
          <v-btn prepend-icon="mdi-plus" variant="outlined" color="primary" class="mx-2"
            @click="openCreateCliente" v-model="keyword">Crear Cliente
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
  <v-container fluid>
    <v-card>
      <v-card-text>
        <v-text-field label="Cliente" id="keyword" autocomplete="password" v-model="keyword" hide-details
          class="mx-2" />
        <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="tHeaders" :items="clientes">
          <template v-slot:item.regimen_fiscal="{ item }">
            {{ item.regimen_fiscal }} {{ getRegimen(item.regimen_fiscal) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" color="primary" @click="openEditCliente(item.id)"></v-btn>
            <v-btn icon="mdi-trash-can" size="small" color="error" @click="destroyCliente(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
  <v-dialog v-model="isVisible" max-width="1000">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="cliente_form.name" label="Nombre"
          :error-messages="errors.name ? errors.name[0] : null"></v-text-field>
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field v-model="cliente_form.telefono" label="Telefono" density="compact"
              :error-messages="errors.telefono ? errors.telefono[0] : null"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="cliente_form.email" label="Email" density="compact"
              :error-messages="errors.email ? errors.email[0] : null"></v-text-field>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field v-model="cliente_form.domicilio" label="Domicilio" density="compact"
              :error-messages="errors.domicilio ? errors.domicilio[0] : null"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="cliente_form.codigo_postal" label="Código Postal" density="compact"
              :error-messages="errors.codigo_postal ? errors.codigo_postal[0] : null"></v-text-field>
          </v-col>
        </v-row>
        <v-text-field v-model="cliente_form.rfc" label="Rfc" density="compact"
          :error-messages="errors.rfc ? errors.rfc[0] : null"></v-text-field>
        <v-text-field v-model="cliente_form.razon_social" label="Razon social" density="compact"
          :error-messages="errors.razon_social ? errors.razon_social[0] : null"></v-text-field>
        <v-select :items="fiscalRegimenes" label="Régimen Fiscal" v-model="cliente_form.regimen_fiscal"></v-select>
        <v-text-field v-model="cliente_form.limite_credito" label="Límite de crédito" density="compact"
          :error-messages="errors.limite_credito ? errors.limite_credito[0] : null"></v-text-field>
        <v-radio-group v-model="cliente_form.price_type" mandatory label="Cliente usa precio">
          <v-radio label="Normal" value="normal"></v-radio>
          <v-radio label="Medio Mayoreo" value="medio_mayoreo"></v-radio>
          <v-radio label="Mayoreo" value="mayoreo"></v-radio>
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="handleSubmit" :loading="cargando" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Cliente from "../apis/Cliente";

import { reactive, ref } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { computed, onMounted, onUnmounted } from "vue";
import { useUserStore } from "../s";

const s = useUserStore();
const { handleOpException } = s;
const cliente_form = reactive({
  name: "",
  telefono: "",
  email: "",
  domicilio: "",
  limite_credito: null,
  rfc: null,
  razon_social: null,
  regimen_fiscal: 612,
  codigo_postal: null,
  price_type: '',
});
const tHeaders = ref([
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Teléfono', key: 'telefono', align: 'start', sortable: false },
  { title: 'Email', key: 'email', align: 'start', sortable: false },
  { title: 'Domicilio', key: 'domicilio', align: 'start', sortable: false },
  { title: 'Codigo Postal', key: 'codigo_postal', align: 'start', sortable: false },
  { title: 'Rfc', key: 'rfc', align: 'start', sortable: false },
  { title: 'Razón Social', key: 'razon_social', align: 'start', sortable: false },
  { title: 'Regimen Fiscal', key: 'regimen_fiscal', align: 'start', sortable: false },
  { title: 'Límite de crédito', key: 'limite_credito', align: 'start', sortable: false },
  { title: 'Tipo de precio', key: 'price_type', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const modalType = ref('create');
const keyword = ref("");
const clienteActualId = ref(null);
const clientes = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const cargando = ref(false);
const fiscalRegimenes = ref([
  { "value": '601', "title": "601 - General de Ley Personas Morales" },
  { "value": '603', "title": "603 - Personas Morales con Fines no Lucrativos" },
  { "value": '605', "title": "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { "value": '606', "title": "606 - Arrendamiento" },
  { "value": '607', "title": "607 - Régimen de Enajenación o Adquisición de Bienes" },
  { "value": '608', "title": "608 - Demás ingresos" },
  { "value": '610', "title": "610 - Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { "value": '611', "title": "611 - Ingresos por Dividendos (socios y accionistas)" },
  { "value": '612', "title": "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
  { "value": '614', "title": "614 - Ingresos por intereses" },
  { "value": '615', "title": "615 - Régimen de los ingresos por obtención de premios" },
  { "value": '616', "title": "616 - Sin obligaciones fiscales" },
  { "value": '620', "title": "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { "value": '621', "title": "621 - Incorporación Fiscal" },
  { "value": '622', "title": "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { "value": '623', "title": "623 - Opcional para Grupos de Sociedades" },
  { "value": '624', "title": "624 - Coordinados" },
  { "value": '625', "title": "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { "value": '626', "title": "626 - Régimen Simplificado de Confianza" }
]);


const title = computed(() => {
  if (modalType.value == "create") {
    return "Crea cliente"
  }
  return "Edita cliente"
})

watch(keyword, (newValue) => {
  search(newValue);
});
function handleSubmit() {
  if (modalType.value == "create") {
    return enviarCliente()
  }
  return editarCliente()
}
function openEditCliente(clienteId) {
  limpiarCampos();
  modalType.value = 'edit';
  isVisible.value = true;
  const cl = clientes.value.find(cl => cl.id === clienteId)
  clienteActualId.value = cl.id;
  cliente_form.name = cl.name;
  cliente_form.telefono = cl.telefono;
  cliente_form.email = cl.direccion;
  cliente_form.domicilio = cl.domicilio;
  cliente_form.rfc = cl.rfc;
  cliente_form.regimen_fiscal = cl.regimen_fiscal;
  cliente_form.razon_social = cl.razon_social;
  cliente_form.codigo_postal = cl.codigo_postal;
  cliente_form.price_type = cl.price_type;
}
function openCreateCliente() {
  limpiarCampos();
  modalType.value = 'create';
  isVisible.value = true;
}
function limpiarCampos() {
  errors.value = [];
  cliente_form.name = null;
  cliente_form.telefono = null;
  cliente_form.email = null;
  cliente_form.domicilio = null;
  cliente_form.limite_credito = null;
  cliente_form.razon_social = null;
  cliente_form.regimen_fiscal = null;
  cliente_form.codigo_postal = null;
  cliente_form.rfc = null;
  cliente_form.price_type = 'normal';
}
const getRegimen = (id) => {
  const regimen = fiscalRegimenes.value.find((item) => {
    return item.value.toString() == id
  })
  return regimen?.title
}

function editarCliente() {
  if (cargando.value) return;
  cargando.value = true;
  Cliente.update(clienteActualId.value, cliente_form)
    .then(() => {
      isVisible.value = false
      getAllClientes();
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
      cargando.value = false;
    });
}

function getAllClientes() {
  Cliente.getAll()
    .then((response) => {
      clientes.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}

function enviarCliente() {
  if (cargando.value) return;
  cargando.value = true;
  Cliente.register(cliente_form)
    .then(() => {
      isVisible.value = false;
      limpiarCampos();
      getAllClientes();
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
function destroyCliente(clienteId) {
  Cliente.delete(clienteId)
    .then(() => {
      getAllClientes();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function search(keyword) {
  Cliente.search(keyword)
    .then((response) => {
      clientes.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function onKeyPressed(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    limpiarCampos();
    isVisible.value = false;
  }
}
onMounted(() => {
  document.addEventListener("keydown", onKeyPressed);
  getAllClientes();
});
onUnmounted(() => {
  document.removeEventListener("keydown", onKeyPressed);
});
</script>
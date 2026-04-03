<template>
  <v-container fluid class="py-0 mt-2">
    <v-card class="mb-2">
      <v-card-text>
        <v-card-title>Catálogo clientes</v-card-title>
        <v-row dense class="mt-4">
          <v-btn prepend-icon="mdi-plus" variant="outlined" color="primary" class="mx-2" @click="openCreateCliente"
            v-model="keyword">Crear Cliente
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
  <v-container fluid>
    <!-- <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear> -->
    <v-card>
      <v-card-text>
        <v-text-field label="Cliente" id="keyword" autocomplete="password" v-model="keyword" hide-details
          class="mx-2" />
        <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="tHeaders" :items="clientes">
          <template v-slot:item.regimen_fiscal="{ item }">
            {{ getRegimen(item.regimen_fiscal) }}
          </template>
          <template v-slot:item.es_apto_para_cfdi="{ item }">
            <v-chip v-if="item.es_apto_para_cfdi" color="success" size="small">
              <v-icon start icon="mdi-check-circle"></v-icon>
              Apto para CFDI
            </v-chip>
            <v-chip v-else color="warning" size="small">
              <v-icon start icon="mdi-alert-circle"></v-icon>
              Datos incompletos
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="x-small" color="primary" @click="openEditCliente(item.id)"></v-btn>
            <v-btn icon="mdi-trash-can" size="x-small" color="error" @click="destroyCliente(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
  <v-dialog v-model="isVisible" max-width="900" persistent>
    <v-card elevation="3">
      <!-- Header -->
      <v-card-title class="bg-primary text-white pa-6 d-flex align-center">
        <v-icon class="me-3" size="large">{{ modalType === 'create' ? 'mdi-account-plus' : 'mdi-account-edit' }}</v-icon>
        {{ title }}
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6">
        <!-- DATOS PERSONALES -->
        <div class="mb-8">
          <v-row class="mb-4">
            <v-col cols="12" sm="10">
              <div class="d-flex align-center mb-4">
                <v-icon color="primary" class="me-3">mdi-account-outline</v-icon>
                <h3 class="text-subtitle1 font-weight-semibold">Datos Personales</h3>
              </div>
            </v-col>
            <v-col cols="12" sm="2">
              <input ref="csfInput" type="file" accept="application/pdf" style="display:none" @change="onCsfSelected" />
              <v-tooltip location="top" max-width="360"
                text="Función exclusiva para México: carga tu Constancia de Situación Fiscal (CSF) en PDF para autocompletar campos. Revisa y valida los datos en SAT antes de guardar.">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" size="small" variant="tonal" color="primary" :loading="cargandoCsf"
                    prepend-icon="mdi-file-upload-outline" @click="csfInput.click()">
                    Subir CSF
                  </v-btn>
                </template>
              </v-tooltip>
            </v-col>
            <v-divider></v-divider>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-alert type="info" variant="tonal" density="compact" class="mb-2">
                La CSF (Constancia de Situación Fiscal) solo aplica para México. La carga automática puede contener errores de lectura: valida RFC y datos fiscales en SAT antes de guardar.
              </v-alert>
            </v-col>
          </v-row>

          <!-- Campo Nombre (requerido) -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-text-field 
                v-model="cliente_form.name" 
                label="Nombre *" 
                required
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :error-messages="errors.name ? errors.name[0] : null">
              </v-text-field>
            </v-col>
          </v-row>

          <!-- Teléfono y Email -->
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="cliente_form.telefono" 
                label="Teléfono" 
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                :error-messages="errors.telefono ? errors.telefono[0] : null">
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="cliente_form.email" 
                label="Email" 
                variant="outlined"
                prepend-inner-icon="mdi-email"
                :error-messages="errors.email ? errors.email[0] : null">
              </v-text-field>
            </v-col>
          </v-row>

          <!-- Domicilio y Límite de Crédito -->
          <v-row dense>
            <v-col cols="12" md="8">
              <v-text-field 
                v-model="cliente_form.domicilio" 
                label="Domicilio" 
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                :error-messages="errors.domicilio ? errors.domicilio[0] : null">
              </v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field 
                v-model="cliente_form.limite_credito" 
                label="Límite de crédito" 
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-cash"
                :error-messages="errors.limite_credito ? errors.limite_credito[0] : null">
              </v-text-field>
            </v-col>
          </v-row>

          <!-- Tipo de Precio -->
          <v-row dense>
            <v-col cols="12">
              <v-select 
                v-model="cliente_form.price_type" 
                :items="priceTypes" 
                label="Tipo de precio" 
                variant="outlined"
                prepend-inner-icon="mdi-tag-multiple">
              </v-select>
            </v-col>
          </v-row>
        </div>

        <!-- DATOS FISCALES -->
        <div class="mb-6">
          <v-row class="mb-4">
            <v-col cols="12">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon color="primary" class="me-3">mdi-file-document-outline</v-icon>
                  <h3 class="text-subtitle1 font-weight-semibold">Datos Fiscales</h3>
                  <span class="text-caption ms-2 text-grey-darken-1">(para timbrado de CFDIs)</span>
                </div>
                <v-badge v-if="isClienteAptoCfdi" color="success" offset-x="-10" offset-y="-10" dot>
                    <span class="text-success text-caption font-weight-semibold">✓ Datos fiscales completos</span>
                </v-badge>
              </div>
              <v-divider class="mt-2"></v-divider>
            </v-col>
          </v-row>

          <!-- RFC y Razón Social -->
          <v-row class="mt-4" dense>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="cliente_form.rfc" 
                label="RFC" 
                variant="outlined"
                prepend-inner-icon="mdi-file-document-outline"
                :error-messages="errors.rfc ? errors.rfc[0] : null">
                <template v-slot:append-inner>
                  <v-tooltip text="Validar RFC en SAT">
                    <template v-slot:activator="{ props }">
                      <v-icon 
                        v-bind="props"
                        icon="mdi-open-in-new"
                        class="cursor-pointer text-primary"
                        size="small"
                        @click="openSatValidation"
                        style="cursor: pointer;">
                      </v-icon>
                    </template>
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="cliente_form.razon_social" 
                label="Razón Social" 
                variant="outlined"
                prepend-inner-icon="mdi-briefcase"
                :error-messages="errors.razon_social ? errors.razon_social[0] : null">
              </v-text-field>
            </v-col>
          </v-row>

          <!-- Régimen Fiscal y Código Postal -->
          <v-row dense>
            <v-col cols="12" md="8">
              <v-autocomplete 
                :items="fiscalRegimenes" 
                item-title="title" 
                item-value="value" 
                label="Régimen Fiscal" 
                v-model="cliente_form.regimen_fiscal"
                variant="outlined"
                prepend-inner-icon="mdi-folder-outline"
                clearable>
              </v-autocomplete>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field 
                v-model="cliente_form.codigo_postal" 
                label="Código Postal" 
                variant="outlined"
                prepend-inner-icon="mdi-mailbox"
                :error-messages="errors.codigo_postal ? errors.codigo_postal[0] : null">
              </v-text-field>
            </v-col>
          </v-row>

          <!-- Estado CFDI -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-alert v-if="isClienteAptoCfdi" type="success" variant="tonal" class="mb-0" closable>
                <template v-slot:prepend>
                  <v-icon icon="mdi-check-circle"></v-icon>
                </template>
                Los datos fiscales obligatorios están completos. Esto no garantiza que el timbrado CFDI sea exitoso: revisa ortografía y valida en SAT antes de facturar.
                <v-btn variant="text" size="small" color="primary" class="ms-2" @click="openSatValidation">
                  Validar en SAT
                </v-btn>
              </v-alert>
              <v-alert v-else type="info" variant="tonal" class="mb-0" closable>
                <template v-slot:prepend>
                  <v-icon icon="mdi-information"></v-icon>
                </template>
                Completa los datos fiscales obligatorios y verifica su exactitud. La validación oficial se recomienda en los servicios del SAT.
              </v-alert>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-divider></v-divider>
      <v-card-actions class="pa-4 d-flex justify-end gap-2">
        <v-btn 
          @click="isVisible = false" 
          :loading="cargando"
          variant="tonal">
          <v-icon start>mdi-close</v-icon>
          Cancelar
        </v-btn>
        <v-btn 
          @click="handleSubmit" 
          :loading="cargando" 
          color="primary" 
          variant="elevated">
          <v-icon start>{{ modalType === 'create' ? 'mdi-check' : 'mdi-check-all' }}</v-icon>
          {{ modalType === 'create' ? 'Crear Cliente' : 'Actualizar Cliente' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Cliente from "../apis/Cliente";

import { reactive, ref } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../s";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";
import { fiscalRegimenes as catalogoRegimenes } from "@js/utils/cfdiCatalogs";

const s = useUserStore();
const route = useRoute();
const router = useRouter();
const { processRequest } = useProcessRequest();
const { notify } = useNotification();
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
  price_type: 'normal',
});
const priceTypes = ref([
  { value: 'normal', title: 'Normal' },
  { value: 'medio_mayoreo', title: 'Medio Mayoreo' },
  { value: 'mayoreo', title: 'Mayoreo' }
]);
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
  { title: 'Información Fiscal', key: 'es_apto_para_cfdi', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const modalType = ref('create');
const keyword = ref("");
const clienteActualId = ref(null);
const clientes = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const cargando = ref(false);
const cargandoCsf = ref(false);
const csfInput = ref(null);
const fiscalRegimenes = ref(catalogoRegimenes);


const title = computed(() => {
  if (modalType.value == "create") {
    return "Crea cliente"
  }
  return "Edita cliente"
})

const isClienteAptoCfdi = computed(() => {
  return cliente_form.rfc && 
         cliente_form.razon_social && 
         cliente_form.regimen_fiscal != null &&
         cliente_form.codigo_postal &&
         cliente_form.domicilio;
})

watch(keyword, (newValue) => {
  router.push({
    query: {
      ...route.query,
      keyword: newValue || undefined
    }
  });
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
  cliente_form.email = cl.email;
  cliente_form.domicilio = cl.domicilio;
  cliente_form.rfc = cl.rfc;
  cliente_form.regimen_fiscal = cl.regimen_fiscal;
  cliente_form.razon_social = cl.razon_social;
  cliente_form.codigo_postal = cl.codigo_postal;
  cliente_form.price_type = cl.price_type;
  cliente_form.limite_credito = cl.limite_credito;
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
    return item.value == id
  })
  return regimen?.title
}

function editarCliente() {
  processRequest(async () => {
    const response = await Cliente.update(clienteActualId.value, cliente_form);
    isVisible.value = false;
    cargando.value = false;
    await getAllClientes();
    limpiarCampos();
  }, cargando, { errorsRef: errors, 
    onSuccess: () => notify.success("Cliente actualizado"),

   });
}

function getAllClientes() {
  processRequest(async () => {
    const response = await Cliente.getAll();
    clientes.value = response.data;
  }, cargando, { errorsRef: errors, 
    // onSuccess: () => notify.success("Clientes cargados"),
   });
}

function enviarCliente() {
  processRequest(async () => {
    const response = await Cliente.register(cliente_form);
    isVisible.value = false;
    limpiarCampos();
    cargando.value = false;
    await getAllClientes();
  }, cargando, { errorsRef: errors, 
    onSuccess: () => notify.success("Cliente registrado"),
   });
}
function destroyCliente(clienteId) {
  processRequest(async () => {
    const response = await Cliente.delete(clienteId);
    cargando.value = false;
    await getAllClientes();
  }, cargando, { errorsRef: errors, 
    onSuccess: () => notify.success("Cliente eliminado"),
   });
}
function search(keyword) {
  processRequest(async () => {
    const response = await Cliente.search(keyword);
    clientes.value = response.data;
  }, cargando, { errorsRef: errors, 
    // onSuccess: () => notify.success("Clientes cargados"),
   });
}
function openSatValidation() {
  window.open('https://agsc.siat.sat.gob.mx/PTSC/ValidaRFC/index.jsf', '_blank');
}
async function onCsfSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  cargandoCsf.value = true;
  try {
    const response = await Cliente.parseCsf(file);
    const data = response.data;
    if (data.rfc) cliente_form.rfc = data.rfc;
    if (data.razon_social) cliente_form.name = cliente_form.razon_social = data.razon_social;
    if (data.codigo_postal) cliente_form.codigo_postal = data.codigo_postal;
    if (data.domicilio) cliente_form.domicilio = data.domicilio;
    if (data.regimen_fiscal) cliente_form.regimen_fiscal = data.regimen_fiscal + '';
    notify.success('Datos de la CSF cargados. Revisa y valida en SAT antes de guardar.');
  } catch (e) {
    notify.error('No se pudieron leer los datos del PDF');
  } finally {
    cargandoCsf.value = false;
    csfInput.value.value = '';
  }
}
function onKeyPressed(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    limpiarCampos();
    isVisible.value = false;
  }
}
onMounted(() => {
  if (route.query.keyword) {
    keyword.value = route.query.keyword;
  }
  document.addEventListener("keydown", onKeyPressed);
  // getAllClientes();
  search(keyword.value);
});
onUnmounted(() => {
  document.removeEventListener("keydown", onKeyPressed);
});
</script>
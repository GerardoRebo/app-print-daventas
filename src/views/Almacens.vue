<template>
  <v-container fluid class="py-0 mt-2">
    <v-card class="mb-2">
      <v-card-text>
        <v-card-title>Catálogo almacenes</v-card-title>
        <v-row dense class="mt-4">
          <v-btn prepend-icon="mdi-plus" variant="outlined" color="primary" class="mx-2"
            @click="openCreateAlmacen">Crear almacén
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
  <v-container fluid>
    <v-card>
      <v-card-text>
        <v-text-field label="Buscar" id="keyword" autocomplete="password" v-model="keyword" hide-details class="mx-2" />
        <v-progress-linear color="primary" indeterminate v-if="cargando || cargandoConcurrent"></v-progress-linear>
        <v-data-table :headers="tHeaders" :items="almacens">
          <template v-slot:item.activo="{ item }">
            <v-switch inset :true-value="1" v-model="item.is_active" color="primary"
              @click="toggleAlmacen(item.id)"></v-switch>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" color="primary" @click="openEditAlmacen(item.id)" title="Editar almacén"></v-btn>
            <v-tooltip text="Configuración fiscal específica del almacén" location="top">
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-cog" size="small" color="info" @click="openFacturacionModal(item.id)" title="Configuración fiscal del almacén" v-bind="props"></v-btn>
              </template>
            </v-tooltip>
            <!-- <v-btn icon="mdi-file-document-edit" size="small" color="info" @click="openFacturacionModal(item.id)" title="Configuración fiscal"></v-btn> -->
            <v-btn icon="mdi-trash-can" size="small" color="error" @click="destroyAlmacen(item.id)" title="Eliminar"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
  <!-- Modal para crear/editar datos básicos del almacén -->
  <v-dialog v-model="isVisible" max-width="600">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="almacen_form.name" label="Nombre"
          :error-messages="errors.name ? errors.name[0] : null"></v-text-field>
        <v-text-field v-model="almacen_form.telefono" label="Teléfono" density="compact"
          :error-messages="errors.telefono ? errors.telefono[0] : null"></v-text-field>
        <v-text-field v-model="almacen_form.email" label="Email" density="compact"
          :error-messages="errors.email ? errors.email[0] : null"></v-text-field>
        <v-text-field v-model="almacen_form.direccion" label="Dirección" density="compact"
          :error-messages="errors.direccion ? errors.direccion[0] : null"></v-text-field>
          <v-divider class="my-4">Opcional</v-divider>
        <v-tooltip text="Usa los precios de otro almacén como referencia" location="top">
          <template v-slot:activator="{ props }">
            <v-select :items="almacenItems" label="Usar precios de este almacén " v-if="almacens.length && isCreateType"
              v-model="almacen_form.almacen_copia" :error="errors.almacen_copia ? errors.almacen_copia[0] : null"
              clearable v-bind="props" />
          </template>
        </v-tooltip>
        <v-tooltip text="Por defecto la existencia de los productos será cero" location="top">
          <template v-slot:activator="{ props }">
            <v-select :items="almacenItems" label="Usar existencias de este almacén "
              v-if="almacens.length && isCreateType" v-model="almacen_form.almacen_copia_existencia"
              :error="errors.almacen_copia_existencia ? errors.almacen_copia_existencia[0] : null" clearable
              v-bind="props" />
          </template>
        </v-tooltip>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="handleSubmit" :loading="cargando" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- Modal para configuración fiscal avanzada -->
  <v-dialog v-model="isFacturacionModalOpen" max-width="700">
    <v-card>
      <v-card-title>Configuración Fiscal del Almacén</v-card-title>
      <v-card-subtitle class="text-caption">{{ almacen_form.name }}</v-card-subtitle>
      <v-card-text>
        <v-alert type="info" variant="outlined" class="mb-6" icon="mdi-information">
          <template v-slot:title>Configuración Opcional Para Timbrado CFDI</template>
          Completa solo los datos que desees específicos para este almacén. Los campos no rellenados usarán automáticamente la configuración general de tu organización.
        </v-alert>
        
        <FacturacionInfoForm
          :facturacionData="facturacion_form"
          :currentCerName="facturacion_form.cer_name"
          :currentKeyName="facturacion_form.key_name"
          :csdValidFrom="facturacion_form.csd_valid_from"
          :csdValidTo="facturacion_form.csd_valid_to"
          :showCertificates="true"
          :showPeriodicidad="false"
          :showSignManifest="false"
          :isLoading="cargando"
          :errors="errors"
          :fiscalRegimenes="fiscal_regimenes"
          dataTitle="Información Fiscal"
          certificateTitle="(CSD del Almacén)"
          saveButtonLabel="Guardar Configuración"
          @save-certificates="handleSaveCertificates"
          @save-data="guardarYCerrarFacturacion"
          @clear-certificates="handleClearCertificates"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="isFacturacionModalOpen = false" :loading="cargando" variant="text">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Almacen from "@js/apis/Almacen";
import Organizacion from "../apis/Organizacion";
import FacturacionInfoForm from "@js/components/FacturacionInfoForm.vue";
import { fiscalRegimenes as catalogoRegimenes } from "@js/utils/cfdiCatalogs";

import { reactive, ref } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { onMounted, onUnmounted, computed } from "vue";
import { useUserStore } from "../s";
import User from "../apis/User";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";

const s = useUserStore();
const { processRequest, concurrentRequest } = useProcessRequest();
const { notify } = useNotification();
const keyword = ref("");
const almacenActualId = ref(null);
const almacens = ref([]);
const almacenItems = computed(() => {
  const al = almacens.value.map((item) => {
    console.log(item);

    return {
      title: item.name,
      value: item.id,
    }
  })
  console.log(al);
  return al

})
const errors = ref([]);
const cargando = ref(false);
const cargandoConcurrent = ref(false);
const isBannerOpen = ref(false);
const modalType = ref('create');
const message = ref("Los Almacenes son asignados automaticamente a los administradores, para los demás usuarios es necesario la asignación manual, dirigete a: Administración > Usuarios > Almacenes.");
const isVisible = ref(false);
const isFacturacionModalOpen = ref(false);
const title = computed(() => {
  if (modalType.value == "create") {
    return "Crea Almacén"
  }
  return "Edita Almacén"
})
const tHeaders = ref([
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Activo', key: 'activo', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false }
]);
const isCreateType = computed(() => {
  if (modalType.value == "create") {
    return true;
  }
  return false
})
const creaProductFeature = computed(() => {
  return !s.authuser?.configuration?.features?.crea_producto && almacens.value && almacens.value.length < 1
})
const almacen_form = reactive({
  name: "",
  direccion: "",
  telefono: "",
  email: "",
  almacen_copia: null,
  almacen_copia_existencia: null,
});
const facturacion_form = reactive({
  rfc: null,
  razon_social: null,
  regimen_fiscal: null,
  codigo_postal: null,
  clave_privada_sat: null,
  clave_privada_local: null,
  cer_name: null,
  key_name: null,
  csd_valid_from: null,
  csd_valid_to: null,
});
const fiscal_regimenes = ref(catalogoRegimenes);
watch(keyword, (newValue) => {
  search(newValue);
});
function openEditAlmacen(almacenId) {
  modalType.value = 'edit';
  isVisible.value = true;
  const al = almacens.value.find(al => al.id === almacenId)
  almacenActualId.value = al.id;
  almacen_form.name = al.name;
  almacen_form.direccion = al.direccion;
  almacen_form.telefono = al.telefono;
  almacen_form.email = al.email;
}
function handleSubmit() {
  if (modalType.value == "create") {
    return enviarAlmacen()
  }
  return editarAlmacen()
}
function openCreateAlmacen() {
  limpiarCampos();
  modalType.value = 'create';
  isVisible.value = true;
}
function openFacturacionModal(almacenId) {
  almacenActualId.value = almacenId;
  almacen_form.name = almacens.value.find(al => al.id === almacenId)?.name || '';
  loadFacturacionInfo(almacenId);
  isFacturacionModalOpen.value = true;
}
const hideBanner = async () => {
  isBannerOpen.value = false;
  const response = await User.updateFeature({ key: 'crea_producto', value: true })
  s.authuser = response.data[0];
}
function loadFacturacionInfo(almacenId) {
  concurrentRequest(async () => {
    const response = await Almacen.getFacturacionInfo(almacenId);
    if (response.data) {
      facturacion_form.rfc = response.data.rfc;
      facturacion_form.razon_social = response.data.razon_social;
      facturacion_form.regimen_fiscal = response.data.regimen_fiscal;
      facturacion_form.codigo_postal = response.data.codigo_postal;
      facturacion_form.cer_name = response.data.cer_name;
      facturacion_form.key_name = response.data.key_name;
      facturacion_form.csd_valid_from = response.data.csd_valid_from;
      facturacion_form.csd_valid_to = response.data.csd_valid_to;
      facturacion_form.clave_privada_local = response.data.clave_privada_local; // No cargamos la clave privada por seguridad
      // Don't load encrypted passwords in clear text for security
    } else {
      limpiarFacturacionForm();
    }
  }, cargandoConcurrent, { 
    onError: (error) => {
      limpiarFacturacionForm();
      console.log("No hay datos de facturación para este almacén");
    }
  });
}
function editarAlmacen() {
  processRequest(async () => {
    const response = await Almacen.update(almacenActualId.value, almacen_form);
    isVisible.value = false;
    getAllAlmacens();
    limpiarCampos();
  }, cargando, { errorsRef: errors, 
    onError: (error) => {
      if (error.response?.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      notify.error("Ha ocurrido un error");
    }
  });
}

function guardarYCerrarFacturacion(facturacionData) {
  // Send all fields from facturacionData, including null/empty values
  // This allows resetting fields to empty/null
  const data = { ...facturacionData };

  processRequest(async () => {
    await Almacen.updateFacturacionInfo(almacenActualId.value, data);
    isFacturacionModalOpen.value = false;
    limpiarFacturacionForm();
    notify.success("Información fiscal guardada");
  }, cargando, {
    onError: (error) => {
      if (error.response?.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      notify.error("Error al guardar datos de facturación");
    }
  });
}

async function handleSaveCertificates(certificateData) {
  // Validación
  if (!certificateData.cerFile || !certificateData.keyFile) {
    notify.error("Debes seleccionar ambos archivos (.cer y .key)");
    return;
  }

  if (!certificateData.clavePrivadaSat) {
    notify.error("Debes ingresar la clave privada SAT");
    return;
  }

  let formData = new FormData();
  formData.append("cer_file", certificateData.cerFile);
  formData.append("key_file", certificateData.keyFile);
  formData.append("clave_privada_sat", certificateData.clavePrivadaSat);

  processRequest(async () => {
    await Almacen.uploadCSD(almacenActualId.value, formData);
    notify.success("Certificados y clave privada SAT subidos exitosamente");
    loadFacturacionInfo(almacenActualId.value);
  }, cargando, {
    onError: (error) => {
      if (error.response?.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      notify.error("Error al subir certificados");
    }
  });
}

async function handleClearCertificates() {
  if (!confirm("¿Estás seguro de que deseas eliminar los certificados de este almacén? Se usarán los certificados de la organización.")) {
    return;
  }

  processRequest(async () => {
    await Almacen.clearCSD(almacenActualId.value);
    notify.success("Certificados eliminados exitosamente");
    loadFacturacionInfo(almacenActualId.value);
  }, cargando, {
    onError: (error) => {
      notify.error("Error al eliminar certificados");
    }
  });
}

function getAllAlmacens() {
  concurrentRequest(async () => {
    const response = await Almacen.getAll();
    almacens.value = response.data;
  }, cargandoConcurrent, { errorsRef: errors, 
    onError: (error) => notify.error("Ocurrió un error")
   });
}

function enviarAlmacen() {
  processRequest(async () => {
    const response = await Almacen.register(almacen_form);
    isVisible.value = false;
    limpiarCampos();
    getAllAlmacens();
    notify.success("Almacén creado exitosamente");
    if (creaProductFeature.value) {
      isBannerOpen.value = true;
    }
  }, cargando, { errorsRef: errors, 
    onError: (error) => {
      if (error.response?.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      notify.error("Ha ocurrido un error");
    }
  });
}
function limpiarCampos() {
  errors.value = [];
  almacen_form.name = null;
  almacen_form.direccion = null;
  almacen_form.telefono = null;
  almacen_form.email = null;
  limpiarFacturacionForm();
}
function limpiarFacturacionForm() {
  facturacion_form.rfc = null;
  facturacion_form.razon_social = null;
  facturacion_form.regimen_fiscal = null;
  facturacion_form.codigo_postal = null;
  facturacion_form.clave_privada_sat = null;
  facturacion_form.clave_privada_local = null;
  facturacion_form.cer_name = null;
  facturacion_form.key_name = null;
  facturacion_form.csd_valid_from = null;
  facturacion_form.csd_valid_to = null;
}
async function destroyAlmacen(almacenId) {
  let con = await confirm('Estas seguro de la acción?')
  if (con === false) {
    return;
  }
  processRequest(async () => {
    const response = await Almacen.delete(almacenId);
    s.myAlmacens = [];
    getAllAlmacens();
  }, cargando, { errorsRef: errors, 
    onError: (error) => notify.error("Ocurrió un error")
   });
}
function search(keyword) {
  processRequest(async () => {
    const response = await Almacen.search(keyword);
    almacens.value = response.data;
  }, cargando, { errorsRef: errors, 
    onError: (error) => notify.error("Ha ocurrido un error")
   });
}
function onKeyPressed(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    limpiarCampos();
    isVisible.value = false;
  }
}
async function toggleAlmacen(almacenId) {
  console.log("here");

  if (cargando.value) return;
  cargando.value = true;
  try {
    await Organizacion.toggleAlmacen(almacenId)
  } catch (error) {
    console.log(error);

    handleOpException(error)
  } finally {
    cargando.value = false;
    getAllAlmacens();
  }

}
onMounted(() => {
  document.addEventListener("keydown", onKeyPressed);
  getAllAlmacens();
});
onUnmounted(() => {
  document.removeEventListener("keydown", onKeyPressed);
});
</script>
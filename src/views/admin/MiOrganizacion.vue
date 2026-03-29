<template>

  <v-toolbar color="gray">
    <!-- Container interno con max-width, para alinear el título -->
    <v-container max-width="800">
      <v-toolbar-title class="text-secondary">Admin - Mi organización</v-toolbar-title>
    </v-container>
  </v-toolbar>
  <v-container max-width="800">
    <v-row class="">
      <v-col cols="12">
        <v-card>
          <v-card-title>Logo</v-card-title>
          <v-card-text>
            <p class="mb-2 text-caption">Formatos: jpg,jpeg,png</p>
            <p class="mb-2 text-caption">No mayor a 2Mb preferentemente de 512x512 pixeles</p>
            <v-img :src="myOrganization.image?.url" class="ma-2 border-lg" height="150px" width="150px" />
            <v-form @submit.prevent="submitForm">
              <v-file-input v-model="logo" label="Selecione una imagen de logo" accept="image/*"
                prepend-icon="mdi-camera" :loading="cargando" variant="outlined" density="compact">
              </v-file-input>
              <v-btn type="submit" variant="outlined" color="primary" :disabled="!logo">Subir</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>Mi organización</v-card-title>
          <v-card-text>
            <v-text-field label="Nombre Comercial" autocomplete="off" placeholder="" v-model="myOrganization.name" />
            <v-text-field label="Email" placeholder="" v-model="myOrganization.email" :error-messages="errors.email ? errors.email[0] : null" />
          </v-card-text>
          <v-card-actions>
            <v-btn @click.prevent="updateMyOrganization" color="primary" variant="outlined"
              :loading="cargando">Guardar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
        <TelegramConfig />
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-title>Administración de Folios</v-card-title>
          <v-card-text>
            <p class="mb-4">Selecciona qué contador de folios deseas resetear a 1.</p>
            <p class="text-caption text-warning">⚠️ Esta acción reiniciará el contador de numeración seleccionado. Úsala con precaución.</p>
            <div class="mt-6">
              <p class="text-subtitle-2 mb-3">Selecciona el tipo de folio a resetear:</p>
              <div class="d-flex gap-2 flex-wrap">
                <v-btn @click="openResetConfirmDialog('venta')" color="warning" variant="outlined" :loading="cargando">
                  📋 Folios de Ventas
                </v-btn>
                <v-btn @click="openResetConfirmDialog('cotizacion')" color="warning" variant="outlined" :loading="cargando">
                  📄 Folios de Cotizaciones
                </v-btn>
                <v-btn @click="openResetConfirmDialog('compra')" color="warning" variant="outlined" :loading="cargando">
                  🛒 Folios de Compras
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="showResetConfirmDialog" max-width="400">
    <v-card>
      <v-card-title>Confirmar Reseteo de Folios</v-card-title>
      <v-card-text>
        <p class="mb-4">¿Estás seguro de que deseas resetear el contador de <strong>{{ resetFolioTypeLabel }}</strong> a 1?</p>
        <p class="text-caption">El próximo folio generado será el número 1.</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="showResetConfirmDialog = false" variant="text">Cancelar</v-btn>
        <v-btn @click="confirmResetFolios" color="warning" variant="outlined" :loading="cargando">Resetear</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import { onMounted } from '@vue/runtime-core';

import Organizacion from "@js/apis/Organizacion";
import TelegramConfig from "./TelegramConfig.vue";
import { ref, computed } from "vue";
import { useNotification } from "@js/composables/useNotification";
import { useProcessRequest } from "@js/composables/useProcessRequest";

const { notify } = useNotification();
const { processRequest } = useProcessRequest();

const logo = ref(null);
const myOrganizationId = ref(null);
const cargando = ref(false);
const showResetConfirmDialog = ref(false);
const resetFolioType = ref(null);
const myOrganization = reactive({
  name: "",
  razon_social: "",
  clave_privada_sat: "",
  clave_privada_local: "",
  regimen_fiscal: "612",
  codigo_postal: "",
  rfc: "",
  c_periodicidad: "04",
  image: null,
  show_fiscal_info: true,
});

const errors = ref([]);
async function submitForm() {
  let formData = new FormData();
  formData.append("logo", logo.value);

  processRequest(async () => {
    const { data } = await Organizacion.uploadLogo(formData);
    if (data.success) {
      cargando.value = false;
      notify.success('Logo subido exitosamente');
      logo.value = null;
      getMyOrganization();
    }
  }, cargando, {
    onError: (error) => {
      if (error.response?.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      notify.error("Error al subir el logo");
    }
  });
}
function getMyOrganization() {
  processRequest(async () => {
    const response = await Organizacion.getMyOrganization();
    fillValues(response);
  }, cargando);
}
function updateMyOrganization() {
  processRequest(async () => {
    await Organizacion.update(myOrganizationId.value, myOrganization);
    notify.success("Datos actualizados exitosamente");
  }, cargando, {
    errorsRef: errors,
    onError: (error) => {
      if (error.response?.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      notify.error("Error al actualizar los datos");
    }
  });
}

const fillValues = (response) => {
  console.log(response.data);
  const data = response.data;
  myOrganizationId.value = data.id;
  myOrganization.name = data.name;
  myOrganization.email = data.email;
  myOrganization.razon_social = data?.facturacion_info?.razon_social;
  myOrganization.regimen_fiscal = data?.facturacion_info?.regimen_fiscal;
  myOrganization.clave_privada_sat = data?.facturacion_info?.clave_privada_sat;
  myOrganization.clave_privada_local = data?.facturacion_info?.clave_privada_local;
  myOrganization.cer_name = data.facturacion_info?.cer_name;
  myOrganization.key_name = data.facturacion_info?.key_name;
  myOrganization.rfc = data.facturacion_info?.rfc;
  myOrganization.codigo_postal = data.facturacion_info?.codigo_postal;
  myOrganization.c_periodicidad = data.facturacion_info?.c_periodicidad;
  myOrganization.image = data.image;
  myOrganization.show_fiscal_info = data.show_fiscal_info !== false;
};

const resetFolioTypeLabel = computed(() => {
  return {
    venta: 'Folios de Ventas',
    cotizacion: 'Folios de Cotizaciones',
    compra: 'Folios de Compras',
  }[resetFolioType.value] || '';
});

function openResetConfirmDialog(type) {
  resetFolioType.value = type;
  showResetConfirmDialog.value = true;
}

function confirmResetFolios() {
  processRequest(async () => {
    await Organizacion.resetFolios(resetFolioType.value);
    showResetConfirmDialog.value = false;
    resetFolioType.value = null;
    notify.success("Folio reseteado a 1 exitosamente");
  }, cargando, {
    onError: () => {
      notify.error("Error al resetear el folio");
    }
  });
}

onMounted(() => {
  getMyOrganization();
});
</script>

<style></style>
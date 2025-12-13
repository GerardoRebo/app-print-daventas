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
            <v-text-field label="Email"  placeholder="" v-model="myOrganization.email" :error-messages="errors.email ? errors.email[0] : null" />
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
    </v-row>
  </v-container>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import { onMounted } from '@vue/runtime-core';

import Organizacion from "@js/apis/Organizacion";
import TelegramConfig from "./TelegramConfig.vue";
import { ref, watch } from "vue";
import { useUserStore } from "@js/s";
const store = useUserStore();
const { handleOpException } = store;
const logo = ref(null);
const myOrganizationId = ref(null);
const cargando = ref(false);
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
});

const errors = ref([]);
async function submitForm() {
  let formData = new FormData();
  formData.append("logo", logo.value);

  try {
    const { data } = await Organizacion.uploadLogo(formData)
    if (data.success) {
      alert('Logo subido exitosamente')
      logo.value = null
      getMyOrganization()
    }

  } catch (error) {
    console.log(error);
    if (error.resopnse) {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
      }
    }
    handleOpException(error);
    alert("Ha ocurrido un error")
  }
}
function getMyOrganization() {
  Organizacion.getMyOrganization()
    .then((response) => {
      console.log(response.data, 'data');

      fillValues(response);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function updateMyOrganization() {
  Organizacion.update(myOrganizationId.value, myOrganization)
    .then((response) => {
      alert("Exitoso");
    })
    .catch((error) => {
      cargando.value = false;
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
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
};

onMounted(() => {
  getMyOrganization();
});
</script>

<style></style>
<template>
  <v-toolbar color="neutral200" density="compact">
    <v-toolbar-title class="text-primary_d600">Admin - Mi organización</v-toolbar-title>
  </v-toolbar>

  <v-container>
    <v-card max-width="1200">
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>Logo</v-card-title>
            <v-card-text>
              <p class="mb-2 text-caption">Formatos: jpg,jpeg,png</p>
              <p class="mb-2 text-caption">No mayor a 2Mb preferentemente de 512x512 pixeles</p>
              <v-img :src="myOrganization.image?.url" class="ma-2 border-lg" height="150px" width="150px" />
              <v-form @submit.prevent="submitForm">
                <v-file-input v-model="logo" label="Selecione una imagen de logo" accept="image/*"
                  prepend-icon="mdi-camera" :loading="cargando">
                </v-file-input>
                <v-btn type="submit" variant="outlined" color="accent" :disabled="!logo">Subir</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card>
            <v-card-title>Mi organización</v-card-title>
            <v-card-text>
              <v-text-field label="Nombre Comercial" autocomplete="off" placeholder="" v-model="myOrganization.name" />
              <v-text-field label="Razón Social" autocomplete="off" placeholder=""
                v-model="myOrganization.razon_social" />
              <v-text-field label="RFC" autocomplete="off" placeholder="" v-model="myOrganization.rfc" />
              <v-text-field label="Codigo Postal" autocomplete="off" placeholder=""
                v-model="myOrganization.codigo_postal" />
              <v-select :items="fiscalRegimenes" label="Régimen Fiscal"
                v-model="myOrganization.regimen_fiscal"></v-select>
              <v-select :items="c_periodicidad" label="Realizar facturas globales por"
                v-model="myOrganization.c_periodicidad"></v-select>
            </v-card-text>
            <v-card-actions>
              <v-btn @click.prevent="updateMyOrganization" color="accent" variant="outlined"
                :loading="cargando">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card>
            <v-card-title>Clave privada (Sat Mexico)</v-card-title>
            <v-card-text>
              <v-text-field label="Clave Privada Sat" autocomplete="password" v-model="clave_privada_sat" class="my-4"
                :type="show ? 'text' : 'password'" :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="show = !show" @keydown.enter="updateClavePrivadaSat" />
            </v-card-text>
            <v-card-actions>
              <v-btn @click.prevent="updateClavePrivadaSat" color="accent" variant="outlined" :loading="cargando"
                v-if="!myOrganization.clave_privada_sat">Guardar</v-btn>
              <v-btn @click.prevent="updateClavePrivadaSat" color="accent" variant="outlined" :loading="cargando"
                v-else>Actualizar</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card>
            <v-card-title>Clave privada local</v-card-title>
            <v-card-text>
              <v-text-field label="Clave privada local" autocomplete="password"
                v-model="myOrganization.clave_privada_local" class="my-4" :type="mostrar ? 'text' : 'password'"
                :append-inner-icon="mostrar ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="mostrar = !mostrar"
                @keydown.enter="updateClavePrivadaLocal" />
            </v-card-text>
            <v-card-actions>
              <v-btn @click.prevent="updateClavePrivadaLocal" color="accent" variant="outlined"
                :loading="cargando">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card class="pa-4" title="Certificados de sello digital del SAT (CSD)">
            <v-card-text>
              <!-- .cer File Section -->
              <div>
                <span class="text-xs">{{ myOrganization.cer_name }}</span>
                <v-file-input label="Elige documento .cer" accept=".cer" v-model="cerFile"
                  prepend-icon="mdi-certificate" @change="handleFileUpload" outlined dense></v-file-input>
                <v-btn v-if="cerFile" @click.prevent="sendCerFile" color="primary" class="mt-2" small>
                  Subir
                </v-btn>
              </div>
              <!-- .key File Section -->
              <div class="mt-4">
                <span class="text-xs">{{ myOrganization.key_name }}</span>
                <v-file-input label="Elige documento .key" accept=".key" v-model="keyFile" prepend-icon="mdi-key"
                  @change="handleFileUpload" outlined dense></v-file-input>
                <v-btn v-if="keyFile" @click.prevent="sendKeyFile" color="primary" class="mt-2" small>
                  Subir
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive } from "@vue/reactivity";
import { onMounted } from '@vue/runtime-core';

import Organizacion from "@js/apis/Organizacion";
import { ref, watch } from "vue";
import { useUserStore } from "@js/s";
const store = useUserStore();
const { handleOpException } = store;
const logo = ref(null);
const myOrganizationId = ref(null);
const cargando = ref(false);
const mostrar = ref(false);
const show = ref(false);
const fieldType = ref('password');
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
const fiscalRegimenes = ref([
  { "value": "601", "title": "General de Ley Personas Morales" },
  { "value": "603", "title": "Personas Morales con Fines no Lucrativos" },
  { "value": "605", "title": "Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { "value": "606", "title": "Arrendamiento" },
  { "value": "607", "title": "Régimen de Enajenación o Adquisición de Bienes" },
  { "value": "608", "title": "Demás ingresos" },
  { "value": "610", "title": "Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { "value": "611", "title": "Ingresos por Dividendos (socios y accionistas)" },
  { "value": "612", "title": "Personas Físicas con Actividades Empresariales y Profesionales" },
  { "value": "614", "title": "Ingresos por intereses" },
  { "value": "615", "title": "Régimen de los ingresos por obtención de premios" },
  { "value": "616", "title": "Sin obligaciones fiscales" },
  { "value": "620", "title": "Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { "value": "621", "title": "Incorporación Fiscal" },
  { "value": "622", "title": "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { "value": "623", "title": "Opcional para Grupos de Sociedades" },
  { "value": "624", "title": "Coordinados" },
  { "value": "625", "title": "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { "value": "626", "title": "Régimen Simplificado de Confianza" }
]);
const c_periodicidad = ref([
  { "value": "01", "title": "Diario" },
  { "value": "02", "title": "Semanal" },
  { "value": "03", "title": "Quincenal" },
  { "value": "04", "title": "Mensual" },
]);
const errors = ref([]);
const keyFile = ref(null);
const cerFile = ref(null);
const inputKey = ref(null);
const inputCer = ref(null);
const clave_privada_sat = ref(null);
watch(mostrar, (newVal) => {
  if (newVal) {
    fieldType.value = 'text';
  } else {
    fieldType.value = 'password';
  }
})
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
const updateClavePrivadaLocal = () => {
  Organizacion.updateClavePrivadaLocal(myOrganizationId.value, myOrganization.clave_privada_local)
    .then((response) => {
      alert("exitoso")
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
const updateClavePrivadaSat = () => {
  Organizacion.updateClavePrivadaSat(myOrganizationId.value, clave_privada_sat.value)
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
  myOrganizationId.value = response.data.id;
  myOrganization.name = response.data.name;
  myOrganization.razon_social = response.data?.facturacion_info?.razon_social;
  myOrganization.regimen_fiscal = response.data?.facturacion_info?.regimen_fiscal;
  myOrganization.clave_privada_sat = response.data?.facturacion_info?.clave_privada_sat;
  myOrganization.clave_privada_local = response.data?.facturacion_info?.clave_privada_local;
  myOrganization.cer_name = response.data.facturacion_info?.cer_name;
  myOrganization.key_name = response.data.facturacion_info?.key_name;
  myOrganization.rfc = response.data.facturacion_info?.rfc;
  myOrganization.codigo_postal = response.data.facturacion_info?.codigo_postal;
  myOrganization.c_periodicidad = response.data.facturacion_info?.c_periodicidad;
  myOrganization.image = response.data.image;
};
function handleFileUpload(event) {
  console.log(event.target);
  if (event.target.name == 'cer') {
    cerFile.value = event.target.files[0];
  } else if (event.target.name == 'key') {
    keyFile.value = event.target.files[0];
  }
}
async function sendKeyFile() {
  let formData = new FormData();
  formData.append("file", keyFile.value);
  Organizacion.uploadKey(formData).then((response) => {
    if (inputKey?.value?.value) {
      inputKey.value.value = "";
    }
    keyFile.value = null;
    alert("Exitoso");
  }).catch((error) => {
    console.log(error);
    if (error.resopnse) {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        abrirModal()
      }
    }
    handleOpException(error);
    alert("Ha ocurrido un error")
  });
}
async function sendCerFile() {
  let formData = new FormData();
  formData.append("file", cerFile.value);
  Organizacion.uploadCer(formData).then((response) => {
    if (inputCer?.value?.value) {
      inputCer.value.value = "";
    }
    cerFile.value = null;
    alert("Exitoso");
  }).catch((error) => {
    console.log(error);
    if (error.resopnse) {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        abrirModal()
      }
    }
    handleOpException(error);
    alert("Ha ocurrido un error")
  });
}
onMounted(() => {
  getMyOrganization();
});
</script>

<style></style>
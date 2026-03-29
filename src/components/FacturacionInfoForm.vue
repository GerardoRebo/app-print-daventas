<template>
  <!-- Sección de Certificados -->
  <v-row v-if="showCertificates">
    <v-col cols="12">
      <v-card :title="`Certificados ${certificateTitle}`" :subtitle="csdValidity" :loading="isLoading">
        <v-card-text>
          <v-row>
            <!-- .cer File Section -->
            <v-col cols="12">
              <span class="text-xs d-block mb-2">{{ currentCerName || 'Certificado (.cer)' }}</span>
              <v-file-input label="Elige documento .cer" accept=".cer" v-model="localCerFile"
                prepend-icon="mdi-certificate" @change="handleFileUpload" variant="outlined"
                density="compact"></v-file-input>
            </v-col>
            <!-- .key File Section -->
            <v-col cols="12">
              <span class="text-xs d-block mb-2">{{ currentKeyName || 'Clave privada (.key)' }}</span>
              <v-file-input label="Elige documento .key" accept=".key" v-model="localKeyFile" prepend-icon="mdi-key"
                @change="handleFileUpload" variant="outlined" density="compact"></v-file-input>
            </v-col>
            <!-- Clave Privada SAT -->
            <v-col cols="12">
              <span class="text-xs d-block mb-2">Clave Privada SAT</span>
              <v-text-field label="Ingresa la clave privada SAT" v-model="localClavePrivadaSat"
                :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword" variant="outlined" density="compact"
                hint="Clave proporcionada por SAT México"></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="!(localCerFile && localKeyFile && localClavePrivadaSat)" @click="emitSaveCertificates"
            color="primary" class="mt-2" variant="outlined" :loading="isLoading">
            Subir Certificados y Clave SAT
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            v-if="currentCerName || currentKeyName" 
            @click="emitClearCertificates"
            color="warning" 
            variant="outlined" 
            :loading="isLoading">
            Limpiar Certificados
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <!-- Sección de Datos Fiscales -->
  <v-row>
    <v-col cols="12">
      <v-card :loading="isLoading">
        <v-card-title>{{ dataTitle }}</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-text-field label="Razón Social" autocomplete="off" placeholder=""
              v-model="localData.razon_social" :error="!!errors.razon_social"
              :error-messages="errors.razon_social ? errors.razon_social[0] : null" />
          </v-row>
          <v-row dense>
            <v-text-field label="RFC" autocomplete="off" placeholder="" v-model="localData.rfc" class="mr-4"
              :error="!!errors.rfc" :error-messages="errors.rfc ? errors.rfc[0] : null" />
            <v-text-field label="Código Postal" autocomplete="off" placeholder=""
              v-model="localData.codigo_postal" :error="!!errors.codigo_postal"
              :error-messages="errors.codigo_postal ? errors.codigo_postal[0] : null" />
          </v-row>
          <v-row dense>
            <v-autocomplete :items="fiscalRegimenes" item-title="title" item-value="value"
              label="Régimen Fiscal" v-model="localData.regimen_fiscal"
              variant="outlined" density="compact" clearable></v-autocomplete>
          </v-row>
          <v-row dense v-if="showPeriodicidad">
            <v-select :items="periodicidad" label="Periodicidad - Realizar facturas globales por"
              v-model="localData.c_periodicidad"></v-select>
          </v-row>
          <v-row dense>
            <v-text-field label="Clave de trabajo (para compartir con compañeros)" autocomplete="password"
              v-model="localData.clave_privada_local" :type="showWorkPassword ? 'text' : 'password'"
              :append-inner-icon="showWorkPassword ? 'mdi-eye' : 'mdi-eye-off'" 
              @click:append-inner="showWorkPassword = !showWorkPassword"
              hint="Comparte esta clave con tu equipo. La clave real del SAT se mantiene privada y protegida." />
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="emitSaveData" color="primary" variant="elevated" :loading="isLoading">
            {{ saveButtonLabel }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="showSignManifest" @click="$emit('sign-manifest')" :disabled="!canSignManifest" 
            color="" :loading="isLoading">
            Firmar manifiesto
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import moment from 'moment'; // Asegúrate de tener moment instalado en tu proyecto  

const props = defineProps({
  // Datos de facturación
  facturacionData: {
    type: Object,
    required: true,
    default: () => ({
      rfc: '',
      razon_social: '',
      regimen_fiscal: '',
      codigo_postal: '',
      clave_privada_local: '',
      clave_privada_sat: '',
      c_periodicidad: '04',
    })
  },
  
  // Datos de certificados
  currentCerName: {
    type: String,
    default: null
  },
  currentKeyName: {
    type: String,
    default: null
  },
  csdValidFrom: {
    type: String,
    default: null
  },
  csdValidTo: {
    type: String,
    default: null
  },
  
  // Configuración visual
  showCertificates: {
    type: Boolean,
    default: true
  },
  showPeriodicidad: {
    type: Boolean,
    default: true
  },
  showSignManifest: {
    type: Boolean,
    default: false
  },
  canSignManifest: {
    type: Boolean,
    default: false
  },
  
  // Labels
  certificateTitle: {
    type: String,
    default: '(CSD)'
  },
  dataTitle: {
    type: String,
    default: 'Datos Fiscales'
  },
  saveButtonLabel: {
    type: String,
    default: 'Guardar'
  },
  
  // Estados
  isLoading: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  
  // Catálogos
  fiscalRegimenes: {
    type: Array,
    default: () => [
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
    ]
  },
  periodicidad: {
    type: Array,
    default: () => [
      { "value": "01", "title": "Diario" },
      { "value": "02", "title": "Semanal" },
      { "value": "03", "title": "Quincenal" },
      { "value": "04", "title": "Mensual" },
    ]
  },
});

const emit = defineEmits(['save-certificates', 'save-data', 'sign-manifest', 'clear-certificates']);

// Estados locales
const localCerFile = ref(null);
const localKeyFile = ref(null);
const localClavePrivadaSat = ref(null);
const showPassword = ref(false);
const showWorkPassword = ref(false);

const localData = ref({
  rfc: props.facturacionData.rfc || '',
  razon_social: props.facturacionData.razon_social || '',
  regimen_fiscal: props.facturacionData.regimen_fiscal || '',
  codigo_postal: props.facturacionData.codigo_postal || '',
  clave_privada_local: props.facturacionData.clave_privada_local || '',
  clave_privada_sat: props.facturacionData.clave_privada_sat || '',
  c_periodicidad: props.facturacionData.c_periodicidad || '04',
});

// Watch para sincronizar localData cuando facturacionData cambia desde el padre
watch(() => props.facturacionData, (newData) => {
  localData.value = {
    rfc: newData.rfc || '',
    razon_social: newData.razon_social || '',
    regimen_fiscal: newData.regimen_fiscal || '',
    codigo_postal: newData.codigo_postal || '',
    clave_privada_local: newData.clave_privada_local || '',
    clave_privada_sat: newData.clave_privada_sat || '',
    c_periodicidad: newData.c_periodicidad || '04',
  };
}, { deep: true });

const csdValidity = computed(() => {
  if (props.csdValidFrom && props.csdValidTo) {
    return ` (Validez: ${moment(props.csdValidFrom).format('DD/MM/YYYY')} - ${moment(props.csdValidTo).format('DD/MM/YYYY')})`;
  }
  return '';
});

const handleFileUpload = (event) => {
  if (event.target.name === 'cer') {
    localCerFile.value = event.target.files[0];
  } else if (event.target.name === 'key') {
    localKeyFile.value = event.target.files[0];
  }
};

const emitSaveCertificates = () => {
  emit('save-certificates', {
    cerFile: localCerFile.value,
    keyFile: localKeyFile.value,
    clavePrivadaSat: localClavePrivadaSat.value,
  });
  // Limpiar después de emitir
  localCerFile.value = null;
  localKeyFile.value = null;
  localClavePrivadaSat.value = null;
};

const emitClearCertificates = () => {
  emit('clear-certificates');
};

const emitSaveData = () => {
  emit('save-data', localData.value);
};
</script>

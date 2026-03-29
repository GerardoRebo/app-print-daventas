<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import Organizacion from "@js/apis/Organizacion";
import { useNotification } from "@js/composables/useNotification";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import FacturacionInfoForm from "@js/components/FacturacionInfoForm.vue";
import { fiscalRegimenes as catalogoRegimenes, periodicidades as catalogoPeriodicidades } from "@js/utils/cfdiCatalogs";

const { notify } = useNotification();
const { processRequest, concurrentRequest } = useProcessRequest();

const myOrganizationId = ref(null);
const errors = ref([]);
const cargando = ref(false);
const cargandoConcurrent = ref(false);
const saldo = ref(0);
const paquetes = ref([]);
const isModalOpen = ref(false);

const myOrganization = reactive({
  razon_social: "",
  clave_privada_sat: "",
  clave_privada_local: "",
  regimen_fiscal: "612",
  codigo_postal: "",
  rfc: "",
  email: "",
  c_periodicidad: "04",
  image: null,
  show_fiscal_info: true,
});

watch(() => myOrganization.show_fiscal_info, () => {
  if (!myOrganizationId.value) return;
  processRequest(async () => {
    await Organizacion.update(myOrganizationId.value, myOrganization);
  }, cargando, {});
}, { flush: 'post' });

async function handleSaveCertificates(certificateData) {
  if (!certificateData.cerFile || !certificateData.keyFile) {
    notify.error("Debes seleccionar ambos archivos (.cer y .key)");
    return;
  }
  if (!certificateData.clavePrivadaSat) {
    notify.error("Debes ingresar la clave privada SAT");
    return;
  }

  const formData = new FormData();
  formData.append("cer_file", certificateData.cerFile);
  formData.append("key_file", certificateData.keyFile);
  formData.append("clave_privada_sat", certificateData.clavePrivadaSat);

  processRequest(async () => {
    await Organizacion.uploadCSD(formData);
    notify.success("Certificados y clave privada SAT subidos exitosamente");
    getMyOrganization();
    loadInitialData();
  }, cargando, {});
}

async function handleSaveFacturacionData(facturacionData) {
  processRequest(async () => {
    const payload = {
      ...facturacionData,
      name: myOrganization.name,
    };
    await Organizacion.update(myOrganizationId.value, payload);
    notify.success("Datos fiscales actualizados exitosamente");
  }, cargando, {
    onError: (error) => {
      if (error.response?.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      notify.error("Error al actualizar los datos");
    }
  });
}

async function handleClearCertificates() {
  if (!confirm("¿Estás seguro de que deseas eliminar los certificados de la organización? Esto afectará a todos los almacenes que no tengan sus propios certificados.")) {
    return;
  }

  processRequest(async () => {
    await Organizacion.clearCSD();
    notify.success("Certificados eliminados exitosamente");
    getMyOrganization();
    loadInitialData();
  }, cargando, {
    onError: () => {
      notify.error("Error al eliminar certificados");
    }
  });
}

const fiscalRegimenes = ref(catalogoRegimenes);
const c_periodicidad = ref(catalogoPeriodicidades);

function getMyOrganization() {
  concurrentRequest(async () => {
    const response = await Organizacion.getMyOrganization();
    fillValues(response);
  }, cargandoConcurrent, {
    onError: () => {
      notify.error("Error al cargar la organización");
    }
  });
}

async function loadInitialData() {
  concurrentRequest(async () => {
    const { data } = await Organizacion.loadFacturacionData();
    saldo.value = data?.saldo || 0;
    paquetes.value = data?.paquetes || [];
  }, cargandoConcurrent);
}

const fillValues = (response) => {
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
  myOrganization.csd_valid_from = data.facturacion_info?.csd_valid_from;
  myOrganization.csd_valid_to = data.facturacion_info?.csd_valid_to;
  myOrganization.rfc = data.facturacion_info?.rfc;
  myOrganization.codigo_postal = data.facturacion_info?.codigo_postal;
  myOrganization.c_periodicidad = data.facturacion_info?.c_periodicidad;
  myOrganization.image = data.image;
  myOrganization.show_fiscal_info = !!data.show_fiscal_info;
};

const onBuyPack = async (item) => {
  processRequest(async () => {
    const { data } = await Organizacion.buyPacket(item);
    window.location.href = data.init_point;
    isModalOpen.value = false;
    loadInitialData();
  }, cargando, {});
};

onMounted(() => {
  getMyOrganization();
  loadInitialData();
});
</script>

<template>
  <v-toolbar color="gray">
    <v-container max-width="800">
      <v-toolbar-title class="text-secondary">Administracion - Facturación</v-toolbar-title>
    </v-container>
  </v-toolbar>
  <v-container max-width="800">
    <FacturacionInfoForm
      :facturacionData="myOrganization"
      :currentCerName="myOrganization.cer_name"
      :currentKeyName="myOrganization.key_name"
      :csdValidFrom="myOrganization.csd_valid_from"
      :csdValidTo="myOrganization.csd_valid_to"
      :showCertificates="true"
      :showPeriodicidad="true"
      :showSignManifest="false"
      :canSignManifest="false"
      :isLoading="cargando"
      :errors="errors"
      :fiscalRegimenes="fiscalRegimenes"
      :periodicidad="c_periodicidad"
      @save-certificates="handleSaveCertificates"
      @save-data="handleSaveFacturacionData"
      @clear-certificates="handleClearCertificates"
    />
  </v-container>

  <v-container max-width="800">
    <v-row>
      <v-col cols="12" class="d-flex flex-column">
        <v-card class="pa-4 h-100 d-flex flex-column">
          <template #title>
            Timbres Fiscales
          </template>

          <v-card-text class="flex-grow-1">
            Mis timbres fiscales: {{ saldo || 0 }}
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="outlined" @click="isModalOpen = true">
              Ver paquetes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card :loading="cargando">
          <v-card-title>Configuración de Tickets</v-card-title>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="mb-1"><strong>Mostrar información fiscal en tickets</strong></p>
                <p class="text-caption">Mostrar RFC y Razón Social en los tickets impresos</p>
              </div>
              <v-switch v-model="myOrganization.show_fiscal_info" color="primary" :disabled="cargando"></v-switch>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="isModalOpen" max-width="800px">
    <v-card>
      <v-card-title class="text-h5">Comprar Paquete de Timbres</v-card-title>
      <v-card-text>
        <v-data-table hide-default-footer :headers="[
          { title: 'Paquete', key: 'name', sortable: false },
          { title: 'Cantidad de Timbres', key: 'cantidad', sortable: false },
          { title: 'Precio', key: 'price', sortable: false },
          { title: 'Total', key: 'total', sortable: false },
          { title: 'Acciones', key: 'actions', sortable: false }
        ]" :items="paquetes" class="elevation-1">
          <template #item.price="{ item }">
            <div>
              ${{ item?.price }}
            </div>
          </template>
          <template #item.actions="{ item }">
            <v-btn color="primary" @click="onBuyPack(item.id)" size="small" :loading="cargando">
              Comprar
            </v-btn>
          </template>
        </v-data-table>
        <div v-if="paquetes.length === 0" class="text-center mt-4">
          No hay paquetes disponibles.
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isModalOpen = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
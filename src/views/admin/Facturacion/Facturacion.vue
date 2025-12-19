<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import Organizacion from "@js/apis/Organizacion";
import { useUserStore } from "@js/s";
const store = useUserStore();
const { handleOpException } = store;

const myOrganizationId = ref(null);
const errors = ref([]);
const cargando = ref(false);
const saldo = ref(0);
const paquetes = ref([]);
const keyFile = ref(null);
const cerFile = ref(null);
const inputKey = ref(null);
const inputCer = ref(null);
const show = ref(false);
const isModalOpen = ref(false);
const clave_privada_sat = ref(null);
const mostrar = ref(false);
watch(mostrar, (newVal) => {
  if (newVal) {
    fieldType.value = 'text';
  } else {
    fieldType.value = 'password';
  }
})
const myOrganization = reactive({
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
watch(() => myOrganization.show_fiscal_info, (newVal) => {
  if (!myOrganizationId.value) return;
  cargando.value = true;
  Organizacion.update(myOrganizationId.value, myOrganization)
    .catch((error) => {
      handleOpException(error);
      console.error('Error al actualizar configuración de tickets:', error);
    })
    .finally(() => {
      cargando.value = false;
    });
}, { flush: 'post' })
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
const c_periodicidad = ref([
  { "value": "01", "title": "Diario" },
  { "value": "02", "title": "Semanal" },
  { "value": "03", "title": "Quincenal" },
  { "value": "04", "title": "Mensual" },
]);
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
function getMyOrganization() {
  Organizacion.getMyOrganization()
    .then((response) => {
      fillValues(response);
    })
    .catch((error) => {
      console.log(error);

      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
async function loadInitialData() {
  const { data } = await Organizacion.loadFacturacionData();
  saldo.value = data?.saldo || 0;
  paquetes.value = data?.paquetes || [];
}
const fillValues = (response) => {
  const data = response.data;
  myOrganizationId.value = data.id;
  myOrganization.name = data.name;
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
  myOrganization.show_fiscal_info = !!data.show_fiscal_info;
  console.log('show_fiscal_info cargado:', myOrganization.show_fiscal_info, 'valor de DB:', data.show_fiscal_info);
};
const onBuyPack = async (item) => {
  try {
    if (cargando.value) {
      return;
    }
    cargando.value = true;

    const { data } = await Organizacion.buyPacket(item)
    console.log(data);

    window.location.href = data.init_point

    isModalOpen.value = false;
    loadInitialData();

  } catch (error) {
    console.error(error);
    handleOpException(error);
    alert("Ha ocurrido un error al comprar el paquete");
  } finally {
    cargando.value = false;
  }
};
onMounted(() => {
  getMyOrganization();
  loadInitialData();
});
</script>
<template>
  <v-toolbar color="gray">
    <!-- Container interno con max-width, para alinear el título -->
    <v-container max-width="800">
      <v-toolbar-title class="text-secondary">Administracion - Facturación</v-toolbar-title>
    </v-container>
  </v-toolbar>
  <v-container max-width="800">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Datos Fiscales</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-text-field label="Razón Social" autocomplete="off" placeholder=""
                v-model="myOrganization.razon_social" />
            </v-row>
            <v-row dense>
              <v-text-field label="RFC" autocomplete="off" placeholder="" v-model="myOrganization.rfc" class="mr-4" />
              <v-text-field label="Codigo Postal" autocomplete="off" placeholder=""
                v-model="myOrganization.codigo_postal" />
            </v-row>
            <v-row dense>
              <v-autocomplete :items="fiscalRegimenes" label="Régimen Fiscal" v-model="myOrganization.regimen_fiscal"
                variant="outlined" density="compact" clearable></v-autocomplete>
            </v-row>
            <v-row dense>
              <v-select :items="c_periodicidad" label="Realizar facturas globales por"
                v-model="myOrganization.c_periodicidad"></v-select>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn @click.prevent="updateMyOrganization" color="primary" variant="outlined"
              :loading="cargando">Guardar</v-btn>
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
    <v-row>
      <v-col cols="6" class="d-flex flex-column">
        <v-card class="pa-4 h-100">
          <v-card-title>Clave privada (Sat Mexico)</v-card-title>
          <v-card-text>
            <v-text-field label="Clave Privada Sat" autocomplete="password" v-model="clave_privada_sat" class="my-4"
              :type="show ? 'text' : 'password'" :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="show = !show" @keydown.enter="updateClavePrivadaSat" />
          </v-card-text>
          <v-card-actions>
            <v-btn @click.prevent="updateClavePrivadaSat" color="primary" variant="outlined" :loading="cargando"
              v-if="!myOrganization.clave_privada_sat">Guardar</v-btn>
            <v-btn @click.prevent="updateClavePrivadaSat" color="primary" variant="outlined" :loading="cargando"
              v-else>Actualizar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="6" class="d-flex flex-column">
        <v-card class="pa-4 h-100">
          <v-card-title>Clave privada local</v-card-title>
          <v-card-text>
            <v-text-field label="Clave privada local" autocomplete="password"
              v-model="myOrganization.clave_privada_local" class="my-4" :type="mostrar ? 'text' : 'password'"
              :append-inner-icon="mostrar ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="mostrar = !mostrar"
              @keydown.enter="updateClavePrivadaLocal" />
          </v-card-text>
          <v-card-actions>
            <v-btn @click.prevent="updateClavePrivadaLocal" color="primary" variant="outlined"
              :loading="cargando">Guardar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" class="d-flex flex-column">
        <v-card class="pa-4" title="Certificados" subtitle="Sello digital del SAT (CSD)">
          <v-card-text>
            <!-- .cer File Section -->
            <div>
              <span class="text-xs">{{ myOrganization.cer_name }}</span>
              <v-file-input label="Elige documento .cer" accept=".cer" v-model="cerFile" prepend-icon="mdi-certificate"
                @change="handleFileUpload" variant="outlined" density="compact"></v-file-input>
              <v-btn v-if="cerFile" @click.prevent="sendCerFile" color="primary" class="mt-2" small>
                Subir
              </v-btn>
            </div>
            <!-- .key File Section -->
            <div class="mt-4">
              <span class="text-xs">{{ myOrganization.key_name }}</span>
              <v-file-input label="Elige documento .key" accept=".key" v-model="keyFile" prepend-icon="mdi-key"
                @change="handleFileUpload" outlined dense variant="outlined" density="compact"></v-file-input>
              <v-btn v-if="keyFile" @click.prevent="sendKeyFile" color="primary" class="mt-2" small>
                Subir
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" class="d-flex flex-column">
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
          <template v-slot:item.price="{ item }">
            <div item.price>
              ${{ item?.price }}
            </div>
          </template>
          <template v-slot:item.actions="{ item }">
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
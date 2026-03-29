<template>
  
  <v-card class="mb-2" v-if="mdAndUp">
    <v-card-title>Factura global ID:{{ factura.id }}</v-card-title>
    <v-card-text>
      <v-row dense>
        <router-link :to="{ name: 'FacturasGlobalesIndex' }">
          <span class="text-decoration-underline text-caption">
            Regresar al historial de facturas globales
          </span>
        </router-link>
        <div class="mx-4">
          <p>
            #Tickets:{{ factura?.articulos?.length }}
          </p>
          <p>
            Timbres Disponibles: {{ saldo ?? 0 }}
          </p>
          <p>
            De:{{ factura.desde }}
          </p>
          <p>
            Hasta:{{ factura.hasta }}
          </p>
          <p>
            Periodicidad: {{ periodicidadName }}
          </p>
        </div>
        <div class="flex flex-col">
          <p>
            Subtotal: ${{ formatNumber(factura.subtotal) }}
          </p>
          <p>
            Descuento: ${{ formatNumber(factura.descuento) }}
          </p>
          <p>
            Impuesto Trasladado: ${{ formatNumber(factura.impuesto_traslado) }}
          </p>
          <p class="font-weight-bold">
            Total: ${{ formatNumber(factura.total) }}
          </p>
        </div>
        <v-btn :loading="cargando" class="mx-4" @click="deleteFacturaGlobal" v-if="!factura.facturado_en"
          prepend-icon="mdi-trash-can">Borrar</v-btn>
        <v-btn :loading="cargando" class="mx-4" @click="isFacturaInfoOpen = true" v-if="!factura.facturado_en"
          prepend-icon="mdi-certificate" color="primary" variant="elevated">Timbrar</v-btn>
        <template v-else>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small">
                Factura
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="onWatchPdf()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-eye"></v-icon>
                </template>
                <v-list-item-title>
                  Ver PDF</v-list-item-title>
              </v-list-item>
              <v-list-item @click="isEmailOpen = true">
                <template v-slot:prepend>
                  <v-icon icon="mdi-email"></v-icon>
                </template>
                <v-list-item-title>
                  Enviar por correo </v-list-item-title>
              </v-list-item>
              <v-list-item @click="descargarPdf()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-pdf-box"></v-icon>
                </template>
                <v-list-item-title>
                  Descarga PDF
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="descargarXml()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-xml"></v-icon>
                </template>
                <v-list-item-title>
                  Descarga XML</v-list-item-title>
              </v-list-item>
              <v-list-item @click="regenerarPdf()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-refresh"></v-icon>
                </template>
                <v-list-item-title>
                  Regenerar PDF</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <p class="mx-2">Facturado en: {{ moment(factura.facturado_en).format('DD-MM-YYYY h:mma') }}</p>
        </template>
      </v-row>
    </v-card-text>
    <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
  </v-card>
  <v-card class="mb-2" v-if="smAndDown">
    <v-card-title>Factura global</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12">
          <v-row dense>
            <v-spacer></v-spacer>
            <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
              @click="drawer = true">
              Detalles
            </v-btn>
          </v-row>
        </v-col>
        <v-col cols="12">
          <router-link :to="{ name: 'FacturasGlobalesIndex' }">
            <span class="text-decoration-underline text-caption">
              Regresar al historial de facturas globales
            </span>
          </router-link>
        </v-col>
      </v-row>
    </v-card-text>
    <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
  </v-card>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary
    v-if="smAndDown">
    <v-card>
      <v-container>
        <v-row dense>
          <v-btn :loading="cargando" block class="my-1" @click="isFacturaInfoOpen = true" v-if="!factura.facturado_en"
            prepend-icon="mdi-certificate" color="primary" variant="elevated">Timbrar</v-btn>
          <v-btn :loading="cargando" block class="my-1" @click="deleteFacturaGlobal" v-if="!factura.facturado_en"
            prepend-icon="mdi-trash-can">Borrar</v-btn>
          <template v-else>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small">
                  Factura
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="onWatchPdf()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-eye"></v-icon>
                  </template>
                  <v-list-item-title>
                    Ver PDF</v-list-item-title>
                </v-list-item>
                <v-list-item @click="descargarPdf()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-file-pdf-box"></v-icon>
                  </template>
                  <v-list-item-title>
                    Descarga PDF
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="descargarXml()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-xml"></v-icon>
                  </template>
                  <v-list-item-title>
                    Descarga XML</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <p class="mx-2">Facturado en: {{ moment(factura.facturado_en).format('DD-MM-YYYY h:mma') }}</p>
          </template>
          <div>
            <p>
              #Tickets:{{ factura?.articulos?.length }}
            </p>
            <p>
              Timbres Disponibles: {{ saldo?.saldo ?? 0 }}
            </p>
            <p>
              De:{{ factura.desde }}
            </p>
            <p>
              Hasta:{{ factura.hasta }}
            </p>

            <p>
              Periodicidad: {{ periodicidadName }}
            </p>
          </div>
          <div class="flex flex-col">
            <p>
              Subtotal: ${{ formatNumber(factura.subtotal) }}
            </p>
            <p>
              Descuento: ${{ formatNumber(factura.descuento) }}
            </p>
            <p>
              Impuesto Trasladado: ${{ formatNumber(factura.impuesto_traslado) }}
            </p>
            <p>
              Total: ${{ formatNumber(factura.total) }}
            </p>
          </div>

        </v-row>
      </v-container>
    </v-card>
  </v-navigation-drawer>

  <v-container fluid>
    <v-data-table :headers="headers" :items="factura?.articulos" dense>
      <template v-slot:item.consecutivo="{ item }">
        <router-link :to="{ name: 'VentasShow', params: { ventaId: item.facturable?.id ?? item.ventaticket?.id ?? 1 } }"
          :class="[checkMaxVentaticket(item.facturable?.id ?? item.ventaticket?.id) ? 'warning' : '']">
          <span>{{
            item.facturable?.consecutivo ?? item.ventaticket?.consecutivo }}</span>
        </router-link>
      </template>
      <template v-slot:item.subtotal="{ item }">
        <!-- {{ item }} -->
        <span>${{ formatNumber(item.facturable?.subtotal ?? item.ventaticket?.subtotal) }}</span>
      </template>
      <template v-slot:item.descuento="{ item }">
        <span>${{ formatNumber(item.facturable?.descuento ?? item.ventaticket?.descuento) }}</span>
      </template>
      <template v-slot:item.impuesto_traslado="{ item }">
        <span>${{ formatNumber(item.facturable?.impuesto_traslado ?? item.ventaticket?.impuesto_traslado) }}</span>
      </template>
      <template v-slot:item.total="{ item }">
        <span class="font-weight-bold">${{ formatNumber(item.facturable?.total ?? item.ventaticket?.total) }}</span>
      </template>
    </v-data-table>
  </v-container>
  <v-dialog v-model="isFacturaInfoOpen" max-width="800">
    <v-card>
      <v-card-title>Información de CFDI</v-card-title>
      <v-card-text>
        <!-- Navegación de Tabs -->
        <v-tabs v-model="activeTab" grow>
          <v-tab value="basico">Básico</v-tab>
          <v-tab value="avanzado">Opciones Avanzadas</v-tab>
        </v-tabs>

        <!-- Contenido de Tabs -->
        <v-window v-model="activeTab">
          <!-- TAB BÁSICO -->
          <v-window-item value="basico">
            <v-card-text>
              <TimbresOrganizationSelector
                :model-value="selectedTimbresOrganization"
                :is-contador="s.isContador"
                :contador-organizations="s.contadorOrganizations"
                :active-organization-name="s.activeOrganization?.name"
                :saldo="saldo"
                :saldos="saldos"
                @update:model-value="selectedTimbresOrganization = $event"
              />
              <v-select label="Periodicidad" :items="periodicidades" v-model="facturaInfo.c_periodicidad"></v-select>
              <v-text-field label="Serie (opcional)" v-model="facturaInfo.serie"></v-text-field>
              <v-select :items="pagoFormas" label="Forma de pago" v-model="facturaInfo.forma_pago"></v-select>
              <v-select label="Año" :items="years" v-model="facturaInfo.year"></v-select>
              <v-select label="Mes" :items="meses" v-model="facturaInfo.mes"></v-select>
              <v-text-field label="Clave privada local" v-model="facturaInfo.clave_privada_local"></v-text-field>
            </v-card-text>
          </v-window-item>

          <!-- TAB AVANZADO -->
          <v-window-item value="avanzado">
            <v-card-text>
              <!-- Fecha Personalizada -->
              <v-checkbox
                label="Usar fecha personalizada para la factura"
                v-model="facturaInfo.usarFechaPersonalizada"
              />
              <v-date-input
                v-if="facturaInfo.usarFechaPersonalizada"
                v-model="facturaInfo.fechaFactura"
                label="Fecha de la factura"
                class="mt-2 mb-4"
                :max="new Date().toISOString().split('T')[0]"
              />

              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-subtitle-1 font-weight-medium">Facturas Relacionadas</span>
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="agregarRelacion"
                >
                  Relación
                </v-btn>
              </div>

              <!-- Lista editable de relaciones -->
              <v-container fluid>
                <v-row
                  v-for="(relacion, index) in facturaInfo.facturasRelacionadas"
                  :key="index"
                  class="align-center mb-2"
                >
                  <v-col cols="5">
                    <v-select
                      :items="tiposRelacionCatalogo"
                      label="Tipo de Relación"
                      :error-messages="relacion.tipo ? '' : 'Campo requerido'"
                      :model-value="relacion.tipo"
                      @update:model-value="actualizarRelacionTipo({ index, value: $event })"
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="Folio Fiscal"
                      :model-value="relacion.folio"
                      @update:model-value="actualizarRelacionFolio({ index, value: $event })"
                      v-maska="'********-****-****-****-************'"
                      :error-messages="relacion.folio ? '' : 'Campo requerido'"
                      placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                    />
                  </v-col>
                  <v-col cols="1" class="d-flex justify-end">
                    <v-btn
                      icon="mdi-delete"
                      color="error"
                      variant="text"
                      size="small"
                      @click="eliminarRelacion(index)"
                    />
                  </v-col>
                </v-row>
              </v-container>

              <!-- Observaciones -->
              <v-divider class="my-4" />
              <v-textarea 
                label="Observaciones (opcional)" 
                v-model="facturaInfo.observaciones"
                placeholder="Agrega observaciones que aparecerán en la factura"
                rows="4"
                counter
                maxlength="2000"
              ></v-textarea>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isFacturaInfoOpen = false" :loading="cargando">Cancelar</v-btn>
        <v-btn
          @click.stop="vistaPreviaXml"
          variant="tonal"
          color="secondary"
          prepend-icon="mdi-xml"
          :loading="cargando"
        >
          Vista Previa XML
        </v-btn>
        <v-btn
          @click.stop="vistaPrevia"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-open-in-new"
          :loading="cargando"
        >
          Vista Previa
        </v-btn>
        <v-btn
          @click.stop="timbrarFacturaGlobal"
          variant="elevated"
          color="primary"
          prepend-icon="mdi-certificate"
          :loading="cargando"
        >
          Timbrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <EmailFacturaModal
    v-model="isEmailOpen"
    :email-data="emailData"
    :loading="cargando"
    :errors="errors"
    @send="sendEmail"
  />
</template>
<style scoped></style>
<script setup>
import { ref, reactive } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { computed, onMounted } from "vue";
import moment from 'moment-timezone';
import Organizacion from "../../../apis/Organizacion";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@js/s";
import { useDisplay } from "vuetify";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";
import TimbresOrganizationSelector from '@js/components/Facturacion/TimbresOrganizationSelector.vue';
import EmailFacturaModal from '@js/components/Facturacion/EmailFacturaModal.vue';
import { useCurrency } from '@js/composables/useCurrency';
import { meses as mesesCatalogo, pagoFormas as pagoFormasCatalogo, tiposRelacion, periodicidades as periodicidadesCatalogo } from '@js/utils/cfdiCatalogs';
import { vMaska } from "maska/vue";

const { formatNumber } = useCurrency('es-MX', 'MXN');
const { xs, mdAndUp, mdAndDown, smAndDown } = useDisplay()
const s = useUserStore();
const { handleOpException } = s;
const { processRequest } = useProcessRequest();
const { notify } = useNotification();
const route = useRoute();
const router = useRouter();
const facturaId = ref(route.params.facturaId);
const selectedTimbresOrganization = ref(null);

const isEmailOpen = ref(false)
const errors = ref([]);
const cargando = ref(false);
const drawer = ref(false);
const factura = ref({});
const saldo = ref(null);
const saldos = ref({});
const maxVentaticket = ref(null);

const headers = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Ticket folio', key: 'consecutivo', align: 'start', sortable: false },
  { title: 'Subtotal', key: 'subtotal', align: 'start', sortable: false },
  { title: 'Descuento', key: 'descuento', align: 'start', sortable: false },
  { title: 'Impuesto trasladado', key: 'impuesto_traslado', align: 'start', sortable: false },
  { title: 'Total', key: 'total', align: 'start', sortable: false },
]);
const facturaInfo = reactive({
  serie: '',
  uso_cfdi: '',
  clave_privada_local: '',
  ticketIds: [],
  c_periodicidad: '',
  year: null,
  mes: "01",
  forma_pago: "01",
  usarFechaPersonalizada: false,
  fechaFactura: null,
  facturasRelacionadas: [],
  observaciones: '',
})
const years = ref([]);
const meses = ref(mesesCatalogo);
const pagoFormas = ref(pagoFormasCatalogo);
const periodicidades = ref(periodicidadesCatalogo);
const periodicidadName = computed(() => {
  const periodicidad = factura.value.c_periodicidad;
  if (periodicidad == '01') {
    return 'Diario';
  }
  if (periodicidad == '02') {
    return 'Semanal';
  }
  if (periodicidad == '03') {
    return 'Quincenal';
  }
  if (periodicidad == '04') {
    return 'Mensual';
  }
  if (periodicidad == '05') {
    return 'Bimestral';
  }
  return "Configura periodicidad"
})
const emailData = ref({
  fromEmail: '',
  fromName: '',
  toName: '',
  toEmail: '',
});
const fileName = computed(() => {
  return `${factura.value.cliente?.rfc ?? 'General'}-${factura.value.consecutivo}-${moment(factura.value.pagado_en).format('YYYYMMDD')}`;
});
const totalComputed = computed(() => {
  const suma = +subtotalComputed.value + +impuestoComputed.value - +descuentoComputed.value;
  return roundToNearestFiveCents(suma).toFixed(2)
});
const roundToNearestFiveCents = (number) => {
  return parseFloat((Math.round(number / 0.05) * 0.05).toFixed(2));
}
const impuestoComputed = computed(() => {
  if (!factura.value.articulos) {
    return 0;
  }
  const suma = factura.value.articulos.reduce(
    (partial_sum, a) => partial_sum + +a.impuesto_traslado,
    0
  );
  return suma.toFixed(2)
});
const descuentoComputed = computed(() => {
  if (!factura.value.articulos) {
    return 0;
  }
  const suma = factura.value.articulos.reduce(
    (partial_sum, a) => partial_sum + +a.descuento,
    0
  );
  return suma.toFixed(2)
});
const subtotalComputed = computed(() => {
  if (!factura.value.articulos) {
    return 0;
  }
  const suma = factura.value.articulos.reduce(
    (partial_sum, a) => partial_sum + +a.subtotal,
    0
  );
  return suma.toFixed(2)
});
const isFacturaInfoOpen = ref(false);
const activeTab = ref("basico");
const tiposRelacionCatalogo = ref(tiposRelacion);
const currentYear = new Date().getFullYear();
const month = (new Date().getMonth() + 1).toString();
facturaInfo.mes = month > 9 ? month : "0" + month
facturaInfo.year = currentYear;
years.value = Array.from({ length: 5 }, (_, index) => (currentYear - 1 + index).toString()).map((item) => {
  return {
    value: item,
    title: item,
  }
});
const checkMaxVentaticket = (ventaticket) => {
  return ventaticket == maxVentaticket.value
}
async function sendEmail(localEmailData) {
  try {
    cargando.value = true;
    const { data } = await Organizacion.sendFacturaEmail(facturaId.value, localEmailData)
    isEmailOpen.value = false;

    notify.success(data.message);

  } catch (error) {
    // handleOpException(error);
    errors.value = error.response?.data?.errors || [];
    console.log(error);
  } finally {
    cargando.value = false;
  }
}
const timbrarFacturaGlobal = async () => {
  if (!saldo.value) {
    alert('No tienes suficientes timbres fiscales, contacta con la administración para solicitar timbres fiscales')
    return;
  }

  const res = confirm('Estas seguro?');
  if (!res) return;
  if (cargando.value) return;
  cargando.value = true;
  try {
    // Preparar datos y formatear fecha si existe
    const datosEnvio = {
      ...facturaInfo,
      timbres_organization_id: selectedTimbresOrganization.value,
    };
    
    // Formatear fechaFactura a Y-m-d si existe
    if (datosEnvio.fechaFactura) {
      const fecha = new Date(datosEnvio.fechaFactura);
      datosEnvio.fechaFactura = fecha.toISOString().split('T')[0];
    }
    
    const { data } = await Organizacion.timbrarFacturaGlobal(facturaId.value, datosEnvio);
    if (data.success) {
      isFacturaInfoOpen.value = false;
    }
    await loadInitialData()
  } catch (error) {
    if (error?.response?.status === 422) {
      console.log(error.response.data.errors);
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        notify.warning(value)
      }
    }
  } finally {
    cargando.value = false
  }
}
const agregarRelacion = () => {
  if (!facturaInfo.facturasRelacionadas) {
    facturaInfo.facturasRelacionadas = [];
  }
  facturaInfo.facturasRelacionadas.push({ tipo: '', folio: '' });
}
const eliminarRelacion = (index) => {
  facturaInfo.facturasRelacionadas.splice(index, 1);
}
const actualizarRelacionTipo = ({ index, value }) => {
  facturaInfo.facturasRelacionadas[index].tipo = value;
}
const actualizarRelacionFolio = ({ index, value }) => {
  facturaInfo.facturasRelacionadas[index].folio = value;
}
const deleteFacturaGlobal = async () => {
  const res = confirm('Estas seguro?');
  if (!res) return;
  if (cargando.value) return;
  cargando.value = true;
  try {
    const { data } = await Organizacion.deleteFacturaGlobal(facturaId.value);
    if (data.success) {
      router.push({ name: 'FacturasGlobalesIndex' })
    }
  } catch (error) {
    if (error?.response?.status === 422) {
      console.log(error.response.data.errors);
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        notify.warning(value)
      }
    }
  } finally {
    cargando.value = false
  }
}
const getConfigurations = async () => {
  try {
    const { data } = await Organizacion.getConfigurations()
    facturaInfo.c_periodicidad = data.c_periodicidad;
  } catch (error) {
    console.log(error);
  } finally {
    cargando.value = false
  }
}
function descargarPdf() {
  processRequest(async () => {
    const response = await Organizacion.descargarPdf(facturaId.value);
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName.value + ".pdf";
    link.click();
    URL.revokeObjectURL(link.href);
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error");
    }
  });
}
function descargarXml() {
  processRequest(async () => {
    const response = await Organizacion.descargarXml(facturaId.value);
    const blob = new Blob([response.data], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName.value + ".xml";
    link.click();
    URL.revokeObjectURL(link.href);
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error");
    }
  });
}

function regenerarPdf() {
  processRequest(async () => {
    const response = await Organizacion.regenerarPdf(facturaId.value);
    notify.success("PDF regenerado correctamente");
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error");
    }
  });
}

function onWatchPdf() {
  processRequest(async () => {
    const response = await Organizacion.descargarPdf(facturaId.value);
    const file = new Blob([response.data], { type: response.headers['content-type'] });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error");
    }
  });
}

function vistaPrevia() {
  processRequest(async () => {
    const payload = {
      forma_pago: facturaInfo.forma_pago,
      serie: facturaInfo.serie,
      clave_privada_local: facturaInfo.clave_privada_local,
      year: facturaInfo.year,
      mes: facturaInfo.mes,
      facturasRelacionadas: facturaInfo.facturasRelacionadas,
      timbres_organization_id: selectedTimbresOrganization.value,
      usarFechaPersonalizada: facturaInfo.usarFechaPersonalizada ?? false,
    };
    
    // Formatear fechaFactura a Y-m-d si existe
    if (payload.usarFechaPersonalizada && facturaInfo.fechaFactura) {
      const fecha = new Date(facturaInfo.fechaFactura);
      payload.fechaFactura = fecha.toISOString().split('T')[0];
    }
    
    const response = await Organizacion.facturaVistaPreviaGlobal(facturaId.value, payload);
    const file = new Blob([response.data], { type: response.headers['content-type'] });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
    notify.success("Vista previa generada correctamente");
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error al generar la vista previa");
    }
  });
}

function vistaPreviaXml() {
  processRequest(async () => {
    const payload = {
      forma_pago: facturaInfo.forma_pago,
      serie: facturaInfo.serie,
      clave_privada_local: facturaInfo.clave_privada_local,
      year: facturaInfo.year,
      mes: facturaInfo.mes,
      facturasRelacionadas: facturaInfo.facturasRelacionadas,
      timbres_organization_id: selectedTimbresOrganization.value,
      usarFechaPersonalizada: facturaInfo.usarFechaPersonalizada ?? false,
    };
    
    // Formatear fechaFactura a Y-m-d si existe
    if (payload.usarFechaPersonalizada && facturaInfo.fechaFactura) {
      const fecha = new Date(facturaInfo.fechaFactura);
      payload.fechaFactura = fecha.toISOString().split('T')[0];
    }
    
    const response = await Organizacion.facturaVistaPreviaXmlGlobal(facturaId.value, payload);
    const fileName = `factura_global_preview_${new Date().getTime()}`;
    const blob = new Blob([response.data], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.xml`;
    link.click();
    URL.revokeObjectURL(link.href);
    notify.success("Vista previa XML generada correctamente");
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error al generar la vista previa XML");
    }
  });
}

const loadInitialData = async () => {
  try {
    const { data } = await Organizacion.facturasGlobalesShow(facturaId.value)
    emailData.value.fromName = data.factura.organization?.name ?? data.factura.almacen?.name;
    emailData.value.fromEmail = data.factura.organization?.email ?? data.factura.almacen?.email;
    const { data: newData } = await Organizacion.getFoliosSaldo();
    maxVentaticket.value = data.maxVentaticket
    factura.value = data.factura
    saldo.value = newData?.saldo
    saldos.value = newData?.saldos

    getConfigurations()

  } catch (error) {
    console.log(error);
  } finally {
    cargando.value = false
  }
}
onMounted(() => {
  loadInitialData()
})
</script>
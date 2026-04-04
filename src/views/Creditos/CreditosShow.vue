<template>
  <v-card class="mb-2">
    <v-card-title>Cliente: {{ clienteInfo?.name }}</v-card-title>
    <v-card-subtitle>
      Aquí puedes ver el historial de creditos del cliente seleccionado.
    </v-card-subtitle>
    <v-card-text>
      <router-link :to="{ name: 'CreditosIndex' }">
        <span class="text-decoration-underline text-caption">
          <v-icon icon="mdi-arrow-left" class="mr-2"></v-icon>
          Regresar a la lista de clientes con credito
        </span>
      </router-link>
      <v-row dense class="mt-4 align-center">
        <p class="font-semibold content-center mt-4 ml-4">
          <strong> Saldo global del cliente: </strong>$<span>{{ formatNumber(saldoGlobal) }}</span>
        </p>
        <v-checkbox label="Mostrar liquidados" v-model="show_settled_loan" class="ml-8" @change="search = String(Date.now())" />
        <v-text-field
          v-model="filtroConsecutivo"
          label="Buscar por Ticket ID"
          placeholder="Ingrese el ID del ticket"
          class="ml-8 mt-4"
          style="max-width: 220px"
          variant="outlined"
          density="compact"
          clearable
          prepend-inner-icon="mdi-magnify"
          @update:model-value="limpiarPaginacion"
        ></v-text-field>
        <v-btn color="primary" variant="elevated" class="ml-8 mt-4" prepend-icon="mdi-plus" @click="abrirAbonoGlobal" :disabled="saldoGlobal <= 0">
          Abono Global
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="secondary" class="mt-4 mr-4" prepend-icon="mdi-history" @click="abrirHistorialAbonos">
          Ver Historial
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>

  <v-container fluid>
    <v-data-table-server
      :headers="headers"
      :items="deudas"
      :items-per-page="10"
      :items-length="totalItems"
      :loading="loading"
      :search="search"
      item-value="name"
      @update:options="getDeudas"
    >
      <template #item.consecutivo="{ item }">
        <v-tooltip text="Ver" location="top">
          <template #activator="{ props }">
            <router-link :to="{ name: 'VentasShow', params: { ventaId: item.ventaticket.id } }">
              {{ item.ventaticket.consecutivo }}
            </router-link>
          </template>
        </v-tooltip>
      </template>
      <template #item.vendido_en="{ item }">
        <span class="text-caption">{{ moment(item.ventaticket.vendido_en ?? item.ventaticket.pagado_en).format('DD/MM/YYYY') }}</span>
      </template>
      <template #item.deuda="{ item }">
        <span>${{ formatNumber(item.deuda) }}</span>
        <v-chip v-if="item.ventaticket.facturado_en" variant="flat" color="success" label size="x-small" class="ml-2" prepend-icon="mdi-file-certificate">
          Facturado
        </v-chip>
      </template>
      <template #item.pendiente="{ item }">
        <span class="font-weight-bold" :class="item.saldo == 0 ? 'text-success' : 'text-error'">${{ formatNumber(item.saldo) }}</span>
      </template>
      <template #item.acciones="{ item }">
        <div v-if="$vuetify.display.mobile">
          <v-menu transition="scale-transition">
            <template #activator="{ props }">
              <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small">
                Acciones
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="abrirAbono(item)" :disabled="+item.saldo <= 0" color="success">
                <template #prepend>
                  <v-icon icon="mdi-plus"></v-icon>
                </template>
                <v-list-item-title>Realizar abono</v-list-item-title>
              </v-list-item>
              <v-list-item @click="imprimirVenta(item)">
                <template #prepend>
                  <v-icon icon="mdi-printer-pos"></v-icon>
                </template>
                <v-list-item-title>Reimprimir</v-list-item-title>
              </v-list-item>
              <v-list-item @click="verAbonos(item)">
                <template #prepend>
                  <v-icon icon="mdi-eye"></v-icon>
                </template>
                <v-list-item-title>Abonos</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div v-else>
          <v-btn @click="abrirAbono(item)" class="mx-2" size="small" color="primary" variant="tonal" :disabled="item.saldo <= 0" prepend-icon="mdi-plus">Realizar abono</v-btn>
          <v-btn size="small" @click="imprimirVenta(item)" class="mx-2" prepend-icon="mdi-printer-pos">Reimprimir</v-btn>
          <v-btn size="small" @keydown.enter="verAbonos(item)" @click="verAbonos(item)" prepend-icon="mdi-eye">Abonos</v-btn>
        </div>
      </template>
    </v-data-table-server>
  </v-container>

  <v-dialog v-model="openAbonoGlobal" max-width="600">
    <v-card>
      <v-card-title>
        Realizar Abono Global, saldo {{ abonoGlobalData.facturar ? 'facturable' : 'global' }}:
        ${{ formatNumber(abonoGlobalData.facturar ? saldoGlobalFacturable : saldoGlobal) }}
      </v-card-title>
      <v-card-text>
        <p class="text-caption mb-4 text-warning">
          <v-icon icon="mdi-information-outline" size="small"></v-icon>
          Este abono se distribuirá automáticamente entre las deudas pendientes del cliente, comenzando por las más antiguas.
        </p>
        <v-alert
          v-if="abonoGlobalData.facturar"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          Solo se incluirán tickets facturados con saldo pendiente. Se emitirá un solo complemento de pago con varios documentos relacionados y los CFDI origen deben tener método de pago PPD.
        </v-alert>
        <v-text-field label="Monto Global" autocomplete="off" placeholder="" v-model="abonoGlobalData.montoGlobal" ref="montoGlobalRef" type="number" step="0.01" :max="abonoGlobalData.facturar ? saldoGlobalFacturable : saldoGlobal" @keydown.enter="realizarAbonoGlobal" />
        <v-select :items="pagoFormas" label="Forma de pago" v-model="abonoGlobalData.forma_pago" :error-messages="errors?.forma_pago?.[0]"></v-select>
        <v-checkbox label="Facturar este abono global" v-model="abonoGlobalData.facturar" />
        <div v-if="abonoGlobalData.facturar" class="text-caption text-primary mb-2">
          Saldo facturable disponible: ${{ formatNumber(saldoGlobalFacturable) }}
        </div>
        <TimbresOrganizationSelector
          v-if="abonoGlobalData.facturar"
          :model-value="selectedTimbresOrganizationGlobal"
          :is-contador="s.isContador"
          :contador-organizations="s.contadorOrganizations"
          :active-organization-name="activeOrganizationName"
          :saldo="saldo"
          :saldos="saldos"
          @update:model-value="selectedTimbresOrganizationGlobal = $event"
        />
        <v-checkbox v-if="abonoGlobalData.facturar" label="Usar fecha personalizada para la factura" v-model="abonoGlobalData.usarFechaPersonalizada" />
        <v-date-input v-if="abonoGlobalData.facturar && abonoGlobalData.usarFechaPersonalizada" v-model="abonoGlobalData.fechaFactura" label="Fecha de la factura" class="mt-2" :max="new Date().toISOString().split('T')[0]" />
        <v-textarea label="Comentarios (opcional)" v-model="abonoGlobalData.comments" variant="outlined"></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openAbonoGlobal = false" :loading="loading">Cancelar</v-btn>
        <v-btn @click="realizarAbonoGlobal" :loading="loading" color="primary" variant="elevated">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="openHistorialAbonos" max-width="1200">
    <v-card>
      <v-card-title>Historial de Abonos del Cliente</v-card-title>
      <v-card-text>
        <v-row dense class="mb-4">
          <v-col cols="12" sm="6">
            <v-select :items="filtrosAbonos" label="Filtrar por tipo" v-model="filtroAbonosSeleccionado" @update:model-value="cargarAbonosHistorial(1)" density="compact"></v-select>
          </v-col>
        </v-row>
        <v-data-table-server
          :headers="headersHistorialAbonos"
          :items="abonosHistorial"
          :items-per-page="15"
          :items-length="totalAbonosHistorial"
          :loading="loadingHistorial"
          item-value="id"
          @update:options="onUpdateAbonosHistorial"
        >
          <template #item.fecha="{ item }">
            {{ moment(item.fecha).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template #item.abono="{ item }">
            <span class="font-weight-bold">${{ formatNumber(item.abono) }}</span>
          </template>
          <template #item.tipo="{ item }">
            <v-chip v-if="item.abono_global_id" size="small" color="warning" text-color="white">Abono Global</v-chip>
            <v-chip v-else-if="!item.deuda_id" size="small" color="info" text-color="white">Global Padre</v-chip>
            <v-chip v-else size="small" color="primary" text-color="white">Individual</v-chip>
          </template>
          <template #item.deuda="{ item }">
            <router-link v-if="item.deuda" :to="{ name: 'VentasShow', params: { ventaId: item.deuda.ventaticket.id } }">
              Ticket #{{ item.deuda.ventaticket.consecutivo }}
            </router-link>
            <span v-else class="text-caption text-disabled">---</span>
          </template>
          <template #item.saldo="{ item }">
            <span :class="item.saldo <= 0 ? 'text-success' : 'text-warning'">${{ formatNumber(item.saldo) }}</span>
          </template>
          <template #item.usuario="{ item }">
            <span class="text-caption">{{ item.user?.name }}</span>
          </template>
          <template #item.forma_de_pago="{ item }">
            <span class="text-caption">{{ getFormaPagoTitle(item.forma_de_pago) }}</span>
          </template>
          <template #item.estado="{ item }">
            <v-chip v-if="item.cancelado_en" size="small" color="error" text-color="white" prepend-icon="mdi-close-circle">Cancelado</v-chip>
            <v-chip v-else size="small" color="success" text-color="white" prepend-icon="mdi-check-circle">Activo</v-chip>
          </template>
        </v-data-table-server>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="openHistorialAbonos = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="openAbono" max-width="600">
    <v-card>
      <v-card-title>Realizar Abono a Ticket, saldo: ${{ formatNumber(selectedDeuda?.saldo) }}</v-card-title>
      <v-card-text>
        <v-text-field label="Cantidad" autocomplete="off" placeholder="" v-model="postData.cantidad" ref="cantidadRef" @keydown.enter="realizarAbono" />
        <v-select :items="pagoFormas" label="Forma de pago" v-model="postData.forma_pago" :error-messages="errors?.forma_pago?.[0]"></v-select>
        <TimbresOrganizationSelector
          v-if="postData.facturar"
          :model-value="selectedTimbresOrganization"
          :is-contador="s.isContador"
          :contador-organizations="s.contadorOrganizations"
          :active-organization-name="activeOrganizationName"
          :saldo="saldo"
          :saldos="saldos"
          @update:model-value="selectedTimbresOrganization = $event"
        />
        <v-checkbox label="Facturar" v-model="postData.facturar" v-if="selectedDeuda?.ventaticket?.facturado_en"></v-checkbox>
        <v-checkbox v-if="postData.facturar" label="Usar fecha personalizada para la factura" v-model="postData.usarFechaPersonalizada" />
        <v-date-input v-if="postData.facturar && postData.usarFechaPersonalizada" v-model="postData.fechaFactura" label="Fecha de la factura" class="mt-2" :max="new Date().toISOString().split('T')[0]" />
        <v-checkbox v-if="+selectedDeuda?.saldo == +postData.cantidad" label="Imprimir al final" v-model="printWhenFinalize"></v-checkbox>
        <v-textarea label="Comentarios (opcional)" v-model="postData.comments" variant="outlined"></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openAbono = false" :loading="loading">Cancelar</v-btn>
        <v-btn @click="realizarAbono" :loading="loading" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="facturarAbonoModal" max-width="600">
    <v-card>
      <v-card-title>Facturar Abono: ${{ formatNumber(abonoAmount) }}</v-card-title>
      <v-card-text>
        <TimbresOrganizationSelector
          :model-value="selectedTimbresOrganizationAbono"
          :is-contador="s.isContador"
          :contador-organizations="s.contadorOrganizations"
          :active-organization-name="activeOrganizationName"
          :saldo="saldo"
          :saldos="saldos"
          @update:model-value="selectedTimbresOrganizationAbono = $event"
        />
        <v-select :items="pagoFormas" label="Forma de pago" v-model="facturarAbonoData.forma_pago"></v-select>
        <v-checkbox label="Usar fecha personalizada para la factura" v-model="facturarAbonoData.usarFechaPersonalizada" />
        <v-date-input v-if="facturarAbonoData.usarFechaPersonalizada" v-model="facturarAbonoData.fechaFactura" label="Fecha de la factura" class="mt-2" :max="new Date().toISOString().split('T')[0]" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="facturarAbonoModal = false" :loading="loading">Cancelar</v-btn>
        <v-btn @click="facturarAbono" :loading="loading" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="openCancelarAbonoModal" max-width="500">
    <v-card>
      <v-card-title>Cancelar Abono</v-card-title>
      <v-card-text>
        <p class="mb-4">¿Estás seguro de que deseas cancelar este abono de <strong>${{ formatNumber(abonoACancelar?.abono) }}</strong>?</p>
        <v-textarea
          v-model="motivoCancelacion"
          label="Motivo de cancelación (requerido)"
          placeholder="Indique el motivo por el cual se cancela este abono"
          variant="outlined"
          :error-messages="errors?.motivo?.[0] ? [errors.motivo[0]] : []"
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="openCancelarAbonoModal = false" :loading="loading">No, mantener</v-btn>
        <v-btn @click="cancelarAbono" :loading="loading" color="error" variant="outlined">Sí, cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="openAbonos" max-width="900">
    <v-card>
      <v-card-title>Historial de abonos realizado al ticket de venta #{{ ventaticketFolio }}</v-card-title>
      <v-card-text>
        <v-data-table :headers="abonosHeaders" :items="abonos" dense>
          <template #item.fecha="{ item }">
            <span class="text-caption">{{ moment(item.fecha).format('DD/MM/YYYY HH:mm') }}</span>
          </template>
          <template #item.abono="{ item }">
            <span><strong>${{ formatNumber(item.abono) }}</strong></span>
          </template>
          <template #item.saldo="{ item }">
            <span>${{ formatNumber(item.saldo) }}</span>
          </template>
          <template #item.forma_de_pago="{ item }">
            <span>{{ getFormaPagoTitle(item.forma_de_pago) }}</span>
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-menu transition="scale-transition" v-if="item.facturado_en">
                <template #activator="{ props }">
                  <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small">
                    Factura
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="onWatchPdf(item)">
                    <template #prepend>
                      <v-icon icon="mdi-eye"></v-icon>
                    </template>
                    <v-list-item-title>Ver PDF</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="abrirEmailModal()">
                    <template #prepend>
                      <v-icon icon="mdi-email"></v-icon>
                    </template>
                    <v-list-item-title>Enviar por correo</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="onDownloadPdf(item)">
                    <template #prepend>
                      <v-icon icon="mdi-file-pdf-box"></v-icon>
                    </template>
                    <v-list-item-title>Descarga PDF</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="onDownloadXml(item)">
                    <template #prepend>
                      <v-icon icon="mdi-xml"></v-icon>
                    </template>
                    <v-list-item-title>Descarga XML</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="onRegenerarPdf(item)">
                    <template #prepend>
                      <v-icon icon="mdi-sync"></v-icon>
                    </template>
                    <v-list-item-title>Regenerar PDF</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn @click="abrirFacturarAbono(item)" size="small" v-if="!item.facturado_en && selectedDeuda?.ventaticket?.facturado_en">Facturar abono</v-btn>
              <v-btn @click="abrirCancelarAbonoModal(item)" size="small" color="error" variant="text" v-if="!item.cancelado_en" prepend-icon="mdi-delete-outline">
                Cancelar
              </v-btn>
              <v-chip v-if="item.cancelado_en" color="error" text-color="white" prepend-icon="mdi-close-circle">
                Cancelado
              </v-chip>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openAbonos = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <EmailFacturaModal
    v-model="isEmailOpen"
    :email-data="emailData"
    :loading="cargando"
    :errors="errors"
    @send="sendEmail"
    @update:email-data="emailData = $event"
  />
</template>

<script setup>
import Creditos from "@js/apis/Creditos";
import Organizacion from "@js/apis/Organizacion";
import PuntoVenta from "@js/apis/PuntoVenta";
import EmailFacturaModal from "@js/components/Facturacion/EmailFacturaModal.vue";
import TimbresOrganizationSelector from "@js/components/Facturacion/TimbresOrganizationSelector.vue";
import { useCurrency } from "@js/composables/useCurrency";
import { useNotification } from "@js/composables/useNotification";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useUserStore } from "@js/s";
import { pagoFormas } from "@js/utils/cfdiCatalogs";
import { computed, nextTick, onMounted, watch } from "vue";
import { reactive, ref } from "@vue/reactivity";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";

const { formatNumber } = useCurrency("es-MX", "MXN");
const s = useUserStore();
const { processRequest, concurrentRequest } = useProcessRequest();
const { notify } = useNotification();
const route = useRoute();
const router = useRouter();

watch(() => route.params, async (to) => {
  if (!to.creditoId) {
    return;
  }
  creditoId.value = route.params.creditoId;
  search.value = String(Date.now());
  await getClienteInfo();
});

const deudas = ref([]);
const abonos = ref([]);
const creditoId = ref(null);
const ventaticketFolio = ref(null);
const loading = ref(false);
const cargandoConcurrent = ref(false);
const cantidadRef = ref(null);
const openAbono = ref(false);
const openAbonos = ref(false);
const facturarAbonoModal = ref(false);
const selectedDeuda = ref(null);
const selectedAbono = ref(null);
const postData = reactive({
  cantidad: 0,
  comments: "",
  facturar: false,
  forma_pago: "01",
  usarFechaPersonalizada: false,
  fechaFactura: null,
});
const abonoGlobalData = reactive({
  montoGlobal: 0,
  comments: "",
  forma_pago: "01",
  facturar: false,
  usarFechaPersonalizada: false,
  fechaFactura: null,
});
const facturarAbonoData = reactive({
  forma_pago: "01",
  usarFechaPersonalizada: false,
  fechaFactura: null,
});
const search = ref();
const show_settled_loan = ref(false);
const abonoAmount = ref(null);
const printWhenFinalize = ref(false);
const totalItems = ref(0);
const filtroConsecutivo = ref("");
const clienteInfo = ref(null);
const saldoGlobal = ref(0);
const saldoGlobalFacturable = ref(0);
const saldo = ref(null);
const saldos = ref(null);
const selectedTimbresOrganization = ref(null);
const selectedTimbresOrganizationGlobal = ref(null);
const selectedTimbresOrganizationAbono = ref(null);
const isEmailOpen = ref(false);
const cargando = ref(false);
const errors = ref([]);
const openCancelarAbonoModal = ref(false);
const openAbonoGlobal = ref(false);
const montoGlobalRef = ref(null);
const openHistorialAbonos = ref(false);
const loadingHistorial = ref(false);
const abonosHistorial = ref([]);
const totalAbonosHistorial = ref(0);
const filtroAbonosSeleccionado = ref(null);
const abonoACancelar = ref(null);
const motivoCancelacion = ref("");
const headers = ref([
  { title: "Venta Ticket Folio", key: "consecutivo", align: "start", sortable: false },
  { title: "Venta Fecha", key: "vendido_en", align: "start", sortable: false },
  { title: "Monto del ticket", key: "deuda", align: "start", sortable: false },
  { title: "Saldo pendiente", key: "pendiente", align: "start", sortable: false },
  { title: "# Abonos", key: "abonos_count", align: "start", sortable: false },
  { title: "Acciones", key: "acciones", align: "start", sortable: false },
]);
const abonosHeaders = ref([
  { title: "Id", key: "id", align: "start", sortable: false },
  { title: "Fecha", key: "fecha", align: "start", sortable: false },
  { title: "Abono", key: "abono", align: "start", sortable: false },
  { title: "Saldo", key: "saldo", align: "start", sortable: false },
  { title: "Forma de Pago", key: "forma_de_pago", align: "start", sortable: false },
  { title: "Comentarios", key: "comentarios", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
]);
const headersHistorialAbonos = ref([
  { title: "Fecha", key: "fecha", align: "start", sortable: false, width: "150px" },
  { title: "Tipo", key: "tipo", align: "center", sortable: false, width: "120px" },
  { title: "Ticket", key: "deuda", align: "start", sortable: false, width: "150px" },
  { title: "Abono", key: "abono", align: "end", sortable: false, width: "120px" },
  { title: "Saldo Deuda", key: "saldo", align: "end", sortable: false, width: "120px" },
  { title: "Usuario", key: "usuario", align: "start", sortable: false, width: "150px" },
  { title: "Forma Pago", key: "forma_de_pago", align: "start", sortable: false, width: "100px" },
  { title: "Estado", key: "estado", align: "center", sortable: false, width: "120px" },
]);
const filtrosAbonos = ref([
  { value: null, title: "Todos los abonos" },
  { value: "hijos", title: "Solo abonos globales" },
  { value: "individual", title: "Solo abonos individuales" },
]);
const emailData = ref({
  fromEmail: "",
  fromName: "",
  toName: "",
  toEmail: "",
});

const activeOrganizationName = computed(() => s.authuser?.organization?.name || "");
const fileName = computed(() => {
  const ticket = selectedDeuda.value?.ventaticket;
  const fecha = ticket?.pagado_en ?? ticket?.vendido_en;
  return `${clienteInfo.value?.rfc ?? "General"}-${selectedDeuda.value?.id ?? "abono"}-${fecha ? moment(fecha).format("YYYYMMDD") : moment().format("YYYYMMDD")}`;
});

const getFormaPagoTitle = (codigo) => {
  const forma = pagoFormas.find((item) => item.value === codigo);
  return forma ? forma.title : codigo;
};

watch(openAbono, (newVal) => {
  if (newVal) {
    printWhenFinalize.value = false;
  }
});

watch(() => postData.cantidad, (newVal) => {
  printWhenFinalize.value = +newVal === +selectedDeuda.value?.saldo;
});

watch(filtroConsecutivo, () => {
  search.value = String(Date.now());
});

async function getDeudas({ page }) {
  if (!creditoId.value) {
    return;
  }
  const params = {
    ...route.query,
    page,
    show_settled_loan: show_settled_loan.value ? 1 : 0,
  };
  params.ticketId = filtroConsecutivo.value;
  router.replace({ query: params });
  concurrentRequest(async () => {
    const response = await Creditos.getDeudas(creditoId.value, params);
    deudas.value = response.data.data;
    totalItems.value = response.data.total;
    saldoGlobal.value = response.data.saldo_global;
    saldoGlobalFacturable.value = response.data.saldo_global_facturable ?? 0;
  }, loading, {});
}

function limpiarPaginacion() {
  search.value = String(Date.now());
}

function verAbonos(deuda) {
  ventaticketFolio.value = deuda.ventaticket.consecutivo;
  selectedDeuda.value = deuda;
  getAbonos(deuda.id);
  openAbonos.value = true;
}

function imprimirVenta(deuda) {
  window.open(`/ventatickets/imprimir/${deuda.ventaticket.id}`, "_blank");
}

function getAbonos(deuda) {
  concurrentRequest(async () => {
    const response = await Creditos.getAbonos(deuda);
    abonos.value = response.data;
  }, loading, {});
}

function getClienteInfo() {
  concurrentRequest(async () => {
    const response = await Creditos.getClienteInfo(creditoId.value);
    clienteInfo.value = response.data;
    emailData.value = {
      fromEmail: s.authuser?.organization?.email ?? "",
      fromName: s.authuser?.organization?.name ?? "",
      toName: response.data?.name ?? response.data?.razon_social ?? "",
      toEmail: response.data?.email ?? "",
    };
    const { data: newData } = await Organizacion.getFoliosSaldo();
    saldo.value = newData?.saldo;
    saldos.value = newData?.saldos;
  }, cargandoConcurrent, {});
}

function abrirAbono(deuda) {
  if (+deuda?.saldo <= 0) {
    notify.warning("El ticket no tiene saldo pendiente por abonar");
    return;
  }

  selectedDeuda.value = deuda;
  postData.cantidad = 0;
  postData.comments = "";
  postData.facturar = false;
  postData.forma_pago = "01";
  postData.usarFechaPersonalizada = false;
  postData.fechaFactura = null;
  selectedTimbresOrganization.value = null;
  errors.value = [];
  openAbono.value = true;
  nextTick(() => cantidadRef.value?.select());
}

function abrirAbonoGlobal() {
  if (+saldoGlobal.value <= 0) {
    notify.warning("No hay saldo pendiente para registrar abonos");
    return;
  }

  openAbonoGlobal.value = true;
  abonoGlobalData.montoGlobal = 0;
  abonoGlobalData.comments = "";
  abonoGlobalData.forma_pago = "01";
  abonoGlobalData.facturar = false;
  abonoGlobalData.usarFechaPersonalizada = false;
  abonoGlobalData.fechaFactura = null;
  selectedTimbresOrganizationGlobal.value = null;
  errors.value = [];
  nextTick(() => montoGlobalRef.value?.focus());
}

function abrirHistorialAbonos() {
  openHistorialAbonos.value = true;
  filtroAbonosSeleccionado.value = null;
}

function cargarAbonosHistorial(page = 1) {
  processRequest(async () => {
    const params = {
      page,
      per_page: 15,
    };
    if (filtroAbonosSeleccionado.value) {
      params.filtro = filtroAbonosSeleccionado.value;
    }
    const response = await Creditos.getAbonosHistorial(creditoId.value, params);
    abonosHistorial.value = response.data.data;
    totalAbonosHistorial.value = response.data.total;
  }, loadingHistorial, {});
}

function onUpdateAbonosHistorial({ page }) {
  cargarAbonosHistorial(page);
}

function abrirFacturarAbono(abono) {
  abonoAmount.value = abono.abono;
  selectedAbono.value = abono.id;
  facturarAbonoData.forma_pago = "01";
  facturarAbonoData.usarFechaPersonalizada = false;
  facturarAbonoData.fechaFactura = null;
  errors.value = [];
  facturarAbonoModal.value = true;
}

function abrirEmailModal() {
  if (!selectedDeuda.value?.ventaticket?.id) {
    notify.warning("No se encontró el ticket para enviar por correo");
    return;
  }
  isEmailOpen.value = true;
}

async function sendEmail(localEmailData) {
  try {
    cargando.value = true;
    const ticketId = selectedDeuda.value?.ventaticket?.id;
    if (!ticketId) {
      notify.warning("No se encontró el ticket para enviar por correo");
      return;
    }
    const { data } = await PuntoVenta.sendEmail(ticketId, localEmailData);
    isEmailOpen.value = false;
    notify.success(data.message);
  } catch (error) {
    errors.value = error.response?.data?.errors || [];
  } finally {
    cargando.value = false;
  }
}

function realizarAbono() {
  if (postData.facturar && !selectedDeuda.value?.ventaticket?.facturado_en) {
    notify.warning("Solo se puede facturar el abono cuando el ticket ya fue facturado");
    postData.facturar = false;
    return;
  }

  if (+postData.cantidad > +selectedDeuda.value?.saldo) {
    notify.warning("La cantidad es mayor a la deuda");
    return;
  }
  processRequest(async () => {
    const payload = {
      ...postData,
      timbres_organization_id: selectedTimbresOrganization.value,
    };
    if (payload.fechaFactura) {
      const fecha = new Date(payload.fechaFactura);
      payload.fechaFactura = fecha.toISOString().split("T")[0];
    }
    await Creditos.realizarAbono(selectedDeuda.value?.id, payload);
    if (printWhenFinalize.value) {
      imprimirVenta(selectedDeuda.value);
    }
    openAbono.value = false;
    selectedDeuda.value = null;
    selectedTimbresOrganization.value = null;
    search.value = String(Date.now());
  }, loading, {
    onSuccess: () => notify.success("Abono realizado correctamente"),
    errorsRef: errors,
  });
}

function realizarAbonoGlobal() {
  if (!abonoGlobalData.montoGlobal || +abonoGlobalData.montoGlobal <= 0) {
    notify.warning("El monto del abono debe ser mayor a 0");
    return;
  }

  const availableBalance = abonoGlobalData.facturar
    ? +saldoGlobalFacturable.value
    : +saldoGlobal.value;

  if (+abonoGlobalData.montoGlobal > availableBalance) {
    notify.warning(
      abonoGlobalData.facturar
        ? "El monto del abono es mayor al saldo facturable del cliente"
        : "El monto del abono es mayor al saldo global pendiente del cliente"
    );
    return;
  }
  processRequest(async () => {
    const payload = {
      cliente_id: creditoId.value,
      monto_global: abonoGlobalData.montoGlobal,
      comments: abonoGlobalData.comments,
      forma_pago: abonoGlobalData.forma_pago,
      facturar: abonoGlobalData.facturar,
      timbres_organization_id: selectedTimbresOrganizationGlobal.value,
      usarFechaPersonalizada: abonoGlobalData.usarFechaPersonalizada,
    };
    if (abonoGlobalData.facturar && abonoGlobalData.usarFechaPersonalizada && abonoGlobalData.fechaFactura) {
      const fecha = new Date(abonoGlobalData.fechaFactura);
      payload.fechaFactura = fecha.toISOString().split("T")[0];
    }
    const response = await Creditos.realizarAbonoGlobal(payload);
    const createdAbonos = response.data?.abonos?.length ?? 0;
    const noDistribuido = response.data?.montoNoDistribuido ?? 0;
    openAbonoGlobal.value = false;
    abonoGlobalData.montoGlobal = 0;
    abonoGlobalData.comments = "";
    abonoGlobalData.forma_pago = "01";
    abonoGlobalData.facturar = false;
    abonoGlobalData.usarFechaPersonalizada = false;
    abonoGlobalData.fechaFactura = null;
    selectedTimbresOrganizationGlobal.value = null;
    search.value = String(Date.now());
    let msg = response.data?.message ?? `Abono global realizado. Se crearon ${createdAbonos} abono(s)`;
    if (response.data?.message) {
      msg += `. Se distribuyó en ${createdAbonos} abono(s)`;
    }
    if (noDistribuido > 0) {
      msg += `. Monto no distribuido: $${formatNumber(noDistribuido)}`;
    }
    notify.success(msg);
  }, loading, {
    errorsRef: errors,
  });
}

async function facturarAbono() {
  await processRequest(async () => {
    const payload = {
      forma_pago: facturarAbonoData.forma_pago,
      timbres_organization_id: selectedTimbresOrganizationAbono.value,
    };
    if (facturarAbonoData.fechaFactura) {
      const fecha = new Date(facturarAbonoData.fechaFactura);
      payload.fechaFactura = fecha.toISOString().split("T")[0];
      payload.usarFechaPersonalizada = facturarAbonoData.usarFechaPersonalizada;
    }
    await Creditos.facturarAbono(selectedAbono.value, payload);
    facturarAbonoModal.value = false;
    openAbonos.value = false;
    selectedDeuda.value = null;
    selectedTimbresOrganizationAbono.value = null;
    facturarAbonoData.forma_pago = "01";
    facturarAbonoData.usarFechaPersonalizada = false;
    facturarAbonoData.fechaFactura = null;
    search.value = String(Date.now());
  }, loading, {
    onSuccess: () => notify.success("Abono facturado correctamente"),
    errorsRef: errors,
  });
}

function onWatchPdf(abono) {
  processRequest(async () => {
    const response = await Creditos.downloadPdf(abono.id);
    const file = new Blob([response.data], { type: response.headers["content-type"] });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  }, loading, {});
}

function onDownloadPdf(abono) {
  processRequest(async () => {
    const response = await Creditos.downloadPdf(abono.id);
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.value}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, loading, {});
}

function onDownloadXml(abono) {
  processRequest(async () => {
    const response = await Creditos.downloadXml(abono.id);
    const blob = new Blob([response.data], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.value}.xml`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, loading, {});
}

function onRegenerarPdf(abono) {
  processRequest(async () => {
    await Creditos.regenerarPdf(abono.id);
    notify.success("PDF regenerado correctamente");
  }, loading, {});
}

function abrirCancelarAbonoModal(abono) {
  if (abono.cancelado_en) {
    notify.warning("Este abono ya ha sido cancelado");
    return;
  }
  abonoACancelar.value = abono;
  motivoCancelacion.value = "";
  errors.value = [];
  openCancelarAbonoModal.value = true;
}

async function cancelarAbono() {
  if (!motivoCancelacion.value.trim()) {
    notify.warning("El motivo de cancelación es obligatorio");
    return;
  }
  await processRequest(async () => {
    await Creditos.cancelarAbono(abonoACancelar.value.id, {
      motivo: motivoCancelacion.value,
    });
    openCancelarAbonoModal.value = false;
    motivoCancelacion.value = "";
    abonoACancelar.value = null;
    search.value = String(Date.now());
    getAbonos(selectedDeuda.value.id);
  }, loading, {
    onSuccess: () => notify.success("Abono cancelado correctamente"),
    errorsRef: errors,
  });
}

onMounted(() => {
  creditoId.value = route.params.creditoId;
  filtroConsecutivo.value = route.query.ticketId || "";
  const showSettledParam = route.query.show_settled_loan;
  show_settled_loan.value = showSettledParam === "1" || showSettledParam === "true" || showSettledParam === true;
  search.value = String(Date.now());
  getClienteInfo();
});
</script>

<style></style>
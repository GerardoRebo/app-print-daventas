<template>
  <v-card class="mb-2" v-if="mdAndUp">
    <v-card-title>Ticket venta folio # {{ ticketActual?.consecutivo }}</v-card-title>
    <v-card-text v-if="!ticketActual.esta_abierto">
      <router-link :to="{ name: 'VentasIndex' }">
        <span class="text-decoration-underline text-caption">
          Regresar al historial de ventas
        </span>
      </router-link>
      <v-row dense class="mt-2">
        <v-btn size="small" @click="abrirDialogoClonacion" class="mx-2" prepend-icon="mdi-content-copy" variant="tonal" color="primary"></v-btn>
        <v-btn size="small" @click="verFormasDePago" class="mx-2" prepend-icon="mdi-wallet">Formas de pago</v-btn>
        <v-btn size="small" @click="imprimirVenta" class="mx-2" prepend-icon="mdi-printer-pos">Reimprimir</v-btn>
        <v-btn size="small" v-if="!ticketActual.esta_cancelado && !devuelto" @click="cancelarVenta" class="mx-2" prepend-icon="mdi-cancel">Cancelar</v-btn>
        <v-btn size="small" v-if="!ticketActual.esta_cancelado && !devuelto && !ticketActual.facturado_en && !ticketActual.clienteId & !ticketActual.latest_pre_factura?.facturado_en" @click="abrirCliente" class="mx-2" prepend-icon="mdi-account-multiple">Clientes</v-btn>
        <v-btn size="small" v-if="!ticketActual.esta_cancelado && !devuelto && !ticketActual.facturado_en && !ticketActual.latest_pre_factura?.facturado_en" @click="isFacturaInfoOpen = true" class="mx-2" color="primary" variant="elevated" prepend-icon="mdi-check">Facturar</v-btn>
        <template v-else-if="!ticketActual.esta_cancelado && ticketActual?.facturado_en">
          <v-menu class="">
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
                <v-list-item-title>Ver PDF</v-list-item-title>
              </v-list-item>
              <v-list-item @click="isEmailOpen = true">
                <template v-slot:prepend>
                  <v-icon icon="mdi-email"></v-icon>
                </template>
                <v-list-item-title>Enviar por correo</v-list-item-title>
              </v-list-item>
              <v-list-item @click="descargarPdf()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-pdf-box"></v-icon>
                </template>
                <v-list-item-title>Descarga PDF</v-list-item-title>
              </v-list-item>
              <v-list-item @click="descargarXml()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-xml"></v-icon>
                </template>
                <v-list-item-title>Descarga XML</v-list-item-title>
              </v-list-item>
              <v-list-item @click="regenerarPdf()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-sync"></v-icon>
                </template>
                <v-list-item-title>Regenerar PDF</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <div v-if="!(ticketActual.cfdi_cancellation_status == 'Cancelado')">
            <v-btn @click="isCancelarFacturaOpen = true" size="small" class="ml-2" prepend-icon="mdi-cancel" :loading="cargando" color="warning">
              Cancelar Factura
            </v-btn>
          </div>
          <div v-else-if="ticketActual.cfdi_cancellation_status == 'PENDING'">
            <p class="mx-2 text-warning">Cancelación de factura en proceso...</p>
          </div>
          <div v-else-if="ticketActual.cfdi_cancellation_status == 'CANCELED'">
            <p class="mx-2 text-success">Factura cancelada correctamente.</p>
          </div>
          <v-btn @click="verificarEstadoCancelacion" size="small" class="ml-2" prepend-icon="mdi-progress-check" :loading="cargando">
            Verificar estado de cancelación
          </v-btn>
          <p v-if="ticketActual.facturado_en" class="mx-2">
            Facturado en:
            <strong>{{ moment(ticketActual.facturado_en).format("DD-MM-YYYY h:mma") }}</strong>
          </p>
        </template>
        <template v-if="ticketActual?.latest_pre_factura?.pre_factura_global_id">
          <p class="mx-2">
            Facturado en:
            <strong>{{ moment(ticketActual.latest_pre_factura.facturado_en).format("DD-MM-YYYY h:mma") }}</strong>
          </p>
          <p class="mx-2">
            Factura global:
            <strong><router-link :to="{ name: 'FacturasGlobalesShow', params: { facturaId: ticketActual.latest_pre_factura.pre_factura_global_id } }">
              {{ ticketActual.latest_pre_factura.pre_factura_global_id }}
            </router-link></strong>
          </p>
        </template>
        <div class="mx-2">
          <p v-if="ticketActual.cfdi_cancellation_status">Estado CFDI: <strong>{{ ticketActual.cfdi_cancellation_status ?? '' }}</strong></p>
          <p>Timbres Disponibles: <strong>{{ saldo ?? 0 }}</strong></p>
          <p>Almacén: <strong>{{ ticketActual?.almacen?.name }}</strong></p>
          <p>Cliente: <strong>{{ ticketActual?.cliente?.name }}</strong></p>
        </div>
        <div>
          <p>Subtotal: <strong>${{ formatNumber(ticketActual.subtotal) }}</strong></p>
          <p>Descuento: <strong>${{ formatNumber(ticketActual.descuento) }}</strong></p>
          <p>Impuesto Retenido: <strong>${{ formatNumber(ticketActual.impuesto_retenido) }}</strong></p>
          <p>Impuesto Trasladado: <strong>${{ formatNumber(ticketActual.impuesto_traslado) }}</strong></p>
          <p>Total: <strong>${{ formatNumber(ticketActual.total) }}</strong></p>
        </div>
        <p class="mx-4 text-error" v-if="ticketActual.total_devuelto > 0">
          Total Devuelto: <strong>${{ formatNumber(ticketActual.total_devuelto) }}</strong>
        </p>
        <p class="mx-4">
          Pagado en: <strong>{{ moment(ticketActual.pagado_en).format("DD-MM-YYYY h:mma") }}</strong>
        </p>
        <p v-if="ticketActual.deuda" @click="abrirCreditos()" class="mx-4 text-primary text-decoration-underline cursor-pointer">
          Abrir creditos de cliente
        </p>
        <p v-if="ticketActual.esta_cancelado" class="mx-4 text-error">Cancelada</p>
      </v-row>
    </v-card-text>
    <v-card-text v-else>
      <p class="text-warning">
        Esta venta aún está abierta.
        <router-link :to="{ name: 'PuntoVenta' }">
          <span class="text-decoration-underline text-caption">Ir al punto de venta</span>
        </router-link>
      </p>
    </v-card-text>
  </v-card>

  <v-card class="mb-2" v-if="smAndDown">
    <v-card-title>Venta # {{ ticketActual?.id }}</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12">
          <router-link :to="{ name: 'VentasIndex' }">
            <span class="text-decoration-underline text-caption">Regresar al historial de ventas</span>
          </router-link>
        </v-col>
        <v-col cols="12">
          <v-spacer></v-spacer>
          <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down" @click="drawer = true">
            Detalles
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary v-if="mdAndDown">
    <v-card>
      <v-container>
        <v-row dense class="m2-4">
          <v-btn size="small" prepend-icon="mdi-printer" @click="imprimirVenta" class="my-1" block>Reimprimir</v-btn>
          <v-btn size="small" prepend-icon="mdi-content-copy" @click="abrirDialogoClonacion" class="my-1" block>Usar como plantilla</v-btn>
          <v-btn size="small" v-if="!ticketActual.esta_cancelado && !devuelto" @click="cancelarVenta" prepend-icon="mdi-cancel" class="my-1" block>Cancelar</v-btn>
          <v-btn size="small" v-if="!ticketActual.esta_cancelado && !devuelto && !ticketActual.facturado_en && !ticketActual.clienteId & !ticketActual.latest_pre_factura?.facturado_en" @click="abrirCliente" class="my-1" block>Clientes</v-btn>
          <v-btn size="small" v-if="!ticketActual.esta_cancelado && !devuelto && !ticketActual.facturado_en && !ticketActual.latest_pre_factura?.facturado_en" @click="isFacturaInfoOpen = true" prepend-icon="mdi-invoice" class="my-1" color="primary" variant="elevated" block>Facturar</v-btn>
          <template v-else-if="!ticketActual.esta_cancelado">
            <v-menu transition="scale-transition" size="small">
              <template v-slot:activator="{ props }">
                <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small" block class="my-1">Factura</v-btn>
              </template>
              <v-list>
                <v-list-item @click="onWatchPdf()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-eye"></v-icon>
                  </template>
                  <v-list-item-title>Ver PDF</v-list-item-title>
                </v-list-item>
                <v-list-item @click="isEmailOpen = true">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-email"></v-icon>
                  </template>
                  <v-list-item-title>Enviar por correo</v-list-item-title>
                </v-list-item>
                <v-list-item @click="descargarPdf()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-file-pdf-box"></v-icon>
                  </template>
                  <v-list-item-title>Descarga PDF</v-list-item-title>
                </v-list-item>
                <v-list-item @click="descargarXml()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-xml"></v-icon>
                  </template>
                  <v-list-item-title>Descarga XML</v-list-item-title>
                </v-list-item>
                <v-list-item @click="regenerarPdf()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-sync"></v-icon>
                  </template>
                  <v-list-item-title>Regenerar PDF</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <p v-if="ticketActual.facturado_en" class="my-1">Facturado en: {{ moment(ticketActual.facturado_en).format("DD-MM-YYYY h:mma") }}</p>
            <p v-else="ticketActual.facturado_en" class="my-1">Facturado en: {{ moment(ticketActual.latest_pre_factura.facturado_en).format("DD-MM-YYYY h:mma") }}</p>
            <p v-if="ticketActual.latest_pre_factura.facturado_en" class="">
              Factura global:
              <router-link :to="{ name: 'FacturasGlobalesShow', params: { facturaId: ticketActual?.latest_pre_factura?.pre_factura_global_id ?? 1 } }">
                {{ ticketActual.latest_pre_factura.pre_factura_global_id }}
              </router-link>
            </p>
          </template>
          <div>
            <p>Timbres Disponibles: {{ saldo ?? 0 }}</p>
            <p>Almacén: {{ ticketActual?.almacen?.name }}</p>
            <p>Cliente: {{ ticketActual?.cliente?.name }}</p>
            <p>Subtotal: ${{ formatNumber(ticketActual.subtotal) }}</p>
            <p>Descuento: ${{ formatNumber(ticketActual.descuento) }}</p>
            <p>Impuesto Retenido: ${{ formatNumber(ticketActual.impuesto_retenido) }}</p>
            <p>Impuesto Trasladado: ${{ formatNumber(ticketActual.impuesto_traslado) }}</p>
            <p>Total: ${{ formatNumber(ticketActual.total) }}</p>
            <p class="text-error" v-if="ticketActual.total_devuelto > 0">Total Devuelto: ${{ formatNumber(ticketActual.total_devuelto) }}</p>
            <p>Pagado en: {{ moment(ticketActual.pagado_en).format("DD-MM-YYYY h:mma") }}</p>
            <p v-if="ticketActual.esta_cancelado" class="text-error">Cancelada</p>
          </div>
        </v-row>
      </v-container>
    </v-card>
  </v-navigation-drawer>

  <v-progress-linear color="primary" indeterminate v-if="cargando" class="mb-4"></v-progress-linear>
  <v-container fluid>
    <template v-if="loadingInitial">
      <v-skeleton-loader type="table" />
    </template>
    <template v-else>
      <v-data-table :headers="tHeaders" :items="articulos" dense>
        <template v-slot:item.product_name="{ item }">
          <router-link :to="{ name: 'ProductosIndex', query: { keyword: item.product_name ?? item.product.name } }">
            <span class="text-primary text-decoration-underline cursor-pointer font-weight-medium">{{ item.product_name ?? item.product?.name }}</span>
          </router-link>
        </template>
        <template v-slot:item.codigo="{ item }">
          <span class="text-caption cursor-pointer select-none px-2 py-1 rounded hover:bg-primary hover:bg-opacity-10 transition-colors" @click="copiarCodigo(item.product.codigo)" :title="`Click para copiar: ${item.product.codigo}`">
            <v-icon size="x-small" class="mr-1">mdi-content-copy</v-icon>
            {{ item.product.codigo }}
          </span>
        </template>
        <template v-slot:item.precio_usado="{ item }">
          <span>${{ formatNumber(item.precio_usado) }}</span>
        </template>
        <template v-slot:item.precio_final="{ item }">
          <span><strong> ${{ formatNumber(item.precio_final) }} </strong></span>
        </template>
        <template v-slot:item.fue_devuelto="{ item }">
          <span>{{ item.fue_devuelto ? "Si" : "No" }}</span>
        </template>
        <template v-slot:item.importe_descuento="{ item }">
          <span>{{ formatNumber(item.importe_descuento) }}</span>
        </template>
        <template v-slot:item.impuesto_traslado="{ item }">
          <span>{{ formatNumber(item.impuesto_traslado) }}</span>
        </template>
        <template v-slot:item.impuesto_retenido="{ item }">
          <span>{{ formatNumber(item.impuesto_retenido) }}</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-tooltip text="Apto para ser timbrado en CFDI" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-if="item?.product?.es_apto_para_cfdi" v-bind="props" size="x-small" color="success" class="opacity-70">mdi-circle-medium</v-icon>
              <v-icon v-else v-bind="props" size="x-small" color="" class="opacity-10">mdi-circle-medium</v-icon>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </template>
  </v-container>

  <ClientSelectionDialog :model-value="openCliente" :clients="clients" :keyword="keycliente" :loading="cargando" @update:model-value="openCliente = $event" @update:keyword="keycliente = $event" @client-selected="setClienteWrapper" />

  <FacturaInfoModal
    v-model="isFacturaInfoOpen"
    :ticket-actual="ticketActual"
    :errors="errors"
    :errores-relacionadas="erroresRelacionadas"
    :field-error-count="fieldErrorCount"
    :is-contador="s.isContador"
    :contador-organizations="s.contadorOrganizations"
    :selected-timbres-organization="selectedTimbresOrganization"
    @update:selected-timbres-organization="selectedTimbresOrganization = $event"
    :active-organization-name="activeOrganizationName"
    :saldo="saldo"
    :saldos="saldos"
    :cargando="cargando"
    @update:es_publico_en_general="ticketActual.es_publico_en_general = $event"
    @update:nombre_receptor="ticketActual.nombre_receptor = $event"
    @update:serie="ticketActual.serie = $event"
    @update:metodo_pago="ticketActual.metodo_pago = $event"
    @update:forma_pago="ticketActual.forma_pago = $event"
    @update:uso_cfdi="ticketActual.uso_cfdi = $event"
    @update:clave_privada_local="ticketActual.clave_privada_local = $event"
    @update:usarFechaPersonalizada="ticketActual.usarFechaPersonalizada = $event"
    @update:fechaFactura="ticketActual.fechaFactura = $event"
    @update:relacion-tipo="ticketActual.facturasRelacionadas[$event.index].tipo = $event.value"
    @update:relacion-folio="ticketActual.facturasRelacionadas[$event.index].folio = $event.value"
    @update:observaciones="ticketActual.observaciones = $event"
    @agregar-relacion="agregarRelacion"
    @eliminar-relacion="eliminarRelacion"
    @vista-previa="vistaPrevia"
    @vista-previa-xml="vistaPreviaXml"
    @facturar="facturar"
  />

  <v-dialog v-model="isFormasDePagoOpen" max-width="600">
    <v-card>
      <v-card-title>Formas de pago</v-card-title>
      <v-card-text>
        <p>Efectivo: ${{ formatNumber(ticketActual.fp_efectivo) }} {{ ticketActual.fp_efectivo_ref }}</p>
        <v-divider></v-divider>
        <p>Transferencia: ${{ formatNumber(ticketActual.fp_transferencia) }} {{ ticketActual.fp_transferencia_ref }}</p>
        <v-divider></v-divider>
        <p>Tarjeta Débito: ${{ formatNumber(ticketActual.fp_tarjeta_debito) }} {{ ticketActual.fp_tarjeta_debito_ref }}</p>
        <v-divider></v-divider>
        <p>Tarjeta Crédito: ${{ formatNumber(ticketActual.fp_tarjeta_credito) }} {{ ticketActual.fp_tarjeta_credito_ref }}</p>
        <v-divider></v-divider>
        <p>Cheque: ${{ formatNumber(ticketActual.fp_cheque) }} {{ ticketActual.fp_cheque_ref }}</p>
        <v-divider></v-divider>
        <p>Vales de despensa: ${{ formatNumber(ticketActual.fp_vales_de_despensa) }} {{ ticketActual.fp_vales_de_despensa_ref }}</p>
        <v-divider></v-divider>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isFormasDePagoOpen = false" variant="text" :loading="cargando">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <CfdiCancelacionDialog :model-value="isCancelarFacturaOpen" :loading="cargando" @update:model-value="isCancelarFacturaOpen = $event" @cancelar="cancelarFactura" />

  <v-dialog v-model="isCloneDialogOpen" max-width="600">
    <v-card>
      <v-card-title>Usar esta venta como plantilla</v-card-title>
      <v-card-subtitle>Crea una cotización basada en los productos y cantidades de esta venta.</v-card-subtitle>
      <v-card-text>
        <v-form>
          <v-select v-model="cloneData.almacenId" label="Almacén" :items="s.myAlmacens" item-value="id" item-title="name" variant="outlined" density="compact" class="mb-4"></v-select>
          <v-select v-model="cloneData.clienteId" label="Cliente (opcional)" :items="clients" item-value="id" item-title="name" variant="outlined" density="compact" clearable class="mb-4">
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:title>{{ item.raw.name }}</template>
                <template v-slot:subtitle>{{ item.raw.telefono }}</template>
              </v-list-item>
            </template>
          </v-select>
          <v-alert type="info" density="compact" class="mb-4">
            Se creará una cotización usando los productos de esta venta con los precios actuales del almacén seleccionado.
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="isCloneDialogOpen = false" variant="text">Cancelar</v-btn>
        <v-btn @click="crearCotizacionDesdeVenta" color="primary" variant="elevated" :disabled="!cloneData.almacenId" :loading="cargando">
          Crear Cotización
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <EmailFacturaModal v-model="isEmailOpen" :email-data="emailData" :loading="cargando" :errors="errors" @send="sendEmail" />
</template>

<script setup>
import {
  onMounted,
  onUnmounted,
  ref,
  watch,
  computed,
  nextTick,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment-timezone";
import { vMaska } from "maska/vue";
import { useDisplay } from "vuetify";
import Organizacion from "@js/apis/Organizacion";
import PuntoVenta from "../../apis/PuntoVenta";
import DocumentTemplate from "../../apis/DocumentTemplate";
import Cliente from "../../apis/Cliente";
import Almacen from "@js/apis/Almacen";
import { useUserStore } from "../../s";
import { useCurrency } from "@js/composables/useCurrency";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";
import ClientSelectionDialog from "@js/components/ClientSelectionDialog.vue";
import EmailFacturaModal from "@js/components/Facturacion/EmailFacturaModal.vue";
import CfdiCancelacionDialog from "@js/components/Facturacion/CfdiCancelacionDialog.vue";
import FacturaInfoModal from "@js/components/Facturacion/FacturaInfoModal.vue";

const { formatNumber } = useCurrency("es-MX", "MXN");
const s = useUserStore();
const { processRequest } = useProcessRequest();
const { notify } = useNotification();
const { mdAndUp, mdAndDown, smAndDown } = useDisplay();
const route = useRoute();
const router = useRouter();

const keycliente = ref("");
const clients = ref([]);
const ventaId = ref(null);
const isEmailOpen = ref(false);
const isFacturaInfoOpen = ref(false);
const isFormasDePagoOpen = ref(false);
const isCancelarFacturaOpen = ref(false);
const isCloneDialogOpen = ref(false);
const cloneData = ref({ almacenId: null, clienteId: null });
const cargando = ref(false);
const errors = ref([]);
const erroresRelacionadas = ref([]);
const openCliente = ref(false);
const loadingInitial = ref(true);
const drawer = ref(false);
const saldos = ref(null);
const saldo = ref(null);
const selectedTimbresOrganization = ref(null);

const tHeaders = ref([
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "product_name", align: "start", sortable: false },
  { title: "Cantidad", key: "cantidad", align: "start", sortable: false },
  { title: "Precio", key: "precio_usado", align: "start", sortable: false },
  { title: "Importe", key: "precio_final", align: "start", sortable: false },
  { title: "Descuento", key: "importe_descuento", align: "start", sortable: false },
  { title: "Impuesto T", key: "impuesto_traslado", align: "start", sortable: false },
  { title: "Impuesto R", key: "impuesto_retenido", align: "start", sortable: false },
  { title: "Existencia", key: "cantidad_actual", align: "start", sortable: false },
  { title: "Cantidad devuelta", key: "cantidad_devuelta", sortable: false },
  { title: "Devolución", key: "fue_devuelto", sortable: false },
  { title: "", key: "actions", sortable: false },
]);
const emailData = ref({ fromEmail: "", fromName: "", toName: "", toEmail: "" });
const ticketActual = ref({});
const articulos = ref([]);

watch(keycliente, () => {
  getAllClientes();
});

watch(ventaId, async () => {
  if (!ventaId.value) {
    return;
  }
  await getSpecificVT(ventaId.value);
  loadingInitial.value = false;
});

watch(isFacturaInfoOpen, (newVal) => {
  if (!newVal) {
    return;
  }
  if (ticketActual.value.forma_de_pago == "C") {
    ticketActual.value.forma_pago = "99";
    ticketActual.value.metodo_pago = "PPD";
    ticketActual.value.uso_cfdi = "G01";
  } else {
    ticketActual.value.forma_pago = "01";
    ticketActual.value.metodo_pago = "PUE";
    ticketActual.value.uso_cfdi = "G01";
  }
});

watch(() => ticketActual.value.es_publico_en_general, (newVal) => {
  if (newVal) {
    ticketActual.value.uso_cfdi = "S01";
    ticketActual.value.metodo_pago = "PUE";
    ticketActual.value.nombre_receptor = "PUBLICO EN GENERAL";
  }
});

const devuelto = computed(() => articulos.value.some((articulo) => articulo.fue_devuelto == 1));
const fileName = computed(() => `${ticketActual.value.cliente?.rfc ?? "General"}-${ticketActual.value.consecutivo}-${moment(ticketActual.value.pagado_en).format("YYYYMMDD")}`);
const fieldErrorCount = computed(() => Object.keys(errors.value).length);
const activeOrganizationName = computed(() => s.authuser?.organization?.name || "");

function abrirCliente() {
  openCliente.value = true;
  nextTick(() => document.getElementById("keycliente")?.select());
  getAllClientes();
}

function descargarPdf() {
  processRequest(async () => {
    const response = await PuntoVenta.descargarPdf(ventaId.value);
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.value}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, cargando, {});
}

function descargarXml() {
  processRequest(async () => {
    const response = await PuntoVenta.descargarXml(ventaId.value);
    const blob = new Blob([response.data], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.value}.xml`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, cargando, {});
}

function regenerarPdf() {
  processRequest(async () => {
    await PuntoVenta.regenerarPdf(ventaId.value);
    notify.success("PDF regenerado correctamente");
  }, cargando, {});
}

function onWatchPdf() {
  processRequest(async () => {
    const response = await PuntoVenta.descargarPdf(ventaId.value);
    const file = new Blob([response.data], { type: response.headers["content-type"] });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  }, cargando, {});
}

function getAllClientes() {
  processRequest(async () => {
    const response = await Cliente.getAllClientes(keycliente.value);
    clients.value = response.data;
  }, cargando, {});
}

function setClienteWrapper(cliente) {
  processRequest(async () => {
    const response = await Cliente.setCliente(cliente, ticketActual.value.id);
    if (response.data?.success && response.data?.retentionRules?.length) {
      if (confirm("Se aplicaran las siguientes reglas de retencion: " + response.data.retentionRules) == true) {
        cargando.value = false;
        await acceptRetentionRules();
        return;
      }
    }
    cargando.value = false;
    await getSpecificVT(ticketActual.value.id);
    openCliente.value = false;
  }, cargando, {
    onSuccess: () => notify.success("Cliente asignado"),
  });
}

function acceptRetentionRules() {
  processRequest(async () => {
    await PuntoVenta.acceptRetentionRules(ticketActual.value.id);
    getSpecificVT(ticketActual.value.id);
    openCliente.value = false;
  }, cargando, {
    onSuccess: () => notify.success("Reglas de retención aceptadas"),
  });
}

function onEscape(e) {
  if (e.key === "F4") {
  }
}

async function cancelarFactura(datoCancelacion) {
  try {
    cargando.value = true;
    const { data } = await PuntoVenta.cancelarFactura(ticketActual.value.id, datoCancelacion);
    if (data.status) {
      notify.success(`Factura cancelada correctamente. Estado: ${data.status}`);
    }
    isCancelarFacturaOpen.value = false;
    getSpecificVT(ticketActual.value.id);
  } catch (error) {
    notify.error(error.response?.data?.message || "Error al cancelar la factura");
  } finally {
    cargando.value = false;
  }
}

async function sendEmail(localEmailData) {
  try {
    cargando.value = true;
    const { data } = await PuntoVenta.sendEmail(ticketActual.value.id, localEmailData);
    isEmailOpen.value = false;
    notify.success(data.message);
  } catch (error) {
    errors.value = error.response?.data?.errors || [];
  } finally {
    cargando.value = false;
  }
}

async function verificarEstadoCancelacion() {
  try {
    cargando.value = true;
    const { data } = await PuntoVenta.verificarEstadoCancelacion(ticketActual.value.id);
    if (data.status) {
      alert(JSON.stringify(data.status, null, 2));
    }
    getSpecificVT(ticketActual.value.id);
  } catch (error) {
    console.log(error);
  } finally {
    cargando.value = false;
  }
}

async function getSpecificVT(ventaticket) {
  try {
    const { data } = await PuntoVenta.getSpecificVT(ventaticket, true);
    ticketActual.value = data[0];
    articulos.value = data[1];
    emailData.value.fromName = ticketActual.value.organization?.name ?? ticketActual.value.almacen?.name;
    emailData.value.fromEmail = ticketActual.value.organization?.email ?? ticketActual.value.almacen?.email;
    emailData.value.toEmail = ticketActual.value.cliente?.email;
    emailData.value.toName = ticketActual.value.cliente?.name;
    const { data: newData } = await Organizacion.getFoliosSaldo();
    saldo.value = newData?.saldo;
    saldos.value = newData?.saldos;
  } catch (error) {
    alert("Ha ocurrido un error");
  }
}

function verFormasDePago() {
  isFormasDePagoOpen.value = true;
}

function imprimirVenta() {
  if (window.__TAURI__) {
    new WebviewWindow("ImprimirVentas", {
      url: `ventatickets/imprimir/${ventaId.id}`,
      title: "Imprimir Venta",
    });
    return;
  }
  window.open(`${import.meta.env.VITE_APP_URL}/ventatickets/imprimir/${ventaId.value}`, "_blank", "noreferrer");
}

function cancelarVenta() {
  if (!confirm("Estas seguro de cancelar esta venta?")) {
    return;
  }
  processRequest(async () => {
    await PuntoVenta.cancelarVenta(ticketActual.value.id);
    getSpecificVT(ticketActual.value.id);
  }, cargando, {
    onError: () => notify.error("Ha ocurrido un error"),
  });
}

const validarFacturasRelacionadas = () => {
  if (!Array.isArray(ticketActual.value.facturasRelacionadas)) return true;
  let errores = 0;
  ticketActual.value.facturasRelacionadas.forEach((relacion) => {
    if (!relacion.tipo || !relacion.folio) {
      errores++;
    }
  });
  erroresRelacionadas.value = errores;
  return errores === 0;
};

function facturar() {
  if (!validarFacturasRelacionadas()) {
    return;
  }
  processRequest(async () => {
    const payload = {
      forma_pago: ticketActual.value.forma_pago,
      metodo_pago: ticketActual.value.metodo_pago,
      uso_cfdi: ticketActual.value.uso_cfdi,
      serie: ticketActual.value.serie,
      clave_privada_local: ticketActual.value.clave_privada_local,
      publico_en_general: ticketActual.value.es_publico_en_general ?? false,
      nombre_receptor: ticketActual.value.nombre_receptor,
      observaciones: ticketActual.value.observaciones,
      facturas_relacionadas: ticketActual.value.facturasRelacionadas,
      timbres_organization_id: selectedTimbresOrganization.value,
      usarFechaPersonalizada: ticketActual.value.usarFechaPersonalizada ?? false,
    };
    if (payload.usarFechaPersonalizada && ticketActual.value.fechaFactura) {
      const fecha = new Date(ticketActual.value.fechaFactura);
      payload.fechaFactura = fecha.toISOString().split("T")[0];
    }
    await PuntoVenta.facturar(ticketActual.value.id, payload);
    isFacturaInfoOpen.value = false;
    getSpecificVT(ventaId.value);
  }, cargando, {
    errorsRef: errors,
    onSuccess: () => notify.success("Factura generada correctamente"),
  });
}

function vistaPrevia() {
  if (!validarFacturasRelacionadas()) {
    return;
  }
  processRequest(async () => {
    const payload = {
      forma_pago: ticketActual.value.forma_pago,
      metodo_pago: ticketActual.value.metodo_pago,
      uso_cfdi: ticketActual.value.uso_cfdi,
      serie: ticketActual.value.serie,
      clave_privada_local: ticketActual.value.clave_privada_local,
      publico_en_general: ticketActual.value.es_publico_en_general ?? false,
      nombre_receptor: ticketActual.value.nombre_receptor,
      observaciones: ticketActual.value.observaciones,
      facturas_relacionadas: ticketActual.value.facturasRelacionadas,
      timbres_organization_id: selectedTimbresOrganization.value,
      usarFechaPersonalizada: ticketActual.value.usarFechaPersonalizada ?? false,
    };
    if (payload.usarFechaPersonalizada && ticketActual.value.fechaFactura) {
      const fecha = new Date(ticketActual.value.fechaFactura);
      payload.fechaFactura = fecha.toISOString().split("T")[0];
    }
    const response = await PuntoVenta.facturaVistaPrevia(ticketActual.value.id, payload);
    const file = new Blob([response.data], { type: response.headers["content-type"] });
    const fileURL = URL.createObjectURL(file);
    console.log(fileURL, 'bloc');
    window.open(fileURL);
  }, cargando, {
    onSuccess: () => notify.success("Vista previa generada correctamente"),
    errorsRef: errors,
  });
}

function vistaPreviaXml() {
  if (!validarFacturasRelacionadas()) {
    return;
  }
  processRequest(async () => {
    const payload = {
      forma_pago: ticketActual.value.forma_pago,
      metodo_pago: ticketActual.value.metodo_pago,
      uso_cfdi: ticketActual.value.uso_cfdi,
      serie: ticketActual.value.serie,
      clave_privada_local: ticketActual.value.clave_privada_local,
      publico_en_general: ticketActual.value.es_publico_en_general ?? false,
      nombre_receptor: ticketActual.value.nombre_receptor,
      observaciones: ticketActual.value.observaciones,
      facturas_relacionadas: ticketActual.value.facturasRelacionadas,
      timbres_organization_id: selectedTimbresOrganization.value,
      usarFechaPersonalizada: ticketActual.value.usarFechaPersonalizada ?? false,
    };
    if (payload.usarFechaPersonalizada && ticketActual.value.fechaFactura) {
      const fecha = new Date(ticketActual.value.fechaFactura);
      payload.fechaFactura = fecha.toISOString().split("T")[0];
    }
    const response = await PuntoVenta.facturaVistaPreviaXml(ticketActual.value.id, payload);
    const blob = new Blob([response.data], { type: "application/xml" });
    console.log(blob, 'bloc');
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.value}.xml`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, cargando, {
    onSuccess: () => notify.success("Vista previa XML generada correctamente"),
    errorsRef: errors,
  });
}

onMounted(() => {
  ventaId.value = route.params.ventaId;
  document.addEventListener("keydown", onEscape);
  getAllAlmacens();
});

onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});

function agregarRelacion() {
  if (!Array.isArray(ticketActual.value.facturasRelacionadas)) {
    ticketActual.value.facturasRelacionadas = [{ tipo: null, folio: "" }];
    return;
  }
  ticketActual.value.facturasRelacionadas.push({ tipo: null, folio: "" });
}

function eliminarRelacion(index) {
  if (Array.isArray(ticketActual.value.facturasRelacionadas)) {
    ticketActual.value.facturasRelacionadas.splice(index, 1);
  }
}

function copiarCodigo(codigo) {
  navigator.clipboard.writeText(codigo).then(() => {
    notify.success(`Código "${codigo}" copiado al portapapeles`);
  }).catch(() => {
    notify.error("Error al copiar al portapapeles");
  });
}

function abrirDialogoClonacion() {
  cloneData.value = {
    almacenId: ticketActual.value.almacen_id,
    clienteId: ticketActual.value.cliente_id,
  };
  if (clients.value.length === 0) {
    getAllClientes();
  }
  isCloneDialogOpen.value = true;
}

async function crearCotizacionDesdeVenta() {
  if (!cloneData.value.almacenId) {
    notify.error("Por favor selecciona un almacén");
    return;
  }
  processRequest(async () => {
    const response = await DocumentTemplate.cloneVentaToCotizacion({
      source_id: ticketActual.value.id,
      almacen_id: cloneData.value.almacenId,
      cliente_id: cloneData.value.clienteId || undefined,
    });
    if (response.data.success) {
      const newCotizacion = response.data.document;
      notify.success("Cotización creada exitosamente");
      isCloneDialogOpen.value = false;
      router.push({ name: "CotizacionesShow", params: { cotizacionId: newCotizacion.id } });
    } else {
      notify.error("Error al crear cotización: " + response.data.message);
    }
  }, cargando, {
    successMessage: null,
    errorMessage: "Error al crear la cotización",
  });
}

function getAllAlmacens() {
  processRequest(async () => {
    const response = await Almacen.getMyAlmacens();
    s.myAlmacens = response.data;
  }, cargando, {});
}

function abrirCreditos() {
  const resolved = router.resolve({
    name: "CreditosShow",
    params: { creditoId: ticketActual.value.cliente.id },
    query: { ticketId: String(ticketActual.value.id), show_settled_loan: "true" }
  });
  const absoluteUrl = `${window.location.origin}${resolved.href}`;
  window.open(absoluteUrl, "_blank", "noopener,noreferrer");
}
</script>

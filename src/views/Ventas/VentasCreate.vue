<template>
  <!-- Toolbar -->
  <v-toolbar color="gray" density="compact">
    <!-- <v-icon color="gray" class="ml-2" size="small">mdi-network-pos</v-icon> -->
    <v-toolbar-title class="text-secondary">Punto de Venta</v-toolbar-title>
    <v-btn class="hidden-xs-only" variant="elevated" color="primary" v-if="mdAndDown" size="small"
      append-icon="mdi-menu-down" @click="drawer = true">
      <!-- <v-icon >mdi-dots-vertical</v-icon> -->
      Ticket info
    </v-btn>
  </v-toolbar>
  <!-- Header Desktop-->
  <!-- Desktop Header Card -->
  <SalesHeaderCard v-if="mdAndUp" ref="salesHeaderCardRef" :ticket-actual="ticketActual" :almacen="almacen"
    :product-form="product_form" :price-options="priceOptions" :almacen-items="almacenItems" :articulos="articulos"
    :subtotal-computed="subtotalComputed" :descuento-computed="descuentoComputed" :impuesto-computed="impuestoComputed"
    :total-computed="totalComputed" :loading="cargando" :show-offline="showOffline" :codigo="codigo" :nombre-t="nombreT"
    :action-button-label="'Cobrar'" :action-button-icon="'mdi-account-cash'" :desglosar-impuesto="desglosarImpuesto" :apartar-productos="apartarProductos" @setPendiente="setPendienteWrapper"
    @abrirPendiente="abrirPendiente" @abrirCliente="abrirCliente" @goOffline="goOffline"
    @copyLinkToClipBoard="copyLinkToClipBoard" @openLastTicket="openLastTicket" @printLastTicket="printLastTicket"
    @showShortcuts="isShortcutsOpen = true" @asignarAlmacen="asignarAlmacenWrapper" @goPrimerArticulo="goPrimerArticulo"
    @enviarArticulo="enviarArticulo" @abrirModalBuscaProductsNombre="abrirModalBuscaProductsNombre"
    @borrarTicket="borrarTicketWrapper" @actionButtonClick="abrirCobrarModal" @setNombreTicket="setNombreTicketWrapper"
    @abrirExistencias="abrirExistencias" @update:codigo="codigo = $event" @searchProduct="searchProduct"
    @showPrices="showPrices" @openFechaEntrega="openFechaEntrega"
    @update:desglosarImpuesto="desglosarImpuesto = $event" @update:apartarProductos="handleToggleApartarProductos" />
  <!-- Mobile Sales Card -->
  <MobileSalesCard v-if="mdAndDown" ref="salesHeaderCardRef" :codigo="codigo" :product-form="product_form"
    :almacen="almacen" :price-options="priceOptions" @update:codigo="codigo = $event"
    @goPrimerArticulo="goPrimerArticulo" @searchProduct="searchProduct"
    @abrirModalBuscaProductsNombre="abrirModalBuscaProductsNombre" @emptyValues="emptyValuesWrapper"
    @enviarArticulo="enviarArticulo" @abrirExistencias="abrirExistencias" @showPrices="showPrices" />
  <!-- Mobile Navigation Drawer -->
  <MobileDrawer :model-value="drawer" @update:model-value="drawer = $event" :ticket-actual="ticketActual"
    :almacen-items="almacenItems" :subtotal-computed="subtotalComputed" :descuento-computed="descuentoComputed"
    :impuesto-computed="impuestoComputed" :total-computed="totalComputed" :show-offline="showOffline"
    @abrirCobrarModal="abrirCobrarModal" @borrarTicket="borrarTicketWrapper" @setPendiente="setPendienteWrapper"
    @abrirPendiente="abrirPendiente" @abrirCliente="abrirCliente" @goOffline="goOffline"
    @copyLinkToClipBoard="copyLinkToClipBoard" @openLastTicket="openLastTicket" @printLastTicket="printLastTicket"
    @openFechaEntrega="openFechaEntrega"
    @showShortcuts="isShortcutsOpen = true" @asignarAlmacen="asignarAlmacenWrapper"
    @setNombreTicket="setNombreTicketWrapper" />

  <!-- Articles Table Component -->
  <v-container fluid class="py-0 mt-2">
    <ArticlesTable :articles="articulos" :headers="tHeaders" :loading="cargando" :desglosarImpuesto="desglosarImpuesto" @edit="handleArticleEdit"
      @delete="destroyArticulo" @view-images="verImagenes" />
  </v-container>

  <!-- Modal Búsqueda de Productos -->
  <ProductSearchDialog ref="productSearchDialogRef" :model-value="isVisible" :products="products" :loading="cargando"
    :last-fetch-time="lastFetchTimeLocal" @update:model-value="isVisible = $event" @update:keyword="handleKeywordUpdate"
    @product-selected="handleProductSelected" @refresh="getAllProducts" @create-product="crearNuevoProducto" />

  <!-- Modal Clientes -->
  <ClientSelectionDialog :model-value="openCliente" :clients="clients" :keyword="keycliente" :loading="cargando"
    @update:model-value="openCliente = $event" @update:keyword="keycliente = $event"
    @client-selected="setClienteWrapper" />

  <!-- Pendientes -->
  <PendingTicketsDialog :model-value="openPendiente" :pending-tickets="pendientes" :loading="cargando"
    @update:model-value="openPendiente = $event" @ticket-selected="seleccionarPendiente" />

  <!-- Existencias-->
  <InventoryDialog :model-value="openExistencias" :inventory="existencias" :product-name="product_form.name"
    @update:model-value="openExistencias = $event" />

  <!-- Ajuste Inventarios -->
  <ArticleEditDialog :model-value="edicion" :articulo="articulo_form" :loading="cargando"
    @update:model-value="edicion = $event" @confirm="editarArticulo" />

  <!-- Conversion Granel Dialog Component -->
  <ConversionGranelDialog :model-value="openConversion" :loading="cargando" :show-prices-icon="priceOptions?.length > 1"
    :conversion-form="conversion_form" :total-value="total" :on-modifica-precio-base="modificaPrecioBase"
    :on-modifica-peso="modificaPeso" :on-modifica-total="modificaTotal" @update:model-value="openConversion = $event"
    @confirm="aceptarConversionWrapper" @show-prices="handleShowPricesFromConversion" />

  <!-- Cobrar -->
  <v-dialog v-model="openCobrar" max-width="600">
    <v-card>
      <v-card-title class="bg-primary text-white px-6 py-4 d-flex justify-space-between align-center">
        <div>
          <div class="text-overline opacity-90 mb-1">Total a Pagar</div>
          <div class="text-h4 font-weight-bold">${{ formatNumber(totalComputed) }}</div>
        </div>
        <v-icon size="56" class="opacity-75">mdi-cash-multiple</v-icon>
      </v-card-title>
      <v-card-text>
        <v-tabs v-model="tab" class="mb-4" slider-color="primary" center-active show-arrows density="comfortable">
          <v-tab value="basico" prepend-icon="mdi-cart-check" class=" text-capitalize">Básico</v-tab>
          <v-tab value="avanzado" prepend-icon="mdi-plus-circle-multiple" class=" text-capitalize">Avanzado</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="basico">
            <v-container>
              <!-- Display de Cambio Minimalista -->
              <v-row class="mb-3" dense>
                <v-col cols="12">
                  <v-card class="pa-2 rounded text-center" variant="outlined">
                    <div class="text-caption">Su Cambio</div>
                    <div :class="['text-h6 font-weight-bold', cambioColorClass]">{{ cambio }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <v-text-field label="Paga Con" id="pagocon" autocomplete="off" placeholder="0.00" v-model.number="pagocon"
                @keydown.enter.exact="guardarVenta(false)" variant="outlined" density="compact"
                prepend-inner-icon="mdi-currency-usd" />

              <v-text-field v-if="showTelefonoField" label="Telefono del cliente" id="telefono" autocomplete="off"
                placeholder="(###) ###-####" v-model="telefono" v-maska="'(###) ###-####'"
                @keydown.enter.prevent="guardarVentaWha(false)" variant="outlined" density="compact"
                prepend-inner-icon="mdi-whatsapp">
                <template #append>
                  <br></br>
                  <v-btn append-icon="mdi-send" variant="flat" color="primary" @click="guardarVentaWha(false)">
                    <span v-if="mdAndUp">
                      Vender y Enviar
                    </span>
                  </v-btn>
                </template>
              </v-text-field>

              <v-checkbox v-if="ticketActual.clienteId" v-model="credito" :label="`Es venta a crédito?`" id="credito"
                density="compact"></v-checkbox>
            </v-container>
          </v-tabs-window-item>
          <v-tabs-window-item value="avanzado">
            <v-container>
              <!-- Resumen en línea -->
              <v-row class="mb-3" dense>
                <!-- <v-col cols="6" class="text-center">
                  <div class="text-caption text-grey font-weight-bold">Total</div>
                  <div class="text-h6 text-primary">${{ formatNumber(totalComputed) }}</div>
                </v-col> -->
                <v-col cols="12" class="text-center">
                  <v-card class="pa-2 rounded text-center" variant="outlined">
                    <div class="text-caption text-grey font-weight-bold">Suma</div>
                    <div class="text-h6 text-grey-darken-2">${{ formatNumber(sumatoria) }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Display de Cambio Minimalista -->
              <v-row class="mb-3" dense>
                <v-col cols="12">
                  <v-card class="pa-2 rounded text-center" variant="outlined">
                    <div class="text-caption">Su Cambio</div>
                    <div :class="['text-h6 font-weight-bold', cambioColorClass]">{{ cambio }}</div>
                  </v-card>
                </v-col>
              </v-row>

              <v-divider class="mb-3"></v-divider>
              <v-row dense>
                <v-text-field label="Efectivo" autocomplete="off" v-model.number="pagocon"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.efectivo_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Tarjeta de débito" autocomplete="off" v-model.number="forma_pago.tarjeta_debito"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.tarjeta_debito_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Tarjeta de crédito" autocomplete="off" v-model.number="forma_pago.tarjeta_credito"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.tarjeta_credito_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Transferencia" autocomplete="off" v-model.number="forma_pago.transferencia"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.transferencia_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Cheque" autocomplete="off" v-model.number="forma_pago.cheque"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.cheque_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Vales de despensa" autocomplete="off" v-model.number="forma_pago.vales_de_despensa"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.vales_de_despensa_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <!-- <v-text-field label="Telefono" id="telefono" autocomplete="off" placeholder="" v-model="telefono"
                v-maska="'(###) ###-####'" @keydown.enter="guardarVenta(false)" /> -->
              <v-text-field label="Telefono del cliente" id="telefono" autocomplete="off" placeholder="(###) ###-####"
                v-model="telefono" v-maska="'(###) ###-####'" prepend-inner-icon="mdi-whatsapp"
                @keydown.enter.prevent="guardarVentaWha(false)" v-if="showTelefonoField">
                <template #append>
                  <v-btn append-icon="mdi-send" variant="elevated" size="small" color="primary"
                    @click="guardarVentaWha(false)">
                    <span v-if="mdAndUp">
                      Vender y Enviar
                    </span>
                  </v-btn>
                </template>
              </v-text-field>
            </v-container>
          </v-tabs-window-item>
        </v-tabs-window>
        <p v-if="amountExceedsTotal" class="text-error text-caption">
          *Pago inprocedente, la cantidad supera al total
        </p>
      </v-card-text>
      <v-card-actions>
        <template v-if="mdAndUp">
          <v-tooltip text="Vender" location="top">
            <template v-slot:activator="{ props }">
              <v-btn @click="guardarVenta(false)" size="small" variant="elevated" color="primary"
                prepend-icon="mdi-cash" class="ring" :loading="cargando">Vender</v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Vender e imprimir" location="top">
            <template v-slot:activator="{ props }">
              <v-btn @click="guardarVenta(true)" size="small" variant="outlined" color="primary"
                prepend-icon="mdi-printer-pos" class="ring" v-bind="props" :loading="cargando"></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Vender y mandar whatsapp" location="top">
            <template v-slot:activator="{ props }">
              <v-btn @click="showTelefonoField = !showTelefonoField" size="small" variant="outlined" color="primary"
                prepend-icon="mdi-whatsapp" class="ring" v-bind="props" :loading="cargando"></v-btn>
            </template>
          </v-tooltip>
        </template>
        <v-btn @click="openCobrar = false" size="small" :loading="cargando">Cancelar</v-btn>

        <v-menu transition="scale-transition" class="ma-2 pa-2" v-if="smAndDown">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" v-bind="props" append-icon="mdi-menu-down" :loading="cargando">
              Vender
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="guardarVenta(false)">
              <template v-slot:prepend>
                <v-icon icon="mdi-cash"></v-icon>
              </template>
              <v-list-item-title> Vender</v-list-item-title>
            </v-list-item>
            <v-list-item @click="guardarVenta(true)">
              <template v-slot:prepend>
                <v-icon icon="mdi-printer-pos"></v-icon>
              </template>
              <v-list-item-title> Vender Imprimir</v-list-item-title>
            </v-list-item>
            <v-list-item @click="showTelefonoField = !showTelefonoField">
              <template v-slot:prepend>
                <v-icon icon="mdi-whatsapp"></v-icon>
              </template>
              <v-list-item-title> Vender Whatsapp</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Imagenes Dialog -->
  <ImagesDialog :model-value="isOpenImagenes" :images="imagenes" @update:model-value="isOpenImagenes = $event" />

  <!-- Fecha entrega -->
  <v-dialog v-model="isFechaEntregaOpen" max-width="500">
    <v-card>
      <v-card-title>Fecha de entrega</v-card-title>
      <v-card-text>
        <v-row justify="center" dense>
          <v-date-picker v-model="fechaEntrega" color="primary" header-color="primary" />
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isFechaEntregaOpen = false">Cancelar</v-btn>
        <v-btn color="primary" variant="outlined" @click="updateFechaEntrega">Actualizar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Precios Dialog -->
  <PricesDialog :model-value="isShowPricesOpen" :price-options="priceOptions" :headers="pricesHeaders"
    @update:model-value="isShowPricesOpen = $event" @price-selected="handlePriceSelected" />
  <ShortcutsDialog v-model="isShortcutsOpen" />
</template>

<script setup>
import {
  onMounted,
  onUnmounted,
  ref,
  reactive,
  watch,
  nextTick,
  computed,
} from "vue";

import { useRouter } from "vue-router";
import Product from "../../apis/Product";
import PuntoVenta from "../../apis/PuntoVenta";
import Cliente from "../../apis/Cliente";
import { WebviewWindow } from "@tauri-apps/api/window";
import Organizacion from "../../apis/Organizacion";
import { useNotification } from "@js/composables/useNotification.js";
import { useDisplay } from "vuetify";
import { useCurrency } from '@js/composables/useCurrency';
import { useProcessRequest } from '@js/composables/useProcessRequest';
import { useSearchCache } from '@js/composables/useSearchCache';
import { useTicketManagement } from '@js/composables/ventas/useTicketManagement';
import { useProductForm } from '@js/composables/useProductForm';
import { useVentasKeyboardShortcuts } from '@js/composables/useKeyboardShortcuts';
import { useConversionGranel } from '@js/composables/useConversionGranel';
import { useArticlesManagement } from '@js/composables/useArticlesManagement';
import { useTicketUI } from '@js/composables/useTicketUI';
import { createActionWrapper } from '@js/composables/useActionWrapper';
// Componentes extraídos
import ArticleEditDialog from '@js/components/ArticleEditDialog.vue';
import ClientSelectionDialog from '@js/components/ClientSelectionDialog.vue';
import ProductSearchDialog from '@js/components/ProductSearchDialog.vue';
import PendingTicketsDialog from '@js/components/PendingTicketsDialog.vue';
import InventoryDialog from '@js/components/InventoryDialog.vue';
import ShortcutsDialog from '@js/components/ShortcutsDialog.vue';
import ConversionGranelDialog from '@js/components/ConversionGranelDialog.vue';
import ArticlesTable from '@js/components/ArticlesTable.vue';
import SalesHeaderCard from '@js/components/SalesHeaderCard.vue';
import MobileSalesCard from '@js/components/MobileSalesCard.vue';
import MobileDrawer from '@js/components/MobileDrawer.vue';
import PricesDialog from '@js/components/PricesDialog.vue';
import ImagesDialog from '@js/components/ImagesDialog.vue';
import { vMaska } from "maska/vue"

// Inicializaciones DESPUÉS de todos los imports
const { formatNumber } = useCurrency('es-MX', 'MXN');
const { mdAndUp, mdAndDown, lgAndUp, smAndDown } = useDisplay();
const router = useRouter();
const { notify } = useNotification();
const { processRequest } = useProcessRequest();

// Composable de manejo de tickets
const {
  ticketActual,
  almacen,
  articulos,
  almacens,
  credito,
  nombreT,
  cargando,
  drawer,
  openCliente,
  telefono,
  totalComputed,
  subtotalComputed,
  descuentoComputed,
  impuestoComputed,
  init,
  getSpecificVT,
  asignarAlmacen,
  borrarTicket,
  setNombreTicket,
  setCliente,
  setPendiente,
} = useTicketManagement();

// Composable de manejo de producto form
const {
  codigo,
  productActualId,
  product_form,
  priceOptions,
  isShowPricesOpen,
  openExistencias,
  existencias,
  searchProduct,
  getProductById,
  aceptarConversion,
  emptyValues,
  showPrices,
  usePrice,
  abrirExistencias,
} = useProductForm(ticketActual, almacen, {
  cargandoRef: cargando,
  onOpenConversion: (data) => {
    conversion_form.precioBase = data.precioBase
    conversion_form.peso = data.peso
    total.value = data.total
    openConversion.value = true
  }
});

// Use conversion granel composable
const {
  conversion_form,
  total,
  openConversion,
  modificaPrecioBase,
  modificaPeso,
  modificaTotal,
} = useConversionGranel();

// Instancia del composable para caché de búsquedas de productos
const productCache = useSearchCache({ ttlMs: 5 * 60 * 1000 });
const forma_pago = reactive({
  efectivo: 0,
  efectivo_ref: "",
  tarjeta_debito: 0,
  tarjeta_debito_ref: "",
  tarjeta_credito: 0,
  tarjeta_credito_ref: "",
  transferencia: 0,
  transferencia_ref: "",
  cheque: 0,
  cheque_ref: "",
  vales_de_despensa: 0,
  vales_de_despensa_ref: "",
  pago_con: 0,
});

// Ref para SalesHeaderCard component
const salesHeaderCardRef = ref(null);
// Ref para ProductSearchDialog component
const productSearchDialogRef = ref(null);

// ============================================================================
// STATE REFS - Variables Reactivas de Estado
// ============================================================================
const tab = ref(null);
const keyword = ref("");
const keycliente = ref("");
const products = ref([]);
const lastFetchTimeLocal = ref(null);
const pendientes = ref([]);
const clients = ref([]);
const isVisible = ref(false);
const isShortcutsOpen = ref(false);
const isOpenImagenes = ref(false);
const imagenes = ref([]);
const isInfoAgregarExistenciaOpen = ref(false);
const openCobrar = ref(false);
const openPendiente = ref(false);
const isFechaEntregaOpen = ref(false);
const fechaEntrega = ref(null);
const pagocon = ref(0);
const showTelefonoField = ref(false);
const pricesDialogOpenedFrom = ref(null); // Track where prices dialog was opened from ('conversion' or 'product')
const desglosarImpuesto = ref(false);
const apartarProductos = computed({
  get: () => ticketActual.apartar_productos ?? false,
  set: (value) => {
    ticketActual.apartar_productos = value;
  }
});
const focusCodigoField = async () => {
  await nextTick();
  salesHeaderCardRef.value.focusCodigo();
};
const emptyValuesWrapper = () => {
  emptyValues();
  drawer.value = false;
  isVisible.value = false;
  isOpenImagenes.value = false;
  openEdit.value = false;
  openCobrar.value = false;
  openPendiente.value = false;
  isInfoAgregarExistenciaOpen.value = false;
  isShortcutsOpen.value = false;
  openConversion.value = false;
  salesHeaderCardRef.value?.clearFields?.();
  // keyword.value = '';
  focusCodigoField();
};

// Composable de manejo de artículos
const {
  articulo_form,
  edicion,
  openEdit,
  handleArticleEdit,
  editarArticulo,
  enviarArticulo,
  destroyArticulo,
} = useArticlesManagement({
  ticketActual,
  product_form,
  productActualId,
  articlesAPI: PuntoVenta,
  emptyValues,
  getSpecificVT,
  focusCodigoField: focusCodigoField,
  fieldMapping: {
    precioField: 'precio_usado' // Campo de precio en la API de Ventas
  }
});

// Headers para ArticlesTable (basado en v-data-table)
const tHeadersBase = ref([
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "product_name", align: "start", sortable: false },
  { title: "Cantidad", key: "cantidad", align: "start", sortable: false },
  { title: "Ancho", key: "ancho", align: "start", sortable: false },
  { title: "Alto", key: "alto", align: "start", sortable: false },
  { title: "Área", key: "area_total", align: "start", sortable: false },
  { title: "Precio", key: "precio_usado", align: "start", sortable: false },
  { title: "Importe", key: "precio_final", align: "start", sortable: false },
  { title: "Descuento", key: "importe_descuento", align: "start", sortable: false },
  { title: "Impuesto", key: "impuesto_traslado", align: "start", sortable: false },
  { title: "Existencia", key: "cantidad_actual", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "center", sortable: false },
]);

const tHeaders = computed(() => {
  // Si desglosarImpuesto es false, no mostramos la columna de Impuesto
  if (!desglosarImpuesto.value) {
    return tHeadersBase.value.filter(header => header.key !== 'impuesto_traslado');
  }
  return tHeadersBase.value;
});
const pricesHeaders = ref([
  { title: "Precio", key: "title", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
]);
// ============================================================================
// COMPUTED PROPERTIES - Propiedades Calculadas
// ============================================================================
const { showOffline, goOffline, almacenItems } = useTicketUI(almacens, router);
const sumatoria = computed(() => {
  return (
    +forma_pago.cheque +
    +forma_pago.efectivo +
    +forma_pago.tarjeta_credito +
    +forma_pago.tarjeta_debito +
    +forma_pago.transferencia +
    +forma_pago.vales_de_despensa +
    +pagocon.value
  );
});
const sumatoriaWithoutEfectivo = computed(() => {
  return (
    +forma_pago.cheque +
    +forma_pago.tarjeta_credito +
    +forma_pago.tarjeta_debito +
    +forma_pago.transferencia +
    +forma_pago.vales_de_despensa+ +pagocon.value
  );
});
const amountExceedsTotal = computed(() => {
  return +sumatoria.value - +pagocon.value > +totalComputed.value;
});
const amountUnderTotal = computed(() => {
  let resta =
    +pagocon.value - (totalComputed.value - sumatoria.value + +pagocon.value);
  if (resta < 0) return true;
  return false;
});
const cambio = computed(() => {
  if (amountExceedsTotal.value) {
    return "Monto excede total";
  }
  let resta =
    +pagocon.value - (totalComputed.value - sumatoria.value + +pagocon.value);
  if (resta < 0) {
    return `Te Faltan $${-resta} `;
  } else {
    return `$${resta}`;
  }
});
const efectivoCalculated = computed(() => {
  return -(+sumatoria.value - +pagocon.value - +totalComputed.value);
});

const cambioColorClass = computed(() => {
  if (amountExceedsTotal.value) {
    return 'text-error'; // Monto excede
  }
  let resta = +pagocon.value - (totalComputed.value - sumatoria.value + +pagocon.value);
  if (resta < 0) {
    return 'text-error'; // Te falta dinero
  } else if (resta === 0) {
    return 'text-primary'; // Pago exacto
  } else {
    return 'text-success'; // Hay cambio
  }
});
//watchers
watch(tab, (newVal) => {
  resetFormaPago();
  if (newVal == "avanzado") {
    credito.value = false;
  }
});
watch(keycliente, () => {
  getAllClientes();
});

// Manejador para búsqueda de productos (solo cuando el usuario interactúa)
const handleKeywordUpdate = (newKeyword) => {
  keyword.value = newKeyword;
  getAllProducts();
};

// Ticket management functions moved to useTicketManagement composable:
// - asignarAlmacen
// - borrarTicket
// - setNombreTicket
// - setCliente
// - acceptRetentionRules
// - setPendiente

// ============================================================================
// WRAPPER FUNCTIONS - Funciones Envoltorio para Composables (useActionWrapper)
// ============================================================================
const asignarAlmacenWrapper = createActionWrapper(asignarAlmacen, focusCodigoField, emptyValuesWrapper);
const borrarTicketWrapper = createActionWrapper(borrarTicket, focusCodigoField, emptyValuesWrapper);
const setClienteWrapper = createActionWrapper(setCliente, focusCodigoField, emptyValuesWrapper);
const setPendienteWrapper = createActionWrapper(setPendiente, focusCodigoField, emptyValuesWrapper);
const setNombreTicketWrapper = async (nombre) => {
  await setNombreTicket(nombre);
  await focusCodigoField();
  nombreT.value = '';
}
const handleToggleApartarProductos = async (value) => {
  apartarProductos.value = value;
  processRequest(async () => {
    await PuntoVenta.toggleApartarProductos(ticketActual.id, value);
    cargando.value = false;
    await getSpecificVT(ticketActual.id); // Refrescar datos del ticket para mostrar el cambio
  }, cargando, {
    onSuccess: () => notify.success(value ? "Los productos en este ticket van a ser apartados" : "Apartado desactivado"),
  });
}

const aceptarConversionWrapper = (conversionData) => {
  aceptarConversion(conversionData);
  enviarArticulo();
  openConversion.value = false;
  focusCodigoField();
};
// All product form functions moved to useProductForm composable
async function getAllProducts() {
  const currentTime = new Date().getTime();

  // Validar si el caché está stale para este almacén + keyword
  const isStale = productCache.isDataStale(almacen.id, keyword.value);

  if (!productCache.getFromCache(almacen.id, keyword.value) || isStale) {
    // Caché no existe o está expirado → hacer fetch
    processRequest(async () => {
      const { data } = await Product.searchKeyWord(keyword.value, almacen.id);
      products.value = data;

      // Guardar en caché por almacén (esto también actualiza el timestamp)
      productCache.setCache(almacen.id, keyword.value, data);
      lastFetchTimeLocal.value = currentTime;
    }, cargando, {
    });
  } else {
    // Usar caché fresco
    products.value = productCache.getFromCache(almacen.id, keyword.value);
    lastFetchTimeLocal.value = productCache.timestamps.value[`${almacen.id}:${keyword.value}`];
  }
}
async function abrirModalBuscaProductsNombre() {
  isVisible.value = true;
  await getAllProducts();
  await nextTick();
  productSearchDialogRef.value?.focusKeyword();
}
function crearNuevoProducto() {
  router.push({ name: "ProductosIndex" });
}
function handleProductSelected(productId) {
  getProductById(productId);
  isVisible.value = false;
}
function handlePriceSelected(priceValue) {
  if (pricesDialogOpenedFrom.value === 'conversion') {
    // Update conversion form precio base and recalculate total
    conversion_form.precioBase = priceValue;
    const fixed = +priceValue * +conversion_form.peso;
    let res = Math.round(fixed * 100) / 100;
    total.value = res;
  } else {
    // Default behavior: use price from product form
    usePrice(priceValue);
  }
  pricesDialogOpenedFrom.value = null;
  isShowPricesOpen.value = false; // Close prices dialog after selection
  nextTick(() => document.getElementById('cantidad').select())
}
function handleShowPricesFromConversion() {
  pricesDialogOpenedFrom.value = 'conversion';
  showPrices();
}
//article functions
// Todas las funciones de artículos se encuentran en useArticlesManagement composable:
// - handleArticleEdit(articulo)
// - abrirEdicion(id, name, pventa, cantidad)
// - editarArticulo(updatedArticulo)
// - enviarArticulo()
// - destroyArticulo(articulo)
// Importadas desde: useArticlesManagement()
//helper functions
// emptyValues() moved to useProductForm, wrapper adds drawer clear and closes all modals

// Helper to focus and select the codigo field on both desktop and mobile

function getAllPendientes() {
  processRequest(async () => {
    const response = await PuntoVenta.getAllPendientes();
    pendientes.value = response.data;
  }, cargando, {
    onError: (error) => notify.error(error)
  });
}
function getAllClientes() {
  processRequest(async () => {
    const response = await Cliente.getAllClientes(keycliente.value);
    clients.value = response.data;
  }, cargando, {
    onError: (error) => notify.error(error)
  });
}
function abrirCobrarModal() {
  tab.value = "basic";
  openCobrar.value = true;
  resetFormaPago();

  pagocon.value = totalComputed.value;
  nextTick(() => document.getElementById("pagocon").select());
}
function abrirCliente() {
  openCliente.value = true;

  nextTick(() => document.getElementById("keycliente").select());
  getAllClientes();
}
function abrirPendiente() {
  openPendiente.value = true;
  getAllPendientes();
}

function openFechaEntrega() {
  fechaEntrega.value = ticketActual.fecha_entrega
    ? new Date(ticketActual.fecha_entrega)
    : new Date();
  isFechaEntregaOpen.value = true;
}

function formatDateTimeLocal(date) {
  const d = new Date(date)
  d.setSeconds(0, 0)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

function updateFechaEntrega() {
  if (!fechaEntrega.value) {
    notify.warning('Selecciona una fecha de entrega')
    return
  }

  const fechaFormateada = formatDateTimeLocal(fechaEntrega.value)
  processRequest(async () => {
    await PuntoVenta.updateFechaEntrega(ticketActual.id, fechaFormateada)
    cargando.value = false
    await getSpecificVT(ticketActual.id)
    isFechaEntregaOpen.value = false
    focusCodigoField()
  }, cargando, {
    onSuccess: () => notify.success('Fecha de entrega actualizada'),
    onError: (error) => notify.error(error)
  })
}
async function guardarVenta(imprimir) {
  if (amountExceedsTotal.value) {
    notify.warning("El monto excede el total");
    return;
  }
  if (amountUnderTotal.value) {
    notify.warning("El pago no cubre el total");
    return;
  }
  if (tab.value == 'avanzado') {
    forma_pago.efectivo = efectivoCalculated.value;
    forma_pago.pago_con = +sumatoriaWithoutEfectivo.value;
  } else {
    forma_pago.pago_con = pagocon.value;
    forma_pago.efectivo = efectivoCalculated.value;
  }

  processRequest(async () => {
    const { data } = await PuntoVenta.guardarVenta(ticketActual.id, forma_pago, credito.value);
    openCobrar.value = false;
    if (imprimir) {
      print();
    }
    cargando.value = false;
    showTelefonoField.value = false;
    await init();
    focusCodigoField();
  }, cargando, {
    onSuccess: () => notify.success("La venta ha sido agregada exitosamente"),
    onError: (error) => {
      if (
        error?.data?.exception === "App\\Exceptions\\OperationalException" &&
        error?.data?.message?.includes("No has habilitado la caja")
      ) {
        notify.warning(error?.data?.message);
        setTimeout(() => {
          router.push({ name: "Cortes" });
        }, 2000);
        return;
      }
      notify.error(error.message || "Error al guardar la venta");
    }
  });
}
function print(ticket = null) {
  if (!ticket) {
    ticket = ticketActual.id;
  }
  if (window.__TAURI_METADATA__) {
    const webview = new WebviewWindow("ImprimirVenta", {
      url: `ventatickets/imprimir/${ticket}`,
      title: "Imprimir Venta",
    });
  } else {
    window.open(
      `${import.meta.env.VITE_APP_URL}/ventatickets/imprimir/${ticket}`,
      "_blank",
      "noreferrer"
    );
  }
}
function guardarVentaWha() {
  if (amountExceedsTotal.value) {
    notify.warning("El monto excede el total");
    return;
  }
  if (amountUnderTotal.value) {
    notify.warning("El pago no cubre el total");
    return;
  }
  if (!telefono.value || cleanPhoneNumber(telefono.value).length < 10) {
    notify.warning("Introduce un telefono valido");
    return;
  }
  if (tab.value == 'avanzado') {
    forma_pago.efectivo = efectivoCalculated.value;
    forma_pago.pago_con = +sumatoriaWithoutEfectivo.value;
  } else {
    forma_pago.pago_con = pagocon.value;
    forma_pago.efectivo = efectivoCalculated.value;
  }
  const cleanedPhone = cleanPhoneNumber(telefono.value);

  processRequest(async () => {
    const response = await PuntoVenta.guardarVenta(ticketActual.id, forma_pago, credito.value);
    openCobrar.value = false;
    const localTelefono = cleanedPhone;

    cargando.value = false;
    showTelefonoField.value = false;
    await init();

    // Enviar a WhatsApp
    try {
      const waResponse = await PuntoVenta.sendVentaToWha(ticketActual.id, localTelefono);
      const text = waResponse.data.text;
      const encodedMessage = encodeURIComponent(text);
      const whatsappMobileLink = `https://wa.me/521${localTelefono}?text=${encodedMessage}`;
      const whatsappWebLink = `https://web.whatsapp.com/send?phone=521${localTelefono}&text=${encodedMessage}`;
      const link = isMobileDevice() ? whatsappMobileLink : whatsappWebLink;
      window.open(link, "_blank");
    } catch (error) {
      console.error("Error enviando a WhatsApp:", error);
    }
  }, cargando, {
    onSuccess: () => notify.success("La venta ha sido agregada exitosamente"),
    onError: (error) => {
      if (
        error?.response?.data?.exception === "App\\Exceptions\\OperationalException" &&
        error?.response?.data?.message?.includes("No has habilitado la caja")
      ) {
        notify.error(error?.response?.data?.message);
        setTimeout(() => {
          router.push({ name: "Cortes" });
        }, 2000);
        return;
      }
      notify.error(error);
    }
  });
}
const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};
// Helper function to clean phone number (remove non-numeric characters)
const cleanPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '');
};
function goPrimerArticulo() {
  const elementos = document.getElementsByClassName("articulosInputs");
  elementos[0].focus();
}
function verImagenes(images) {
  console.log(images);

  imagenes.value = images;
  isOpenImagenes.value = true;
}
const printLastTicket = () => {
  processRequest(async () => {
    const { data } = await PuntoVenta.getLastTicket();
    cargando.value = false;
    console.log(data, 'data');
    if (data) {

      print(data.id);
    }
  }, cargando, {
    onSuccess: () => notify.success("Ticket impreso"),
  });
};
const openLastTicket = () => {
  processRequest(async () => {
    const { data } = await PuntoVenta.getLastTicket();
    if (data) {
      router.push({ name: "VentasShow", params: { ventaId: data.id } });
    }
  }, cargando, {
    onError: (error) => notify.error(error)
  });
};
const copyLinkToClipBoard = () => {
  processRequest(async () => {
    const { data } = await Organizacion.getMyOrganization();
    navigator.clipboard.writeText(data.url);
  }, cargando, {
    onSuccess: () => notify.success(
      "El link de tu tienda se ha copiado al portapapeles, compartelo con tus clientes "
    ),
    onError: (error) => notify.error(error)
  });
};
const resetFormaPago = () => {
  forma_pago.efectivo = 0;
  forma_pago.efectivo_ref = "";
  forma_pago.tarjeta_debito = 0;
  forma_pago.tarjeta_debito_ref = "";
  forma_pago.tarjeta_credito = 0;
  forma_pago.tarjeta_credito_ref = "";
  forma_pago.transferencia = 0;
  forma_pago.transferencia_ref = "";
  forma_pago.cheque = 0;
  forma_pago.cheque_ref = "";
  forma_pago.vales_de_despensa = 0;
  forma_pago.vales_de_despensa_ref = "";
  forma_pago.pago_con = 0;
};
function seleccionarPendiente(id) {
  getSpecificVT(id);
  openPendiente.value = false;
  focusCodigoField();
  emptyValuesWrapper();
}

// Initialize keyboard shortcuts after all functions are defined
useVentasKeyboardShortcuts({
  openCobrar: abrirCobrarModal,
  setPendiente: setPendiente,
  abrirPendiente: abrirPendiente,
  openFechaEntrega: openFechaEntrega,
  abrirModalBuscaProductsNombre: abrirModalBuscaProductsNombre,
  abrirExistencias: abrirExistencias,
  emptyValuesWrapper: emptyValuesWrapper,
  router: router,
  routerName: 'VentasIndex'
});

onMounted(async () => {
  // Limpiar caché de búsquedas al montar el componente
  productCache.clear();
  await init();
  focusCodigoField();
});

onUnmounted(() => {
  // Cleanup automático en composables
  // window.removeEventListener('keydown', handleEscapeKey);
});
</script>
<style>
.v-chip {
  font-weight: 500;
  font-family: monospace;
}

.ring:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 114, 191, 0.5);
  /* Blue ring effect */
}

.highlighted-select {
  animation: pulse 1.5s infinite;
  border-radius: 8px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(56, 155, 242, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(16, 37, 64, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(13, 13, 13, 0);
  }
}
</style>

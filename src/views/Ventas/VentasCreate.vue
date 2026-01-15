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
    :total-computed="totalComputed" :loading="cargando" :show-offline="showOffline"
    :codigo="codigo" :nombre-t="nombreT" :action-button-label="'Cobrar'" :action-button-icon="'mdi-currency-usd'"
    @setPendiente="setPendienteWrapper" @abrirPendiente="abrirPendiente" @abrirCliente="abrirCliente"
    @goOffline="goOffline" @copyLinkToClipBoard="copyLinkToClipBoard" @openLastTicket="openLastTicket"
    @printLastTicket="printLastTicket" @showShortcuts="isShortcutsOpen = true" @asignarAlmacen="asignarAlmacenWrapper"
    @goPrimerArticulo="goPrimerArticulo" @enviarArticulo="enviarArticulo"
    @abrirModalBuscaProductsNombre="abrirModalBuscaProductsNombre" @borrarTicket="borrarTicketWrapper"
    @actionButtonClick="abrirCobrarModal" @setNombreTicket="setNombreTicketWrapper" @abrirExistencias="abrirExistencias"
    @update:codigo="codigo = $event" @searchProduct="searchProduct" @showPrices="showPrices" />
  <!-- Mobile Sales Card -->
  <MobileSalesCard v-if="mdAndDown" ref="salesHeaderCardRef" :codigo="codigo" :product-form="product_form" :almacen="almacen"
    :price-options="priceOptions" @update:codigo="codigo = $event" @goPrimerArticulo="goPrimerArticulo"
    @searchProduct="searchProduct" @abrirModalBuscaProductsNombre="abrirModalBuscaProductsNombre"
    @emptyValues="emptyValuesWrapper" @enviarArticulo="enviarArticulo" @abrirExistencias="abrirExistencias"
    @showPrices="showPrices" />
  <!-- Mobile Navigation Drawer -->
  <MobileDrawer :model-value="drawer" @update:model-value="drawer = $event" :ticket-actual="ticketActual"
    :almacen-items="almacenItems"
    :subtotal-computed="subtotalComputed" :descuento-computed="descuentoComputed" :impuesto-computed="impuestoComputed"
    :total-computed="totalComputed" :show-offline="showOffline" @abrirCobrarModal="abrirCobrarModal"
    @borrarTicket="borrarTicketWrapper" @setPendiente="setPendienteWrapper" @abrirPendiente="abrirPendiente"
    @abrirCliente="abrirCliente" @goOffline="goOffline" @copyLinkToClipBoard="copyLinkToClipBoard"
    @openLastTicket="openLastTicket" @printLastTicket="printLastTicket"
    @showShortcuts="isShortcutsOpen = true"
    @asignarAlmacen="asignarAlmacenWrapper" @setNombreTicket="setNombreTicketWrapper" />

  <!-- Articles Table Component -->
  <v-container fluid class="py-0 mt-2">
    <ArticlesTable :articles="articulos" :headers="tHeaders" :loading="cargando" @edit="handleArticleEdit"
      @delete="destroyArticulo" @view-images="verImagenes" />
  </v-container>

  <!-- Modal Búsqueda de Productos -->
  <ProductSearchDialog :model-value="isVisible" :products="products" :keyword="keyword" :loading="cargando"
    :last-fetch-time="lastFetchTimeLocal" @update:model-value="isVisible = $event" @update:keyword="keyword = $event"
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
    @confirm="aceptarConversionWrapper" @show-prices="showPrices" />

  <!-- Cobrar -->
  <v-dialog v-model="openCobrar" max-width="600">
    <v-card>
      <v-card-title>Cobrar ${{ formatNumber(totalComputed) }}</v-card-title>
      <v-card-text>
        <v-tabs v-model="tab" color="primary" class="mb-2">
          <v-tab value="basico">Básico</v-tab>
          <v-tab value="avanzado">Avanzado</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="basico">
            <v-container>
              <v-text-field label="Su cambio" autocomplete="off" placeholder="" v-model="cambio" readonly />
              <v-text-field type="number" @wheel.prevent label="Paga Con" id="pagocon" autocomplete="off" placeholder=""
                v-model.number="pagocon" @keydown.enter.exact="guardarVenta(false)" />
              <v-text-field label="Telefono" id="telefono" autocomplete="off" placeholder="" v-model="telefono"
                @keydown.enter="guardarVenta(false)" />
              <div v-if="ticketActual.clienteId">
                <v-checkbox v-model="credito" :label="`Es venta a crédito?`" id="credito"></v-checkbox>
              </div>
            </v-container>
          </v-tabs-window-item>
          <v-tabs-window-item value="avanzado">
            <v-container>
              <v-row dense>
                <v-text-field label="Suma formas de pago" autocomplete="off" placeholder="" v-model="sumatoria"
                  @keydown.enter="guardarVenta(false)" readonly />
                <v-text-field label="Su cambio" autocomplete="off" placeholder="" v-model="cambio" readonly />
              </v-row>
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
              <v-text-field label="Telefono" id="telefono" autocomplete="off" placeholder="" v-model="telefono"
                @keydown.enter="guardarVenta(false)" />
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
              <v-btn @click="guardarVenta(false)" size="small" variant="outlined" color="primary"
                prepend-icon="mdi-cash" class="ring" :loading="cargando">Vender</v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Vender e imprimir" location="top">
            <template v-slot:activator="{ props }">
              <v-btn @click="guardarVenta(true)" size="small" variant="outlined" color="primary"
                prepend-icon="mdi-printer-pos" class="ring" v-bind="props" :loading="cargando">Vender</v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Vender y mandar whatsapp" location="top">
            <template v-slot:activator="{ props }">
              <v-btn @click="guardarVentaWha(false)" size="small" variant="outlined" color="primary"
                prepend-icon="mdi-whatsapp" class="ring" v-bind="props" :loading="cargando">Vender</v-btn>
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
            <v-list-item @click="guardarVentaWha(false)">
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
  <!-- Imagenes -->
  <v-dialog v-model="isOpenImagenes">
    <v-card>
      <v-card-title>Imágenes</v-card-title>
      <v-card-text>
        <v-carousel>
          <v-carousel-item v-for="image in imagenes" :src="image.url" cover></v-carousel-item>
        </v-carousel>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isOpenImagenes = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isShowPricesOpen" max-width="600">
    <v-card>
      <v-card-title>Precios</v-card-title>
      <v-card-text>
        <v-data-table :headers="pricesHeaders" :items="priceOptions" hide-default-footer density="compact" fixed-header>
          <template v-slot:item.actions="{ item }">
            <v-btn @click="usePrice(item.value)" size="small">
              Usar precio
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isShowPricesOpen = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
import ArticleEditDialog from '../../components/ArticleEditDialog.vue';
import ClientSelectionDialog from '../../components/ClientSelectionDialog.vue';
import ProductSearchDialog from '@js/components/ProductSearchDialog.vue';
import PendingTicketsDialog from '../../components/PendingTicketsDialog.vue';
import InventoryDialog from '../../components/InventoryDialog.vue';
import ShortcutsDialog from '../../components/ShortcutsDialog.vue';
import ConversionGranelDialog from '../../components/ConversionGranelDialog.vue';
import ArticlesTable from '../../components/ArticlesTable.vue';
import SalesHeaderCard from '../../components/SalesHeaderCard.vue';
import MobileSalesCard from '../../components/MobileSalesCard.vue';
import MobileDrawer from '../../components/MobileDrawer.vue';

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
const pagocon = ref(0);
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
  focusCodigoField();
};

// Composable de manejo de artículos
const {
  articulo_form,
  articuloActualId,
  edicion,
  openEdit,
  pventa_porcentaje,
  handleArticleEdit,
  abrirEdicion,
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
const tHeaders = ref([
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "product_name", align: "start", sortable: false },
  { title: "Cantidad", key: "cantidad", align: "start", sortable: false },
  { title: "Ancho", key: "ancho", align: "start", sortable: false },
  { title: "Alto", key: "alto", align: "start", sortable: false },
  { title: "Área Total", key: "area_total", align: "start", sortable: false },
  { title: "Precio", key: "precio_usado", align: "start", sortable: false },
  { title: "Importe", key: "precio_final", align: "start", sortable: false },
  { title: "Descuento", key: "importe_descuento", align: "start", sortable: false },
  { title: "Impuesto", key: "impuesto_traslado", align: "start", sortable: false },
  { title: "Existencia", key: "cantidad_actual", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "center", sortable: false },
]);
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
watch(keyword, () => {
  getAllProducts();
});

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
const setNombreTicketWrapper = async (nombre)=>{
  await setNombreTicket(nombre);
  await focusCodigoField();
  nombreT.value = '';
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
function abrirModalBuscaProductsNombre() {
  isVisible.value = true;
  getAllProducts();
}
function crearNuevoProducto() {
  router.push({ name: "ProductosIndex" });
}
function handleProductSelected(productId) {
  getProductById(productId);
  isVisible.value = false;
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
async function guardarVenta(imprimir) {
  if (amountExceedsTotal.value) {
    notify.warning("El monto excede el total");
    return;
  }
  if (amountUnderTotal.value) {
    notify.warning("El pago no cubre el total");
    return;
  }
  forma_pago.pago_con = pagocon.value;
  forma_pago.efectivo = efectivoCalculated.value;

  processRequest(async () => {
    const { data } = await PuntoVenta.guardarVenta(ticketActual.id, forma_pago, credito.value);
    openCobrar.value = false;
    if (imprimir) {
      print();
    }
    cargando.value = false;
    await init();
    focusCodigoField();
  }, cargando, {
    onSuccess: () => notify.success("La venta ha sido agregada exitosamente"),
    onError: (error) => {
      console.log(error);

      if (
        error?.data?.exception === "App\\Exceptions\\OperationalException" &&
        error?.data?.message?.includes("No has habilitado la caja")
      ) {
        notify.error(error?.data?.message);
        setTimeout(() => {
          router.push({ name: "Cortes" });
        }, 2000);
        return;
      }
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
  if (!telefono.value || telefono.value.length < 10) {
    notify.warning("Introduce un telefono valido");
    return;
  }
  forma_pago.pago_con = pagocon.value;
  forma_pago.efectivo = efectivoCalculated.value;

  processRequest(async () => {
    const response = await PuntoVenta.guardarVenta(ticketActual.id, forma_pago, credito.value);
    openCobrar.value = false;
    const localTelefono = telefono.value;

    cargando.value = false;
    await init();

    // Enviar a WhatsApp
    try {
      const waResponse = await PuntoVenta.sendVentaToWha(ticketActual.id, telefono.value);
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
}

// Initialize keyboard shortcuts after all functions are defined
useVentasKeyboardShortcuts({
  openCobrar: () => { openCobrar.value = true },
  setPendiente: setPendiente,
  abrirPendiente: abrirPendiente,
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

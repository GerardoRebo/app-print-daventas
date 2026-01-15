<template>
  <v-toolbar color="gray" density="compact">
    <v-toolbar-title class="text-secondary">Cotización</v-toolbar-title>
    <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
      @click="drawer = true">
      <!-- <v-icon >mdi-dots-vertical</v-icon> -->
      Ticket info
    </v-btn>
  </v-toolbar>
  <!-- Header Desktop-->
  <SalesHeaderCard ref="salesHeaderCardRef" v-if="mdAndUp" :ticket-actual="ticketActual" :almacen="almacen"
    :product-form="product_form" :price-options="priceOptions" :almacen-items="almacenItems" :articulos="articulos"
    :subtotal-computed="subtotalComputed" :descuento-computed="descuentoComputed" :impuesto-computed="impuestoComputed"
    :total-computed="totalComputed" :loading="cargando" :show-offline="showOffline" :product-actual-id="productActualId"
    :codigo="codigo" :nombre-t="nombreT" :action-button-label="'Guardar'" :action-button-icon="'mdi-check-circle'"
    :show-last-ticket-button="false" :show-shortcuts-button="false" @setPendiente="setPendienteWrapper"
    @abrirPendiente="abrirPendiente" @abrirCliente="abrirCliente" @goOffline="goOffline"
    @goPrimerArticulo="goPrimerArticulo" @enviarArticulo="enviarArticulo"
    @abrirModalBuscaProductsNombre="abrirModalBuscaProductsNombre" @borrarTicket="borrarTicketWrapper"
    @actionButtonClick="guardarVenta" @setNombreTicket="setNombreTicketWrapper" @abrirExistencias="abrirExistencias"
    @searchProduct="searchProduct" @update:codigo="codigo = $event" @showPrices="showPrices"
    @asignarAlmacen="asignarAlmacenWrapper" />
  <!-- Mobile Sales Card -->
  <MobileSalesCard v-if="mdAndDown" :codigo="codigo" :product-form="product_form" :almacen="almacen" :price-options="priceOptions"
    ref="salesHeaderCardRef" @update:codigo="codigo = $event" @goPrimerArticulo="goPrimerArticulo" @searchProduct="searchProduct"
    @abrirModalBuscaProductsNombre="abrirModalBuscaProductsNombre" @emptyValues="emptyValuesWrapper"
    @enviarArticulo="enviarArticulo" @abrirExistencias="abrirExistencias" @showPrices="showPrices" />
  <!-- Mobile Navigation Drawer -->
  <MobileDrawerCotizacion :model-value="drawer" @update:model-value="drawer = $event" :ticket-actual="ticketActual"
    :almacen-items="almacenItems" :subtotal-computed="subtotalComputed" :descuento-computed="descuentoComputed"
    :impuesto-computed="impuestoComputed" :total-computed="totalComputed" @guardarVenta="guardarVenta"
    @borrarTicket="borrarTicketWrapper" @setPendiente="setPendienteWrapper" @abrirPendiente="abrirPendiente"
    @abrirCliente="abrirCliente" @asignarAlmacen="asignarAlmacenWrapper" />

  <!-- Tabla -->
  <v-container fluid>
    <!-- Articles Table Component -->
    <ArticlesTable :articles="articulos" :headers="tHeaders" :loading="cargando" @edit="handleArticleEdit"
      @delete="destroyArticulo" @view-images="verImagenes" />
  </v-container>

  <!-- Busca Producto Nombre -->
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

  <!-- Existencias -->
  <InventoryDialog :model-value="openExistencias" :inventory="existencias" :product-name="product_form.name"
    @update:model-value="openExistencias = $event" />

  <!-- Ajuste Inventarios -->
  <ArticleEditDialog :model-value="edicion" :articulo="articulo_form" @update:model-value="edicion = $event"
    @confirm="editarArticulo" />

  <!-- Conversion Granel Dialog Component -->
  <ConversionGranelDialog :model-value="openConversion" :loading="cargando" :show-prices-icon="priceOptions?.length > 1"
    :conversion-form="conversion_form" :total-value="total" :on-modifica-precio-base="modificaPrecioBase"
    :on-modifica-peso="modificaPeso" :on-modifica-total="modificaTotal" @update:model-value="openConversion = $event"
    @confirm="aceptarConversionWrapper" @show-prices="showPrices" />

</template>

<script setup>
// ============================================================================
// IMPORTS - Librerías Vue y Composables
// ============================================================================
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
import Product from "@js/apis/Product";
import Cotizacion from "@js/apis/Cotizacion";
import Cliente from "@js/apis/Cliente";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";
import { useCotizacionManagement } from "@js/composables/cotizaciones/useCotizacionManagement";
import { useSearchCache } from '@js/composables/useSearchCache';
import { useCotizacionesKeyboardShortcuts } from '@js/composables/useKeyboardShortcuts';
import { useConversionGranel } from '@js/composables/useConversionGranel';
import { useProductForm } from '@js/composables/useProductForm';
import { useArticlesManagement } from '@js/composables/useArticlesManagement';
import { useTicketUI } from '@js/composables/useTicketUI';
import { createActionWrapper } from '@js/composables/useActionWrapper';
import { useDisplay } from "vuetify";
import { WebviewWindow } from '@tauri-apps/api/window';
import ArticlesTable from '../../components/ArticlesTable.vue';
import ArticleEditDialog from '../../components/ArticleEditDialog.vue';
import ClientSelectionDialog from '../../components/ClientSelectionDialog.vue';
import ProductSearchDialog from '@js/components/ProductSearchDialog.vue';
import PendingTicketsDialog from '../../components/PendingTicketsDialog.vue';
import InventoryDialog from '../../components/InventoryDialog.vue';
import SalesHeaderCard from '../../components/SalesHeaderCard.vue';
import MobileSalesCard from '../../components/MobileSalesCard.vue';
import MobileDrawerCotizacion from '../../components/MobileDrawerCotizacion.vue';
import ConversionGranelDialog from '../../components/ConversionGranelDialog.vue';

// ============================================================================
// INICIALIZACIONES - Utilities, Router, Notifications
// ============================================================================
const { processRequest } = useProcessRequest();
const { notify } = useNotification();
const router = useRouter();
const { xs, mdAndUp, mdAndDown } = useDisplay();

// ============================================================================
// COMPOSABLE: useCotizacionManagement
// ============================================================================
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
  codigoRef,
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
} = useCotizacionManagement();

// ============================================================================
// COMPOSABLE: useProductForm
// ============================================================================
const {
  codigo,
  productActualId,
  product_form,
  priceOptions,
  openExistencias,
  existencias,
  searchProduct,
  getProductById,
  aceptarConversion,
  emptyValues,
  showPrices,
  abrirExistencias,
} = useProductForm(ticketActual, almacen, {
  onOpenConversion: (data) => {
    conversion_form.precioBase = data.precioBase
    conversion_form.peso = data.peso
    total.value = data.total
    openConversion.value = true
  }
});

// ============================================================================
// COMPOSABLE: useConversionGranel
// ============================================================================
const {
  conversion_form,
  total,
  openConversion,
  modificaPrecioBase,
  modificaPeso,
  modificaTotal,
} = useConversionGranel();

// ============================================================================
// INSTANCIAS - Cache y Datos Reactivos
// ============================================================================
const productCache = useSearchCache({ ttlMs: 5 * 60 * 1000 });

// ============================================================================
// COMPONENT REFS - Referencias a Componentes
// ============================================================================
const salesHeaderCardRef = ref(null);

// ============================================================================
// STATE REFS - Variables Reactivas de Estado
// ============================================================================
const keyword = ref("");
const keycliente = ref("");
const products = ref([]);
const lastFetchTimeLocal = ref(null);
const pendientes = ref([]);
const clients = ref([]);
const isVisible = ref(false);
const openPendiente = ref(false);
const isOpenImagenes = ref(false);
const imagenes = ref([]);

// ============================================================================
// FOCUS MANAGEMENT - Gestión de Enfoque
// ============================================================================
const focusCodigoField = async () => {
  await nextTick();
  salesHeaderCardRef.value.focusCodigo();
};
// ============================================================================
// COMPOSABLE: useArticlesManagement
// ============================================================================
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
  articlesAPI: Cotizacion,
  emptyValues,
  getSpecificVT,
  focusCodigoField: focusCodigoField,
  fieldMapping: {
    precioField: 'precio' // Campo de precio en la API de Cotizaciones
  }
});
const emptyValuesWrapper = () => {
  emptyValues();
  // closeAllModals();
  drawer.value = false;
  isVisible.value = false;
  isOpenImagenes.value = false;
  openEdit.value = false;
  openPendiente.value = false;
  openConversion.value = false;
  focusCodigoField();
};

// ============================================================================
// TABLE HEADERS - Encabezados para la Tabla de Artículos
// ============================================================================
// Nota: Cotizaciones usa 'importe' en lugar de 'precio_final' como campo de subtotal
// Ver useArticlesManagement.js y useCotizacionManagement.js para field mapping
const tHeaders = ref([
  { title: 'Código', key: 'codigo', align: 'start', sortable: false },
  { title: 'Nombre', key: 'product_name', align: 'start', sortable: false },
  { title: 'Cantidad', key: 'cantidad', align: 'start', sortable: false },
  { title: 'Precio', key: 'precio_usado', align: 'start', sortable: false },
  { title: 'Importe', key: 'importe', align: 'start', sortable: false },
  { title: 'Descuento', key: 'importe_descuento', align: 'start', sortable: false },
  { title: 'Impuesto', key: 'impuesto_traslado', align: 'start', sortable: false },
  { title: 'Existencia', key: 'cantidad_actual', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
]);

// ============================================================================
// COMPUTED PROPERTIES - Propiedades Calculadas
// ============================================================================
// Usar useTicketUI para propiedades compartidas
const { showOffline, goOffline, almacenItems } = useTicketUI(almacens, router);

// ============================================================================
// WATCHERS - Observadores de Cambios
// ============================================================================
watch(keycliente, () => {
  getAllClientes();
});

watch(keyword, () => {
  getAllProducts();
});

// ============================================================================
// WRAPPER FUNCTIONS - Funciones Envoltorio para Composables (useActionWrapper)
// ============================================================================
const asignarAlmacenWrapper = createActionWrapper(asignarAlmacen, focusCodigoField, emptyValuesWrapper);
const borrarTicketWrapper = createActionWrapper(borrarTicket, focusCodigoField, emptyValuesWrapper);
const setClienteWrapper = createActionWrapper(setCliente, focusCodigoField, emptyValuesWrapper);
const setPendienteWrapper = createActionWrapper(setPendiente, focusCodigoField, emptyValuesWrapper);
const setNombreTicketWrapper = async (nombre)=>{
  nombreT.value = nombre;
  await setNombreTicket();
  await focusCodigoField();
  nombreT.value = '';
}

const aceptarConversionWrapper = (conversionData) => {
  aceptarConversion(conversionData);
  enviarArticulo();
  openConversion.value = false;
  focusCodigoField();
};

// ============================================================================
// BUSINESS LOGIC FUNCTIONS - Funciones de Lógica de Negocio
// ============================================================================
function getAllProducts() {
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

// ============================================================================
// HELPER FUNCTIONS - Funciones de Ayuda
// ============================================================================

function getAllPendientes() {
  if (cargando.value) return;
  processRequest(async () => {
    const response = await Cotizacion.getAllPendientes();
    pendientes.value = response.data;
  }, cargando, {
  });
}

function getAllClientes() {
  if (cargando.value) return;
  processRequest(async () => {
    const response = await Cliente.getAllClientes(keycliente.value);
    clients.value = response.data;
  }, cargando, {
  });
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

function goPrimerArticulo() {
  var elementos = document.getElementsByClassName("articulosInputs");
  elementos[0].focus();
}

function verImagenes(images) {
  imagenes.value = images;
  isOpenImagenes.value = true;
}

function seleccionarPendiente(id) {
  getSpecificVT(id);
  openPendiente.value = false;
  focusCodigoField();
}

function precioMayoreo() {
  if (product_form.pventa != product_form.pventa_base) {
    product_form.pventa = product_form.pventa_base;
  } else {
    product_form.pventa = product_form.precio_mayoreo;
  }
}

function guardarVenta(imprimir) {
  if (!almacen.id) {
    notify.error("Elige un almacen")
    return
  }
  let conf = confirm("Estas Seguro?");
  if (!conf) return
  if (cargando.value) return;
  processRequest(async () => {
    const response = await Cotizacion.guardarVenta(ticketActual.id);
    console.log(response.data, "res");
    router.push({ name: "CotizacionesShow", params: { cotizacionId: response.data.id } })
    notify.success("La cotizacion se ha generado con exito")
  }, cargando, {
  });
}

function imprimirVenta() {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirVentas', {
      url: `cotizacions/imprimir/${ticketActual.id}`,
      title: 'Imprimir Venta'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/cotizacions/imprimir/${ticketActual.id}`,
    "_blank",
    "noreferrer"
  );
}

function archivar(imprimir) {
  if (cargando.value) return;
  processRequest(async () => {
    await Cotizacion.archivar(ticketActual.id);
    init();
    notify.success("La cotizacion se ha generado con exito")
  }, cargando, {
  });
}

// ============================================================================
// KEYBOARD SHORTCUTS - Inicialización de Atajos de Teclado
// ============================================================================
useCotizacionesKeyboardShortcuts({
  precioMayoreo,
  setPendiente,
  abrirPendiente,
  abrirModalBuscaProductsNombre,
  abrirExistencias,
  emptyValuesWrapper: emptyValuesWrapper,
  codigoRef,
  router,
  routerName: 'CotizacionesIndex'
});

// ============================================================================
// LIFECYCLE HOOKS - Ciclo de Vida
// ============================================================================
onMounted(() => {
  // Limpiar caché de búsquedas al montar el componente
  productCache.clear();
  focusCodigoField();
  init();
});

onUnmounted(() => {
  // Cleanup automático en composables
});
</script>

<style scoped>
.v-chip {
  font-weight: 500;
  font-family: monospace;
}

.ring:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 114, 191, 0.5);
  /* Blue ring effect */
}
</style>

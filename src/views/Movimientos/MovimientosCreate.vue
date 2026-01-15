<template>
  <v-toolbar color="gray" density="compact">
    <!-- <v-icon color="primary" class="ml-2">mdi-truck</v-icon> -->
    <v-toolbar-title class="text-secondary">Movimientos</v-toolbar-title>
    <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
      @click="drawer = true">
      Movimiento info
    </v-btn>
  </v-toolbar>

  <!-- Desktop Header Component -->
  <MovementHeaderCard ref="movementHeaderCardRef" v-if="mdAndUp" :movimientoActual="movimientoActual" :almacen="almacen"
    :almacenDestino="almacenDestino" :codigo="codigo" :productForm="product_form" :almacenItems="almacenItems"
    :destinoAlmacenItems="destinoAlmacenItems" :articulos="articulos" :subtotalComputed="subtotalComputed"
    :impuestoComputed="impuestoComputed" :totalComputed="totalComputed" :loading="cargando"
    :almacen-destino="almacenDestino" :almacen-items="almacenItems" :destino-almacen-items="destinoAlmacenItems"
    :visible-almacen-destino="visibleAlmacenDestino" @update:almacenDestino="almacenDestino = $event"
    @borrarTicket="handleBorrarTicket" :mostrarGuardar="mostrarGuardar" :proveedor="proveedor"
    @setPendiente="handleSetPendiente" @abrirPendiente="abrirPendiente" @abrirProveedor="abrirProveedor"
    @abrirFolioFactura="abrirFolioFactura" @setMovimiento="handleSetMovimiento" @asignarAlmacen="asignarAlmacenWrapper"
    @goPrimerArticulo="goPrimerArticulo" @searchProduct="searchProduct" @enviarArticulo="enviarArticulo"
    @abrirModalBuscaProductsNombre="abrirModalBuscaProductsNombre" @abrirExistencias="abrirExistencias"
    @guardar="guardar" @update:codigo="codigo = $event" />

  <!-- Mobile Card Component -->
  <MobileMovementCard ref="movementHeaderCardRef" v-if="mdAndDown" :codigo="codigo" :productForm="product_form"
    :almacen="almacen" @goPrimerArticulo="goPrimerArticulo" @searchProduct="searchProduct"
    @abrirModalBuscaProductsNombre="abrirModalBuscaProductsNombre" @emptyValues="emptyValuesWrapper"
    @enviarArticulo="enviarArticulo" @abrirExistencias="abrirExistencias" @update:codigo="codigo = $event" />

  <MobileMovementNavigationDrawer :model-value="drawer" @update:modelValue="drawer = $event"
    :mostrar-guardar="mostrarGuardar" :movimiento-actual="movimientoActual" :almacen="almacen"
    @update:almacen="almacen = $event" :almacen-destino="almacenDestino"
    @update:almacenDestino="almacenDestino = $event" :almacen-items="almacenItems"
    :destino-almacen-items="destinoAlmacenItems" :visible-almacen-destino="visibleAlmacenDestino"
    :subtotal-computed="subtotalComputed" :impuesto-computed="impuestoComputed" :total-computed="totalComputed"
    :proveedor="proveedor" @guardar="guardar('ambos')" @borrarTicket="handleBorrarTicket"
    @setPendiente="handleSetPendiente" @abrirPendiente="abrirPendiente" @abrirProveedor="abrirProveedor"
    @abrirFolioFactura="abrirFolioFactura" @setMovimiento="handleSetMovimiento"
    @asignarAlmacen="asignarAlmacenWrapper" />

  <!-- Movement Articles Table -->
  <MovementArticlesTable :articulos="articulos" :loading="cargando" @view-images="verImagenes"
    @edit="(item) => abrirEdicion(item.id, item.product_name ?? item.product?.name, item.costo_al_ordenar, item.cantidad_ordenada)"
    @delete="destroyArticuloWrapper" />

  <!-- Busca Producto Nombre-->
  <ProductSearchDialog :model-value="isVisible" :products="products" :keyword="keyword" :loading="cargando"
    :last-fetch-time="lastFetchTimeLocal" @update:model-value="isVisible = $event" @update:keyword="keyword = $event"
    @product-selected="handleProductSelected" @refresh="getAllProducts" @create-product="crearNuevoProducto" />
  <!-- Proveedores -->
  <ProveedorSelectionDialog :model-value="openProveedor" :providers="proveedors" :keyword="keyproveedor"
    :loading="cargandoConcurrent" @update:model-value="openProveedor = $event" @update:keyword="keyproveedor = $event"
    @proveedor-selected="handleSetProveedor" />
  <!-- Folio Factura -->
  <FolioFacturaDialog :model-value="isOpenFolioFactura" :folio="folioFactura"
    @update:model-value="isOpenFolioFactura = $event" @confirm="handleFolioFacturaConfirm" />
  <!-- Pendientes -->
  <PendingMovementsDialog :model-value="openPendiente" :pending-movements="pendientes" :loading="cargandoConcurrent"
    @update:model-value="openPendiente = $event" @movement-selected="seleccionarPendiente" />
  <!-- Existencias -->
  <InventoryDialog :model-value="openExistencias" :inventory="existencias" :product-name="product_form.name"
    @update:model-value="openExistencias = $event" />
  <!-- Editar Articulo -->
  <MovementArticleEditDialog :model-value="edicion" :article-name="articulo_form.name" :cost="articulo_form.pcosto"
    :quantity="articulo_form.cantidad" @update:model-value="edicion = $event" @confirm="handleArticleEditConfirm" />
  <!-- Cambio de Precio -->
  <PriceDifferenceDialog :model-value="openCambiaPrecio" :product-id="productActualId" :old-cost="articulo_form.ucosto"
    :new-cost="articulo_form.pcosto" :old-price="articulo_form.pventa" :old-medio="articulo_form.precio_medio_mayoreo"
    :old-mayoreo="articulo_form.precio_mayoreo" :suggestions="{
      precio: product_form.precio_sugerido,
      precio_medio: product_form.precio_medio_mayoreo_sugerido,
      precio_mayoreo: product_form.precio_mayoreo_sugerido,
    }" :errors="errors" @update:model-value="openCambiaPrecio = $event" @confirm-single="handlePriceSingle"
    @confirm-general="handlePriceGeneral" />
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
import Product from "@js/apis/Product";
import Movimientos from "@js/apis/Movimientos";
import Proveedor from "@js/apis/Proveedor";
import { useUserStore } from "@js/s/index.js";
import { useDisplay } from "vuetify";
import { useProcessRequest } from '@js/composables/useProcessRequest';
import { useNotification } from '@js/composables/useNotification';
import { useMovimientosKeyboardShortcuts } from '@js/composables/useKeyboardShortcuts';
import { useMovementManagement } from '@js/composables/movements/useMovementManagement';
import { useMovementProductSearch } from '@js/composables/movements/useMovementProductSearch';
import { useMovementArticlesManagement } from '@js/composables/movements/useMovementArticlesManagement';
import MovementHeaderCard from '@js/components/MovementHeaderCard.vue';
import MobileMovementCard from '@js/components/MobileMovementCard.vue';
// import MobileMovementSubheader from '@js/components/MobileMovementSubheader.vue';
import MobileMovementNavigationDrawer from '@js/components/MobileMovementNavigationDrawer.vue';
import MovementArticlesTable from '@js/components/MovementArticlesTable.vue';
import InventoryDialog from '@js/components/InventoryDialog.vue';
import ProductSearchDialog from '@js/components/ProductSearchDialog.vue';
import ProveedorSelectionDialog from '@js/components/ProveedorSelectionDialog.vue';
import PendingMovementsDialog from '@js/components/PendingMovementsDialog.vue';
import MovementArticleEditDialog from '@js/components/MovementArticleEditDialog.vue';
import FolioFacturaDialog from '@js/components/FolioFacturaDialog.vue';
import PriceDifferenceDialog from '@js/components/PriceDifferenceDialog.vue';

const { xs, mdAndUp, mdAndDown } = useDisplay();
const router = useRouter();
const store = useUserStore();
const { processRequest, concurrentRequest } = useProcessRequest();
const { notify } = useNotification();

const movementHeaderCardRef = ref(null);
const focusCodigoField = () => {
  movementHeaderCardRef.value.focusCodigo?.();
  // salesHeaderCardRef.value.focusCodigo?.();
};
// Use movement management composable
const {
  movimientoActual,
  almacen,
  almacenDestino,
  articulos,
  almacens,
  destinoAlmacens,
  cargando,
  cargandoConcurrent,
  totalComputed,
  subtotalComputed,
  impuestoComputed,
  solicitudT,
  visibleAlmacenDestino,
  almacenItems,
  destinoAlmacenItems,
  proveedor,
  init,
  getSpecificVT,
  asignarAlmacen,
  borrarTicket,
  setMovimiento,
  setProveedor,
  setPendiente,
  updateFolioFactura,
} = useMovementManagement();

// Use movement product search composable
const {
  codigo,
  productActualId,
  product_form,
  codigoRef,
  searchProduct,
  getProductById,
  limpiarCampos,
} = useMovementProductSearch(movimientoActual, almacen);

// Use movement articles management composable
const {
  articuloActualId,
  articulo_form,
  edicion,
  openCambiaPrecio,
  handleArticleEdit,
  editarArticulo,
  enviarArticulo,
  destroyArticulo,
  handlePriceSingle,
  handlePriceGeneral,
} = useMovementArticlesManagement({
  movimientoActual,
  product_form,
  productActualId,
  movimientosAPI: Movimientos,
  emptyValues: emptyValuesWrapper,
  getSpecificVT,
  focusCodigoField
});


// Table headers
// const tHeaders = ref([
//   { title: "Código", key: "codigo", align: "start", sortable: false },
//   { title: "Nombre", key: "name", align: "start", sortable: false },
//   {
//     title: "Cantidad",
//     key: "cantidad_ordenada",
//     align: "start",
//     sortable: false,
//   },
//   { title: "Costo", key: "costo_al_ordenar", align: "start", sortable: false },
//   {
//     title: "Importe",
//     key: "total_al_ordenar",
//     align: "start",
//     sortable: false,
//   },
//   {
//     title: "Descuento",
//     key: "importe_descuento",
//     align: "start",
//     sortable: false,
//   },
//   {
//     title: "Impuesto",
//     key: "impuestos_al_enviar",
//     align: "start",
//     sortable: false,
//   },
//   { title: "Precio", key: "precio", align: "start", sortable: false },
//   {
//     title: "Existencia",
//     key: "cantidad_actual",
//     align: "start",
//     sortable: false,
//   },
//   { title: "Acciones", key: "actions", sortable: false },
// ]);

// Local UI state (modals, dialogs, forms)
const drawer = ref(false);
const keyword = ref("");
const lastFetchTimeLocal = ref(null);
const keyproveedor = ref("");
const timeOut = ref("");
const existencias = ref([]);
const products = ref([]);
const pendientes = ref([]);
const proveedors = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const openEdit = ref(false);
const openExistencias = ref(false);
const openProveedor = ref(false);
const isOpenFolioFactura = ref(false);
const folioFactura = ref('');
const openPendiente = ref(false);

// Computed - Local UI logic
const mostrarGuardar = computed(() => {
  if (solicitudT.value == true) {
    let myAlmaKeys = store.myAlmacens.map((almacen) => almacen.id);
    return myAlmaKeys.includes(movimientoActual.almacenOrigenId);
  } else {
    return true;
  }
});

watch(keyword, () => {
  getAllProducts();
});
watch(keyproveedor, () => {
  getAllProveedors();
});

// Initialize keyboard shortcuts
useMovimientosKeyboardShortcuts({
  setPendiente: handleSetPendiente,
  abrirPendiente,
  abrirModalBuscaProductsNombre,
  abrirExistencias,
  emptyValuesWrapper,
  codigoRef,
  router,
  routerName: 'MovimientosIndex',
});
// Wrapper function for article editing - maps local state to composable method
function abrirEdicion(id, name, pcosto, cantidad) {
  articulo_form.name = name;
  articulo_form.pcosto = pcosto;
  articulo_form.cantidad = cantidad;
  articuloActualId.value = id;
  handleArticleEdit({ id, name, cantidadActual: null, cantidad_ordenada: cantidad, costo_al_ordenar: pcosto });
  edicion.value = true;
}

function handleProductSelected(productId) {
  getProductById(productId);
  isVisible.value = false;
}

// Wrapper function for article edit confirm - prepares data and calls composable method
function handleArticleEditConfirm(formData) {
  articulo_form.pcosto = formData.pcosto;
  articulo_form.cantidad = formData.cantidad;
  editarArticulo();
}
function getAllProducts() {
  processRequest(async () => {
    const response = await Product.searchKeyWord(keyword.value, almacen.id);
    products.value = response.data;
  }, cargando, {
    onError: (error) => notify.error(error)
  });
}
function getAllPendientes() {
  concurrentRequest(async () => {
    const response = await Movimientos.getAllPendientes();
    pendientes.value = response.data;
  }, cargandoConcurrent, {
    onError: (error) => notify.error(error)
  });
}
function getAllProveedors() {
  concurrentRequest(async () => {
    const response = await Proveedor.search(keyproveedor.value);
    proveedors.value = response.data;
  }, cargandoConcurrent, {
  });
}

function abrirModalBuscaProductsNombre() {
  isVisible.value = true;
  getAllProducts();
}
function crearNuevoProducto() {
  router.push({ name: "ProductosIndex" });
}
async function handleBorrarTicket() {
  let conf = await confirm("Estas Seguro de Borrar el Ticket?");
  if (conf) {
    await borrarTicket();
    await nextTick();
    emptyValuesWrapper();

    focusCodigoField();
  }
}
async function handleFolioFacturaConfirm(folio) {
  folioFactura.value = folio;
  await updateFolioFactura(folio);
  isOpenFolioFactura.value = false;
  await nextTick();
  focusCodigoField();

}
function abrirProveedor() {
  openProveedor.value = true;
  nextTick(() => document.getElementById("keyproveedor").select());
  getAllProveedors();
}

function abrirFolioFactura() {
  isOpenFolioFactura.value = true;
}

function abrirPendiente() {
  openPendiente.value = true;
  getAllPendientes();
}

// Local wrapper for setProveedor with UI updates
function handleSetProveedor(proveedor) {
  setProveedor(proveedor);
  openProveedor.value = false;
  nextTick();
  focusCodigoField();
}

// Local wrapper for setPendiente with confirmation
async function handleSetPendiente() {
  if (!(await confirm("Seguro que quieres dejar el movimiento pendiente?"))) return;
  setPendiente();
  focusCodigoField();
}
async function destroyArticuloWrapper(articulo) {
  destroyArticulo(articulo.id);
  await nextTick();
  focusCodigoField();
}
async function asignarAlmacenWrapper() {
  asignarAlmacen(almacen.id);
  await nextTick();
  focusCodigoField();
}

function abrirExistencias(productId = null) {
  if (productId == null) {
    productId = productActualId.value;
  }
  if (productId == null) {
    notify.warning("No has seleccionado un producto");
    return;
  }

  openExistencias.value = true;
  concurrentRequest(async () => {
    const response = await Movimientos.getExistencias(productId);
    existencias.value = response.data;
  }, cargandoConcurrent, {});
}
async function guardar(tipo) {
  if (!(await confirm("Estas seguro de guardar el movimiento?"))) return;
  if (
    movimientoActual.almacenOrigenId == null ||
    movimientoActual.tipo == null
  ) {
    notify.warning("Te falta seleccionar tipo de movimiento o almacén.");
    return;
  }

  processRequest(async () => {
    const response = await Movimientos.guardar(movimientoActual.id, tipo);
    cargando.value = false;
    if (response.data == "No has habilitado caja") {
      notify.warning("No has habilitado caja");
    }
    await init();
    await nextTick();
    focusCodigoField();
  }, cargando, {
  });
}
function goPrimerArticulo() {
  var elementos = document.getElementsByClassName("articulosInputs");
  elementos[0].focus();
}
// Local wrapper for setMovimiento from composable
function handleSetMovimiento($id) {
  setMovimiento($id);
  focusCodigoField();
}
function makeUpdate(e) {
  const task = () => (keyword.value = e.target.value);
  debounce(task, 500);
}
function debounce(func, wait = 1000) {
  clearTimeout(timeOut.value);
  timeOut.value = setTimeout(func, wait);
}
async function emptyValuesWrapper() {
  limpiarCampos();
  drawer.value = false;
  isVisible.value = false;
  openExistencias.value = false;
  openEdit.value = false;
  edicion.value = false;
  openPendiente.value = false;
  openProveedor.value = false;
  openCambiaPrecio.value = false;
  errors.value = [];
  await nextTick()
  focusCodigoField();
}
function verImagenes(images) {
  // Placeholder for image viewing
  notify.info('Ver imágenes');
}
function seleccionarPendiente(id) {
  getSpecificVT(id);
  openPendiente.value = false;
  focusCodigoField();
}
onMounted(async () => {
  await init();
  focusCodigoField();
});

onUnmounted(() => {
  // Cleanup handled by composable
});
</script>

<style>
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
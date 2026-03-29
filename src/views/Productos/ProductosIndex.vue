<template>
  <!-- <BannerVue v-if="isBannerOpen" @hide-banner="hideBanner">
    <span>Que bien, vas increible, ahora sí... A vender!!</span>
    <RouterLink :to="{ name: 'PuntoVenta' }" class="font-bold underline" @click="hideBanner">Click Aqui</RouterLink>
  </BannerVue> -->
  <v-toolbar density="compact" color="gray">
    <v-toolbar-title class="text-secondary">Catálogo Productos
    </v-toolbar-title>
    <v-btn color="primary" icon v-if="mdAndDown">
      <v-icon @click="abrirProducto">mdi-plus-circle-outline</v-icon>
    </v-btn>
    <v-btn class="hidden-xs-only" icon v-if="mdAndDown">
      <v-icon @click="drawer = true">mdi-filter</v-icon>
    </v-btn>
  </v-toolbar>
  <!-- Header Desktop -->
  <v-container fluid class="py-0 mt-2">
    <v-card v-if="mdAndUp">
      <v-container fluid>
        <v-row class="mb-2">
          <v-btn @click="abrirProducto" small class="ma-2" prepend-icon="mdi-plus" color="primary" variant="outlined">
            Crear Producto
          </v-btn>
          <!-- <v-btn @click="abrirService" small class="ma-2 text-blue" prepend-icon="mdi-plus" variant="text">
            Crear Servicio
          </v-btn> -->
          <v-select :items="almacensItems" label="Almacen" v-model="almacenActualId" class="ma-2" max-width="200"
            color="secondary" hide-details :error-messages="almacenActualId ? [] : ['No has seleccionado un almacén']"></v-select>
          <!-- Departamentos -->
          <v-select :items="departamentosItems" label="Departamento" v-model="departamentoActualId" class="ma-2"
            max-width="200" clearable color="secondary" hide-details></v-select>
          <!-- Proveedors -->
          <v-select :items="proveedorsItems" label="Proveedor" v-model="proveedorActualId" class="ma-2" max-width="200"
            clearable color="secondary" hide-details></v-select>
          <v-spacer></v-spacer>
          <v-checkbox v-model="bajostock" label="Bajo stock" hide-details></v-checkbox>
          <v-checkbox v-model="prioritario" label="Prioritarios" hide-details></v-checkbox>
        </v-row>
      </v-container>
    </v-card>
  </v-container>

  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary
    v-if="mdAndDown">
    <v-card>
      <v-container>
        <v-select :items="almacensItems" label="Almacen" density="compact" v-model="almacenActualId"
          class="ma-2"></v-select>

        <!-- Departamentos -->
        <v-select :items="departamentosItems" label="Departamento" density="compact" v-model="departamentoActualId"
          class="ma-2" clearable></v-select>
        <!-- Proveedors -->
        <v-select :items="proveedorsItems" label="Proveedor" density="compact" v-model="proveedorActualId" class="ma-2"
          clearable></v-select>
        <v-checkbox v-model="bajostock" label="Bajo stock" density="compact"></v-checkbox>
        <v-checkbox v-model="prioritario" label="Prioritarios" density="compact"></v-checkbox>
      </v-container>
    </v-card>
  </v-navigation-drawer>
  <!-- Tabla -->
  <v-container fluid>
    <v-text-field v-model="keyword" label="Buscar Producto" prepend-inner-icon="mdi-magnify" variant="solo-filled" flat
      hide-details single-line ref="keywordRef" color="primary" clearable></v-text-field>
    <v-progress-linear color="primary" v-if="!cargando" model-value="100"></v-progress-linear>
    <v-progress-linear color="primary" indeterminate v-if="cargando || cargandoConcurrent" model-value="100"></v-progress-linear>
    <v-table density="compact" fixed-header height="50vh" hover>
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <TableRow v-for="product in products.data" :key="product.id" :product="product" @ajuste-product="ajusteProduct"
          @destroy-product="destroyProduct" @abrir-existencias="abrirExistencias"></TableRow>
      </tbody>
    </v-table>
  </v-container>
  <v-row class="ma-1" justify="end">
    <v-pagination v-model="page" :length="products.last_page" :total-visible="5" density="compact"></v-pagination>
  </v-row>
  <!-- Crear Producto -->
  <v-dialog v-model="isVisible" max-width="800">
    <ProductForm
      ref="productFormRef"
      v-model="product_form"
      :errors="errors"
      :loading="cargando"
      title="Crear Producto"
      submit-text="Confirmar"
      @submit="enviarProduct"
      @cancel="closeModal"
      @update:model-value="handleProductFormUpdate"
    />
  </v-dialog>
  <!-- Crear Servicio -->
  <v-dialog v-model="isCreateServiceVisible" max-width="800">
    <v-card>
      <v-card-title>Crea Servicio Aquí</v-card-title>
      <v-card-text>
        <v-text-field label="Código" id="cod" autocomplete="off" placeholder="" density="compact"
          :error-messages="errors.codigo ? errors.codigo[0] : null" v-model="product_form.codigo" />
        <v-text-field label="Nombre" id="name" autocomplete="off" placeholder="" density="compact"
          :error-messages="errors.name ? errors.name[0] : null" v-model="product_form.name" />
        <v-textarea label="Descripción" id="descripcion" autocomplete="off" placeholder="" density="compact"
          variant="outlined" :error-messages="errors.descripcion ? errors.descripcion[0] : null"
          v-model="product_form.descripcion" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="closeModal" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="enviarService" :loading="cargando" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Existencias-->
  <v-dialog v-model="openExistencias" max-width="1200">
    <v-card>
      <v-card-title>Existencias</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="2">
            <v-row class="d-flex flex-column">
              <p>Historial</p>
              <v-btn size="small" class="ma-2" :to="{
                name: 'Historial',
                params: {
                  almacenId: almacenActualId,
                  productId: productActualId || 0,
                },
              }">Inventario</v-btn>
              <v-btn size="small" class="ma-2" :to="{
                name: 'HistorialCosto',
                params: {
                  almacenId: almacenActualId,
                  productId: productActualId || 0,
                },
              }">Costo</v-btn>
              <v-btn size="small" class="ma-2" :to="{
                name: 'HistorialPrecio',
                params: {
                  almacenId: almacenActualId,
                  productId: productActualId || 0,
                },
              }">Precio</v-btn>
            </v-row>
          </v-col>
          <v-col cols="12" sm="10">
            <v-data-table :headers="existenciasHeaders" :items="existencias" items-per-page="5">
              <template v-slot:item.data-table-select="{
                internalItem,
                isSelected,
                toggleSelect,
                index,
              }">
                <v-checkbox-btn :model-value="isSelected(internalItem)" color="primary"
                  @update:model-value="toggleSelect(internalItem)" class="articulosInputs"></v-checkbox-btn>
              </template>
              <template v-slot:item.product_name="{ item }">
                <span>{{ item.product?.name }}</span>
              </template>
              <template v-slot:item.almacen="{ item }">
                <span>{{ item.almacen?.name }}</span>
              </template>
              <template v-slot:item.codigo="{ item }">
                <span>{{ item.product?.codigo }}</span>
              </template>
              <template v-slot:item.pcosto="{ item }">
                <span>${{ formatNumber(item.product?.pcosto) }}</span>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions> </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Ajuste Inventarios -->
  <v-dialog v-model="openAjuste" max-width="650">
    <v-card>
      <v-card-title class="pb-1">
        <div>
          <div class="text-subtitle2 font-weight-bold">Ajusta inventario - precio</div>
          <div class="text-caption text-medium-emphasis" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {{ inventario_form.name }}
          </div>
        </div>
      </v-card-title>
      
      <v-divider class="my-2"></v-divider>
      
      <v-card-text class="pt-4 pb-0">
        <!-- Almacén Chip -->
        <div class="mb-3">
          <v-chip
            label
            size="small"
            variant="outlined"
            color="primary"
            class="cursor-pointer"
            @click="openAlmacenSheet = true"
          >
            {{ almacenAjusteInventario }}
          </v-chip>
        </div>
        <!-- Sección Inventario -->
        <template v-if="!inventario_form.is_service">
          <div class="mb-4">
            <div class="text-caption text-primary font-weight-bold mb-2">INVENTARIO</div>
            <p class="text-caption text-medium-emphasis mb-2">Cantidad actual: <span class="font-weight-bold text-h6 text-primary">{{ inventario_form.cantidadActual }}</span></p>
            <v-text-field 
              label="Nueva Cantidad" 
              id="cantidadId" 
              autocomplete="off" 
              density="compact"
              variant="outlined"
              @keydown.enter="ajusteInventarioGeneral" 
              v-model="inventario_form.cantidad"
            />
          </div>
          <v-divider class="my-4"></v-divider>
        </template>

        <!-- Sección Costos -->
        <template v-if="!inventario_form.is_service">
          <div class="mb-4">
            <div class="text-caption text-primary font-weight-bold mb-2">COSTO</div>
            <v-text-field 
              label="Precio Costo" 
              id="pcosto" 
              autocomplete="off"
              density="compact"
              variant="outlined"
              v-model="inventario_form.pcosto"
              @keydown.enter="ajusteInventarioGeneral"
            />
          </div>
          <v-divider class="my-4"></v-divider>
        </template>

        <!-- Sección Precios -->
        <div>
          <div class="text-caption text-success font-weight-bold mb-2">PRECIOS</div>
          
          <div class="mb-3">
            <v-text-field 
              :label="inventario_form.precio_sugerido
                ? 'Precio Venta (Sugerido: $' + formatNumber(inventario_form.precio_sugerido) + ')'
                : 'Precio Venta'
              " 
              id="pventa"
              autocomplete="off"
              density="compact"
              variant="outlined"
              color="success"
              v-model="inventario_form.pventa"
              @keydown.enter="ajusteInventarioGeneral"
            />
          </div>

          <!-- Precios Mayoreo -->
          <div class="pa-3 bg-blue-grey-lighten-5 rounded">
            <div class="text-caption font-weight-bold text-primary mb-2">Mayoreo (opcional)</div>
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field 
                  label="Medio Mayoreo" 
                  id="precio_medio_mayoreo" 
                  autocomplete="off"
                  density="compact"
                  variant="outlined"
                  v-model="inventario_form.precio_medio_mayoreo"
                  @keydown.enter="ajusteInventarioGeneral"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field 
                  label="Full Mayoreo" 
                  id="precio_mayoreo" 
                  autocomplete="off"
                  density="compact"
                  variant="outlined"
                  v-model="inventario_form.precio_mayoreo"
                  @keydown.enter="ajusteInventarioGeneral"
                />
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Sección Justificación -->
        <div class="mt-4">
          <div class="text-caption text-medium-emphasis font-weight-bold mb-2">JUSTIFICACIÓN (OPCIONAL)</div>
          <v-textarea
            label="Describe el motivo del ajuste"
            id="justificacion"
            autocomplete="off"
            density="compact"
            variant="outlined"
            rows="3"
            v-model="inventario_form.justificacion"
            placeholder="Ej: Auditoría, daño de mercancía, error anterior..."
          />
        </div>
      </v-card-text>

      <v-divider class="my-2"></v-divider>
      <v-card-actions class="pa-3">
        <v-btn @click="openAjuste = false" :loading="cargando" size="small">Cancelar</v-btn>
        <v-spacer></v-spacer>
        <v-tooltip text="Ajustar inventario y precios de este producto en todos los almacenes">
          <template #activator="{ props }">
            <v-btn v-bind="props" @click="ajusteInventarioGeneral" :loading="cargando" variant="outlined"   color="" size="small">
              Guardar General
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Ajustar solo este almacén">
          <template #activator="{ props }">
            <v-btn v-bind="props" @click="ajusteInventario" :loading="cargando" variant="outlined" color="primary" size="small">
              Guardar
            </v-btn>
          </template>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- Bottom Sheet - Detalles Producto y Almacén -->
  <v-bottom-sheet v-model="openAlmacenSheet" max-width="500">
    <v-card rounded="t-xl">
      <v-card-title class="text-center pt-4">Detalles</v-card-title>
      <v-card-text class="pa-4">
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis mb-1">PRODUCTO</div>
          <div class="text-body2 font-weight-bold">{{ inventario_form.name }}</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="mt-4">
          <div class="text-caption text-medium-emphasis mb-1">ALMACÉN</div>
          <div class="text-body2 font-weight-bold">{{ almacenAjusteInventario }}</div>
        </div>
      </v-card-text>
      <v-card-actions justify="center" class="pb-4">
        <v-btn color="primary" variant="tonal" @click="openAlmacenSheet = false">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>
<style scoped></style>
<script setup>
import {
  onMounted,
  onUnmounted,
  ref,
  reactive,
  watch,
  computed,
  nextTick,
} from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import Product from "@js/apis/Product";
import Almacen from "@js/apis/Almacen";
import PuntoVenta from "@js/apis/PuntoVenta";
import Departamento from "@js/apis/Departamento";
import Proveedor from "@js/apis/Proveedor";
import { useUserStore } from "@js/s";
import useQuery from "@js/composables/useQuery";
import User from "@js/apis/User";
import { useDisplay } from "vuetify";
import { useNotification } from "@js/composables/useNotification";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import TableRow from "@js/views/Productos/Components/TableRow.vue";
import ProductForm from "@js/views/Productos/Components/ProductForm.vue";
import { useCurrency } from '@js/composables/useCurrency';
const { formatNumber } = useCurrency('es-MX', 'MXN');
const { xs, mdAndUp, mdAndDown } = useDisplay();
let { pushQuery } = useQuery();

const store = useUserStore();
const { notify } = useNotification();
const { processRequest, concurrentRequest } = useProcessRequest();
function onEscape(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    openAjuste.value = false;
    openExistencias.value = false;
    closeModal();
    focusKeyword();
  }
  if (e.key === "F9") {
    focusKeyword();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "ArrowRight") {
    getNextPage();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "ArrowLeft") {
    getPreviousPage();
  }
}
const router = useRouter();
const route = useRoute();

// Helper function to truncate long almacen names
function truncateAlmacen(text, maxLength) {
  if (text && text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}
const product_form = reactive({
  codigo: null,
  name: "",
  descripcion: "",
  porcentaje_ganancia: "",
  tventa: "U",
  pcosto: "",
  prioridad: "0",
  es_kit: "0",
  consumible: null,
  necesita_produccion: false,
  usa_medidas: false,
  es_presentacion_de_compra: "1",
});
const inventario_form = reactive({
  name: "",
  cantidadActual: null,
  is_service: null,
  cantidad: null,
  pcosto: null,
  pventa: null,
  precio_mayoreo: null,
  precio_medio_mayoreo: null,
  precio_sugerido: null,
  justificacion: "",
});
const drawer = ref(true);
const cargando = ref(false);
const cargandoConcurrent = ref(false);
const keyword = ref("");
const keywordRef = ref(null);
const bajostock = ref(false);
const prioritario = ref(false);
const todos = ref("false");
const almacenActualId = ref(null);
const almacens = ref([]);
const departamentoActualId = ref(null);
const departamentos = ref([]);
const tHeaders = ref([
  "Código",
  "Nombre",
  "Costo",
  "Precio",
  "Existencia",
  "Min-Max",
  "Kit",
  "Impuestos",
  "Acciones",
]);
const existenciasHeaders = ref([
  { title: "Almacen", key: "almacen", align: "start", sortable: false },
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "product_name", align: "start", sortable: false },
  { title: "Costo", key: "pcosto", align: "start", sortable: false },
  {
    title: "Existencia",
    key: "cantidad_actual",
    align: "start",
    sortable: false,
  },
]);
const productActualId = ref(null);
const products = ref([]);
const proveedorActualId = ref(null);

const almacensItems = computed(() => [
  { title: "Selecciona", value: null },
  ...almacens.value.map((item) => ({
    title: item.name,
    value: item.id.toString(),
  })),
]);
const departamentosItems = computed(() => [
  { title: "Selecciona", value: null },
  ...departamentos.value.map((item) => ({
    title: item.name,
    value: item.id.toString(),
  })),
]);
const proveedors = ref([]);
const proveedorsItems = computed(() => [
  { title: "Selecciona", value: null },
  ...proveedors.value.map((item) => ({
    title: item.name,
    value: item.id.toString(),
  })),
]);
const errors = ref([]);
const isVisible = ref(false);
const isCreateServiceVisible = ref(false);
const productFormRef = ref(null);
const page = ref(1);
const isBannerOpen = ref(false);
const openEdit = ref(false);
const openAjuste = ref(false);
const openAlmacenSheet = ref(false);
const openExistencias = ref(false);
const existencias = ref([]);
const timeOut = ref("");
const isAdmin = computed(() => {
  return (
    store.roles.includes("Admin") ||
    store.roles.includes("Owner") ||
    store.roles.includes("Encargado") ||
    store.roles.includes("Contador") 

  );
});
const aVenderFeature = computed(() => {
  return (
    !store.authuser?.configuration?.features?.avender &&
    products.value.data &&
    products.value.data.length < 1
  );
});

getAllAlmacens();
getAllProveedors();
getAllDepartamentos();
const getPreviousPage = () => {
  page.value = page.value - 1;
};
const getNextPage = () => {
  page.value = page.value + 1;
};
watch(page, (newVal, oldVal) => {
  if (newVal == oldVal) {
    return;
  }

  onPagination(newVal);
});
const onPagination = (page) => {
  router
    .push({ name: route.name, query: { ...route.query, page } })
    .catch(() => { })
    .finally(() => {
      search();
    });
};
watch(
  () => route.query,
  (to, from) => {
    if (route.name != "ProductosIndex") {
      return;
    }
    const task = () => {
      cargando.value = false;
      search();
    };
    debounce(task, 550);
  }
);
watch(keyword, () => {
  page.value = 1;
  pushQuery("keyword", keyword.value);
});
function debounce(func, wait = 1000) {
  cargando.value = true;
  clearTimeout(timeOut.value);
  timeOut.value = setTimeout(func, wait);
}
watch(bajostock, () => {
  pushQuery("bajostock", bajostock.value);
});
watch(prioritario, () => {
  pushQuery("prioritario", prioritario.value);
});
watch(todos, () => {
  pushQuery("todos", todos.value);
});
watch(departamentoActualId, () => {
  pushQuery("departamento", departamentoActualId.value);
});
watch(proveedorActualId, () => {
  pushQuery("proveedor", proveedorActualId.value);
});
watch(almacenActualId, () => {
  pushQuery("almacen", almacenActualId.value);
});
const almacenAjusteInventario = computed(() => {
  if (almacens.value.length) {
    return almacens.value.find((x) => x.id == almacenActualId.value).name;
  } else {
    return "";
  }
});
function focusKeyword() {
  nextTick(() => keywordRef.value.select());
}

function enviarProduct() {
  if (product_form.pcosto == "") {
    product_form.pcosto = 0;
  }
  processRequest(async () => {
    const response = await Product.register(product_form);
    cargando.value = false;
    isVisible.value = false;
    limpiarCampos();
    setTimeout(() => {
      cargando.value = false;
      ajusteProduct(response.data.id);
    }, 300);
    keyword.value = response.data?.name;
    if (aVenderFeature.value) {
      isBannerOpen.value = true;
    }
  }, cargando, { errorsRef: errors, 
    onSuccess: () => {
      notify.success("Producto creado correctamente");
    },
  });
}
function enviarService() {
  processRequest(async () => {
    const response = await Product.register_service(product_form);
    isCreateServiceVisible.value = false;
    limpiarCampos();
    keyword.value = response.data?.name;
    if (aVenderFeature.value) {
      isBannerOpen.value = true;
    }
  }, cargando, { errorsRef: errors, 
    onSuccess: () => {
      notify.success("Servicio creado correctamente");
    },
  });
}
async function destroyProduct(productId) {
  // if (!(await confirm("Estas seguro de eliminar este producto?"))) return;
  processRequest(async () => {
    await Product.delete(productId);
    cargando.value = false;
    await search();
  }, cargando, { errorsRef: errors, 
    onSuccess: () => {
      notify.success("Producto eliminado correctamente");
    },
  });
}
function handleProductFormUpdate(newValue) {
  // Update each property of the reactive object individually
  Object.keys(newValue).forEach(key => {
    product_form[key] = newValue[key];
  });
}
function closeModal() {
  isVisible.value = false;
  limpiarCampos();
}
function limpiarCampos() {
  errors.value = [];
  productActualId.value = "";
  
  // Reset form using the exposed method from ProductForm component
  if (productFormRef.value) {
    productFormRef.value.resetForm();
  }
}

function resetAjusteForm() {
  inventario_form.name = "";
  inventario_form.cantidadActual = null;
  inventario_form.is_service = null;
  inventario_form.cantidad = null;
  inventario_form.pcosto = null;
  inventario_form.pventa = null;
  inventario_form.precio_mayoreo = null;
  inventario_form.precio_medio_mayoreo = null;
  inventario_form.precio_sugerido = null;
  inventario_form.justificacion = "";
}

function search() {
  concurrentRequest(async () => {
    const response = await Product.search(
      page.value,
      keyword.value,
      almacenActualId.value,
      departamentoActualId.value,
      proveedorActualId.value,
      bajostock.value,
      prioritario.value,
      todos.value
    );
    products.value = [];
    await nextTick();
    products.value = response.data;
  }, cargandoConcurrent, { errorsRef: errors, 
   });
}
function getAllAlmacens() {
  if (store.myAlmacens.length > 0) {
    almacens.value = store.myAlmacens;
    almacenActualId.value = store.myAlmacens[0].id.toString();
    return;
  }
  processRequest(async () => {
    const response = await Almacen.getMyAlmacens();
    store.myAlmacens = response.data;
    almacens.value = response.data;
    if (almacens.value.length) {
      almacenActualId.value = response.data[0].id.toString();
    }
  }, cargando, {
  });
}
function getAllDepartamentos() {
  if (store.departamentos.length > 0) {
    departamentos.value = store.departamentos;
    return;
  }
  concurrentRequest(async () => {
    const response = await Departamento.getAll();
    departamentos.value = response.data;
    store.departamentos = response.data;
  }, cargandoConcurrent, {
  });
}
function getAllProveedors() {
  if (store.proveedors.length > 0) {
    proveedors.value = store.proveedors;
    return;
  }
  concurrentRequest(async () => {
    const response = await Proveedor.getAll();
    proveedors.value = response.data;
    store.proveedors = response.data;
  }, cargandoConcurrent, {
  });
}
function ajusteProduct(productId) {
  if (!isAdmin.value) {
    return notify.warning("Lo sentimos, no cuentas con el rol adecuado :(");
  }
  openAjuste.value = true;
  resetAjusteForm();

  processRequest(async () => {
    const response = await Product.showextend(productId, almacenActualId.value);
    cargando.value = false;
    productActualId.value = response.data.id;
    inventario_form.name = response.data.name;
    inventario_form.is_service = response.data.is_service;
    inventario_form.cantidadActual = response.data.cantidad_actual;
    inventario_form.cantidad = response.data.cantidad_actual;
    inventario_form.pcosto = response.data.pcosto;
    inventario_form.pventa = response.data.precio;
    inventario_form.precio_sugerido = response.data.precio_sugerido;
    if (response.data.precio_mayoreo == null) {
      inventario_form.precio_mayoreo = inventario_form.pventa;
    } else {
      inventario_form.precio_mayoreo = response.data.precio_mayoreo;
    }
    if (response.data.precio_medio_mayoreo == null) {
      inventario_form.precio_medio_mayoreo = inventario_form.pventa;
    } else {
      inventario_form.precio_medio_mayoreo = response.data.precio_medio_mayoreo;
    }
    nextTick(() => document.getElementById("cantidadId").select());
  }, cargando, { errorsRef: errors, 
    onSuccess: () => {
      // notify.info("Ajusta el inventario y precios del producto");
    },
  });
}
function ajusteInventario() {
  if (+inventario_form.pventa < +inventario_form.precio_mayoreo ||
    +inventario_form.pventa < +inventario_form.precio_medio_mayoreo
  ) {
    notify.error('Error, los precios mayoreo no pueden ser mas altos que el precio base');
    return;
  }
  processRequest(async () => {
    await Product.ajustar(productActualId.value, almacenActualId.value, inventario_form);
    cargando.value = false;
    search();
    openAjuste.value = false;
    resetAjusteForm();
  }, cargando, { errorsRef: errors, 
    onSuccess: () => {
      notify.success("Inventario y precios ajustados correctamente");
    },
  });
}
function ajusteInventarioGeneral() {
  if (+inventario_form.pventa < +inventario_form.precio_mayoreo ||
    +inventario_form.pventa < +inventario_form.precio_medio_mayoreo
  ) {
    notify.error('Error, los precios mayoreo no pueden ser mas altos que el precio base');
    return;
  }
  processRequest(async () => {
    await Product.ajustarGeneral(
      productActualId.value,
      almacenActualId.value,
      inventario_form
    );
    cargando.value = false;
    search();
    openAjuste.value = false;
    resetAjusteForm();
  }, cargando, { errorsRef: errors, 
    onSuccess: () => {
      notify.success("Inventario y precios ajustados correctamente");
    },
  });
}
function abrirExistencias(productId) {
  openExistencias.value = true;
  productActualId.value = productId;

  processRequest(async () => {
    const response = await PuntoVenta.getExistencias(productId);
    existencias.value = response.data;
  }, cargando, { errorsRef: errors, 
    onSuccess: () => {
      // notify.info("Consulta las existencias del producto");
    },
  });
}
function abrirProducto() {
  if (!almacens.value.length) {
    alert("Antes, Debes Crear Un Almacen");
    router.push({ name: "Almacens" });
    return;
  }
  isVisible.value = true;
  nextTick(() => document.getElementById("cod").focus());
}
function abrirService() {
  if (!almacens.value.length) {
    alert("Antes, Debes Crear Un Almacen");
    router.push({ name: "Almacens" });
    return;
  }
  isCreateServiceVisible.value = true;
  nextTick(() => document.getElementById("cod").focus());
}
onMounted(async () => {
  document.addEventListener("keydown", onEscape);
  if (store.productsQuery) {
    const query = JSON.parse(store.productsQuery);
    if (route.query.keyword) {
      query.keyword = route.query.keyword;
    }
    await router.push({ query });
  }
  if (route.query.bajostock) {
    bajostock.value = route.query.bajostock;
  }
  if (route.query.prioritario) {
    prioritario.value = route.query.prioritario;
  }
  if (route.query.proveedor) {
    proveedorActualId.value = route.query.proveedor;
  }
  if (route.query.todos) {
    todos.value = route.query.todos;
  }
  if (route.query.departamento) {
    departamentoActualId.value = route.query.departamento;
  }
  if (route.query.almacen) {
    almacenActualId.value = route.query.almacen;
  }
  if (route.query.keyword) {
    keyword.value = route.query.keyword;
  }
  focusKeyword();
  search();
});
onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});
onBeforeRouteLeave((to, from) => {
  store.productsQuery = JSON.stringify(route.query);
});
</script>

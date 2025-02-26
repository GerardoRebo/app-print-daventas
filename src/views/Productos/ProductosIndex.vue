<template>
  <!-- <BannerVue v-if="isBannerOpen" @hide-banner="hideBanner">
    <span>Que bien, vas increible, ahora sí... A vender!!</span>
    <RouterLink :to="{ name: 'PuntoVenta' }" class="font-bold underline" @click="hideBanner">Click Aqui</RouterLink>
  </BannerVue> -->
  <v-toolbar density="compact" color="neutral200">
    <v-toolbar-title class="text-primary_d600"
      >Catálogo Productos
    </v-toolbar-title>
    <v-btn color="primary" icon v-if="mdAndDown">
      <v-icon @click="abrirProducto">mdi-plus-circle-outline</v-icon>
    </v-btn>
    <v-btn class="hidden-xs-only" icon v-if="mdAndDown">
      <v-icon @click="drawer = true">mdi-filter</v-icon>
    </v-btn>
  </v-toolbar>
  <!-- Header Desktop -->
  <v-card v-if="mdAndUp">
    <v-container fluid>
      <v-row class="mb-2">
        <v-btn
          @click="abrirProducto"
          small
          class="ma-2"
          prepend-icon="mdi-plus"
          color="primary"
          variant="outlined"
        >
          Crear Producto
        </v-btn>
        <v-select
          :items="almacensItems"
          label="Almacen"
          v-model="almacenActualId"
          class="ma-2"
          max-width="200"
          color="primary_d700"
          hide-details
        ></v-select>
        <!-- Departamentos -->
        <v-select
          :items="departamentosItems"
          label="Departamento"
          v-model="departamentoActualId"
          class="ma-2"
          max-width="200"
          clearable
          color="primary_d700"
          hide-details
        ></v-select>
        <!-- Proveedors -->
        <v-select
          :items="proveedorsItems"
          label="Proveedor"
          v-model="proveedorActualId"
          class="ma-2"
          max-width="200"
          clearable
          color="primary_d700"
          hide-details
        ></v-select>
        <v-spacer></v-spacer>
        <v-checkbox
          v-model="bajostock"
          label="Bajo stock"
          hide-details
        ></v-checkbox>
        <v-checkbox
          v-model="prioritario"
          label="Prioritarios"
          hide-details
        ></v-checkbox>
      </v-row>
    </v-container>
  </v-card>

  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer
    v-model="drawer"
    :location="$vuetify.display.mobile ? 'bottom' : undefined"
    temporary
    v-if="mdAndDown"
  >
    <v-card>
      <v-container>
        <v-select
          :items="almacensItems"
          label="Almacen"
          density="compact"
          v-model="almacenActualId"
          class="ma-2"
        ></v-select>

        <!-- Departamentos -->
        <v-select
          :items="departamentosItems"
          label="Departamento"
          density="compact"
          v-model="departamentoActualId"
          class="ma-2"
          clearable
        ></v-select>
        <!-- Proveedors -->
        <v-select
          :items="proveedorsItems"
          label="Proveedor"
          density="compact"
          v-model="proveedorActualId"
          class="ma-2"
          clearable
        ></v-select>
        <v-checkbox
          v-model="bajostock"
          label="Bajo stock"
          density="compact"
        ></v-checkbox>
        <v-checkbox
          v-model="prioritario"
          label="Prioritarios"
          density="compact"
        ></v-checkbox>
      </v-container>
    </v-card>
  </v-navigation-drawer>
  <!-- Tabla -->
  <v-container fluid>
    <v-text-field
      v-model="keyword"
      label="Buscar Producto"
      prepend-inner-icon="mdi-magnify"
      variant="solo-filled"
      flat
      hide-details
      single-line
      ref="keywordRef"
      color="accent"
    ></v-text-field>
    <v-progress-linear
      color="primary_l800"
      v-if="!cargando"
      model-value="100"
    ></v-progress-linear>
    <v-progress-linear
      color="primary_l100"
      indeterminate
      v-if="cargando"
      model-value="100"
    ></v-progress-linear>
    <v-table density="compact" fixed-header height="50vh" hover>
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <TableRow
          v-for="product in products.data"
          :key="product.id"
          :product="product"
          @ajuste-product="ajusteProduct"
          @destroy-product="destroyProduct"
          @abrir-existencias="abrirExistencias"
        ></TableRow>
      </tbody>
    </v-table>
  </v-container>
  <v-row class="ma-1" justify="end">
    <v-pagination
      v-model="page"
      :length="products.last_page"
      :total-visible="5"
      density="compact"
    ></v-pagination>
  </v-row>
  <!-- Crear Producto -->
  <v-dialog v-model="isVisible" max-width="800">
    <v-card>
      <v-card-title>Crea Producto Aquí</v-card-title>
      <v-card-text>
        <v-text-field
          label="Código"
          id="cod"
          autocomplete="off"
          placeholder=""
          density="compact"
          :error-messages="errors.codigo ? errors.codigo[0] : null"
          v-model="product_form.codigo"
        />
        <v-text-field
          label="Nombre"
          id="name"
          autocomplete="off"
          placeholder=""
          density="compact"
          :error-messages="errors.name ? errors.name[0] : null"
          v-model="product_form.name"
        />
        <v-textarea
          label="Descripción"
          id="descripcion"
          autocomplete="off"
          placeholder=""
          density="compact"
          variant="outlined"
          :error-messages="errors.descripcion ? errors.descripcion[0] : null"
          v-model="product_form.descripcion"
        />
        <v-text-field
          label="Precio Costo"
          id="pcosto"
          autocomplete="off"
          placeholder=""
          density="compact"
          :error-messages="errors.pcosto ? errors.pcosto[0] : null"
          v-model="product_form.pcosto"
        />
        <v-text-field
          label="Porcentaje Deseado"
          id="porcentaje_ganancia"
          autocomplete="off"
          placeholder=""
          density="compact"
          :error-messages="
            errors.porcentaje_ganancia ? errors.porcentaje_ganancia[0] : null
          "
          v-model="product_form.porcentaje_ganancia"
        />
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="product_form.es_kit"
              density="compact"
              label="El producto es kit?:"
              color="primary"
            >
            </v-switch>
          </v-col>
          <v-col cols="12" sm="6" v-if="!product_form.es_kit">
            <v-switch
              v-model="product_form.es_consumible_generico"
              density="compact"
              color="primary"
              label="El producto es consumible generico:"
            >
            </v-switch>
          </v-col>
          <v-col cols="12" sm="6" v-if="!product_form.es_consumible_generico">
            <v-switch
              v-model="product_form.necesita_produccion"
              density="compact"
              label="El producto necesita producción:"
              color="primary"
            >
            </v-switch>
          </v-col>
          <v-col cols="12" sm="6" v-if="!product_form.es_consumible_generico">
            <v-switch
              v-model="product_form.usa_medidas"
              density="compact"
              label="Usa medidas"
              color="primary"
            >
            </v-switch>
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="product_form.prioridad"
              density="compact"
              label="El producto es prioritario:"
              color="primary"
            >
            </v-switch>
          </v-col>
          <v-col cols="12" sm="6">
            <v-switch
              v-model="product_form.es_presentacion_de_compra"
              density="compact"
              label="El producto es presentación de compra:"
              color="primary"
            >
            </v-switch>
          </v-col>
          <v-col cols="12" sm="6">
            <v-radio-group v-model="product_form.tventa" density="compact">
              <template v-slot:label>
                <div>Tipo de venta:</div>
              </template>
              <v-radio label="Unidad" value="U"></v-radio>
              <v-radio label="Granel" value="G"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="closeModal" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="enviarProduct" :loading="cargando">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Existencias-->
  <v-dialog v-model="openExistencias">
    <v-card>
      <v-card-title>Existencias</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="2">
            <v-row class="d-flex flex-column">
              <p>Historial</p>
              <v-btn
                size="small"
                class="ma-2"
                :to="{
                  name: 'Historial',
                  params: {
                    almacenId: almacenActualId,
                    productId: productActualId || 0,
                  },
                }"
                >Inventario</v-btn
              >
              <v-btn
                size="small"
                class="ma-2"
                :to="{
                  name: 'HistorialCosto',
                  params: {
                    almacenId: almacenActualId,
                    productId: productActualId || 0,
                  },
                }"
                >Costo</v-btn
              >
              <v-btn
                size="small"
                class="ma-2"
                :to="{
                  name: 'HistorialPrecio',
                  params: {
                    almacenId: almacenActualId,
                    productId: productActualId || 0,
                  },
                }"
                >Precio</v-btn
              >
            </v-row>
          </v-col>
          <v-col cols="12" sm="10">
            <v-data-table
              :headers="existenciasHeaders"
              :items="existencias"
              items-per-page="5"
              show-select
              select-strategy="single"
            >
              <template
                v-slot:item.data-table-select="{
                  internalItem,
                  isSelected,
                  toggleSelect,
                  index,
                }"
              >
                <v-checkbox-btn
                  :model-value="isSelected(internalItem)"
                  color="primary"
                  @update:model-value="toggleSelect(internalItem)"
                  class="articulosInputs"
                ></v-checkbox-btn>
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
                <span>${{ item.product?.pcosto }}</span>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions> </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Ajuste Inventarios -->
  <v-dialog v-model="openAjuste" max-width="800">
    <v-card>
      <v-card-title
        >Ajuste Precio/Inventario: {{ inventario_form.name }}</v-card-title
      >
      <v-card-text>
        <p><span>Almacen: </span>{{ almacenAjusteInventario }}</p>
        <p>
          <span>Cantidad actual: </span>{{ inventario_form.cantidadActual }}
        </p>
        <v-text-field
          label="Ajustar cantidad a"
          id="cantidadId"
          autocomplete="off"
          placeholder=""
          density="compact"
          @keydown.enter="ajusteInventarioGeneral"
          v-model="inventario_form.cantidad"
        />
        <v-text-field
          label="Precio Costo"
          id="pcosto"
          autocomplete="off"
          placeholder=""
          density="compact"
          v-model="inventario_form.pcosto"
          @keydown.enter="ajusteInventarioGeneral"
        />
        <v-text-field
          :label="
            inventario_form.precio_sugerido
              ? 'Precio Venta (Sugerido: $' +
                inventario_form.precio_sugerido +
                ')'
              : 'Precio Venta'
          "
          id="pcosto"
          autocomplete="off"
          placeholder=""
          density="compact"
          v-model="inventario_form.pventa"
          @keydown.enter="ajusteInventarioGeneral"
        />
        <!-- <v-text-field label="Precio Mayoreo" id="precio_mayoreo" autocomplete="off" placeholder="" density="compact"
          v-model="inventario_form.precio_mayoreo" @keydown.enter="ajusteInventarioGeneral" /> -->
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openAjuste = false" :loading="cargando">Cancelar</v-btn>
        <v-btn
          @click="ajusteInventarioGeneral"
          :loading="cargando"
          variant="outlined"
          >Guardar General</v-btn
        >
        <v-btn
          @click="ajusteInventario"
          :loading="cargando"
          variant="outlined"
          color="accent"
          >Guardar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
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
import TableRow from "@js/views/Productos/Components/TableRow.vue";
const { xs, mdAndUp, mdAndDown } = useDisplay();
let { pushQuery } = useQuery();

const store = useUserStore();
const { handleOpException } = store;
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
const product_form = reactive({
  codigo: null,
  name: "",
  descripcion: "",
  porcentaje_ganancia: "",
  tventa: "U",
  pcosto: "",
  prioridad: "0",
  es_kit: true,
  es_consumible_generico: 0,
  necesita_produccion: false,
  usa_medidas: false,
  es_presentacion_de_compra: true,
});
const inventario_form = reactive({
  name: "",
  cantidadActual: null,
  cantidad: null,
  pcosto: null,
  pventa: null,
  precio_mayoreo: null,
  precio_sugerido: null,
});
const drawer = ref(true);
const cargando = ref(false);
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
  "Min",
  "Max",
  "Kit",
  "Acciones",
  "",
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
const page = ref(1);
const isBannerOpen = ref(false);
const openEdit = ref(false);
const openAjuste = ref(false);
const openExistencias = ref(false);
const existencias = ref([]);
const timeOut = ref("");
const isAdmin = computed(() => {
  return (
    store.roles.includes("Admin") ||
    store.roles.includes("Owner") ||
    store.roles.includes("Encargado")
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
    .catch(() => {})
    .finally(() => {
      search();
    });
};
// watch(() => product_form.name, (newVal) => {
//   if (isVisible.value) {
//     keyword.value = newVal;
//   }
// })
watch(
  () => route.query,
  (to, from) => {
    if (route.name != "ProductosIndex") {
      return;
    }
    const task = () => {
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

function showProduct(productId) {
  Product.show(productId)
    .then((response) => {
      productActualId.value = response.data.id;
      product_form.name = response.data.name;
      product_form.codigo = response.data.codigo;
      product_form.descripcion = response.data.descripcion;
      product_form.porcentaje_ganancia = response.data.porcentaje_ganancia;
      product_form.pcosto = response.data.pcosto;
      product_form.es_kit = response.data.es_kit;
      product_form.tventa = response.data.tventa;
      product_form.prioridad = response.data.prioridad;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
  openEdit.value = true;
}
const hideBanner = async () => {
  isBannerOpen.value = false;
  const response = await User.updateFeature({ key: "avender", value: true });
  store.authuser = response.data[0];
};
function enviarProduct() {
  if (product_form.pcosto == "") {
    product_form.pcosto = 0;
  }
  if (cargando.value) return;
  cargando.value = true;
  Product.register(product_form)
    .then((response) => {
      cargando.value = false;
      isVisible.value = false;
      limpiarCampos();
      setTimeout(() => {
        ajusteProduct(response.data.id);
      }, 300);
      // search();
      keyword.value = response.data?.name;
      if (aVenderFeature.value) {
        isBannerOpen.value = true;
      }
    })
    .catch((error) => {
      cargando.value = false;
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
async function destroyProduct(productId) {
  if (!(await confirm("Estas seguro de eliminar este producto?"))) return;
  if (cargando.value) return;
  cargando.value = true;
  Product.delete(productId)
    .then(() => {
      search();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function closeModal() {
  isVisible.value = false;
  limpiarCampos();
}
function limpiarCampos() {
  errors.value = [];
  productActualId.value = "";
  product_form.name = "";
  product_form.codigo = null;
  product_form.descripcion = "";
  product_form.precio_sugerido = "";
  product_form.porcentaje_ganancia = "";
  product_form.pcosto = "";
  product_form.es_kit = false;
  product_form.tventa = "U";
  product_form.prioridad = "0";
}

function search() {
  Product.search(
    page.value,
    keyword.value,
    almacenActualId.value,
    departamentoActualId.value,
    proveedorActualId.value,
    bajostock.value,
    prioritario.value,
    todos.value
  )
    .then((response) => {
      products.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function getAllAlmacens() {
  if (store.myAlmacens.length > 0) {
    almacens.value = store.myAlmacens;
    almacenActualId.value = store.myAlmacens[0].id.toString();
    return;
  }
  Almacen.getMyAlmacens()
    .then((response) => {
      store.myAlmacens = response.data;
      almacens.value = response.data;
      if (almacens.value.length) {
        almacenActualId.value = response.data[0].id.toString();
      }
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function getAllDepartamentos() {
  if (store.departamentos.length > 0) {
    departamentos.value = store.departamentos;
    return;
  }
  Departamento.getAll()
    .then((response) => {
      departamentos.value = response.data;
      store.departamentos = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function getAllProveedors() {
  if (store.proveedors.length > 0) {
    proveedors.value = store.proveedors;
    return;
  }
  Proveedor.getAll()
    .then((response) => {
      proveedors.value = response.data;
      store.proveedors = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function ajusteProduct(productId) {
  if (!isAdmin.value) {
    return alert("Lo sentimos, no cuentas con el rol adecuado :(");
  }
  openAjuste.value = true;

  Product.showextend(productId, almacenActualId.value)
    .then((response) => {
      productActualId.value = response.data.id;
      inventario_form.name = response.data.name;
      inventario_form.cantidadActual = response.data.cantidad_actual;
      inventario_form.cantidad = response.data.cantidad_actual;
      inventario_form.pcosto = response.data.pcosto;
      inventario_form.pventa = response.data.precio;
      inventario_form.precio_sugerido = response.data.precio_sugerido;
      inventario_form.precio_mayoreo = response.data.precio_mayoreo;
      nextTick(() => document.getElementById("cantidadId").select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function ajusteInventario() {
  if (cargando.value) return;
  cargando.value = true;
  Product.ajustar(productActualId.value, almacenActualId.value, inventario_form)
    .then(() => {
      cargando.value = false;
      search();
      openAjuste.value = false;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
      cargando.value = false;
    });
}
function ajusteInventarioGeneral() {
  if (cargando.value) return;
  cargando.value = true;
  Product.ajustarGeneral(
    productActualId.value,
    almacenActualId.value,
    inventario_form
  )
    .then(() => {
      cargando.value = false;
      search();
      openAjuste.value = false;
    })
    .catch((error) => {
      //:todo
      cargando.value = false;
      alert("Ha ocurrido un error");
    });
}
function abrirExistencias(productId) {
  openExistencias.value = true;
  productActualId.value = productId;

  PuntoVenta.getExistencias(productId)
    .then((response) => {
      existencias.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
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

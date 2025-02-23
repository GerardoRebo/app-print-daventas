<template >
  <!-- Header Desktop -->
  <HeaderVue type="desktop">
    <!-- Botones  -->
    <div class="flex md:justify-around items-center mb-4 ">
      <secondary-button-vue @click="abrirProducto" :ping="aVenderFeature">
        Crear Producto</secondary-button-vue>
      <Loading v-if="cargando"></Loading>
      <!-- Almacens -->
      <EtiquetaSelect v-model="almacenActualId" :data="{
        name: 'almacen',
        etiqueta: 'Almacen',
        id: 'almacen',
        options: almacens,
        usedName: 'name',
        firstOptKey: '',
        firstOptVal: 'Elige almacen',
      }">
      </EtiquetaSelect>
      <!-- Departamentos -->
      <EtiquetaSelect v-model="departamentoActualId" class="w-48" :data="{
        name: 'departamento',
        etiqueta: 'Departamento',
        id: 'departamento',
        options: departamentos,
        usedName: 'name',
        firstOptKey: '0',
        firstOptVal: 'Elige Departamento',
      }">
      </EtiquetaSelect>
      <!-- Proveedors -->
      <EtiquetaSelect v-model="proveedorActualId" class="w-48" :data="{
        name: 'proveedor',
        etiqueta: 'Proveedor',
        id: 'proveedor',
        options: proveedors,
        usedName: 'name',
        firstOptKey: '0',
        firstOptVal: 'Elige Proveedor',
      }">
      </EtiquetaSelect>
      <EtiquetaCheckbox v-model:checked="bajostock" :data="{
        name: 'bajostock',
        etiqueta: 'Bajo stock',
        id: 'bajostock',
      }">
      </EtiquetaCheckbox>

      <EtiquetaCheckbox v-model:checked="prioritario" :data="{
        name: 'prioritario',
        etiqueta: 'Prioritarios',
        id: 'prioritario',
      }">
      </EtiquetaCheckbox>

    </div>
    <!-- Barra de Busqueda -->
    <etiqueta-input @input="makeUpdate" :value="keyword" :data="{
      etiqueta: 'Busca producto por nombre o codigo',
      id: 'keyword',
      type: 'text',
      name: 'keyword',
      placeholder: 'Ingresa nombre o codigo',
    }" class="flex-1" />
  </HeaderVue>
  <!-- End Header Desktop -->

  <!-- drawer component -->
  <div class="md:hidden">
    <DrawerComp @hide-drawer="hideDrawer = !hideDrawer" :is-drawer-open="hideDrawer" title="Detalles productos">
      <!-- Botones  -->
      <div class="flex flex-col space-y-4 md:justify-around ">
        <primary-button-vue @click="abrirProducto" class="mt-4">
          Crear Producto</primary-button-vue>
        <!-- Almacens -->
        <EtiquetaSelect v-model="almacenActualId" :data="{
          name: 'almacen',
          etiqueta: 'Almacen',
          id: 'almacen',
          options: almacens,
          usedName: 'name',
          firstOptKey: '',
          firstOptVal: 'Elige almacen',
        }">
        </EtiquetaSelect>
        <!-- Departamentos -->
        <EtiquetaSelect v-model="departamentoActualId" :data="{
          name: 'departamento',
          etiqueta: 'Departamento',
          id: 'departamento',
          options: departamentos,
          usedName: 'name',
          firstOptKey: '0',
          firstOptVal: 'Elige Departamento',
        }">
        </EtiquetaSelect>
        <!-- Proveedors -->
        <EtiquetaSelect v-model="proveedorActualId" :data="{
          name: 'proveedor',
          etiqueta: 'Proveedor',
          id: 'proveedor',
          options: proveedors,
          usedName: 'name',
          firstOptKey: '0',
          firstOptVal: 'Elige Proveedor',
        }">
        </EtiquetaSelect>

        <EtiquetaCheckbox v-model:checked="bajostock" :data="{
          name: 'bajostock',
          etiqueta: 'Bajo stock',
          id: 'bajostock',
        }">
        </EtiquetaCheckbox>

        <EtiquetaCheckbox v-model:checked="prioritario" :data="{
          name: 'prioritario',
          etiqueta: 'Prioritarios',
          id: 'prioritario',
        }">
        </EtiquetaCheckbox>
      </div>
    </DrawerComp>
  </div>
  <!-- End drawer component -->

  <HeaderVue>
    <p class="md:hidden text-center text-gray-600  font-bold">Productos</p>
    <Loading v-if="cargando" class="md:hidden"></Loading>
    <div class="flex md:hidden items-end space-x-2 mx-2 mb-4">
      <div class="text-center">
        <primary-button-vue @click="hideDrawer = false">&#8594</primary-button-vue>
      </div>
      <!-- Barra de Busqueda -->
      <etiqueta-input class="" @input="makeUpdate" :value="keyword" :data="{
        etiqueta: 'Busca producto por nombre o codigo',
        id: 'keywordMobile',
        type: 'text',
        name: 'keyword',
        placeholder: 'Ingresa nombre o codigo',
      }" />
    </div>
  </HeaderVue>

  <!-- tabla and pagination -->
  <pagination :pages="products.last_page" :currentPage="products.current_page" @page-changed="search"></pagination>
  <!-- Tabla -->
  <tabla-vue :headers="tHeaders" class="mx-4">
    <template #bodyRow>
      <tr v-for="(product, index) in products.data" :key="index" class="hover:bg-blue-200">
        <ta-body-vue>{{ product.codigo }}</ta-body-vue>
        <ta-body-vue >
          <p tabindex="0" :class="[
            product.es_kit
              ? 'text-green-600 hover:text-green-900'
              : 'text-indigo-600 hover:text-indigo-900',
          ]" @click="ajusteProduct(product.id)" @keydown.enter="ajusteProduct(product.id)" class="cursor-pointer font-bold">
            {{ product.name }}
          </p>
        </ta-body-vue>
        <ta-body-vue>${{ product.pcosto }}</ta-body-vue>
        <ta-body-vue v-if="product.precio">${{ product.precio }}</ta-body-vue>
        <ta-body-vue v-else="product.precio" @click="">
          <p tabindex="0" @click="ajusteProduct(product.id)" @keydown.enter="ajusteProduct(product.id)"
            class="cursor-pointer text-yellow-700">
            Elige Precio
          </p>
        </ta-body-vue>
        <ta-body-vue>
          <p :class="[
            product.es_kit
              ? 'text-green-600 hover:text-green-900'
              : 'text-indigo-600 hover:text-indigo-900',
          ]" @click="abrirExistencias(product.id)" @keydown.enter="abrirExistencias(product.id)" class="cursor-pointer font-bold">
            {{ product.cantidad_actual }}
          </p>
        </ta-body-vue>
        <ta-body-vue>{{ product.invmin }}</ta-body-vue>
        <ta-body-vue>{{ product.invmax }}</ta-body-vue>
        <ta-body-vue>{{ product.es_kit ? "Si" : "No" }}</ta-body-vue>

        <ta-body-vue>
          <router-link tabindex="-1" class="font-bold text-indigo-600 hover:text-indigo-900" :to="{
            name: 'EditarProducto',
            params: {
              id: product.id,
            },
            query: {
              name: product.name,
              code: product.codigo,
            }
          }">
            Configurar</router-link>
        </ta-body-vue>

        <ta-body-vue>
          <p point :tabindex="-1" class="
                                font-bold
                                text-red-500
                                hover:text-red-500
                                cursor-pointer
                              " @click="destroyProduct(product.id)">
            Eliminar
          </p>
        </ta-body-vue>
      </tr>
    </template>
  </tabla-vue>

  <!-- Crear Producto -->
  <modal-vue @emitCancel="closeModal" @emitConfirm="enviarProduct" :isVisible="isVisible" :sizing="'md:h-3/5 md:w-3/5'">
    <template #body>
      <formulario-vue>
        <template #title>Crea Producto Aquí</template>
        <template #body>

          <etiqueta-input :data="{
            etiqueta: 'Código',
            id: 'cod',
            type: 'text',
            name: 'cod',
            placeholder: 'Código del Producto',
          }" :error="errors.codigo ? errors.codigo[0] : null" v-model="product_form.codigo">
          </etiqueta-input>
          <etiqueta-input :data="{
            etiqueta: 'Nombre',
            id: 'name',
            type: 'text',
            name: 'name',
            placeholder: 'Nombre del Producto',
          }" :error="errors.name ? errors.name[0] : null" v-model="product_form.name">
          </etiqueta-input>
          <etiqueta-input :data="{
            etiqueta: 'Descripción',
            id: 'descripcion',
            type: 'text',
            name: 'descripcion',
            placeholder: 'Descripción',
          }" :error="errors.descripcion ? errors.descripcion[0] : null" v-model="product_form.descripcion">
          </etiqueta-input>
          <etiqueta-input :data="{
            etiqueta: 'Porcentaje Deseado',
            id: 'porcentaje_ganancia',
            type: 'number',
            name: 'porcentaje_ganancia',
            placeholder: 'Margen Deseado',
            title: 'Este Porcentaje No Cambia el Precio Automáticamente Solo es Informativoo',
          }" :error="errors.porcentaje_ganancia ? errors.porcentaje_ganancia[0] : null"
            v-model="product_form.porcentaje_ganancia">
          </etiqueta-input>
          <etiqueta-input :data="{
            etiqueta: 'Precio Costo',
            id: 'pcosto',
            name: 'pcosto',
            type: 'number',
            placeholder: 'Precio Costo del Producto',
          }" :error="errors.pcosto ? errors.pcosto[0] : null" v-model="product_form.pcosto">
          </etiqueta-input>

          <div class="flex flex-col md:flex-row md:flex-wrap space-y-2 md:space-y-0 md:space-x-4">
            <EtiquetaSelect class="flex-1" v-model="product_form.es_kit" :data="{
              name: 'es_kit',
              etiqueta: 'Es kit?',
              id: 'es_kit',
              options: [{
                id: '0', name: 'No',
              }, {
                id: '1', name: 'Si',
              }
              ],
              usedName: 'name',
            }">
            </EtiquetaSelect>
            <EtiquetaSelect class="flex-1" v-model="product_form.tventa" :data="{
              name: 'tventa',
              etiqueta: 'Tipo de Venta',
              id: 'tventa',
              options: [{
                id: 'U', name: 'Unidad',
              }, {
                id: 'G', name: 'Granel',
              }
              ],
              usedName: 'name',
            }">
            </EtiquetaSelect>
            <EtiquetaSelect class="flex-1" v-model="product_form.prioridad" :data="{
              name: 'prioridad',
              etiqueta: 'Es prioritario',
              id: 'prioridad',
              options: [{
                id: '0', name: 'No',
              }, {
                id: '1', name: 'Si',
              }
              ],
              usedName: 'name',
            }">
            </EtiquetaSelect>
            <EtiquetaSelect class="flex-1" v-model="product_form.es_presentacion_de_compra" :data="{
              name: 'es_presentacion_de_compra',
              etiqueta: 'Es presentacion de compra',
              id: 'es_presentacion_de_compra',
              options: [
                {
                  id: '1', name: 'Si',
                },
                {
                  id: '0', name: 'No',
                }
              ],
              usedName: 'name',
            }">
            </EtiquetaSelect>
          </div>
        </template>
      </formulario-vue>
    </template>
  </modal-vue>

  <!-- Existencias-->
  <modal-vue @emitCancel="openExistencias = false" :isVisible="openExistencias" :sizing="'md:h-3/5 md:w-3/5'">
    <template #title>Existencias </template>
    <template #body>
      <tabla-vue :headers="['Almacen', 'Código', 'Nombre', 'Costo', 'Existencia']">
        <template #bodyRow>
          <tr v-for="(existencia, index) in existencias" :key="index" class="hover:bg-blue-200">
            <ta-body-vue>{{
              existencia.almacen ? existencia.almacen.name : ""
            }}</ta-body-vue>
            <ta-body-vue>{{ existencia.product.codigo }}</ta-body-vue>
            <ta-body-vue>
              <button tabindex="0" class="text-indigo-600 hover:text-indigo-900"
                @keydown.enter="getProductById(existencia.id)" @click="getProductById(existencia.id)">
                {{ existencia.product.name }}
              </button>
            </ta-body-vue>
            <ta-body-vue>{{ existencia.product.pcosto }}</ta-body-vue>
            <ta-body-vue>
              <button tabindex="0" class="text-indigo-600 hover:text-indigo-900"
                @keydown.enter="getProductById(existencia.id)" @click="getProductById(existencia.id)">
                {{ existencia.cantidad_actual }}
              </button>
            </ta-body-vue>
            <ta-body-vue>{{ existencia.es_kit }}</ta-body-vue>
          </tr>
        </template>
      </tabla-vue>
    </template>
    <template #footer>
      <div class="p-4">
        <p class="font-semibold">Elige el tipo de historial</p>
        <div class="flex gap-2">
          <secondary-button-vue class="p-2">
            <router-link :to="{
              name: 'Historial',
              params: { almacenActualId, productActualId },
            }">Inventario</router-link>
          </secondary-button-vue>
          <secondary-button-vue class="p-2">
            <router-link :to="{
              name: 'HistorialPrecio',
              params: { almacenActualId, productActualId },
            }">Precio</router-link>
          </secondary-button-vue>
          <secondary-button-vue class="p-2">
            <router-link :to="{
              name: 'HistorialCosto',
              params: { almacenActualId, productActualId },
            }">Costo</router-link>
          </secondary-button-vue>
        </div>
      </div>
    </template>
  </modal-vue>

  <!-- Ajuste Inventarios -->
  <modal-vue @emitCancel="openAjuste = false" :isVisible="openAjuste" :sizing="'md:h-3/5 md:w-3/5'">
    <template #body>
      <formulario-vue>
        <template #title>Ajuste Precio/Inventario: {{ inventario_form.name }}</template>
        <template #message> <span class="font-semibold sm:font-bold">Almacen: </span>{{ almacenAjusteInventario
        }}</template>
        <template #body>
          <p><span class="text-base sm:text-lg font-semibold sm:font-bold text-gray-800 dark:text-gray-50">Cantidad
              Actual: </span><span class="text-base sm:text-lg text-gray-800 dark:text-gray-50">
              {{
                inventario_form.cantidadActual }}
            </span></p>
          <etiqueta-input :data="{
            etiqueta: 'Ajustar Cantidad a',
            id: 'cantidadId',
            type: 'number',
            name: 'cantidad',
            placeholder: 'Ajusta Cantidad Aquí',
            title: '',
          }" @keydown.enter="ajusteInventarioGeneral" v-model="inventario_form.cantidad">
          </etiqueta-input>
          <etiqueta-input :data="{
            etiqueta: 'Precio Costo',
            id: 'pcosto',
            type: 'number',
            name: 'pcosto',
            placeholder: 'Precio Costo Del Producto',
            title: '',
          }" v-model="inventario_form.pcosto" @keydown.enter="ajusteInventarioGeneral">
          </etiqueta-input>
          <etiqueta-input :data="{
            etiqueta: inventario_form.precio_sugerido? 'Precio Venta (Sugerido: $' + inventario_form.precio_sugerido + ')' : 'Precio Venta' ,
            id: 'pventa',
            type: 'number',
            name: 'pventa',
            placeholder: 'Precio Venta Del Producto',
            title: '',
          }" v-model="inventario_form.pventa" @keydown.enter="ajusteInventarioGeneral">
          </etiqueta-input>
          <etiqueta-input :data="{
            etiqueta: 'Precio Mayoreo',
            id: 'precio_mayoreo',
            type: 'number',
            name: 'precio_mayoreo',
            placeholder: 'Precio Mayoreo Del Producto',
            title: '',
          }" v-model="inventario_form.precio_mayoreo" @keydown.enter="ajusteInventarioGeneral">
          </etiqueta-input>
        </template>
      </formulario-vue>
    </template>
    <template #footer>
      <div class="flex flex-col md:flex-row gap-2">
        <primary-button-vue @click="ajusteInventarioGeneral">Guardar General</primary-button-vue>
        <secondary-button-vue @click="ajusteInventario">Guardar</secondary-button-vue>
        <simple-button-vue @click="openAjuste = false">
          Cancelar</simple-button-vue>
      </div>
    </template>
  </modal-vue>
</template>
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
import SecondaryButtonVue from "../components/util/SecondaryButtonVue.vue";
import SimpleButtonVue from "../components/util/SimpleButtonVue.vue";
import PrimaryButtonVue from "../components/util/PrimaryButtonVue.vue";
import ModalVue from "../components/util/ModalVue.vue";
import FormularioVue from "../components/util/FormularioVue.vue";
import EtiquetaInput from "../components/util/EtiquetaInput.vue";
import EtiquetaSelect from "../components/util/EtiquetaSelect.vue";
import EtiquetaCheckbox from "../components/util/EtiquetaCheckbox.vue";
import HeaderVue from "../components/HeaderVue.vue";
import DrawerComp from "../components/DrawerComp.vue";
import Loading from "../components/util/Loading.vue";
import BannerVue from "../components/util/BannerVue.vue";

import TaBodyVue from "../components/util/TaBodyVue.vue";
import TablaVue from "../components/util/TablaVue.vue";
import Pagination from "../components/Pagination.vue";

import Product from "../apis/Product";
import Almacen from "../apis/Almacen";
import PuntoVenta from "../apis/PuntoVenta";
import Departamento from "../apis/Departamento";
import Proveedor from "../apis/Proveedor";
import { useUserStore } from "../s";
import useQuery from "../composables/useQuery";
import User from "../apis/User";
let { pushQuery } = useQuery();

const store = useUserStore();
const { handleOpException} = store;
function onEscape(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    openAjuste.value = false;
    openExistencias.value = false;
    closeModal();
    nextTick(() => document.getElementById('keyword').select());
  }
  if (e.key === "F9") {
    nextTick(() => document.getElementById('keyword').select());
  }
}
const tHeaders = ref([
  'Código',
  'Nombre',
  'Costo',
  'Precio',
  'Existencia',
  'Min',
  'Max',
  'Kit',
  'Acciones',
  ''
]);
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
  es_kit: "0",
  es_presentacion_de_compra: "1",
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
const hideDrawer = ref(true);
const cargando = ref(false);
const keyword = ref("");
const bajostock = ref(false);
const prioritario = ref(false);
const todos = ref("false");
const almacenActualId = ref(null);
const almacens = ref([]);
const departamentoActualId = ref("0");
const departamentos = ref([]);
const productActualId = ref(null);
const products = ref([]);
const proveedorActualId = ref("0");

const proveedors = ref([]);
const errors = ref([]);
const isVisible = ref(false);
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
  return !store.authuser?.configuration?.features?.avender && products.value.data && products.value.data.length < 1
})

getAllAlmacens();
getAllProveedors();
getAllDepartamentos();

watch(()=> product_form.name, (newVal)=>{
  if (isVisible.value) {
    keyword.value = newVal;
  }
})
watch(() => route.query, (to, from) => {
  if (route.name != 'Productos') {
    return
  }
  const task = () => {
    search()
  };
  debounce(task, 550);
})
function makeUpdate(e) {
  keyword.value = e.target.value;
  pushQuery('keyword', keyword.value)
}
function debounce(func, wait = 1000) {
  cargando.value = true
  clearTimeout(timeOut.value);
  timeOut.value = setTimeout(func, wait);
}
watch(bajostock, () => {
  pushQuery('bajostock', bajostock.value)
});
watch(prioritario, () => {
  pushQuery('prioritario', prioritario.value)
});
watch(todos, () => {
  pushQuery('todos', todos.value)
});
watch(departamentoActualId, () => {
  pushQuery('departamento', departamentoActualId.value)
});
watch(proveedorActualId, () => {
  pushQuery('proveedor', proveedorActualId.value)
});
watch(almacenActualId, () => {
  pushQuery('almacen', almacenActualId.value)
});
const almacenAjusteInventario = computed(() => {
  if (almacens.value.length) {
    return almacens.value.find((x) => x.id == almacenActualId.value).name;
  } else {
    return "";
  }
});

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
      alert("Ha ocurrido un error")
    });
  openEdit.value = true;
}
const hideBanner = async () => {
  isBannerOpen.value = false;
  const response = await User.updateFeature({ key: 'avender', value: true })
  store.authuser = response.data[0];
}
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
      search(keyword.value);
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
      alert("Ha ocurrido un error")
    });
}
async function destroyProduct(productId) {
  if (! await confirm("Estas seguro de eliminar este producto?")) return;
  if (cargando.value) return;
  cargando.value = true;
  Product.delete(productId)
    .then(() => {
      search(keyword.value);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    }).finally(() => {
      cargando.value = false;
    });
}
function closeModal() {
  limpiarCampos()
  isVisible.value = false
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
  product_form.es_kit = "0";
  product_form.tventa = "U";
  product_form.prioridad = "0";
}

function search(page = 1) {
  Product.search(
    page,
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
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false
    });
}
function getAllAlmacens() {
  if (store.myAlmacens.length > 0) {
    almacens.value = store.myAlmacens;
    almacenActualId.value = store.myAlmacens[0].id;
    return;
  }
  Almacen.getMyAlmacens()
    .then((response) => {
      store.myAlmacens = response.data
      almacens.value = response.data;
      if (almacens.value.length) {
        almacenActualId.value = response.data[0].id;
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
      alert("Ha ocurrido un error")
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
      store.proveedors = response.data
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
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
      alert("Ha ocurrido un error")
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
      alert("Ha ocurrido un error")
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
      alert("Ha ocurrido un error")
    });
}
function abrirProducto() {
  if (!almacens.value.length) {
    alert("Antes, Debes Crear Un Almacen");
    router.push({ name: "Almacens" });
    return;
  }
  isVisible.value = true;
  nextTick(() => document.getElementById('cod').focus());
}
onMounted(async () => {
  document.addEventListener("keydown", onEscape);
  if (store.productsQuery) {
    const query = JSON.parse(store.productsQuery);
    if(route.query.keyword){
      query.keyword = route.query.keyword;
    }
    await router.push({ query});
  }
  if (route.query.bajostock) {
    bajostock.value = route.query.bajostock
  }
  if (route.query.prioritario) {
    prioritario.value = route.query.prioritario
  }
  if (route.query.proveedor) {
    proveedorActualId.value = route.query.proveedor
  }
  if (route.query.todos) {
    todos.value = route.query.todos
  }
  if (route.query.departamento) {
    departamentoActualId.value = route.query.departamento
  }
  if (route.query.almacen) {
    almacenActualId.value = route.query.almacen
  }
  if (route.query.keyword) {
    keyword.value = route.query.keyword
  }
  nextTick(() => document.getElementById('keyword').select());
  search();
});
onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});
onBeforeRouteLeave((to, from) => {
  store.productsQuery = JSON.stringify(route.query);
})
</script>
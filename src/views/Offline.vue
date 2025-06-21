<template >
  <FrameVue>
    <div class="bg-gray-400 h-1"></div>
    <!-- Header Desktop-->
    <HeaderVue type="desktop">
      <!-- Pendiente -->
      <div class="hidden md:flex  space-x-2 items-center">
        <simple-button-vue @click="setPendiente">Pendiente F3</simple-button-vue>
        <simple-button-vue @click="abrirPendiente">Tickets Pendientes F6</simple-button-vue>
        <router-link :to="{ name: 'MisVentasOffline' }">
          <simple-button-vue>
            Mis Ventas Offline F7
          </simple-button-vue>
        </router-link>

        <simple-button-vue @click="abrirCliente">Clientes</simple-button-vue>
        <!-- <simple-button-vue  v-if="showOffline" @click="goOli">Offline</simple-button-vue> -->

        <!-- Almacens -->

        <EtiquetaSelect v-model="almacen.id" @update:modelValue="asignarAlmacen" :data="{
          name: 'almacen',
          etiqueta: 'Almacenes',
          id: 'almacen',
          options: almacens,
          usedName: 'name',
          firstOptKey: '',
          firstOptVal: 'Asigna almacen',
        }" v-if="ticketActual.miAlmacenId == null" class="md:w-52" />
        <Loading v-if="cargando"></Loading>
      </div>

      <!-- Codigo -->
      <div class="hidden flex-col md:flex-row md:flex space-x-2">
        <!-- Codigo -->
        <etiqueta-input class="md:w-60" @keydown.enter.stop="searchProduct" v-model="codigo"
          @keydown.right.prevent="goPrimerArticulo" :data="{
            etiqueta: 'Codigo',
            id: 'codigo',
            type: 'text',
            name: 'codigo',
            placeholder: 'Codigo + Enter',
          }" />
        <!-- Article name -->
        <div class="flex justify-start">
          <etiqueta-input class="md:w-80 mr-6" disabled v-model="product_form.name" :data="{
            etiqueta: 'Nombre',
            id: 'name',
            type: 'text',
            name: 'name',
            placeholder: '',
          }" />
          <etiqueta-input class="md:w-24 mr-2" @keydown.stop.enter="enviarArticulo" v-model="product_form.cantidad" :data="{
            etiqueta: 'Cantidad',
            id: 'cantidad',
            type: 'number',
            name: 'cantidad',
            placeholder: '',
          }" />
          <etiqueta-input class="md:w-24 mr-2" @keydown.stop.enter="enviarArticulo" v-model="product_form.pventa" :data="{
            etiqueta: 'Precio',
            id: 'precio',
            type: 'number',
            name: 'precio',
            placeholder: '',
          }" />
        </div>
        <!-- Agregar  -->
        <div class="w-full flex md:justify-end md:items-center space-x-4 mr-6">
          <SimpleButtonVue @click.stop="getProductsNow" @keydown.enter.stop="getProductsNow">&#8634;</SimpleButtonVue>
          <secondary-button-vue @click="abrirModalBuscaProductsNombre">Buscar F9</secondary-button-vue>
          <secondary-button-vue @click="enviarArticulo">Agregar</secondary-button-vue>
          <!-- <secondary-button-vue @click="abrirExistencias">Ver F10</secondary-button-vue> -->
        </div>
      </div>

      <!-- Borra Ticket -->
      <div class="hidden md:flex space-x-2 space-y-1 items-center p-2">
        <div class="flex md:w-1/3 space-x-2 ">
          <secondary-button-vue @click="borrarTicket">Borrar Ticket</secondary-button-vue>
          <primary-button-vue @click="abrirCobrarModal">Cobrar F2</primary-button-vue>
        </div>
        <etiqueta-input class="md:w-60 mr-2 md:mr-4" @keydown.stop.enter="setNombreTicket" v-model="nombreT" :data="{
          id: 'nombreT',
          type: 'text',
          name: 'nombreT',
          placeholder: 'Nombra Ticket + Enter',
        }" />
        <div class="w-full flex items-center justify-around">
          <p class="text-red-600 text-lg font-bold">
            Total: ${{ totalComputed }}
          </p>
          <p class="font-semibold">Nombre Ticket: {{ ticketActual.nombre }}</p>
          <p class="font-bold">Folio: {{ ticketActual.consecutivo }}</p>
          <p class="font-semibold">Cliente: {{ ticketActual.cliente }}</p>
          <p class="font-semibold">Almacen: {{ ticketActual.miAlmacenName }}</p>
        </div>
      </div>
    </HeaderVue>
    <!-- End Header Desktop-->
    <!-- Tabla -->
    <tabla-vue :headers="tHeaders">
      <template #bodyRow>
        <tr v-for="(articulo, index) in articulos" :key="index" class="hover:bg-blue-200">
          <ta-body-vue>
            <input type="checkbox" name="check" class="articulosInputs"
              @keydown.delete.prevent="destroyArticulo(articulo.id)" @keydown.enter="
                abrirEdicion(
                  articulo.id,
                  articulo.name,
                  articulo.precio,
                  articulo.cantidad
                )
                " />
          </ta-body-vue>
          <ta-body-vue>{{ articulo.codigo }}</ta-body-vue>
          <ta-body-vue>
            <p :class="[
              articulo.es_kit
                ? 'text-green-600 hover:text-green-900'
                : 'text-indigo-600 hover:text-indigo-900',
            ]" class="font-semibold">
              {{ articulo.name }}
            </p>
          </ta-body-vue>
          <ta-body-vue class="font-bold">{{ articulo.cantidad }}</ta-body-vue>
          <ta-body-vue>{{ articulo.precio }}</ta-body-vue>
          <ta-body-vue>{{ articulo.importe_descuento }}</ta-body-vue>
          <ta-body-vue>{{ articulo.impuesto_trasaldo }}</ta-body-vue>
          <ta-body-vue>
            <p class="font-bold">${{ articulo.importe }}</p>
          </ta-body-vue>
          <!-- <ta-body-vue>{{ articulo.cantidad_actual }}</ta-body-vue> -->
          <ta-body-vue>
            <div class="flex flex-wrap sm:space-x-4">
              <p class="font-bold cursor-pointer text-indigo-600" @click="
                abrirEdicion(
                  articulo.id,
                  articulo.name,
                  articulo.precio,
                  articulo.cantidad
                )
                ">
                Editar
              </p>
              <p @click.once="destroyArticulo(articulo.id)" class="font-bold cursor-pointer text-red-500">
                Eliminar
              </p>
            </div>
          </ta-body-vue>
        </tr>
      </template>
    </tabla-vue>
    <p class="text-gray-400 text-center mt-10 text-4xl">Offline</p>
    <!-- Busca Producto Nombre-->
    <modal-vue @emitCancel="isVisible = false" :isVisible="isVisible">
      <template #title>
        Busca producto por nombre
      </template>
      <template #body>
        <p class="text-gray-500 text-sm">Informacion actualizada por ultima vez hace {{ lastFetchTimeFormatted }}</p>
        <!-- <SimpleButtonVue class="p-0">&#8634;</SimpleButtonVue> -->
        <div class="flex items-end space-x-2">
          <etiqueta-input @input="makeUpdate" :data="{
            id: 'keyw',
            type: 'text',
            name: 'keyw',
            placeholder: 'Ingresa nombre del producto',
          }" class="flex-1" />
        </div>
        <Loading v-if="cargando"></Loading>

        <tabla-vue :headers="['Código', 'Nombre', 'Precio', 'kit']">
          <template #bodyRow>
            <tr v-for="(product, index) in products" :key="index" class="hover:bg-blue-200">
              <ta-body-vue>{{ product.codigo }}</ta-body-vue>
              <ta-body-vue>
                <button tabindex="0" :class="[
                  product.es_kit
                    ? 'text-green-600 hover:text-green-900'
                    : 'text-indigo-600 hover:text-indigo-900',
                ]" @keydown.enter="getProductById(product.id)" @click="getProductById(product.id)">
                  {{ product.name }}
                </button>
              </ta-body-vue>
              <ta-body-vue>{{ product.precio }}</ta-body-vue>
              <ta-body-vue>{{ product.es_kit ? "Sí" : "No" }}</ta-body-vue>
            </tr>
          </template>
        </tabla-vue>
      </template>
      <template #footer>
        <div></div>
      </template>
    </modal-vue>

    <!-- Pendientes -->
    <modal-vue @emitCancel="openPendiente = false" :isVisible="openPendiente" :sizing="'md:h-3/5 md:w-3/5'">
      <template #title>
        Pendientes
      </template>
      <template #body>
        <tabla-vue :headers="['Folio', 'Nombre', 'Cliente', 'Almacén', 'Total']">
          <template #bodyRow>
            <tr>
              <ta-body-vue><a href="#" ref="temp">...</a></ta-body-vue>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr v-for="(pendiente, index) in pendientes" :key="index" class="hover:bg-blue-200">
              <ta-body-vue>
                <button tabindex="0" class="ticketsPendientes text-indigo-600 hover:text-indigo-900"
                  @keydown.enter="getSpecificVT(pendiente.id)" @click="getSpecificVT(pendiente.id)">
                  {{ pendiente.id }}
                </button>
              </ta-body-vue>
              <ta-body-vue>{{ pendiente.nombre }}</ta-body-vue>

              <ta-body-vue>{{
                pendiente.cliente ? pendiente.cliente.name : ""
              }}</ta-body-vue>
              <ta-body-vue>{{
                pendiente.almacen ? pendiente.almacen.name : ""
              }}</ta-body-vue>
              <ta-body-vue>{{ pendiente.total }}</ta-body-vue>
            </tr>
          </template>
        </tabla-vue>
      </template>
      <template #footer>
        <div></div>
      </template>
    </modal-vue>
    <!-- Clientes -->
    <modal-vue @emitCancel="openCliente = false" :isVisible="openCliente">
      <template #body>
        <etiqueta-input :data="{
          id: 'keycliente',
          type: 'text',
          name: 'keycliente',
          etiqueta: 'Cliente',
          placeholder: 'Ingresa nombre del cliente',
        }" class="flex-1" v-model="keycliente" />
        <tabla-vue :headers="[
          'Codigo',
          'Nombre',
          'Saldo Actual',
          'Límite Crédito',
          'Email',
        ]">
          <template #bodyRow>
            <tr v-for="(client, index) in clients" :key="index" class="hover:bg-blue-200">
              <ta-body-vue>{{ client.codigo }}</ta-body-vue>
              <ta-body-vue>
                <button tabindex="0" class="text-indigo-600 hover:text-indigo-900" @keydown.enter="setCliente(client.id)"
                  @click="setCliente(client.id)">
                  {{ client.name }}
                </button>
              </ta-body-vue>
              <ta-body-vue>{{ client.saldo_actual }}</ta-body-vue>

              <ta-body-vue>{{ client.saldo_actual }}</ta-body-vue>
              <ta-body-vue>{{ client.email }}</ta-body-vue>
            </tr>
          </template>
        </tabla-vue>
      </template>
      <template #footer>
        <div></div>
      </template>
    </modal-vue>
    <!-- Ajuste Inventarios -->
    <modal-vue @emitCancel="edicion = false" :isVisible="edicion" @emitConfirm="editarArticulo"
      :sizing="'md:h-3/5 md:w-1/5'">
      <template #body>
        <formulario-vue>
          <template #title>Edita Artículo</template>
          <template #body>
            <etiqueta-input v-model="articulo_form.pventa" @keydown.stop.enter="editarArticulo" :data="{
              etiqueta: 'Precio:',
              id: 'pventa',
              type: 'number',
              name: 'pventa',
              placeholder: 'Precio',
            }" />

            <etiqueta-input v-model="articulo_form.cantidad" @keydown.stop.enter="editarArticulo" :data="{
              etiqueta: 'Cantidad:',
              id: 'cantidad',
              type: 'number',
              name: 'cantidad',
              placeholder: 'Ingresa la cantidad',
            }" />
          </template>
          <template></template>
        </formulario-vue>
      </template>
    </modal-vue>

    <!-- Conversion Granel -->
    <modal-vue @emitCancel="openConversion = false" :isVisible="openConversion" @emitConfirm="aceptarConversion"
      :sizing="'md:h-3/5 md:w-2/5'">
      <template #body>
        <formulario-vue>
          <template #title>Conversión Granel</template>
          <p>Existencia:</p>

          <template #body>
            <etiqueta-input v-model="conversion_form.precioBase" @input.stop="modificaPrecioBase"
              @keydown.stop.enter="aceptarConversion" :data="{
                etiqueta: 'Precio Base',
                id: 'precioBase',
                type: 'number',
                name: 'precioBase',
                placeholder: 'Precio',
              }" />

            <etiqueta-input v-model="conversion_form.peso" @input.stop="modificaPeso"
              @keydown.stop.enter="aceptarConversion" :data="{
                etiqueta: 'Peso KG:',
                id: 'peso',
                type: 'number',
                name: 'peso',
                placeholder: '',
              }" />
            <etiqueta-input @input.stop="modificaTotal" v-model="total" @keydown.stop.enter="aceptarConversion" :data="{
              etiqueta: 'Total $',
              id: 'total',
              type: 'number',
              name: 'total',
              placeholder: '',
            }" />
          </template>
          <template></template>
        </formulario-vue>
      </template>
    </modal-vue>

    <!-- Cobrar -->
    <modal-vue @emitCancel="openCobrar = false" :isVisible="openCobrar" :sizing="'md:h-2/5 md:w-2/5'">
      <template #body>
        <formulario-vue>
          <template #title>Cobrar ${{ totalComputed }}</template>
          <template #body>
            <p><span class="font-bold text-gray-800">Su cambio: </span> {{ cambio }}</p>
            <etiqueta-input v-model="pagocon" min="0" :data="{
              etiqueta: 'Paga Con',
              id: 'pagocon',
              type: 'number',
              name: 'pagocon',
            }" @keydown.enter.stop.prevent="guardarVenta(false)" />
            <div v-if="ticketActual.clienteId">
              <input type="checkbox" id="credito" v-model="credito" />
              <label for="credito">Es Venta a Credito</label>
            </div>
          </template>
          <template></template>
        </formulario-vue>
      </template>
      <template #footer>
        <div class="flex flex-col md:flex-row gap-2">
          <primary-button-vue :disabled="cargando" @click.once="guardarVenta(false)">Vender
          </primary-button-vue>
          <secondary-button-vue :disabled="cargando" @click.once="guardarVenta(true)">Vender e Imprimir
          </secondary-button-vue>
        </div>
      </template>
    </modal-vue>

  </FrameVue>
  <ToasterVue></ToasterVue>
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
import SecondaryButtonVue from "../components/util/SecondaryButtonVue.vue";
import SimpleButtonVue from "../components/util/SimpleButtonVue.vue";
import PrimaryButtonVue from "../components/util/PrimaryButtonVue.vue";
import ModalVue from "../components/util/ModalVue.vue";
import FormularioVue from "../components/util/FormularioVue.vue";
import EtiquetaSelect from "../components/util/EtiquetaSelect.vue";
import EtiquetaInput from "../components/util/EtiquetaInput.vue";
import Loading from "../components/util/Loading.vue";
import HeaderVue from "../components/HeaderVue.vue";
import ToasterVue from "../components/util/ToasterVue.vue";
import FrameVue from "../components/FrameVue.vue";

import TaBodyVue from "../components/util/TaBodyVue.vue";
import TablaVue from "../components/util/TablaVue.vue";

import Product from "../apis/Product";
// import Cliente from "../apis/Cliente";
import PuntoVenta from "../apis/PuntoVenta";
import { useUserStore } from "../s";
import { storeToRefs } from "pinia";
import { useMessagesStore } from "../s/messages";
import sqlite from '../sqlite/Index'
import Load from '../sqlite/Load'
import Offline from '../sqlite/Offline'
import { WebviewWindow } from '@tauri-apps/api/window';

const store = useUserStore();
const messages = useMessagesStore();
const { productsData, lastFetchTimes } = storeToRefs(store);
const router = useRouter();
const product_form = reactive({
  name: "",
  codigo: "",
  cantidad: null,
  pventa: null,
  pcosto: null,
  porcentaje_ganancia: null,
  pventa_base: null,
  precio_mayoreo: null,
  existencia: null,
});
const conversion_form = reactive({
  precioBase: null,
  peso: 1,
});
const articulo_form = reactive({
  name: "",
  cantidadActual: null,
  cantidad: null,
  pcosto: null,
  pventa: null,
});
const almacen = reactive({
  id: "",
  name: "",
});
const ticketActual = reactive({
  id: null,
  nombre: "",
  total: null,
  clienteId: null,
  miAlmacenId: null,
  miAlmacenName: "",
  consecutivo: null,
  cliente: "",
  ganancia: null,
});

const total = ref(null);
const codigo = ref("");
const cargando = ref(false);
const credito = ref(false);
const pagocon = ref(null);
const edicion = ref(false);
const keyword = ref("");
const keycliente = ref("");
const temp = ref(null);
const almacens = ref([]);
const productActualId = ref(null);
const products = ref([]);
const lastFetchTimeLocal = ref(null);
const pendientes = ref([]);
const clients = ref([]);
const articuloActualId = ref(null);
const articulos = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const openEdit = ref(false);
const openExistencias = ref(false);
const openCobrar = ref(false);
const openCliente = ref(false);
const openPendiente = ref(false);
const openConversion = ref(false);
const nombreT = ref("");
const timeOut = ref("");
const tHeaders = ref([
  "-",
  "Código",
  "Nombre",
  "Cant",
  "Precio",
  "Descto",
  "Impuesto",
  "Importe",
  "Acciones",
]);
const lastFetchTimeFormatted = computed(() => {
  return formatRelativeTime(lastFetchTimeLocal.value);
})
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} segundo(s)`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minuto(s)`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hora(s)`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} dia(s)`;
  }
}
const totalComputed = computed(() => {
  const suma = articulos.value.reduce(
    (partial_sum, a) => partial_sum + +a.importe,
    0
  );
  return suma.toFixed(2)
});
const cambio = computed(() => {
  let resta = pagocon.value - totalComputed.value;
  if (resta < 0) {
    return `Te Faltan $${-resta} `;
  } else {
    return `$${resta}`;
  }
});
const pventa_porcentaje = computed(() => {
  if (product_form.porcentaje_ganancia == 0) {
    return 0;
  }
  return (
    +product_form.pcosto +
    +product_form.pcosto * (+product_form.porcentaje_ganancia / 100)
  );
});
watch(keycliente, () => {
  getAllClientes();
});
function onEscape(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    document.getElementById("codigo").select();
    if (openExistencias.value === true) {
      return (openExistencias.value = false);
    }
    if (openConversion.value === true) {
      return (openConversion.value = false);
    }
    emptyValues();
    isVisible.value = false;
    openEdit.value = false;
    edicion.value = false;
    openCobrar.value = false;
    openCliente.value = false;
    openPendiente.value = false;
    openConversion.value = false;
  }
  if (e.key === "F9") {
    e.preventDefault();
    abrirModalBuscaProductsNombre();
  }
  // if (e.key === "Insert") {
  //   e.preventDefault();
  //   precioMayoreo();
  // }
  // if (e.key === "F10") {
  //   e.preventDefault();
  //   abrirExistencias();
  // }
  if (e.key === "F2") {
    e.preventDefault();
    abrirCobrarModal();
  }
  if (e.key === "F3") {
    e.preventDefault();
    setPendiente();
  }
  if (e.key === "F6") {
    e.preventDefault();
    abrirPendiente();
  }
  if (e.key === "F7") {
    e.preventDefault();
    router.push({ name: "MisVentas" });
  }
}
function modificaPrecioBase(event) {
  conversion_form.precioBase = event.target.value;
  const fixed = +event.target.value * +conversion_form.peso;
  let res = Math.round(fixed * 100) / 100;
  total.value = res;
}
function modificaPeso(event) {
  conversion_form.peso = event.target.value;
  const fixed = +event.target.value * +conversion_form.precioBase;
  let res = Math.round(fixed * 100) / 100;
  total.value = res;
}
function modificaTotal(event) {
  total.value = event.target.value;
  const fixed = +event.target.value / +conversion_form.precioBase;
  conversion_form.peso = fixed;
}
async function searchProduct() {
  if (cargando.value) return;
  cargando.value = true;
  if (codigo.value == "") {
    cargando.value = false;
    alert("Campo Código Vacio");
    return;
  }
  if (almacen.id == null) {
    cargando.value = false;
    alert("Campo Almacén Vacio");
    return;
  }
  try {
    let data = await Offline.searchCode(codigo.value, almacen.id);
    console.log(data, 'new');
    if (data.length == 0) {
      alert("Producto No Encontrado");
      codigo.value = "";
      return;
    }
    data = data[0];
    rellenaProductForm(data);
    if (data.tventa === "G") {
      abrirConversion(data);
      return;
    }
  } catch (error) {
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
  nextTick(() => document.getElementById("cantidad").select());
}
function emptyValues() {
  codigo.value = "";
  product_form.name = "";
  product_form.codigo = "";
  product_form.cantidad = "";
  product_form.pventa = "";
  product_form.precio_mayoreo = "";
  product_form.existencia = "";
}
function aceptarConversion() {
  product_form.pventa = conversion_form.precioBase;
  product_form.cantidad = conversion_form.peso;
  enviarArticulo();
  openConversion.value = false;
}
async function getProductById(productId) {
  try {
    if (cargando.value) return;
    cargando.value = true;
    const product = await Offline.getProductById(productId);
    if (product == null) {
      codigo.value = "";
      return alert("Producto No Encontrado");
    }
    rellenaProductForm(product);
    codigo.value = product.codigo;
    isVisible.value = false;
    if (product.tventa === "G") {
      abrirConversion(product);
      return;
    }
    nextTick(() => document.getElementById("cantidad").select());
  } catch (error) {
    console.log(error);
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
}
function abrirConversion(data) {
  openConversion.value = true;
  conversion_form.precioBase = data.precio;
  conversion_form.peso = 1;
  total.value = data.precio;
  nextTick(() => document.getElementById("peso").select());
}
async function rellenaTicket(response) {
  credito.value = false;
  ticketActual.id = response.id;
  almacen.id = response.almacen_id;
  ticketActual.miAlmacenId = response.almacen_id;
  ticketActual.nombre = response.nombre;
  ticketActual.consecutivo = response.id;
  ticketActual.clienteId = response.cliente_id;
  ticketActual.miAlmacenName = "";
  almacen.name = "";
  if (ticketActual.miAlmacenId) {
    ticketActual.miAlmacenName = response.name;
    almacen.name = response.name;
  }
  if (response.c_name) {
    ticketActual.cliente = response.c_name;
  } else {
    ticketActual.cliente = "";
  }
  if (ticketActual.miAlmacenId == null) {
    almacens.value = JSON.parse(localStorage.getItem('myAlmacens'))
    if (almacens.value.length == 1) {
      asignarAlmacen(almacens.value[0].id);
    }
  }
}
function rellenaProductForm(data) {
  if (data.product_id) {
    productActualId.value = data.product_id;
  }else{
    productActualId.value = data.id;
  }
  product_form.name = data.name;
  product_form.codigo = data.codigo;
  product_form.cantidad = 1;
  product_form.pventa = data.precio;
  // product_form.pcosto = response.data.pcosto;
  product_form.porcentaje_ganancia = data.porcentaje_ganancia;
  product_form.pventa_base = data.precio;
  product_form.precio_mayoreo = data.precio_mayoreo;
  product_form.existencia = data.cantidad_actual;
}
function abrirEdicion(id, name, pventa, cantidad) {
  edicion.value = true;
  articuloActualId.value = id;
  articulo_form.name = name;
  articulo_form.pventa = pventa;
  articulo_form.cantidad = cantidad;
  nextTick(() => document.getElementById("pventa").select());
}
async function editarArticulo() {
  try {
    if (cargando.value) return;
    cargando.value = true;
    await Offline.updateArticulo(articuloActualId.value, articulo_form.cantidad, articulo_form.pventa);
    edicion.value = false;
    getSpecificVT(ticketActual.id);
  } catch (error) {
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
    openEdit.value = false;
  }
}
async function getAllProducts() {
  if (!almacen.id) alert('No has seleccionado almacen');
  const data = await Offline.searchKeyWord(keyword.value, almacen.id);
  products.value = data;
}
async function getProductsNow() {
  try {
    if (cargando.value) return;
    cargando.value = true;
    await getDesktopProducts();
  } catch (error) {
    alert("Ha ocurrido un error" + error.message)
  } finally {
    cargando.value = false;
  }
}
async function getAllPendientes() {
  try {
    const user = JSON.parse(localStorage.getItem('authuser'))
    if (cargando.value) return;
    cargando.value = true;
    pendientes.value = await Offline.getAllPendientes(user.id, user.organization_id);
  } catch (error) {
    console.log(error);
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
}
async function getAllClientes() {
  try {
    if (cargando.value) return;
    cargando.value = true;
    clients.value = await Offline.getClients();
  } catch (error) {
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
}
async function enviarArticulo() {
  if (cargando.value) return;
  cargando.value = true;
  if (
    productActualId.value == null ||
    ticketActual.id == null ||
    ticketActual.miAlmacenId == null ||
    product_form.pventa == null ||
    product_form.cantidad == null ||
    product_form.cantidad == ""
  ) {
    cargando.value = false;
    alert("Falta alguno: precio o cantidad ");
    return;
  }
  if (+product_form.pventa <= +product_form.pcosto) {
    alert("Revisar Precio Menor Que Costo");
  } else if (
    +pventa_porcentaje.value != 0 &&
    +product_form.pventa < +pventa_porcentaje.value
  ) {
    alert(
      "Revisar!! Precio Menor del Sugerido, Precio Sugerido: $" +
      pventa_porcentaje.value
    );
  }
  try {
    await Offline.enviarArticulo(productActualId.value, product_form.name, ticketActual.id, product_form.pventa, product_form.cantidad);
    await getSpecificVT(ticketActual.id);
    emptyValues();
    document.getElementById("codigo").select();
  } catch (error) {
    console.log(error);
    alert('Ha ocurrido un error')
  } finally {
    cargando.value = false;
  }
}
async function destroyArticulo(articulo) {
  try {
    if (cargando.value) return;
    cargando.value = true;
    await Offline.destroyArticulo(articulo);
    await getSpecificVT(ticketActual.id);

  } catch (error) {
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
}
function abrirModalBuscaProductsNombre() {
  isVisible.value = true;
  getAllProducts();
  nextTick(() => document.getElementById("keyw").select());
}
async function asignarAlmacen(almacenId) {
  try {
    if (cargando.value) return;
    cargando.value = true;
    await Offline.asignarAlmacen(ticketActual.id, almacenId);
    await getSpecificVT(ticketActual.id);

  } catch (error) {
    console.log(error);
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
}
async function setCliente(cliente) {
  try {
    if (cargando.value) return;
    cargando.value = true;
    await Offline.setCliente(cliente, ticketActual.id)
    getSpecificVT(ticketActual.id);
    openCliente.value = false;
    document.getElementById("codigo").select();

  } catch (error) {

    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
}
async function borrarTicket() {
  let conf = await confirm("Estas Seguro de Borrar el Ticket?");
  if (conf) {
    try {
      if (cargando.value) return;
      cargando.value = true;
      await Offline.borrarTicket(ticketActual.id);
      await init();
      ticketActual.miAlmacenName = "";
      emptyValues();
      document.getElementById("codigo").select();

    } catch (error) {
      alert("Ha ocurrido un error")
    } finally {
      cargando.value = false;
    }
  }
}
async function setNombreTicket() {
  try {
    if (cargando.value) return;
    cargando.value = true;
    await Offline.setNombreTicket(nombreT.value, ticketActual.id)
    getSpecificVT(ticketActual.id);
    document.getElementById("codigo").select();
  } catch (error) {
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
}
async function setPendiente() {
  try {
    if (! await confirm("Seguro que quieres dejar la venta pendiente?")) return;
    if (cargando.value) return;
    cargando.value = true;
    await Offline.setPendiente(ticketActual.id);
    await init();
    document.getElementById("codigo").select();

  } catch (error) {
    console.log(error);
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
}
function abrirCobrarModal() {
  openCobrar.value = true;
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
  goPrimerPendiente();
}
async function init() {
  nombreT.value = "";
  try {
    const user = JSON.parse(localStorage.getItem('authuser'))
    let response = await Offline.initTicket(user.organization_id, user.id);
    rellenaTicket(response);
    let art = await Offline.getArticulos(response.id);
    articulos.value = art;
    nextTick(() => document.getElementById("codigo").select());
  } catch (error) {
    console.log(error);
    alert("Ha ocurrido un error");
  } finally {
  }
}
async function getSpecificVT(ventaticket) {
  try {
    nombreT.value = "";
    const data = await Offline.getSpecificVT(ventaticket);
    rellenaTicket(data);
    articulos.value = await Offline.getArticulos(ventaticket);

  } catch (error) {
    console.log(error);
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
    openPendiente.value = false;
    document.getElementById("codigo").select();
  }
}
async function guardarVenta(imprimir) {
  try {
    if (cargando.value) return;
    cargando.value = true;
    await Offline.guardarVenta(totalComputed.value, ticketActual.id, pagocon.value, credito.value);
    openCobrar.value = false;
    if (imprimir) {
      const webview = new WebviewWindow('ImprimirVenta', {
        url: `ventatickets/imprimirOffline/${ticketActual.id}`,
        title: 'Imprimir Venta'
      });
    }
    await init();
    messages.add({ text: "La venta ha sido agregada exitosamente", color: "success" })
  } catch (error) {
    console.log(error);
    alert("Ha ocurrido un error")
  } finally {
    cargando.value = false;
  }
}
function goPrimerArticulo() {
  var elementos = document.getElementsByClassName("articulosInputs");
  elementos[0].focus();
}
function goPrimerPendiente() {
  nextTick(() => temp.value.focus());
}
function makeUpdate(e) {
  keyword.value = e.target.value;
  const task = () => getAllProducts();
  debounce(task, 100);
}
function debounce(func, wait = 1000) {
  clearTimeout(timeOut.value);
  timeOut.value = setTimeout(func, wait);
}
const getDesktopProducts = async () => {
  try {
    let response = await Product.getDesktopProducts();
    const data = response.data;
    await sqlite.deleteProducts()
    await sqlite.deletePrecios()
    await sqlite.deleteAlmacens()
    await Load.products(data.products)
    await Load.precios(data.precios)
    await Load.almacens(data.almacens)
    await Load.clientes(data.clientes)
    alert('Información actualizada')
  } catch (error) {
    if (error?.response?.status == 404) {
      alert("No has generado un archivo")
      return
    }
    alert("Ha ocurrido un error")
  }
}
onMounted(async () => {
  try {
    await sqlite.initDb(false);
    document.addEventListener("keydown", onEscape);
    nextTick(() => document.getElementById("codigo").select());
    init();
  } catch (error) {
    console.log(error);
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});
</script>
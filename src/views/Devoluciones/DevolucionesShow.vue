<template>
  <v-card class="mb-2" v-if="mdAndUp">
    <v-card-title>Venta # {{ ticketActual?.id }} Devolucion #</v-card-title>
    <v-card-text>
      <router-link :to="{ name: 'DevolucionesIndex' }">
        <span class="text-decoration-underline text-caption">
          Regresar al historial de devoluciones
        </span>
      </router-link>
      <v-row dense class="mt-4">
        <v-btn prepend-icon="mdi-printer-pos" v-if="devolucionRealizada" @click="imprimirVenta" :loading="cargando"
          class="mx-2" size="small">Reimprimir
          venta</v-btn>
        <v-btn prepend-icon="mdi-printer-pos" v-if="devolucionRealizada" @click="imprimirDevolucion" :loading="cargando"
          class="mx-2" size="small">Imprimir
          devolucion</v-btn>
        <v-btn prepend-icon="mdi-trash-can" v-if="!devolucionRealizada" @click="eliminarDevolucion" :loading="cargando"
          class="mx-2" size="small">Borrar
          devolucion</v-btn>
        <v-btn prepend-icon="mdi-check-circle" v-if="!devolucionRealizada" @click="realizarDevolucion"
          :loading="cargando" class="mx-2" size="small" color="accent" variant="elevated">Realizar
          devolución</v-btn>
        <p class="text-error mx-4" v-if="devolucionRealizada">Devolucion Realizada</p>
        <div class="flex mx-4">
          <p class="font-weight-bold">Ticket Venta</p>
          <p class="">Folio: {{ ticketActual.id }}</p>
          <p class="">Almacén: {{ ticketActual.miAlmacenName }}</p>
          <p class="">Total: {{ ticketActual.total }}</p>
          <p>Fecha y Hora: {{ ticketActual.pagado_en }}</p>
          <p v-if="ticketActual.cancelada">Cancelada</p>
        </div>
        <div class="flex">
          <p class="font-weight-bold">Ticket Devolución</p>
          <p class="">Folio: {{ devolucionActual.id }}</p>
          <p class="">Total: {{ devolucionActual.total }}</p>
          <p>Fecha y Hora: {{ devolucionActual.pagado_en }}</p>
          <p v-if="devolucionActual.cancelada">Cancelada</p>
        </div>
      </v-row>
    </v-card-text>
  </v-card>
  <v-card class="mb-2" v-if="smAndDown">
    <v-card-title>Venta # {{ ticketActual?.id }} Devolucion #</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12">
          <v-row dense>
            <v-spacer></v-spacer>
            <v-btn class="hidden-xs-only" variant="outlined" size="small" append-icon="mdi-menu-down"
              @click="drawer = true">
              Detalles
            </v-btn>
          </v-row>
        </v-col>
        <v-col cols="12">
          <router-link :to="{ name: 'DevolucionesIndex' }">
            <span class="text-decoration-underline text-caption">
              Regresar al historial de devoluciones
            </span>
          </router-link>
        </v-col>
        <v-col cols="12">
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary
    v-if="smAndDown">
    <v-card>
      <v-container>
        <v-row dense>
          <v-btn prepend-icon="mdi-check-circle" v-if="!devolucionRealizada" @click="realizarDevolucion"
            :loading="cargando" class="my-1" block size="small" color="accent" variant="elevated">Realizar
            devolución</v-btn>
          <v-btn prepend-icon="mdi-printer-pos" v-if="devolucionRealizada" @click="imprimirVenta" :loading="cargando"
            class="my-1" block size="small">Reimprimir
            venta</v-btn>
          <v-btn prepend-icon="mdi-printer-pos" v-if="devolucionRealizada" @click="imprimirDevolucion"
            :loading="cargando" class="my-1" block size="small">Imprimir
            devolucion</v-btn>
          <v-btn prepend-icon="mdi-trash-can" v-if="!devolucionRealizada" @click="eliminarDevolucion"
            :loading="cargando" class="my-1" block size="small">Borrar
            devolucion</v-btn>
          <p class="text-error" v-if="devolucionRealizada">Devolucion Realizada</p>
          <div class="flex mb-2">
            <p class="font-weight-bold">Ticket Venta</p>
            <p class="">Folio: {{ ticketActual.id }}</p>
            <p class="">Almacén: {{ ticketActual.miAlmacenName }}</p>
            <p class="">Total: {{ ticketActual.total }}</p>
            <p>Fecha y Hora: {{ ticketActual.pagado_en }}</p>
            <p v-if="ticketActual.cancelada">Cancelada</p>
          </div>
          <div class="flex">
            <p class="font-weight-bold">Ticket Devolución</p>
            <p class="">Folio: {{ devolucionActual.id }}</p>
            <p class="">Total: {{ devolucionActual.total }}</p>
            <p>Fecha y Hora: {{ devolucionActual.pagado_en }}</p>
            <p v-if="devolucionActual.cancelada">Cancelada</p>
          </div>
        </v-row>
      </v-container>
    </v-card>
  </v-navigation-drawer>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="6">
        <v-toolbar>
          <v-toolbar-title>Ticket venta</v-toolbar-title>
        </v-toolbar>
        <v-data-table :headers="tHeaders" :items="articulos" dense>
          <template v-slot:item.acciones="{ item }">
            <v-btn v-if="!devolucionRealizada &&
              +item.cantidad > +item.cantidad_devuelta
            " @click="
              abrirDevolucion(
                item.id,
                item.cantidad,
                item.cantidad_devuelta
              )
              " size="small" prepend-icon="mdi-cash-refund">Devolver</v-btn>
          </template>
          <template v-slot:item.precio_usado="{ item }">
            <span>${{ formatNumber(item.precio_usado) }}</span>
          </template>
          <template v-slot:item.precio_final="{ item }">
            <span>${{ formatNumber(item.precio_final) }}</span>
          </template>
          <template v-slot:item.es_kit="{ item }">
            <span>{{ item.es_kit ? 'Sí' : 'No' }}</span>
          </template>
          <template v-slot:item.fue_devuelto="{ item }">
            <span>{{ item.fue_devuelto ? 'Si' : 'No' }}</span>
          </template>
        </v-data-table>
      </v-col>
      <v-col cols="12" sm="6">
        <v-toolbar>
          <v-toolbar-title>Ticket devolución</v-toolbar-title>
        </v-toolbar>
        <v-data-table :headers="headers" :items="articulosDevolucion" dense>
          <template v-slot:item.acciones="{ item }">
            <v-btn v-if="!devolucionRealizada" @click="eliminarArticuloDevolucion(item.id)" size="small"
              prepend-icon="mdi-trash-can">Eliminar</v-btn>
          </template>
          <template v-slot:item.codigo="{ item }">
            <span>{{ item.product?.codigo }}</span>
          </template>
          <template v-slot:item.precio_usado="{ item }">
            <span>${{ formatNumber(item.precio_usado) }}</span>
          </template>
          <template v-slot:item.precio_final="{ item }">
            <span>${{ formatNumber(item.precio_final) }}</span>
          </template>
          <template v-slot:item.es_kit="{ item }">
            <span>{{ item.es_kit ? 'Sí' : 'No' }}</span>
          </template>
          <template v-slot:item.fue_devuelto="{ item }">
            <span>{{ item.fue_devuelto ? 'Si' : 'No' }}</span>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="openDevolucion" max-width="500">
    <v-card>
      <v-card-title>Cantidad Máxima a Devolver: {{ restaGeneral }}</v-card-title>
      <v-card-text>
        <v-text-field label="Ingresa la cantidad que quieres devolver" v-model="cantidad"
          ref="cantidadRef"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openDevolucion = false" variant="text" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="enviarArticuloDevolucion" color="accent" variant="outlined" :loading="cargando">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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

import { useRoute, useRouter } from "vue-router";
import PuntoVenta from "../../apis/PuntoVenta";
import Devoluciones from "../../apis/Devoluciones";
import { useUserStore } from "../../s";
import { useDisplay } from "vuetify";
const { formatNumber } = useCurrency('es-MX', 'MXN');
const props = defineProps(['devolucion']);
const s = useUserStore();
const { handleOpException } = s;
const { xs, mdAndUp, smAndDown } = useDisplay()

const router = useRouter();

const route = useRoute();
const drawer = ref(false);
const articuloActual = ref(null);
const openDevolucion = ref(false);
const cantidad = ref(0);
const cantidadDevuelta = ref(0);
const cantidadActual = ref(0);
const cantidadRef = ref(null);
const articulos = ref([]);
const cargando = ref(false);
const articulosDevolucion = ref([]);
const tHeaders = ref([
  { title: 'Acciones', key: 'acciones', align: 'start', sortable: false },
  { title: 'Código', key: 'codigo', align: 'start', sortable: false },
  { title: 'Cantidad', key: 'cantidad', align: 'start', sortable: false },
  { title: 'Precio venta', key: 'precio_usado', align: 'start', sortable: false },
  { title: 'Importe', key: 'precio_final', align: 'start', sortable: false },
  { title: 'Kit', key: 'es_kit', align: 'start', sortable: false },
  { title: 'Devolución', key: 'fue_devuelto', sortable: false },
]);
const headers = ref([
  { title: 'Código', key: 'codigo', align: 'start', sortable: false },
  { title: 'Cantidad devuelta', key: 'cantidad_devuelta', align: 'start', sortable: false },
  { title: 'Dinero devuelto', key: 'dinero_devuelto', align: 'start', sortable: false },
  { title: 'Acciones', key: 'acciones', align: 'start', sortable: false },
]);


const ticketActual = reactive({
  id: null,
  nombre: "",
  total: null,
  clienteId: null,
  miAlmacenId: null,
  miAlmacenName: "",
  cancelada: null,
  pagado_en: null,
});
const devolucionActual = reactive({
  id: null,
  nombre: "",
  total: null,
  clienteId: null,
  miAlmacenId: null,
  miAlmacenName: "",
  cancelada: null,
  pagado_en: null,
  tipo: null,
});

watch(() => route.query, (toQuery, prevQuery) => {
  if (toQuery.venta) {
    getSpecificVT(route.params.venta);
  }
  if (toQuery.devolucion) {
    getSpecificDevolucion(route.params.devolucion);
  }
});

const restaGeneral = computed(
  () => cantidadActual.value - cantidadDevuelta.value
);
const devolucionRealizada = computed(() => {
  return devolucionActual.tipo == "C";
});

const cargandoMsg = computed(() => {
  if (cargando.value == true) return "Cargando...";
  return "";
});
function onEscape(e) {
  if (e.key === "F4") {
  }
}
function getSpecificDevolucion(venta) {
  Devoluciones.getSpecificDevolucion(venta)
    .then((response) => {
      rellenaTicketDevolucion(response.data[0]);
      articulosDevolucion.value = response.data[1];
    })
    .catch((error) => {
      handleOpException(error);
    });
}
function getSpecificVT(ventaticket) {
  PuntoVenta.getSpecificVT(ventaticket)
    .then((response) => {
      rellenaTicket(response.data[0]);
      articulos.value = response.data[1];
    })
    .catch((error) => {
      handleOpException(error);
    });
}
async function rellenaTicketDevolucion(response) {
  devolucionActual.id = response.id;
  devolucionActual.pagado_en = response.pagado_en;
  devolucionActual.total = response.total_devuelto;
  devolucionActual.tipo = response.tipo_devolucion;
}
function rellenaTicket(response) {
  ticketActual.id = response.id;
  ticketActual.miAlmacenId = response.almacen_id;
  ticketActual.nombre = response.nombre;
  ticketActual.total = response.total;
  ticketActual.pagado_en = response.pagado_en;

  if (ticketActual.miAlmacenId) {
    ticketActual.miAlmacenName = response.almacen.name;
  }
}
function abrirDevolucion(articulo, cantidadA, cantidadD) {
  openDevolucion.value = true;
  nextTick(() => cantidadRef.value.select());
  articuloActual.value = articulo;
  cantidadDevuelta.value = cantidadD;
  cantidadActual.value = cantidadA;
}
function eliminarArticuloDevolucion(id) {
  Devoluciones.eliminarArticuloDevolucion(id)
    .then((response) => {
      getSpecificDevolucion(route.params.devolucion);
      getSpecificVT(route.params.venta);
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    });
}
function imprimirVenta() {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirVentas', {
      url: `ventatickets/imprimir/${ticketActual.id}`,
      title: 'Imprimir Venta'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/ventatickets/imprimir/${ticketActual.id}`,
    "_blank",
    "noreferrer"
  );
}
function imprimirDevolucion() {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirDevoluciones', {
      url: `devoluciones/imprimir/${devolucionActual.id}`,
      title: 'Imprimir Devoluciones'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/devoluciones/imprimir/${devolucionActual.id}`,
    "_blank",
    "noreferrer"
  );
}
function eliminarDevolucion() {
  Devoluciones.eliminarDevolucion(devolucionActual.id)
    .then(() => {
      router.push("misDevoluciones");
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    });
}
function enviarArticuloDevolucion() {
  Devoluciones.enviarArticuloDevolucion(
    devolucionActual.id,
    articuloActual.value,
    cantidad.value
  )
    .then(() => {
      getSpecificDevolucion(devolucionActual.id);
      getSpecificVT(ticketActual.id);
      openDevolucion.value = false;
    })
    .catch((error) => {
      handleOpException(error);
    });
}
function realizarDevolucion() {
  if (cargando.value) return;
  cargando.value = true;

  Devoluciones.realizarDevolucion(devolucionActual.id)
    .then(() => {
      getSpecificDevolucion(devolucionActual.id);
      openDevolucion.value = false;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false
    });
}
onMounted(() => {
  getSpecificDevolucion(route.params.devolucion);
  getSpecificVT(route.params.venta);
  document.addEventListener("keydown", onEscape);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});
</script>
<template>
  <v-card class="mb-2" v-if="mdAndUp">
    <v-card-title>Movimiento # {{ movimientoActual?.consecutivo }}</v-card-title>
    <v-card-text>
      <router-link :to="{ name: 'MovimientosIndex' }">
        <span class="text-decoration-underline text-caption">
          Regresar al historial de movimientos
        </span>
      </router-link>
      <v-row dense class="mt-4">
        <v-btn size="small" class="mx-1" prepend-icon="mdi-printer-pos" @click="imprimirMovimiento">Reimprimir</v-btn>
        <v-btn size="small" class="mx-1" prepend-icon="mdi-cancel" v-if="movimientoActual.estado !== 'C'"
          @click="cancelarMovimiento">Cancelar</v-btn>
        <div class="mx-2">
          <p>Id: {{ movimientoActual.id }}</p>
          <p>Consecutivo: {{ movimientoActual.consecutivo }}</p>
          <p>Fecha y Hora: {{ movimientoActual.enviada_en }}</p>
          <p class="font-weight-bold">Tipo: {{ movimientoActual.tipo }}</p>
        </div>
        <div class="mx-2">
          <p class="text-red-700" v-if="movimientoActual.estado == 'C'">Cancelada</p>
          <p>
            Almacén Origen:{{ movimientoActual.miAlmacenOrigenName }}
          </p>
          <p>
            Almacén Destino:{{ movimientoActual.miAlmacenDestinoName }}
          </p>
        </div>
        <div>
          <p>Subtotal: ${{ movimientoActual.subtotal }}</p>
          <p>Impuestos: ${{ movimientoActual.impuestos_enviado }}</p>
          <p>Total: ${{ movimientoActual.total }}</p>
        </div>
      </v-row>
    </v-card-text>
  </v-card>
  <v-card class="mb-2" v-if="smAndDown">
    <v-card-title>Movimiento # {{ movimientoActual?.id }}</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12">
          <router-link :to="{ name: 'MovimientosIndex' }">
            <span class="text-decoration-underline text-caption">
              Regresar al historial de movimientos
            </span>
          </router-link>
        </v-col>
        <v-col cols="12">
          <v-spacer></v-spacer>
          <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
            @click="drawer = true">
            Detalles
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary
    v-if="mdAndDown">
    <v-card>
      <v-container>
        <v-row dense class="mt-2">
          <v-btn block size="small" class="my-1" prepend-icon="mdi-printer-pos"
            @click="imprimirMovimiento">Reimprimir</v-btn>
          <v-btn block size="small" class="my-1" prepend-icon="mdi-cancel" v-if="movimientoActual.estado !== 'C'"
            @click="cancelarMovimiento">Cancelar</v-btn>
          <div class="">
            <p>Id: {{ movimientoActual.id }}</p>
            <p>Consecutivo: {{ movimientoActual.consecutivo }}</p>
            <p>Tipo: {{ movimientoActual.tipo }}</p>
            <p>
              Almacén Origen:{{ movimientoActual.miAlmacenOrigenName }}
            </p>
            <p>
              Almacén Destino:{{ movimientoActual.miAlmacenDestinoName }}
            </p>
            <p>Fecha y Hora: {{ movimientoActual.enviada_en }}</p>
            <p class="text-red-700" v-if="movimientoActual.estado == 'C'">Cancelada</p>
          </div>
          <div>
            <p>Subtotal: ${{ movimientoActual.subtotal }}</p>
            <p>Impuestos: ${{ movimientoActual.impuestos_enviado }}</p>
            <p>Total: ${{ movimientoActual.total }}</p>
          </div>
        </v-row>
      </v-container>
    </v-card>
  </v-navigation-drawer>
  <v-container fluid>
    <v-data-table :headers="tHeaders" :items="articulos" dense>
      <template v-slot:item.product_name="{ item }">
        <router-link :to="{ name: 'ProductosIndex', query: { keyword: item.product_name ?? item.product.name } }">
          <span class="text-primary text-decoration-underline cursor-pointer font-weight-medium">{{ item.product_name ??
            item.product?.name
            }}</span>
        </router-link>
      </template>
      <template v-slot:item.precio_usado="{ item }">
        <span>${{ item.precio_usado }}</span>
      </template>
      <template v-slot:item.precio_final="{ item }">
        <span>${{ item.precio_final }}</span>
      </template>
      <template v-slot:item.fue_devuelto="{ item }">
        <span>{{ item.fue_devuelto ? 'Si' : 'No' }}</span>
      </template>
    </v-data-table>
  </v-container>
</template>
<script setup>
import { onMounted, onUnmounted, ref, reactive, watch } from "vue";

import { useRoute } from "vue-router";
import Movimientos from "../../apis/Movimientos";
import { useUserStore } from "../../s";
import { useDisplay } from "vuetify";
const { xs, mdAndUp, mdAndDown, smAndDown } = useDisplay()
const s = useUserStore();
const { handleOpException } = s;

const route = useRoute();
const movimientoActual = reactive({
  id: null,
  total: null,
  proveedorId: null,
  almacenOrigenId: null,
  almacenDestinoId: null,
  miAlmacenOrigenName: "",
  miAlmacenDestinoName: "",
  proveedor: "",
  consecutivo: null,
  tipo: null,
  enviada_en: null,
  estado: "",
});
const tHeaders = ref([
  { title: 'Código', key: 'codigo', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Cantidad', key: 'cantidad_ordenada', align: 'start', sortable: false },
  { title: 'Costo', key: 'costo_al_ordenar', align: 'start', sortable: false },
  { title: 'Importe', key: 'total_al_ordenar', align: 'start', sortable: false },
  { title: 'Impuesto', key: 'impuestos_al_enviar', align: 'start', sortable: false },
  { title: 'Existencia', key: 'cantidad_actual', align: 'start', sortable: false },
  { title: 'Es kit', key: 'es_kit', sortable: false },
]);

const articulos = ref([]);
const loadingButton = ref(false);
const drawer = ref(false);
watch(movimientoActual, () => {
  getSpecificVT(movimientoActual.id);
});

function onEscape(e) {
  if (e.key === "F4") {
    //ir a movimientos
  }
}
function rellenaTicket(response) {
  movimientoActual.id = response.id;
  movimientoActual.almacenOrigenId = response.almacen_origen_id;
  movimientoActual.miAlmacenOrigenName = response.almacen_origen
    ? response.almacen_origen.name
    : "";
  movimientoActual.almacenDestinoId = response.almacen_destino_id;
  movimientoActual.miAlmacenDestinoName = response.almacen_destino
    ? response.almacen_destino.name
    : "";
  movimientoActual.proveedor = response.proveedor_id;
  movimientoActual.tipo = response.tipo;
  movimientoActual.enviada_en = response.enviada_en;
  movimientoActual.consecutivo = response.consecutivo;
  movimientoActual.total = response.total_enviado;
  movimientoActual.impuestos_enviado = response.impuestos_enviado;
  movimientoActual.subtotal = response.subtotal_enviado;
  movimientoActual.proveedorId = response.proveedor_id;
  movimientoActual.estado = response.estado;

  if (movimientoActual.almacenOrigenId) {
    movimientoActual.miAlmacenOrigenName = response.almacen_origen.name;
  }

  if (movimientoActual.almacenDestinoId) {
    movimientoActual.miAlmacenDestinoName = response.almacen_destino.name;
  }
}
function getSpecificVT(movimiento) {
  Movimientos.getSpecificVT(movimiento)
    .then((response) => {
      console.log(response.data[1], 'res');

      rellenaTicket(response.data[0]);
      articulos.value = response.data[1];
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function imprimirMovimiento() {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirMovimiento', {
      url: `movimientos/imprimir/${movimientoActual.id}`,
      title: 'Imprimir Movimiento'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/movimientos/imprimir/${movimientoActual.id}/ `,
    "noreferrer",
    "_blank"
  );
}
function cancelarMovimiento() {
  if (loadingButton.value) return;
  loadingButton.value = true;
  Movimientos.cancelarMovimiento(movimientoActual.id)
    .then(() => {
      getSpecificVT(movimientoActual.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ocurrio un error");
    }).finally(() => {
      loadingButton.value = false;
    });
}
onMounted(() => {
  movimientoActual.id = route.params.movimientoId;
  document.addEventListener("keydown", onEscape);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});
</script>
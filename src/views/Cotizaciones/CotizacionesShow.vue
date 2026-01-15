<template>
  <v-container fluid class="py-0 mt-2">
    <v-card class="mb-2" v-if="mdAndUp">
      <v-card-title>Cotización folio # {{ ticketActual?.consecutivo }}</v-card-title>
      <v-card-text>
        <router-link :to="{ name: 'CotizacionesIndex' }">
          <span class="text-decoration-underline text-caption">
            Regresar al historial de cotizaciones
          </span>
        </router-link>
        <v-row dense class="mt-2">
          <v-btn size="small" @click="imprimirVenta" class="mx-2" prepend-icon="mdi-printer-pos">Reimprimir</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &&
            !ticketActual.latest_pre_factura?.facturado_en &&
            !ticketActual.ventaticket_id
          " @click="cancelarVenta" class="mx-2" prepend-icon="mdi-cancel">Cancelar</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &&
            !ticketActual.clienteId &&
            !ticketActual.latest_pre_factura?.facturado_en &&
            !ticketActual.ventaticket_id
          " @click="abrirCliente" class="mx-2" prepend-icon="mdi-account-multiple">Clientes</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &&
            !ticketActual.latest_pre_factura?.facturado_en &&
            !ticketActual.ventaticket_id
          " @click="finzalizeCotization" class="mx-2" color="primary" variant="elevated"
            prepend-icon="mdi-check-circle">Generar venta</v-btn>
          <div v-else-if="ticketActual.ventaticket_id" class="mx-2">
            <router-link :to="{ name: 'VentasShow', params: { ventaId: ticketActual.ventaticket_id } }">
              <p>Ticket Venta: {{ ticketActual?.ventaticket?.consecutivo }}</p>
            </router-link>
          </div>

          <div class="mx-2">
            <p>Almacén: {{ ticketActual?.almacen?.name }}</p>
            <p>Cliente: {{ ticketActual?.cliente?.name }}</p>
          </div>
          <div>
            <p>Subtotal: ${{ ticketActual.subtotal }}</p>
            <p>Descuento: ${{ ticketActual.descuento }}</p>
            <p>Impuesto Retenido: ${{ ticketActual.impuesto_retenido }}</p>
            <p>Impuesto Trasladado: ${{ ticketActual.impuesto_traslado }}</p>
            <p>Total: ${{ ticketActual.total }}</p>
          </div>
          <p class="mx-4 text-error" v-if="ticketActual.total_devuelto > 0">
            Total Devuelto: ${{ ticketActual.total_devuelto }}
          </p>
          <p class="mx-4">
            Creado en:
            {{ moment(ticketActual.created_at).format("DD-MM-YYYY h:mma") }}
          </p>
          <p v-if="ticketActual.cancelado" class="mx-4 text-error">Cancelada</p>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
  <!-- Mobile -->
  <v-card class="mb-2" v-if="smAndDown">
    <v-card-title>Venta # {{ ticketActual?.id }}</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12">
          <router-link :to="{ name: 'VentasIndex' }">
            <span class="text-decoration-underline text-caption">
              Regresar al historial de ventas
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
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary
    v-if="mdAndDown">
    <v-card>
      <v-container>
        <v-row dense class="m2-4">
          <v-btn size="small" @click="imprimirVenta" class="my-1" block>Reimprimir</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &
            !ticketActual.latest_pre_factura?.facturado_en
          " @click="cancelarVenta" class="my-1" block>Cancelar</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &&
            !ticketActual.clienteId &
            !ticketActual.latest_pre_factura?.facturado_en
          " @click="abrirCliente" class="my-1" block>Clientes</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &&
            !ticketActual.latest_pre_factura?.facturado_en
          " @click="finzalizeCotization" class="my-1" color="primary" variant="elevated" block>Generar venta</v-btn>

          <div>
            <p>Almacén: {{ ticketActual.miAlmacenName }}</p>
            <p>Cliente: {{ ticketActual.clienteName }}</p>
            <p>Subtotal: ${{ ticketActual.subtotal }}</p>
            <p>Descuento: ${{ ticketActual.descuento }}</p>
            <p>Impuesto Retenido: ${{ ticketActual.impuesto_retenido }}</p>
            <p>Impuesto Trasladado: ${{ ticketActual.impuesto_traslado }}</p>
            <p>Total: ${{ ticketActual.total }}</p>
            <p class="text-error" v-if="ticketActual.total_devuelto > 0">
              Total Devuelto: ${{ ticketActual.total_devuelto }}
            </p>
            <p>
              Pagado en:
              {{ moment(ticketActual.pagado_en).format("DD-MM-YYYY h:mma") }}
            </p>
            <p v-if="ticketActual.cancelado" class="text-error">Cancelada</p>
          </div>
        </v-row>
      </v-container>
    </v-card>
  </v-navigation-drawer>
  <v-container fluid>
    <v-data-table :headers="tHeaders" :items="articulos" dense>
      <template v-slot:item.product_name="{ item }">
        <router-link :to="{
          name: 'ProductosIndex',
          query: { keyword: item.product_name ?? item.product.name },
        }">
          <span class="text-primary text-decoration-underline cursor-pointer font-weight-medium">{{ item.product_name ??
            item.product?.name }}</span>
        </router-link>
      </template>
      <template v-slot:item.precio_usado="{ item }">
        <span>${{ item.precio_usado }}</span>
      </template>
      <template v-slot:item.precio_final="{ item }">
        <span>${{ item.precio_final }}</span>
      </template>
      <template v-slot:item.fue_devuelto="{ item }">
        <span>{{ item.fue_devuelto ? "Si" : "No" }}</span>
      </template>
    </v-data-table>
  </v-container>
  <!-- Clientes -->
  <v-dialog v-model="openCliente">
    <v-card>
      <v-card-title>Clientes</v-card-title>
      <v-card-text>
        <v-text-field v-model="keycliente" label="Cliente" prepend-inner-icon="mdi-magnify" variant="outlined"
          placeholder="Ingresa nombre del cliente" hide-details single-line id="keycliente"></v-text-field>
      </v-card-text>
      <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
      <v-data-table :headers="clienteHeaders" :items="clients" items-per-page="5" show-select select-strategy="single">
        <template v-slot:item.data-table-select="{
          internalItem,
          isSelected,
          toggleSelect,
          index,
        }">
          <v-checkbox-btn :model-value="isSelected(internalItem)" color="primary"
            @update:model-value="toggleSelect(internalItem)" class="articulosInputs"
            @click="setCliente(internalItem.raw.id)" @keydown.enter="setCliente(internalItem.raw.id)"></v-checkbox-btn>
        </template>
        <template v-slot:item.saldo_actual="{ item }">
          <span>${{ item.saldo_actual }}</span>
        </template>
        <template v-slot:item.limite_credito="{ item }">
          <span>${{ item.limite_credito }}</span>
        </template>
      </v-data-table>
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
  computed,
  nextTick,
} from "vue";

import { useRoute } from "vue-router";
import moment from "moment-timezone";
import Organizacion from "@js/apis/Organizacion";
import Cotizacion from "../../apis/Cotizacion";

const s = useUserStore();
const { handleOpException } = s;
import Cliente from "../../apis/Cliente";
import { useUserStore } from "../../s";
import { useDisplay } from "vuetify";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";
const { xs, mdAndUp, mdAndDown, smAndDown } = useDisplay();
const route = useRoute();
const keycliente = ref("");
const clients = ref([]);
const cotizacionId = ref(null);
const cargando = ref(false);
const openCliente = ref(false);
const drawer = ref(false);
const saldo = ref(null);
const { processRequest } = useProcessRequest();
const { notify } = useNotification();
const clienteHeaders = ref([
  { title: "Id", key: "id", align: "start", sortable: false },
  { title: "Nombre", key: "name", align: "start", sortable: false },
  {
    title: "Saldo Actual",
    key: "saldo_actual",
    align: "start",
    sortable: false,
  },
  {
    title: "Límite de crédito",
    key: "limite_credito",
    align: "start",
    sortable: false,
  },
  { title: "Email", key: "email", align: "start", sortable: false },
]);
const tHeaders = ref([
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "product_name", align: "start", sortable: false },
  { title: "Cantidad", key: "cantidad", align: "start", sortable: false },
  { title: "Precio", key: "precio", align: "start", sortable: false },
  { title: "Importe", key: "importe", align: "start", sortable: false },
  {
    title: "Descuento",
    key: "importe_descuento",
    align: "start",
    sortable: false,
  },
  {
    title: "Impuesto T",
    key: "impuesto_traslado",
    align: "start",
    sortable: false,
  },
  {
    title: "Impuesto R",
    key: "impuesto_retenido",
    align: "start",
    sortable: false,
  },
  {
    title: "Existencia",
    key: "cantidad_actual",
    align: "start",
    sortable: false,
  },
]);
const ticketActual = ref({});

const articulos = ref([]);
watch(cotizacionId, () => {
  getSpecificVT(cotizacionId.value);
});

const devuelto = computed(() =>
  articulos.value.some((articulo) => articulo.fue_devuelto == 1)
);

function abrirCliente() {
  openCliente.value = true;

  nextTick(() => document.getElementById("keycliente").select());
  getAllClientes();
}
async function finzalizeCotization() {
  if (cargando.value) return;
  cargando.value = true;
  try {
    const { data } = await Cotizacion.finalize(cotizacionId.value)
    getSpecificVT(cotizacionId.value);

  } catch (error) {

  } finally {
    cargando.value = false
  }

}

function getAllClientes() {
  processRequest(async () => {
    const response = await Cliente.getAllClientes(keycliente.value);
    clients.value = response.data;
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error");
    }
  });
}
function setCliente(cliente) {
  processRequest(async () => {
    await Cliente.setCliente(cliente, ticketActual.value.id);
    cargando.value = false;
    await getSpecificVT(cotizacionId.value);
    openCliente.value = false;
  }, cargando, {
    onError: () => {
      notify.error("Ha ocurrido un error");
    }
  });
}
function onEscape(e) {
  if (e.key === "F4") {
    //ir a ventas
  }
}
async function getSpecificVT(ventaticket) {
  try {
    const { data } = await Cotizacion.getSpecificVT(ventaticket);
    ticketActual.value = data[0];
    articulos.value = data[1];
    const { data: newData } = await Organizacion.getFoliosSaldo();
    saldo.value = newData?.saldo;
  } catch (error) {
    console.log(error);

    handleOpException(error);
    alert("Ha ocurrido un error");
  }
}
function imprimirVenta() {
  if (window.__TAURI__) {
    const webview = new WebviewWindow("ImprimirVentas", {
      url: `cotizacions/imprimir/${cotizacionId.id}`,
      title: "Imprimir Venta",
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/cotizacions/imprimir/${cotizacionId.value}`,
    "_blank",
    "noreferrer"
  );
}
function cancelarVenta() {
  processRequest(async () => {
    await Cotizacion.cancelarVenta(ticketActual.value.id);
    cargando.value = false;
    await getSpecificVT(ticketActual.value.id);
  }, ref(false), {
    onError: () => {
      notify.error("Ha ocurrido un error");
    }
  });
}

onMounted(() => {
  cotizacionId.value = route.params.cotizacionId;
  document.addEventListener("keydown", onEscape);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});
</script>

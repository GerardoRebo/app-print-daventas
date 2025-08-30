<template>
  <v-card class="mb-2" v-if="mdAndUp">
    <v-card-title>Ticket venta folio # {{ ticketActual?.consecutivo }}</v-card-title>
    <v-card-text>
      <router-link :to="{ name: 'VentasIndex' }">
        <span class="text-decoration-underline text-caption">
          Regresar al historial de ventas
        </span>
      </router-link>
      <v-row dense class="mt-2">
        <v-btn size="small" @click="verFormasDePago" class="mx-2" prepend-icon="mdi-wallet">Formas de pago</v-btn>
        <v-btn size="small" @click="imprimirVenta" class="mx-2" prepend-icon="mdi-printer-pos">Reimprimir</v-btn>
        <v-btn size="small" v-if="
          !ticketActual.esta_cancelado &&
          !devuelto &&
          !ticketActual.facturado_en &
          !ticketActual.latest_pre_factura?.facturado_en
        " @click="cancelarVenta" class="mx-2" prepend-icon="mdi-cancel">Cancelar</v-btn>
        <v-btn size="small" v-if="
          !ticketActual.esta_cancelado &&
          !devuelto &&
          !ticketActual.facturado_en &&
          !ticketActual.clienteId &
          !ticketActual.latest_pre_factura?.facturado_en
        " @click="abrirCliente" class="mx-2" prepend-icon="mdi-account-multiple">Clientes</v-btn>
        <v-btn size="small" v-if="
          !ticketActual.esta_cancelado &&
          !devuelto &&
          !ticketActual.facturado_en &&
          !ticketActual.latest_pre_factura?.facturado_en
        " @click="isFacturaInfoOpen = true" class="mx-2" color="accent" variant="elevated"
          prepend-icon="mdi-check">Facturar</v-btn>
        <template v-else-if="!ticketActual.esta_cancelado && ticketActual?.facturado_en">
          <v-btn size="small" @click="descargarXml" class="mx-2" prepend-icon="mdi-xml">Descargar Xml</v-btn>
          <v-btn size="small" @click="descargarPdf" class="mx-2" prepend-icon="mdi-file-pdf-box">Descargar Pdf</v-btn>
          <p v-if="ticketActual.facturado_en" class="mx-2">
            Facturado en:
            {{ moment(ticketActual.facturado_en).format("DD-MM-YYYY h:mma") }}
          </p>
        </template>
        <template v-if="ticketActual?.latest_pre_factura?.pre_factura_global_id">
          <p class="mx-2">
            Facturado en:
            {{
              moment(ticketActual.latest_pre_factura.facturado_en).format(
                "DD-MM-YYYY h:mma"
              )
            }}
          </p>
          <p class="mx-2">
            Factura global:
            <router-link :to="{
              name: 'FacturasGlobalesShow',
              params: {
                facturaId:
                  ticketActual.latest_pre_factura.pre_factura_global_id,
              },
            }">
              {{ ticketActual.latest_pre_factura.pre_factura_global_id }}
            </router-link>
          </p>
        </template>
        <div class="mx-2">
          <p>Timbres Disponibles: {{ saldo?.saldo ?? 0 }}</p>
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
          Pagado en:
          {{ moment(ticketActual.pagado_en).format("DD-MM-YYYY h:mma") }}
        </p>
        <p v-if="ticketActual.esta_cancelado" class="mx-4 text-error">Cancelada</p>
      </v-row>
    </v-card-text>
  </v-card>
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
          !ticketActual.esta_canceladesta_canceladoo &&
          !devuelto &&
          !ticketActual.facturado_en &
          !ticketActual.latest_pre_factura?.facturado_en
        " @click="cancelarVenta" class="mx-2" prepend-icon="mdi-cancel">Cancelar</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.esta_cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &&
            !ticketActual.clienteId &
            !ticketActual.latest_pre_factura?.facturado_en
          " @click="abrirCliente" class="my-1" block>Clientes</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.esta_cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &&
            !ticketActual.latest_pre_factura?.facturado_en
          " @click="isFacturaInfoOpen = true" class="my-1" color="accent" variant="elevated" block>Facturar</v-btn>
          <template v-else-if="!ticketActual.esta_cancelado">
            <v-btn size="small" @click="descargarXml" class="my-1" block>Descargar Xml</v-btn>
            <v-btn size="small" @click="descargarPdf" class="my-1" block>Descargar Pdf</v-btn>
            <p v-if="ticketActual.facturado_en" class="my-1">
              Facturado en:
              {{ moment(ticketActual.facturado_en).format("DD-MM-YYYY h:mma") }}
            </p>
            <p v-else="ticketActual.facturado_en" class="my-1">
              Facturado en:
              {{
                moment(ticketActual.latest_pre_factura.facturado_en).format(
                  "DD-MM-YYYY h:mma"
                )
              }}
            </p>
            <p v-if="ticketActual.latest_pre_factura.facturado_en" class="">
              Factura global:
              <router-link :to="{
                name: 'FacturasGlobalesShow',
                params: {
                  facturaId:
                    ticketActual.latest_pre_factura.pre_factura_global_id,
                },
              }">
                {{ ticketActual.latest_pre_factura.pre_factura_global_id }}
              </router-link>
            </p>
          </template>
          <div>
            <p>Timbres Disponibles: {{ saldo?.saldo ?? 0 }}</p>
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
            <p v-if="ticketActual.esta_cancelado" class="text-error">Cancelada</p>
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
      <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
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
  <v-dialog v-model="isFacturaInfoOpen" max-width="800">
    <v-card>
      <v-card-title>Informacion de CFDI</v-card-title>
      <v-card-text>
        <p class="text-caption mb-2">
          Debido a que esta venta a sido marcada como venta a credito, usa la el
          metodo de pago PPD-Pago en parcialidades o diferido y forma de pago:
          99-Por definir, para emitir complementos de pago por cada abono.
        </p>
        <v-text-field label="Serie (opcional)" v-model="ticketActual.serie"></v-text-field>
        <v-select :items="metodoPagos" label="Método de pago" v-model="ticketActual.metodo_pago"></v-select>
        <v-select :items="pagoFormas" label="Forma de pago" v-model="ticketActual.forma_pago"></v-select>
        <v-select :items="cdfiUsos" label="Uso de CFDI" v-model="ticketActual.uso_cfdi"></v-select>
        <v-text-field label="Clave privada local" v-model="ticketActual.clave_privada_local"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isFacturaInfoOpen = false" variant="text" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="facturar" color="accent" variant="outlined" :loading="cargando">Facturar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isFormasDePagoOpen" max-width="600">
    <v-card>
      <v-card-title>Formas de pago</v-card-title>
      <v-card-text>
        <p>
          Efectivo: ${{ ticketActual.fp_efectivo }}
          {{ ticketActual.fp_efectivo_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Transferencia: ${{ ticketActual.fp_transferencia }}
          {{ ticketActual.fp_transferencia_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Tarjeta Débito: ${{ ticketActual.fp_tarjeta_debito }}
          {{ ticketActual.fp_tarjeta_debito_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Tarjeta Crédito: ${{ ticketActual.fp_tarjeta_credito }}
          {{ ticketActual.fp_tarjeta_credito_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Cheque: ${{ ticketActual.fp_cheque }}
          {{ ticketActual.fp_cheque_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Vales de despensa: ${{ ticketActual.fp_vales_de_despensa }}
          {{ ticketActual.fp_vales_de_despensa_ref }}
        </p>
        <v-divider></v-divider>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isFormasDePagoOpen = false" variant="text" :loading="cargando">Cerrar</v-btn>
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
  computed,
  nextTick,
} from "vue";

import { useRoute } from "vue-router";
import moment from "moment-timezone";
import Organizacion from "@js/apis/Organizacion";
import PuntoVenta from "../../apis/PuntoVenta";

const s = useUserStore();
const { handleOpException } = s;
import Cliente from "../../apis/Cliente";
import { useUserStore } from "../../s";
import { useDisplay } from "vuetify";
const { xs, mdAndUp, mdAndDown, smAndDown } = useDisplay();
const route = useRoute();
const keycliente = ref("");
const clients = ref([]);
const ventaId = ref(null);
const isFacturaInfoOpen = ref(false);
const isFormasDePagoOpen = ref(false);
const cargando = ref(false);
const openCliente = ref(false);
const drawer = ref(false);
const cdfiUsos = ref([
  { value: "G01", title: "G01-Adquisición de mercancías." },
  { value: "G02", title: "G02-Devoluciones, descuentos o bonificaciones." },
  { value: "G03", title: "G03-Gastos en general." },
  { value: "I01", title: "I01-Construcciones." },
  {
    value: "I02",
    title: "I02-Mobiliario y equipo de oficina por inversiones.",
  },
  { value: "I03", title: "I03-Equipo de transporte." },
  { value: "I04", title: "I04-Equipo de cómputo y accesorios." },
  {
    value: "I05",
    title: "I05-Dados, troqueles, moldes, matrices y herramental.",
  },
  { value: "I06", title: "I06-Comunicaciones telefónicas." },
  { value: "I07", title: "I07-Comunicaciones satelitales." },
  { value: "I08", title: "I08-Otra maquinaria y equipo." },
  {
    value: "D01",
    title: "D01-Honorarios médicos, dentales y gastos hospitalarios.",
  },
  { value: "D02", title: "D02-Gastos médicos por incapacidad o discapacidad." },
  { value: "D03", title: "D03-Gastos funerales." },
  { value: "D04", title: "D04-Donativos." },
  {
    value: "D05",
    title:
      "D05-Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).",
  },
  { value: "D06", title: "D06-Aportaciones voluntarias al SAR." },
  { value: "D07", title: "D07-Primas por seguros de gastos médicos." },
  { value: "D08", title: "D08-Gastos de transportación escolar obligatoria." },
  {
    value: "D09",
    title:
      "D09-Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.",
  },
  { value: "D10", title: "D10-Pagos por servicios educativos (colegiaturas)." },
  { value: "S01", title: "S01-Sin efectos fiscales." },
  { value: "CP01", title: "CP01-Pagos" },
  { value: "CN01", title: "CN01-Nómina" },
]);
const saldo = ref(null);
const pagoFormas = [
  { value: "01", title: "01-Efectivo" },
  { value: "02", title: "02-Cheque nominativo" },
  { value: "03", title: "03-Transferencia electrónica de fondos" },
  { value: "04", title: "04-Tarjeta de crédito" },
  { value: "05", title: "05-Monedero electrónico" },
  { value: "06", title: "06-Dinero electrónico" },
  { value: "08", title: "08-Vales de despensa" },
  { value: "12", title: "12-Dación en pago" },
  { value: "13", title: "13-Pago por subrogación" },
  { value: "14", title: "14-Pago por consignación" },
  { value: "15", title: "15-Condonación" },
  { value: "17", title: "17-Compensación" },
  { value: "23", title: "23-Novación" },
  { value: "24", title: "24-Confusión" },
  { value: "25", title: "25-Remisión de deuda" },
  { value: "26", title: "26-Prescripción o caducidad" },
  { value: "27", title: "27-A satisfacción del acreedor" },
  { value: "28", title: "28-Tarjeta de débito" },
  { value: "29", title: "29-Tarjeta de servicios" },
  { value: "30", title: "30-Aplicación de anticipos" },
  { value: "31", title: "31-Intermediario pagos" },
  { value: "99", title: "99-Por definir" },
];
const metodoPagos = [
  { value: "PUE", title: "PUE-Pago en una sola exhibición" },
  { value: "PPD", title: "PPD-Pago en parcialidades o diferido" },
];
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
  { title: "Precio", key: "precio_usado", align: "start", sortable: false },
  { title: "Importe", key: "precio_final", align: "start", sortable: false },
  {
    title: "Descuento",
    key: "importe_descuento",
    align: "start",
    sortable: false,
  },
  {
    title: "Impuesto",
    key: "impuesto_traslado",
    align: "start",
    sortable: false,
  },
  {
    title: "Existencia",
    key: "cantidad_actual",
    align: "start",
    sortable: false,
  },
  { title: "Cantidad devuelta", key: "cantidad_devuelta", sortable: false },
  { title: "Devolución", key: "fue_devuelto", sortable: false },
]);
const ticketActual = ref({});

const articulos = ref([]);
watch(ventaId, () => {
  getSpecificVT(ventaId.value);
});
watch(isFacturaInfoOpen, () => {
  if (ticketActual.value.forma_de_pago == "C") {
    ticketActual.value.forma_pago = "99";
    ticketActual.value.metodo_pago = "PPD";
  }
});

const devuelto = computed(() =>
  articulos.value.some((articulo) => articulo.fue_devuelto == 1)
);

function abrirCliente() {
  openCliente.value = true;

  nextTick(() => document.getElementById("keycliente").select());
  getAllClientes();
}
function descargarPdf() {
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.descargarPdf(ventaId.value)
    .then((response) => {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "factura";
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function descargarXml() {
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.descargarXml(ventaId.value)
    .then((response) => {
      const blob = new Blob([response.data], { type: "application/xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "factura";
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function getAllClientes() {
  if (cargando.value) return;
  cargando.value = true;
  Cliente.getAllClientes(keycliente.value)
    .then((response) => {
      clients.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function setCliente(cliente) {
  if (cargando.value) return;
  cargando.value = true;
  Cliente.setCliente(cliente, ticketActual.value.id)
    .then(() => {
      getSpecificVT(ventaId.value);
      openCliente.value = false;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function onEscape(e) {
  if (e.key === "F4") {
    //ir a ventas
  }
}
async function getSpecificVT(ventaticket) {
  try {
    const { data } = await PuntoVenta.getSpecificVT(ventaticket);
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
function verFormasDePago() {
  isFormasDePagoOpen.value = true;
}
function imprimirVenta() {
  if (window.__TAURI__) {
    const webview = new WebviewWindow("ImprimirVentas", {
      url: `ventatickets/imprimir/${ventaId.id}`,
      title: "Imprimir Venta",
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/ventatickets/imprimir/${ventaId.value}`,
    "_blank",
    "noreferrer"
  );
}
function cancelarVenta() {
  if (!confirm('Estas seguro de cancelar esta venta?')) {
    return;
  }
  PuntoVenta.cancelarVenta(ticketActual.value.id)
    .then(() => {
      getSpecificVT(ticketActual.value.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function facturar() {
  if (cargando.value) return;
  cargando.value = true;
  if (!saldo.value?.saldo) {
    alert(
      "No tienes suficientes timbres fiscales, contacta con la administración para solicitar timbres fiscales"
    );
    isFacturaInfoOpen.value = false;
    cargando.value = false;
    return;
  }
  PuntoVenta.facturar(ticketActual.value.id, {
    forma_pago: ticketActual.value.forma_pago,
    metodo_pago: ticketActual.value.metodo_pago,
    uso_cfdi: ticketActual.value.uso_cfdi,
    serie: ticketActual.value.serie,
    clave_privada_local: ticketActual.value.clave_privada_local,
  })
    .then((response) => {
      getSpecificVT(ventaId.value);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      isFacturaInfoOpen.value = false;
      cargando.value = false;
    });
}
onMounted(() => {
  ventaId.value = route.params.ventaId;
  document.addEventListener("keydown", onEscape);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});
</script>

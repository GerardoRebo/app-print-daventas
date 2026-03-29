<template>
  <br />
  <br />
  .
  <br />
  <v-img :src="`${ventaticket?.organization?.image?.url}?v=${ventaticket?.organization?.image?.updated_at}`"
    class="my-2 mx-auto" height="150px" width="150px" v-if="ventaticket?.organization?.image?.url"
    @load="onImageLoaded" />
  <p class="mb-1" v-if="ventaticket?.organization?.facturacion_info?.razon_social && ventaticket?.organization?.show_fiscal_info">
    <strong>Razón Soc:</strong>
    {{ ventaticket?.organization?.facturacion_info?.razon_social }}
  </p>
  <p class="mb-1" v-if="(ventaticket?.almacen?.rfc || ventaticket?.organization?.facturacion_info?.rfc) && ventaticket?.organization?.show_fiscal_info">
    <strong>RFC:</strong> {{ ventaticket?.almacen?.rfc || ventaticket?.organization?.facturacion_info?.rfc }}
  </p>
  <p class="mb-1">
    <strong>Sucursal:</strong> {{ ventaticket?.almacen?.name }}
  </p>
  <p class="mb-1" v-if="ventaticket?.almacen?.direccion">
    <strong>Dirección: </strong>{{ ventaticket?.almacen?.direccion }}
  </p>
  <p v-if="ventaticket?.almacen?.telefono">
    <strong>Teléfono:</strong> {{ ventaticket?.almacen?.telefono }}
  </p>
  <p v-if="ventaticket?.organization?.email || ventaticket?.almacen?.email">
    <strong>Email:</strong> {{ ventaticket?.almacen?.email || ventaticket?.organization?.email }}
  </p>
  <p><strong>Ticket:</strong>#{{ ventaticket?.consecutivo }}</p>
  <p class="mb-1"><strong>Cajero:</strong> <span class="font-italic">{{ ventaticket?.user?.name }}</span></p>
  <p class="mb-1" v-if="ventaticket?.cliente"><strong>Cliente:</strong> {{ ventaticket?.cliente?.name }}</p>
  <p v-if="ventaticket?.pagado_en">
    <strong>Fecha: </strong>{{ moment(ventaticket?.pagado_en).format("DD-MM-YYYY h:mm:ssa") }}
  </p>
  <p class="mb-1" v-else>Fecha: {{ moment().format("DD-MM-YYYY h:mm:ssa") }}</p>

  <p v-if="ventaticket?.esta_cancelado" class="mb-1 text-red">
    <strong>Ticket Cancelado</strong>
  </p>
  <hr style="border: 1px dashed black; opacity: 0.33" class="my-2" />

  <span v-for="(item, index) in ventaticket?.ventaticket_articulos" :key="index">
    {{ item?.product?.name ?? item.product_name }}
    <br />
    <span class="text-caption">
      {{ item?.cantidad }}
      <span v-if="+item?.ancho || +item?.alto">({{ item?.ancho }}x{{ item?.alto }})</span>
      x ${{ formatNumber(desglosarImpuesto ? item?.precio_usado : item?.precio) }} =
      <strong>${{ formatNumber(calcularPrecioFinal(item)) }}</strong>
    </span>
    <br />
    <span v-if="item.fue_devuelto" class="text-caption text-red">
      Devolución -{{ item?.cantidad_devuelta }}
      <br />
    </span>
    <span v-if="+item.descuento" class="text-caption text-red">
      Descuento {{ item?.cantidad }} x ${{ formatNumber(item.descuento) }} =
      <strong>${{ formatNumber(item.importe_descuento) }}</strong>
      <br />
    </span>
    <v-divider class="my-1" length="80" v-if="!(index == ventaticket?.ventaticket_articulos.length - 1)"></v-divider>
  </span>
  <hr style="border: 1px dashed black; opacity: 0.33" class="my-2" />

  <template v-if="desglosarImpuesto">
    <p class="mb-1"><strong>Subtotal: </strong>${{ formatNumber(ventaticket?.subtotal) }}</p>
    <p v-if="ventaticket?.descuento != '0.00'" class="mb-1">
      <strong>Descuento:</strong> ${{ formatNumber(ventaticket?.descuento) }}
    </p>
    <p v-if="ventaticket?.total_devuelto != '0.00'" class="mb-1">
      <strong>Devolucion:</strong> ${{ formatNumber(ventaticket?.total_devuelto) }}
    </p>
    <p v-if="+ventaticket?.impuesto_traslado" class="mb-1">
      <strong>Impuesto Trasladado:</strong> ${{ formatNumber(ventaticket.impuesto_traslado) }}
    </p>
  </template>

  <template v-else>
    <p class="mb-1"><strong>Subtotal: </strong>${{ formatNumber(Number(ventaticket?.subtotal) + Number(ventaticket?.impuesto_traslado || 0)) }}</p>
    <p v-if="ventaticket?.descuento != '0.00'" class="mb-1">
      <strong>Descuento:</strong> ${{ formatNumber(ventaticket?.descuento) }}
    </p>
    <p v-if="ventaticket?.total_devuelto != '0.00'" class="mb-1">
      <strong>Devolucion:</strong> ${{ formatNumber(ventaticket?.total_devuelto) }}
    </p>
  </template>

  <p class="mb-1">
    <strong>Total: ${{ formatNumber(ventaticket?.total) }}</strong>
  </p>
  <div v-if="!ventaticket?.deuda">
    <p v-if="cambio"><strong>Pagó con:</strong> ${{ formatNumber(ventaticket?.pago_con) }}</p>
    <p class="mb-1" v-if="cambio">
      <strong>Su cambio:</strong> ${{ formatNumber(cambio) }}
    </p>
  </div>

  <div v-if="ventaticket?.deuda">
    <p class="mb-1" v-if="ventaticket?.deuda?.abonos?.length > 0">
      <strong>Abonos venta a crédito:</strong>
    </p>
    <div v-for="abono in ventaticket?.deuda?.abonos">
      {{ moment(abono.fecha).format("DD-MM-YYYY h:mm:ssa") }} - ${{ formatNumber(abono.abono) }}
    </div>
    <p class="mb-1" v-if="ventaticket?.deuda && !ventaticket?.deuda?.liquidado">
      <strong>Saldo:</strong> ${{ formatNumber(ventaticket?.deuda?.saldo) }}
    </p>
    <p class="mb-1" v-if="ventaticket?.deuda?.liquidado">
      <strong>Liquidado</strong>
    </p>
  </div>

  <div>
    <canvas ref="qrCanvas"></canvas>
  </div>

  <p class="text-caption font-italic">Gracias por tu compra</p>
  <div class="text-center" style="margin-top: 8px; opacity: 0.5;">
    <v-icon size="x-small" style="vertical-align: middle;">mdi-web</v-icon>
    <span class="text-overline font-italic" style="letter-spacing: 0.5px; margin-left: 4px;">daventas.com</span>
  </div>

  <br />
  <br />
  <br />
  <br />

  .
</template>
<script setup>
import { nextTick, onMounted, ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import PuntoVenta from "../apis/PuntoVenta";
import moment from "moment-timezone";
import { appWindow } from "@tauri-apps/api/window";
import { useUserStore } from "../s";
import QRCode from 'qrcode';
import { useCurrency } from "@js/composables/useCurrency";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";
const { formatNumber } = useCurrency('es-MX', 'MXN');
const ventaticketId = ref(null);
const ventaticket = ref(null);
const desglosarImpuesto = ref(false);
const qrCanvas = ref(null);
const s = useUserStore();
const { handleOpException } = s;
const { processRequest } = useProcessRequest();
const { notify } = useNotification();

const requestLoading = ref(false);

const calcularImpuesto = (item) => {
  return (item.impuesto_traslado || 0) - (item.impuesto_retenido || 0);
};

const calcularPrecioFinal = (item) => {
  return desglosarImpuesto.value ? item.precio_final : (+item.precio_final + calcularImpuesto(item));
};

const cambio = computed(() => {
  if (!ventaticket.value) return 0;
  return Math.abs((ventaticket.value.pago_con || 0) - (ventaticket.value.total || 0));
});

watch(ventaticketId, () => {
  getSpecificVT(ventaticketId.value);
});

const generateQRCode = async (qrString) => {
  try {
    await QRCode.toCanvas(qrCanvas.value, qrString, {
      width: 200,
      margin: 4,
      errorCorrectionLevel: 'H' // opción recomendada
    });
} catch (error) {
  console.error('Could not generate QR code:', error);
}
}

function getSpecificVT(vt) {
  processRequest(async () => {
    const response = await PuntoVenta.getSpecificVTForPrinting(vt);
    ventaticket.value = response.data;
    const qrString = ventaticket.value?.public_url;
    if (qrString) {
      generateQRCode(qrString);
    }
    if (!ventaticket.value?.organization?.image?.url) {
      nextTick(() => {
        window.print();
      });
    }
  }, requestLoading, {
    onError: (error) => {
      handleOpException(error);
      notify.error("Ha ocurrido un error");
    },
  });
}
const route = useRoute();
onMounted(() => {
  ventaticketId.value = route.params.id;
  desglosarImpuesto.value = route.query.desglosar === 'true' || route.query.desglosar === true;
  // addEventListener("afterprint", (event) => {
  //   window.close();
  //   if (window.__TAURI__) {
  //     appWindow.close();
  //     return;
  //   }
  // });
});
// Image load event handler
function onImageLoaded() {
  setTimeout(() => {
    nextTick(() => {
      console.log("ther");
      window.print();
    });
  }, 200);
}
</script>
<style>
.v-data-table .v-data-table__wrapper {
  overflow-x: hidden;
}
</style>

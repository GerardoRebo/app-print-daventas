<template>
  <br />
  <br />
  .
  <br />
  <v-img :src="`${ventaticket?.organization?.image?.url}?v=${ventaticket?.organization?.image?.updated_at}`"
    class="my-2 mx-auto" height="150px" width="150px" v-if="ventaticket?.organization?.image?.url"
    @load="onImageLoaded" />
  <p class="mb-1" v-if="ventaticket?.organization?.facturacion_info?.razon_social">
    <strong>Razón Soc:</strong>
    {{ ventaticket?.organization?.facturacion_info?.razon_social }}
  </p>
  <p class="mb-1">
    <strong>Sucursal:</strong> {{ ventaticket?.almacen?.name }}
  </p>
  <p class="mb-1" v-if="ventaticket?.almacen?.direccion">
    <strong>Dirección: </strong>{{ ventaticket?.almacen?.direccion }}
  </p>
  <p class="mb-1" v-if="ventaticket?.almacen?.rfc">
    <strong>RFC:</strong> {{ ventaticket?.almacen?.rfc }}
  </p>
  <p v-if="ventaticket?.almacen?.telefono">
    <strong>Teléfono:</strong> {{ ventaticket?.almacen?.telefono }}
  </p>
  <p><strong>Ticket:</strong>#{{ ventaticket?.consecutivo }}</p>
  <p class="mb-1"><strong>Cajero:</strong> {{ ventaticket?.user?.name }}</p>
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
    {{
      item?.cantidad +
      " (" +
      item?.ancho +
      "x" +
      item?.alto +
      ") " +
      " = " +
      "$" +
      item?.precio_final
    }}
    <br />
    <span v-if="item.fue_devuelto">
      Devolución -{{ item?.cantidad_devuelta }}
      <br />
    </span>
    <v-divider class="my-1" length="40" v-if="!(index == ventaticket?.ventaticket_articulos.length - 1)"></v-divider>
  </span>
  <hr style="border: 1px dashed black; opacity: 0.33" class="my-2" />
  <p class="mb-1"><strong>Subtotal: </strong>${{ ventaticket?.subtotal }}</p>
  <p v-if="ventaticket?.descuento != '0.00'" class="mb-1">
    <strong>Descuento:</strong> ${{ ventaticket?.descuento }}
  </p>
  <p v-if="ventaticket?.total_devuelto != '0.00'" class="mb-1">
    <strong>Devolucion:</strong> ${{ ventaticket?.total_devuelto }}
  </p>
  <p v-if="ventaticket?.impuesto_traslado" class="mb-1">
    <strong>Impuesto Trasladado:</strong> ${{ ventaticket.impuesto_traslado }}
  </p>
  <p class="mb-1">
    <strong>Total: ${{ ventaticket?.total }}</strong>
  </p>
  <div v-if="!ventaticket?.deuda">
    <p><strong>Pagó con:</strong> ${{ ventaticket?.pago_con }}</p>
    <p class="mb-1">
      <strong>Su cambio:</strong> ${{
        ventaticket?.total - ventaticket?.pago_con
      }}
    </p>
  </div>

  <div v-if="ventaticket?.deuda">
    <p class="mb-1">
      <strong>Abonos venta a crédito:</strong>
    </p>
    <div v-for="abono in ventaticket?.deuda?.abonos">
      {{ moment(abono.fecha).format("DD-MM-YYYY h:mm:ssa") }} - ${{ abono.abono.toLocaleString() }} 
    </div>
    <p class="mb-1" v-if="!ventaticket?.deuda?.liquidado">
      <strong>Saldo:</strong> ${{ ventaticket?.deuda?.saldo }}
    </p>
    <p class="mb-1" v-if="ventaticket?.deuda?.liquidado">
      <strong>Liquidado</strong>
    </p>
  </div>

  <p class="text-caption font-italic">Gracias por tu compra</p>

  <br />
  <br />
  <br />
  <br />

  .
</template>
<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import PuntoVenta from "../apis/PuntoVenta";
import moment from "moment-timezone";
import { appWindow } from "@tauri-apps/api/window";
import { useUserStore } from "../s";
const ventaticketId = ref(null);
const ventaticket = ref(null);
const s = useUserStore();
const { handleOpException } = s;

watch(ventaticketId, () => {
  getSpecificVT(ventaticketId.value);
});

function getSpecificVT(vt) {
  PuntoVenta.getSpecificVTForPrinting(vt)
    .then((response) => {
      ventaticket.value = response.data;
      console.log(ventaticket.value);
      if (!ventaticket.value?.organization?.image?.url) {
        nextTick(() => {
          window.print();
        });
      }
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
const route = useRoute();
onMounted(() => {
  ventaticketId.value = route.params.id;
  addEventListener("afterprint", (event) => {
    window.close();
    if (window.__TAURI__) {
      appWindow.close();
      return;
    }
  });
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

<template>
  <div class="pa-4">
    <!-- Encabezado -->
    <div class="text-center mb-4">
      <v-img
        :src="`${ventaticket?.organization?.image?.url}?v=${ventaticket?.organization?.image?.updated_at}`"
        v-if="ventaticket?.organization?.image?.url"
        class="mb-2"
        height="100px"
        width="100px"
        @load="onImageLoaded"
        contain
      />
      <span class="text-h5 font-weight-bold">
        {{ ventaticket?.organization?.name ?? "Nombre de la Empresa" }}
      </span>
      <br />
      <span class="text-caption">
        {{ ventaticket?.almacen?.direccion ?? "Dirección de la sucursal" }}
      </span>
      <br />
      <span class="text-caption" v-if="ventaticket?.almacen?.telefono">
        Teléfono: {{ ventaticket?.almacen?.telefono }}
      </span>
      <br />
      <span class="text-caption" v-if="ventaticket?.almacen?.rfc">
        RFC: {{ ventaticket?.almacen?.rfc }}
      </span>
    </div>

    <!-- Información del ticket -->
    <div class="mb-4">
      <span class="text-body-1">
        <strong>Cajero:</strong> {{ ventaticket?.user?.name }}
      </span>
      <br />
      <span class="text-body-1">
        <strong>Sucursal:</strong> {{ ventaticket?.almacen?.name }}
      </span>
      <br />
      <span class="text-body-1">
        <strong>Ticket #:</strong> {{ ventaticket?.consecutivo }}
      </span>
      <br />
      <span class="text-body-1">
        <strong>Fecha:</strong>
        {{
          ventaticket?.pagado_en
            ? moment(ventaticket?.pagado_en).format("DD-MM-YYYY h:mm:ssa")
            : moment().format("DD-MM-YYYY h:mm:ssa")
        }}
      </span>
      <br />
      <span class="text-caption text-danger" v-if="ventaticket?.esta_cancelado">
        <strong>¡Ticket Cancelado!</strong>
      </span>
    </div>

    <!-- Detalle de productos -->
    <div>
      <div
        v-for="(item, index) in ventaticket?.ventaticket_articulos"
        :key="index"
        class="mb-2"
      >
        <span class="text-body-1 font-weight-bold">
          {{ item?.product?.name ?? item.product_name }}
        </span>
        <br />
        <span class="text-body-2">
          {{ item?.cantidad }} x ${{ item?.precio_usado }} = ${{
            item?.precio_final
          }}
        </span>
        <br />
        <span class="text-caption text-warning" v-if="item.fue_devuelto">
          Devolución: -{{ item?.cantidad_devuelta }}
        </span>
      </div>
    </div>

    <!-- Resumen de totales -->
    <div class="my-4">
      <div class="d-flex justify-space-between">
        <span>Subtotal:</span>
        <span>${{ ventaticket?.subtotal }}</span>
      </div>
      <div
        class="d-flex justify-space-between"
        v-if="ventaticket?.descuento != '0.00'"
      >
        <span>Descuento:</span>
        <span>${{ ventaticket?.descuento }}</span>
      </div>
      <div
        class="d-flex justify-space-between"
        v-if="ventaticket?.total_devuelto != '0.00'"
      >
        <span>Devolución:</span>
        <span>${{ ventaticket?.total_devuelto }}</span>
      </div>
      <div class="d-flex justify-space-between font-weight-bold text-h6">
        <span>Total:</span>
        <span>${{ ventaticket?.total }}</span>
      </div>
    </div>

    <!-- Pago -->
    <div class="mb-4">
      <div class="d-flex justify-space-between">
        <span>Pagó con:</span>
        <span>${{ ventaticket?.pago_con }}</span>
      </div>
      <div class="d-flex justify-space-between">
        <span>Cambio:</span>
        <span>${{ ventaticket?.pago_con - ventaticket?.total }}</span>
      </div>
    </div>

    <!-- Mensaje de despedida -->
    <div class="text-center mt-4">
      <span class="text-body-1">¡Gracias por tu compra!</span>
    </div>
  </div>
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

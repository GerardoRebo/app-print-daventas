<template>
  <v-container class="py-6" style="max-width: 420px;">
    <v-card elevation="3" rounded="xl">

      <!-- LOGO Y ENCABEZADO -->
      <v-card-text class="text-center pb-1">
        <v-img v-if="ventaticket?.organization?.image?.url"
          :src="`${ventaticket.organization.image.url}?v=${ventaticket.organization.image.updated_at}`" height="130"
          width="130" class="mx-auto mb-2" />

        <h2 class="text-h6 font-weight-bold" v-if="ventaticket?.organization?.show_fiscal_info && ventaticket?.organization?.facturacion_info?.razon_social">
          {{ ventaticket.organization.facturacion_info.razon_social }}
        </h2>

        <h2 class="text-h6 font-weight-bold">
          {{ ventaticket?.almacen?.name }}
        </h2>

        <p class="text-body-2 mb-2" v-if="(ventaticket?.almacen?.rfc || ventaticket?.organization?.facturacion_info?.rfc) && ventaticket?.organization?.show_fiscal_info">
          <strong>RFC:</strong> {{ ventaticket?.almacen?.rfc || ventaticket?.organization?.facturacion_info?.rfc }}
        </p>

        <p class="text-body-2">
          <span v-if="ventaticket?.almacen?.direccion">{{ ventaticket.almacen.direccion }}</span><br>
          <span v-if="ventaticket?.almacen?.telefono">Tel: {{ ventaticket.almacen.telefono }}</span>
        </p>

        <!-- QR DEL TICKET -->
        <v-img v-if="publicUrl" :src="qrSrc" height="130" width="130" class="mx-auto mt-4" />

        <v-divider class="my-4"></v-divider>
      </v-card-text>

      <!-- DETALLES DEL TICKET -->
      <v-card-text>
        <v-row class="text-body-2">
          <v-col cols="6"><strong>Ticket:</strong> #{{ ventaticket?.consecutivo }}</v-col>
          <v-col cols="6" class="text-right"><strong>Cajero:</strong> {{ ventaticket?.user?.name }}</v-col>

          <v-col cols="12">
            <strong>Fecha:</strong> {{ formattedDate }}
          </v-col>

          <v-col cols="12" v-if="ventaticket?.cliente">
            <strong>Cliente:</strong> {{ ventaticket.cliente.name }}
          </v-col>

          <v-col cols="12" v-if="ventaticket?.esta_cancelado" class="text-red text-center mt-1">
            <strong>*** TICKET CANCELADO ***</strong>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- LISTA DE PRODUCTOS -->
        <div v-for="(item, i) in ventaticket?.ventaticket_articulos" :key="i" class="mb-3">
          <div class="text-body-2 font-weight-medium">
            {{ item?.product?.name ?? item.product_name }}
          </div>
          <div class="text-caption">
            {{ item.cantidad }} ({{ item.ancho }}x{{ item.alto }}) — ${{ item.precio_final }}
          </div>

          <div v-if="item.fue_devuelto" class="text-red text-caption">
            Devolución - {{ item.cantidad_devuelta }}
          </div>

          <v-divider v-if="i < ventaticket.ventaticket_articulos.length - 1" class="my-3"></v-divider>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- TOTALES -->
        <div class="text-body-1">
          <div><strong>Subtotal:</strong> ${{ ventaticket?.subtotal }}</div>

          <div v-if="ventaticket?.descuento != '0.00'">
            <strong>Descuento:</strong> ${{ ventaticket?.descuento }}
          </div>

          <div v-if="ventaticket?.total_devuelto != '0.00'">
            <strong>Devuelto:</strong> ${{ ventaticket?.total_devuelto }}
          </div>

          <div v-if="+ventaticket?.impuesto_traslado">
            <strong>Impuesto:</strong> ${{ ventaticket?.impuesto_traslado }}
          </div>

          <div class="mt-2 text-h6 font-weight-bold">
            Total: ${{ ventaticket?.total }}
          </div>
        </div>

        <!-- PAGOS -->
        <v-divider class="my-4"></v-divider>

        <div v-if="!ventaticket?.deuda">
          <p><strong>Pagó con:</strong> ${{ ventaticket?.pago_con }}</p>
          <p><strong>Cambio:</strong> ${{ ventaticket?.pago_con - ventaticket?.total }}</p>
        </div>

        <!-- ABONOS -->
        <div v-else>
          <strong>Venta a crédito:</strong>
          <div class="text-caption" v-for="a in ventaticket.deuda.abonos" :key="a.id">
            {{ moment(a.fecha).format("DD-MM-YYYY h:mm:ssa") }} — ${{ a.abono }}
          </div>

          <div v-if="!ventaticket?.deuda?.liquidado">
            <strong>Saldo:</strong> ${{ ventaticket?.deuda?.saldo }}
          </div>
          <div v-else class="text-success"><strong>Liquidado</strong></div>
        </div>

        <p class="text-center mt-6 font-italic text-body-2">
          Gracias por tu compra 🙌
        </p>
      </v-card-text>

      <!-- PUBLICIDAD -->
      <v-divider></v-divider>
      <v-card-text class="text-center mt-3">
        <p class="text-body-2 font-weight-medium mb-1">¿Tienes un negocio?</p>
        <p class="text-caption mb-3">Usa DaVentas POS para vender fácil, rápido y desde cualquier dispositivo.</p>

        <v-btn color="primary" rounded size="small" href="https://daventas.com" target="_blank">
          Conocer DaVentas
        </v-btn>
      </v-card-text>
      <!-- PUBLICIDAD EXTRA (VARIABLE) -->
      <template v-if="ventaticket?.publicidad_extra">
        <v-divider></v-divider>
        <v-card-text class="text-center py-4">

          <h3 class="text-body-1 font-weight-bold mb-1">
            {{ ventaticket.publicidad_extra.titulo }}
          </h3>

          <p class="text-caption mb-2">
            {{ ventaticket.publicidad_extra.descripcion }}
          </p>

          <v-img v-if="ventaticket.publicidad_extra.imagen" :src="ventaticket.publicidad_extra.imagen" height="120"
            class="mx-auto mb-3 rounded-lg" cover />

          <v-btn v-if="ventaticket.publicidad_extra.url" color="primary" rounded size="small"
            :href="ventaticket.publicidad_extra.url" target="_blank">
            Ver más
          </v-btn>

        </v-card-text>
      </template>
    </v-card>

    <!-- BOTÓN DE IMPRIMIR -->
    <!-- <v-btn block class="mt-4" color="secondary" @click="window.print()">
      Imprimir Ticket
    </v-btn> -->
  </v-container>
</template>

<script setup>
import { nextTick, ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import PuntoVenta from "../apis/PuntoVenta";
import moment from "moment-timezone";

const ventaticket = ref(null);
const token = ref(null);
const qrSrc = ref(null);

const route = useRoute();
const publicUrl = ref(null);

watch(token, () => {
  getTicket(token.value);
});

function getTicket(token) {
  PuntoVenta.getVentaticketByToken(token)
    .then((res) => {
      ventaticket.value = res.data.ventaticket;
      publicUrl.value = res.data.public_url;

      generateQR(publicUrl.value);
    })
    .catch(() => alert("No se pudo cargar el ticket"));
}

// Generar QR usando quickchart.io o similar
function generateQR(url) {
  qrSrc.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    url
  )}`;
}

const formattedDate = computed(() =>
  ventaticket.value?.pagado_en
    ? moment(ventaticket.value.pagado_en).format("DD-MM-YYYY h:mm:ss a")
    : moment().format("DD-MM-YYYY h:mm:ss a")
);
onMounted(() => {
  token.value = route.params.token;
});
</script>

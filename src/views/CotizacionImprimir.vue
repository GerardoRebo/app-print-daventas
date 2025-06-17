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
    <p v-if="ventaticket?.pagado_en">
        <strong>Fecha: </strong>{{ moment(ventaticket?.pagado_en).format("DD-MM-YYYY h:mm:ssa") }}
    </p>
    <p class="mb-1" v-else>Fecha: {{ moment().format("DD-MM-YYYY h:mm:ssa") }}</p>

    <p v-if="ventaticket?.esta_cancelado" class="mb-1 text-red">
        <strong>Ticket Cancelado</strong>
    </p>
    <hr style="border: 1px dashed black; opacity: 0.33" class="my-2" />
    <!-- <v-table density="compact" overflow-hidden>
    <thead>
      <tr>
        <th class="text-left">Nombre</th>
        <th class="text-left">Cant</th>
        <th class="text-left">Precio</th>
        <th class="text-left">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, index) in ventaticket?.ventaticket_articulos"
        :key="index"
      >
        <td>
          {{ item?.product?.name ?? item.product_name }}
        </td>
        <td>
          {{ item?.cantidad }}
          <span v-if="item.fue_devuelto">
            <br />
            Devolución -{{ item?.cantidad_devuelta }}
          </span>
        </td>
        <td>
          {{ item?.precio_usado }}
        </td>
        <td>
          {{ item?.precio_final }}
        </td>
      </tr>
    </tbody>
  </v-table> -->
    <span v-for="(item, index) in ventaticket?.articulos" :key="index">
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
            item?.importe
        }}
        <br />
        <span v-if="item.fue_devuelto">
            Devolución -{{ item?.cantidad_devuelta }}
            <br />
        </span>
        <v-divider class="my-1" length="40" v-if="!(index == ventaticket?.articulos.length - 1)"></v-divider>
    </span>
    <hr style="border: 1px dashed black; opacity: 0.33" class="my-2" />
    <p class="mb-1"><strong>Subtotal: </strong>${{ subtotalComputed }}</p>
    <p v-if="descuentoComputed != '0.00'" class="mb-1">
        <strong>Descuento:</strong> ${{ descuentoComputed }}
    </p>
    <p v-if="impuestoRetenidoComputed != '0.00'" class="mb-1">
        <strong>Impuesto Retenido:</strong> ${{ impuestoRetenidoComputed }}
    </p>
    <p v-if="impuestoTrasladadoComputed != '0.00'" class="mb-1">
        <strong>Impuesto Trasladado:</strong> ${{ impuestoTrasladadoComputed }}
    </p>
    <p class="mb-1">
        <strong>Total: ${{ totalComputed }}</strong>
    </p>

    <p class="text-caption font-italic">Esto es una cotizacion</p>

    <br />
    <br />
    <br />
    <br />

    .
</template>
<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import PuntoVenta from '../apis/PuntoVenta';
import moment from 'moment-timezone';
import { appWindow } from '@tauri-apps/api/window';
import { useUserStore } from '../s';
import Cotizacion from '../apis/Cotizacion';
const ventaticketId = ref(null);
const ventaticket = ref(null);
const s = useUserStore();
const { handleOpException } = s;

watch(ventaticketId, () => {
    getSpecificVT(ventaticketId.value);
});

function getSpecificVT(vt) {
    Cotizacion.getSpecificVTForPrinting(vt)
        .then((response) => {
            ventaticket.value = response.data;
            nextTick(() => {
                window.print()
            })
        })
        .catch((error) => {
            handleOpException(error);
            alert("Ha ocurrido un error")
        });
}
const totalComputed = computed(() => {
    const suma = +subtotalComputed.value + +impuestoTrasladadoComputed.value - +impuestoRetenidoComputed.value - +descuentoComputed.value;
    return roundToNearestFiveCents(suma).toFixed(2)
});
const roundToNearestFiveCents = (number) => {
    return parseFloat((Math.round(number / 0.05) * 0.05).toFixed(2));
}
const impuestoRetenidoComputed = computed(() => {
    if (!ventaticket.value?.articulos) {
        return null;
    }
    const suma = ventaticket.value?.articulos?.reduce(
        (partial_sum, a) => partial_sum + +a.impuesto_retenido,
        0
    );
    return suma.toFixed(2)
});
const impuestoTrasladadoComputed = computed(() => {
    if (!ventaticket.value?.articulos) {
        return null;
    }
    const suma = ventaticket.value?.articulos?.reduce(
        (partial_sum, a) => partial_sum + +a.impuesto_traslado,
        0
    );
    return suma.toFixed(2)
});
const descuentoComputed = computed(() => {
    if (!ventaticket.value?.articulos) {
        return null;
    }
    const suma = ventaticket.value?.articulos?.reduce(
        (partial_sum, a) => partial_sum + +a.importe_descuento,
        0
    );
    return suma.toFixed(2)
});
const subtotalComputed = computed(() => {
    if (!ventaticket.value?.articulos) {
        return null;
    }

    const suma = ventaticket.value?.articulos?.reduce(
        (partial_sum, a) => partial_sum + +a.importe,
        0
    );
    return suma.toFixed(2)
});
const route = useRoute();
onMounted(() => {

    ventaticketId.value = route.params.id;
    // addEventListener("afterprint", (event) => {
    //     window.close()
    //     if(window.__TAURI__){
    //     appWindow.close();
    //     return;
    //   }
    // });
});
</script>
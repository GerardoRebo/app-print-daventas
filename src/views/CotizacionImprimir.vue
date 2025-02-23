<template>
    <br>
    <br>
    .
    <br>

    <span>
        Cajero: {{ ventaticket?.user?.name }}
    </span>
    <br>
    <span>
        Sucursal: {{ ventaticket?.almacen?.name }}
        <br>
    </span>
    <span v-if="ventaticket?.almacen?.direccion">
        Dirección: {{ ventaticket?.almacen?.direccion }}
        <br>
    </span>
    <span v-if="ventaticket?.almacen?.rfc">
        RFC: {{ ventaticket?.almacen?.rfc }}
        <br>
    </span>
    <span v-if="ventaticket?.almacen?.telefono">
        Teléfono: {{ ventaticket?.almacen?.telefono }}
        <br>
    </span>
    Ticket #: {{ ventaticket?.consecutivo }}

    <br>
    <span v-if="ventaticket?.pagado_en">
        Fecha: {{ moment(ventaticket?.pagado_en).format('DD-MM-YYYY h:mm:ssa') }}
    </span>
    <span v-else>
        Fecha: {{ moment().format('DD-MM-YYYY h:mm:ssa') }}
    </span>

    <br>
    <span v-if="ventaticket?.esta_cancelado">
        Ticket Cancelado
    </span>
    <br>
    ===================
    <br>

    <span v-for="(item, index) in ventaticket?.articulos" :key="index">
        - {{ item?.product?.name ?? item.product_name}}
        <br>
        {{ item?.cantidad + ' x $' + item?.precio + ' = ' + '$' + item?.importe }}
        <br>
        <span v-if="item.fue_devuelto">
            <br>
            Devolución -{{ item?.cantidad_devuelta }}
        </span>
    </span>
    <br>
    <br>
    ===================
    <br>
    Subtotal: ${{ ventaticket?.subtotal}}
    Descuento: ${{ ventaticket?.descuento}}
    <p style="font-weight: bold ">
        Total: ${{ ventaticket?.total}}
    </p>

    <br>
    <br>
    <br>
    <br>

    .
</template>
<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import PuntoVenta from '../apis/PuntoVenta';
import moment from 'moment-timezone';
import { appWindow } from '@tauri-apps/api/window';
import { useUserStore } from '../s';
import Cotizacion from '../apis/Cotizacion';
const ventaticketId = ref(null);
const ventaticket = ref(null);
const s = useUserStore();
const { handleOpException} = s;

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
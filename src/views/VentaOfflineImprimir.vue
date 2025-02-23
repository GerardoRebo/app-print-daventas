<template>
    <br>
    <br>
    .
    <br>
    Cajero: {{ user?.name }}
    <br>
    Sucursal: {{ ventaticket?.almacen?.name }}
    <br>
    Dirección: {{ ventaticket?.almacen?.direccion }}
    <br>
    RFC: {{ ventaticket?.almacen?.rfc }}
    <br>
    Teléfono: {{ ventaticket?.almacen?.telefono }}
    <br>
    Ticket ##: {{ ventaticket?.id }} Local

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

    <span v-for="(item, index) in articulos" :key="index">
        - {{ item?.name }}
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
    <p style="font-weight: bold ">
        Total: ${{ ventaticket?.total }}
    </p>

    <!-- Pagó con: ${{ ventaticket?.pago_con }} -->
    <br>
    <!-- Su cambio: ${{ ventaticket?.total - ventaticket?.pago_con }} -->
    <br>

    Gracias por tu compra

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
import Offline from '../sqlite/Offline'
const ventaticketId = ref(null);
const ventaticket = ref(null);
const articulos = ref([]);
const user = ref(null);

watch(ventaticketId, () => {
    getSpecificVT(ventaticketId.value);
});

async function getSpecificVT(vt) {
    try {
        const data = await Offline.getSpecificVT(vt);
        ventaticket.value = data;
        console.log(vt);
        articulos.value = await Offline.getArticulos(vt);
        console.log(articulos.value);
        nextTick(() => {
            window.print()
        })

    } catch (error) {
        console.log(error);
        alert("Ha ocurrido un error")
    } finally {
    }
}
const route = useRoute();
onMounted(() => {
    ventaticketId.value = route.params.id;
    addEventListener("afterprint", (event) => {
        window.close()
        // if (window.__TAURI__) {
        //     appWindow.close();
        //     return;
        // }
    });
});
</script>
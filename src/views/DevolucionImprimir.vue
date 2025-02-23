<template>
    <br>
    <br>
    .
    <br>

    Cajero: {{ ticket?.user?.name }}
    <br>
    Sucursal: {{ ticket?.almacen?.name }}
    <br>
    Dirección: {{ ticket?.almacen?.direccion }}
    <br>
    RFC: {{ ticket?.almacen?.rfc }}
    <br>
    Teléfono: {{ ticket?.almacen?.telefono }}
    <br>
    <span v-if="ticket?.devuelto_en">
        Fecha: {{moment(ticket?.devuelto_en).format('DD-MM-YYYY h:mm:ssa')}}
    </span>
    <span v-else>
        Fecha: {{moment().format('DD-MM-YYYY h:mm:ssa')}}
    </span>
    <p style="font-weight:bold">Devolución!!!</p>

    ===================
    <br>

    <span v-for="(item, index) in ticket?.devoluciones_articulos" :key="index">
        - {{ item?.product?.name }}
        <br>
        {{ item?.cantidad_devuelta + ' -- $' + item?.dinero_devuelto }}
        <br>
    </span>
    <br>
    <br>
    ===================
    <br>
    <p style="font-weight: bold ">
        Total: ${{ ticket?.total_devuelto }}
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
import Devoluciones from '../apis/Devoluciones';
import moment from 'moment-timezone';
import { appWindow } from '@tauri-apps/api/window';
import { useUserStore } from '../s';
const s = useUserStore();
const { handleOpException} = s;
const ventaticketId = ref(null);
const ticket = ref(null);

watch(ventaticketId, () => {
    getSpecificTicket(ventaticketId.value);
});

function getSpecificTicket(tick) {
    Devoluciones.getSpecificTicketForPrinting(tick)
        .then((response) => {
            ticket.value = response.data;
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
    addEventListener("afterprint", (event) => {
        window.close()
        if(window.__TAURI__){
        appWindow.close();
        return;
      }
    });
});
</script>
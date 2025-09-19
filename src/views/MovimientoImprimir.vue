<template>
    <br>
    <br>
    .
    <br>

    Cajero: {{ ticket?.user?.name }}
    <br>
    Proveedor: {{ ticket?.proveedor?.name }}
    <br>
    Folio Factura: #{{ ticket?.factura_uuid}}
    <br>
    Sucursal: {{ ticket?.almacen?.name }}
    <br>
    Dirección: {{ ticket?.almacen?.direccion }}
    <br>
    RFC: {{ ticket?.almacen?.rfc }}
    <br>
    Teléfono: {{ ticket?.almacen?.telefono }}
    <br>
    Ticket #: {{ ticket?.consecutivo }}

    <br>
    <span v-if="ticket?.enviada_en">
        Fecha: {{moment(ticket?.enviada_en).format('DD-MM-YYYY h:mm:ssa')}}
    </span>
    <span v-else>
        Fecha: {{moment().format('DD-MM-YYYY h:mm:ssa')}}
    </span>

    <br>
    <span v-if="ticket?.estado == 'C'">
        Ticket Cancelado
    </span>
    <br>
    ===================
    <br>

    <span v-for="(item, index) in ticket?.articulos_ocs" :key="index">
        - {{ item?.product?.name }}
        <br>
        {{ item?.cantidad_ordenada + ' x $' + item?.costo_al_ordenar + ' = ' + '$' + item?.total_al_ordenar }}
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
        Total: ${{ ticket?.total_enviado}}
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
import Movimientos from '../apis/Movimientos';
import moment from 'moment-timezone';
import { appWindow } from '@tauri-apps/api/window';
import { useUserStore } from '../s';
const ticketId = ref(null);
const ticket = ref(null);
const s = useUserStore();
const { handleOpException} = s;

watch(ticketId, () => {
    getSpecificTicket(ticketId.value);
});

function getSpecificTicket(tick) {
    Movimientos.getSpecificTicketForPrinting(tick)
        .then((response) => {
            ticket.value = response.data;
            nextTick(() => {
                window.print()
            })
        })
        .catch((error) => {
            console.log(error);
            handleOpException(error);
            alert("Ha ocurrido un error")
        });
}
const route = useRoute();
onMounted(() => {
    ticketId.value = route.params.id;
    addEventListener("afterprint", (event) => {
        window.close()
        if(window.__TAURI__){
        appWindow.close();
        return;
      }
    });
});
</script>
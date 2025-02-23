<script setup>
import { toRef, toRefs } from 'vue';
import moment from "moment-timezone"
const props = defineProps(['venta']);
defineEmits(['imprimirVenta', 'cancelarVenta', 'createDevolucion'])
const { venta } = toRefs(props);

</script>
<template>
    <tr>
        <td>{{ venta.id }}</td>
        <td>{{ venta.consecutivo }}</td>
        <td>{{ venta.turno_id }}</td>
        <td>{{ venta.nombre }}</td>
        <td>{{ moment(venta.pagado_en).format('DD-MM-YYYY h:mm:ssa') }}</td>
        <td>{{ venta?.cliente?.name }}</td>
        <td>{{ venta?.almacen?.name }}</td>
        <td>{{ venta.total }}</td>
        <td>
            {{ venta.total_devuelto > 0 ? "Sí" : "No" }}
        </td>
        <td>
            {{ venta.esta_cancelado ? "Cancelada" : "Activa" }}
        </td>
        <td>
            <router-link :to="{
                name: 'SpecificVenta',
                params: { ventaId: venta.id },
            }">
                <v-btn>ver</v-btn>
            </router-link>
        <td>
            <v-btn @click="imprimirVenta(venta.id)">
                <v-icon>mdi-print-pos</v-icon>
            </v-btn>

        </td>
        </td>
    </tr>
</template>
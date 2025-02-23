<script setup>
import { toRef, toRefs } from 'vue';
import moment from "moment-timezone"
const props = defineProps(['movimiento']);
defineEmits(['imprimirMovimiento', 'cancelarMovimiento'])
const { movimiento } = toRefs(props);

</script>
<template>
    <tr>
        <td>{{ movimiento.id }}</td>
        <td>{{ movimiento.consecutivo }}</td>
        <td>{{ moment(movimiento.enviada_en).format('DD-MM-YYYY h:mm:ssa') }}</td>
        <td>{{ movimiento.user.name }}</td>
        <td class="font-bold">{{
            movimiento.almacen_origen?.name
            }}</td>
        <td class="font-bold">{{
            movimiento.almacen_destino
                ? movimiento.almacen_destino.name
                : ""
        }}</td>
        <td>{{ movimiento.total_enviado }}</td>
        <td class="font-bold" v-if="movimiento.tipo == 'C'">{{
            "Compra"
            }}</td>
        <td class="font-bold" v-if="movimiento.tipo == 'T'">{{
            "Transferencia"
            }}</td>
        <td class="font-bold" v-if="movimiento.tipo == 'S'">{{
            "S. Trans"
            }}</td>
        <td>{{
            movimiento.proveedor ? movimiento.proveedor.name : ""
            }}</td>
        <td>
            <p v-if="movimiento.estado == 'C'">Cancelada</p>
            <p v-if="movimiento.estado == 'P'">Pendiente</p>
            <p v-if="movimiento.estado == 'R'">Recibida</p>
            <p v-if="movimiento.estado == 'B'">Borrador</p>
        </td>
        <td>
            <router-link :to="{
                name: 'MovimientosShow',
                params: { movimientoId: movimiento.id },
            }" class="mx-1">
                <v-tooltip text="Ver" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn icon size="x-small" v-bind="props">
                            <v-icon>
                                mdi-eye
                            </v-icon>
                        </v-btn>
                    </template>
                </v-tooltip>
            </router-link>
            <v-tooltip text="Imprimir" location="top">
                <template v-slot:activator="{ props }">
                    <v-btn @click="imprimirMovimiento(movimiento.id)" icon size="x-small" v-bind="props" class="mx-1">
                        <v-icon>mdi-cloud-print</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>
            <v-tooltip text="Cancelar" location="top">
                <template v-slot:activator="{ props }">
                    <v-btn v-if="movimiento.estado != 'C'" @click="cancelarMovimiento(movimiento.id)" size="x-small"
                        v-bind="props" icon class="mx-1">
                        <v-icon>mdi-cancel</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>
            <p class="text-red-700" v-if="movimiento.estado == 'C'">
                Cancelada
            </p>
        </td>
    </tr>
</template>
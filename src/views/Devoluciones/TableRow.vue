<script setup>
import { toRef, toRefs } from 'vue';
import moment from "moment-timezone"
import { useCurrency } from '@js/composables/useCurrency';
const { formatNumber } = useCurrency('es-MX', 'MXN');
const props = defineProps(['devolucion']);
defineEmits(['imprimirMovimiento', 'cancelarMovimiento'])
const { devolucion } = toRefs(props);

</script>
<template>
    <tr>
        <td>{{ devolucion.id }}</td>
        <td>{{ moment(devolucion.devuelto_en).format('DD-MM-YYYY h:mm:ssa') }}</td>
        <td>{{ devolucion.ventaticket_id }}</td>
        <td>{{ devolucion?.ventaticket?.almacen?.name }}</td>
        <td>{{ devolucion?.ventaticket?.cliente?.name }}</td>
        <td>{{ formatNumber(devolucion?.total_devuelto) }}</td>
        <td>
            <p v-if="devolucion.tipo_devolucion == 'P'">Pendiente</p>
            <p v-else class="text-green-500">Realizada</p>
        </td>
        <td>
            <router-link :to="{
                name: 'DevolucionesShow',
                params: { venta: devolucion.ventaticket_id, devolucion: devolucion.id },
            }" class="mx-1">
                <v-tooltip text="Ver" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn icon size="x-small" v-bind="props">
                            <v-icon>mdi-eye</v-icon>
                        </v-btn>
                    </template>
                </v-tooltip>
            </router-link>
            <v-tooltip text="Imprimir" location="top" v-if="devolucion.tipo_devolucion == 'C'">
                <template v-slot:activator="{ props }">
                    <v-btn @click="$emit('imprimirDevolucion', devolucion.id)" size="x-small" icon class="mx-1"
                        v-bind="props">
                        <v-icon>mdi-cloud-print</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>
            <v-tooltip text="Eliminar" location="top" v-else @click="$emit('eliminarDevolucion', devolucion.id)">
                <template v-slot:activator="{ props }">
                    <v-btn size="x-small" icon color="error" v-bind="props">
                        <v-icon>mdi-trash-can</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>
        </td>
    </tr>
</template>
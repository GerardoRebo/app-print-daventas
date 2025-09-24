<script setup>
import { toRef, toRefs } from 'vue';
import moment from "moment-timezone"
const props = defineProps(['corte']);
defineEmits(['getUserMovimientos'])
const { corte } = toRefs(props);
console.log(corte);


</script>
<template>
    <tr>
        <td>{{ corte.id }}</td>
        <td>
            <p :class="[
                corte.termino_en == null
                    ? 'text-green-600'
                    : 'text-indigo-600',
            ]" class="font-semibold">
                {{ corte.user.name }}
            </p>
        </td>
        <td>{{ moment(corte.inicio_en).format('YYYY-MM-DD') }}</td>
        <td>{{ corte.termino_en ? moment(corte.termino_en).format('YYYY-MM-DD') : 'Abierto'}}</td>
        <td class="font-bold">{{
            corte.ventas_efectivo
        }}</td>
        <td>{{ corte.ventas_credito }}</td>
        <td>{{ corte.abonos_efectivo }}</td>
        <td>{{ corte.compras }}</td>
        <td>{{ corte.acumulado_ganancias }}</td>
        <td>{{ corte.devoluciones_ventas_efectivo }}</td>
        <td>{{ corte.devoluciones_ventas_credito }}</td>
        <td @click="$emit('getUserMovimientos', corte.id)">
            <p class="cursor-pointer text-indigo-600">
                {{ corte.acumulado_entradas }}
            </p>
        </td>
        <td @click="$emit('getUserMovimientos', corte.id)">
            <p class="cursor-pointer text-indigo-600">
                {{ corte.acumulado_salidas }}
            </p>
        </td>
        <td>{{ corte.total_sistema }}</td>
        <td :title="corte.comments">
            <p :class="[
                corte.total_sistema != corte.efectivo_al_cierre
                    ? 'text-red-600'
                    : 'text-green-600',
            ]" class="font-semibold">
                {{ corte.efectivo_al_cierre }}
            </p>
        </td>
        <td>
            <router-link :to="{ name: 'AdminCortesShow', params: { corteId: corte.id } }">
                <v-btn icon size="x-small">
                    <v-icon>mdi-eye</v-icon>
                </v-btn>
            </router-link>
            <v-btn :href="`/cortes/imprimir/${corte.id}`" target="_blank" icon size="x-small">
                <v-icon>mdi-cloud-print</v-icon>
            </v-btn>
        </td>
    </tr>
</template>
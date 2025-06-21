<script setup>
import { toRef, toRefs } from 'vue';
import moment from "moment-timezone"
const props = defineProps(['cotization']);
defineEmits(['imprimircotization', 'cancelarcotization', 'createDevolucion'])
const { cotization } = toRefs(props);

</script>
<template>
    <tr>
        <td>{{ cotization.id }}</td>
        <td>{{ cotization.consecutivo }}</td>
        <td>{{ cotization.turno_id }}</td>
        <td>{{ moment(cotization.pagado_en).format('DD-MM-YYYY h:mm:ssa') }}</td>
        <td>{{ cotization?.cliente?.name }}</td>
        <td>{{ cotization?.almacen?.name }}</td>
        <td>{{ cotization.total }}</td>
        <td>
            {{ cotization.total_devuelto > 0 ? "Sí" : "No" }}
        </td>
        <td>
            <router-link :to="{
                name: 'CotizacionesShow',
                params: { cotizacionId: cotization.id },
            }">
                <v-btn prepend-icon="mdi-eye" size="small">ver</v-btn>
            </router-link>
            <v-btn @click="imprimircotization(cotization.id)" prepend-icon="mdi-print-pos" size="small">
                Imprimir
            </v-btn>
        </td>
    </tr>
</template>
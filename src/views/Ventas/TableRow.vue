<script setup>
import { toRef, toRefs } from 'vue';
import moment from "moment-timezone"
import { useDisplay } from 'vuetify';
import { useCurrency } from '@js/composables/useCurrency';
const { formatNumber } = useCurrency('es-MX', 'MXN');
const props = defineProps(['venta']);
defineEmits(['imprimirVenta', 'cancelarVenta', 'createDevolucion'])
const { venta } = toRefs(props);
const { xs, mdAndUp, mdAndDown, smAndDown } = useDisplay()

</script>
<template>
    <tr :class="venta.facturado_en ? 'text-primary' : ''">
        <td>{{ venta.id }}</td>
        <td>{{ moment(venta?.pagado_en).format('DD-MM-YYYY h:mm:ssa') }}</td>
        <td>{{ venta.consecutivo }}</td>
        <td>{{ venta.turno_id }}</td>
        <td>{{ venta.nombre }}</td>
        <td>{{ venta?.cliente?.name }}</td>
        <td>{{ venta?.almacen?.name }}</td>
        <td>${{ formatNumber(venta.total) }}</td>
        <td>
            {{ venta.total_devuelto > 0 ? "Sí" : "No" }}
        </td>
        <td>
            {{ venta.esta_cancelado ? "Cancelada" : "Activa" }}
        </td>
        <td v-if="mdAndUp">
            <v-tooltip text="Ver" location="top">
                <template v-slot:activator="{ props }">
                    <router-link :to="{
                        name: 'VentasShow',
                        params: { ventaId: venta.id },
                    }">
                        <v-btn size="x-small" class="mx-2" icon="mdi-eye" v-bind="props"></v-btn>
                    </router-link>
                </template>
            </v-tooltip>
            <v-tooltip text="Imprimir" location="top">
                <template v-slot:activator="{ props }">
                    <v-btn @click="$emit('imprimirVenta', venta.id)" size="x-small" class="mx-2" v-bind="props"
                        icon="mdi-printer-pos"></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip text="Devolver" location="top" v-if="!venta.esta_cancelado &&
                !(venta.total == venta.total_devuelto)">
                <template v-slot:activator="{ props }">
                    <v-btn @click="$emit('createDevolucion', venta.id)" size="x-small" class="mx-2"
                        icon="mdi-cash-refund" v-bind="props">
                    </v-btn>
                </template>
            </v-tooltip>
            <span v-else class="text-error mx-2">Devuelto</span>
            <v-tooltip text="Cancelar" location="top" v-if="!venta.esta_cancelado && venta.total_devuelto == 0">
                <template v-slot:activator="{ props }">
                    <v-btn @click="$emit('cancelarVenta', venta.id)" v-bind="props" size="x-small"
                        icon="mdi-cancel"></v-btn>
                </template>
            </v-tooltip>
            <span v-else-if="venta.total_devuelto > 0 &&
                !(venta.total == venta.total_devuelto)
            " class="text-error mx-2">
                Devolución Parcial
            </span>
            <span v-else-if="venta.total == venta.total_devuelto" class="text-error mx-2">
                Devuelto
            </span>
            <span v-else class="text-error mx-2">Cancelado</span>
        </td>
        <td v-if="smAndDown">
            <v-menu transition="scale-transition" class="" v-if="smAndDown">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" size="small" v-bind="props" append-icon="mdi-menu-down" >
                        Opciones
                    </v-btn>
                </template>
                <v-list>
                    <router-link :to="{
                        name: 'VentasShow',
                        params: { ventaId: venta.id },
                    }" class="text-decoration-none">
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon icon="mdi-eye"></v-icon>
                            </template>
                            <v-list-item-title>
                                Ver</v-list-item-title>
                        </v-list-item>
                    </router-link>
                    <v-list-item @click="$emit('imprimirVenta', venta.id)">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-printer-pos"></v-icon>
                        </template>
                        <v-list-item-title>
                            ReImprimir</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="$emit('createDevolucion', venta.id)"
                        v-if="!venta.esta_cancelado && !(venta.total == venta.total_devuelto)">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-cash-refund"></v-icon>
                        </template>
                        <v-list-item-title>
                            Devolución</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-else>
                        <template v-slot:prepend>
                            <v-icon icon="mdi-whatsapp"></v-icon>
                        </template>
                        <v-list-item-title>
                            Devuelto</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="$emit('cancelarVenta', venta.id)"
                        v-if="!venta.esta_cancelado && venta.total_devuelto == 0">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-cancel"></v-icon>
                        </template>
                        <v-list-item-title>
                            Cancelar</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-else-if="venta.total_devuelto > 0 &&
                        !(venta.total == venta.total_devuelto)">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-cash-refund"></v-icon>
                        </template>
                        <v-list-item-title>
                            Devolución Parcial</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-else-if="venta.total == venta.total_devuelto">
                        <template v-slot:prepend>
                            <v-icon icon="mdi-cash-refund"></v-icon>
                        </template>
                        <v-list-item-title>
                            Devuelto</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-else>
                        <template v-slot:prepend>
                            <v-icon icon="mdi-cancel"></v-icon>
                        </template>
                        <v-list-item-title>
                            Cancelado</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </td>
    </tr>
</template>
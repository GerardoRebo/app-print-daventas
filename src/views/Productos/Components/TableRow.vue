<script setup>
import {computed, toRef, toRefs } from 'vue';

const props = defineProps(['product']);
defineEmits(['ajusteProduct', 'abrirExistencias', 'destroyProduct'])
const { product } = toRefs(props);
const ObjetoImp = computed(()=>{
    switch (product.value.ObjetoImp) {
        case "01":
            return "No Objeto"
            break;
        case "02":
            return "Sí Objeto"
            break;
        default:
            break;
    }
} )

</script>
<template>
    <tr>
        <td>{{ product.codigo }}</td>
        <td>

            <v-btn icon size="x-small" class="mx-2" @click="$emit('ajusteProduct', product.id)"
                @keydown.enter="$emit('ajusteProduct', product.id)" color="accent">
                <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <span class="font-weight-bold"
                :class="[product.es_kit ? 'text-green' : '', product.consumible == 'generico' ? 'text-warning' : '', product.consumible == 'regular' ? 'text-neutral700' : '', product.consumible === null && !!!product.es_kit ? 'text-primary' : '',]">{{
                    product.name
                }}</span>
        </td>
        <td>${{ product.pcosto }}</td>
        <td>${{ product.precio }}</td>
        <td>
            <v-icon size="small" class="mx-2" @click="$emit('abrirExistencias', product.id)"
                @keydown.enter="$emit('abrirExistencias', product.id)">mdi-eye</v-icon>
            <span>{{ product.cantidad_actual }}</span>
        </td>
        <td>{{ product.invmin }}</td>
        <td>{{ product.invmax }}</td>
        <td>{{ product.es_kit ? 'Sí' : 'No' }}</td>
        <td>{{ ObjetoImp}}</td>
        <td>
            <router-link :to="{
                name: 'ProductosShowBasica',
                params: {
                    productId: product.id,
                },
            }" class="text-decoration-none">
                <v-btn icon size="x-small" tabindex="-1">
                    <v-icon>
                        mdi-cog
                    </v-icon>
                </v-btn>
            </router-link>
            <v-btn icon size="x-small" @click="$emit('destroyProduct', product.id)">
                <v-icon color="error">
                    mdi-delete
                </v-icon>
            </v-btn>
        </td>
    </tr>
</template>
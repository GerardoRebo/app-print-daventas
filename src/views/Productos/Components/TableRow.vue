<script setup>
import { computed, ref } from 'vue';
import { useCurrency } from '@js/composables/useCurrency';
const { formatNumber } = useCurrency('es-MX', 'MXN');

const props = defineProps(['product']);
defineEmits(['ajusteProduct', 'abrirExistencias', 'destroyProduct'])
const { product } = props;

const deleteConfirm = ref(false);

const ObjetoImp = computed(() => {
    switch (product.ObjetoImp) {
        case "01":
            return "No Objeto"
        case "02":
            return "Sí Objeto"
        default:
            return "-"
    }
})

const isLowStock = computed(() => {
    return !product.is_service && +product.cantidad_actual < +product.invmin
});

</script>
<template>
    <tr class="hover-highlight">
        <!-- Código -->
        <td class="text-caption text-medium-emphasis">
            {{ product.codigo }}
        </td>
        <!-- Nombre  -->
        <td>
            <span class="font-weight-bold"
                :class="[product.is_service ? 'text-secondary' : product.es_kit ? 'text-green' : 'text-primary']">{{
                    product.name }}
            </span>
        </td>
        <!-- Costo -->
        <td class="">
            <span v-if="!product.is_service">${{ formatNumber(product.pcosto) }}</span>
            <span v-else class="text-caption text-medium-emphasis">-</span>
        </td>
        <!-- Precio -->
        <td class=" font-weight-bold">
            ${{ formatNumber(product.precio) }}
        </td>
        <!-- Stock + Acciones (Editar) -->
        <td v-if="!product.is_service" class="">
            <div class="d-flex align-center gap-2">
                <!-- Editar Inventario -->
                <v-btn size="x-small" class="mr-1" color="primary" @click="$emit('ajusteProduct', product.id)"
                    @keydown.enter="$emit('ajusteProduct', product.id)"
                    :title="'Editar inventario y precios de ' + product.name" aria-label="Editar inventario y precios">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <!-- Cantidad -->
                <span class="font-weight-bold" :class="isLowStock ? 'text-warning' : ''">{{ product.cantidad_actual }}</span>
            </div>
        </td>
        <td v-else="product.is_service" class=" text-caption text-medium-emphasis">-</td>
        <!-- Min/Max -->
        <td class="text-caption ">
            <span v-if="!product.is_service">{{ product.invmin }}-{{ product.invmax }}</span>
            <span v-else>-</span>
        </td>
        <!-- Es Kit -->
        <td class="text-caption ">{{ product.is_service ? "-" : (product.es_kit ? 'Sí' : 'No') }}</td>
        <!-- Objeto Impuesto -->
        <td class="text-caption ">{{ ObjetoImp }}</td>
        <!-- Acciones Adicionales -->
        <td class="">
            <v-menu min-width="200px">
                <template v-slot:activator="{ props }">
                    <v-btn icon size="x-small" v-bind="props" aria-label="Más acciones">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>
                <v-list density="compact">
                    <!-- Ver Existencias -->
                    <v-list-item @click="$emit('abrirExistencias', product.id)" aria-label="Ver existencias por almacén">
                        <template v-slot:prepend>
                            <v-icon>mdi-warehouse</v-icon>
                        </template>
                        <v-list-item-title>Ver Existencias</v-list-item-title>
                    </v-list-item>
                    <!-- Configuración -->
                    <v-list-item :to="{
                        name: 'ProductosShowBasica',
                        params: { productId: product.id }
                    }" aria-label="Ir a configuración avanzada">
                        <template v-slot:prepend>
                            <v-icon>mdi-cog</v-icon>
                        </template>
                        <v-list-item-title>Configuración</v-list-item-title>
                    </v-list-item>
                    <!-- Divisor -->
                    <v-divider class="my-1"></v-divider>
                    <!-- Eliminar -->
                    <v-list-item class="text-error" @click="deleteConfirm = true" aria-label="Eliminar producto">
                        <template v-slot:prepend>
                            <v-icon color="error">mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>Eliminar</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </td>
    </tr>

    <!-- Dialog de Confirmación de Eliminación -->
    <v-dialog v-model="deleteConfirm" max-width="400px">
        <v-card>
            <v-card-title class="d-flex align-center gap-2">
                <v-icon color="error" size="large">mdi-alert</v-icon>
                Eliminar Producto
            </v-card-title>
            <v-card-text>
                <p class="font-weight-bold">{{ product.name }}</p>
                <p class="text-caption text-medium-emphasis">
                    Esta acción no se puede deshacer. El producto será eliminado permanentemente del catálogo.
                </p>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="deleteConfirm = false" variant="text">
                    Cancelar
                </v-btn>
                <v-btn color="error" variant="elevated" @click="() => {
                    $emit('destroyProduct', product.id);
                    deleteConfirm = false;
                }">
                    Eliminar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
/* Highlight suave cuando se navega con Tab */
tr.hover-highlight:focus-within {
    background-color: rgba(25, 118, 210, 0.08);
    outline: 1px solid rgba(25, 118, 210, 0.2);
    outline-offset: -1px;
}

/* Efecto hover suave */
tr.hover-highlight:hover {
    background-color: rgba(0, 0, 0, 0.02);
}

/* Focus visible para mejor accesibilidad */
:deep(:focus-visible) {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}
</style>
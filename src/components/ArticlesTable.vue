<template>
  <v-progress-linear color="primary" indeterminate v-if="loading"></v-progress-linear>

  <v-data-table :headers="headers" :items="articles" items-per-page="-1" show-select select-strategy="single"
    density="compact" class="article-table" @click:row="onRowClick">
    <!-- Custom checkbox slot con keybindings -->
    <template v-slot:item.data-table-select="{ internalItem }">
      <input type="checkbox" class="article-checkbox articulosInputs"
        @keydown.delete.prevent="$emit('delete', internalItem.raw.id)"
        @keydown.enter.prevent="$emit('edit', internalItem.raw)" />
    </template>

    <!-- Código del producto -->
    <template v-slot:item.codigo="{ item }">
      <span class="text-caption">
        {{ item.product?.codigo ?? '' }}
      </span>
    </template>

    <!-- Nombre del producto con link y estilos condicionales -->
    <template v-slot:item.product_name="{ item }">
      <router-link :to="{
        name: 'ProductosIndex',
        query: { keyword: item.product_name ?? item.product.name },
      }" class="text-decoration-none" :class="[
          item.is_service ? 'text-black' : item.es_kit ? 'text-success' : 'text-primary',
          item.product_id ? '' : 'text-decoration-line-through',
        ]" tabindex="-1">
        <p class="font-weight-bold mb-0">
          {{ item.product_name ?? item.product?.name }}
          <v-icon size="x-small">mdi-open-in-new</v-icon>
        </p>
      </router-link>
    </template>

    <!-- Cantidad -->
    <template v-slot:item.cantidad="{ item }">
      {{ item.cantidad }}
    </template>

    <!-- Precio -->
    <template v-slot:item.precio_usado="{ item }">
      <div :title="`Descuento aplicado: $${item.descuento ?? 0}`">
        ${{ formatNumber(item.precio_usado || item.precio) }}
      </div>
    </template>

    <!-- Importe (Precio Final) -->
    <template v-slot:item.precio_final="{ item }">
      <p class="font-weight-bold mb-0">
        ${{ formatNumber(item.precio_final || item.importe) }}
      </p>
    </template>

    <!-- Descuento -->
    <template v-slot:item.importe_descuento="{ item }">
      ${{ formatNumber(item.importe_descuento || 0) }}
    </template>

    <!-- Impuesto (Traslado - Retenido) -->
    <template v-slot:item.impuesto_traslado="{ item }">
      <v-tooltip :text="`Trasladado: $${item.impuesto_traslado}, Retenido: $${item.impuesto_retenido}`" location="top">
        <template v-slot:activator="{ props }">
          <span v-bind="props">
            ${{
              formatNumber(
                (item.impuesto_traslado || 0) - (item.impuesto_retenido || 0)
              )
            }}
          </span>
        </template>
      </v-tooltip>
    </template>

    <!-- Existencia (Stock) -->
    <template v-slot:item.cantidad_actual="{ item }">
      <div v-if="!item.is_service">
        {{ item.cantidad_actual }}
      </div>
    </template>

    <!-- Acciones: Ver imágenes, Editar, Eliminar -->
    <template v-slot:item.actions="{ item }">
      <div class="flex flex-wrap gap-2">
        <!-- Ver imágenes -->
        <v-btn v-if="item?.product?.images?.length" @click.stop="$emit('view-images', item.product.images)"
          icon="mdi-eye" size="small" tabindex="-1" variant="text" class="text-gray-500"></v-btn>

        <!-- Editar -->
        <v-btn v-if="item.product_id" @click.stop="$emit('edit', item)" icon="mdi-pencil" size="x-small" tabindex="-1"
          variant="text" class="text-indigo-600"
          :disabled="!!((+item.impuesto_retenido) || (+item.impuesto_traslado))"></v-btn>

        <!-- Eliminar -->
        <v-btn @click.stop="$emit('delete', item.id)" icon="mdi-trash-can" size="x-small" tabindex="-1" variant="text"
          class="text-red-500"></v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { useCurrency } from '@js/composables/useCurrency';

const props = defineProps({
  articles: {
    type: Array,
    required: true,
  },
  headers: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  'edit',        // Emitido cuando se presiona Enter en checkbox o click editar
  'delete',      // Emitido cuando se presiona Delete en checkbox o click eliminar
  'view-images', // Emitido cuando se hace click en el icono de ojo
  'row-click',   // Emitido cuando se hace click en una fila (opcional)
]);

const { formatNumber } = useCurrency('es-MX', 'MXN');

const onRowClick = (e) => {
  // Opcional: emitir evento de click en fila para futura expansión
  // Por ahora solo usamos delete y edit
};
</script>

<style scoped>
:deep(.v-table__tbody tr) {
  transition: background-color 150ms ease-in-out;
}

:deep(.v-table__tbody tr:hover) {
  background-color: rgba(59, 130, 246, 0.1);
}
</style>

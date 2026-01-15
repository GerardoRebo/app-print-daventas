<template>
  <v-container fluid class="py-2">
    <v-data-table :headers="headers" :items="articulos" density="compact" :loading="loading">
      <!-- Checkbox column -->
      <template #item.checkbox="{ item }">
        <input type="checkbox" class="article-checkbox articulosInputs"
          @keydown.delete.prevent="$emit('delete', item)"
          @keydown.enter.prevent="$emit('edit', item)" />
      </template>

      <!-- Code column with keybinding -->
      <template #item.codigo="{ item }">
        <span class="cursor-pointer text-caption" @keydown.delete.prevent="$emit('delete', item)"
          @keydown.enter.prevent="$emit('edit', item)">
          {{ item.product?.codigo || 'N/A' }}
        </span>
      </template>

      <!-- Product Name column (clickable for images) -->
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

      <!-- Cantidad Ordenada -->
      <template #item.cantidad_ordenada="{ item }">
        <span>{{ formatNumber(item.cantidad_ordenada, 3) }}</span>
      </template>

      <!-- Costo al Ordenar -->
      <template #item.costo_al_ordenar="{ item }">
        <span>${{ formatNumber(item.costo_al_ordenar) }}</span>
      </template>

      <!-- Total al Ordenar -->
      <template #item.total_al_ordenar="{ item }">
        <span class="font-weight-bold mb-0">${{ formatNumber(item.total_al_ordenar) }}</span>
      </template>

      <!-- Descuento -->
      <!-- <template #item.descuento="{ item }">
        <span>${{ formatNumber(item.descuento) }}</span>
      </template> -->

      <!-- Impuestos al Enviar -->
      <template #item.impuestos_al_enviar="{ item }">
        <span>${{ formatNumber(item.impuestos_al_enviar) }}</span>
      </template>

      <!-- Existencia -->
      <template #item.existencia="{ item }">
        <span>{{ formatNumber(item.producto?.inventario, 3) || 0 }}</span>
      </template>

      <!-- Actions column with keybindings -->
      <template #item.acciones="{ item }">
        <div @keydown.delete="$emit('delete', item)" @keydown.enter="$emit('edit', item)"
          @keydown.alt.v="$emit('view-images', item)" tabindex="0">
          <v-btn @click="$emit('edit', item)" variant="text" icon small class="mx-1">
            <v-icon size="small">mdi-pencil</v-icon>
            <v-tooltip activator="parent" text="Editar (Enter)" location="top"></v-tooltip>
          </v-btn>
          <v-btn @click="$emit('delete', item)" variant="text" icon small class="mx-1">
            <v-icon size="small">mdi-trash-can</v-icon>
            <v-tooltip activator="parent" text="Eliminar (Delete)" location="top"></v-tooltip>
          </v-btn>
          <v-btn v-if="item.product?.product_images?.length" @click="$emit('view-images', item)" variant="text" icon
            small class="mx-1">
            <v-icon size="small">mdi-image-multiple</v-icon>
            <v-tooltip activator="parent" text="Ver imágenes (Alt+V)" location="top"></v-tooltip>
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useCurrency } from '@js/composables/useCurrency'

const { formatNumber } = useCurrency('es-MX', 'MXN')

const props = defineProps({
  articulos: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const selected = ref({})

const headers = [
  { title: '', value: 'checkbox' },
  { title: 'Código', value: 'codigo' },
  { title: 'Nombre', value: 'product_name' },
  { title: 'Cantidad', value: 'cantidad_ordenada' },
  { title: 'Costo', value: 'costo_al_ordenar' },
  { title: 'Importe', value: 'total_al_ordenar' },
  { title: 'Descuento', value: 'descuento' },
  { title: 'Impuesto', value: 'impuestos_al_enviar' },
  { title: 'Precio', value: 'precio' },
  { title: 'Existencia', value: 'cantidad_actual' },
  { title: 'Acciones', value: 'acciones', sortable: false }
]

const emit = defineEmits(['view-images', 'edit', 'delete'])
</script>

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
      <span v-if="item.product?.codigo"
        class="text-caption cursor-pointer select-none px-2 py-1 rounded hover:bg-primary hover:bg-opacity-10 transition-colors"
        @click="copiarCodigo(item.product.codigo)" :title="`Click para copiar: ${item.product.codigo}`">
        <v-icon size="x-small" class="mr-1">mdi-content-copy</v-icon>
        {{ item.product.codigo }}
      </span>
    </template>

    <!-- Nombre del producto con link y estilos condicionales -->
    <template v-slot:item.product_name="{ item }">
      <router-link :to="{
        name: 'ProductosIndex',
        query: { keyword: item.product_name ?? item.product.name },
      }" class="text-decoration-none" :class="[
          item.is_service ? 'text-black' : item.product.es_kit ? 'text-success' : 'text-primary',
          item.product_id ? '' : 'text-decoration-line-through',
        ]" tabindex="-1">
        <span class="font-weight-bold">
          {{ item.product_name ?? item.product?.name }}
          <v-icon size="x-small">mdi-open-in-new</v-icon>
        </span>
      </router-link>
    </template>

    <!-- Cantidad -->
    <template v-slot:item.cantidad="{ item }">
      {{ item.cantidad }}
    </template>

    <!-- Ancho -->
    <template v-slot:item.ancho="{ item }">
      {{ item.ancho }}
    </template>

    <!-- Alto -->
    <template v-slot:item.alto="{ item }">
      {{ item.alto }}
    </template>

    <!-- Área -->
    <template v-slot:item.area_total="{ item }">
      {{ item.area_total }}
    </template>

    <!-- Precio -->
    <template v-slot:item.precio_usado="{ item }">
      <div :title="`Descuento aplicado: $${item.descuento ?? 0}`">
        ${{ formatNumber(props.desglosarImpuesto ? item.precio_usado : item.precio) }}
      </div>
    </template>

    <!-- Importe (Precio Final) -->
    <template v-slot:item.precio_final="{ item }">
      <p class="font-weight-bold mb-0">
        ${{ formatNumber(importePrecioFinal(item)) }}
      </p>
    </template>

    <!-- Descuento -->
    <template v-slot:item.importe_descuento="{ item }">
      ${{ formatNumber(item.importe_descuento || 0) }}
    </template>

    <!-- Impuesto (Traslado - Retenido) -->
    <template v-slot:item.impuesto_traslado="{ item }" v-if="props.desglosarImpuesto">
      <v-tooltip :text="`Trasladado: $${item.impuesto_traslado}, Retenido: $${item.impuesto_retenido}`" location="top">
        <template v-slot:activator="{ props }">
          <span v-bind="props">
            ${{ formatNumber(importeImpuesto(item)) }}
          </span>
        </template>
      </v-tooltip>
    </template>

    <!-- Existencia (Stock) -->
    <template v-slot:item.cantidad_actual="{ item }">
      <div v-if="!item.is_service" :class="[+item.cantidad_actual < +item.cantidad ? 'text-error' : '']"
        :title="`Cantidad actual en inventario: ${item.cantidad_actual}`">
        {{ item.cantidad_actual }}
        <v-tooltip v-if="+item.cantidad_apartado" bottom>
          <template v-slot:activator="{ props }">
            <v-icon size="x-small" color="warning" v-bind="props">mdi-alert-circle</v-icon>
          </template>
          <span>Hay {{ item.cantidad_apartado }} unidades apartadas</span>
        </v-tooltip>
      </div>
    </template>

    <!-- Acciones: Ver imágenes, Editar, Eliminar -->
    <template v-slot:item.actions="{ item }">
      <div class="flex flex-wrap gap-2">
        <!-- Indicador sutil: apto para CFDI -->
        <v-tooltip text="Apto para ser timbrado en CFDI" location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-if="item?.product?.es_apto_para_cfdi" v-bind="props" size="x-small" color="success"
              class="opacity-70">mdi-circle-medium</v-icon>
            <v-icon v-else v-bind="props" size="x-small" color="" class="opacity-10">mdi-circle-medium</v-icon>
          </template>
        </v-tooltip>
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
import { useNotification } from '@js/composables/useNotification';

const { notify } = useNotification();

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
  desglosarImpuesto: {
    type: Boolean,
    default: true,
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

const copiarCodigo = (codigo) => {
  navigator.clipboard.writeText(codigo).then(() => {
    notify.success(`Código "${codigo}" copiado al portapapeles`);
  }).catch(() => {
    notify.error('Error al copiar al portapapeles');
  });
};
const importePrecioFinal = (item) => {
  return props.desglosarImpuesto ? item.precio_final : (+item.precio_final + importeImpuesto(item));
};
const importeImpuesto = (item) => {
  return (item.impuesto_traslado || 0) - (item.impuesto_retenido || 0);
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

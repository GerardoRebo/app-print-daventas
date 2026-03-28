<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="1200">
    <v-card>
      <v-card-title>Existencias</v-card-title>
      <v-card-text>
        <router-link 
          :to="{
            name: 'ProductosIndex',
            query: {
              keyword: productName
            },
          }"
        >
          <v-btn size="small" class="mb-4" prepend-icon="mdi-format-list-bulleted-type">
            Ver en catálogo
          </v-btn>
        </router-link>
        <v-data-table 
          :headers="headers" 
          :items="inventory"
        >
          <template v-slot:item.product_name="{ item }">
            <span>{{ item.product?.name }}</span>
          </template>
          <template v-slot:item.almacen="{ item }">
            <span>{{ item.almacen?.name }}</span>
          </template>
          <template v-slot:item.codigo="{ item }">
            <span>{{ item.product?.codigo }}</span>
          </template>
          <template v-slot:item.pcosto="{ item }">
            <span>${{ formatNumber(item.product?.pcosto) }}</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { useCurrency } from '@js/composables/useCurrency';

const { formatNumber } = useCurrency('es-MX', 'MXN');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  inventory: {
    type: Array,
    default: () => [],
  },
  productName: {
    type: String,
    default: '',
  },
});

const emit = defineEmits([
  'update:modelValue',
]);

const headers = ref([
  { title: "Almacén", key: "almacen", align: "start", sortable: false },
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "product_name", align: "start", sortable: false },
  { title: "Costo", key: "pcosto", align: "start", sortable: false },
  {
    title: "Existencia",
    key: "cantidad_actual",
    align: "start",
    sortable: false,
  },
]);
</script>

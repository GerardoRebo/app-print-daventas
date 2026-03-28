<template>
  <v-dialog :model-value="modelValue" max-width="600" @update:model-value="$emit('update:model-value', $event)">
    <v-card>
      <v-card-title>Precios</v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="priceOptions" hide-default-footer density="compact" fixed-header>
          <template v-slot:item.actions="{ item }">
            <v-btn @click="selectPrice(item)" size="small" >
              Usar precio
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="$emit('update:model-value', false)">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { watch, nextTick } from 'vue';
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  priceOptions: {
    type: Array,
    required: true,
  },
  headers: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:model-value', 'price-selected']);

const selectPrice = (item) => {
  emit('price-selected', item.value);
};
</script>

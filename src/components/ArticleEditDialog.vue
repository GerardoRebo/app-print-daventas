<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600">
    <v-card>
      <v-card-title>Edita Artículo</v-card-title>
      <v-card-subtitle>{{ articulo.name }}</v-card-subtitle>
      <v-card-text>
        <v-text-field
          label="Precio"
          id="pventa"
          autocomplete="off"
          placeholder=""
          ref="pventaRef"
          v-model.number="localArticulo.pventa"
          @keydown.stop.enter="$emit('confirm', localArticulo)"
        />
        <v-text-field
          label="Cantidad"
          id="cantidad"
          autocomplete="off"
          placeholder="Ingresa la cantidad"
          density="compact"
          v-model.number="localArticulo.cantidad"
          @keydown.stop.enter="$emit('confirm', localArticulo)"
          type="number"
          ref="cantidadRef"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn
          @click="$emit('confirm', localArticulo)"
          color="primary"
          variant="outlined"
          :loading="loading"
        >
          Confirmar
        </v-btn>
        <v-btn
          @click="$emit('update:modelValue', false)"
          variant="text"
          :loading="loading"
        >
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  articulo: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      name: '',
      pventa: 0,
      cantidad: 0,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'confirm',
]);

const localArticulo = ref({
  pventa: props.articulo.pventa,
  cantidad: props.articulo.cantidad,
});

const cantidadRef = ref(null);
const pventaRef = ref(null);

// Sync local state with props
watch(
  () => props.articulo,
  (newVal) => {
    localArticulo.value = {
      pventa: newVal.pventa,
      cantidad: newVal.cantidad,
    };
  },
  { deep: true }
);

// Focus on cantidad field when dialog opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        pventaRef.value?.select();
      });
    }
  }
);
</script>

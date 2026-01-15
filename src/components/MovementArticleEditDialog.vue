<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600">
    <v-card>
      <v-card-title>Editar Artículo</v-card-title>
      <v-card-subtitle>Editando: {{ articleName }}</v-card-subtitle>
      <v-card-text>
        <v-text-field 
          ref="costInputRef"
          label="Costo" 
          id="movement-edit-cost"
          autocomplete="off" 
          placeholder="" 
          density="compact"
          v-model="localForm.pcosto" 
          @keydown.stop.enter="confirm"
        />
        <v-text-field 
          label="Cantidad" 
          id="movement-edit-quantity"
          autocomplete="off" 
          placeholder="Ingresa la cantidad"
          density="compact" 
          v-model="localForm.cantidad" 
          @keydown.stop.enter="confirm"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="$emit('update:modelValue', false)">Cerrar</v-btn>
        <v-btn @click="confirm" color="primary" variant="outlined">Confirmar</v-btn>
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
  articleName: {
    type: String,
    default: '',
  },
  cost: {
    type: [String, Number],
    default: null,
  },
  quantity: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'confirm',
]);

const localForm = ref({
  pcosto: null,
  cantidad: null,
});

const costInputRef = ref(null);

// Sync form with props
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    localForm.value.pcosto = props.cost;
    localForm.value.cantidad = props.quantity;
    nextTick(() => {
      costInputRef.value?.select();
    });
  }
}, { immediate: true });

function confirm() {
  emit('confirm', {
    pcosto: localForm.value.pcosto,
    cantidad: localForm.value.cantidad,
  });
}
</script>

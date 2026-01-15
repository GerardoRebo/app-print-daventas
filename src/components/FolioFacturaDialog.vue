<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500">
    <v-card>
      <v-card-title>Folio de Factura del Proveedor</v-card-title>
      <v-card-text>
        <v-text-field 
          ref="folioInputRef"
          v-model="localFolio" 
          label="Folio" 
          placeholder="Ingresa el folio de factura del proveedor"
          hide-details 
          id="folio-input"
          @keydown.stop.enter="confirm"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="$emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="primary" variant="outlined" @click="confirm">Actualizar</v-btn>
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
  folio: {
    type: String,
    default: '',
  },
});

const emit = defineEmits([
  'update:modelValue',
  'confirm',
]);

const localFolio = ref('');
const folioInputRef = ref(null);

// Sync with prop
watch(() => props.folio, (newVal) => {
  localFolio.value = newVal;
}, { immediate: true });

// Focus on dialog open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      folioInputRef.value?.select();
    });
  }
});

function confirm() {
  emit('confirm', localFolio.value);
  localFolio.value = '';
}
</script>

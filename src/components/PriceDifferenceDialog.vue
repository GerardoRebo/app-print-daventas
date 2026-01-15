<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800">
    <v-card>
      <v-card-title>Cambio de Costo - Actualizar Precios</v-card-title>
      <v-card-subtitle v-if="productId">Producto ID: {{ productId }}</v-card-subtitle>
      <v-card-text>
        <!-- Costo -->
        <v-row justify="space-around" class="mb-4">
          <v-col cols="5">
            <v-text-field 
              label="Costo Anterior" 
              id="precio-dialog-old-cost"
              autocomplete="off" 
              density="compact"
              :model-value="oldCost" 
              disabled 
            />
          </v-col>
          <v-col cols="1" class="text-center d-flex align-center justify-center">
            <v-icon>mdi-arrow-right</v-icon>
          </v-col>
          <v-col cols="5">
            <v-text-field 
              label="Costo Actual" 
              id="precio-dialog-new-cost"
              autocomplete="off" 
              density="compact"
              :model-value="newCost" 
              readonly 
            />
          </v-col>
        </v-row>

        <!-- Precio Base -->
        <v-row justify="space-around" class="mb-4">
          <v-col cols="5">
            <v-text-field 
              label="Precio" 
              id="precio-dialog-old-price"
              autocomplete="off" 
              density="compact"
              :model-value="oldPrice" 
              disabled 
            />
          </v-col>
          <v-col cols="1" class="text-center d-flex align-center justify-center">
            <v-icon>mdi-arrow-right</v-icon>
          </v-col>
          <v-col cols="5">
            <v-text-field 
              label="Precio Nuevo" 
              id="precio-dialog-new-price"
              autocomplete="off" 
              placeholder="Precio" 
              density="compact" 
              :suffix="newPriceSuggestion"
              v-model.number="localForm.newPrice" 
              :error-messages="priceError"
              @keydown.enter.prevent="confirmSingle"
              ref="newPriceRef"
            />
          </v-col>
        </v-row>

        <!-- Precio Medio Mayoreo -->
        <v-row justify="space-around" class="mb-4">
          <v-col cols="5">
            <v-text-field 
              label="Precio Medio Mayoreo" 
              id="precio-dialog-old-medio"
              autocomplete="off" 
              density="compact"
              :model-value="oldMedio" 
              disabled 
            />
          </v-col>
          <v-col cols="1" class="text-center d-flex align-center justify-center">
            <v-icon>mdi-arrow-right</v-icon>
          </v-col>
          <v-col cols="5">
            <v-text-field 
              label="Precio Medio Mayoreo Nuevo" 
              id="precio-dialog-new-medio"
              autocomplete="off" 
              placeholder="Medio Mayoreo" 
              density="compact" 
              :suffix="medioSuggestion"
              v-model.number="localForm.newMedio" 
              :error-messages="medioError"
              @keydown.enter.prevent="confirmSingle"
            />
          </v-col>
        </v-row>

        <!-- Precio Mayoreo -->
        <v-row justify="space-around">
          <v-col cols="5">
            <v-text-field 
              label="Precio Mayoreo" 
              id="precio-dialog-old-mayoreo"
              autocomplete="off" 
              density="compact"
              :model-value="oldMayoreo" 
              disabled 
            />
          </v-col>
          <v-col cols="1" class="text-center d-flex align-center justify-center">
            <v-icon>mdi-arrow-right</v-icon>
          </v-col>
          <v-col cols="5">
            <v-text-field 
              label="Precio Mayoreo Nuevo" 
              id="precio-dialog-new-mayoreo"
              autocomplete="off" 
              placeholder="Mayoreo" 
              density="compact" 
              :suffix="mayoreoSuggestion"
              v-model.number="localForm.newMayoreo" 
              :error-messages="mayoreoError"
              @keydown.enter.prevent="confirmSingle"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="$emit('update:modelValue', false)">Cerrar</v-btn>
        <v-btn @click.stop="confirmSingle" color="primary">Guardar</v-btn>
        <v-btn @click.stop="confirmGeneral" color="success">Guardar General</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, computed, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  productId: {
    type: [String, Number],
    default: null,
  },
  oldCost: {
    type: [String, Number],
    default: null,
  },
  newCost: {
    type: [String, Number],
    default: null,
  },
  oldPrice: {
    type: [String, Number],
    default: null,
  },
  oldMedio: {
    type: [String, Number],
    default: null,
  },
  oldMayoreo: {
    type: [String, Number],
    default: null,
  },
  suggestions: {
    type: Object,
    default: () => ({
      precio: null,
      precio_medio: null,
      precio_mayoreo: null,
    }),
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  'update:modelValue',
  'confirm-single',
  'confirm-general',
]);

const localForm = ref({
  newPrice: null,
  newMedio: null,
  newMayoreo: null,
});

const newPriceRef = ref(null);

// Sync with props when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    localForm.value.newPrice = props.oldPrice;
    localForm.value.newMedio = props.oldMedio;
    localForm.value.newMayoreo = props.oldMayoreo;
    nextTick(() => {
      newPriceRef.value?.focus();
    });
  }
}, { immediate: true });

// Error messages
const priceError = computed(() => {
  if (props.errors.precio) {
    return [props.errors.precio[0]];
  }
  if (localForm.value.newPrice && localForm.value.newPrice < localForm.value.newMedio) {
    return ['El precio no puede ser menor que el precio medio mayoreo'];
  }
  if (localForm.value.newPrice && localForm.value.newPrice < localForm.value.newMayoreo) {
    return ['El precio no puede ser menor que el precio mayoreo'];
  }
  return [];
});

const medioError = computed(() => {
  if (props.errors.precio_medio_mayoreo) {
    return [props.errors.precio_medio_mayoreo[0]];
  }
  if (localForm.value.newMedio && localForm.value.newPrice && localForm.value.newMedio > localForm.value.newPrice) {
    return ['Precio medio mayoreo no puede ser mayor que precio base'];
  }
  if (localForm.value.newMedio && localForm.value.newMayoreo && localForm.value.newMedio < localForm.value.newMayoreo) {
    return ['Precio medio mayoreo debe ser mayor que mayoreo'];
  }
  return [];
});

const mayoreoError = computed(() => {
  if (props.errors.precio_mayoreo) {
    return [props.errors.precio_mayoreo[0]];
  }
  if (localForm.value.newMayoreo && localForm.value.newPrice && localForm.value.newMayoreo > localForm.value.newPrice) {
    return ['Precio mayoreo no puede ser mayor que precio base'];
  }
  if (localForm.value.newMayoreo && localForm.value.newMedio && localForm.value.newMayoreo > localForm.value.newMedio) {
    return ['Precio mayoreo no puede ser mayor que precio medio mayoreo'];
  }
  return [];
});

// Suggestions
const newPriceSuggestion = computed(() => {
  return props.suggestions?.precio ? `Sugerido: $${props.suggestions.precio}` : '';
});

const medioSuggestion = computed(() => {
  return props.suggestions?.precio_medio ? `Sugerido: $${props.suggestions.precio_medio}` : '';
});

const mayoreoSuggestion = computed(() => {
  return props.suggestions?.precio_mayoreo ? `Sugerido: $${props.suggestions.precio_mayoreo}` : '';
});

function confirmSingle() {
  if (priceError.value.length || medioError.value.length || mayoreoError.value.length) {
    return;
  }
  emit('confirm-single', {
    newPrice: localForm.value.newPrice,
    newMedio: localForm.value.newMedio,
    newMayoreo: localForm.value.newMayoreo,
  });
}

function confirmGeneral() {
  if (priceError.value.length || medioError.value.length || mayoreoError.value.length) {
    return;
  }
  emit('confirm-general', {
    newPrice: localForm.value.newPrice,
    newMedio: localForm.value.newMedio,
    newMayoreo: localForm.value.newMayoreo,
  });
}
</script>

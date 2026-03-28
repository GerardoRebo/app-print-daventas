<template>
  <v-dialog :model-value="modelValue" @update:model-value="handleClose" max-width="600">
    <v-card>
      <v-card-title>Conversión Granel</v-card-title>
      <v-card-text>
        <v-text-field
          variant="outlined"
          label="Precio Base"
          id="precioBase"
          type="number"
          autocomplete="off"
          placeholder="Precio"
          v-model="localPrecioBase"
          @input="handlePrecioBaseChange"
          :prepend-icon="showPricesIcon ? 'mdi-dots-vertical-circle-outline' : ''"
          @click:prepend="onShowPrices"
          @keydown.stop.enter="confirmConversion"
          class="mr-1"
        />
        <v-text-field
          label="Peso KG:"
          id="peso"
          autocomplete="off"
          placeholder=""
          density="compact"
          v-model="localPeso"
          @input="handlePesoChange"
          @keydown.stop.enter="confirmConversion"
          type="number"
        />
        <v-text-field
          label="Total $"
          id="total"
          autocomplete="off"
          placeholder=""
          density="compact"
          v-model="localTotal"
          @input="handleTotalChange"
          @keydown.stop.enter="confirmConversion"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="handleClose(false)" variant="text" :loading="loading">
          Cancelar
        </v-btn>
        <v-btn
          @click="confirmConversion"
          color="primary"
          variant="outlined"
          :loading="loading"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showPricesIcon: {
    type: Boolean,
    default: false,
  },
  conversionForm: {
    type: Object,
    required: true,
  },
  totalValue: {
    type: [String, Number],
    required: true,
  },
  onModificaPrecioBase: {
    type: Function,
    required: true,
  },
  onModificaPeso: {
    type: Function,
    required: true,
  },
  onModificaTotal: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:model-value', 'confirm', 'show-prices'])

// Local variables that sync with props (as strings to preserve decimal input like .04)
const localPrecioBase = ref('')
const localPeso = ref('')
const localTotal = ref('')

// Watch props to sync with local variables
watch(() => props.conversionForm.precioBase, (newVal) => {
  localPrecioBase.value = String(newVal || '')
}, { immediate: true })

watch(() => props.conversionForm.peso, (newVal) => {
  localPeso.value = String(newVal || '')
}, { immediate: true })

watch(() => props.totalValue, (newVal) => {
  localTotal.value = String(newVal || '')
}, { immediate: true })

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    
  }
}, { immediate: true })

function handlePrecioBaseChange(e) {
  props.onModificaPrecioBase(e)
}

function handlePesoChange(e) {
  props.onModificaPeso(e)
}

function handleTotalChange(e) {
  props.onModificaTotal(e)
}

/**
 * Handle confirm action - emit event
 */
function confirmConversion() {
  emit('confirm', {
    precioBase: parseFloat(localPrecioBase.value) || 0,
    peso: parseFloat(localPeso.value) || 0,
    total: parseFloat(localTotal.value) || 0,
  })
}

/**
 * Handle close event
 */
function handleClose(value) {
  emit('update:model-value', value)
}

/**
 * Handle show prices button click
 */
function onShowPrices() {
  emit('show-prices')
}
</script>

<template>
  <v-card v-if="mdAndDown">
    <v-container>
      <!-- Codigo -->
      <v-row dense>
        <v-col cols="8">
          <v-text-field 
            label="Codigo" 
            id="codigo" 
            autocomplete="off" 
            placeholder="Codigo"
            @keydown.right.prevent="$emit('goPrimerArticulo')" 
            @keydown.enter="$emit('searchProduct')" 
            v-model="localCodigo" 
            density="compact"
            variant="outlined" 
            hide-details 
            class="mb-3" 
            ref="codigoRef" 
          />
        </v-col>
        <v-col cols="4">
          <div class="d-flex around align-center">
            <v-btn 
              :disabled="!(almacen.id && localCodigo)" 
              @click="$emit('searchProduct')" 
              density="compact"
              icon="mdi-arrow-top-right-thick" 
              class="mr-1" 
              color="primary"
            />
            <v-btn 
              @click="$emit('abrirModalBuscaProductsNombre')" 
              density="compact" 
              icon="mdi-magnify" 
              class="mr-1"
            />
            <v-btn 
              @click="$emit('emptyValues')" 
              density="compact" 
              icon="mdi-broom"
            />
          </div>
        </v-col>
      </v-row>

      <!-- Nombre -->
      <v-row no-gutters v-if="productForm.name">
        <v-col>
          <v-text-field 
            v-model="productForm.name" 
            label="Nombre" 
            id="name" 
            autocomplete="off" 
            placeholder="" 
            readonly
            density="compact" 
            variant="outlined" 
            hide-details 
          />
        </v-col>
      </v-row>

      <!-- Cantidad y Costo -->
      <v-row dense v-if="productForm.name">
        <v-col cols="6">
          <v-text-field 
            label="Cantidad" 
            id="cantidad" 
            autocomplete="off" 
            placeholder="Cantidad"
            @keydown.stop.enter="$emit('enviarArticulo')" 
            v-model="productForm.cantidad" 
            density="compact" 
            variant="outlined"
            hide-details 
          />
        </v-col>
        <v-col cols="6">
          <v-text-field 
            label="Costo" 
            id="costo" 
            type="number" 
            autocomplete="off"
            @keydown.stop.enter="$emit('enviarArticulo')" 
            v-model="productForm.pcosto" 
            density="compact"
            variant="outlined"
            hide-details 
          />
        </v-col>
      </v-row>

      <!-- Existencia -->
      <v-row dense v-if="productForm.name">
        <v-col>
          <v-text-field 
            label="Existencia" 
            id="existencia" 
            autocomplete="off" 
            placeholder=""
            v-model="productForm.existencia" 
            density="compact" 
            readonly 
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>

      <!-- Action Buttons -->
      <v-row dense v-if="productForm.name">
        <v-col>
          <v-btn 
            @click="$emit('abrirExistencias')" 
            density="compact" 
            prepend-icon="mdi-eye" 
            variant="text"
          >
            Existencias
          </v-btn>
        </v-col>
        <v-col>
          <v-btn 
            @click="$emit('enviarArticulo')" 
            density="compact" 
            prepend-icon="mdi-arrow-right-bold" 
            class="mr-1"
            color="primary"
          >
            Agregar
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

const { mdAndDown } = useDisplay()

const props = defineProps({
  codigo: {
    type: String,
    default: ''
  },
  productForm: {
    type: Object,
    required: true
  },
  almacen: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'goPrimerArticulo',
  'searchProduct',
  'abrirModalBuscaProductsNombre',
  'emptyValues',
  'enviarArticulo',
  'abrirExistencias',
  'update:codigo'
])
// Expose focus method for keyboard shortcuts and clear method
const focusCodigo = () => {
  if (codigoRef?.value?.focus) {
    codigoRef.value.focus()
    codigoRef.value.select()
  }
}

const codigoRef = ref(null)
const localCodigo = ref(props.codigo)

// Sync local codigo with prop changes
watch(
  () => props.codigo,
  (newVal) => {
    localCodigo.value = newVal
  }
)

// Emit changes back to parent
watch(localCodigo, (newVal) => {
  emit('update:codigo', newVal)
})

// Expose ref for parent to access
defineExpose({
  codigoRef,
  focusCodigo
})
</script>

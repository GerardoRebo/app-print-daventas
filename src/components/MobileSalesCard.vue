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

      <!-- Cantidad -->
      <v-row dense v-if="productForm.name">
        <v-col cols="4">
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
        <v-col cols="4" v-if="productForm.usa_medidas">
          <v-text-field 
            label="Ancho" 
            autocomplete="off" 
            placeholder="Ancho" 
            @keydown.stop.enter="$emit('enviarArticulo')"
            v-model="productForm.ancho" 
            density="compact" 
            variant="outlined" 
            hide-details 
          />
        </v-col>
        <v-col cols="4" v-if="productForm.usa_medidas">
          <v-text-field 
            label="Alto" 
            autocomplete="off" 
            placeholder="Alto" 
            @keydown.stop.enter="$emit('enviarArticulo')"
            v-model="productForm.alto" 
            density="compact" 
            variant="outlined" 
            hide-details 
          />
        </v-col>
        <v-col :cols="priceOptions?.length > 1 ? 8 : 4">
          <v-text-field 
            label="Precio" 
            id="precio" 
            type="number" 
            autocomplete="off"
            :append-icon="priceOptions?.length > 1 ? 'mdi-dots-vertical-circle-outline' : ''" 
            @click:append="$emit('showPrices')"
            @keydown.stop.enter="$emit('enviarArticulo')" 
            v-model="productForm.pventa" 
            hide-details 
            class="mr-1" 
          />
        </v-col>
        <v-col :cols="priceOptions?.length > 1 ? 12 : 4">
          <v-text-field 
            label="Existencia" 
            id="existencia" 
            autocomplete="off" 
            placeholder=""
            v-model="productForm.existencia" 
            density="compact" 
            readonly 
            variant="outlined" 
          />
        </v-col>
        <v-spacer />
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
            variant="elevated"
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
  },
  priceOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'goPrimerArticulo',
  'searchProduct',
  'abrirModalBuscaProductsNombre',
  'emptyValues',
  'enviarArticulo',
  'abrirExistencias',
  'showPrices',
  'update:codigo'
])

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

// Expose methods and refs for parent to access
const focusCodigo = () => {
  
  if (codigoRef.value?.focus) {
    codigoRef.value.focus()
    codigoRef.value.select()
  }
}

const clearFields = () => {
  localCodigo.value = ''
}

defineExpose({
  codigoRef,
  focusCodigo,
  clearFields
})
</script>

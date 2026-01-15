<template>
  <v-container fluid class="py-0 mt-2">
    <v-card class="">
      <v-container fluid>
        <!-- Top Row: Action Buttons and Movement Info -->
        <v-row dense class="mb-2" align="center">
          <v-btn @click="$emit('setPendiente')" size="small" class="mx-2" prepend-icon="mdi-sort-clock-ascending"
            variant="tonal">
            Pendiente
          </v-btn>
          <v-btn @click="$emit('abrirPendiente')" size="small" class="mx-2" prepend-icon="mdi-file-clock"
            variant="tonal">
            Pendientes
          </v-btn>
          <v-btn v-if="movimientoActual.tipo == 'C'" class="mx-2" prepend-icon="mdi-account-multiple"
            @click="$emit('abrirProveedor')" size="small" variant="tonal">
            Proveedor
          </v-btn>
          <v-btn v-if="movimientoActual.tipo == 'C'" class="mx-2" prepend-icon="mdi-numeric"
            @click="$emit('abrirFolioFactura')" size="small" variant="tonal">
            Folio Factura
          </v-btn>
          <v-select v-if="movimientoActual.tipo == null" @update:modelValue="$emit('setMovimiento', $event)" :items="[
            { value: 'C', title: 'Compra' },
            { value: 'T', title: 'Transferencia' },
            { value: 'S', title: 'Solicitud Transferencia' },
          ]" v-model="movimientoActual.tipo" label="Tipo Movimiento" id="tipomovimiento" hide-details max-width="200"
            class="mx-2 highlighted-select"></v-select>
          <v-select v-if="
            movimientoActual.almacenOrigenId == null &&
            movimientoActual.tipo != null
          " v-model="almacen.id" :items="almacenItems" label="Almacen Origen" id="almacen" hide-details class="mx-2"
            max-width="300"></v-select>
          <v-select v-if="visibleAlmacenDestino" v-model="almacenDestino.id" :items="destinoAlmacenItems"
            label="Almacen Destino" id="almacenDestino" hide-details class="mx-2" max-width="300"></v-select>
          <v-btn variant="tonal" color="secondary" class="highlighted-select" v-if="
            movimientoActual.almacenOrigenId == null &&
            movimientoActual.tipo != null
          " @click="$emit('asignarAlmacen')" small>
            Asignar
          </v-btn>

          <!-- Movement Info Display -->
          <div class="d-flex justify-space-around">
            <p class="mx-2">Folio:<strong> {{ movimientoActual.consecutivo }} </strong></p>
            <p v-if="movimientoActual.tipo == 'T'" class="mx-2">
              Tipo de Movimiento:
              <strong>
                Transferencia
              </strong>
            </p>
            <p v-if="movimientoActual.tipo == 'S'" class="mx-2">
              Tipo de Movimiento:
              <strong>
                Solicitud Transferencia
              </strong>
            </p>
            <p v-else-if="movimientoActual.tipo == 'C'" class="mx-2">
              Tipo de Movimiento:
              <strong>
                Compra
              </strong>
            </p>
            <p v-if="movimientoActual.tipo == 'C'" class="mx-2">
              Proveedor: <strong> {{ proveedor }}</strong>
            </p>
            <p class="mx-2">
              Almacen Origen: <strong> {{ movimientoActual.miAlmacenOrigenName }}</strong>
            </p>
            <p v-if="movimientoActual.tipo != 'C'" class="mx-2">
              Almacen Destino: <strong> {{ movimientoActual.miAlmacenDestinoName }}</strong>
            </p>
            <p v-if="movimientoActual.tipo == 'C' && movimientoActual.factura_uuid" class="mx-2">
              Folio Factura Proveedor: <strong> {{ movimientoActual.factura_uuid }}</strong>
            </p>
          </div>
          <v-progress-circular color="primary" indeterminate v-if="loading" size="small"></v-progress-circular>
        </v-row>

        <!-- Product Search Row -->
        <v-row dense class="mb-2">
          <v-col>
            <v-text-field label="Codigo" placeholder="Codigo + Enter" @keydown.right.prevent="$emit('goPrimerArticulo')"
              @keydown.enter="$emit('searchProduct')" :modelValue="codigo"
              @update:modelValue="$emit('update:codigo', $event)" hide-details autocomplete="password"
              ref="codigoRef" />
          </v-col>
          <v-col>
            <v-text-field label="Nombre" id="name" autocomplete="off" readonly hide-details
              v-model="productForm.name" />
          </v-col>
          <v-col cols="1">
            <v-text-field label="Cantidad" id="cantidad" autocomplete="off"
              @keydown.stop.enter="$emit('enviarArticulo')" v-model="productForm.cantidad" hide-details type="number" />
          </v-col>
          <v-col cols="1">
            <v-text-field label="Costo" id="costo" autocomplete="off" @keydown.stop.enter="$emit('enviarArticulo')"
              v-model="productForm.pcosto" hide-details />
          </v-col>
          <v-col cols="1">
            <v-text-field label="Existencia" id="existencia" autocomplete="off" v-model="productForm.existencia"
              readonly hide-details />
          </v-col>
          <v-col cols="1" class="ml-4">
            <v-btn :disabled="!(almacen.id && productForm.name) || loading" @click="$emit('enviarArticulo')"
              prepend-icon="mdi-arrow-right-bold" variant="tonal" color="secondary">Agregar
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col cols="1">
            <v-btn @click="$emit('abrirModalBuscaProductsNombre')" prepend-icon="mdi-magnify" color="primary"
              variant="outlined">Buscar
            </v-btn>
          </v-col>
          <v-col cols="1">
            <v-btn :disabled="!(almacen.id && productForm.name)" @click="$emit('abrirExistencias')"
              prepend-icon="mdi-eye" color="secondary" variant="outlined">Ver
            </v-btn>
          </v-col>
        </v-row>

        <!-- Save Row -->
        <v-row dense>
          <v-col cols="1">
            <v-btn @click="$emit('borrarTicket')" prepend-icon="mdi-trash-can">
              Borrar
            </v-btn>
          </v-col>
          <v-col cols="1">
            <v-btn @click="$emit('guardar', 'ambos')" v-if="mostrarGuardar" variant="elevated" color="primary"
              prepend-icon="mdi-truck">Guardar
            </v-btn>
          </v-col>
          <v-col cols="1">
            <div>
              <label class="text-xs"> SubTotal: </label>
              <p class="font-weight-bold">${{ formatNumber(subtotalComputed) }}</p>
            </div>
          </v-col>
          <v-col cols="1">
            <div>
              <label class="text-xs"> Descuento: </label>
              <p class="font-weight-bold">${{ 0 }}</p>
            </div>
          </v-col>
          <v-col cols="1">
            <div>
              <label class="text-xs"> Impuesto: </label>
              <p class="font-weight-bold">${{ formatNumber(impuestoComputed) }}</p>
            </div>
          </v-col>
          <v-col cols="1">
            <p class="font-weight-bold text-primary text-h6">Total: ${{ formatNumber(totalComputed) }}</p>
          </v-col>
          <v-spacer />
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useCurrency } from '@js/composables/useCurrency'

const { formatNumber } = useCurrency('es-MX', 'MXN')

const props = defineProps({
  movimientoActual: {
    type: Object,
    required: true
  },
  almacen: {
    type: Object,
    required: true
  },
  almacenDestino: {
    type: Object,
    required: true
  },
  codigo: {
    type: String,
    required: true
  },
  productForm: {
    type: Object,
    required: true
  },
  almacenItems: {
    type: Array,
    default: () => []
  },
  destinoAlmacenItems: {
    type: Array,
    default: () => []
  },
  articulos: {
    type: Array,
    default: () => []
  },
  subtotalComputed: {
    type: [Number, String],
    default: 0
  },
  impuestoComputed: {
    type: [Number, String],
    default: 0
  },
  totalComputed: {
    type: [Number, String],
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  visibleAlmacenDestino: {
    type: Boolean,
    default: false
  },
  mostrarGuardar: {
    type: Boolean,
    default: true
  },
  proveedor: {
    type: String,
    default: ''
  }
})
// Ref for codigo input
const codigoRef = ref(null);

// Expose focus method for keyboard shortcuts and clear method
const focusCodigo = async () => {
  await nextTick();
  if (codigoRef?.value?.focus) {
    codigoRef.value.focus()
    codigoRef.value.select()
  }
}

// Expose ref for parent to access
defineExpose({
  codigoRef,
  focusCodigo
})


const emit = defineEmits([
  'setPendiente',
  'abrirPendiente',
  'abrirProveedor',
  'abrirFolioFactura',
  'setMovimiento',
  'asignarAlmacen',
  'goPrimerArticulo',
  'searchProduct',
  'enviarArticulo',
  'abrirModalBuscaProductsNombre',
  'abrirExistencias',
  'borrarTicket',
  'guardar',
  'update:codigo'
])
</script>

<template>
  <v-container fluid class="py-0 mt-2">
    <v-card class="">
      <v-container fluid>
        <!-- Top Row: Action Buttons and Ticket Info -->
        <v-row dense class="mb-2" align="center">
          <v-btn @click="$emit('setPendiente')" size="small" class="mx-2" prepend-icon="mdi-sort-clock-ascending"
            variant="tonal">
            Pendiente
          </v-btn>
          <v-btn @click="$emit('abrirPendiente')" size="small" class="mx-2" prepend-icon="mdi-file-clock"
            variant="tonal">
            Tickets Pendientes
          </v-btn>
          <v-btn @click="$emit('abrirCliente')" size="small" class="mx-2" prepend-icon="mdi-account-multiple"
            variant="tonal">
            Clientes
          </v-btn>
          <v-btn v-if="showOffline" @click="$emit('goOffline')" class="mx-2" variant="tonal">Offline
          </v-btn>
          <v-btn @click="$emit('copyLinkToClipBoard')" size="small" class="mx-2" prepend-icon="mdi-link"
            variant="tonal">Mi
            Tienda
          </v-btn>
          <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" size="small" class="mx-2" append-icon="mdi-chevron-down" variant="tonal">Ultimo
                ticket
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="$emit('openLastTicket')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-eye"></v-icon>
                </template>
                <v-list-item-title>Ver</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('printLastTicket')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-printer-pos"></v-icon>
                </template>
                <v-list-item-title>Imprimir</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn class="mx-2" prepend-icon="mdi-calendar-range" @click="$emit('openFechaEntrega')" size="small">
            Fecha entrega
          </v-btn>
          <v-btn size="small" class="mx-2" append-icon="mdi-keyboard" variant="tonal"
            @click="$emit('showShortcuts')">Atajos</v-btn>

          <v-select :items="almacenItems" v-if="ticketActual.miAlmacenId == null" label="Almacenes"
            @update:modelValue="$emit('asignarAlmacen', $event)" max-width="300" hide-details :active="true"
            class="highlighted-select"></v-select>

          <!-- Ticket Info Display -->
          <div class="d-flex justify-space-around">
            <p class="mx-2"><strong>Folio:</strong> {{ ticketActual.consecutivo }}</p>
            <p v-if="ticketActual.cliente" class="mx-2">
              <strong>Cliente:</strong> {{ ticketActual.cliente }}
            </p>
            <p v-if="ticketActual.miAlmacenName" class="mx-2">
              <strong>Almacen:</strong> {{ ticketActual.miAlmacenName }}
            </p>
            <p v-if="ticketActual.fecha_entrega" class="mx-2">
              <strong>Entrega:</strong> {{ formatDeliveryDate(ticketActual.fecha_entrega) }}
            </p>
            <p v-if="ticketActual.nombre" class="mx-2">
              <strong>Nombre Ticket:</strong> {{ ticketActual.nombre }}
            </p>
          </div>
          <v-progress-circular color="primary" indeterminate v-if="loading" size="small"></v-progress-circular>
        </v-row>

        <!-- Product Search Row -->
        <v-row dense class="mb-2">
          <v-col>
            <v-text-field label="Codigo" placeholder="Codigo + Enter" @keydown.right.prevent="$emit('goPrimerArticulo')"
              @keydown.enter="handleSearchProduct" v-model="localCodigo" hide-details autocomplete="password"
              ref="codigoRef" />
          </v-col>
          <v-col>
            <v-tooltip :text="productForm.name" location="top" v-if="productForm.name">
              <template v-slot:activator="{ props }">
                <v-text-field label="Nombre" id="name" autocomplete="off" placeholder="" readonly hide-details
                  v-model="productForm.name" v-bind="props" />
              </template>
            </v-tooltip>
            <v-text-field v-else label="Nombre" id="name" autocomplete="off" placeholder="" readonly hide-details
              v-model="productForm.name" />
          </v-col>
          <v-col cols="1">
            <v-text-field label="Cantidad" id="cantidad" autocomplete="off" placeholder="Cantidad"
              @keydown.stop.enter="$emit('enviarArticulo')" v-model="productForm.cantidad" hide-details type="number" />
          </v-col>
          <v-col cols="1" v-if="productForm.usa_medidas">
            <v-text-field label="Ancho" autocomplete="off" placeholder="Ancho"
              @keydown.stop.enter="$emit('enviarArticulo')" v-model="productForm.ancho" hide-details type="number" />
          </v-col>
          <v-col cols="1" v-if="productForm.usa_medidas">
            <v-text-field label="Alto" autocomplete="off" placeholder="Alto"
              @keydown.stop.enter="$emit('enviarArticulo')" v-model="productForm.alto" hide-details type="number" />
          </v-col>
          <v-col :cols="priceOptions?.length > 1 ? 2 : 1">
            <v-text-field label="Precio" id="precio" type="number" autocomplete="off"
              :append-icon="priceOptions?.length > 1 ? 'mdi-dots-vertical-circle-outline' : ''"
              @click:append="$emit('showPrices')" @keydown.stop.enter="handlePrecioEnter($event)"
              v-model="productForm.pventa" hide-details class="mr-1" />
          </v-col>
          <v-col cols="1" class="d-flex align-center gap-1">
            <v-text-field label="Existencia" id="existencia" autocomplete="off" placeholder=""
              v-model="productForm.existencia" readonly hide-details class="flex-grow-1" />
            <v-tooltip v-if="+productForm.cantidad_apartado" bottom>
              <template v-slot:activator="{ props }">
                <v-icon size="x-small" color="warning" v-bind="props" class="flex-shrink-0">mdi-alert-circle</v-icon>
              </template>
              <span>Hay {{ productForm.cantidad_apartado }} unidades apartadas</span>
            </v-tooltip>
          </v-col>
          <v-col cols="1" class="ml-4">
            <v-btn :disabled="!(almacen.id && productForm.name) || loading" @click="$emit('enviarArticulo')"
              prepend-icon="mdi-arrow-right-bold" variant="tonal" color="secondary">Agregar
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col cols="1">
            <v-btn @click="$emit('abrirModalBuscaProductsNombre')" prepend-icon="mdi-magnify" variant="outlined"
              color="primary">Buscar
            </v-btn>
          </v-col>
          <v-col cols="1">
            <v-btn :disabled="!(almacen.id && productForm.name)" @click="$emit('abrirExistencias')"
              prepend-icon="mdi-eye" variant="outlined" color="secondary">Ver
            </v-btn>
          </v-col>
        </v-row>

        <!-- Checkout Row -->
        <v-row dense align="center">
          <v-col cols="auto">
            <v-btn @click="$emit('borrarTicket')" prepend-icon="mdi-trash-can" hide-details variant="text"
              size="default">
              Borrar
            </v-btn>
          </v-col>
          <v-col cols="auto" class="mr-10">
            <v-btn @click="$emit('actionButtonClick')" class="white-text" color="primary" variant="flat"
              :append-icon="actionButtonIcon" :disabled="!articulos.length" size="default">{{ actionButtonLabel }}
            </v-btn>
          </v-col>
          <v-col cols="auto" class="mr-8">
            <v-text-field label="Nombra ticket" id="nombreT" autocomplete="off" placeholder="Nombra Ticket + Enter"
              min-width="200" density="compact" @keydown.stop.enter="$emit('setNombreTicket', nombreT); nombreT = ''"
              v-model="nombreT" hide-details />
          </v-col>
          <!-- Desglosar Impuesto: True -->
          <template v-if="desglosarImpuesto">
            <v-col cols="auto" class="text-right pr-2">
              <label class="text-xs text-grey-darken-1"> SubTotal: </label>
              <p class="font-weight-bold ma-0">${{ formatNumber(subtotalComputed) }}</p>
            </v-col>
            <v-divider vertical class="mr-4" />
            <v-col cols="auto" class="text-right pr-2">
              <label class="text-xs text-grey-darken-1"> Descuento: </label>
              <p class="font-weight-bold ma-0">${{ formatNumber(descuentoComputed) }}</p>
            </v-col>
            <v-divider vertical class="mr-4" />
            <v-col cols="auto" class="text-right pr-2">
              <label class="text-xs text-grey-darken-1"> Impuesto: </label>
              <p class="font-weight-bold ma-0">${{ formatNumber(impuestoComputed) }}</p>
            </v-col>
          </template>

          <!-- Desglosar Impuesto: False -->
          <template v-else>
            <v-col cols="auto" class="text-right pr-2">
              <label class="text-xs text-grey-darken-1"> SubTotal: </label>
              <p class="font-weight-bold ma-0">${{ formatNumber(Number(subtotalComputed) + Number(impuestoComputed)) }}
              </p>
            </v-col>
            <v-divider vertical class="mr-4" />
            <v-col cols="auto" class="text-right pr-2">
              <label class="text-xs text-grey-darken-1"> Descuento: </label>
              <p class="font-weight-bold ma-0">${{ formatNumber(descuentoComputed) }}</p>
            </v-col>
          </template>
          <v-divider vertical class="mr-4" />
          <v-col cols="auto" class="text-right pr-2">
            <label class="text-xs text-grey-darken-1"> Total: </label>
            <p class="font-weight-bold text-primary text-h6 ma-0">${{ formatNumber(totalComputed) }}</p>
          </v-col>
          <v-spacer />
          <v-checkbox label="Desglosar impuesto" v-model="desglosarImpuesto"
            @change="$emit('update:desglosarImpuesto', desglosarImpuesto)" class="mx-4" hide-details />
          <v-checkbox label="Apartar productos" v-model="apartarProductos"
            @change="$emit('update:apartarProductos', apartarProductos)" class="mx-4" hide-details />
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useCurrency } from '@js/composables/useCurrency'

const { formatNumber } = useCurrency('es-MX', 'MXN')

// Props
const props = defineProps({
  ticketActual: {
    type: Object,
    required: true
  },
  almacen: {
    type: Object,
    required: true
  },
  productForm: {
    type: Object,
    required: true
  },
  priceOptions: {
    type: Array,
    default: () => []
  },
  almacenItems: {
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
  descuentoComputed: {
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
  showOffline: {
    type: Boolean,
    default: false
  },
  codigo: {
    type: String,
    default: ''
  },
  nombreT: {
    type: String,
    default: ''
  },
  actionButtonLabel: {
    type: String,
    default: 'Cobrar'
  },
  actionButtonIcon: {
    type: String,
    default: 'mdi-currency-usd'
  },
  desglosarImpuesto: {
    type: Boolean,
    default: false
  },
  apartarProductos: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'setPendiente',
  'abrirPendiente',
  'abrirCliente',
  'goOffline',
  'copyLinkToClipBoard',
  'openLastTicket',
  'printLastTicket',
  'openFechaEntrega',
  'showShortcuts',
  'asignarAlmacen',
  'goPrimerArticulo',
  'enviarArticulo',
  'abrirModalBuscaProductsNombre',
  'borrarTicket',
  'actionButtonClick',
  'setNombreTicket',
  'abrirExistencias',
  'searchProduct',
  'showPrices',
  'update:codigo',
  'update:desglosarImpuesto',
  'update:apartarProductos'
])

// Local state synced with props
const localCodigo = ref('')
const nombreT = ref('')
const desglosarImpuesto = ref(false)
const apartarProductos = ref(false)
watch(() => props.codigo, (newVal) => {
  localCodigo.value = newVal
}, { immediate: true })

watch(localCodigo, (newVal) => {
  emit('update:codigo', newVal)
  // Emit to parent if needed
})

watch(() => props.nombreT, (newVal) => {
  nombreT.value = newVal
}, { immediate: true })

watch(() => props.apartarProductos, (newVal) => {
  apartarProductos.value = newVal
}, { immediate: true })

// Ref for codigo input
const codigoRef = ref(null);

// Handle search product with codigo value
const handleSearchProduct = () => {
  if (!localCodigo.value.trim()) {
    // notify.warning('Ingresa un código')
    return
  }
  emit('searchProduct', localCodigo.value)
}

// Handle precio input enter key - check if focus is on append icon or input
const handlePrecioEnter = (event) => {
  const target = event.target
  // Check if the focused element is the append-icon button
  if (target.className.includes('v-input__append') || target.closest('.v-input__append')) {
    emit('showPrices')
  } else {
    emit('enviarArticulo')
  }
}

const formatDeliveryDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-MX')
}

// Expose focus method for keyboard shortcuts and clear method
const focusCodigo = async () => {
  await nextTick();
  if (codigoRef.value?.focus) {
    codigoRef.value.focus()
    codigoRef.value.select()
  }
}

const clearFields = () => {
  localCodigo.value = ''
  nombreT.value = ''
}

defineExpose({
  focusCodigo,
  clearFields,
  codigoRef
})
</script>

<style scoped>
.highlighted-select {
  animation: pulse 1.5s infinite;
  border-radius: 8px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(56, 155, 242, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(16, 37, 64, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(13, 13, 13, 0);
  }
}
</style>

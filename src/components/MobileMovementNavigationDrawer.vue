<template>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    :location="$vuetify.display.mobile ? 'bottom' : undefined" 
    temporary
  >
    <v-card v-if="mdAndDown">
      <v-container>
        <!-- Action Buttons -->
        <v-row class="mb-3">
          <v-btn 
            @click="$emit('guardar')" 
            v-if="mostrarGuardar" 
            color="primary" 
            block 
            class="mb-3"
            prepend-icon="mdi-check"
          >
            Guardar
          </v-btn>
          <v-btn 
            @click="$emit('borrarTicket')" 
            color="" 
            prepend-icon="mdi-trash-can" 
            block 
            class="mb-3"
          >
            Borrar
          </v-btn>
          
          <!-- Options Menu -->
          <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn 
                color="" 
                v-bind="props" 
                block 
                append-icon="mdi-menu-down"
              >
                Opciones
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click="$emit('setPendiente')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-sort-clock-ascending"></v-icon>
                </template>
                <v-list-item-title>Pendiente</v-list-item-title>
              </v-list-item>
              
              <v-list-item @click="$emit('abrirPendiente')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-clock"></v-icon>
                </template>
                <v-list-item-title>Tickets Pendientes</v-list-item-title>
              </v-list-item>
              
              <v-list-item v-if="movimientoActual.tipo === 'C'" @click="$emit('abrirProveedor')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-multiple"></v-icon>
                </template>
                <v-list-item-title>Proveedores</v-list-item-title>
              </v-list-item>

              <v-list-item v-if="movimientoActual.tipo !== 'C'" @click="$emit('abrirFolioFactura')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-document"></v-icon>
                </template>
                <v-list-item-title>Folio Factura</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>

        <!-- Movement Type Selection -->
        <v-select 
          v-if="movimientoActual.tipo == null" 
          @update:modelValue="$emit('setMovimiento', $event)"
          :items="[
            { value: 'C', title: 'Compra' },
            { value: 'T', title: 'Transferencia' },
            { value: 'S', title: 'Solicitud Transferencia' },
          ]" 
          :model-value="movimientoActual.tipo" 
          label="Tipo Movimiento" 
          density="compact" 
          id="tipomovimiento"
        />

        <!-- Almacen Selection -->
        <v-select 
          v-if="movimientoActual.almacenOrigenId == null && movimientoActual.tipo != null"
          :model-value="almacen.id"
          @update:modelValue="$emit('update:almacen', { ...almacen, id: $event })"
          :items="almacenItems" 
          label="Almacen Origen" 
          density="compact" 
          id="almacen"
        />

        <!-- Almacen Destino Selection -->
        <v-select 
          v-if="visibleAlmacenDestino" 
          :model-value="almacenDestino.id"
          @update:modelValue="$emit('update:almacenDestino', { ...almacenDestino, id: $event })"
          :items="destinoAlmacenItems"
          label="Almacen Destino" 
          density="compact" 
          id="almacenDestino"
        />

        <!-- Assign Button -->
        <v-btn 
          color="primary" 
          v-if="movimientoActual.almacenOrigenId == null && movimientoActual.tipo != null"
          @click="$emit('asignarAlmacen')" 
          small
        >
          Asignar
        </v-btn>

        <!-- Movement Info -->
        <div class="d-flex flex-column justify-center mb-1">
          <p><strong>Folio:</strong> {{ movimientoActual.consecutivo }}</p>
          
          <p v-if="movimientoActual.tipo === 'T'">
            <strong>Tipo de Movimiento:</strong> Transferencia
          </p>
          <p v-else-if="movimientoActual.tipo === 'S'">
            <strong>Tipo de Movimiento:</strong> Solicitud Transferencia
          </p>
          <p v-else-if="movimientoActual.tipo === 'C'">
            <strong>Tipo de Movimiento:</strong> Compra
          </p>
          
          <p v-if="movimientoActual.tipo === 'C'">
            <strong>Proveedor:</strong> {{ proveedor }}
          </p>
          
          <p>
            <strong>Almacen Origen:</strong> {{ movimientoActual.miAlmacenOrigenName }}
          </p>
          
          <p v-if="movimientoActual.tipo !== 'C'">
            <strong>Almacen Destino:</strong> {{ movimientoActual.miAlmacenDestinoName }}
          </p>
          
          <p v-if="movimientoActual.tipo !== 'C' && movimientoActual.factura_uuid" class="mx-2">
            <strong>Folio Factura Proveedor:</strong> {{ movimientoActual.factura_uuid }}
          </p>
        </div>

        <v-divider></v-divider>

        <!-- Summary Section -->
        <p class="font-semibold">
          <span class="font-weight-medium">SubTotal:</span> ${{ formatNumber(subtotalComputed) }}
        </p>
        <p class="font-semibold">
          <span class="font-weight-medium">Descuento:</span> $0
        </p>
        <p class="font-semibold">
          <span class="font-weight-medium">Impuesto:</span> ${{ formatNumber(impuestoComputed) }}
        </p>
        
        <v-divider></v-divider>
        
        <p class="text-h6 text-secondary">
          <span class="font-weight-bold">Total: </span> ${{ formatNumber(totalComputed) }}
        </p>
      </v-container>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { useDisplay } from 'vuetify';
import { useCurrency } from '@js/composables/useCurrency';

const { mdAndDown } = useDisplay();
const { formatNumber } = useCurrency('es-MX', 'MXN');

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  mostrarGuardar: {
    type: Boolean,
    default: true
  },
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
  almacenItems: {
    type: Array,
    required: true
  },
  destinoAlmacenItems: {
    type: Array,
    required: true
  },
  visibleAlmacenDestino: {
    type: Boolean,
    default: false
  },
  subtotalComputed: {
    type: [String, Number],
    required: true
  },
  impuestoComputed: {
    type: [String, Number],
    required: true
  },
  totalComputed: {
    type: [String, Number],
    required: true
  },
  proveedor: {
    type: String,
    default: ''
  }
});

defineEmits([
  'update:modelValue',
  'update:almacen',
  'update:almacenDestino',
  'guardar',
  'borrarTicket',
  'setPendiente',
  'abrirPendiente',
  'abrirProveedor',
  'abrirFolioFactura',
  'setMovimiento',
  'asignarAlmacen'
]);
</script>

<style scoped>
</style>

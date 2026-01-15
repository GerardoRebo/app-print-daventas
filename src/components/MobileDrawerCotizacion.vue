<template>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
    :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
    <v-card v-if="mdAndDown">
      <v-container>
        <v-row class="mb-3">
          <v-btn @click="$emit('guardarVenta')" color="primary" block variant="elevated" prepend-icon="mdi-cash-register"
            class="mb-3">Guardar
          </v-btn>
          <v-btn @click="$emit('borrarTicket')" variant="tonal" prepend-icon="mdi-trash-can" block class="mb-3">
            Borrar
          </v-btn>
          <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn variant="tonal" v-bind="props" block append-icon="mdi-menu-down">
                Opciones
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="$emit('setPendiente')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-sort-clock-ascending"></v-icon>
                </template>
                <v-list-item-title>
                  Pendiente</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('abrirPendiente')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-clock"></v-icon>
                </template>
                <v-list-item-title>
                  Tickets Pendientes</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('abrirCliente')">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-multiple"></v-icon>
                </template>
                <v-list-item-title>
                  Clientes</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>
        <v-select :items="almacenItems" v-if="ticketActual.miAlmacenId == null" label="Almacenes" density="compact"
          @update:modelValue="$emit('asignarAlmacen', $event)"></v-select>
        <v-row no-gutters>
          <v-col cols="6">
            <p>Folio: {{ ticketActual.consecutivo }}</p>
          </v-col>
          <v-col cols="6" v-if="ticketActual.cliente">
            <p>Cliente: {{ ticketActual.cliente }}</p>
          </v-col>
          <v-col cols="6" v-if="ticketActual.miAlmacenName">
            <p>Almacen: {{ ticketActual.miAlmacenName }}</p>
          </v-col>
          <v-col cols="6" v-if="ticketActual.nombre">
            <p>Nombre Ticket: {{ ticketActual.nombre }}</p>
          </v-col>
        </v-row>

        <v-divider></v-divider>
        <p class="font-semibold">
          <span class="font-weight-medium">SubTotal:</span> ${{ subtotalComputed }}
        </p>
        <p class="font-semibold">
          <span class="font-weight-medium">Descuento:</span> ${{ descuentoComputed }}
        </p>
        <p class="font-semibold">
          <span class="font-weight-medium">Impuesto:</span> ${{ impuestoComputed }}
        </p>
        <v-divider></v-divider>
        <p class="text-h6 text-secondary">
          <span class="font-weight-bold">Total: </span> ${{ totalComputed }}
        </p>
      </v-container>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { useDisplay } from 'vuetify';

const { mdAndDown } = useDisplay();

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  ticketActual: {
    type: Object,
    required: true
  },
  almacenItems: {
    type: Array,
    required: true
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
  }
});

defineEmits([
  'update:modelValue',
  'guardarVenta',
  'borrarTicket',
  'setPendiente',
  'abrirPendiente',
  'abrirCliente',
  'asignarAlmacen'
]);
</script>

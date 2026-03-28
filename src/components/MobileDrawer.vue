<template>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
    :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
    <v-card v-if="mdAndDown">
      <v-container>
        <v-row class="mb-3">
          <v-btn @click="$emit('abrirCobrarModal')" color="primary" block variant="elevated" prepend-icon="mdi-currency-usd"
            class="mb-3">Cobrar
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
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-sort-clock-ascending"></v-icon>
                </template>
                <v-list-item-title @click="$emit('setPendiente')">
                  Pendiente</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-clock"></v-icon>
                </template>
                <v-list-item-title @click="$emit('abrirPendiente')">
                  Tickets Pendientes</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-multiple"></v-icon>
                </template>
                <v-list-item-title @click="$emit('abrirCliente')">
                  Clientes</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="showOffline">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-multiple"></v-icon>
                </template>
                <v-list-item-title @click="$emit('goOffline')">
                  Offline</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-link"></v-icon>
                </template>
                <v-list-item-title @click="$emit('copyLinkToClipBoard')">
                  Mi Tienda</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-receipt-text</v-icon>
                </template>
                <v-list-item-title>
                  <v-menu transition="scale-transition">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" size="small" variant="tonal" append-icon="mdi-chevron-down">
                        Último ticket
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
                </v-list-item-title>
              </v-list-item>
              <!-- <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-keyboard"></v-icon>
                </template>
                <v-list-item-title @click="$emit('showShortcuts')">
                  Atajos</v-list-item-title>
              </v-list-item> -->
            </v-list>
          </v-menu>
        </v-row>
        <v-select :items="almacenItems" v-if="ticketActual.miAlmacenId == null" label="Almacenes"
          @update:modelValue="$emit('asignarAlmacen', $event)"></v-select>
        <!-- setNombreTicket -->
        <v-text-field label="Nombra ticket" id="nombreT" placeholder="Nombra Ticket + Enter"
          @keydown.stop.enter="$emit('setNombreTicket', nombreT)" :model-value="nombreT" @update:model-value="nombreT = $event"
          append-inner-icon="mdi-check-circle"
          @click:append-inner="$emit('setNombreTicket', nombreT)" />
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
        <p class="font-weight-bold">
          <span class="font-weight-medium">SubTotal:</span> ${{
            formatNumber(subtotalComputed)
          }}
        </p>
        <p class="font-weight-bold">
          <span class="font-weight-medium">Descuento:</span> ${{
            formatNumber(descuentoComputed)
          }}
        </p>
        <p class="font-weight-bold">
          <span class="font-weight-medium">Impuesto:</span> ${{
            formatNumber(impuestoComputed)
          }}
        </p>
        <v-divider></v-divider>
        <p class="text-h6 text-primary">
          <span class="font-weight-bold">Total: </span> ${{ formatNumber(totalComputed) }}
        </p>
      </v-container>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useCurrency } from '@js/composables/useCurrency';

const { mdAndDown } = useDisplay();
const { formatNumber } = useCurrency('es-MX', 'MXN');
const nombreT = ref('');

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
  nombreT: {
    type: String,
    default: ''
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
  showOffline: {
    type: Boolean,
    default: false
  }
});

defineEmits([
  'update:modelValue',
  'abrirCobrarModal',
  'borrarTicket',
  'setPendiente',
  'abrirPendiente',
  'abrirCliente',
  'goOffline',
  'copyLinkToClipBoard',
  'openLastTicket',
  'printLastTicket',
  'showShortcuts',
  'asignarAlmacen',
  'setNombreTicket'
]);
</script>

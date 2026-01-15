<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="1200">
    <v-card>
      <v-card-title>Pendientes</v-card-title>
      <v-progress-linear color="primary" indeterminate v-if="loading" />
      <v-card-text>
        <v-data-table 
          :headers="headers" 
          :items="pendingTickets" 
          items-per-page="5"
        >
          <template v-slot:item.consecutivo="{ item }">
            <a 
              href="" 
              class="decoration-none" 
              @keydown.enter.prevent="selectPendient(item.id)"
              @click.prevent="selectPendient(item.id)"
            >
              <span color="primary">{{ item.consecutivo }}</span>
            </a>
          </template>
          <template v-slot:item.cliente="{ item }">
            <span>{{ item.cliente?.name }}</span>
          </template>
          <template v-slot:item.almacen="{ item }">
            <span>{{ item.almacen?.name }}</span>
          </template>
          <template v-slot:item.total="{ item }">
            <span>${{ formatNumber(item.total) }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn 
              prepend-icon="mdi-check" 
              size="small" 
              tabindex="-1" 
              @click="selectPendient(item.id)" 
              color="primary"
            >
              Seleccionar
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { useCurrency } from '@js/composables/useCurrency';

const { formatNumber } = useCurrency('es-MX', 'MXN');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  pendingTickets: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'ticket-selected',
]);

const headers = ref([
  { title: "Folio", key: "consecutivo", align: "start", sortable: false },
  { title: "Nombre", key: "nombre", align: "start", sortable: false },
  { title: "Cliente", key: "cliente", align: "start", sortable: false },
  { title: "Almacén", key: "almacen", align: "start", sortable: false },
  { title: "Total", key: "total", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
]);

function selectPendient(ticketId) {
  emit('ticket-selected', ticketId);
}
</script>

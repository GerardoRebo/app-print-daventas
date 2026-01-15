<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="1200">
    <v-card>
      <v-card-title>Movimientos Pendientes</v-card-title>
      <v-progress-linear color="primary" indeterminate v-if="loading" />
      <v-card-text>
        <v-data-table 
          :headers="headers" 
          :items="pendingMovements" 
          items-per-page="5"
        >
          <template v-slot:item.consecutivo="{ item }">
            <a 
              href="" 
              class="decoration-none" 
              @keydown.enter.prevent="selectMovement(item.id)"
              @click.prevent="selectMovement(item.id)"
            >
              <span color="primary">{{ item.consecutivo }}</span>
            </a>
          </template>
          <template v-slot:item.proveedor="{ item }">
            <span>{{ item.proveedor?.name || '-' }}</span>
          </template>
          <template v-slot:item.almacen_origen="{ item }">
            <span>{{ item.almacen_origen?.name }}</span>
          </template>
          <template v-slot:item.almacen_destino="{ item }">
            <span>{{ item.almacen_destino?.name || '-' }}</span>
          </template>
          <template v-slot:item.total_enviado="{ item }">
            <span>${{ formatNumber(item.total_enviado) }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn 
              prepend-icon="mdi-check" 
              size="small" 
              tabindex="-1" 
              @click="selectMovement(item.id)" 
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
  pendingMovements: {
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
  'movement-selected',
]);

const headers = ref([
  { title: "Folio", key: "consecutivo", align: "start", sortable: false },
  { title: "Proveedor", key: "proveedor", align: "start", sortable: false },
  { title: "Almacén Origen", key: "almacen_origen", align: "start", sortable: false },
  { title: "Almacén Destino", key: "almacen_destino", align: "start", sortable: false },
  { title: "Total", key: "total_enviado", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
]);

function selectMovement(movementId) {
  emit('movement-selected', movementId);
}
</script>

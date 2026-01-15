<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :max-width="isMobile ? '95vw' : '1200'">
    <v-card class="">
      <!-- HEADER -->
      <v-card-title class="d-flex flex-column align-start">
        <span class="text-h6">Seleccionar Cliente</span>

        <!-- Botón para crear cliente -->
        <router-link :to="{ name: 'Clientes' }" class="align-self-end mt-2">
          <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-account-plus">
            Nuevo cliente
          </v-btn>
        </router-link>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <!-- BUSCADOR -->
        <v-text-field
          id="keycliente"
          v-model="localKeyword"
          @input="updateKeyword"
          prepend-inner-icon="mdi-magnify"
          label="Buscar cliente"
          placeholder="Ingresa nombre, teléfono o email"
          variant="outlined"
          density="compact"
          class="mb-4"
          hide-details
        ></v-text-field>

        <!-- LOADING -->
        <v-progress-linear
          color="primary"
          indeterminate
          v-if="loading"
          class="mb-4"
        ></v-progress-linear>

        <!-- TABLA -->
        <v-data-table :headers="visibleHeaders" :items="clients" items-per-page="10" hover density="compact" :height="isMobile ? '40vh' : 'auto'">
          <!-- Nombre clickable -->
          <template #item.name="{ item }">
            <v-btn
              variant="text"
              color="primary"
              class="text-capitalize px-0"
              @click="$emit('client-selected', item.id)"
            >
              {{ item.name }}
            </v-btn>
          </template>

          <!-- Formatos -->
          <template #item.saldo_actual="{ item }">
            <span>${{ formatNumber(item.saldo_actual) }}</span>
          </template>

          <template #item.limite_credito="{ item }">
            <span>${{ formatNumber(item.limite_credito) }}</span>
          </template>

          <!-- Estado CFDI -->
          <template #item.es_apto_para_cfdi="{ item }">
            <v-chip v-if="item.es_apto_para_cfdi" color="success" size="small">
              <v-icon start icon="mdi-check-circle"></v-icon>
              Apto
            </v-chip>
            <v-chip v-else color="warning" size="small">
              <v-icon start icon="mdi-alert-circle"></v-icon>
              Incompleto
            </v-chip>
          </template>

          <!-- Acciones -->
          <template #item.actions="{ item }">
            <v-btn
              color="primary"
              size="small"
              prepend-icon="mdi-check"
              tabindex="-1"
              @click="$emit('client-selected', item.id)"
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
import { defineProps, defineEmits, ref, watch, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useCurrency } from '@js/composables/useCurrency';

const { formatNumber } = useCurrency('es-MX', 'MXN');
const { xs } = useDisplay();
const isMobile = computed(() => xs.value);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  clients: {
    type: Array,
    default: () => [],
  },
  keyword: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'update:keyword',
  'client-selected',
]);

const localKeyword = ref('');

// Sync external keyword prop with local state
watch(() => props.keyword, (newVal) => {
  localKeyword.value = newVal;
}, { immediate: true });

const updateKeyword = (e) => {
  const newKeyword = e.target.value;
  localKeyword.value = newKeyword;
  emit('update:keyword', newKeyword);
};

const headers = [
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  {
    title: 'Saldo Actual',
    key: 'saldo_actual',
    align: 'start',
    sortable: false,
  },
  {
    title: 'Límite de Crédito',
    key: 'limite_credito',
    align: 'start',
    sortable: false,
  },
  { title: 'Teléfono', key: 'telefono', align: 'start', sortable: false },
  { title: 'Email', key: 'email', align: 'start', sortable: false },
  { title: 'Estado CFDI', key: 'es_apto_para_cfdi', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
];

const visibleHeaders = computed(() => {
  if (isMobile.value) {
    // En mobile, mostrar solo: nombre, teléfono, estado CFDI y acciones
    return headers.filter(h => 
      ['name', 'telefono', 'es_apto_para_cfdi', 'actions'].includes(h.key)
    );
  }
  return headers;
});
</script>

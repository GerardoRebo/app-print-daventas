<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="1200">
    <v-card class="">
      <!-- HEADER -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Seleccionar Proveedor</span>

        <!-- Botón para crear proveedor -->
        <router-link :to="{ name: 'Proveedores' }">
          <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-account-plus">
            Nuevo proveedor
          </v-btn>
        </router-link>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <!-- BUSCADOR -->
        <v-text-field
          id="keyproveedor"
          v-model="localKeyword"
          @input="updateKeyword"
          prepend-inner-icon="mdi-magnify"
          label="Buscar proveedor"
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
        <v-data-table :headers="headers" :items="providers" items-per-page="10" hover density="compact">
          <!-- Nombre clickable -->
          <template #item.name="{ item }">
            <v-btn
              variant="text"
              color="primary"
              class="text-capitalize px-0"
              @click="$emit('proveedor-selected', item.id)"
            >
              {{ item.name }}
            </v-btn>
          </template>

          <!-- Teléfono -->
          <template #item.telefono="{ item }">
            <span>{{ item.telefono || '-' }}</span>
          </template>

          <!-- Email -->
          <template #item.email="{ item }">
            <span>{{ item.email || '-' }}</span>
          </template>

          <!-- Acciones -->
          <template #item.actions="{ item }">
            <v-btn
              color="primary"
              size="small"
              prepend-icon="mdi-check"
              tabindex="-1"
              @click="$emit('proveedor-selected', item.id)"
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
import { defineProps, defineEmits, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  providers: {
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
  'proveedor-selected',
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
  { title: 'Teléfono', key: 'telefono', align: 'start', sortable: false },
  { title: 'Email', key: 'email', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
];
</script>

<template>
  <v-card v-if="isContador && contadorOrganizations.length > 0" class="mb-4" outlined>
    <v-card-title class="text-subtitle-2">Consumo de Timbres</v-card-title>
    <v-card-text>
      <p class="text-caption mb-3">Selecciona de qué organización consumir el timbre</p>
      <v-radio-group :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <v-radio 
          :value="null" 
          :label="`Organización actual ${activeOrganizationName} (Timbres: ${saldo ?? 0})`">
        </v-radio>
        <v-radio 
          v-for="org in contadorOrganizations" 
          :key="org.id" 
          :value="org.id"
          :label="`${org.name} (Timbres: ${saldos[org.id] ?? 0})`">
        </v-radio>
      </v-radio-group>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Number,
    default: null
  },
  isContador: {
    type: Boolean,
    default: false
  },
  contadorOrganizations: {
    type: Array,
    default: () => []
  },
  activeOrganizationName: {
    type: String,
    default: ''
  },
  saldo: {
    type: Number,
    default: null
  },
  saldoContador: {
    type: Number,
    default: null
  },
  saldos: {
    type: Object,
    default: () => { return {} }
  }
});

defineEmits(['update:modelValue']);
</script>

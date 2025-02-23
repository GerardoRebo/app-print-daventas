<template>
    <v-snackbar v-model="snackbar.active" :timeout="snackbar.timeout" :color="snackbar.color" :variant="snackbar.variant">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.active = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </template>
  
  <script setup>
  const model = defineModel()
  
  const props = defineProps({
    snackbar: {
      type: Object
    },
  });
  
  const emit = defineEmits(['confirm']);
  
  
  const confirm = () => {
    emit('confirm');
    model.value = false
  };
  </script>
<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:model-value', $event)">
    <v-card>
      <v-card-title>Imágenes</v-card-title>
      <v-card-text>
        <v-carousel>
          <v-carousel-item v-for="image in images" :key="image.id" :src="image.url" cover></v-carousel-item>
        </v-carousel>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="$emit('update:model-value', false)">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  images: {
    type: Array,
    required: true,
  },
});

defineEmits(['update:model-value']);
</script>

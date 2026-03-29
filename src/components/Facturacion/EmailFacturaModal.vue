<template>
  <v-dialog v-model="isOpen" max-width="600">
    <v-card>
      <v-card-title class="text-h6">
        Enviar factura por correo
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-container fluid class="pa-0">
          <div class="text-subtitle-1 mb-2 font-weight-medium">
            De
          </div>

          <v-row dense>
            <v-col cols="12">
              <v-text-field 
                label="Email del remitente" 
                v-model="localEmailData.fromEmail" 
                variant="outlined"
                density="comfortable" 
                :error-messages="errors.fromEmail" 
              />
            </v-col>

            <v-col cols="12">
              <v-text-field 
                label="Nombre del remitente" 
                v-model="localEmailData.fromName" 
                variant="outlined"
                density="comfortable" 
                :error-messages="errors.fromName" 
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="text-subtitle-1 mb-2 font-weight-medium">
            Para
          </div>

          <v-row dense>
            <v-col cols="12">
              <v-text-field 
                label="Email del destinatario" 
                v-model="localEmailData.toEmail" 
                variant="outlined"
                density="comfortable" 
                :error-messages="errors.toEmail" 
              />
            </v-col>

            <v-col cols="12">
              <v-text-field 
                label="Nombre del destinatario" 
                v-model="localEmailData.toName" 
                variant="outlined"
                density="comfortable" 
                :error-messages="errors.toName" 
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn variant="text" :loading="loading" @click="handleClose">
          Cerrar
        </v-btn>

        <v-btn 
          color="primary" 
          variant="flat" 
          :loading="loading" 
          prepend-icon="mdi-email" 
          @click="handleSend"
        >
          Enviar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, watch, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  emailData: {
    type: Object,
    required: true,
    default: () => ({
      fromEmail: '',
      fromName: '',
      toEmail: '',
      toName: '',
    })
  },
  loading: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'send', 'update:emailData']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const localEmailData = ref({ ...props.emailData });

watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    localEmailData.value = { ...props.emailData };
  }
});

const handleClose = () => {
  isOpen.value = false;
};

const handleSend = () => {
  emit('update:emailData', localEmailData.value);
  emit('send', localEmailData.value);
};
</script>

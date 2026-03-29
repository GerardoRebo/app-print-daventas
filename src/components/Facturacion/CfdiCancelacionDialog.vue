<script setup>
import { ref, watch } from 'vue';
import { vMaska } from 'maska/vue';
import { useNotification } from '@js/composables/useNotification';
import { motivosCancelacion } from '@js/utils/cfdiCatalogs';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'cancelar']);

const { notify } = useNotification();

const datoCancelacion = ref({
  motivo: '',
  sustitucion: ''
});

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

const resetForm = () => {
  datoCancelacion.value = {
    motivo: '',
    sustitucion: ''
  };
};

const procederCancelacion = () => {
  if (!datoCancelacion.value.motivo) {
    notify.warning('Debes seleccionar un motivo de cancelación');
    return;
  }

  if (datoCancelacion.value.motivo === '01' && !datoCancelacion.value.sustitucion) {
    notify.warning('Debes proporcionar el UUID de la factura sustitutoria');
    return;
  }

  emit('cancelar', datoCancelacion.value);
};

const cerrarModal = () => {
  emit('update:modelValue', false);
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500px">
    <v-card>
      <v-card-title class="text-warning">
        <v-icon icon="mdi-alert-circle" class="mr-2" />
        Cancelar Factura
      </v-card-title>

      <v-card-text class="pt-4">
        <p class="text-sm mb-4">
          ¿Deseas cancelar esta factura? Esta acción se envía al SAT y no se puede revertir.
        </p>

        <v-form @submit.prevent="procederCancelacion">
          <v-select
            v-model="datoCancelacion.motivo"
            :items="motivosCancelacion"
            item-title="title"
            item-value="value"
            label="Motivo de Cancelación *"
            persistent-hint
            required
          />

          <v-expand-transition>
            <v-text-field
              v-if="datoCancelacion.motivo === '01'"
              v-model="datoCancelacion.sustitucion"
              v-maska="'********-****-****-****-************'"
              label="UUID de Factura Sustitutoria *"
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              hint="Proporciona el UUID de la factura que reemplaza a la cancelada"
              persistent-hint
              required
            />
          </v-expand-transition>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="cerrarModal"  variant="outlined" :disabled="loading">
          No, Mantener
        </v-btn>
        <v-btn @click="procederCancelacion" :loading="loading" color="warning" variant="elevated">
          Sí, Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

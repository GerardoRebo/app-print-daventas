<script setup>
import { ref } from 'vue';
import axios from 'axios';

const currentStep = ref(1);
const showConsumiblesModal = ref(false);
const showCommentsModal = ref(false);

const selectedConsumible = ref(null);
const comments = ref('');
const documents = ref([]);
const consumibles = ref([]);
const getStepColor = (stepKey) =>
  stepKey === currentStep.value ? 'primary' : isComplete(stepKey) ? 'success' : 'grey'
// Determina si un paso ya está completo
const isComplete = (stepKey) => steps.value.findIndex((s) => s.key === stepKey) < currentStep.value
const steps = ref([
  { value: 1, label: 'Pendiente', requiresConsumibles: false },
  { value: 2, label: 'Diseño', requiresConsumibles: false },
  { value: 3, label: 'Producción', requiresConsumibles: true },
  { value: 4, label: 'Acabados', requiresConsumibles: false },
  { value: 5, label: 'Finalizado', requiresConsumibles: false },
]);

const availableConsumibles = ref([
  'Lona', 'Ojillos', 'Pegamento', 'Bastidor',
]);

const openConsumiblesModal = () => {
  showConsumiblesModal.value = true;
};

const openCommentsModal = () => {
  showCommentsModal.value = true;
};

const submitConsumibles = async () => {
  consumibles.value.push(selectedConsumible.value);
  showConsumiblesModal.value = false;
  await updateStep();
};

const submitComments = async () => {
  showCommentsModal.value = false;
  await updateStep();
};

const completeStep = async (step) => {
  await updateStep(step);
  currentStep.value++;
};
const openStep = () => {
  alert('asdf');
}
const updateStep = async (step) => {
  try {
    const payload = {
      status: step.label.toLowerCase(),
      comments: comments.value,
      documents: documents.value,
      consumibles: consumibles.value,
      is_completed: true,
    };

    await axios.post('/api/production/step', payload);
    console.log('Step updated successfully');
  } catch (error) {
    console.error('Error updating step:', error);
  }
};

</script>
<template>
  <v-container>
    <v-stepper v-model="currentStep" editable>
      <v-stepper-header>
        <template v-for="(step, index) in steps" :key="index">
          <v-stepper-item :value="step.value" :complete="step.value < currentStep" @click="openStep(index)"
            :color="getStepColor(step.key)">
            {{ step.label }}
          </v-stepper-item>
          <!-- Línea entre pasos -->
          <v-divider v-if="index < steps.length - 1" :key="'divider-' + index" />
        </template>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item v-for="(step, index) in steps" :key="index" :value="step.value">
          <v-card class="p-4">
            <h3>{{ step.label }}</h3>

            <!-- Botón para abrir el modal -->
            <v-btn v-if="step.requiresConsumibles" color="primary" @click="openConsumiblesModal">
              Agregar Consumibles
            </v-btn>

            <v-btn color="secondary" @click="openCommentsModal(step)">
              Agregar Comentarios/Documentos
            </v-btn>

            <!-- <v-btn :disabled="step.requiresConsumibles && !consumibles.length" color="success"
              @click="completeStep(step)">
              Marcar como Completado
            </v-btn> -->
          </v-card>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>

    <!-- Modal para Consumibles -->
    <v-dialog v-model="showConsumiblesModal" max-width="600px">
      <v-card>
        <v-card-title>Especificar Consumibles</v-card-title>
        <v-card-text>
          <v-select v-model="selectedConsumible" :items="availableConsumibles" label="Selecciona un Consumible" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="submitConsumibles">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para Comentarios/Documentos -->
    <v-dialog v-model="showCommentsModal" max-width="600px">
      <v-card>
        <v-card-title>Agregar Comentarios y Documentos</v-card-title>
        <v-card-text>
          <v-textarea v-model="comments" label="Comentarios" />
          <v-file-input v-model="documents" label="Subir Documentos" multiple />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="submitComments">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

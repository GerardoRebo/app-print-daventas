<script setup>
import { computed, ref } from 'vue';
import axios from 'axios';
import Production from '../../apis/Production';
import { useProcessRequest } from "@js/composables/ProcessRequest";
import { useSnackBar } from "@js/composables/SnackBar";
import DynamicSnack from '../../components/DynamicSnack.vue';
const { processRequest } = useProcessRequest();
const { snackbar, snackSuccess, snackError, snackWarning } = useSnackBar();

const props = defineProps(['order'])
const showConsumiblesModal = ref(false);
const showCommentsModal = ref(false);
const consumibleGenerico = ref({})

const comments = ref('');
const documents = ref([]);
const consumibles = ref([]);
const cargando = ref(false);
const getStepColor = (stepKey) =>
  stepKey === currentStep.value ? 'primary' : isComplete(stepKey) ? 'success' : 'grey'
// Determina si un paso ya está completo
const isComplete = (stepKey) => steps.value.findIndex((s) => s.value === stepKey) < currentStep.value
const steps = ref([
  { value: 1, key: 'pending', label: 'Pendiente', requiresConsumibles: false },
  { value: 2, key: 'design', label: 'Diseño', requiresConsumibles: false },
  { value: 3, key: 'production', label: 'Producción', requiresConsumibles: true },
  { value: 4, key: 'finishing', label: 'Acabados', requiresConsumibles: false },
  { value: 5, key: 'finished', label: 'Finalizado', requiresConsumibles: false },
  { value: 6, key: 'delivered', label: 'Entregado', requiresConsumibles: false },
]);
const currentStep = ref(steps.value.findIndex((s) => s.key === props.order.status) + 1)
const usesConsumable = computed(() => {
  console.log('users');
  console.log(props.order.uses_consumable, 'uses');

  return props.order.uses_consumable
})
const consumableDeducted = computed(() => {
  return props.order.consumable_deducted
})
// const activeStep = computed(() => stages.findIndex((s) => s.key === currentStatus.value) + 1)


const openConsumiblesModal = () => {
  showConsumiblesModal.value = true;
};

const openCommentsModal = () => {
  showCommentsModal.value = true;
};

const submitConsumibles = async () => {
  processRequest(async () => {
    const payload = {
      consumibles: consumibleGenerico.value,
    };

    showConsumiblesModal.value = false;
    const { data } = await Production.storeConsumibleGenerico(props.order.id, payload);
    snackSuccess('Asignados correctamente')
    props.order.consumable_deducted = true
    console.log(data, 'data');
    console.log('Step updated successfully');
  }, cargando, snackbar)
};

const submitComments = async () => {
  showCommentsModal.value = false;
  await updateStep();
};
const goToStep = (step) => {
  if (step.value < 4) {
    updateStep(step)
    return
  }
  if (usesConsumable.value && !consumableDeducted.value) {
    snackError('Necesitas especificar los consumibles ')
    currentStep.value=3
    return;
  }
  updateStep(step)
}
const productosConConsumibles = computed(() => {
  // return props.ventaticket_articulo;
  return props.order?.ventaticket_articulo?.product?.product_components?.flatMap((component) => {
    // Verifica si el producto hijo tiene consumibles
    if (component.product_hijo?.product_consumibles?.length) {
      return {
        product: component.product_hijo,
        consumibles: component.product_hijo.product_consumibles.map((c) => c.consumible),
      };
    }
    return [];
  }).filter((item) => item); // Elimina los valores nulos o undefined
});
const updateStep = async (step) => {
  processRequest(async () => {
    const payload = {
      status: step.key.toLowerCase(),
      // comments: comments.value,
      // documents: documents.value,
      // consumibles: consumibles.value,
      // is_completed: true,
    };

    // await axios.post('/api/production/step', payload);
    const { data } = await Production.updateState(props.order.id, payload);
    // snackSuccess('Proceso actualizado')
    props.order.status = data
    console.log(data, 'data');
    console.log('Step updated successfully');
  }, cargando, snackbar)
};

</script>
<template>
  <v-container>
    <v-stepper v-model="currentStep" editable>
      <v-stepper-header>
        <!-- {{ order.ventaticket_articulo.product.product_components[0].product_hijo }} -->
        <template v-for="(step, index) in steps" :key="index">
          <v-stepper-item :value="step.value" :complete="step.value < currentStep" @click="goToStep(step)"
            :color="getStepColor(step.value)">
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
            <v-btn v-if="usesConsumable && !consumableDeducted && step.key == 'production'" color="primary"
              @click="openConsumiblesModal">
              Agregar Consumibles
            </v-btn>
            <p v-if="consumableDeducted && step.key == 'production'">Consumibles asignados correctamente</p>
            <!-- <v-btn color="secondary" @click="openCommentsModal(step)">
              Agregar Comentarios/Documentos
            </v-btn> -->

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
          <div v-for="productoConsumible in productosConConsumibles" :key="productoConsumible.product.id">
            <p class="mb-2 text-body-1">
              Consumible Generico: {{ productoConsumible.product.name }}
            </p>
            <v-select v-model="consumibleGenerico[productoConsumible.product.id]"
              :items="productoConsumible.consumibles" item-value="id" item-title="name"
              label="Selecciona un Consumible" />
          </div>
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
    <DynamicSnack :snackbar="snackbar" />
  </v-container>
</template>

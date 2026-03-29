<template>
  <v-card max-width="800">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ title }}</span>
      <span class="text-caption text-medium-emphasis">* Campo requerido</span>
    </v-card-title>
    <v-card-text>
      <v-text-field label="Código *" required id="cod" autocomplete="off" placeholder="" :density="density"
        :error-messages="errors.codigo ? errors.codigo[0] : null" :model-value="modelValue.codigo"
        prepend-inner-icon="mdi-barcode"
        @update:model-value="updateField('codigo', $event)" />
      <v-text-field label="Nombre *" required id="name" autocomplete="off" placeholder="" :density="density"
        :error-messages="errors.name ? errors.name[0] : null" :model-value="modelValue.name"
        prepend-inner-icon="mdi-tag-outline"
        @update:model-value="updateField('name', $event)" />
      <v-textarea label="Descripción" id="descripcion" autocomplete="off" placeholder="" :density="density"
        variant="outlined" :error-messages="errors.descripcion ? errors.descripcion[0] : null"
        :model-value="modelValue.descripcion" @update:model-value="updateField('descripcion', $event)" />
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-text-field label="Precio Costo" id="pcosto" autocomplete="off" placeholder="" :density="density"
            prepend-inner-icon="mdi-cash"
            :error-messages="errors.pcosto ? errors.pcosto[0] : null" :model-value="modelValue.pcosto"
            @update:model-value="updateField('pcosto', $event)" />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field label="Porcentaje Deseado" id="porcentaje_ganancia" autocomplete="off" placeholder=""
            :density="density" :error-messages="errors.porcentaje_ganancia ? errors.porcentaje_ganancia[0] : null"
            :model-value="modelValue.porcentaje_ganancia"
            prepend-inner-icon="mdi-label-percent"
            @update:model-value="updateField('porcentaje_ganancia', $event)" />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-select
            label="El producto es consumible"
            :items="consumibleItems"
            :model-value="modelValue.consumible"
            :density="density"
            @update:model-value="updateField('consumible', $event)"
          ></v-select>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-radio-group :model-value="modelValue.es_kit" @update:model-value="updateField('es_kit', $event)"
            :density="density">
            <template v-slot:label>
              <div>El producto es kit?:</div>
            </template>
            <v-radio label="No" :value="isEditMode ? false : '0'"></v-radio>
            <v-radio label="Sí" :value="isEditMode ? true : '1'"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="6" v-if="!isConsumible">
          <v-radio-group
            :model-value="modelValue.necesita_produccion"
            @update:model-value="updateField('necesita_produccion', $event)"
            :density="density"
          >
            <template v-slot:label>
              <div>El producto necesita producción:</div>
            </template>
            <v-radio label="No" :value="isEditMode ? false : '0'"></v-radio>
            <v-radio label="Sí" :value="isEditMode ? true : '1'"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="6" v-if="!isConsumible">
          <v-radio-group
            :model-value="modelValue.usa_medidas"
            @update:model-value="updateField('usa_medidas', $event)"
            :density="density"
          >
            <template v-slot:label>
              <div>Usa medidas:</div>
            </template>
            <v-radio label="No" :value="isEditMode ? false : '0'"></v-radio>
            <v-radio label="Sí" :value="isEditMode ? true : '1'"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="6">
          <v-radio-group :model-value="modelValue.tventa" @update:model-value="updateField('tventa', $event)"
            :density="density">
            <template v-slot:label>
              <div>Tipo de venta:</div>
            </template>
            <v-radio label="Unidad" value="U"></v-radio>
            <v-radio label="Granel" value="G"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="6">
          <v-radio-group :model-value="modelValue.prioridad" @update:model-value="updateField('prioridad', $event)"
            :density="density">
            <template v-slot:label>
              <div>El producto es prioritario:</div>
            </template>
            <v-radio label="No" :value="isEditMode ? false : '0'"></v-radio>
            <v-radio label="Sí" :value="isEditMode ? true : '1'"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="6">
          <v-radio-group :model-value="modelValue.es_presentacion_de_compra"
            @update:model-value="updateField('es_presentacion_de_compra', $event)" :density="density">
            <template v-slot:label>
              <div>El producto es presentación de compra:</div>
            </template>
            <v-radio label="No" :value="isEditMode ? 0 : '0'"></v-radio>
            <v-radio label="Sí" :value="isEditMode ? 1 : '1'"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn v-if="showCancel" @click="$emit('cancel')" :loading="loading">Cerrar</v-btn>
      <v-btn @click="handleSubmit" :loading="loading" color="primary" variant="elevated">{{ submitText }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  errors: {
    type: [Object, Array],
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Crear Producto',
  },
  submitText: {
    type: String,
    default: 'Confirmar',
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  density: {
    type: String,
    default: 'compact',
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const consumibleItems = [
  { title: "No es consumible", value: null },
  { title: "Regular", value: "regular" },
  { title: "Generico", value: "generico" },
];

const isConsumible = computed(() => !!props.modelValue.consumible);

// Helper function to update a specific field
// Instead of creating a new object, we modify the existing one
const updateField = (field, value) => {
  const updated = { ...props.modelValue };
  updated[field] = value;

  if (field === "consumible" && value) {
    updated.necesita_produccion = false;
  }

  emit('update:modelValue', updated);
};

const handleSubmit = () => {
  emit('submit', props.modelValue);
};

watch(
  () => props.modelValue.consumible,
  (value) => {
    if (value && props.modelValue.necesita_produccion) {
      updateField("necesita_produccion", false);
    }
  }
);

// Reset form to initial values
const resetForm = () => {
  const initialValues = {
    codigo: null,
    name: "",
    descripcion: "",
    porcentaje_ganancia: "",
    tventa: "U",
    pcosto: "",
    prioridad: props.isEditMode ? false : "0",
    es_kit: props.isEditMode ? false : "0",
    es_presentacion_de_compra: props.isEditMode ? 1 : "1",
    consumible: null,
    necesita_produccion: false,
    usa_medidas: false,
  };
  emit('update:modelValue', initialValues);
};

// Expose methods to parent component
defineExpose({
  resetForm
});
</script>

<style scoped></style>

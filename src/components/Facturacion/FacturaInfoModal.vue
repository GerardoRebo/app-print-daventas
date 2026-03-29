<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800">
    <v-card>
      <v-card-title>Información de CFDI</v-card-title>
      <v-card-text>
        <div v-if="erroresRelacionadas + fieldErrorCount > 0" class="text-error mb-2">
          {{ erroresRelacionadas + fieldErrorCount }} error(es) en datos de facturacion
        </div>
        <v-tabs v-model="activeTab" grow>
          <v-tab value="basico">Básico</v-tab>
          <v-tab value="avanzado">Opciones Avanzadas</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="basico">
            <v-card-text>
              <p class="text-caption mb-2" v-if="ticketActual.forma_de_pago == 'C'">
                Debido a que esta venta a sido marcada como venta a credito, usa la el
                metodo de pago PPD-Pago en parcialidades o diferido y forma de pago:
                99-Por definir, para emitir complementos de pago por cada abono.
              </p>
              
              <TimbresOrganizationSelector
                :model-value="selectedTimbresOrganization"
                :is-contador="isContador"
                :contador-organizations="contadorOrganizations"
                :active-organization-name="activeOrganizationName"
                :saldo="saldo"
                :saldos="saldos"
                @update:model-value="$emit('update:selectedTimbresOrganization', $event)"
              />
              <v-checkbox label="Es Público en General" :model-value="ticketActual.es_publico_en_general" @update:model-value="$emit('update:es_publico_en_general', $event)"></v-checkbox>
              <v-text-field label="Nombre del receptor (opcional)" :model-value="ticketActual.nombre_receptor" @update:model-value="$emit('update:nombre_receptor', $event)"
                v-if="ticketActual.es_publico_en_general"></v-text-field>
              <v-text-field label="Serie (opcional)" :model-value="ticketActual.serie" @update:model-value="$emit('update:serie', $event)"></v-text-field>
              <v-select :items="metodoPagos" label="Método de pago" :model-value="ticketActual.metodo_pago" @update:model-value="$emit('update:metodo_pago', $event)"
                :disabled="ticketActual.es_publico_en_general"></v-select>
              <v-select :items="pagoFormas" label="Forma de pago" :model-value="ticketActual.forma_pago" @update:model-value="$emit('update:forma_pago', $event)"></v-select>
              <v-select :items="cdfiUsos" label="Uso de CFDI" :model-value="ticketActual.uso_cfdi" @update:model-value="$emit('update:uso_cfdi', $event)"
                :disabled="ticketActual.es_publico_en_general"></v-select>
              <v-text-field label="Clave privada local" :model-value="ticketActual.clave_privada_local" @update:model-value="$emit('update:clave_privada_local', $event)"
                :error-messages="errors.clave_privada_local ? errors.clave_privada_local[0] : null"></v-text-field>
            </v-card-text>
          </v-window-item>

          <v-window-item value="avanzado">
            <v-card-text>
              <v-checkbox 
                label="Usar fecha personalizada para la factura" 
                @update:model-value="$emit('update:usarFechaPersonalizada', $event)" />
              <v-date-input 
                v-if="ticketActual.usarFechaPersonalizada"
                :model-value="ticketActual.fechaFactura"
                @update:model-value="$emit('update:fechaFactura', $event)"
                label="Fecha de la factura"
                class="mt-2 mb-4"
                :max="new Date().toISOString().split('T')[0]" />

              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-subtitle-1 font-weight-medium">Facturas Relacionadas</span>
                <v-btn color="primary" variant="outlined" size="small" prepend-icon="mdi-plus" @click="$emit('agregarRelacion')">
                  Relación
                </v-btn>
              </div>

              <v-container fluid>
                <v-row v-for="(relacion, index) in ticketActual.facturasRelacionadas" :key="index"
                  class="align-center mb-2">
                  <v-col cols="5">
                    <v-select :items="tiposRelacion" label="Tipo de Relación"
                      :error-messages="relacion.tipo ? '' : 'Campo requerido'" :model-value="relacion.tipo" @update:model-value="$emit('update:relacion-tipo', { index, value: $event })" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field label="Folio Fiscal" :model-value="relacion.folio" @update:model-value="$emit('update:relacion-folio', { index, value: $event })"
                      v-maska="'********-****-****-****-************'"
                      :error-messages="relacion.folio ? '' : 'Campo requerido'"
                      placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" />
                  </v-col>
                  <v-col cols="1" class="d-flex justify-end">
                    <v-btn icon="mdi-delete" color="error" variant="text" size="small"
                      @click="$emit('eliminarRelacion', index)" />
                  </v-col>
                </v-row>
              </v-container>

              <v-divider class="my-4" />
              <v-textarea 
                label="Observaciones (opcional)" 
                :model-value="ticketActual.observaciones" 
                @update:model-value="$emit('update:observaciones', $event)"
                placeholder="Agrega observaciones que aparecerán en la factura"
                rows="4"
                counter
                maxlength="2000"
              ></v-textarea>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)" variant="text" :loading="cargando">
          Cerrar
        </v-btn>
        <v-btn @click="$emit('vistaPreviaXml')" color="secondary" prepend-icon="mdi-xml" variant="tonal" :loading="cargando">
          Vista Previa XML
        </v-btn>
        <v-btn @click="$emit('vistaPrevia')" color="primary" prepend-icon="mdi-open-in-new" variant="tonal" :loading="cargando">
          Vista Previa
        </v-btn>
        <v-btn @click="$emit('facturar')" prepend-icon="mdi-invoice" color="primary" variant="elevated" :loading="cargando">
          Facturar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { vMaska } from "maska/vue";
import TimbresOrganizationSelector from './TimbresOrganizationSelector.vue';
import { pagoFormas, metodoPagos, cdfiUsos, tiposRelacion } from '@js/utils/cfdiCatalogs';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  ticketActual: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  erroresRelacionadas: {
    type: Array,
    default: () => []
  },
  fieldErrorCount: {
    type: Number,
    default: 0
  },
  isContador: {
    type: Boolean,
    default: false
  },
  contadorOrganizations: {
    type: Array,
    default: () => []
  },
  selectedTimbresOrganization: {
    type: Number,
    default: null
  },
  activeOrganizationName: {
    type: String,
    default: ''
  },
  saldo: {
    type: Number,
    default: null
  },
  saldos: {
    type: Object,
    default: () => ({})
  },
  cargando: {
    type: Boolean,
    default: false
  },
});

defineEmits([
  'update:modelValue',
  'update:selectedTimbresOrganization',
  'update:es_publico_en_general',
  'update:nombre_receptor',
  'update:serie',
  'update:metodo_pago',
  'update:forma_pago',
  'update:uso_cfdi',
  'update:clave_privada_local',
  'update:usarFechaPersonalizada',
  'update:fechaFactura',
  'update:relacion-tipo',
  'update:relacion-folio',
  'update:observaciones',
  'agregarRelacion',
  'eliminarRelacion',
  'vistaPreviaXml',
  'vistaPrevia',
  'facturar'
]);

const activeTab = ref("basico");
</script>

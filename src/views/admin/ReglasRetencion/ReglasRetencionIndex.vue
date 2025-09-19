<template>
  <v-card class="mb-2">
    <v-card-title>Retencion de impuestos</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-btn @click="abrirVisible" :loading="cargando" prepend-icon="mdi-plus" color="primary">Nueva regla de
          retención</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-data-table :headers="headers" :items="retentionRules" items-per-page="5">
      <template v-slot:item.regla="{ item }">
        <span>Aplica retencion ISR: %{{ item.isr_percentage }} y retencionón de IVA: %{{ item.iva_percentage }} {{
          item.iva_type == 'importe' ? 'del importe' : '' }} cuando el cliente de la venta
          tenga el regimen "{{ getRegimen(item.regimen_fiscal) }}"</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn size="small" prepend-icon="mdi-pencil" class="mr-2" @click="onEdit(item)">Editar</v-btn>
        <v-btn size="small" prepend-icon="mdi-trash-can" @click="deleteRetentionRule(item.id)">Eliminar</v-btn>
      </template>
    </v-data-table>
  </v-container>
  <v-dialog v-model="isVisible" max-width="600">
    <v-card>
      <v-card-title>{{ title }} regla de retencion</v-card-title>
      <v-card-text>
        <v-select :items="commonRetentionRulesItems" label="Usar reglas comunes"
          v-model="selectedCommonRetentionRule"></v-select>
        <v-text-field label="Nombre" v-model="rule.name"
          :error-messages="errors.name ? errors.name[0] : null"></v-text-field>
        <v-row>
          <v-col cols="12" sm="6">
            <v-switch label="Aplica Retencion ISR" v-model="aplies_isr" color="primary" :true-value="true"></v-switch>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Porcentaje ISR" v-model="rule.isr_percentage" :disabled="!aplies_isr"
              :error-messages="errors.isr_percentage ? errors.isr_percentage[0] : null"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-switch label="Aplica Retencion IVA" v-model="aplies_iva" color="primary"
              :error-messages="errors.aplies_iva ? errors.aplies_iva[0] : null" :true-value="true"></v-switch>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field label="Porcentaje IVA" v-model="rule.iva_percentage"
              :error-messages="errors.iva_percentage ? errors.iva_percentage[0] : null" :disabled="!aplies_iva"></v-text-field>
          </v-col>
        </v-row>
        <p class="text-caption">Aplica regla automaticamente si el cliente tiene el regimen fiscal:</p>
        <v-select :items="fiscalRegimenes" label="Régimen Fiscal (opcional)" v-model="rule.regimen_fiscal"
          :error-messages="errors.regimen_fiscal ? errors.regimen_fiscal[0] : null"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" variant="text">Cancelar</v-btn>
        <v-btn @click="onSubmit" color="primary" variant="outlined">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script setup>
import Organizacion from "../../../apis/Organizacion";
import Impuesto from "@js/apis/Impuesto";
import RetentionRules from "@js/apis/RetentionRules";
import { ref, reactive, computed, watch } from "@vue/reactivity";
import { nextTick } from "@vue/runtime-core";
import { onMounted } from "vue";

const impuestos = ref([]);
const retentionRules = ref([]);
const commonRetentionRules = ref(null);
const selectedRule = ref(null);
const selectedCommonRetentionRule = ref(null);
const errors = ref([]);
const cargando = ref(false);
const isVisible = ref(false);
const aplies_iva = ref(true);
const aplies_isr = ref(true);
const commonRetentionRulesItems = computed(() => {
  if (!commonRetentionRules.value) {
    return []
  }
  return Object.entries(commonRetentionRules.value).map(([id, item]) => ({
    value: Number(id),
    title: item.name
  }))
})
watch(selectedCommonRetentionRule, (new_val) => {
  if (new_val) {
    const entry = Object.entries(commonRetentionRules.value).find(
      ([id]) => Number(id) === Number(new_val)
    );
    const found = entry ? entry[1] : null;
    if (found) {
      console.log(found);
      
      rule.name = found.name;
      rule.isr_percentage = found.isr_percentage;
      rule.iva_percentage = found.iva_percentage;
      rule.iva_type = found.iva_type;
      rule.regimen_fiscal = found.regimen_fiscal;
      aplies_isr.value = found.aplies_isr;
      aplies_iva.value = found.aplies_iva;
    }
  } else {
    emptyRetentionRule();
  }
});


const title = computed(() => {
  if (selectedRule.value) {
    return 'Editar';
  }
  return 'Crear';
})
const rule = reactive({
  'name': null,
  'isr_percentage': null,
  'iva_percentage': null,
  'iva_type': null,
  'regimen_fiscal': null,
});
const fiscalRegimenes = ref([
  { "value": '601', "title": "601 - General de Ley Personas Morales" },
  { "value": '603', "title": "603 - Personas Morales con Fines no Lucrativos" },
  { "value": '605', "title": "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { "value": '606', "title": "606 - Arrendamiento" },
  { "value": '607', "title": "607 - Régimen de Enajenación o Adquisición de Bienes" },
  { "value": '608', "title": "608 - Demás ingresos" },
  { "value": '610', "title": "610 - Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { "value": '611', "title": "611 - Ingresos por Dividendos (socios y accionistas)" },
  { "value": '612', "title": "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
  { "value": '614', "title": "614 - Ingresos por intereses" },
  { "value": '615', "title": "615 - Régimen de los ingresos por obtención de premios" },
  { "value": '616', "title": "616 - Sin obligaciones fiscales" },
  { "value": '620', "title": "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { "value": '621', "title": "621 - Incorporación Fiscal" },
  { "value": '622', "title": "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { "value": '623', "title": "623 - Opcional para Grupos de Sociedades" },
  { "value": '624', "title": "624 - Coordinados" },
  { "value": '625', "title": "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { "value": '626', "title": "626 - Régimen Simplificado de Confianza" }
]);
const getRegimen = (id) => {
  const regimen = fiscalRegimenes.value.find((item) => {
    return item.value.toString() == id
  })
  return regimen?.title
}
const iva_types = ref([
  {
    value: 'iva',
    title: 'IVA'
  },
  {
    value: 'importe',
    title: 'Importe'
  },
])
const headers = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Regla', key: 'regla', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const impuestoItems = computed(() => {
  return impuestos.value.map((item) => {
    return {
      value: item.id,
      title: `${item.descripcion} %${item.tasa_cuota} ${item.tipo}`,
    }
  });
})
const emptyRetentionRule = () => {
  rule.isr_percentage = null;
  rule.iva_percentage = null;
  rule.iva_type = null;
  rule.regimen_fiscal = null;
  rule.name = null;
  aplies_isr.value = true;
  aplies_iva.value = true;
}
watch(isVisible, (new_val) => {
  if (!new_val) {
    selectedRule.value = null;
    emptyRetentionRule();
    errors.value = [];
  }
})
watch(aplies_isr, (new_val) => {
  if (!new_val) {
    rule.isr_percentage = null;
  }
})
watch(aplies_iva, (new_val) => {
  if (!new_val) {
    rule.iva_percentage = null;
    rule.iva_type = null;
  }
})
async function getMyRetainedTaxes() {
  if (cargando.value) return;
  cargando.value = true;
  Impuesto.getMyRetainedTaxes()
    .then((response) => {
      cargando.value = false;
      impuestos.value = response.data;
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function onSubmit() {
  if (selectedRule.value) {
    updateRetentionRule()
  } else {
    storeRetentionRule()
  }
}
function onEdit(item) {
  getMyRetainedTaxes();
  selectedRule.value = item.id;
  rule.name = item.name;
  rule.isr_percentage = item.isr_percentage;
  rule.iva_percentage = item.iva_percentage;
  rule.iva_type = item.iva_type;
  rule.regimen_fiscal = item.regimen_fiscal;
  isVisible.value = true;
}

function updateRetentionRule() {
  if (cargando.value) return;
  cargando.value = true;
  RetentionRules.update(selectedRule.value, rule)
    .then((response) => {
      cargando.value = false;
      getMyRetainedTaxesRules();
      isVisible.value = false
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function storeRetentionRule() {
  if (cargando.value) return;
  cargando.value = true;
  RetentionRules.store(rule)
    .then((response) => {
      cargando.value = false;
      getMyRetainedTaxesRules();
      isVisible.value = false
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return;

      }
      // handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
async function deleteRetentionRule(id) {
  if (cargando.value) return;
  cargando.value = true;
  RetentionRules.delete(id)
    .then((response) => {
      cargando.value = false;
      getMyRetainedTaxesRules();
      isVisible.value = false
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
async function getMyRetainedTaxesRules() {
  if (cargando.value) return;
  cargando.value = true;
  RetentionRules.index()
    .then((response) => {
      retentionRules.value = response.data;
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
async function getCommonRetainedTaxesRules() {
  RetentionRules.commonRetentionRules()
    .then((response) => {
      commonRetentionRules.value = response.data;
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
    });
}
function abrirVisible() {
  isVisible.value = true;
  nextTick(() => {
  });
  getMyRetainedTaxes();
}

onMounted(() => {
  getMyRetainedTaxesRules()
  getCommonRetainedTaxesRules()
});
</script>

<style></style>
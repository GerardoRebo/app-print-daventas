<template>
  <v-card class="mb-2">
    <v-card-title>Retencion de impuestos</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-btn @click="abrirVisible" :loading="cargando" prepend-icon="mdi-plus">Nueva regla de retención</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container>
    <v-data-table :headers="headers" :items="retentionRules" items-per-page="5">
      <template v-slot:item.regla="{ item }">
        <span>Retener %{{ item.tax.tasa_cuota }} de {{ item.tax.descripcion }} cuando el cliente de la venta
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
        <v-select :items="impuestoItems" label="Impuesto" v-model="rule.tax_id"></v-select>
        <v-select :items="fiscalRegimenes" label="Régimen Fiscal" v-model="rule.regimen_fiscal"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="onSubmit">Guardar</v-btn>
        <v-btn @click="isVisible = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script setup>
import Organizacion from "../../../apis/Organizacion";
import Impuesto from "@js/apis/Impuesto";
import RetentionRules from "@js/apis/RetentionRules";
import { ref, reactive, computed } from "@vue/reactivity";
import { nextTick } from "@vue/runtime-core";
import { onMounted } from "vue";

const impuestos = ref([]);
const retentionRules = ref([]);
const selectedRule = ref(null);
const errors = ref([]);
const cargando = ref(false);
const isVisible = ref(false);
const title = computed(() => {
  if (selectedRule.value) {
    return 'Editar';
  }
  return 'Crear';
})
const rule = reactive({
  'tax_id': null,
  'regimen_fiscal': null,
});
const fiscalRegimenes = ref([
  { "value": '601', "title": "601 - General de Ley Personas Morales" },
  { "value": '603', "title": "603 - Personas Morales con Fines no Lucrativos" },
  { "value": '605', "title": "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { "value": '606', "title": "606 - Arrendamiento" },
  { "value": '607', "title": "607 - Régimen de Enajenación o Adquisición de Bienes" },
  { "value": '608', "title": "608 - Demás ingresos" },
  { "value": '610', "title": "610 -  Residentes en el Extranjero sin Establecimiento Permanente en México" },
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
const headers = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
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
  rule.tax_id = item.tax_id;
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
function abrirVisible() {
  isVisible.value = true;
  nextTick(() => {
  });
  getMyRetainedTaxes();
}

onMounted(() => {
  getMyRetainedTaxesRules()
});
</script>

<style></style>
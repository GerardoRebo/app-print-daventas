<template>
  <!-- header desktop -->
  <v-card>
    <v-card-text>
      <p class="font-weight-bold">Producto: {{ productActual.name }}</p>
      <p class="font-weight-bold">Codigo: {{ productActual.codigo }}</p>
      <v-divider></v-divider>
      <v-row dense class="mt-4">
        <v-col cols="12" md="auto">
          <v-btn @click="abrirModal" prepend-icon="mdi-plus" variant="outlined" color="primary" class="mx-2"
            size="small">Agregar
            impuesto
          </v-btn>
        </v-col>
        <v-col cols="12" md="2" >
          <v-select :items="ObjetoImpItems" v-model="productActual.ObjetoImp" @update:modelValue="updateObjetoImpuesto" label="Objeto impuesto:" class="mx-2" color="primary">
          </v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn @click="abrirClave" prepend-icon="mdi-magnify" variant="tonal" color="primary" class="mx-2"
            size="small">Buscar
            clave producto
          </v-btn>
        </v-col>
        <v-col cols="12" md="2">
          <div>
            Clave Producto Servicio:
          </div>
          <div>
            {{ product?.c_claveProdServ }}|{{ product?.c_claveProdServ_descripcion }}
          </div>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn @click="abrirUnidad" prepend-icon="mdi-magnify" variant="tonal" color="primary" class="mx-2"
            size="small">
            Unidad de medida
          </v-btn>
        </v-col>
        <v-col cols="12" md="2">
          <div class="flex flex-col">
            <div>
              Unidad de Medida:
            </div>
            <div>
              {{ product?.c_ClaveUnidad }}|{{ product?.c_ClaveUnidad_descripcion }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-container fluid>
    <v-data-table :headers="tHeaders" :items="misImpuestos" items-per-page="5">
      <template v-slot:item.codigo="{ item }">
        {{ item.product_hijo.codigo }}
      </template>
      <template v-slot:item.venta="{ item }">
        {{ item.pivot.venta }}
      </template>
      <template v-slot:item.compra="{ item }">
        {{ item.pivot.compra }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon="mdi-pencil" size="small" color="primary" @click="abrirModalEdit(item)"></v-btn>
        <v-btn icon="mdi-trash-can" size="small" color="error" @click="quitarImpuesto(item.id)"></v-btn>
      </template>
    </v-data-table>
  </v-container>

  <v-dialog v-model="isClaveOpen" max-width="1000">
    <v-card>
      <v-card-title>Busca clave de producto</v-card-title>
      <v-card-text>
        <v-text-field @input="makeUpdate" name='keywClave' label="Buscar Producto" prepend-inner-icon="mdi-magnify"
          variant="outlined" hide-details single-line ref="keywordRef"></v-text-field>
        <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="claveHeaders" :items="claves">
          <template v-slot:item.actions="{ item }">
            <v-btn prepend-icon="mdi-check" size="small" color="primary"
              @keydown.enter="updateClave(item.c_claveProdServ)" @click="updateClave(item.c_claveProdServ)">
              Agregar
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isUnidadOpen" max-width="1000">
    <v-card>
      <v-card-title>Busca unidad de producto</v-card-title>
      <v-card-text>
        <v-text-field @input="makeUpdate" name='keywUnidad' label="Buscar unidad" prepend-inner-icon="mdi-magnify"
          variant="outlined" hide-details single-line ref="keywordRef"></v-text-field>
        <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="headers" :items="unidades">
          <template v-slot:item.actions="{ item }">
            <v-btn prepend-icon="mdi-check" size="small" color="primary"
              @keydown.enter="updateUnidad(item.c_ClaveUnidad)" @click="updateUnidad(item.c_ClaveUnidad)">
              Agregar
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isVisible" max-width="600">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
        <v-select :items="impuestoItems" label="Impuesto" v-model="impuestoSelect"></v-select>
        <v-checkbox v-model="venta" :label="`Venta`" density="compact"></v-checkbox hide-details>
        <v-checkbox v-model="compra" :label="`Compra`" density="compact"></v-checkbox hide-details>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" variant="text" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="agregarImpuesto" color="primary" variant="outlined" :loading="cargando" prepend-icon="mdi-update"
          v-if="impuestoActualId">Actualiza</v-btn>
        <v-btn @click="agregarImpuesto" color="primary" variant="outlined" :loading="cargando" prepend-icon="mdi-plus"
          v-else>Agregar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref, watch, computed } from "@vue/runtime-core";
import Impuesto from "@js/apis/Impuesto";
import Product from "@js/apis/Product";
import { useSnackBar } from "@js/composables/SnackBar";
import { useRoute } from "vue-router";
import { useProductActual } from "../../../composables/ProductActual";
import ProductTaxes from "@js/apis/ProductTaxes";
const { snackbar, snackSuccess, snackError, snackWarning } = useSnackBar();
const route = useRoute();

const impuestos = ref([]);
const productActual = ref({});
const impuestoSelect = ref(null);
const impuestoActualId = ref(null);
const misImpuestos = ref([]);
const product = ref(null);
const venta = ref(true);
const compra = ref(true);
const claves = ref([]);
const unidades = ref([]);
const cargando = ref(false);
const timeOut = ref("");
const claveKeyword = ref("");
const unidadKeyword = ref("");
const errors = ref([]);
const isVisible = ref(false);
const isClaveOpen = ref(false);
const isUnidadOpen = ref(false);
const productId = ref(route.params.productId);
const ObjetoImpItems = ref([{ title: "No objeto de impuesto", value: "01" }, { title: "Si objeto de impuesto", value: "02" }, { title: "Si objeto de impuesto, no desglose", value: "03" }]);
const impuestoItems = computed(() => {
  return impuestos.value.map((item) => {
    return {
      value: item.id,
      title: `${item.descripcion} %${item.tasa_cuota} ${item.tipo}`,
    }
  });
})
const headers = ref([
  { title: 'Clave', key: 'c_ClaveUnidad', align: 'start', sortable: false },
  { title: 'Descripcion', key: 'descripcion', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const claveHeaders = ref([
  { title: 'Clave', key: 'c_claveProdServ', align: 'start', sortable: false },
  { title: 'Descripcion', key: 'descripcion', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const tHeaders = ref([
  { title: 'Nombre', key: 'descripcion', align: 'start', sortable: false },
  { title: 'Tipo', key: 'tipo', align: 'start', sortable: false },
  { title: 'Porcentaje', key: 'tasa_cuota', align: 'start', sortable: false },
  { title: 'Venta', key: 'venta', align: 'start', sortable: false },
  { title: 'Compra', key: 'compra', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);

useProductActual(productId.value, productActual, cargando, snackError);
const buttonTitle = computed(() => {
  if (impuestoActualId.value) {
    return 'Actualizar'
  }
  return 'Agrear';
})
const title = computed(() => {
  if (impuestoActualId.value) {
    return 'Edita impuesto'
  }
  return 'Crea impuesto';
})

function quitarImpuesto(impuestoActualId) {
  Impuesto.quitarD(impuestoActualId, productId.value)
    .then((response) => {
      showpd()
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
watch(() => productId.value, () => {
  showpd();
}, { immediate: true });

function showpd() {
  Impuesto.showPD(productId.value)
    .then((response) => {
      product.value = response.data;
      misImpuestos.value = response.data.taxes
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un errorrr")
    });
}
async function abrirModal() {
  isVisible.value = true;
  impuestoActualId.value = null;
  impuestoSelect.value = null;
  compra.value = true;
  venta.value = true;
}
async function abrirModalEdit(impuesto) {
  impuestoActualId.value = impuesto.pivot.id
  impuestoSelect.value = impuesto.id;
  compra.value = !!impuesto.pivot.compra;
  venta.value = !!impuesto.pivot.venta;
  isVisible.value = true;
}
function abrirClave() {
  isClaveOpen.value = true;
  getAllClaves();
}
function abrirUnidad() {
  isUnidadOpen.value = true;
  getAllUnidades();
}
function getAllClaves() {
  Impuesto.getAllClaves({ keyword: claveKeyword.value })
    .then((response) => {
      claves.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function getAllUnidades() {
  Impuesto.getAllUnidades({ keyword: unidadKeyword.value })
    .then((response) => {
      unidades.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function updateClave(clave) {
  Impuesto.updateClave(clave, productId.value)
    .then(() => {
      isClaveOpen.value = false;
      showpd();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
async function updateObjetoImpuesto(e) {
  try {
    const { data } = await Product.updateObjetoImp(productActual.value.id, e);
    snackSuccess("Actualizado correctamente")
    showpd()
  } catch (error) {
    console.log(error);
    // handleOpException(error);
    alert("Ha ocurrido un error")
  }
}
function getAllImpuestos() {
  Impuesto.getTrasladoImpuestos()
    .then((response) => {
      impuestos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function agregarImpuesto() {
  if (impuestoActualId.value) {
    ProductTaxes.update(impuestoActualId.value, venta.value, compra.value)
      .then(() => {
        isVisible.value = false;
        showpd();
      })
      .catch((error) => {
        handleOpException(error);
        alert("Ha ocurrido un error")
      });
    return;
  }
  ProductTaxes.store(productId.value, impuestoSelect.value, venta.value, compra.value)
    .then(() => {
      isVisible.value = false;
      showpd();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function updateUnidad(unidad) {
  Impuesto.updateUnidad(unidad, productId.value)
    .then(() => {
      isUnidadOpen.value = false;
      showpd();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function makeUpdate(e) {
  let task = null;
  if (e.target.name == "keywClave") {
    claveKeyword.value = e.target.value;
    task = () => getAllClaves();
  } else if (e.target.name == "keywUnidad") {
    unidadKeyword.value = e.target.value;
    task = () => getAllUnidades();
  }
  debounce(task, 500);
}
function debounce(func, wait = 1000) {
  clearTimeout(timeOut.value);
  timeOut.value = setTimeout(func, wait);
}
onMounted(() => {
  getAllImpuestos();
});

</script>

<style></style>
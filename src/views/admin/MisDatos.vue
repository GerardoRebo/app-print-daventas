<template>
  <v-card class="mb-2">
    <v-card-title>Manejo de datos</v-card-title>
    <v-card-text>
      <v-row>
        <v-btn @click.prevent="generateDesktopProducts" size="small" class="mx-4">Generar Datos Escritorio</v-btn>
        <v-select :items="almacenItems" v-model="almacen.id" hide-details max-width="300" />
      </v-row>
    </v-card-text>
  </v-card>
  <v-card class="mb-2">
    <v-card-title>Subir información</v-card-title>
    <v-card-text>
      <div class="flex">
        <p class="mr-2">Decarga una plantilla </p> <a class="
                                  font-bold
                                  text-indigo-600
                                  hover:text-indigo-900
                                  cursor-pointer
                                " :href="`${base_url}/PlantillaDatos.csv`" target="_blank"
          rel="noreferrer noopener">aquí</a>
      </div>
      <div class="flex">
        <p class="mr-2">Ver reporte de subida</p>
        <a class="
                                  font-bold
                                  text-indigo-600
                                  hover:text-indigo-900
                                  cursor-pointer
                                " @click.prevent="getReport">aquí</a>
      </div>
      <div>
        <div class="md:flex md:items-center mb-6">
          <div class="md:w-1/3"></div>
          <div class="md:w-2/3">
            <div class="flex flex-col">
              <span v-show="!almacen.id">Elige un almacén primero</span>
              <input ref="inputEl" :disabled="!almacen.id" @click="" v-on:change="handleFileUpload" type="file"
                accept=".csv, .txt" />
            </div>
          </div>
        </div>
        <div class="md:flex md:items-center mb-6">
          <div class="md:w-1/3"></div>
          <div class="md:w-2/3"></div>
        </div>
      </div>
      <div class="md:flex md:items-center">
        <div class="md:w-1/3"></div>
        <v-btn v-if="muestraButton" class="w-20" @click.prevent="senddata">Subir</v-btn>
      </div>
    </v-card-text>
  </v-card>

  <v-card class="mb-2">
    <v-card-title>Descargar información</v-card-title>
    <v-card-text>
      <v-row>
        <v-select :items="letras" v-model="desde" hide-details max-width="300" class="mx-4" />
        <v-select :items="letras" v-model="hasta" hide-details max-width="300" />
        <v-btn @click.prevent="downData" size="small" class="mx-4">Descargar</v-btn>
      </v-row>
      <v-container>
        <v-data-table :headers="headers" :items="files" items-per-page="5">
          <template v-slot:item.actions="{ item }">
            <v-btn @click.prevent="downloadFile(item.id)" class="mx-2" size="small">Descargar</v-btn>
            <v-btn @click.prevent="deleteFile(item.id)" class="mx-2" size="small">Eliminar</v-btn>
          </template>
        </v-data-table>
      </v-container>
    </v-card-text>
  </v-card>

  <v-dialog v-model="isVisible">
    <v-card>
      <v-card-title>Asigna almacén</v-card-title>
      <v-card-text>
        <ul>
          <li v-for="(error, index) in errors" :key="index">{{ error[0] }}</li>
        </ul>
        <div v-if="report">
          <pre>
          {{ report }}
        </pre>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import Almacen from "@js/apis/Almacen";
import Files from "@js/apis/Files";
import Product from '@js/apis/Product'
import Organizacion from "../../apis/Organizacion";
import { useUserStore } from "@js/s";
const s = useUserStore();
const { handleOpException } = s;

const file = ref(null);
const errors = ref([]);
const report = ref();
const isVisible = ref(false);
const muestraButton = computed(() => {
  return almacen.id != null && file.value != null;
});
const almacen = reactive({
  id: null,
  name: "",
});
const almacens = ref([]);
const desde = ref("a");
const cargando = ref(false);
const inputEl = ref(null);
const hasta = ref("z");
const files = ref([]);
const letras = ref("abcdefghijklmnñopqrstuvwxyz".split(''));
const base_url = computed(() => import.meta.env.VITE_BASE_URL)
const headers = ref([
  { title: 'Fecha', key: 'created_at', align: 'start', sortable: false },
  { title: 'Estado', key: 'estado', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const almacenItems = computed(() => [
  { title: 'Selecciona', value: null },
  ...almacens.value.map((item) => ({
    title: item.name,
    value: item.id.toString(),
  })),
]);
const generateDesktopProducts = () => {
  if (cargando.value) return;
  cargando.value = true
  Product.generateDesktopProducts().then((response) => {
  }).catch((error) => {
    handleOpException(error);
  }).finally(() => {
    cargando.value = false
  })
}
function handleFileUpload(event) {
  file.value = event.target.files[0];
}
function abrirModal() {
  isVisible.value = true;
}
function getReport() {
  Files.getReport(file).then((response) => {
    report.value = response.data
    abrirModal()
  });
}
async function downloadFile(file) {
  if (cargando.value) return;
  cargando.value = true;
  try {
    const { data } = await Organizacion.downloadFile(file);
    const blob = new Blob([data], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = "MisDatos.csv"
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (error) {
    handleOpException(error);
    alert("Ha ocurrido un error")

  } finally {
    cargando.value = false;

  }
}
function deleteFile(file) {
  Files.deleteFile(file).then((response) => {
    fetchFiles();
  });
}
function fetchFiles() {
  Files.fetchFiles().then((response) => {
    files.value = response.data;
  });
}
async function senddata() {
  if (!isAlmacenSet()) {
    return;
  }

  let alma = almacens.value.find((a) => a.id == almacen.id).name;
  if (! await confirm(`Los cambios se realizarán en ${alma}...`)) return;
  let formData = new FormData();
  formData.append("file", file.value);
  formData.append("almacen", almacen.id);
  Files.import(formData).then((response) => {
    switch (response.data) {
      case 'Exitoso':
        alert('Procesando... revisa el reporte de subida para conocer el estado de tu petición.')
        break;
      default:
        alert('Ha ocurrido un error');
        break;
    }
    inputEl.value.value = "";
    file.value = null;
    files.value = [];
  }).catch((error) => {
    console.log(error);
    if (error.resopnse) {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        abrirModal()
      }
    }
    handleOpException(error);
    alert("Ha ocurrido un error")
  });
}
function downData() {
  if (!confirm('Al no especificar un almacén, se creara un consolidado de todos tus almacenes')) return;
  Files.export(desde.value, hasta.value, almacen.id).then((response) => {
    if (response.data === "Exitoso") {
      alert('Tu petición está siendo procesada, la operación puede tardar unos minutos, regresa a esta vista mas tarde');
    }
    if (response.data === "TooMany") {
      alert('Solamente tines permitidos almacenar 3 archivos, si quieres tener más respaldos guardalos de manera local en tu PC');
    }
  }).catch((error) => {
    if (error.response.status === 422) {
      errors.value = error.response.data.errors;
      abrirModal()
    }
    handleOpException(error);
    alert("Ha ocurrido un error")
  });
}
function isAlmacenSet() {
  if (almacen.id == null) {
    alert("No has seleccionado almacen");
    return false;
  }
  return true;
}
onMounted(() => {
  Almacen.getAll()
    .then((response) => {
      almacens.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
  fetchFiles();
});
</script>

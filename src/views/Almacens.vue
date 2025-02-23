<template>
  <v-card class="mb-2">
    <v-card-text>
      <v-card-title>Catálogo almacenes</v-card-title>
      <v-row dense class="mt-4">
        <v-btn prepend-icon="mdi-check-circle" variant="outlined" color="primary" class="mx-2"
          @click="openCreateAlmacen">Crear almacén
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-card>
    <v-card-text>
      <v-text-field label="Buscar" id="keyword" autocomplete="password" v-model="keyword" hide-details class="mx-2" />
      <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
      <v-data-table :headers="tHeaders" :items="almacens">
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" color="primary" @click="openEditAlmacen(item.id)"></v-btn>
          <v-btn icon="mdi-trash-can" size="small" color="error" @click="destroyAlmacen(item.id)"></v-btn>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
  <v-dialog v-model="isVisible" max-width="1000">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="almacen_form.name" label="Nombre"
          :error-messages="errors.name ? errors.name[0] : null"></v-text-field>
        <v-text-field v-model="almacen_form.telefono" label="Telefono" density="compact"
          :error-messages="errors.telefono ? errors.telefono[0] : null"></v-text-field>
        <v-text-field v-model="almacen_form.email" label="Email" density="compact"
          :error-messages="errors.email ? errors.email[0] : null"></v-text-field>
        <v-text-field v-model="almacen_form.direccion" label="Dirección" density="compact"
          :error-messages="errors.direccion ? errors.direccion[0] : null"></v-text-field>
        <v-text-field v-model="almacen_form.rfc" label="Rfc" density="compact"
          :error-messages="errors.rfc ? errors.rfc[0] : null"></v-text-field>
        <v-tooltip text="(opcional)" location="top">
          <template v-slot:activator="{ props }">
            <v-select :items="almacenItems" label="Usar precios de este almacén" v-if="almacens.length && isCreateType"
              v-model="almacen_form.almacen_copia" :error="errors.almacen_copia ? errors.almacen_copia[0] : null"
              clearable v-bind="props" />
          </template>
        </v-tooltip>
        <v-tooltip text="(opcional) Por defecto la existencia de los productos sera cero" location="top">
          <template v-slot:activator="{ props }">
            <v-select :items="almacenItems" label="Usar existencias de este almacén"
              v-if="almacens.length && isCreateType" v-model="almacen_form.almacen_copia_existencia"
              :error="errors.almacen_copia_existencia ? errors.almacen_copia_existencia[0] : null" clearable
              v-bind="props" />
          </template>
        </v-tooltip>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="handleSubmit" :loading="cargando" color="accent" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- <BannerVue v-if="isBannerOpen" @hide-banner="hideBanner">
    <span>Perfecto! Ahora es momento de crear un producto, vamos! </span>
    <RouterLink :to="{ name: 'Productos' }" class="font-bold underline" @click="hideBanner">Click Aqui</RouterLink>
  </BannerVue> -->
</template>

<script setup>
import Almacen from "@js/apis/Almacen";

import { reactive, ref } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { onMounted, onUnmounted, computed } from "vue";
import { useUserStore } from "../s";
import User from "../apis/User";

const s = useUserStore();
const { handleOpException } = s;
const keyword = ref("");
const almacenActualId = ref(null);
const almacens = ref([]);
const almacenItems = computed(() => {
  const al = almacens.value.map((item) => {
    console.log(item);

    return {
      title: item.name,
      value: item.id,
    }
  })
  console.log(al);
  return al

})
const errors = ref([]);
const cargando = ref(false);
const isBannerOpen = ref(false);
const modalType = ref('create');
const message = ref("Los Almacenes son asignados automaticamente a los administradores, para los demás usuarios es necesario la asignación manual, dirigete a: Administración > Usuarios > Almacenes.");
const isVisible = ref(false);
const title = computed(() => {
  if (modalType.value == "create") {
    return "Crea Almacén"
  }
  return "Edita Almacén"
})
const tHeaders = ref([
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false }
]);
const isCreateType = computed(() => {
  if (modalType.value == "create") {
    return true;
  }
  return false
})
const creaProductFeature = computed(() => {
  return !s.authuser?.configuration?.features?.crea_producto && almacens.value && almacens.value.length < 1
})
const almacen_form = reactive({
  name: "",
  direccion: "",
  rfc: "",
  telefono: "",
  almacen_copia: null,
  almacen_copia_existencia: null,
});
watch(keyword, (newValue) => {
  search(newValue);
});
function openEditAlmacen(almacenId) {
  modalType.value = 'edit';
  isVisible.value = true;
  const al = almacens.value.find(al => al.id === almacenId)
  almacenActualId.value = al.id;
  almacen_form.name = al.name;
  almacen_form.direccion = al.direccion;
  almacen_form.telefono = al.telefono;
  almacen_form.rfc = al.rfc;
}
function handleSubmit() {
  if (modalType.value == "create") {
    return enviarAlmacen()
  }
  return editarAlmacen()
}
function openCreateAlmacen() {
  limpiarCampos();
  modalType.value = 'create';
  isVisible.value = true;
}
const hideBanner = async () => {
  isBannerOpen.value = false;
  const response = await User.updateFeature({ key: 'crea_producto', value: true })
  s.authuser = response.data[0];
}
function editarAlmacen() {
  if (cargando.value) return;
  cargando.value = true;
  Almacen.update(almacenActualId.value, almacen_form)
    .then(() => {
      isVisible.value = false
      getAllAlmacens();
      limpiarCampos();

    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}

function getAllAlmacens() {
  Almacen.getAll()
    .then((response) => {
      almacens.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      // console.log(error);
      alert('ocurrió un error');
    });
}

function enviarAlmacen() {
  if (cargando.value) return;
  cargando.value = true;
  Almacen.register(almacen_form)
    .then(() => {
      isVisible.value = false;
      limpiarCampos();
      getAllAlmacens();

      if (creaProductFeature.value) {
        isBannerOpen.value = true;
      }
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function limpiarCampos() {
  errors.value = [];
  almacen_form.name = null;
  almacen_form.direccion = null;
  almacen_form.rfc = null;
  almacen_form.telefono = null;
}
async function destroyAlmacen(almacenId) {
  let con = await confirm('Estas seguro de la acción?')
  if (con === false) {
    return;
  }
  if (cargando.value) return;
  cargando.value = true;
  Almacen.delete(almacenId)
    .then(() => {
      s.myAlmacens = [];
      getAllAlmacens();
    })
    .catch((error) => {
      handleOpException(error);
      alert('Ocurrió un error');
    }).finally(() => {
      cargando.value = false;
    });
}
function search(keyword) {
  Almacen.search(keyword)
    .then((response) => {
      almacens.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function onKeyPressed(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    limpiarCampos();
    isVisible.value = false;
  }
}
onMounted(() => {
  document.addEventListener("keydown", onKeyPressed);
  getAllAlmacens();
});
onUnmounted(() => {
  document.removeEventListener("keydown", onKeyPressed);
});
</script>
<script setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import Gastos from "@js/apis/Gastos";
import Organizacion from "../../../apis/Organizacion";
import moment from "moment";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
moment.locale("es");

const gastos = ref([]);
const search = ref("");
const user_id = ref(null);
const loading = ref(false);
const users = ref([]);
const fecha_inicio = ref(null);
const fecha_fin = ref(null);
const menuInicio = ref(false);
const menuFin = ref(false);
const totalItems = ref(0);

function loadParamsFromUrl() {
  const q = route.query;

  search.value = q.search || "";
  user_id.value = q.user_id || null;
  fecha_inicio.value = q.fecha_inicio || null;
  fecha_fin.value = q.fecha_fin || null;
}
watch(
  [search, user_id, fecha_inicio, fecha_fin],
  () => {
    router.replace({
      query: {
        ...route.query,
        search: search.value || undefined,
        user_id: user_id.value || undefined,
        fecha_inicio: fecha_inicio.value || undefined,
        fecha_fin: fecha_fin.value || undefined,
      },
    });
  },
  { deep: true }
);


function formatDateForDisplay(date) {
  if (!date) return "";
  return moment(date).format("DD/MM/YYYY");
}

function normalizeDate(date) {
  if (!date) return null;
  return moment(date).format("YYYY-MM-DD");
}

const fechaInicioLabel = computed({
  get() {
    return formatDateForDisplay(fecha_inicio.value);
  },
  set(val) {
    if (!val) {
      fecha_inicio.value = null;
      return;
    }
    fecha_inicio.value = normalizeDate(val);
  },
});

const fechaFinLabel = computed({
  get() {
    return formatDateForDisplay(fecha_fin.value);
  },
  set(val) {
    if (!val) {
      fecha_fin.value = null;
      return;
    }
    fecha_fin.value = normalizeDate(val);
  },
});


const fetchUsers = async () => {
  try {
    const { data } = await Organizacion.getMisUsers();
    users.value = data;
  } catch (error) {

  }
};

const fetchGastos = async (options) => {
  loading.value = true;

  const params = {
    search: search.value,
    user_id: user_id.value,
    fecha_inicio: fecha_inicio.value,
    fecha_fin: fecha_fin.value,
    page: options.page,
    per_page: options.itemsPerPage,
  };


  try {
    const { data } = await Gastos.index({ params });
    // console.log(data.data);

    gastos.value = data.data.data;
    totalItems.value = data.data.total;
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }

};

watch([search, user_id, fecha_inicio, fecha_fin], fetchGastos);

onMounted(() => {
  loadParamsFromUrl();

  const options = {
    page: Number(route.query.page) || 1,
    itemsPerPage: 10,
  };

  fetchUsers();
  fetchGastos(options);
});
</script>

<template>
  <v-container>
    <v-card class="pa-4">

      <v-card-title>Gastos de la organización</v-card-title>

      <!-- Filtros -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-text-field v-model="search" label="Buscar concepto o comentario" prepend-inner-icon="mdi-magnify"
            clearable />
        </v-col>

        <v-col cols="12" md="3">
          <v-select v-model="user_id" :items="users" item-title="name" item-value="id" label="Filtrar por usuario"
            clearable />
        </v-col>

        <v-col cols="12" md="3">
          <v-menu v-model="menuInicio" :close-on-content-click="false" transition="scale-transition" offset-y>
            <template #activator="{ props }">
              <v-text-field v-bind="props" v-model="fechaInicioLabel" label="Fecha inicio"
                prepend-inner-icon="mdi-calendar" readonly clearable />
            </template>

            <v-date-picker v-model="fecha_inicio" @update:model-value="menuInicio = false" />
          </v-menu>
        </v-col>


        <v-col cols="12" md="3">
          <v-menu v-model="menuFin" :close-on-content-click="false" transition="scale-transition" offset-y>
            <template #activator="{ props }">
              <v-text-field v-bind="props" v-model="fechaFinLabel" label="Fecha fin" prepend-inner-icon="mdi-calendar"
                readonly clearable />
            </template>

            <v-date-picker v-model="fecha_fin" @update:model-value="menuFin = false" />
          </v-menu>

        </v-col>
      </v-row>

      <!-- Tabla -->
      <!-- Tabla server-side -->
      <v-data-table-server :headers="[
        { title: 'ID', key: 'id' },
        { title: 'Usuario', key: 'user.name' },
        { title: 'Concepto', key: 'concepto' },
        { title: 'Cantidad', key: 'cantidad' },
        { title: 'Comentarios', key: 'comentarios' },
        { title: 'Fecha', key: 'created_at' },
      ]" :items="gastos" :items-per-page="10" :items-length="totalItems" :loading="loading"
        @update:options="fetchGastos">
        <template #item.cantidad="{ item }">
          ${{ Number(item.cantidad).toLocaleString() }}
        </template>

        <template #item.created_at="{ item }">
          {{ moment(item.created_at).format("DD/MM/YYYY") }}
        </template>
      </v-data-table-server>

    </v-card>
  </v-container>
</template>

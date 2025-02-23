<template>
  <div class="flex">
    <div class="flex mx-4 my-2">
      <fechas v-model:dfecha="dfecha" v-model:hfecha="hfecha" />
    </div>
  </div>
  <pagination :pages="notifications.last_page" :currentPage="notifications.current_page"
    @page-changed="getAllNotifications"></pagination>
  <!-- Tabla -->
  <tabla-vue :headers="[
    'Información',
    'Fecha',
  ]">
    <template #bodyRow>
      <tr v-for="(notification, index) in notifications.data" :key="index" class="hover:bg-blue-200">
        <ta-body-vue>{{ notification.data.data }}</ta-body-vue>
        <ta-body-vue>{{ notification.created_at }}</ta-body-vue>
      </tr>
    </template>
  </tabla-vue>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

import { useRoute} from "vue-router";

import Pagination from "../components/Pagination.vue";
import TaBodyVue from "../components/util/TaBodyVue.vue";
import TablaVue from "../components/util/TablaVue.vue";
import useDate from "../composables/useDate";
import useQuery from "../composables/useQuery";
import Fechas from "../components/util/Fechas.vue";


let { pushQuery } = useQuery();
import User from "../apis/User";
import { useUserStore } from "../s";
let { datestring } = useDate();
const s = useUserStore();
const { handleOpException} = s;

const route = useRoute();
const dfecha = ref(datestring);
const hfecha = ref(datestring);
const notifications = ref([]);

watch(() => route.query, () => getAllNotifications())

watch(dfecha, () => {
  pushQuery('dfecha', dfecha.value)
});
watch(hfecha, () => {
  pushQuery('hfecha', dfecha.value)
});
function getAllNotifications(page = 1) {
  User.getAllNotifications(
    page,
    dfecha.value,
    hfecha.value,
  )
    .then((response) => {
      notifications.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert('Hubo un Error')
    });
}
onMounted(() => {
  if (route.query.dfecha) {
    dfecha.value = route.query.dfecha;
  }
  if (route.query.hfecha) {
    hfecha.value = route.query.hfecha;
  }
  getAllNotifications();
});
</script>

<style></style>
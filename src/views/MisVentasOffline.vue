<template>
  <HeaderVue type="general">
    <router-link :to="{ name: 'Offline' }">
      <simple-button-vue>
        Regresar
      </simple-button-vue>
    </router-link>
  </HeaderVue>
  <!-- Tabla -->
  <tabla-vue :headers="[
    'Id',
    'Nombre',
    'Fecha',
    'Cliente',
    'Almacén',
    'Total',
    '',
  ]">
    <template #bodyRow>
      <tr v-for="(misventa, index) in misventas" :key="index" class="hover:bg-blue-200">
        <ta-body-vue>{{ misventa.id }}</ta-body-vue>
        <ta-body-vue>{{ misventa.nombre }}</ta-body-vue>
        <ta-body-vue>{{ moment(misventa.pagado_en).format('h:mm:ssa DD-MM-YYYY') }}</ta-body-vue>
        <ta-body-vue>{{
          misventa.cliente_name 
        }}</ta-body-vue>
        <ta-body-vue>
          <div>
            {{ misventa.name }}
          </div>
        </ta-body-vue>
        <ta-body-vue>{{ misventa.total }}</ta-body-vue>
        <ta-body-vue><simple-button-vue @click="imprimirVenta(misventa.id)">Reimprimir</simple-button-vue></ta-body-vue>
      </tr>
    </template>
  </tabla-vue>
</template>

<script setup>
import moment from "moment-timezone"
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import SimpleButtonVue from "../components/util/SimpleButtonVue.vue";

import TaBodyVue from "../components/util/TaBodyVue.vue";
import HeaderVue from "../components/HeaderVue.vue";
import TablaVue from "../components/util/TablaVue.vue";

import Offline from "../sqlite/Offline";
import { WebviewWindow } from '@tauri-apps/api/window';

const misventas = ref([]);
const intervalId = ref(null);
const route = useRoute();

const getMisVentas = async () => {
  if (!navigator.onLine) {
    return;
  }
  const user = JSON.parse(localStorage.getItem('authuser'))
  try {
    misventas.value = await Offline.getMisVentas(user.id);
  } catch (error) {
    console.log(error);
    alert("Ha ocurrido un error")
  }
}
function imprimirVenta(ticketActual) {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirVentas', {
      url: `ventatickets/imprimirOffline/${ticketActual}`,
      title: 'Imprimir Venta'
    });
    return;
  }
}

onMounted(async () => {
  await getMisVentas();
  if (window.__TAURI__) {
    intervalId.value=setInterval(getMisVentas
      , 4000);
  }
});
onUnmounted(() => {
  clearInterval(intervalId.value)
})



</script>

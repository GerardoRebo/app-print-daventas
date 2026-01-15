<template>
  <router-view></router-view>
  <v-snackbar 
    v-for="(toast, index) in toasterStore.toasts" 
    :key="toast.id"
    v-model="toast.active" 
    :timeout="toast.timeout" 
    :color="toast.status" 
    :variant="toast.variant"
    location="bottom center"
    :style="{ 
      transform: `translateY(-${index * 100}px)`,
      zIndex: 1000 + index
    }"
  >
    {{ toast.text }}
    <template v-slot:actions>
      <v-btn variant="text" @click="toast.active = false">
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
</template>
<script setup>
import { onMounted } from 'vue';
import Offline from './sqlite/Offline'
import PuntoVenta from './apis/PuntoVenta'
import { useToasterStore } from "./s/toaster";
const toasterStore = useToasterStore();

const syncLocalVentas = async () => {
  if (!navigator.onLine) {
    return;
  }
  const user = JSON.parse(localStorage.getItem('authuser'))
  if (user == null) return;
  //limit 5
  const tickets = await Offline.getVentasForSync(user.id);
  if (tickets.length == 0) return;
  const ticketsIds = tickets.map((element) => {
    return element.id
  })
  const articulos = await Offline.getArticulosForSync(ticketsIds);
  const restructuredData = {};

  articulos.forEach((item) => {
    const ticketId = item.ticket_id;

    const t = tickets.find((element) => element.id == ticketId)
    if (!restructuredData[ticketId]) {
      restructuredData[ticketId] = {
        ticket_id: ticketId,
        pagado_en: null,
        almacen_id: t.almacen_id,
        articulos: [],
        cliente_id: t.cliente_id,
        nombre: t.nombre,
        pagado_en: t.pagado_en,
        pago_con: t.pago_con,
        credito: t.credito,
      };
    }

    restructuredData[ticketId].articulos.push({
      id: item.id,
      name: item.name,
      cantidad: item.cantidad,
      product_id: item.product_id,
      precio: item.precio,
    });
  });
  const response = await PuntoVenta.syncLocalVentas(restructuredData);
  response.data.forEach(async (element) => {
    await Offline.borrarTicket(element);
  });
}
onMounted(async () => {
  if (window.__TAURI_METADATA__) {
    setInterval(syncLocalVentas, 20000);
  }

})
</script>
<style></style>

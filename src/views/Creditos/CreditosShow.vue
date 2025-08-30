<template>
  <v-card class="mb-2">
    <v-card-title>Cliente: {{ clienteInfo?.name }}</v-card-title>
    <v-card-text>
      <router-link :to="{ name: 'CreditosIndex' }">
        <span class="text-decoration-underline text-caption">
          Regresar a la lista de clientes con credito
        </span>
      </router-link>
      <v-row dense class="mt-4">
        <v-btn @click="abrirRealizados" class="mx-2">Historial</v-btn>
        <p class="font-semibold content-center mt-4 ml-4">
          Saldo global del cliente: $<span>{{ saldoGlobal }}</span>
        </p>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <p class="content-center text-sm mt-4 ml-4">
      Lista de ventas con saldo pendiente:
    </p>
    <v-data-table :headers="headers" :items="deudas" dense>
      <template v-slot:item.consecutivo="{ item }">
        <v-tooltip text="Ver" location="top">
          <template v-slot:activator="{ props }">
            <router-link :to="{
              name: 'VentasShow',
              params: { ventaId: item.ventaticket.id },
            }">
              {{ item.ventaticket.consecutivo }}
            </router-link>
          </template>
        </v-tooltip>
        <!-- <span>{{ item.ventaticket.consecutivo }}</span> -->
      </template>
      <template v-slot:item.deuda="{ item }">
        <span>${{ item.deuda }}</span>
      </template>
      <template v-slot:item.pendiente="{ item }">
        <span class="text-error mx-2">${{ item.saldo }}</span>
      </template>
      <template v-slot:item.acciones="{ item }">
        <v-btn @click="abrirAbono(item)" class="mx-2" size="small">Realizar abono</v-btn>
        <v-btn
          size="small"
          @click="imprimirVenta(item)"
          class="mx-2"
          prepend-icon="mdi-printer-pos"
          >Reimprimir</v-btn
        >
        <v-btn size="small" @keydown.enter="verAbonos(item)" @click="verAbonos(item)"
          prepend-icon="mdi-eye">Abonos</v-btn>
      </template>
    </v-data-table>
  </v-container>
  <v-dialog v-model="openAbono" max-width="600">
    <v-card>
      <v-card-title>Realizar Abono a Ticket, saldo: ${{ selectedDeuda?.saldo }}</v-card-title>
      <v-card-text>
        <v-text-field label="Cantidad" autocomplete="off" placeholder="" v-model="postData.cantidad"
          ref="cantidadRef" />
        <v-checkbox label="Facturar" v-model="postData.facturar"></v-checkbox>
        <v-select :items="pagoFormas" label="Forma de pago" v-model="postData.forma_pago"
          v-if="postData.facturar"></v-select>
        <v-textarea label="Comentarios (opcional)" v-model="postData.comments" variant="outlined"></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openAbono = false" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="realizarAbono" :loading="cargando" color="accent" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Historial -->
  <v-dialog v-model="openRealizados" max-width="1200">
    <v-card>
      <v-card-title>Historial completo del cliente</v-card-title>
      <v-card-text>
        <v-data-table-server :headers="tHeaders" :items="realizados" :items-length="totalItems" :loading="cargando"
          :search="search" item-value="name" @update:options="getAllDeudas">
          <template v-slot:item.consecutivo="{ item }">
            <span>{{ item.ventaticket.consecutivo }}</span>
          </template>
          <template v-slot:item.deuda="{ item }">
            <p class="cursor-pointer" @keydown.enter="verAbonos(item.id)" @click="verAbonos(item.id)">
              <span class="text-error mx-2">
                ${{ item.deuda }}
              </span>
              <v-icon size="small">mdi-eye</v-icon>
            </p>
          </template>
          <template v-slot:item.saldo="{ item }">
            <p :class="item.saldo == 0 ? 'text-success' : 'text-error'">${{ item.saldo }}</p>
          </template>
          <template v-slot:item.liquidado="{ item }">
            <p>{{ item.liquidado ? 'Si' : 'No' }}</p>
          </template>
        </v-data-table-server>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openRealizados = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="openAbonos">
    <v-card>
      <v-card-title>Historial de abonos realizado al ticket de venta #{{ ventaticketFolio }}</v-card-title>
      <v-card-text>
        <v-data-table :headers="abonosHeaders" :items="abonos" dense>
          <template v-slot:item.actions="{ item }">
            <v-btn @click="facturarAbono(item)" class="mx-2" size="small" v-if="!item.facturado_en">Facturar
              abono</v-btn>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openAbonos = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Creditos from "@js/apis/Creditos";

import { reactive, ref } from "@vue/reactivity";
import { onMounted, nextTick, computed } from "@vue/runtime-core";
import { useRoute } from "vue-router";
import { watch } from "vue";
import { useUserStore } from "@js/s";
const s = useUserStore();
const { handleOpException } = s;

const route = useRoute();

watch(() => route.params, (to) => {
  if (!to.id) return;
  creditoId.value = route.params.creditoId;
  getDeudas(route.params.creditoId);
  getClienteInfo()
})
const deudas = ref([]);
const abonos = ref([]);
const realizados = ref([]);
const creditoId = ref(null);
const ventaticketFolio = ref(null);
const cargando = ref(false);
const cant = ref(null);
const cantidadRef = ref(null);
const openAbono = ref(false);
const openAbonos = ref(false);
const openRealizados = ref(false);
const selectedDeuda = ref(null);
const postData = reactive({
  cantidad: 0,
  comments: '',
  facturar: false,
  forma_pago: null,
});
const search = ref('')
const totalItems = ref(0);
const clienteInfo = ref(null);
const saldoGlobal = computed(() => {
  const suma = deudas.value.reduce(
    (partial_sum, a) => partial_sum + +a.saldo,
    0
  );
  return suma;
});
const headers = ref([
  { title: 'Venta Ticket Folio', key: 'consecutivo', align: 'start', sortable: false },
  { title: 'Monto del ticket', key: 'deuda', align: 'start', sortable: false },
  { title: 'Saldo pendiente', key: 'pendiente', align: 'start', sortable: false },
  { title: 'Acciones', key: 'acciones', align: 'start', sortable: false },
]);
const tHeaders = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Ticket venta folio', key: 'consecutivo', align: 'start', sortable: false },
  { title: 'Deuda original', key: 'deuda', align: 'start', sortable: false },
  { title: 'Pendiente', key: 'saldo', align: 'start', sortable: false },
  { title: 'Liquidado', key: 'liquidado', align: 'start', sortable: false },
]);
const abonosHeaders = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Fecha', key: 'fecha', align: 'start', sortable: false },
  { title: 'Abono', key: 'abono', align: 'start', sortable: false },
  { title: 'Saldo', key: 'saldo', align: 'start', sortable: false },
  { title: 'Comentarios', key: 'comentarios', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const pagoFormas = [
  { "value": "01", "title": "01-Efectivo" },
  { "value": "02", "title": "02-Cheque nominativo" },
  { "value": "03", "title": "03-Transferencia electrónica de fondos" },
  { "value": "04", "title": "04-Tarjeta de crédito" },
  { "value": "05", "title": "05-Monedero electrónico" },
  { "value": "06", "title": "06-Dinero electrónico" },
  { "value": "08", "title": "08-Vales de despensa" },
  { "value": "12", "title": "12-Dación en pago" },
  { "value": "13", "title": "13-Pago por subrogación" },
  { "value": "14", "title": "14-Pago por consignación" },
  { "value": "15", "title": "15-Condonación" },
  { "value": "17", "title": "17-Compensación" },
  { "value": "23", "title": "23-Novación" },
  { "value": "24", "title": "24-Confusión" },
  { "value": "25", "title": "25-Remisión de deuda" },
  { "value": "26", "title": "26-Prescripción o caducidad" },
  { "value": "27", "title": "27-A satisfacción del acreedor" },
  { "value": "28", "title": "28-Tarjeta de débito" },
  { "value": "29", "title": "29-Tarjeta de servicios" },
  { "value": "30", "title": "30-Aplicación de anticipos" },
  { "value": "31", "title": "31-Intermediario pagos" },
  { "value": "99", "title": "99-Por definir" }
];
function getDeudas(credito) {
  Creditos.getDeudas(credito)
    .then((response) => {
      deudas.value = response.data;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    });
}
function verAbonos(deuda) {
  ventaticketFolio.value = deuda.ventaticket.consecutivo
  getAbonos(deuda.id);
  openAbonos.value = true;
}
function imprimirVenta(deuda) {
  window.open(`/ventatickets/imprimir/${deuda.ventaticket.id}`, '_blank');
}
function getAbonos(deuda) {
  Creditos.getAbonos(deuda)
    .then((response) => {
      abonos.value = response.data;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    });
}
function getClienteInfo() {
  Creditos.getClienteInfo(creditoId.value)
    .then((response) => {
      clienteInfo.value = response.data;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    });
}
function abrirAbono(deuda) {
  selectedDeuda.value = deuda;
  openAbono.value = true;
  nextTick(() => cantidadRef.value.select());
}
function abrirRealizados() {
  openRealizados.value = true;
}
function getAllDeudas({ page }) {

  Creditos.getAllDeudas(page, creditoId.value)
    .then((response) => {
      realizados.value = response.data.data;
      totalItems.value = response.data.total;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    });
}
function realizarAbono() {
  if (+postData.cantidad > +selectedDeuda.value?.saldo) {
    alert("La cantidad es mayor a la deuda");
    return;
  }
  if (cargando.value) return;
  cargando.value = true;
  Creditos.realizarAbono(selectedDeuda.value?.id, postData)
    .then(() => {
      openAbono.value = false;
      selectedDeuda.value = null;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    }).finally(() => {
      getDeudas(creditoId.value);
      cargando.value = false;
    });
}
function facturarAbono(abono) {
  if (cargando.value) return;
  cargando.value = true;
  Creditos.facturar(abono)
    .then(() => {
      openAbono.value = false;
      selectedDeuda.value = null;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    }).finally(() => {
      getDeudas(creditoId.value);
      cargando.value = false;
    });
}

onMounted(() => {
  creditoId.value = route.params.creditoId;
  getDeudas(route.params.creditoId);
  getClienteInfo()
});
</script>

<style></style>
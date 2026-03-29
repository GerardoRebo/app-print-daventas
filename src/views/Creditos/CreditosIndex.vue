<template>
  <v-container fluid class="py-0 mt-2">
    <v-card class="mb-2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Clientes con crédito</span>
        <v-btn color="secondary" prepend-icon="mdi-history" @click="abrirHistorialAbonos">
          Ver Historial de Abonos
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-checkbox label="Incluir cuentas saldadas" v-model="todos"></v-checkbox>
      </v-card-text>
    </v-card>
  </v-container>

  <v-container fluid>
    <v-text-field
      v-model="keyword"
      label="Buscar por nombre"
      prepend-inner-icon="mdi-magnify"
      variant="solo-filled"
      flat
      hide-details
      single-line
      ref="keywordRef"
      color="accent"
      clearable
    ></v-text-field>
    <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
    <v-data-table :headers="tHeaders" :items="creditos" dense>
      <template #item.id="{ item }">
        <span class="text-caption">{{ item.id }}</span>
      </template>
      <template #item.saldo_actual="{ item }">
        <span><strong>${{ formatNumber(item.saldo_actual) }}</strong></span>
      </template>
      <template #item.limite_credito="{ item }">
        <span v-if="+item.limite_credito">${{ formatNumber(item.limite_credito) }}</span>
      </template>
      <template #item.actions="{ item }">
        <router-link :to="{ name: 'CreditosShow', params: { creditoId: item.id } }">
          <v-btn icon size="small">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </router-link>
      </template>
    </v-data-table>
  </v-container>

  <v-dialog v-model="openHistorialAbonos" max-width="1200">
    <v-card>
      <v-card-title>Historial de Abonos - Todos los Clientes</v-card-title>
      <v-card-text>
        <v-row dense class="mb-4">
          <v-col cols="12" sm="6">
            <v-select
              :items="filtrosAbonos"
              label="Filtrar por tipo"
              v-model="filtroAbonosSeleccionado"
              @update:model-value="cargarAbonosHistorial(1)"
              density="compact"
            ></v-select>
          </v-col>
        </v-row>
        <v-data-table-server
          :headers="headersHistorialAbonos"
          :items="abonosHistorial"
          :items-per-page="15"
          :items-length="totalAbonosHistorial"
          :loading="loadingHistorial"
          item-value="id"
          @update:options="onUpdateAbonosHistorial"
        >
          <template #item.fecha="{ item }">
            {{ moment(item.fecha).format('DD/MM/YYYY HH:mm') }}
          </template>
          <template #item.cliente="{ item }">
            <router-link v-if="item.deuda?.cliente?.id" :to="{ name: 'CreditosShow', params: { creditoId: item.deuda.cliente.id } }">
              <span class="text-caption">{{ item.deuda?.cliente?.name || item.deuda?.cliente?.razon_social }}</span>
            </router-link>
            <span v-else class="text-caption text-disabled">---</span>
          </template>
          <template #item.abono="{ item }">
            <span class="font-weight-bold">${{ formatNumber(item.abono) }}</span>
          </template>
          <template #item.tipo="{ item }">
            <v-chip v-if="item.abono_global_id" size="small" color="warning" text-color="white">
              Abono Global
            </v-chip>
            <v-chip v-else-if="!item.deuda_id" size="small" color="info" text-color="white">
              Global Padre
            </v-chip>
            <v-chip v-else size="small" color="primary" text-color="white">
              Individual
            </v-chip>
          </template>
          <template #item.deuda="{ item }">
            <router-link v-if="item.deuda" :to="{ name: 'VentasShow', params: { ventaId: item.deuda.ventaticket.id } }">
              Ticket #{{ item.deuda.ventaticket.consecutivo }}
            </router-link>
            <span v-else class="text-caption text-disabled">---</span>
          </template>
          <template #item.saldo="{ item }">
            <span :class="item.saldo <= 0 ? 'text-success' : 'text-warning'">${{ formatNumber(item.saldo) }}</span>
          </template>
          <template #item.usuario="{ item }">
            <span class="text-caption">{{ item.user?.name }}</span>
          </template>
          <template #item.forma_de_pago="{ item }">
            <span class="text-caption">{{ getFormaPagoTitle(item.forma_de_pago) }}</span>
          </template>
          <template #item.estado="{ item }">
            <v-chip v-if="item.cancelado_en" size="small" color="error" text-color="white" prepend-icon="mdi-close-circle">
              Cancelado
            </v-chip>
            <v-chip v-else size="small" color="success" text-color="white" prepend-icon="mdi-check-circle">
              Activo
            </v-chip>
          </template>
        </v-data-table-server>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="openHistorialAbonos = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import Creditos from "@js/apis/Creditos";
import { useCurrency } from "@js/composables/useCurrency";
import { useNotification } from "@js/composables/useNotification";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { pagoFormas } from "@js/utils/cfdiCatalogs";
import { ref } from "@vue/reactivity";
import { onMounted, watch } from "@vue/runtime-core";
import moment from "moment";

const { formatNumber } = useCurrency("es-MX", "MXN");
const { concurrentRequest, processRequest } = useProcessRequest();
const { notify } = useNotification();

const keyword = ref("");
const creditos = ref([]);
const todos = ref(null);
const cargando = ref(false);
const timeOut = ref(null);
const openHistorialAbonos = ref(false);
const loadingHistorial = ref(false);
const abonosHistorial = ref([]);
const totalAbonosHistorial = ref(0);
const filtroAbonosSeleccionado = ref(null);
const tHeaders = ref([
  { title: "Id", key: "id", align: "start", sortable: false },
  { title: "Nombre", key: "name", align: "start", sortable: false },
  { title: "Email", key: "email", align: "start", sortable: false },
  { title: "Saldo actual", key: "saldo_actual", align: "start", sortable: false },
  { title: "Límite de crédito", key: "limite_credito", align: "start", sortable: false },
  { title: "Último pago en ", key: "ultimo_pago_en", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
]);
const headersHistorialAbonos = ref([
  { title: "Fecha", key: "fecha", align: "start", sortable: false, width: "150px" },
  { title: "Cliente", key: "cliente", align: "start", sortable: false, width: "150px" },
  { title: "Tipo", key: "tipo", align: "center", sortable: false, width: "120px" },
  { title: "Ticket", key: "deuda", align: "start", sortable: false, width: "150px" },
  { title: "Monto", key: "abono", align: "end", sortable: false, width: "120px" },
  { title: "Saldo Deuda", key: "saldo", align: "end", sortable: false, width: "120px" },
  { title: "Usuario", key: "usuario", align: "start", sortable: false, width: "150px" },
  { title: "Forma Pago", key: "forma_de_pago", align: "start", sortable: false, width: "120px" },
  { title: "Estado", key: "estado", align: "center", sortable: false, width: "120px" },
]);
const filtrosAbonos = ref([
  { value: null, title: "Todos los abonos" },
  { value: "hijos", title: "Solo abonos globales" },
  { value: "individual", title: "Solo abonos individuales" },
]);

const getFormaPagoTitle = (codigo) => {
  const forma = pagoFormas.find((item) => item.value === codigo);
  return forma ? forma.title : codigo;
};

watch(todos, async () => {
  await getCreditos();
});

watch(keyword, async () => {
  const task = async () => {
    await getCreditos();
  };
  debounce(task, 550);
});

function debounce(func, wait = 1000) {
  cargando.value = true;
  clearTimeout(timeOut.value);
  timeOut.value = setTimeout(func, wait);
}

async function getCreditos() {
  concurrentRequest(async () => {
    const response = await Creditos.getCreditos(todos.value, keyword.value);
    creditos.value = response.data;
  }, cargando, {
    onError: () => notify.error("Ha ocurrido un error"),
  });
}

function abrirHistorialAbonos() {
  openHistorialAbonos.value = true;
  cargarAbonosHistorial(1);
}

function cargarAbonosHistorial(page = 1) {
  const params = {
    page,
    per_page: 15,
  };
  if (filtroAbonosSeleccionado.value) {
    params.filtro = filtroAbonosSeleccionado.value;
  }
  processRequest(async () => {
    const response = await Creditos.getAbonosHistorialGeneral(params);
    abonosHistorial.value = response.data.data;
    totalAbonosHistorial.value = response.data.total;
  }, loadingHistorial, {
    onError: () => notify.error("Error al cargar el historial de abonos"),
  });
}

function onUpdateAbonosHistorial({ page }) {
  cargarAbonosHistorial(page);
}

onMounted(() => {
  getCreditos();
});
</script>
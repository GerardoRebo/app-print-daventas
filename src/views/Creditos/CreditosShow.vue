<template>
  <v-card class="mb-2">
    <v-card-title>Historial creditos, Cliente: {{ clienteInfo?.name }}</v-card-title>
    <v-card-text>
      <router-link :to="{ name: 'CreditosIndex' }">
        <span class="text-decoration-underline text-caption">
          <v-icon icon="mdi-arrow-left" class="mr-2"></v-icon>
          Regresar a la lista de clientes con credito
        </span>
      </router-link>
      <v-row dense class="mt-4">
        <p class="font-semibold content-center mt-4 ml-4">
          <strong> Saldo global del cliente: </strong><span>${{ saldoGlobal }}</span>
        </p>
        <v-checkbox label="Mostrar liquidados" v-model="show_settled_loan" class="ml-8"
          @change="search = String(Date.now())" />
      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-data-table-server :headers="headers" :items="deudas" :items-per-page="10" :items-length="totalItems"
      :loading="loading" :search="search" item-value="name" @update:options="getDeudas">
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
        <div v-if="$vuetify.display.mobile">
          <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small">
                Acciones
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="abrirAbono(item)" :disabled="+item.saldo <= 0">
                <template v-slot:prepend>
                  <v-icon icon="mdi-plus"></v-icon>
                </template>
                <v-list-item-title>Realizar abono</v-list-item-title>
              </v-list-item>
              <v-list-item @click="imprimirVenta(item)">
                <template v-slot:prepend>
                  <v-icon icon="mdi-printer-pos"></v-icon>
                </template>
                <v-list-item-title>Reimprimir</v-list-item-title>
              </v-list-item>
              <v-list-item @click="verAbonos(item)">
                <template v-slot:prepend>
                  <v-icon icon="mdi-eye"></v-icon>
                </template>
                <v-list-item-title>Ver abonos</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div v-else>
          <v-btn @click="abrirAbono(item)" class="mx-2" size="small" :disabled="item.saldo <= 0">Realizar abono</v-btn>
          <v-btn size="small" @click="imprimirVenta(item)" class="mx-2"
            prepend-icon="mdi-printer-pos">Reimprimir</v-btn>
          <v-btn size="small" @keydown.enter="verAbonos(item)" @click="verAbonos(item)"
            prepend-icon="mdi-eye">Abonos</v-btn>
        </div>
      </template>
    </v-data-table-server>
  </v-container>
  <!-- Dialog para realizar abono a la deuda seleccionada -->
  <v-dialog v-model="openAbono" max-width="600">
    <v-card>
      <v-card-title>Realizar Abono a Ticket, saldo: ${{ selectedDeuda?.saldo }}</v-card-title>
      <v-card-text>
        <v-text-field label="Cantidad" autocomplete="off" placeholder="" v-model="postData.cantidad"
          ref="cantidadRef" />
        <v-checkbox label="Facturar" v-model="postData.facturar"></v-checkbox>
        <v-checkbox v-if="+selectedDeuda?.saldo == +postData.cantidad" label="Imprimir al final"
          v-model="printWhenFinalize"></v-checkbox>
        <v-select :items="pagoFormas" label="Forma de pago" v-model="postData.forma_pago"
          v-if="postData.facturar"></v-select>
        <v-textarea label="Comentarios (opcional)" v-model="postData.comments" variant="outlined"></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openAbono = false" :loading="loading">Cancelar</v-btn>
        <v-btn @click="realizarAbono" :loading="loading" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Historial de abonos realizado al ticket de venta -->
  <v-dialog v-model="openAbonos" max-width="800">
    <v-card>
      <v-card-title>Historial de abonos realizado al ticket de venta #{{ ventaticketFolio }}</v-card-title>
      <v-card-text>
        <v-data-table :headers="abonosHeaders" :items="abonos" dense>
          <template v-slot:item.actions="{ item }">
            <v-menu transition="scale-transition" v-if="item.facturado_en">
              <template v-slot:activator="{ props }">
                <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small">
                  Factura
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="onWatchPdf(item)">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-eye"></v-icon>
                  </template>
                  <v-list-item-title>
                    Ver PDF</v-list-item-title>
                </v-list-item>
                <v-list-item @click="onDownloadPdf(item)">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-file-pdf-box"></v-icon>
                  </template>
                  <v-list-item-title>
                    Descarga PDF
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="onDownloadXml(item)">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-xml"></v-icon>
                  </template>
                  <v-list-item-title>
                    Descarga XML</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-btn @click="facturarAbono(item)" size="small"
              v-if="!item.facturado_en && selectedDeuda?.ventaticket?.facturado_en">Facturar
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
import { useRoute, useRouter } from "vue-router";
import { watch } from "vue";
import { useUserStore } from "@js/s";
const s = useUserStore();
const { handleOpException } = s;

const route = useRoute();
const router = useRouter();

watch(() => route.params, (to) => {
  if (!to.id) return;
  creditoId.value = route.params.creditoId;
  search.value = String(Date.now());
  getClienteInfo()
})
const deudas = ref([]);
const abonos = ref([]);
const creditoId = ref(null);
const ventaticketFolio = ref(null);
const loading = ref(false);
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
const show_settled_loan = ref(false);
const search = ref('')
const totalItems = ref(0);
const page = ref(1);
const printWhenFinalize = ref(false);
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
watch(() => openAbono, (newVal) => {
  if (newVal) {
    printWhenFinalize.value = false;
  }
})
watch(() => postData.cantidad, (newVal) => {
  if (+newVal == +selectedDeuda.value?.saldo) {
    printWhenFinalize.value = true;
  } else {
    printWhenFinalize.value = false;
  }
})
function getDeudas({ page, itemsPerPage, sortBy }) {
  if (!creditoId.value) {
    return;
  }
  loading.value = true;
  const params = {
    page: page,
    show_settled_loan: show_settled_loan.value ? 1 : 0,
  }
  router.replace({ query: params });
  Creditos.getDeudas(creditoId.value, params)
    .then((response) => {
      loading.value = false;
      deudas.value = response.data.data;
      totalItems.value = response.data.total;
    })
    .catch((error) => {
      loading.value = false;
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
function realizarAbono() {
  if (+postData.cantidad > +selectedDeuda.value?.saldo) {
    alert("La cantidad es mayor a la deuda");
    return;
  }
  if (loading.value) return;
  loading.value = true;
  Creditos.realizarAbono(selectedDeuda.value?.id, postData)
    .then(() => {
      if (printWhenFinalize.value) {
        imprimirVenta(selectedDeuda.value);
      }
      openAbono.value = false;
      selectedDeuda.value = null;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    }).finally(() => {
      search.value = String(Date.now());
      loading.value = false;
    });
}
function facturarAbono(abono) {
  if (loading.value) return;
  loading.value = true;
  Creditos.facturar(abono)
    .then(() => {
      openAbono.value = false;
      selectedDeuda.value = null;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    }).finally(() => {
      search.value = String(Date.now());
      loading.value = false;
    });
}
function onWatchPdf(abono) {
  console.log(abono.id, 'abono');

  if (loading.value) return;
  loading.value = true;
  Creditos.downloadPdf(abono.id)
    .then((response) => {
      const file = new Blob([response.data], { type: response.headers['content-type'] });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    }).finally(() => {
      loading.value = false;
    });

}
function onDownloadPdf(abono) {
  if (loading.value) return;
  loading.value = true;
  Creditos.downloadPdf(abono.id)
    .then((response) => {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "factura";
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      loading.value = false;
    });
}
function onDownloadXml(abono) {
  if (loading.value) return;
  loading.value = true;
  Creditos.downloadXml(abono.id)
    .then((response) => {
      const blob = new Blob([response.data], { type: "application/xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "factura";
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  creditoId.value = route.params.creditoId;
  show_settled_loan.value = route.query.show_settled_loan == 1;
  // getDeudas();
  search.value = String(Date.now());
  getClienteInfo()
});
</script>

<style></style>
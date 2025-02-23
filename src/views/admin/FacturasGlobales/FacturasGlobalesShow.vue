<template>
  <v-card class="mb-2" v-if="mdAndUp">
    <v-card-title>Factura global</v-card-title>
    <v-card-text>
      <v-row dense>
        <router-link :to="{ name: 'FacturasGlobalesIndex' }">
          <span class="text-decoration-underline text-caption">
            Regresar al historial de facturas globales
          </span>
        </router-link>
        <div class="mx-4">
          <p>
            #Tickets:{{ factura?.articulos?.length }}
          </p>
          <p>
            Timbres Disponibles: {{ saldo?.saldo ?? 0 }}
          </p>
          <p>
            De:{{ factura.desde }}
          </p>
          <p>
            Hasta:{{ factura.hasta }}
          </p>
          <p>
            Periodicidad: {{ periodicidadName }}
          </p>
        </div>
        <div class="flex flex-col">
          <p>
            Subtotal: ${{ subtotalComputed }}
          </p>
          <p>
            Descuento: ${{ descuentoComputed }}
          </p>
          <p>
            Impuesto Trasladado: ${{ impuestoComputed }}
          </p>
          <p class="font-weight-bold">
            Total: ${{ totalComputed }}
          </p>
        </div>
        <v-btn :loading="cargando" class="mx-4" @click="deleteFacturaGlobal" v-if="!factura.facturado_en"
          prepend-icon="mdi-trash-can">Borrar</v-btn>
        <v-btn :loading="cargando" class="mx-4" @click="isFacturaInfoOpen = true" v-if="!factura.facturado_en"
          prepend-icon="mdi-certificate" color="accent" variant="elevated">Timbrar</v-btn>
        <template v-else>
          <v-btn @click="descargarXml" class="mx-2" prepend-icon="mdi-xml" size="small">Descargar Xml</v-btn>
          <v-btn @click="descargarPdf" class="mx-2" prepend-icon="mdi-file-pdf-box" size="small">Descargar Pdf</v-btn>
          <p class="mx-2">Facturado en: {{ moment(factura.facturado_en).format('DD-MM-YYYY h:mma') }}</p>
        </template>
      </v-row>
    </v-card-text>
    <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
  </v-card>
  <v-card class="mb-2" v-if="smAndDown">
    <v-card-title>Factura global</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12">
          <v-row dense>
            <v-spacer></v-spacer>
            <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
              @click="drawer = true">
              Detalles
            </v-btn>
          </v-row>
        </v-col>
        <v-col cols="12">
          <router-link :to="{ name: 'FacturasGlobalesIndex' }">
            <span class="text-decoration-underline text-caption">
              Regresar al historial de facturas globales
            </span>
          </router-link>
        </v-col>
      </v-row>
    </v-card-text>
    <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
  </v-card>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary
    v-if="smAndDown">
    <v-card>
      <v-container>
        <v-row dense>
          <v-btn :loading="cargando" block class="my-1" @click="isFacturaInfoOpen = true" v-if="!factura.facturado_en"
            prepend-icon="mdi-certificate" color="accent" variant="elevated">Timbrar</v-btn>
          <v-btn :loading="cargando" block class="my-1" @click="deleteFacturaGlobal" v-if="!factura.facturado_en"
            prepend-icon="mdi-trash-can">Borrar</v-btn>
          <template v-else>
            <v-btn @click="descargarXml" class="mx-2" prepend-icon="mdi-xml">Descargar Xml</v-btn>
            <v-btn @click="descargarPdf" class="mx-2" prepend-icon="mdi-file-pdf-box">Descargar Pdf</v-btn>
            <p class="mx-2">Facturado en: {{ moment(factura.facturado_en).format('DD-MM-YYYY h:mma') }}</p>
          </template>
          <div>
            <p>
              #Tickets:{{ factura?.articulos?.length }}
            </p>
            <p>
              Timbres Disponibles: {{ saldo?.saldo ?? 0 }}
            </p>
            <p>
              De:{{ factura.desde }}
            </p>
            <p>
              Hasta:{{ factura.hasta }}
            </p>
            <p>
              Periodicidad: {{ periodicidadName }}
            </p>
          </div>
          <div class="flex flex-col">
            <p>
              Subtotal: ${{ subtotalComputed }}
            </p>
            <p>
              Descuento: ${{ descuentoComputed }}
            </p>
            <p>
              Impuesto Trasladado: ${{ impuestoComputed }}
            </p>
            <p>
              Total: ${{ totalComputed }}
            </p>
          </div>

        </v-row>
      </v-container>
    </v-card>
  </v-navigation-drawer>

  <v-container fluid>
    <v-data-table :headers="headers" :items="factura?.articulos" dense>
      <template v-slot:item.consecutivo="{ item }">
        <router-link :to="{ name: 'VentasShow', params: { ventaId: item.ventaticket?.id } }"
          :class="[checkMaxVentaticket(item.ventaticket?.id) ? 'text-accent' : '']">
          <span>{{
            item.ventaticket?.consecutivo }}</span>
        </router-link>
      </template>
      <template v-slot:item.subtotal="{ item }">
        <span>${{ item.ventaticket?.subtotal }}</span>
      </template>
      <template v-slot:item.descuento="{ item }">
        <span>${{ item.ventaticket?.descuento }}</span>
      </template>
      <template v-slot:item.impuesto_traslado="{ item }">
        <span>${{ item.ventaticket?.impuesto_traslado }}</span>
      </template>
      <template v-slot:item.total="{ item }">
        <span class="font-weight-bold">${{ item.ventaticket?.total }}</span>
      </template>
    </v-data-table>
  </v-container>
  <v-dialog v-model="isFacturaInfoOpen" max-width="800">
    <v-card>
      <v-card-title>Información de CFDI</v-card-title>
      <v-card-text>
        <v-text-field label="Periodicidad" v-model="periodicidadName" readonly></v-text-field>
        <v-text-field label="Serie (opcional)" v-model="facturaInfo.serie"></v-text-field>
        <v-select :items="pagoFormas" label="Forma de pago" v-model="facturaInfo.forma_pago"></v-select>
        <v-select label="Año" :items="years" v-model="facturaInfo.year"></v-select>
        <v-select label="Mes" :items="meses" v-model="facturaInfo.mes"></v-select>
        <v-text-field label="Clave privada local" v-model="facturaInfo.clave_privada_local"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isFacturaInfoOpen = false" :loading="cargando">Cancelar</v-btn>
        <v-btn @click.stop="timbrarFacturaGlobal" variant="outlined" color="accent" prepend-icon="mdi-certificate"
          :loading="cargando">Timbrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style scoped></style>
<script setup>
import { ref, reactive } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { computed, onMounted } from "vue";
import moment from 'moment-timezone';
import Organizacion from "../../../apis/Organizacion";
import { useToasterStore } from "../../../s/toaster";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@js/s";
import { useDisplay } from "vuetify";
const { xs, mdAndUp, mdAndDown, smAndDown } = useDisplay()
const s = useUserStore();
const { handleOpException } = s;
const toasterStore = useToasterStore();
const route = useRoute();
const router = useRouter();
const facturaId = ref(route.params.facturaId);

const cargando = ref(false);
const drawer = ref(false);
const factura = ref({});
const saldo = ref(null);
const maxVentaticket = ref(null);

const headers = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Ticket folio', key: 'consecutivo', align: 'start', sortable: false },
  { title: 'Subtotal', key: 'subtotal', align: 'start', sortable: false },
  { title: 'Descuento', key: 'descuento', align: 'start', sortable: false },
  { title: 'Impuesto trasladado', key: 'impuesto_traslado', align: 'start', sortable: false },
  { title: 'Total', key: 'total', align: 'start', sortable: false },
]);
const facturaInfo = reactive({
  serie: '',
  uso_cfdi: '',
  clave_privada_local: '',
  ticketIds: [],
  c_periodicidad: '',
  year: null,
  mes: "01",
  forma_pago: "01",
})
const years = ref([]);
const meses = ref([
  { value: "01", title: "Enero" },
  { value: "02", title: "Febrero" },
  { value: "03", title: "Marzo" },
  { value: "04", title: "Abril" },
  { value: "05", title: "Mayo" },
  { value: "06", title: "Junio" },
  { value: "07", title: "Julio" },
  { value: "08", title: "Agosto" },
  { value: "09", title: "Septiembre" },
  { value: "10", title: "Octubre" },
  { value: "11", title: "Noviembre" },
  { value: "12", title: "Diciembre" },
]);
const pagoFormas = [
  { "value": "01", "title": "Efectivo" },
  { "value": "02", "title": "Cheque nominativo" },
  { "value": "03", "title": "Transferencia electrónica de fondos" },
  { "value": "04", "title": "Tarjeta de crédito" },
  { "value": "05", "title": "Monedero electrónico" },
  { "value": "06", "title": "Dinero electrónico" },
  { "value": "08", "title": "Vales de despensa" },
  { "value": "12", "title": "Dación en pago" },
  { "value": "13", "title": "Pago por subrogación" },
  { "value": "14", "title": "Pago por consignación" },
  { "value": "15", "title": "Condonación" },
  { "value": "17", "title": "Compensación" },
  { "value": "23", "title": "Novación" },
  { "value": "24", "title": "Confusión" },
  { "value": "25", "title": "Remisión de deuda" },
  { "value": "26", "title": "Prescripción o caducidad" },
  { "value": "27", "title": "A satisfacción del acreedor" },
  { "value": "28", "title": "Tarjeta de débito" },
  { "value": "29", "title": "Tarjeta de servicios" },
  { "value": "30", "title": "Aplicación de anticipos" },
  { "value": "31", "title": "Intermediario pagos" },
  { "value": "99", "title": "Por definir" }
];
const periodicidadName = computed(() => {
  const periodicidad = factura.value.c_periodicidad;
  if (periodicidad == '01') {
    return 'Diario';
  }
  if (periodicidad == '02') {
    return 'Semanal';
  }
  if (periodicidad == '03') {
    return 'Quincenal';
  }
  if (periodicidad == '04') {
    return 'Mensual';
  }
  if (periodicidad == '05') {
    return 'Bimestral';
  }
  return "Configura periodicidad"
})
const totalComputed = computed(() => {
  const suma = +subtotalComputed.value + +impuestoComputed.value - +descuentoComputed.value;
  return roundToNearestFiveCents(suma).toFixed(2)
});
const roundToNearestFiveCents = (number) => {
  return parseFloat((Math.round(number / 0.05) * 0.05).toFixed(2));
}
const impuestoComputed = computed(() => {
  if (!factura.value.articulos) {
    return 0;
  }
  const suma = factura.value.articulos.reduce(
    (partial_sum, a) => partial_sum + +a.impuesto_traslado,
    0
  );
  return suma.toFixed(2)
});
const descuentoComputed = computed(() => {
  if (!factura.value.articulos) {
    return 0;
  }
  const suma = factura.value.articulos.reduce(
    (partial_sum, a) => partial_sum + +a.descuento,
    0
  );
  return suma.toFixed(2)
});
const subtotalComputed = computed(() => {
  if (!factura.value.articulos) {
    return 0;
  }
  const suma = factura.value.articulos.reduce(
    (partial_sum, a) => partial_sum + +a.subtotal,
    0
  );
  return suma.toFixed(2)
});
const isFacturaInfoOpen = ref(false);
const currentYear = new Date().getFullYear();
const month = new Date().getMonth().toString();
facturaInfo.mes = month > 9 ? month : "0" + month
facturaInfo.year = currentYear;
years.value = Array.from({ length: 5 }, (_, index) => (currentYear - 1 + index).toString()).map((item) => {
  return {
    value: item,
    title: item,
  }
});
const checkMaxVentaticket = (ventaticket) => {
  return ventaticket == maxVentaticket.value
}
const timbrarFacturaGlobal = async () => {
  if (!saldo.value?.saldo) {
    alert('No tienes suficientes timbres fiscales, contacta con la administración para solicitar timbres fiscales')
    return;
  }

  const res = confirm('Estas seguro?');
  if (!res) return;
  if (cargando.value) return;
  cargando.value = true;
  try {
    const { data } = await Organizacion.timbrarFacturaGlobal(facturaId.value, facturaInfo);
    if (data.success) {
      isFacturaInfoOpen.value = false;
    }
    await loadInitialData()
  } catch (error) {
    if (error?.response?.status === 422) {
      console.log(error.response.data.errors);
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        toasterStore.warning({ text: value, title: "" })
      }
    }
  } finally {
    cargando.value = false
  }
}
const deleteFacturaGlobal = async () => {
  const res = confirm('Estas seguro?');
  if (!res) return;
  if (cargando.value) return;
  cargando.value = true;
  try {
    const { data } = await Organizacion.deleteFacturaGlobal(facturaId.value);
    if (data.success) {
      router.push({ name: 'FacturasGlobalesIndex' })
    }
  } catch (error) {
    if (error?.response?.status === 422) {
      console.log(error.response.data.errors);
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        toasterStore.warning({ text: value, title: "" })
      }
    }
  } finally {
    cargando.value = false
  }
}
const getConfigurations = async () => {
  try {
    const { data } = await Organizacion.getConfigurations()
    facturaInfo.c_periodicidad = data.c_periodicidad;
  } catch (error) {
    console.log(error);
  } finally {
    cargando.value = false
  }
}
function descargarPdf() {
  if (cargando.value) return;
  cargando.value = true;
  Organizacion.descargarPdf(facturaId.value)
    .then((response) => {
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = "factura"
      link.click()
      URL.revokeObjectURL(link.href)
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function descargarXml() {
  if (cargando.value) return;
  cargando.value = true;
  Organizacion.descargarXml(facturaId.value)
    .then((response) => {
      const blob = new Blob([response.data], { type: 'application/xml' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = "factura"
      link.click()
      URL.revokeObjectURL(link.href)
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}

const loadInitialData = async () => {
  try {
    const { data } = await Organizacion.facturasGlobalesShow(facturaId.value)
    const { data: newData } = await Organizacion.getFoliosSaldo();
    maxVentaticket.value = data.maxVentaticket
    factura.value = data.factura
    saldo.value = newData?.saldo

    getConfigurations()

  } catch (error) {
    console.log(error);
  } finally {
    cargando.value = false
  }
}
onMounted(() => {
  loadInitialData()
})
</script>
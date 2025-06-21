<template>
  <v-card class="mb-2">
    <v-card-title>Crear factura global</v-card-title>
    <v-card-text>
      <router-link :to="{ name: 'FacturasGlobalesIndex' }">
        <span class="text-decoration-underline text-caption">
          Regresar al historial de facturas globales
        </span>
      </router-link>
      <p>
        #Tickets: {{ facturaInfo.ticketIds.length }}
      </p>
      <p>
        Periodicidad: {{ periodicidadName }}
      </p>
      <v-row dense class="mt-4">
        <v-date-input label="Desde" v-model="dfecha" hide-details max-width="300"></v-date-input>
        <v-date-input label="Hasta" v-model="hfecha" hide-details max-width="300"></v-date-input>
        <v-btn :loading="cargando" class="mx-4" @click="preProcesar" color="accent" variant="elevated">Procesar</v-btn>
      </v-row>
    </v-card-text>
    <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
  </v-card>
  <v-container>
    <v-virtual-scroll :items="ventatickets" max-height="500">
      <template v-slot:default="{ item }">
        <v-list-item :subtitle="`Folio: ${item.consecutivo} Total: $${item.total} `"
          :title="`Fecha: ${moment(item.pagado_en).format('DD-MM-YYYY h:mm a')}`">
          <template v-slot:prepend>
            <router-link :to="{ name: 'VentasShow', params: { ventaId: item.id } }" class="secondary">
              <v-icon color="primary_d700">mdi-open-in-new</v-icon>
            </router-link>
            <v-checkbox v-model="facturaInfo.ticketIds" :value="item.id" hide-details></v-checkbox>
          </template>
          <template v-slot:append>
          </template>
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </v-container>
</template>
<style scoped></style>
<script setup>
import moment from 'moment-timezone';
import { ref, reactive } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { computed, onMounted } from "vue";
import Organizacion from "../../../apis/Organizacion";
import { useMessagesStore } from "../../../s/messages";
import { useRoute, useRouter } from "vue-router";
import useMisFechas from "../../../composables/useMisFechas";
import { useUserStore } from "@js/s";
const s = useUserStore();
const { handleOpException } = s;

const messages = useMessagesStore();

const cargando = ref(false);
const ventatickets = ref([]);
const all = ref(true);
const facturaInfo = reactive({
  ticketIds: [],
  c_periodicidad: '',
  desde: '',
  hasta: '',
})
const periodicidadName = computed(() => {
  const periodicidad = facturaInfo.c_periodicidad;
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
const { dfecha, hfecha } = useMisFechas();
const router = useRouter();
const route = useRoute();

watch(() => route.query, () => {
  getVentatickets();
})
const getVentatickets = async () => {
  if (cargando.value) return;
  cargando.value = true;
  try {
    const { data } = await Organizacion.getGlobalVentatickets({
      desde: dfecha.value,
      hasta: hfecha.value,
    });
    ventatickets.value = data;
    all.value = true;
    facturaInfo.ticketIds = ventatickets.value.filter((item) => {
      return !item.pre_factura
    }).map((item) => {
      return item.id
    })
  } catch (error) {
    if (error?.response?.status === 422) {
      console.log(error.response.data.errors);
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        messages.add({ text: value, color: "error" })
      }
      return;
    }

  } finally {
    cargando.value = false
  }
}

const preProcesar = async () => {
  const res = confirm('Estas seguro?');
  if (!res) return;
  if (cargando.value) return;
  cargando.value = true;
  facturaInfo.desde = dfecha.value;
  facturaInfo.hasta = hfecha.value;
  try {
    const { data } = await Organizacion.preProcesar(facturaInfo);
    if (data.success) {
      router.push({ name: "FacturasGlobalesShow", params: { facturaId: data.pre_factura_global_id } });
    }
  } catch (error) {
    if (error?.response?.status === 422) {
      console.log(error.response.data.errors);
      for (const [key, value] of Object.entries(error.response.data.errors)) {
        messages.add({ text: value, title: "error" })
      }
    }
    handleOpException(error);
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
onMounted(() => {
  if (route.query.dfecha) {
    dfecha.value = moment(route.query.dfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.hfecha) {
    hfecha.value = moment(route.query.hfecha, 'YYYY-MM-DD').toDate();
  }
  getConfigurations()
  getVentatickets()
})
</script>
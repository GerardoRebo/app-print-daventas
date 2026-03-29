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
        Periodicidad: 
       <span v-if="periodicidadName != 'Configura periodicidad'">
          {{ periodicidadName }} 
       </span> 
       <router-link v-else :to="{ name: 'Facturacion' }" class="text-decoration-underline">
          Configura periodicidad
       </router-link>
      </p>
      <v-row dense class="mt-4">
        <!-- Fecha inicio -->
        <v-col cols="12" md="3">
          <v-menu v-model="menuInicio" :close-on-content-click="false" transition="scale-transition" offset-y
            color="primary">
            <template #activator="{ props }">
              <v-text-field color="primary" v-bind="props" v-model="formattedDFecha" @update:model-value="updateDFecha"
                label="Fecha inicio" prepend-inner-icon="mdi-calendar" readonly clearable />
            </template>
            <v-date-picker v-model="dfecha" @update:model-value="menuInicio = false" color="primary" />
          </v-menu>
        </v-col>

        <!-- Fecha fin -->
        <v-col cols="12" md="3">
          <v-menu v-model="menuFin" :close-on-content-click="false" transition="scale-transition" offset-y
            color="primary">
            <template #activator="{ props }">
              <v-text-field v-bind="props" v-model="formattedHFecha" @update:model-value="updateHFecha"
                label="Fecha fin" prepend-inner-icon="mdi-calendar" readonly clearable color="primary" />
            </template>
            <v-date-picker v-model="hfecha" @update:model-value="menuFin = false" color="primary" />
          </v-menu>
        </v-col>

        <!-- Botón procesar -->
        <v-col cols="12" md="6" class="d-flex align-top">
          <v-btn :loading="cargando" @click="preProcesar" color="primary" variant="elevated">Procesar</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
  </v-card>
  <v-container>
    <v-virtual-scroll :items="ventatickets" max-height="500">
      <template v-slot:default="{ item }">
        <v-list-item :subtitle="`Folio: ${item.consecutivo} Total: $${item.total} `"
          :title="`Fecha: ${moment(item.pagado_en).format('DD-MM-YYYY h:mm a')}`">
          <template v-slot:prepend>
            <router-link :to="{ name: 'VentasShow', params: { ventaId: item.id } }" class="secondary">
              <v-icon color="secondary">mdi-open-in-new</v-icon>
            </router-link>
            <v-checkbox v-model="facturaInfo.ticketIds" :value="item.id" hide-details></v-checkbox>
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
import { useRoute, useRouter } from "vue-router";
import useMisFechas from "@js/composables/useMisFechas";
import { useUserStore } from "@js/s";
import { useNotification } from "@js/composables/useNotification";
const s = useUserStore();
const { handleOpException } = s;
const { notify } = useNotification();

const menuInicio = ref(false);
const menuFin = ref(false);
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
const { dfecha, hfecha, formattedDFecha, formattedHFecha, updateDFecha, updateHFecha } = useMisFechas();
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
    console.log(error);
    handleOpException(error);

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
        notify.warning(value)
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
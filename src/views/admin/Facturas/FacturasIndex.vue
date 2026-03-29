<template>
  <v-card class="mb-2">
    <v-card-title>Facturas</v-card-title>
    <v-card-text>
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

        <!-- Botón descargar CSV -->
        <v-col cols="12" md="3" >
          <v-btn
            color="success"
            prepend-icon="mdi-download"
            @click="descargarCSV"
            :loading="cargandoExport"
            variant="flat"
          >
            Descargar CSV
          </v-btn>
        </v-col>

      </v-row>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-table density="compact" color="secondary">
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(factura, index) in facturas.data" :key="index" class="hover:bg-blue-200">
          <td>
            {{ factura.id }}
          </td>
          <td>
            <div v-if="factura.facturable_type == 'App\\Models\\Ventaticket'">
              <router-link :to="{ name: 'VentasShow', params: { ventaId: factura?.facturable?.id ?? 1 } }"
                class="text-primary">
                {{ factura.facturable.consecutivo }}
              </router-link>
            </div>
            <div v-if="factura.facturable_type == 'App\\Models\\Cotizacion'">
              <router-link :to="{ name: 'VentasShow', params: { ventaId: factura?.facturable?.id ?? 1 } }"
                class="text-primary">
                {{ factura.facturable.consecutivo }}
              </router-link>
            </div>
          </td>
          <td>
            <p v-if="factura.facturado_en">
              {{ moment(factura.facturado_en).format('DD-MM-YYYY h:mm a') }}
            </p>
          </td>
          <td>
            ${{ factura.subtotal }}
          </td>
          <td>
            ${{ factura.subtotal }}
          </td>
          <td>
            ${{ factura.descuento }}
          </td>
          <td>
            ${{ factura.impuesto_traslado }}
          </td>
          <td>
            ${{ factura.impuesto_retenido }}
          </td>
          <td>
            ${{ factura.total }}
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-row class=" ma-1" justify="end">
      <v-pagination v-model="page" :length="facturas.last_page" :total-visible="3"></v-pagination>
    </v-row>
  </v-container>
</template>
<style scoped></style>
<script setup>
import moment from 'moment-timezone';
import { ref } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { onMounted } from "vue";
import Organizacion from "../../../apis/Organizacion";
import useMisFechas from "@js/composables/useMisFechas";
import { useRoute, useRouter } from 'vue-router';
const { dfecha, hfecha, formattedDFecha, formattedHFecha, updateDFecha, updateHFecha } = useMisFechas();

const menuInicio = ref(false);
const menuFin = ref(false);
const cargando = ref(false);
const cargandoExport = ref(false);
const facturas = ref([]);
const router = useRouter();
const route = useRoute();
const page = ref(1);
watch(page, (newVal) => {
  onPagination(newVal)
})
const onPagination = (page) => {
  router
    .push({ name: route.name, query: { ...route.query, page } })
    .catch(() => {
    }).finally(() => {
      getFacturas()
    });
};
watch([dfecha, hfecha], () => {
  getFacturas()
});

const tHeaders = ref([
  "Id",
  "Ticket Folio",
  "Fecha",
  "Subtotal",
  "Descuento",
  "Impuesto Trasladado",
  "Impuesto Retenido",
  "Total",
  "",
]);
const getFacturas = async () => {
  try {
    const { data } = await Organizacion.getFacturas({
      desde: dfecha.value,
      hasta: hfecha.value,
      page: page.value,
    })
    facturas.value = data.facturas
  } catch (error) {
    console.log(error);
  } finally {
    cargando.value = false
  }
}

const descargarCSV = async () => {
  try {
    cargandoExport.value = true;
    const response = await Organizacion.exportFacturasCSV({
      desde: dfecha.value,
      hasta: hfecha.value,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facturas_${moment(dfecha.value ?? new Date()).format('YYYY-MM-DD')}_${moment(hfecha.value ?? new Date()).format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar CSV:', error);
  } finally {
    cargandoExport.value = false;
  }
}

onMounted(() => {
  if (route.query.dfecha) {
    dfecha.value = moment(route.query.dfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.hfecha) {
    hfecha.value = moment(route.query.hfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.page) {
    page.value = parseInt(route.query.page);
  }
  getFacturas()
})
</script>
<template>
  <v-card class="mb-2">
    <v-card-title>Reportes</v-card-title>
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
        <v-col cols="12" sm="8" class="flex items-center space-x-2">
          <v-row class="gap-2">
            <!-- Botones rápidos -->
            <v-btn size="small" variant="outlined" @click="setQuickRange('today')">Hoy</v-btn>
            <v-btn size="small" variant="outlined" @click="setQuickRange('week')">Semana</v-btn>
            <v-btn size="small" variant="outlined" @click="setQuickRange('month')">Mes</v-btn>
            <v-btn size="small" variant="outlined" @click="setQuickRange('lastMonth')">Mes pasado</v-btn>
            <p class="mx-2">
              Nota: El rango máximo es de dos años.
            </p>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <div class="flex flex-col px-4">
    <v-skeleton-loader v-if="loading" type="card"></v-skeleton-loader>

    <template v-else>
      <v-card>
        <v-card-title>Totales</v-card-title>
        <v-card-text>
          En este reporte se muestran las ventas, compras, ganancias, abonos y devoluciones de clientes
          en el rango de fechas seleccionado.
          <div class="w-full px-4 min-w-0 bg-gray-100 rounded-md my-4">
            <canvas ref="dailyTotalsRef"></canvas>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="my-4">
        <v-card-title>Totales acumulados</v-card-title>
        <v-card-text>
          En este reporte se muestran los totales acumulados de ventas, compras, ganancias,
          abonos y devoluciones de clientes en el rango de fechas seleccionado.
          <div class="w-full px-4 min-w-0 bg-gray-100 rounded-md">
            <canvas ref="totalsRef"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import moment from "moment-timezone";
import Cortes from "@js/apis/Cortes";
import Chart from "chart.js/auto";
import useMisFechas from "@js/composables/useMisFechas";
import { useRoute, useRouter } from "vue-router";
import useQuery from "../../composables/useQuery";

const router = useRouter();
const route = useRoute();
const { dfecha, hfecha, formattedDFecha, formattedHFecha, updateDFecha, updateHFecha } = useMisFechas();
const { pushQuery } = useQuery();

const loading = ref(false);
const dailyTotalsRef = ref(null)
const totalsRef = ref(null)
const menuInicio = ref(false);
const menuFin = ref(false);

watch(() => route.query, () => getAcumulados());
watch(dfecha, () => {
  pushQuery("dfecha", formattedDFecha.value);
  localStorage.setItem("report_dfecha", formattedDFecha.value);
});
watch(hfecha, () => {
  pushQuery("hfecha", moment(hfecha.value).format("YYYY-MM-DD"));
  localStorage.setItem("report_hfecha", moment(hfecha.value).format("YYYY-MM-DD"));
});

function setQuickRange(type) {
  let start, end;
  const today = moment();

  switch (type) {
    case "today":
      start = today.clone();
      end = today.clone();
      break;
    case "week":
      start = today.clone().startOf("week");
      end = today.clone().endOf("week");
      break;
    case "month":
      start = today.clone().startOf("month");
      end = today.clone().endOf("month");
      break;
    case "lastMonth":
      start = today.clone().subtract(1, "month").startOf("month");
      end = today.clone().subtract(1, "month").endOf("month");
      break;
  }

  dfecha.value = start.toDate();
  hfecha.value = end.toDate();
}

async function getAcumulados() {
  loading.value = true;
  try {
    const response = await Cortes.getAcumulados(dfecha.value, hfecha.value);

    // primero apagamos el loader
    loading.value = false;

    // esperamos a que Vue pinte los canvas en el DOM
    await nextTick();

    // ahora sí, ya existen los canvas
    loadChart(response.data.dailyTotals);
    loadChartTotals(response.data.totals);
  } catch (error) {
    console.error(error);
    alert("Ha ocurrido un error");
    loading.value = false;
  }
}

let chartInstance = null;
const loadChart = (data) => {
  const ctx = dailyTotalsRef.value?.getContext("2d");
  if (!ctx) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((row) => row.date),
      datasets: [
        {
          label: "Ventas",
          data: data.map((row) => row.acumulado_ventas),
          borderColor: "rgba(0, 200, 0, 1)",
          borderWidth: 2,
          fill: false,
        },
        // ... tus demás datasets
      ],
    },
  });
};

let chartTotalsInstance = null;
const loadChartTotals = (data) => {
  const ctx = totalsRef.value?.getContext("2d");
  if (!ctx) return;


  if (chartTotalsInstance) chartTotalsInstance.destroy();

  chartTotalsInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Ventas", "Compras", "Ganancias", "Abonos Cliente", "Devoluciones Cliente"],
      datasets: [
        {
          label: "Totales",
          data: Object.values(data),
          backgroundColor: [
            "rgba(0,200,0,0.3)",
            "rgba(255,0,0,0.3)",
            "rgba(0,200,200,0.3)",
            "rgba(0,120,255,0.3)",
            "rgba(200,200,0,0.3)",
          ],
          borderColor: [
            "rgba(0,200,0,1)",
            "rgba(255,0,0,1)",
            "rgba(0,200,200,1)",
            "rgba(0,120,255,1)",
            "rgba(200,200,0,1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });
};

onMounted(() => {
  if (route.query.dfecha) {
    dfecha.value = moment(route.query.dfecha, "YYYY-MM-DD").toDate();
  }

  if (route.query.hfecha) {
    hfecha.value = moment(route.query.hfecha, "YYYY-MM-DD").toDate();
  }

  getAcumulados();
});
</script>

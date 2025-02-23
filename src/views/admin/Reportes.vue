<template>
  <v-card class="mb-2">
    <v-card-title>Cortes</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-col cols="12" sm="2">
          <v-date-input label="Desde" v-model="dfecha" hide-details></v-date-input>
        </v-col>
        <v-col cols="12" sm="2">
          <v-date-input label="Hasta" v-model="hfecha" hide-details></v-date-input>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <div class="flex flex-col px-4">
    <div class="w-full px-4 min-w-0 bg-gray-100 rounded-md my-4"><canvas id="dailyTotals"></canvas></div>
    <div class="w-full px-4 min-w-0 bg-gray-100 rounded-md"><canvas id="totals"></canvas></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import moment from "moment-timezone"
import Cortes from "@js/apis/Cortes";
import Chart from 'chart.js/auto'
import useMisFechas from "@js/composables/useMisFechas";
import { useRoute, useRouter } from "vue-router";
import useQuery from "../../composables/useQuery";

const router = useRouter();
const route = useRoute();
const { dfecha, hfecha, formattedDFecha } = useMisFechas();
const { pushQuery } = useQuery();


watch(() => route.query, () => getAcumulados())
watch(dfecha, () => {
  pushQuery('dfecha', formattedDFecha.value)
});
watch(hfecha, () => {
  pushQuery('hfecha', dfecha.value)
});
function getAcumulados() {
  Cortes.getAcumulados(dfecha.value, hfecha.value)
    .then((response) => {
      loadChart(response.data.dailyTotals);
      loadChartTotals(response.data.totals);
    })
    .catch((error) => {
      console.log(error);
      return
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
let chartInstance = null;

const loadChart = (data) => {
  const ctx = document.getElementById('dailyTotals');

  // Destroy the previous chart instance if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create a new chart instance
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(row => row.date),
      datasets: [
        {
          label: 'Ventas',
          data: data.map(row => row.acumulado_ventas),
          // You can also customize the dataset (color, etc.) here if needed
          borderColor: 'rgba(0, 128, 0, 1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Abonos de clientes',
          data: data.map(row => row.abonos_efectivo),
          // You can also customize the dataset (color, etc.) here if needed
          borderColor: 'rgba(0,255,255, 1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Ganacias',
          data: data.map(row => row.acumulado_ganancias),
          // You can also customize the dataset (color, etc.) here if needed
          borderColor: 'rgba(0,0,255, 1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Compras de mercancia',
          data: data.map(row => row.compras),
          // You can also customize the dataset (color, etc.) here if needed
          borderColor: 'rgba(128,0,0, 10)',
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Devoluciones',
          data: data.map(row => row.devoluciones_ventas_efectivo),
          // You can also customize the dataset (color, etc.) here if needed
          borderColor: 'rgba(128,128,0, 10)',
          borderWidth: 2,
          fill: false
        }
      ]
    }
  });
}
let chartTotalsInstance = null;
const loadChartTotals = (data) => {
  const ctx = document.getElementById('totals');

  // Destroy the previous chart instance if it exists
  if (chartTotalsInstance) {
    chartTotalsInstance.destroy();
  }

  // Create a new chart instance
  chartTotalsInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Ventas', 'Compras', 'Ganancias', 'Abonos Cliente', 'Devoluciones Cliente'],
      datasets: [{
        label: 'Totales',
        data: Object.values(data),
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

onMounted(() => {
  if (route.query.dfecha) {
    dfecha.value = moment(route.query.dfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.hfecha) {
    hfecha.value = moment(route.query.hfecha, 'YYYY-MM-DD').toDate();
  }
  getAcumulados();
});
</script>
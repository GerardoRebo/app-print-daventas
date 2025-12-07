<template>
  <v-container fluid class="py-0 mt-2">
    <v-card class="mb-2">
      <v-card-title>Corte de Caja</v-card-title>
      <v-card-text>
        <v-btn v-if="!turno_actual?.id" @click="abrirInicial" :loading="cargando" class="mx-2" variant="outlined"
          color="primary">Habilitar
          Caja</v-btn>
        <v-btn v-if="turno_actual?.id" @click="abrirCorte" :loading="cargando" class="mx-2" variant="elevated"
          color="primary">Realizar
          corte</v-btn>
        <v-btn v-if="turno_actual?.id" @click="abrirCaja" :loading="cargando" class="mx-2">Movimiento</v-btn>
      </v-card-text>
    </v-card>
  </v-container>

  <v-container fluid>
    <template v-if="loadingInitial">
      <v-skeleton-loader type="table" />
    </template>
    <template v-else>
      <v-row>
        <v-col>
          <CortesSumary :turno_actual="turno_actual" @openVMovCaja="isVMovCaja = true"></CortesSumary>
        </v-col>
        <v-col>
          <v-card>
            <div class="w-full max-w-4xl min-w-0 bg-gray-50 rounded-md"><canvas id="acquisitions"></canvas></div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
  <v-dialog v-model="isVisible" max-width="600">
    <v-card>
      <v-card-title>Efectivo en caja ${{ formatNumber(efectivoCaja) }}</v-card-title>
      <v-card-text>
        <v-text-field label="Efectivo al cierre" autocomplete="off" placeholder="" v-model="efectivoCierre"
          ref="efectivoCierreRef" @keydown.enter.prevent="realizarCorte"
          :error-messages="errors.cantidad ? errors.cantidad[0] : null" />
        <v-textarea v-model="comments" @keydown.enter.prevent="realizarCorte" label="Comentario" variant="outlined">
        </v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false">Cancelar</v-btn>
        <v-btn @click="realizarCorte" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="openCaja" max-width="600">
    <v-card>
      <v-card-title>Movimiento de caja </v-card-title>
      <v-card-text>
        <v-select :items="[
          { value: 'entrada', title: 'Entrada' },
          { value: 'salida', title: 'Salida' },
        ]" v-model="tipo" label="Tipo" ref="tipoRef"></v-select>
        <v-select :items="conceptosItems" v-model="concepto" label="Concepto"></v-select>
        <v-checkbox v-model="es_gasto" label="Es gasto"
          hint="Marca esta opción si este movimiento es un gasto real. Si no, será tratado como un movimiento interno."
          persistent-hint v-if="tipo === 'salida'" class="mb-6"></v-checkbox>
        <v-text-field label="Cantidad" autocomplete="off" placeholder="" v-model="cantidad"
          @keydown.enter.prevent="realizarMovimiento" />
        <v-textarea v-model="commentsCaja" @keydown.enter.prevent="realizarMovimiento" label="Descripción"
          variant="outlined">
        </v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openCaja = false">Cancelar</v-btn>
        <v-btn @click="realizarMovimiento" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="openInicial" max-width="600">
    <v-card>
      <v-card-title>Abrir caja</v-card-title>
      <v-card-text>
        <v-text-field label="Efectivo inicial" autocomplete="off" placeholder="" v-model="efInicial" ref="efInicialRef"
          @keydown.enter.prevent="habilitarCaja" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openInicial = false">Cancelar</v-btn>
        <v-btn @click="habilitarCaja" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <mod-mov-caja v-model="isVMovCaja" :user="null"></mod-mov-caja>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "@vue/runtime-core";
import { computed, nextTick } from "vue";
import Cortes from "../apis/Cortes";
import PuntoVenta from "../apis/PuntoVenta";
import ModMovCaja from "@js/components/ModMovCaja.vue";
import CortesSumary from "@js/components/CortesSumary.vue";
import Chart from 'chart.js/auto'
import { useUserStore } from "../s";
import { useCurrency } from '@js/composables/useCurrency';
const { formatNumber } = useCurrency('es-MX', 'MXN');
const s = useUserStore();
const { handleOpException } = s;
const turno_actual = ref(null);
const isVisible = ref(null);
const isVMovCaja = ref(null);
const openCaja = ref(null);
const openInicial = ref(null);
const efInicial = ref(0);
const efInicialRef = ref(null);
const comments = ref("");
const errors = ref([]);
const cantidad = ref(0);
const es_gasto = ref(false);
const conceptos = ref([]);
const loadingInitial = ref(true);
const conceptosItems = computed(() => {
  const al = conceptos.value.map((item) => {
    return {
      title: item.name,
      value: item.id,
    }
  })
  return al
})
const concepto = ref("");
const commentsCaja = ref("");
const tipo = ref("salida");
const tipoRef = ref(null);
const efectivoCierre = ref(0);
const efectivoCierreRef = ref(null);
const ventasVerificado = ref(null);
const cargando = ref(false);
const efectivoCaja = computed(
  () => {
    let eC = +turno_actual.value?.dinero_inicial +
      +turno_actual.value?.ventas_efectivo +
      +turno_actual.value?.acumulado_entradas -
      +turno_actual.value?.devoluciones_ventas_efectivo -
      +turno_actual.value?.acumulado_salidas +
      +turno_actual.value?.abonos_efectivo;
    return eC.toLocaleString()
  }
);

function onEscape(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    isVisible.value = false;
    openInicial.value = false;
    openCaja.value = false;
    isVMovCaja.value = false;
  }
}
const diferencia = computed(() => efectivoCierre.value - efectivoCaja.value);
watch(tipo, () => {
  getConceptos();
});
function limpiarCampos() {
  cantidad.value = null;
  es_gasto.value = null;
  commentsCaja.value = null;
}
function habilitarCaja() {
  if (cargando.value) return;
  cargando.value = true;
  Cortes.habilitarCaja()
    .then(() => {
      Cortes.realizarMovimiento(
        "entrada",
        efInicial.value,
        null,
        "Ingreso Inicial",
        "Ingreso Inicial"
      )
        .then((response) => {
          turno_actual.value = response.data
          // asignar(response.data);
          cargando.value = false;
          openInicial.value = false;
        })
        .catch((error) => {
          //:todo
          alert("Ha ocurrido un error")
          cargando.value = false;
        });
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function realizarCorte() {
  errors.value = []
  if (cargando.value) return;
  cargando.value = true;
  Cortes.realizarCorte(efectivoCierre.value, comments.value, diferencia.value)
    .then((response) => {
      cargando.value = false;
      if (response.data == "TicketsAbiertos") return alert("Tickets Abiertos");
      turno_actual.value = response.data;

      // asignar(response);
      isVisible.value = false;
    })
    .catch((error) => {

      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function realizarMovimiento() {
  if (cargando.value) return;
  cargando.value = true;
  if (tipo.value == 'entrada') {
    es_gasto.value = null;
  }
  Cortes.realizarMovimiento(
    tipo.value,
    cantidad.value,
    es_gasto.value,
    commentsCaja.value,
    concepto.value.toString()
  )
    .then((response) => {
      limpiarCampos();
      turno_actual.value = response.data
      // asignar(response.data);
      openCaja.value = false;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
async function getTurnoActual() {
  try {
    const { data } = await Cortes.getTurnoActual();
    loadingInitial.value = false;
    nextTick(() => {
      loadChart(data[1])
    });
    console.log(data);

    turno_actual.value = data[0]
    // asignar(response.data[0] ?? {});

  } catch (error) {
    handleOpException(error);
    alert("Ha ocurrido un error")
  }
}

function getConceptos() {
  Cortes.getConceptos(tipo.value)
    .then((response) => {
      conceptos.value = response.data;

      if (response.data[0]) {
        concepto.value = response.data[0].id;
      }
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function abrirCaja() {
  cantidad.value = 0;
  commentsCaja.value = null;
  openCaja.value = true;

  nextTick(() => tipoRef.value.focus());
  getConceptos();
}
function abrirCorte() {
  isVisible.value = true;
  nextTick(() => efectivoCierreRef.value.select());
}
function abrirInicial() {
  openInicial.value = true;

  nextTick(() => efInicialRef.value.select());
}
const loadChart = (data) => {
  new Chart(
    document.getElementById('acquisitions'),
    {
      type: 'line',
      data: {
        labels: data.map(row => row.termino_en),
        datasets: [
          {
            label: 'Ventas del mes',
            data: data.map(row => row.acumulado_ventas)
          }
        ]
      }
    }
  );
}

onMounted(async () => {
  await getTurnoActual();
  document.addEventListener("keydown", onEscape);
});
</script>

<style></style>
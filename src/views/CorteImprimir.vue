<template>
  <v-card>
    <v-card-title>
      Corte: #{{ corte?.id }}
    </v-card-title>
    <v-card-text>

      <div class="d-flex">
        <div class="mx-4">
          <label class="text-xs">
            Fecha:
          </label>
          <p class="font-semibold">
            {{ moment(corte?.termino_en).format('DD-MM-YYYY h:mm a') }}
          </p>
        </div>
        <div class="mx-4">
          <label class="text-xs">
            Usuario:
          </label>
          <p class="font-semibold">
            {{ corte?.user?.name }}
          </p>
        </div>
        <div class="mx-4">
          <label class="text-xs">
            Ventas Contado:
          </label>
          <p class="font-semibold">
            ${{ corte?.ventas_efectivo }}
          </p>
        </div>
        <div class="mx-4">
          <label class="text-xs">
            Devoluciones Ventas Contado:
          </label>
          <p>
            - ${{ corte?.devoluciones_ventas_efectivo }}
          </p>
        </div>
        <div class="mx-4">
          <label class="text-xs">
            Ventas Credito:
          </label>
          <p class="font-semibold">
            ${{ corte?.ventas_credito }}
          </p>
        </div>
        <div class="mx-4">
          <label class="text-xs">
            Efectivo al cierre:
          </label>
          <p class="font-semibold">
            ${{ corte?.efectivo_al_cierre }}
          </p>
        </div>
      </div>
    </v-card-text>
  </v-card>
  <v-container>
    <v-table density="compact" color="primary_d700">
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(articulo, index) in articulos" :key="index" class="hover:bg-blue-200">
          <td>{{ articulo.product.codigo }}</td>
          <td>
            <p :class="[
              articulo.es_kit
                ? 'text-green-600 hover:text-green-900'
                : 'text-indigo-600 hover:text-indigo-900',
            ]" class="font-semibold">
              {{ articulo.product.name }}
            </p>
          </td>
          <td class="font-bold">{{ articulo.cantidad }}</td>
          <td>${{ articulo.precio_usado }}</td>
          <td>
            <p class="font-bold">${{ articulo.precio_final }}</p>
          </td>
          <td>${{ articulo.importe_descuento }}</td>
          <td>
            Tras: ${{ articulo.impuesto_traslado }}
            Ret: ${{ articulo.impuesto_retenido }}
            <ul>
              <li v-for="(tax, index) in articulo.taxes" :key="index">
                {{ tax.tax.descripcion }} {{ tax.tax.tasa_cuota }}% - ${{ parseFloat(tax.importe).toFixed(2) }}
              </li>
            </ul>
          </td>
          <td>
            <p class="font-bold">${{ +articulo.precio_final - articulo.importe_descuento + +articulo.impuesto_traslado -
              +articulo.impuesto_retenido }}
            </p>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>
<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Cortes from '@js/apis/Cortes';
import moment from 'moment-timezone';
import { useUserStore } from '@js/s';
const s = useUserStore();
const { handleOpException } = s;
const corteId = ref(null);
const corte = ref(null);
const articulos = ref([]);
const tHeaders = ref([
  "Código",
  "Nombre",
  "Cant",
  "Precio Unitario",
  "Subtotal",
  "Descuento",
  "Impuesto",
  "Importe",
]);

watch(corteId, () => {
  getCorte(corteId.value);
});

function getCorte(id) {
  Cortes.getCorte(id)
    .then((response) => {
      corte.value = response.data.corte;
      articulos.value = response.data.articulos;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
const route = useRoute();
onMounted(() => {
  corteId.value = route.params.id;
});
</script>
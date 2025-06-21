<template>
  <FrameVue>
    <HeaderVue type="general">
      <div class="flex flex-col">
        <p class="font-bold">
          Factura
        </p>
      </div>
      <SimpleButtonVue>Timbrar</SimpleButtonVue>
      <Loading v-if="cargando" />
    </HeaderVue>
    <tabla-vue :headers="tHeaders">
      <template #bodyRow>
        <tr v-for="(factura, index) in factura?.articulos" :key="index" class="hover:bg-blue-200">
          <ta-body-vue>
            {{ factura.id }}
          </ta-body-vue>
          <ta-body-vue>
            {{ factura.ventaticket?.consecutivo }}
          </ta-body-vue>
          <ta-body-vue>
            ${{ factura.subtotal }}
          </ta-body-vue>
          <ta-body-vue>
            ${{ factura.descuento }}
          </ta-body-vue>
          <ta-body-vue>
            ${{ factura.impuesto_traslado }}
          </ta-body-vue>
          <ta-body-vue>
            ${{ factura.impuesto_retenido }}
          </ta-body-vue>
          <ta-body-vue>
            ${{ factura.total }}
          </ta-body-vue>
          <ta-body-vue>
            {{ factura.facturado_en }}
            <p v-if="factura.facturado_en || factura.terminado_en">
              {{ moment(factura.facturado_en || factura.terminado_en).format('DD-MM-YYYY h:mm a') }}
            </p>
          </ta-body-vue>
          <ta-body-vue>
            <router-link :to="{ name: 'FacturasIndex' }">
              <PrimaryButtonVue @click="true">Ver</PrimaryButtonVue>
            </router-link>
          </ta-body-vue>
        </tr>
      </template>
    </tabla-vue>
  </FrameVue>
</template>
<style scoped></style>
<script setup>
import FrameVue from "../../components/FrameVue.vue";
import SimpleButtonVue from "../../components/util/SimpleButtonVue.vue";
import SecondaryButtonVue from "../../components/util/SecondaryButtonVue.vue";
import HeaderVue from "../../components/HeaderVue.vue";
import Loading from "../../components/util/Loading.vue";
import moment from 'moment-timezone';
import { ref, reactive } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";
import { computed, onMounted } from "vue";
import useDate from "../../../composables/useDate";
import Fechas from "../../components/util/Fechas.vue";
import Organizacion from "../../../apis/Organizacion";
import { useMessagesStore } from "../../../s/messages";
import TaBodyVue from "../../components/util/TaBodyVue.vue";
import TablaVue from "../../components/util/TablaVue.vue";
import PrimaryButtonVue from "../../components/util/PrimaryButtonVue.vue";
import { useRoute, useRouter } from "vue-router";
const messages = useMessagesStore();
const router = useRouter();
const route = useRoute();
const facturaId = ref(route.params.facturaId);
const type = ref(route.query.type);

const cargando = ref(false);
const factura = ref([]);

const tHeaders = ref([
  "Id",
  "Ticket Folio",
  "Subtotal",
  "Descuento",
  "Impuesto Trasladado",
  "Impuesto Retenido",
  "Total",
  "Fecha",
  "",
]);
const loadInitialData = async () => {
  try {
    const { data } = await Organizacion.facturasShow(facturaId.value, type.value)

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
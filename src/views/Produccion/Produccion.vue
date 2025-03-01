<script setup>
import { computed, onMounted, ref } from "vue";
import Production from "../../apis/Production";
import Stepper from "./Stepper.vue";
import CardItem from "./CardItem.vue";

const itemsPerPage = ref(4);
const orders = ref([]);

const onClickSeeAll = () => {
  itemsPerPage.value = itemsPerPage.value === 4 ? orders.value.length : 4;
};
const getProductionOrders = async () => {
  const { data } = await Production.index();
  orders.value = data;
};
onMounted(() => {
  getProductionOrders();
});
</script>
<template>
  <v-container fluid>
    <v-data-iterator :items="orders" :items-per-page="itemsPerPage">
      <template v-slot:header="{ page, pageCount, prevPage, nextPage }">
        <h1 class="text-h4 font-weight-bold d-flex justify-space-between mb-4 align-center">
          <div class="text-truncate">Produccion</div>

          <div class="d-flex align-center">
            <v-btn class="me-8" variant="text" @click="onClickSeeAll">
              <span class="text-decoration-underline text-none">Ver todo</span>
            </v-btn>

            <div class="d-inline-flex">
              <v-btn :disabled="page === 1" class="me-2" icon="mdi-arrow-left" size="small" variant="tonal"
                @click="prevPage"></v-btn>

              <v-btn :disabled="page === pageCount" icon="mdi-arrow-right" size="small" variant="tonal"
                @click="nextPage"></v-btn>
            </div>
          </div>
        </h1>
      </template>

      <template v-slot:default="{ items }">
        <v-row>
          <v-col v-for="(item, i) in items" :key="i" cols="12">
            <v-sheet border>
              <!-- <v-img :src="item.raw.src" height="100" cover></v-img> -->
              <v-row>
                <v-col cols="12" md="6">
                  <CardItem :order="item.raw"></CardItem>
                </v-col>
                <v-col cols="12" md="6">
                  <v-row align="start" style="height: 150px;">
                    <v-col>
                      <!-- stepper -->
                      <Stepper :order="item.raw"></Stepper>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-sheet>
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer="{ page, pageCount }">
        <v-footer class="justify-space-between text-body-2 mt-4" color="surface-variant">
          Total ordenes: {{ orders.length }}

          <div>Página {{ page }} de {{ pageCount }}</div>
        </v-footer>
      </template>
    </v-data-iterator>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import Production from "../../apis/Production";
import Stepper from "./Stepper.vue";
import CardItem from "./CardItem.vue";
import { useRoute, useRouter } from "vue-router";

const orders = ref([]);
const clientes = ref([]);
const route = useRoute();
const router = useRouter();
const queryItems = ref({
  cliente_id: "",
  statuses: ['pending', 'design', 'production', 'finishing', 'finished'],
  page: 1,
});

const getProductionOrders = async ({ page, itemsPerPage, sortBy }) => {
  queryItems.value.page = page || queryItems.value.page;
  router.replace(
    {
      name: "Produccion",
      query: {
        ...route.query,
        ...queryItems.value,
      },
    }
  );
  const { data } = await Production.index(queryItems.value);
  orders.value = data.productionOrders;
  clientes.value = [
    { title: "Selecciona", value: '' },
    ...data.clientes.map((cliente) => {
      return {
        title: cliente.name,
        value: cliente.id,
      };
    })
  ]
};
const statusOptions = computed(() => {
  return [
    { title: "Pendiente", value: "pending" },
    { title: "Diseno", value: "design" },
    { title: "Producción", value: "production" },
    { title: "Acabados", value: "finishing" },
    { title: "Finalizado", value: "finished" },
    { title: "Entregado", value: "delivered" },
  ];
});
watch(() => queryItems.value.cliente_id, (newQuery) => {
  getProductionOrders({ page: 1 });
}, { deep: true });
watch(() => queryItems.value.statuses, (newQuery) => {
  getProductionOrders({ page: 1 });
}, { deep: true });

onMounted(() => {
  const queryStatuses = route.query.statuses;
  if (Array.isArray(queryStatuses)) {
    queryItems.value.statuses = queryStatuses
  } else if (typeof queryStatuses === 'string') {
    queryItems.value.statuses = [queryStatuses]
  }
  route.query.statuses = queryItems.value.statuses;
  queryItems.value = { ...route.query };
  // getProductionOrders();
});
</script>
<template>
  <v-container>
    <v-data-iterator :items="orders.data" @update:options="getProductionOrders" :page="queryItems.page" class="mt-4">
      <template v-slot:header="{ page, pageCount, prevPage, nextPage }">
        <h1 class="text-h4 font-weight-bold d-flex justify-space-between mb-4 align-center">
          <div class="text-truncate">Producción</div>
          <div class="d-flex align-center">
            <div class="d-inline-flex">
              <v-btn :disabled="queryItems.page == 1" class="me-2" icon="mdi-arrow-left" size="small" variant="tonal"
                @click="getProductionOrders({ page: +queryItems.page - 1 })"></v-btn>

              <v-btn :disabled="queryItems.page == orders.last_page" icon="mdi-arrow-right" size="small" variant="tonal"
                @click="getProductionOrders({ page: +queryItems.page + 1 })"></v-btn>
            </div>
          </div>
        </h1>
        <v-row dense justify-start align="center" class="mb-8">
          <v-select label="Estado" :items="statusOptions" density="compact" hide-details class="mr-4" multiple
            v-model="queryItems.statuses" max-width="800">
          </v-select>
          <v-autocomplete label="Cliente" density="compact" variant="outlined" hide-details class="mr-4"
            v-model="queryItems.cliente_id" :items="clientes" clearable max-width="800">
          </v-autocomplete>
          <div class="mr-4">
            Total ordenes: {{ orders.total }}
          </div>
          <div>Página {{ queryItems.page }} de {{ orders.last_page }}</div>
        </v-row>
      </template>
      <template v-slot:default="{ items }">
        <v-row>
          <v-col v-for="(item, i) in items" :key="i" cols="12">
            <v-card border>
              <!-- <v-img :src="item.raw.src" height="100" cover></v-img> -->
              <v-row>
                <v-col cols="12" md="6">
                  <CardItem :order="item.raw"></CardItem>
                </v-col>
                <v-col cols="12" md="6">
                  <Stepper :order="item.raw"></Stepper>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </template>
      <template v-slot:footer="{ page, pageCount }">
        <v-footer class="justify-space-between text-body-2 mt-4" color="surface-variant">
          Total ordenes: {{ orders.total }}

          <div>Página {{ queryItems.page }} de {{ orders.last_page }}</div>
        </v-footer>
      </template>
    </v-data-iterator>
  </v-container>
</template>

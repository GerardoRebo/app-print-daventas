<script setup>
import { computed } from 'vue';
import moment from 'moment-timezone';

const props = defineProps(['order']);
</script>
<template>
  <v-row>
    <v-col cols="12" sm="4" class="pa-4">
      <v-card variant="flat">
        <v-card-text>
          <p><span class="font-weight-bold">Fecha:</span>
            {{ `${moment(order.ventaticket?.created_at).format('DD-MM-YYYYh: mm: ss a')}` }} </p>
          <p><span class="font-weight-bold">Generó:</span> {{ `${order.ventaticket?.almacen?.name}` }} </p>
          <p><span class="font-weight-bold">Vendio:</span> {{ `${order.ventaticket.user?.name}` }} </p>
          <p><span class="font-weight-bold">Medidas</span><span class="text-caption"> (Ancho x Alto) </span>: {{
            `${order.ventaticket.ancho ?? ''}x${order.ventaticket.alto ?? ''}` }} </p>
          <p><span class="font-weight-bold">Cantidad:</span> {{ `${order.ventaticket_articulo.cantidad}` }} </p>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="8">
      <v-card variant="flat">
        <v-card-text>
          <v-list-item :title="order.ventaticket_articulo?.product?.name" density="comfortable" lines="one">
            <template v-slot:title>
              <strong class="text-h6">
                {{ order.ventaticket_articulo?.product?.name }}
              </strong>
            </template>
          </v-list-item>
          <v-img
            :src="`https://cdn.autobild.es/sites/navi.axelspringer.es/public/media/image/2020/04/mejores-motos-honda-historia-1925125.jpg?tf=3840x`"
            height="200" cover></v-img>
        </v-card-text>
      </v-card>

    </v-col>

  </v-row>
</template>
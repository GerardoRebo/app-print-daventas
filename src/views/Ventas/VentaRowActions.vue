<script setup>
import { defineProps, defineEmits } from "vue";
import { useDisplay } from "vuetify";

const props = defineProps({ venta: Object });
const emits = defineEmits(["imprimir-venta", "cancelar-venta", "create-devolucion"]);

const { mdAndUp, lgAndUp } = useDisplay();
</script>

<template>
  <!-- Desktop -->
  <div v-if="lgAndUp" class="d-flex align-center">
    <router-link :to="{ name: 'VentasShow', params: { ventaId: venta.id } }">
      <v-tooltip text="Ver" location="top">
        <template #activator="{ props }">
          <v-btn icon="mdi-eye" size="x-small" v-bind="props" />
        </template>
      </v-tooltip>
    </router-link>

    <v-tooltip text="Imprimir">
      <template #activator="{ props }">
        <v-btn icon="mdi-printer-pos" size="x-small" v-bind="props" @click="$emit('imprimir-venta', venta.id)" />
      </template>
    </v-tooltip>

    <v-tooltip text="Devolver" location="top" v-if="!venta.esta_cancelado &&
      !(venta.total == venta.total_devuelto)">
      <template v-slot:activator="{ props }">
        <v-btn @click="$emit('create-devolucion', venta.id)" size="x-small" class="mx-2" icon="mdi-cash-refund"
          v-bind="props">
        </v-btn>
      </template>
    </v-tooltip>
    <span v-else class="text-error mx-2">Devuelto</span>

    <v-tooltip text="Cancelar" location="top" v-if="!venta.esta_cancelado && venta.total_devuelto == 0">
      <template v-slot:activator="{ props }">
        <v-btn @click="$emit('cancelar-venta', venta.id)" v-bind="props" size="x-small" icon="mdi-cancel"></v-btn>
      </template>
    </v-tooltip>
    <span v-else-if="venta.total_devuelto > 0 &&
      !(venta.total == venta.total_devuelto)
    " class="text-error mx-2">
      Devolución Parcial
    </span>
    <span v-else-if="venta.total == venta.total_devuelto" class="text-error mx-2">
      Devuelto
    </span>
    <!-- <span v-else class="text-error mx-2">Cancelado</span> -->
  </div>

  <!-- Mobile -->
  <div v-else>
    <v-menu>
      <template #activator="{ props }">
        <v-btn color="primary" size="small" append-icon="mdi-menu-down" v-bind="props">
          Opciones
        </v-btn>
      </template>

      <v-list>

        <router-link :to="{ name: 'VentasShow', params: { ventaId: venta.id } }" class="text-decoration-none">
          <v-list-item prepend-icon="mdi-eye" title="Ver" />
        </router-link>

        <v-list-item prepend-icon="mdi-printer-pos" title="ReImprimir" @click="$emit('imprimir-venta', venta.id)" />

        <v-list-item @click="$emit('createDevolucion', venta.id)"
          v-if="!venta.esta_cancelado && !(venta.total == venta.total_devuelto)">
          <template v-slot:prepend>
            <v-icon icon="mdi-cash-refund"></v-icon>
          </template>
          <v-list-item-title>
            Devolución</v-list-item-title>
        </v-list-item>
        <v-list-item v-else>
          <template v-slot:prepend>
            <v-icon icon="mdi-whatsapp"></v-icon>
          </template>
          <v-list-item-title>
            Devuelto</v-list-item-title>
        </v-list-item>
        <v-list-item @click="$emit('cancelarVenta', venta.id)"
          v-if="!venta.esta_cancelado && venta.total_devuelto == 0">
          <template v-slot:prepend>
            <v-icon icon="mdi-cancel"></v-icon>
          </template>
          <v-list-item-title>
            Cancelar</v-list-item-title>
        </v-list-item>
        <v-list-item v-else-if="venta.total_devuelto > 0 &&
          !(venta.total == venta.total_devuelto)">
          <template v-slot:prepend>
            <v-icon icon="mdi-cash-refund"></v-icon>
          </template>
          <v-list-item-title>
            Devolución Parcial</v-list-item-title>
        </v-list-item>
        <v-list-item v-else-if="venta.total == venta.total_devuelto">
          <template v-slot:prepend>
            <v-icon icon="mdi-cash-refund"></v-icon>
          </template>
          <v-list-item-title>
            Devuelto</v-list-item-title>
        </v-list-item>
        <v-list-item v-else>
          <template v-slot:prepend>
            <v-icon icon="mdi-cancel"></v-icon>
          </template>
          <v-list-item-title>
            Cancelado</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

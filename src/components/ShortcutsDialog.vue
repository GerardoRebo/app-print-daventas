<template>
  <v-dialog v-model="isOpen" max-width="600">
    <v-card class="pa-6">
      <v-card-title class="text-h5 font-weight-bold">
        <v-icon start class="mr-2">mdi-keyboard</v-icon>
        Atajos de Teclado
      </v-card-title>

      <v-divider class="my-4" />

      <v-card-text>

        <v-list>
          <v-list-item v-for="(shortcut, index) in shortcuts" :key="index">
            <v-list-item-title class="text-subtitle-1 font-weight-medium">
              {{ shortcut.title }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ shortcut.description }}
            </v-list-item-subtitle>
            <v-list-item-action>
              <v-chip color="black" text-color="black" class="ma-1" v-for="(key, i) in shortcut.keys" :key="i">
                {{ key }}
              </v-chip>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-alert type="info" variant="tonal" color="accent" class="mt-4 text-body-2">
          <p class="text-secondary">

            Nota: Algunos atajos como <strong>F1</strong>, <strong>F2</strong>, etc., pueden requerir que mantengas
            presionada la tecla <kbd>Fn</kbd> en ciertos modelos de laptop o teclados compactos, especialmente en
            MacBooks
            o
            dispositivos con funciones especiales asignadas a las teclas de función.
          </p>
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="isOpen = false" variant="outlined">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

const shortcuts = [
  {
    title: 'Navegar a punto de venta',
    description: 'Estando en cualquier página, esta tecla te dirige al punto de venta',
    keys: ['F1'],
  },
  {
    title: 'Navegar al catálogo de productos',
    description: 'Estando en cualquier página, esta tecla te dirige al catálogo de productos',
    keys: ['F4'],
  },
  {
    title: 'Navegar a la pagina de Movimientos',
    description: 'Estando en cualquier página, esta tecla te dirige a la página de movimientos',
    keys: ['F8'],
  },
  {
    title: 'Cerrar todo',
    description: 'Cierras las ventas de dialogo y vas a la caja de código',
    keys: ['ESC'],
  },
  {
    title: 'Buscar productos por nombre',
    description: 'Abre la ventana para buscar un producto por su nombre',
    keys: ['F9'],
  },
  {
    title: 'Ver existencia de producto',
    description: 'Una vez teninendo un producto ya encontrado, puedes ver la existencia de ese producto en todos los almacenes',
    keys: ['F10'],
  },
  {
    title: 'Cobrar venta',
    description: 'Abres la ventana para cobrar la venta',
    keys: ['F2'],
  },
  {
    title: 'Poner venta como pendiente',
    description: 'Dejas pendiente la venta',
    keys: ['F3'],
  },
  {
    title: 'Ver los tickets pendientes',
    description: 'Abrir la ventana para ver los tickets que están pendientes',
    keys: ['F6'],
  },
  {
    title: 'Navegar a mis ventas',
    description: 'Ir a la pagina para ver el historial de ventas',
    keys: ['F7'],
  },
];
</script>

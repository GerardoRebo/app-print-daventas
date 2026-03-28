<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="1400">
    <v-card max-height="500">
      <v-card-title class="d-flex flex-column align-start">
        <span>Busca producto por nombre</span>
        <v-btn prepend-icon="mdi-plus" size="small" variant="tonal" color="primary" @click="createNewProduct"
          class="align-self-end mt-0">
          Crear nuevo producto
        </v-btn>
      </v-card-title>
      <v-card-text :scrollable="false">
        <p class="text-caption">
          Informacion actualizada por ultima vez hace
          {{ lastFetchTimeFormatted }}
        </p>
        <v-row dense class="mb-2">
          <v-btn :loading="loading" @click.stop="refreshProducts" @keydown.enter.stop="refreshProducts"
            density="compact" icon="mdi-reload" class="mx-2" />
          <v-text-field ref="keywordRef" @input="updateKeyword" placeholder="Escribe nombre o código..."
            prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" rounded="lg" autofocus
            hide-details class="search-input" tabindex="0">
          </v-text-field>
        </v-row>

        <!-- Empty state -->
        <div v-if="products.length === 0 && !loading"
          class="h-100 d-flex flex-column align-center justify-center text-center pa-8">
          <v-icon size="80" class="text-disabled mb-4">mdi-package-variant-closed</v-icon>
          <p class="text-h6 text-disabled mb-2">
            {{ localKeyword ? 'Sin resultados' : 'Comienza a buscar productos' }}
          </p>
          <p class="text-caption text-disabled" style="max-width: 400px;">
            {{ localKeyword
              ? 'No encontramos productos que coincidan con tu búsqueda. Intenta con otros términos.'
              : 'Escribe el nombre o código de un producto para buscarlo en nuestro catálogo.'
            }}
          </p>
        </div>

        <v-data-table v-else :headers="headers" :items="products" items-per-page="100" density="compact" fixed-header
          height="50vh">
          <template v-slot:item.codigo="{ item }">
            <span v-if="item?.codigo"
              class="text-caption cursor-pointer select-none px-2 py-1 rounded hover:bg-primary hover:bg-opacity-10 transition-colors"
              @click="copiarCodigo(item.codigo)" :title="`Click para copiar: ${item.codigo}`">
              <v-icon size="x-small" class="mr-1">mdi-content-copy</v-icon>
              {{ item.codigo }}
            </span>
          </template>
          <template v-slot:item.name="{ item }">
            <a href="#" class="font-weight-bold text-decoration-none"
              :class="[item.es_kit ? 'text-green' : 'text-primary']" @keydown.enter.prevent="selectProduct(item.id)"
              @click.prevent="selectProduct(item.id)">
              <span>{{ item.name }}</span>
            </a>
          </template>
          <template v-slot:item.actions="{ item }">
            <router-link :to="{
              name: 'ProductosIndex',
              query: {
                keyword: item.name
              },
            }" tabindex="-1">
              <v-btn size="x-small" icon tabindex="-1">
                <v-icon>mdi-open-in-new</v-icon>
              </v-btn>
            </router-link>
          </template>
          <template v-slot:item.precio="{ item }">
            <span>${{ formatNumber(item.precio) }}</span>
          </template>
          <template v-slot:item.cantidad_actual="{ item }">
            <span>{{ item.cantidad_actual }}</span>
            <v-tooltip v-if="+item.cantidad_apartado" bottom>
              <template v-slot:activator="{ props }">
                <v-icon size="x-small" color="warning" v-bind="props">mdi-alert-circle</v-icon>
              </template>
              <span>Hay {{ item.cantidad_apartado }} unidades apartadas</span>
            </v-tooltip>
          </template>
          <template v-slot:item.es_kit="{ item }">
            <span>{{ item.es_kit ? "Sí" : "No" }}</span>
          </template>
          <template v-slot:item.impuestos="{ item }">
            <v-chip v-if="item.es_apto_para_cfdi" color="success" size="small" tabindex="-1"
              :to="{ name: 'ProductosShowImpuestos', params: { productId: item.id } }"
              :title="'Ver y editar impuestos de ' + item.name">
              <v-icon start icon="mdi-check-circle"></v-icon>
              Apto para CFDI
            </v-chip>
            <v-chip v-else color="warning" size="small"
              :to="{ name: 'ProductosShowImpuestos', params: { productId: item.id } }" tabindex="-1"
              :title="'Configurar impuestos de ' + item.name">
              <v-icon start icon="mdi-alert-circle"></v-icon>
              Datos incompletos
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useCurrency } from '@js/composables/useCurrency';
import { useTimeFormatting } from '@js/composables/useTimeFormatting';
import useDebounce from '@js/composables/useDebounce';
import { useNotification } from '@js/composables/useNotification';

const { notify } = useNotification();

const router = useRouter();
const { formatNumber } = useCurrency('es-MX', 'MXN');
const { formatRelativeTime } = useTimeFormatting('es');
const { debounce } = useDebounce();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  products: {
    type: Array,
    default: () => [],
  },
  keyword: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  lastFetchTime: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'update:keyword',
  'product-selected',
  'refresh',
  'create-product',
]);

const keywordRef = ref(null);
const localKeyword = ref(props.keyword);

const focusKeyword = () => {
  nextTick(() => {
    keywordRef.value?.focus();
  });
};

defineExpose({
  focusKeyword,
});

const headers = ref([
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "name", align: "start", sortable: false },
  { title: "", key: "actions", align: "start", sortable: false },
  { title: "Precio", key: "precio", align: "start", sortable: false },
  {
    title: "Existencia",
    key: "cantidad_actual",
    align: "start",
    sortable: false,
  },
  { title: "Es kit", key: "es_kit", align: "start", sortable: false },
  { title: "Impuestos", key: "impuestos", align: "start", sortable: false },
]);

const lastFetchTimeFormatted = computed(() => {
  return formatRelativeTime(props.lastFetchTime);
});

// Sync local keyword with prop changes
watch(
  () => props.keyword,
  (newKeyword) => {
    localKeyword.value = newKeyword;
  }
);

// Focus on keyword field when dialog opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        keywordRef.value?.focus();
      });
    }
  }
);

function updateKeyword(e) {
  const newKeyword = e.target.value;
  localKeyword.value = newKeyword;

  const task = () => emit('update:keyword', newKeyword);
  debounce(task, 500);
}
const copiarCodigo = (codigo) => {
  navigator.clipboard.writeText(codigo).then(() => {
    notify.success(`Código "${codigo}" copiado al portapapeles`);
  }).catch(() => {
    notify.error('Error al copiar al portapapeles');
  });
};

function clearKeyword() {
  localKeyword.value = '';
  emit('update:keyword', '');
}

function selectProduct(productId) {
  emit('product-selected', productId);
}

function createNewProduct() {
  emit('create-product');
}

function refreshProducts() {
  emit('refresh');
}


</script>

<style scoped>
.search-input {
  flex: 1;
}

/* Highlight row when navigating with tab */
:deep(.v-data-table tbody tr:focus-within) {
  background-color: rgba(var(--v-theme-primary), 0.08);
  outline: 2px solid rgba(var(--v-theme-primary), 0.3);
  outline-offset: -2px;
  transition: all 0.2s ease;
}

:deep(.v-data-table tbody tr) {
  transition: background-color 0.2s ease;
}
</style>

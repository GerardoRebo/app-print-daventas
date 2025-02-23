<template>
  <v-card class="mb-2" v-if="mdAndUp">
    <v-card-title>Historial Movimientos</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-col cols="12" sm="2">
          <v-date-input label="Desde" v-model="dfecha" hide-details></v-date-input>
        </v-col>
        <v-col cols="12" sm="2">
          <v-date-input label="Hasta" v-model="hfecha" hide-details></v-date-input>
        </v-col>
        <v-col cols="12" sm="1">
          <v-select :items="[
            { value: '', title: 'Cualquier estado' },
            { value: 'P', title: 'Pendiente' },
            { value: 'R', title: 'Recibida' },
            { value: 'C', title: 'Cancelada' },
          ]" label="Estado" v-model="estadomovimiento" max-width="200" hide-details></v-select>
        </v-col>
        <v-col cols="12" sm="1">
          <v-select :items="proveedorsItems" label="Proveedor" v-model="proveedor" max-width="200"
            hide-details></v-select>
        </v-col>
        <v-col cols="12" sm="1">
          <v-select :items="almacensItems" label="Almacén" v-model="almacen" max-width="200" hide-details></v-select>
        </v-col>
        <v-col cols="12" sm="2">
          <v-text-field label="Buscar por folio" placeholder="Ingresa folio + Enter" v-model="folio" hide-details
            @keydown.stop.enter="getOcById" autocomplete="password" :append-inner-icon="'mdi-magnify'"
            @click:append-inner="getOcById" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <v-toolbar v-if="smAndDown" class="mb-2">
    <v-toolbar-title>Productos
    </v-toolbar-title>
    <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
      @click="drawer = true">
      Filtros
    </v-btn>
  </v-toolbar>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary
    v-if="smAndDown">
    <v-card>
      <v-container>
        <v-row dense class="mt-4">
          <v-col cols="12" sm="2">
            <v-date-input label="Desde" v-model="dfecha" hide-details></v-date-input>
          </v-col>
          <v-col cols="12" sm="2">
            <v-date-input label="Hasta" v-model="hfecha" hide-details></v-date-input>
          </v-col>
          <v-col cols="12" sm="1">
            <v-select :items="[
              { value: '', title: 'Cualquier estado' },
              { value: 'P', title: 'Pendiente' },
              { value: 'R', title: 'Recibida' },
              { value: 'C', title: 'Cancelada' },
            ]" label="Estado" v-model="estadomovimiento" max-width="200" hide-details></v-select>
          </v-col>
          <v-col cols="12" sm="1">
            <v-select :items="proveedorsItems" label="Proveedor" v-model="proveedor" max-width="200"
              hide-details></v-select>
          </v-col>
          <v-col cols="12" sm="1">
            <v-select :items="almacensItems" label="Almacén" v-model="almacen" max-width="200" hide-details></v-select>
          </v-col>
          <v-col cols="12" sm="2">
            <v-text-field label="Buscar por folio" placeholder="Ingresa folio + Enter" v-model="folio" hide-details
              @keydown.stop.enter="getOcById" autocomplete="password" :append-inner-icon="'mdi-magnify'"
              @click:append-inner="getOcById" />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-navigation-drawer>
  <v-container>
    <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
    <v-table density="compact" color="primary_d700">
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <TableRow v-for="movimiento in mismovimientos.data" :key="movimiento.id" :movimiento="movimiento"
          @imprimir-movimiento="imprimirMovimiento" @cancelar-movimiento="cancelarMovimiento">
        </TableRow>
      </tbody>
    </v-table>
    <v-row class=" ma-1" justify="end">
      <v-pagination v-model="page" :length="mismovimientos.last_page" :total-visible="3"></v-pagination>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment-timezone"
import Movimientos from "@js/apis/Movimientos";
import Almacen from "@js/apis/Almacen";
import Proveedor from "@js/apis/Proveedor";
import useQuery from "@js/composables/useQuery";
import useDebounce from "@js/composables/useDebounce";
import { useUserStore } from "@js/s";
import useMisFechas from "@js/composables/useMisFechas";
import TableRow from "./TableRow.vue";
import { useDisplay } from "vuetify";
const { xs, smAndDown, mdAndUp, mdAndDown } = useDisplay()

const s = useUserStore();
const { handleOpException } = s;
const route = useRoute();
const router = useRouter();
const { dfecha, hfecha, formattedDFecha, formattedHFecha } = useMisFechas();
const { pushQuery } = useQuery();
let { debounce } = useDebounce();

const estadomovimiento = ref("");
const drawer = ref(true);
const proveedor = ref(null);
const proveedors = ref([]);
const mismovimientos = ref([]);
const almacens = ref([]);
const almacen = ref(null);
const folio = ref(null);
const cargando = ref(false);
const page = ref(1);
watch(page, (newVal) => {
  onPagination(newVal)
})
const onPagination = (page) => {
  router
    .push({ name: route.name, query: { ...route.query, page } })
    .catch(() => {
    }).finally(() => {
      getMisMovimientos()
    });
};
const tHeaders = ref([
  'Id',
  'Folio',
  'Fecha',
  'Usuario',
  'Almacén Origen',
  'Almacen Destino',
  'Total',
  'Tipo',
  'Proveedor',
  'Satus',
  'Acciones',
]);
const almacensItems = computed(() => [
  { title: 'Selecciona', value: null },
  ...almacens.value.map((item) => ({
    title: item.name,
    value: item.id.toString(),
  })),
]);
const proveedorsItems = computed(() => [
  { title: 'Selecciona', value: null },
  ...proveedors.value.map((item) => ({
    title: item.name,
    value: item.id.toString(),
  })),
]);
watch(() => route.query, async () => {
  if (route.name != 'MovimientosIndex') {
    return
  }
  cargando.value = true;
  debounce(() => getMisMovimientos(), 1000);
})

watch(estadomovimiento, () => {
  pushQuery('estado', estadomovimiento.value)
});
watch(proveedor, () => {
  pushQuery('proveedor', proveedor.value)
});
watch(almacen, () => {
  pushQuery('almacen', almacen.value)
});
// const store = useStore();

function getMisMovimientos() {
  Movimientos.getMisMovimientos(
    page.value,
    dfecha.value,
    hfecha.value,
    estadomovimiento.value,
    proveedor.value,
    almacen.value
  )
    .then((response) => {
      mismovimientos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function getAllAlmacens() {
  Almacen.getAll()
    .then((response) => {
      almacens.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function getAllProveedors() {
  Proveedor.getAll()
    .then((response) => {
      proveedors.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function getOcById() {
  cargando.value = true;
  Movimientos.getOcById(folio.value)
    .then((response) => {
      if (response.data.total === 0) {
        console.log(response.data);
        return alert("Ningun movimiento encontrado");
      }
      mismovimientos.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function imprimirMovimiento(movimiento) {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirMovimientos', {
      url: `movimientos/imprimir/${movimiento}`,
      title: 'ImprimirMovimientos'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/movimientos/imprimir/${movimiento}/ `,
    "noreferrer",
    "_blank"
  );
}
function cancelarMovimiento(movimiento) {
  if (cargando.value) return;
  cargando.value = true;
  Movimientos.cancelarMovimiento(movimiento)
    .then(() => {
      cargando.value = false;
      inicializacion();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;

    });
}
function inicializacion() {

  if (route.query.dfecha) {
    dfecha.value = moment(route.query.dfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.hfecha) {
    hfecha.value = moment(route.query.hfecha, 'YYYY-MM-DD').toDate();
  }
  if (route.query.estado) {
    estadomovimiento.value = route.query.estado;
  }
  if (route.query.proveedor) {
    proveedor.value = route.query.proveedor;
  }
  if (route.query.page) {
    page.value = parseInt(route.query.page);
  }
  if (route.query.almacen) {
    almacen.value = route.query.almacen;
  }
  getMisMovimientos();
  getAllAlmacens();
  getAllProveedors();
}
onMounted(() => {
  inicializacion();
});
</script>

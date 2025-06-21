<template>
  <v-toolbar color="neutral200" density="compact">
    <v-toolbar-title class="text-primary_d600">Cotización</v-toolbar-title>
    <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
      @click="drawer = true">
      <!-- <v-icon >mdi-dots-vertical</v-icon> -->
      Ticket info
    </v-btn>
  </v-toolbar>
  <!-- Header Desktop-->
  <v-card v-if="mdAndUp">
    <v-container fluid>
      <v-row class="mb-2" dense>
        <v-btn @click="setPendiente" size="small" class="mx-2" prepend-icon="mdi-sort-clock-ascending">
          Pendiente
        </v-btn>
        <v-btn @click="abrirPendiente" size="small" class="mx-2" prepend-icon="mdi-file-clock">
          Cotizaciones Pendientes
        </v-btn>
        <v-btn @click="abrirCliente" size="small" class="mx-2" prepend-icon="mdi-account-multiple">
          Clientes
        </v-btn>
        <v-btn v-if="showOffline" @click="goOffline" class="mx-2">Offline
        </v-btn>
        <v-select :items="almacenItems" v-if="ticketActual.miAlmacenId == null" label="Almacenes" density="compact"
          @update:modelValue="asignarAlmacen" class="mx-2" max-width="200" hide-details></v-select>
        <div class="d-flex justify-space-around">
          <p class="mx-2">Folio: {{ ticketActual.consecutivo }}</p>
          <p v-if="ticketActual.cliente" class="mx-2">Cliente: {{ ticketActual.cliente }}</p>
          <p v-if="ticketActual.miAlmacenName" class="mx-2">Almacen: {{ ticketActual.miAlmacenName }}</p>
          <p v-if="ticketActual.nombre" class="mx-2">Nombre Ticket: {{ ticketActual.nombre }}</p>
        </div>
      </v-row>
      <v-row dense class="mb-2">
        <v-col>
          <v-text-field label="Codigo" placeholder="Codigo + Enter" @keydown.right.prevent="goPrimerArticulo"
            @keydown.enter="searchProduct" v-model="codigo" hide-details autocomplete="password" ref="codigoRef" />
        </v-col>
        <v-col>
          <v-tooltip :text="product_form.name" location="top">
            <template v-slot:activator="{ props }">
              <v-text-field label="Nombre" id="name" autocomplete="off" placeholder="" readonly hide-details
                v-model="product_form.name" v-bind="props" />
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="1">
          <v-text-field label="Cantidad" id="cantidad" autocomplete="off" placeholder="Cantidad"
            @keydown.stop.enter="enviarArticulo" v-model="product_form.cantidad" hide-details type="number" />
        </v-col>
        <v-col cols="1" v-if="product_form.usa_medidas">
          <v-text-field label="Ancho" autocomplete="off" placeholder="Ancho" @keydown.stop.enter="enviarArticulo"
            v-model="product_form.ancho" hide-details type="number" />
        </v-col>
        <v-col cols="1" v-if="product_form.usa_medidas">
          <v-text-field label="Alto" autocomplete="off" placeholder="Alto" @keydown.stop.enter="enviarArticulo"
            v-model="product_form.alto" hide-details type="number" />
        </v-col>
        <v-col cols="1">
          <v-text-field label="Precio" id="precio" autocomplete="off" placeholder=""
            @keydown.stop.enter="enviarArticulo" v-model="product_form.pventa" hide-details />
        </v-col>
        <v-col cols="1">
          <v-text-field label="Existencia" id="existencia" autocomplete="off" placeholder=""
            v-model="product_form.existencia" readonly hide-details />
        </v-col>
        <v-spacer />
        <v-col cols="1">
          <v-btn @click="enviarArticulo" prepend-icon="mdi-arrow-right-bold" variant="outlined" color="primary">Agregar
          </v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn @click="abrirModalBuscaProductsNombre" prepend-icon="mdi-magnify" variant="outlined"
            color="primary">Buscar
          </v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn @click="abrirExistencias" prepend-icon="mdi-eye" variant="outlined" color="primary">Ver
          </v-btn>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="1">
          <v-btn @click="borrarTicket" prepend-icon="mdi-trash-can">
            Borrar
          </v-btn>
        </v-col>
        <!-- <v-col cols="1">
          <v-btn @click="imprimirVenta" prepend-icon="mdi-printer-pos">
            Imprimir
          </v-btn>
        </v-col> -->
        <!-- <v-col cols="1">
          <v-btn @click="archivar" prepend-icon="mdi-archive">
            Archivar
          </v-btn>
        </v-col> -->
        <v-col cols="1">
          <v-btn @click="guardarVenta" prepend-icon="mdi-check-circle" variant="elevated" color="primary">
            Guardar
          </v-btn>
        </v-col>
        <v-col cols="2">
          <v-text-field label="Nombra cotización" id="nombreT" autocomplete="off" placeholder="Nombra Ticket + Enter"
            density="compact" @keydown.stop.enter="setNombreTicket" v-model="nombreT" hide-details />
        </v-col>
        <v-col cols="1">
          <div>
            <label class="text-xs">
              SubTotal:
            </label>
            <p class="font-semibold">
              ${{ subtotalComputed }}
            </p>
          </div>
        </v-col>
        <v-col cols="1">
          <div>
            <label class="text-xs">
              Descuento:
            </label>
            <p class="font-semibold">
              ${{ descuentoComputed }}
            </p>
          </div>
        </v-col>
        <v-col cols="1">
          <div>
            <label class="text-xs">
              Impuesto:
            </label>
            <p class="font-semibold">
              ${{ impuestoComputed }}
            </p>
          </div>
        </v-col>
        <v-col cols="1">
          <p>
            Total: ${{ totalComputed }}
          </p>
        </v-col>
        <v-spacer />
      </v-row>
    </v-container>
  </v-card>
  <!-- Mobile Toolbar -->

  <!-- Mobile Subheader -->
  <v-card v-if="mdAndDown">
    <v-container>
      <!-- Codigo -->
      <v-row dense>
        <v-col cols="8">
          <v-text-field label="Codigo" id="codigo" autocomplete="off" placeholder="Codigo + Enter"
            @keydown.right.prevent="goPrimerArticulo" @keydown.enter="searchProduct" v-model="codigo"
            density="compact" />
        </v-col>
        <v-col cols="4">
          <div class="d-flex around align-center">
            <v-btn @click="searchProduct" density="compact" icon="mdi-arrow-right-bold" class="mr-1" color="info">
            </v-btn>
            <v-btn @click="abrirModalBuscaProductsNombre" density="compact" icon="mdi-magnify" class="mr-1">
            </v-btn>
            <v-btn @click="emptyValues" density="compact" icon="mdi-broom" class="mr-1">
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <!-- Nombre -->
      <v-row no-gutters v-if="codigo">
        <v-col>
          <v-text-field v-model="product_form.name" label="Nombre" id="name" autocomplete="off" placeholder="" readonly
            density="compact" />
        </v-col>
      </v-row>
      <!-- Cantidad -->
      <v-row dense v-if="codigo">
        <v-col cols="4">
          <v-text-field label="Cantidad" id="cantidad" autocomplete="off" placeholder="Cantidad"
            @keydown.stop.enter="enviarArticulo" v-model="product_form.cantidad" density="compact" />
        </v-col>
        <v-col cols="4" v-if="product_form.usa_medidas">
          <v-text-field label="Ancho" autocomplete="off" placeholder="Ancho" @keydown.stop.enter="enviarArticulo"
            v-model="product_form.ancho" hide-details type="number" />
        </v-col>
        <v-col cols="4" v-if="product_form.usa_medidas">
          <v-text-field label="Alto" autocomplete="off" placeholder="Alto" @keydown.stop.enter="enviarArticulo"
            v-model="product_form.alto" hide-details type="number" />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Precio" id="precio" autocomplete="off" placeholder=""
            @keydown.stop.enter="enviarArticulo" v-model="product_form.pventa" density="compact" />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Existencia" id="existencia" autocomplete="off" placeholder=""
            v-model="product_form.existencia" density="compact" readonly />
        </v-col>
        <!-- <InfoVue v-if="showInfo" @click="openInfoAgregarExistencia" class="animate-bounce" /> -->
        <v-spacer />
      </v-row>
      <v-row dense v-if="codigo">
        <v-col>
          <v-btn @click="abrirExistencias" density="compact" prepend-icon="mdi-eye">
            Existencias
          </v-btn>
        </v-col>
        <v-col>
          <v-btn @click="enviarArticulo" density="compact" prepend-icon="mdi-pencil-plus" class="mr-1" color="accent">
            Agregar
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
    <v-card v-if="mdAndDown">
      <v-container>
        <v-row class="mb-3">
          <v-btn @click="guardarVenta" color="accent" block variant="elevated" prepend-icon="mdi-cash-register"
            class="mb-3">Finalizar
          </v-btn>
          <v-btn @click="borrarTicket" variant="tonal" prepend-icon="mdi-trash-can" block class="mb-3">
            Borrar
          </v-btn>
          <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn variant="tonal" v-bind="props" block append-icon="mdi-menu-down">
                Opciones
              </v-btn>
            </template>
            <v-list>
              <!-- <v-list-item @click="imprimirVenta">
                <template v-slot:prepend>
                  <v-icon icon="mdi-printer-pos"></v-icon>
                </template>
                <v-list-item-title>
                  Imprimir</v-list-item-title>
              </v-list-item> -->
              <!-- <v-list-item @click="archivar">
                <template v-slot:prepend>
                  <v-icon icon="mdi-archive"></v-icon>
                </template>
                <v-list-item-title>
                  Archivar</v-list-item-title>
              </v-list-item> -->
              <v-list-item @click="setPendiente">
                <template v-slot:prepend>
                  <v-icon icon="mdi-sort-clock-ascending"></v-icon>
                </template>
                <v-list-item-title>
                  Pendiente</v-list-item-title>
              </v-list-item>
              <v-list-item @click="abrirPendiente">
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-clock"></v-icon>
                </template>
                <v-list-item-title>
                  Cotizaciones Pendientes</v-list-item-title>
              </v-list-item>
              <v-list-item @click="abrirCliente">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-multiple"></v-icon>
                </template>
                <v-list-item-title>
                  Clientes</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>
        <v-select :items="almacenItems" v-if="ticketActual.miAlmacenId == null" label="Almacenes" density="compact"
          @update:modelValue="asignarAlmacen"></v-select>
        <v-row no-gutters>
          <v-col cols="6">
            <p>Folio: {{ ticketActual.consecutivo }}</p>
          </v-col>
          <v-col cols="6" v-if="ticketActual.cliente">
            <p>Cliente: {{ ticketActual.cliente }}</p>
          </v-col>
          <v-col cols="6" v-if="ticketActual.miAlmacenName">
            <p>Almacen: {{ ticketActual.miAlmacenName }}</p>
          </v-col>
          <v-col cols="6" v-if="ticketActual.nombre">
            <p>Nombre Ticket: {{ ticketActual.nombre }}</p>
          </v-col>
        </v-row>

        <v-divider></v-divider>
        <p class="font-semibold">
          <span class="font-weight-medium">SubTotal:</span> ${{ subtotalComputed }}
        </p>
        <p class="font-semibold">
          <span class="font-weight-medium">Descuento:</span> ${{ descuentoComputed }}
        </p>
        <p class="font-semibold">
          <span class="font-weight-medium">Impuesto:</span> ${{ impuestoComputed }}
        </p>
        <v-divider></v-divider>
        <p class="text-h6 text-secondary">
          <span class="font-weight-bold">Total: </span> ${{ totalComputed }}
        </p>
      </v-container>
    </v-card>
  </v-navigation-drawer>

  <!-- Tabla -->
  <v-container fluid>
    <v-data-table :headers="tHeaders" :items="articulos" items-per-page="5" show-select select-strategy="single"
      class="" density="compact">
      <template v-slot:item.data-table-select="{ internalItem, isSelected, toggleSelect, index }">
        <input type="checkbox" name="check" class="articulosInputs"
          @keydown.delete="destroyArticulo(internalItem.raw.id)" @keydown.enter="
            abrirEdicion(
              internalItem.raw.id,
              internalItem.raw.product_name ?? internalItem.raw.product.name,
              internalItem.raw.precio_usado,
              internalItem.raw.cantidad
            )
            " />
      </template>
      <template v-slot:item.product_name="{ item }">
        <router-link :to="{ name: 'ProductosIndex', query: { keyword: item.product_name ?? item.product.name } }"
          tabindex="-1" class="text-decoration-none">
          <span class="text-primary cursor-pointer font-weight-bold">{{ item.product_name ??
            item.product?.name
          }} <v-icon size="x-small">mdi-open-in-new</v-icon></span>
        </router-link>
      </template>
      <!-- Dollar sign formatting for "Precio" column -->
      <template v-slot:item.precio_usado="{ item }">
        <span>${{ item.precio }}</span>
      </template>

      <!-- Dollar sign formatting for "Importe" column -->
      <template v-slot:item.precio_final="{ item }">
        <span class="font-weight-bold">${{ item.importe }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon class="me-2" size="small" @click="
          abrirEdicion(
            item.id,
            item.product_name ?? item.product.name,
            item.precio_usado,
            item.cantidad
          )
          " v-if="item.product_id" tabindex="-1">
          mdi-pencil
        </v-icon>
        <v-icon size="small" class="me-2" @click="destroyArticulo(item.id)" tabindex="-1">
          mdi-delete
        </v-icon>
        <v-icon size="small" @click="verImagenes(item.product?.images)" v-if="item.product?.images?.length"
          tabindex="-1">
          mdi-eye
        </v-icon>
      </template>
    </v-data-table>
  </v-container>

  <!-- Busca Producto Nombre-->
  <v-dialog v-model="isVisible">
    <v-card>
      <v-card-title>Busca producto por nombre</v-card-title>
      <v-card-text>
        <p class="text-caption mb-2">Informacion actualizada por ultima vez hace {{ lastFetchTimeFormatted }}</p>
        <v-row class="mb-2" dense>
          <v-btn @click.stop="getProductsNow" @keydown.enter.stop="getProductsNow" density="compact" icon="mdi-reload"
            class="mx-2"></v-btn>
          <v-text-field @input="makeUpdate" label="Search" prepend-inner-icon="mdi-magnify" variant="outlined"
            hide-details single-line ref="keyw"></v-text-field>
        </v-row>
        <v-data-table :headers="headers" :items="products" items-per-page="100" fixed-header height="50vh">
          <template v-slot:item.precio="{ item }">
            <span>${{ item.precio }}</span>
          </template>
          <template v-slot:item.name="{ item }">
            <a href="#" @keydown.enter.prevent="getProductById(item.id)" @click.prevent="getProductById(item.id)"
              class="font-weight-bold text-decoration-none" :class="[item.es_kit ? 'text-green' : 'text-primary']">
              <span>{{ item.name
              }}</span>
            </a>
          </template>

          <template v-slot:item.precio_final="{ item }">
            <span>${{ item.precio_final }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon class="me-2" size="small" @click="
              abrirEdicion(
                item.id,
                item.product_name ?? item.product.name,
                item.precio_usado,
                item.cantidad
              )
              " v-if="item.product_id">
              mdi-pencil
            </v-icon>
            <v-icon size="small" @click="destroyArticulo(item.id)">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
  <!-- Clientes -->
  <v-dialog v-model="openCliente">
    <v-card>
      <v-card-title>Clientes</v-card-title>
      <v-card-text>
        <v-text-field v-model="keycliente" label="Cliente" prepend-inner-icon="mdi-magnify" variant="outlined"
          placeholder="Ingresa nombre del cliente" hide-details single-line id="keycliente"></v-text-field>
      </v-card-text>
      <v-data-table :headers="clienteHeaders" :items="clients" items-per-page="5" show-select select-strategy="single">
        <template v-slot:item.data-table-select="{ internalItem, isSelected, toggleSelect, index }">
          <v-checkbox-btn :model-value="isSelected(internalItem)" color="primary"
            @update:model-value="toggleSelect(internalItem)" class="articulosInputs"
            @click="setCliente(internalItem.raw.id)" @keydown.enter="setCliente(internalItem.raw.id)"></v-checkbox-btn>
        </template>
        <!-- Dollar sign formatting for "Precio" column -->

        <!-- Dollar sign formatting for "Importe" column -->
        <template v-slot:item.saldo_actual="{ item }">
          <span>${{ item.saldo_actual }}</span>
        </template>
        <template v-slot:item.limite_credito="{ item }">
          <span>${{ item.limite_credito }}</span>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>

  <!-- Pendientes -->
  <v-dialog v-model="openPendiente" max-width="1200">
    <v-card>
      <v-card-title>Pendientes</v-card-title>
      <v-card-text>
        <v-data-table :headers="pendientesHeaders" :items="pendientes" items-per-page="5" show-select
          select-strategy="single">
          <template v-slot:item.data-table-select="{ internalItem, isSelected, toggleSelect, index }">
            <v-checkbox-btn :model-value="isSelected(internalItem)" color="primary"
              @update:model-value="toggleSelect(internalItem)" class="articulosPendientesInputs"
              @keydown.enter="getSpecificVT(internalItem.raw.id)"
              @click="getSpecificVT(internalItem.raw.id)"></v-checkbox-btn>
          </template>
          <template v-slot:item.cliente="{ item }">
            <span>{{ item.cliente?.name }}</span>
          </template>
          <template v-slot:item.almacen="{ item }">
            <span>{{ item.almacen?.name }}</span>
          </template>
          <template v-slot:item.total="{ item }">
            <span>${{ item.total }}</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Existencias-->
  <v-dialog v-model="openExistencias">
    <v-card>
      <v-card-title>Existencias</v-card-title>
      <v-card-text>
      </v-card-text>
      <v-data-table :headers="existenciasHeaders" :items="existencias" items-per-page="5" show-select
        select-strategy="single">
        <template v-slot:item.data-table-select="{ internalItem, isSelected, toggleSelect, index }">
          <v-checkbox-btn :model-value="isSelected(internalItem)" color="primary"
            @update:model-value="toggleSelect(internalItem)" class="articulosInputs"></v-checkbox-btn>
        </template>
        <template v-slot:item.product_name="{ item }">
          <span>{{ item.product?.name }}</span>
        </template>
        <template v-slot:item.almacen="{ item }">
          <span>{{ item.almacen?.name }}</span>
        </template>
        <template v-slot:item.codigo="{ item }">
          <span>{{ item.product?.codigo }}</span>
        </template>
        <template v-slot:item.pcosto="{ item }">
          <span>${{ item.product?.pcosto }}</span>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>

  <!-- Ajuste Inventarios -->
  <v-dialog v-model="edicion" max-width="600">
    <v-card>
      <v-card-title>Edita Artículo</v-card-title>
      <v-card-text>
        <v-text-field label="Precio" id="pventa" autocomplete="off" placeholder="" density="compact"
          v-model="articulo_form.pventa" @keydown.stop.enter="editarArticulo" />
        <v-text-field label="Cantidad" id="cantidad" autocomplete="off" placeholder="Ingresa la cantidad"
          density="compact" v-model="articulo_form.cantidad" @keydown.stop.enter="editarArticulo" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="edicion = false" variant="text">Cancelar</v-btn>
        <v-btn @click="editarArticulo" color="primary" variant="outlined">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Conversion Granel -->
  <v-dialog v-model="openConversion" max-width="600">
    <v-card>
      <v-card-title>Conversión Granel</v-card-title>
      <v-card-text>
        <v-text-field label="Precio Base" id="precioBase" autocomplete="off" placeholder="Precio" density="compact"
          v-model="conversion_form.precioBase" @input.stop="modificaPrecioBase"
          @keydown.stop.enter="aceptarConversion" />
        <v-text-field label="Peso KG:" id="peso" autocomplete="off" placeholder="" density="compact"
          v-model="conversion_form.peso" @input.stop="modificaPeso" @keydown.stop.enter="aceptarConversion" />
        <v-text-field label="Total $" id="total" autocomplete="off" placeholder="" density="compact"
          @input.stop="modificaTotal" v-model="total" @keydown.stop.enter="aceptarConversion" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openConversion = false">Cancelar</v-btn>
        <v-btn @click="aceptarConversion">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Cobrar -->
  <v-dialog v-model="openFinalizar">
    <v-card>
      <v-card-title>Cobrar ${{ totalComputed }}</v-card-title>
      <v-card-text>
        <p><span class="font-bold text-gray-800">Su cambio: </span> {{ cambio }}</p>
        <v-text-field label="Paga Con" id="pagocon" autocomplete="off" placeholder="" density="compact"
          v-model="pagocon" @keydown.enter.stop.prevent="guardarVenta(false)" />
        <v-text-field label="Telefono" id="telefono" autocomplete="off" placeholder="" density="compact"
          v-model="telefono" />
        <div v-if="ticketActual.clienteId">
          <v-checkbox v-model="credito" :label="`Es venta a crédito?`" id="credito"></v-checkbox>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openFinalizar = false">Cancelar</v-btn>
        <v-btn @click="guardarVenta(false)">Vender</v-btn>
        <v-btn @click="guardarVenta(true)">Vender e Imprimir</v-btn>
        <v-btn @click="guardarVentaWha(false)">Vender y Whatsapp</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

<!-- <DynamicSnack :snackbar="snackbar" /> -->
</template>
<script setup>
import {
  onMounted,
  onUnmounted,
  ref,
  reactive,
  watch,
  nextTick,
  computed,
} from "vue";

// import DynamicSnack from "../../components/DynamicSnack.vue";
import { useRouter } from "vue-router";
import Product from "@js/apis/Product";
import Cotizacion from "@js/apis/Cotizacion";
import Almacen from "@js/apis/Almacen";
import Cliente from "@js/apis/Cliente";
import { useUserStore } from "@js/s";
import { storeToRefs } from "pinia";
import User from "@js/apis/User";

import { WebviewWindow } from '@tauri-apps/api/window';

const store = useUserStore();
import { useMessagesStore } from "@js/s/messages";
import { useDisplay } from "vuetify";
const messages = useMessagesStore();
const { productsData, lastFetchTimes } = storeToRefs(store);
const { isOpException, getExceptionMsg, handleOpException } = store;
const router = useRouter();
const { xs, mdAndUp, mdAndDown } = useDisplay()
const product_form = reactive({
  name: "",
  codigo: "",
  cantidad: null,
  pventa: null,
  pcosto: null,
  porcentaje_ganancia: null,
  pventa_base: null,
  precio_mayoreo: null,
  existencia: null,
});
const conversion_form = reactive({
  precioBase: null,
  peso: 1,
});
const articulo_form = reactive({
  name: "",
  cantidadActual: null,
  cantidad: null,
  pcosto: null,
  pventa: null,
});
const almacen = reactive({
  id: "",
  name: "",
});
const ticketActual = reactive({
  id: null,
  nombre: "",
  total: null,
  clienteId: null,
  miAlmacenId: null,
  miAlmacenName: "",
  consecutivo: null,
  cliente: "",
  ganancia: null,
});

const keyw = ref(null)
const drawer = ref(false);
const codigoRef = ref(null);
const total = ref(null);
const telefono = ref("");
const codigo = ref("");
const isBannerOpen = ref(false);
const cargando = ref(false);
const credito = ref(false);
const pagocon = ref(null);
const edicion = ref(false);
const keyword = ref("");
const keycliente = ref("");
const temp = ref(null);
const almacens = ref([]);
const existencias = ref([]);
const productActualId = ref(null);
const products = ref([]);
const lastFetchTimeLocal = ref(null);
const pendientes = ref([]);
const articuloActualId = ref(null);
const articulos = ref([]);
const clients = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const isInfoAgregarExistenciaOpen = ref(false);
const openEdit = ref(false);
const openExistencias = ref(false);
const openFinalizar = ref(false);
const openCliente = ref(false);
const openPendiente = ref(false);
const openConversion = ref(false);
const nombreT = ref("");
const isQrOpen = ref(false)
const qrString = ref('')
const timeOut = ref("");
const tHeaders = ref([
  { title: 'Código', key: 'codigo', align: 'start', sortable: false },
  { title: 'Nombre', key: 'product_name', align: 'start', sortable: false },
  { title: 'Cantidad', key: 'cantidad', align: 'start', sortable: false },
  { title: 'Ancho', key: 'ancho', align: 'start', sortable: false },
  { title: 'Alto', key: 'alto', align: 'start', sortable: false },
  { title: 'Area', key: 'area', align: 'start', sortable: false },
  { title: 'Precio', key: 'precio_usado', align: 'start', sortable: false },
  { title: 'Importe', key: 'precio_final', align: 'start', sortable: false },
  { title: 'Descuento', key: 'importe_descuento', align: 'start', sortable: false },
  { title: 'Impuesto', key: 'impuesto_traslado', align: 'start', sortable: false },
  { title: 'Existencia', key: 'cantidad_actual', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
]);
const headers = ref([
  { title: 'Código', key: 'codigo', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Precio', key: 'precio', align: 'start', sortable: false },
  { title: 'Existencia', key: 'cantidad_actual', align: 'start', sortable: false },
  { title: 'Es kit', key: 'es_kit', align: 'start', sortable: false },
]);
const clienteHeaders = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Saldo Actual', key: 'saldo_actual', align: 'start', sortable: false },
  { title: 'Límite de Crédito', key: 'limite_credito', align: 'start', sortable: false },
  { title: 'Teléfono', key: 'telefono', align: 'start', sortable: false },
  { title: 'Email', key: 'email', align: 'start', sortable: false },
])
const pendientesHeaders = ref([
  { title: 'Folio', key: 'consecutivo', align: 'start', sortable: false },
  { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
  { title: 'Cliente', key: 'cliente', align: 'start', sortable: false },
  { title: 'Almacén', key: 'almacen', align: 'start', sortable: false },
  { title: 'Total', key: 'total', align: 'start', sortable: false },
])
const existenciasHeaders = ref([
  { title: 'Almacen', key: 'almacen', align: 'start', sortable: false },
  { title: 'Código', key: 'codigo', align: 'start', sortable: false },
  { title: 'Nombre', key: 'product_name', align: 'start', sortable: false },
  { title: 'Costo', key: 'pcosto', align: 'start', sortable: false },
  { title: 'Existencia', key: 'cantidad_actual', align: 'start', sortable: false },
])
const almacenItems = computed(() => {
  const al = almacens.value.map((item) => {
    return {
      title: item.name,
      value: item.id,
    }
  })
  return al

})
const showBanner = (length) => {
  return !store.authuser?.configuration?.features?.crea_almacen && length == 0 && store.isAdmin
}
const lastFetchTimeFormatted = computed(() => {
  return formatRelativeTime(lastFetchTimeLocal.value);
})
const showOffline = computed(() => {
  return window.__TAURI_METADATA__
})
const goOffline = () => {
  router.push({ name: "Offline" })
}
const showInfo = computed(() => {
  return product_form.existencia == 0 && !store.authuser?.configuration?.features?.howto_inventario
})
const whaStatus = ref(true)
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} segundo(s)`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minuto(s)`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hora(s)`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} dia(s)`;
  }
}
const hideDrawer = ref(true);

const totalComputed = computed(() => {
  const suma = +subtotalComputed.value + +impuestoComputed.value - +descuentoComputed.value;
  return roundToNearestFiveCents(suma).toFixed(2)
});
const roundToNearestFiveCents = (number) => {
  return parseFloat((Math.round(number / 0.05) * 0.05).toFixed(2));
}
const impuestoComputed = computed(() => {
  const suma = articulos.value.reduce(
    (partial_sum, a) => partial_sum + +a.impuesto_traslado - +a.impuesto_retenido,
    0
  );
  return suma.toFixed(2)
});
const descuentoComputed = computed(() => {
  const suma = articulos.value.reduce(
    (partial_sum, a) => partial_sum + +a.importe_descuento,
    0
  );
  return suma.toFixed(2)
});
const subtotalComputed = computed(() => {
  const suma = articulos.value.reduce(
    (partial_sum, a) => partial_sum + +a.importe,
    0
  );
  return suma.toFixed(2)
});
const cambio = computed(() => {
  let resta = pagocon.value - totalComputed.value;
  if (resta < 0) {
    return `Te Faltan $${-resta} `;
  } else {
    return `$${resta}`;
  }
});
const pventa_porcentaje = computed(() => {
  if (product_form.porcentaje_ganancia == 0) {
    return 0;
  }
  return (
    +product_form.pcosto +
    +product_form.pcosto * (+product_form.porcentaje_ganancia / 100)
  );
});
watch(keycliente, () => {
  getAllClientes();
});
function onEscape(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    nextTick(() => codigoRef.value.select());
    if (openExistencias.value === true) {
      return (openExistencias.value = false);
    }
    if (openConversion.value === true) {
      return (openConversion.value = false);
    }
    emptyValues();
    isVisible.value = false;
    openEdit.value = false;
    edicion.value = false;
    openFinalizar.value = false;
    openCliente.value = false;
    openPendiente.value = false;
    openConversion.value = false;
  }
  if (e.key === "F9") {
    e.preventDefault();
    abrirModalBuscaProductsNombre();
  }
  if (e.key === "Insert") {
    e.preventDefault();
    precioMayoreo();
  }
  if (e.key === "F10") {
    e.preventDefault();
    abrirExistencias();
  }
  // if (e.key === "F2") {
  //   e.preventDefault();
  //   abrirCobrarModal();
  // }
  if (e.key === "F3") {
    e.preventDefault();
    setPendiente();
  }
  if (e.key === "F6") {
    e.preventDefault();
    abrirPendiente();
  }
  if (e.key === "F7") {
    e.preventDefault();
    router.push({ name: "MisCotizaciones" });
  }
}
function modificaPrecioBase(event) {
  conversion_form.precioBase = event.target.value;
  const fixed = +event.target.value * +conversion_form.peso;
  let res = Math.round(fixed * 100) / 100;
  total.value = res;
}
const openInfoAgregarExistencia = () => {
  isInfoAgregarExistenciaOpen.value = true
}
async function updateFeatureHowTo() {
  const response = await User.updateFeature({ key: 'howto_inventario', value: true })
  store.authuser = response.data[0];
  isInfoAgregarExistenciaOpen.value = false
}
function modificaPeso(event) {
  conversion_form.peso = event.target.value;
  const fixed = +event.target.value * +conversion_form.precioBase;
  let res = Math.round(fixed * 100) / 100;
  total.value = res;
}
function modificaTotal(event) {
  total.value = event.target.value;
  const fixed = +event.target.value / +conversion_form.precioBase;
  conversion_form.peso = fixed;
}
function searchProduct() {
  if (cargando.value) return;
  cargando.value = true;
  if (codigo.value == "") {
    cargando.value = false;
    messages.add({ text: "Campo Código Vacio", color: "warning" })
    return;
  }
  if (almacen.id == null) {
    cargando.value = false;
    messages.add({ text: 'No has seleccionado almacen', color: "warning" })

    return;
  }
  Product.searchCode(codigo.value, almacen.id)
    .then((response) => {
      console.log(response, 'res');
      if (response.data == "Producto No Encontrado") {
        messages.add({ text: "Producto No Encontrado", color: "warning" })
        codigo.value = "";
        return;
      }
      rellenaProductForm(response);
      if (response.data.tventa === "G") {
        abrirConversion(response);
        return;
      }
      nextTick(() => document.getElementById("cantidad").select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function emptyValues() {
  codigo.value = "";
  product_form.name = "";
  product_form.codigo = "";
  product_form.cantidad = "";
  product_form.pventa = "";
  product_form.precio_mayoreo = "";
  product_form.existencia = "";
}
function aceptarConversion() {
  product_form.pventa = conversion_form.precioBase;
  product_form.cantidad = conversion_form.peso;
  enviarArticulo();
  openConversion.value = false;
}
function getProductById(productId) {
  if (cargando.value) return;
  cargando.value = true;
  Product.showextend(productId, ticketActual.miAlmacenId)
    .then((response) => {
      if (response.data == "Producto No Encontrado") {
        codigo.value = "";
        return alert("Producto No Encontrado");
      }
      rellenaProductForm(response);
      codigo.value = response.data.codigo;
      isVisible.value = false;
      if (response.data.tventa === "G") {
        abrirConversion(response);
        return;
      }
      nextTick(() => document.getElementById("cantidad").select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function precioMayoreo() {
  if (product_form.pventa != product_form.pventa_base) {
    product_form.pventa = product_form.pventa_base;
  } else {
    product_form.pventa = product_form.precio_mayoreo;
  }
}
function abrirConversion(response) {
  openConversion.value = true;
  conversion_form.precioBase = response.data.precio;
  conversion_form.peso = 1;
  total.value = response.data.precio;
  nextTick(() => document.getElementById("peso").select());
}
const hideBanner = async () => {
  isBannerOpen.value = false;
  const response = await User.updateFeature({ key: 'crea_almacen', value: true })
  store.authuser = response.data[0];
}
async function rellenaTicket(response) {
  credito.value = false;
  ticketActual.id = response.id;
  almacen.id = response.almacen_id;
  ticketActual.miAlmacenId = response.almacen_id;
  ticketActual.nombre = response.nombre;
  ticketActual.consecutivo = response.consecutivo;
  ticketActual.clienteId = response.cliente_id;
  if (ticketActual.miAlmacenId) {
    ticketActual.miAlmacenName = response.almacen.name;
    almacen.name = response.almacen.name;
  }
  if (response.cliente) {
    ticketActual.cliente = response.cliente.name;
    telefono.value = response.cliente.telefono;
  } else {
    telefono.value = "";
    ticketActual.cliente = "";
  }
  if (ticketActual.miAlmacenId == null) {
    if (store.myAlmacens.length > 0) {
      response.data = store.myAlmacens;
    } else {
      response = await Almacen.getMyAlmacens();
      store.myAlmacens = response.data
    }

    if (response.data[0]) {
      almacens.value = response.data;
      if (response.data.length == 1) {
        asignarAlmacen(response.data[0].id);
      }
    }
    if (showBanner(response.data.length)) {
      isBannerOpen.value = true;
    }
  }
}
function blurPrimerArticulo() {
  const elementos = document.getElementsByClassName("articulosInputs");
  const firstCheckbox = elementos[0].querySelector("input");
  if (firstCheckbox) {
    firstCheckbox.blur();
  }
}
function rellenaProductForm(response) {
  productActualId.value = response.data.id;
  product_form.usa_medidas = response.data.usa_medidas;
  product_form.name = response.data.name;
  product_form.codigo = response.data.codigo;
  product_form.cantidad = 1;
  product_form.ancho = 1;
  product_form.alto = 1;
  product_form.pventa = response.data.precio;
  product_form.pcosto = response.data.pcosto;
  product_form.porcentaje_ganancia = response.data.porcentaje_ganancia;
  product_form.pventa_base = response.data.precio;
  product_form.precio_mayoreo = response.data.precio_mayoreo;
  product_form.existencia = response.data.cantidad_actual;
}
function abrirEdicion(id, name, pventa, cantidad, ancho, alto) {
  blurPrimerArticulo();
  articuloActualId.value = id;
  articulo_form.name = name;
  articulo_form.pventa = pventa;
  articulo_form.cantidad = cantidad;
  articulo_form.ancho = ancho;
  articulo_form.alto = alto;
  edicion.value = true;
  nextTick(() => document.getElementById("pventa").select());
}
function editarArticulo() {
  if (cargando.value) return;
  cargando.value = true;

  Cotizacion.update(articuloActualId.value, ticketActual.id, articulo_form)
    .then((response) => {
      if (response.data == "No inventario") {
        return messages.add({ text: 'No hay suficiente inventario', color: "warning" })
      }
      edicion.value = false;
      getSpecificVT(ticketActual.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
      openEdit.value = false;
    });
}
function getAllProducts() {
  const currentTime = new Date().getTime();
  const lastFetchTime = lastFetchTimes.value[keyword.value] || 0; // Default to 0 if keyword.value doesn't exist
  const isDataStale = !lastFetchTime || currentTime - lastFetchTime >= 5 * 60 * 1000;

  if (!productsData.value[keyword.value] || isDataStale) {
    // Fetch new data from the server
    // Update store state and last fetch time
    Product.searchKeyWord(keyword.value, almacen.id)
      .then((response) => {
        products.value = response.data;
        productsData.value[keyword.value] = response.data;
        lastFetchTimes.value[keyword.value] = currentTime;
        lastFetchTimeLocal.value = currentTime;
      })
      .catch((error) => {
        handleOpException(error);
        alert("Ha ocurrido un error" + error.message)
      }).finally(() => {
      });
  } else {
    products.value = productsData.value[keyword.value];
    lastFetchTimeLocal.value = lastFetchTime;
  }
}
function getProductsNow() {
  const currentTime = new Date().getTime();
  Product.searchKeyWord(keyword.value, almacen.id)
    .then((response) => {
      products.value = response.data;
      productsData.value[keyword.value] = response.data;
      lastFetchTimes.value[keyword.value] = currentTime;
      lastFetchTimeLocal.value = currentTime;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error" + error.message)
    }).finally(() => {
    });
}
function getAllPendientes() {
  if (cargando.value) return;
  cargando.value = true;
  Cotizacion.getAllPendientes()
    .then((response) => {
      pendientes.value = response.data;
      goPrimerPendiente();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function getAllClientes() {
  if (cargando.value) return;
  cargando.value = true;
  Cliente.getAllClientes(keycliente.value)
    .then((response) => {
      clients.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function enviarArticulo() {
  if (cargando.value) return;
  cargando.value = true;
  if (product_form.usa_medidas && (!product_form.ancho || !product_form.alto)) {
    cargando.value = false;
    return messages.add({text:"Falta determinar: ancho o alto ", color: 'warning'});
  }
  if (
    productActualId.value == null ||
    ticketActual.id == null ||
    ticketActual.miAlmacenId == null ||
    product_form.pventa == null ||
    product_form.cantidad == null ||
    product_form.cantidad == ""
  ) {
    cargando.value = false;
    return messages.add({ text: "Falta determinar: precio o cantidad ", color: "info" })
  }
  if (product_form.existencia == null || product_form.existencia == "0.00") {
    cargando.value = false;
    nextTick(() => codigoRef.value.select());

    return messages.add({ text: "Producto sin existencia", color: "warning" })
  }
  if (+product_form.pventa <= +product_form.pcosto) {
    alert("Revisar Precio Menor Que Costo");
  } else if (
    +pventa_porcentaje.value != 0 &&
    +product_form.pventa < +pventa_porcentaje.value
  ) {
    alert(
      "Revisar!! Precio Menor del Sugerido, Precio Sugerido: $" +
      pventa_porcentaje.value
    );
  }
  Cotizacion.register(productActualId.value, ticketActual.id, product_form)
    .then((response) => {
      getSpecificVT(ticketActual.id);

      emptyValues();
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      handleOpException(error);
      alert('Ha ocurrido un error')
    }).finally(() => {
      cargando.value = false;
    });
}
function destroyArticulo(articulo) {
  if (cargando.value) return;
  cargando.value = true;
  Cotizacion.destroyArticulo(articulo, ticketActual.id)
    .then(() => {
      getSpecificVT(ticketActual.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
    });
}
function abrirModalBuscaProductsNombre() {
  isVisible.value = true;
  getAllProducts();
  nextTick(() => keyw.value.focus());
}
function asignarAlmacen(almacenId) {
  if (cargando.value) return;
  cargando.value = true;
  Cotizacion.asignarAlmacen(ticketActual.id, almacenId)
    .then(() => {
      getSpecificVT(ticketActual.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = true;
    });
}
async function borrarTicket() {
  let conf = await confirm("Estas Seguro de Borrar el Ticket?");
  if (conf) {
    if (cargando.value) return;
    cargando.value = true;
    Cotizacion.borrarTicket(ticketActual.id)
      .then(() => {
        init();
        ticketActual.miAlmacenName = "";
        emptyValues();
        nextTick(() => codigoRef.value.select());
      })
      .catch((error) => {
        handleOpException(error);
        alert("Ha ocurrido un error")
      }).finally(() => {
        cargando.value = false;
      });
  }
}
function setNombreTicket() {
  if (cargando.value) return;
  cargando.value = true;
  Cotizacion.setNombreTicket(ticketActual.id, nombreT.value)
    .then(() => {
      getSpecificVT(ticketActual.id);
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function setCliente(cliente) {
  if (cargando.value) return;
  cargando.value = true;
  Cotizacion.setCliente(cliente, ticketActual.id)
    .then(() => {
      getSpecificVT(ticketActual.id);
      openCliente.value = false;
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
async function setPendiente() {
  if (! await confirm("Seguro que quieres dejar la venta pendiente?")) return;
  if (cargando.value) return;
  cargando.value = true;
  Cotizacion.setPendiente(ticketActual.id)
    .then(() => {
      init();
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function abrirExistencias() {
  if (productActualId.value == null) return alert('No has seleccionado un producto');
  if (cargando.value) return;
  cargando.value = true;
  openExistencias.value = true;
  Cotizacion.getExistencias(productActualId.value)
    .then((response) => {
      existencias.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function abrirCliente() {
  openCliente.value = true;

  nextTick(() => document.getElementById("keycliente").select());
  getAllClientes();
}
function abrirPendiente() {
  openPendiente.value = true;
  getAllPendientes();
}
async function init() {
  nombreT.value = "";
  try {
    let response = await Cotizacion.getAll();
    rellenaTicket(response.data[0]);
    articulos.value = response.data[1];
    nextTick(() => codigoRef.value.select());
  } catch (error) {
    alert("Ha ocurrido un error");
  } finally {
  }
}
function getSpecificVT(ventaticket) {
  nombreT.value = "";
  Cotizacion.getSpecificVT(ventaticket)
    .then((response) => {
      rellenaTicket(response.data[0]);
      articulos.value = response.data[1];
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
      openPendiente.value = false;
      nextTick(() => codigoRef.value.select());
    });
}
function archivar(imprimir) {
  if (cargando.value) return;
  cargando.value = true;
  console.log('qwer');

  Cotizacion.archivar(ticketActual.id)
    .then((response) => {
      init();
      messages.add({ text: "La cotizacion se ha generado con exito", color: "success" })
    })
    .catch((error) => {

      handleOpException(error);

      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
async function guardarVenta(imprimir) {

  if (!almacen.id) {
    messages.add({ text: "Elige un almacen", color: "error" })
    return
  }
  let conf = await confirm("Estas Seguro?");
  if (!conf) return
  if (cargando.value) return;
  cargando.value = true;
  Cotizacion.guardarVenta(ticketActual.id)
    .then((response) => {
      console.log(response.data, "res");
      router.push({ name: "CotizacionesShow", params: { cotizacionId: response.data.id } })

      messages.add({ text: "La cotizacion se ha generado con exito", color: "success" })
    })
    .catch((error) => {
      if (isOpException(error) && getExceptionMsg(error).includes('No has habilitado la caja')) {
        messages.add({ text: getExceptionMsg(error), color: "error" })
        setTimeout(() => {
          router.push({ name: "Cortes" });
        }, 2000);
        return;
      }
      handleOpException(error);

      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function guardarVentaWha() {
  if (cargando.value) return;
  cargando.value = true;
  if (!telefono.value || telefono.value.length < 10) {
    messages.add({ text: "Introduce un telefono valido", color: "warning" });
    return;
  }
  Cotizacion.guardarVenta(ticketActual.id, pagocon.value, credito.value)
    .then((response) => {
      openFinalizar.value = false;
      init();
      // Cotizacion.sendVentaToWha(ticketActual.id, telefono.value)
      //   .then((response) => {
      //   })
      //   .catch((error) => {
      //     handleOpException(error);

      //     alert("Ha ocurrido un error")
      //   }).finally(() => {
      //     cargando.value = false;
      //   });
    })
    .catch((error) => {
      if (isOpException(error) && getExceptionMsg(error).includes('No has habilitado la caja')) {
        messages.add({ text: getExceptionMsg(error), color: "error" })
        setTimeout(() => {
          router.push({ name: "Cortes" });
        }, 2000);
        return;
      }
      handleOpException(error);

      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
function imprimirVenta() {
  if (window.__TAURI__) {
    const webview = new WebviewWindow('ImprimirVentas', {
      url: `cotizacions/imprimir/${ticketActual.id}`,
      title: 'Imprimir Venta'
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/cotizacions/imprimir/${ticketActual.id}`,
    "_blank",
    "noreferrer"
  );
}

function goPrimerArticulo() {
  var elementos = document.getElementsByClassName("articulosInputs");
  elementos[0].focus();
}
function goPrimerPendiente() {
  nextTick(() => {
    const elementos = document.getElementsByClassName("articulosPendientesInputs");
    const firstCheckbox = elementos[0].querySelector('input');
    if (firstCheckbox) {
      firstCheckbox.focus();
    }
  });
}
function makeUpdate(e) {
  keyword.value = e.target.value;
  const task = () => getAllProducts();
  debounce(task, 500);
}
function debounce(func, wait = 1000) {
  clearTimeout(timeOut.value);
  timeOut.value = setTimeout(func, wait);
}

onMounted(() => {
  document.addEventListener("keydown", onEscape);
  nextTick(() => codigoRef.value.select());
  init();
});

onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});
</script>
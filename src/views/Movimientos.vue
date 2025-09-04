<template>
  <v-toolbar color="neutral200" density="compact">
    <!-- <v-icon color="primary" class="ml-2">mdi-truck</v-icon> -->
    <v-toolbar-title class="text-primary_d600">Movimientos</v-toolbar-title>
    <v-btn
      class="hidden-xs-only"
      v-if="mdAndDown"
      variant="outlined"
      size="small"
      append-icon="mdi-menu-down"
      @click="drawer = true"
    >
      Movimiento info
    </v-btn>
  </v-toolbar>
  <!-- desktop -->
  <v-card v-if="mdAndUp">
    <v-container fluid>
      <v-row class="mb-2" dense>
        <v-btn
          @click="setPendiente"
          size="small"
          class="mx-2"
          prepend-icon="mdi-sort-clock-ascending"
        >
          Pendiente
        </v-btn>
        <v-btn
          @click="abrirPendiente"
          size="small"
          class="mx-2"
          prepend-icon="mdi-file-clock"
        >
          Tickets Pendientes
        </v-btn>
        <v-btn
          v-if="movimientoActual.tipo == 'C'"
          class="mx-2"
          prepend-icon="mdi-account-multiple"
          @click="abrirProveedor"
          size="small"
        >
          Proveedor
        </v-btn>
        <v-select
          v-if="movimientoActual.tipo == null"
          @update:modelValue="setMovimiento"
          :items="[
            { value: 'C', title: 'Compra' },
            { value: 'T', title: 'Transferencia' },
            { value: 'S', title: 'Solicitud Transferencia' },
          ]"
          v-model="movimientoActual.tipo"
          label="Tipo Movimiento"
          id="tipomovimiento"
          hide-details
          max-width="200"
          class="mx-2"
        ></v-select>
        <v-select
          v-if="
            movimientoActual.almacenOrigenId == null &&
            movimientoActual.tipo != null
          "
          v-model="almacen.id"
          :items="almacenItems"
          label="Almacen Origen"
          id="almacen"
          hide-details
          class="mx-2"
          max-width="300"
        ></v-select>
        <v-select
          v-if="visibleAlmacenDestino"
          v-model="almacenDestino.id"
          :items="destinoAlmacenItems"
          label="Almacen Destino"
          id="almacenDestino"
          hide-details
          class="mx-2"
          max-width="300"
        ></v-select>
        <v-btn variant="tonal" color="secondary" class="highlighted-select" v-if="
            movimientoActual.almacenOrigenId == null &&
            movimientoActual.tipo != null
          " @click="asignarAlmacen" small>
            Asignar
          </v-btn>
        <div class="d-flex justify-space-around">
          <p class="mx-2">Folio: {{ movimientoActual.consecutivo }}</p>
          <p v-if="movimientoActual.tipo == 'T'" class="mx-2">
            {{ `Tipo de Movimiento: Transferencia ` }}
          </p>
          <p v-if="movimientoActual.tipo == 'S'" class="mx-2">
            {{ `Tipo de Movimiento: Solicitud Transferencia ` }}
          </p>
          <p v-else-if="movimientoActual.tipo == 'C'" class="mx-2">
            Tipo de Movimiento: Compra
          </p>
          <p v-if="movimientoActual.tipo == 'C'" class="mx-2">
            Proveedor: {{ proveedor }}
          </p>
          <p class="mx-2">
            Almacen Origen: {{ movimientoActual.miAlmacenOrigenName }}
          </p>
          <p v-if="movimientoActual.tipo != 'C'" class="mx-2">
            Almacen Destino: {{ movimientoActual.miAlmacenDestinoName }}
          </p>
        </div>
      </v-row>
      <v-row dense class="mb-2">
        <v-col>
          <v-text-field
            label="Codigo"
            autocomplete="password"
            placeholder="Codigo + Enter"
            @keydown.right.prevent="goPrimerArticulo"
            @keydown.enter="searchProduct"
            v-model="codigo"
            density="compact"
            hide-details
            ref="codigoRef"
          />
        </v-col>
        <v-col>
          <v-text-field
            label="Nombre"
            id="name"
            autocomplete="off"
            readonly
            hide-details
            v-model="product_form.name"
          />
        </v-col>
        <v-col cols="1">
          <v-text-field
            label="Cantidad"
            id="cantidad"
            autocomplete="off"
            @keydown.stop.enter="enviarArticulo"
            v-model="product_form.cantidad"
            hide-details
            type="number"
          />
        </v-col>
        <v-col cols="1">
          <v-text-field
            label="Costo"
            id="costo"
            autocomplete="off"
            @keydown.stop.enter="enviarArticulo"
            v-model="product_form.pcosto"
            hide-details
          />
        </v-col>
        <v-col cols="1">
          <v-text-field
            label="Existencia"
            id="existencia"
            autocomplete="off"
            v-model="product_form.existencia"
            readonly
            hide-details
          />
        </v-col>
        <v-spacer />
        <v-col cols="1">
          <v-btn
            @click="enviarArticulo"
            prepend-icon="mdi-arrow-right-bold"
            color="primary"
            variant="outlined"
            >Agregar
          </v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn
            @click="abrirModalBuscaProductsNombre"
            prepend-icon="mdi-binoculars"
            color="primary"
            variant="outlined"
            >Buscar
          </v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn
            @click="abrirExistencias"
            prepend-icon="mdi-eye"
            color="primary"
            variant="outlined"
            >Ver
          </v-btn>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="1">
          <v-btn @click="borrarTicket" prepend-icon="mdi-trash-can">
            Borrar
          </v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn
            @click="guardar('ambos')"
            v-if="mostrarGuardar"
            variant="elevated"
            color="primary"
            prepend-icon="mdi-truck"
            >Guardar
          </v-btn>
        </v-col>
        <v-col cols="1">
          <div>
            <label class="text-xs"> SubTotal: </label>
            <p class="font-semibold">${{ subtotalComputed }}</p>
          </div>
        </v-col>
        <v-col cols="1">
          <div>
            <label class="text-xs"> Descuento: </label>
            <p class="font-semibold">${{ 0 }}</p>
          </div>
        </v-col>
        <v-col cols="1">
          <div>
            <label class="text-xs"> Impuesto: </label>
            <p class="font-semibold">${{ impuestoComputed }}</p>
          </div>
        </v-col>
        <v-col cols="1">
          <p>Total: ${{ totalComputed }}</p>
        </v-col>
        <v-spacer />
      </v-row>
    </v-container>
  </v-card>
  <!-- Mobile Toolbar -->
  <v-toolbar v-if="mdAndDown">
    <v-toolbar-title>Movimientos</v-toolbar-title>
    <v-btn class="hidden-xs-only" icon>
      <v-icon @click="drawer = true">mdi-dots-vertical</v-icon>
    </v-btn>
  </v-toolbar>

  <!-- Mobile Subheader -->
  <v-card v-if="mdAndDown">
    <v-container>
      <!-- Codigo -->
      <v-row dense>
        <v-col cols="8">
          <v-text-field
            label="Codigo"
            autocomplete="off"
            placeholder="Codigo + Enter"
            @keydown.right.prevent="goPrimerArticulo"
            @keydown.enter="searchProduct"
            v-model="codigo"
          />
        </v-col>
        <v-col cols="4">
          <div class="d-flex around align-center">
            <v-btn
              @click="searchProduct"
              density="compact"
              icon="mdi-arrow-right-bold"
              class="mr-1"
              color="info"
            >
            </v-btn>
            <v-btn
              @click="abrirModalBuscaProductsNombre"
              density="compact"
              icon="mdi-magnify"
              class="mr-1"
            >
            </v-btn>
            <v-btn
              @click="limpiarCampos"
              density="compact"
              icon="mdi-broom"
              class="mr-1"
            >
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <!-- Nombre -->
      <v-row no-gutters v-if="codigo">
        <v-col>
          <v-text-field
            v-model="product_form.name"
            label="Nombre"
            id="name"
            autocomplete="off"
            placeholder=""
            readonly
            density="compact"
          />
        </v-col>
      </v-row>
      <!-- Cantidad -->
      <v-row dense v-if="codigo">
        <v-col cols="4">
          <v-text-field
            label="Cantidad"
            id="cantidad"
            autocomplete="off"
            placeholder="Cantidad"
            @keydown.stop.enter="enviarArticulo"
            v-model="product_form.cantidad"
            density="compact"
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            label="Precio"
            id="precio"
            autocomplete="off"
            placeholder=""
            @keydown.stop.enter="enviarArticulo"
            v-model="product_form.pventa"
            density="compact"
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            label="Existencia"
            id="existencia"
            autocomplete="off"
            placeholder=""
            v-model="product_form.existencia"
            density="compact"
            readonly
          />
        </v-col>
        <v-spacer />
      </v-row>
      <v-row dense v-if="codigo">
        <v-col>
          <v-btn
            @click="abrirExistencias"
            density="compact"
            prepend-icon="mdi-eye"
          >
            Existencias
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            @click="enviarArticulo"
            density="compact"
            prepend-icon="mdi-pencil-plus"
            class="mr-1"
            color="accent"
          >
            Agregar
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer
    v-model="drawer"
    :location="$vuetify.display.mobile ? 'bottom' : undefined"
    temporary
  >
    <v-card v-if="mdAndDown">
      <v-container>
        <v-row class="mb-3">
          <v-btn
            @click="guardar('ambos')"
            v-if="mostrarGuardar"
            color="accent"
            block
            class="mb-3"
            prepend-icon="mdi-check"
            >Guardar
          </v-btn>
          <v-btn
            @click="borrarTicket"
            color=""
            prepend-icon="mdi-trash-can"
            block
            class="mb-3"
          >
            Borrar
          </v-btn>
          <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn color="" v-bind="props" block append-icon="mdi-menu-down">
                Opciones
              </v-btn>
            </template>

            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-sort-clock-ascending"></v-icon>
                </template>
                <v-list-item-title @click="setPendiente">
                  Pendiente</v-list-item-title
                >
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-clock"></v-icon>
                </template>
                <v-list-item-title @click="abrirPendiente">
                  Tickets Pendientes</v-list-item-title
                >
              </v-list-item>
              <v-list-item v-if="movimientoActual.tipo == 'C'">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-multiple"></v-icon>
                </template>
                <v-list-item-title @click="abrirProveedor">
                  Proveedores</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>
        <v-select
          v-if="movimientoActual.tipo == null"
          @update:modelValue="setMovimiento"
          :items="[
            { value: 'C', title: 'Compra' },
            { value: 'T', title: 'Transferencia' },
            { value: 'S', title: 'Solicitud Transferencia' },
          ]"
          v-model="movimientoActual.tipo"
          label="Tipo Movimiento"
          density="compact"
          id="tipomovimiento"
        ></v-select>
        <v-select
          v-if="
            movimientoActual.almacenOrigenId == null &&
            movimientoActual.tipo != null
          "
          v-model="almacen.id"
          :items="almacens"
          label="Almacen Origen"
          density="compact"
          id="almacen"
        ></v-select>
        <v-select
          v-if="visibleAlmacenDestino"
          v-model="almacenDestino.id"
          :items="destinoAlmacens"
          label="Almacen Destino"
          density="compact"
          id="almacenDestino"
        ></v-select>
        <v-btn
          v-if="
            movimientoActual.almacenOrigenId == null &&
            movimientoActual.tipo != null
          "
          @click="asignarAlmacen"
          small
        >
          Asignar
        </v-btn>
        <div class="d-flex flex-column justify-center mb-1">
          <p>Folio: {{ movimientoActual.consecutivo }}</p>
          <p v-if="movimientoActual.tipo == 'T'">
            {{ `Tipo de Movimiento: Transferencia ` }}
          </p>
          <p v-if="movimientoActual.tipo == 'S'">
            {{ `Tipo de Movimiento: Solicitud Transferencia ` }}
          </p>
          <p v-else-if="movimientoActual.tipo == 'C'">
            Tipo de Movimiento: Compra
          </p>
          <p v-if="movimientoActual.tipo == 'C'">Proveedor: {{ proveedor }}</p>
          <p>Almacen Origen: {{ movimientoActual.miAlmacenOrigenName }}</p>
          <p v-if="movimientoActual.tipo != 'C'">
            Almacen Destino: {{ movimientoActual.miAlmacenDestinoName }}
          </p>
        </div>

        <v-divider></v-divider>
        <p class="font-semibold">
          <span class="font-weight-medium">SubTotal:</span> ${{
            subtotalComputed
          }}
        </p>
        <p class="font-semibold">
          <span class="font-weight-medium">Descuento:</span> $0
        </p>
        <p class="font-semibold">
          <span class="font-weight-medium">Impuesto:</span> ${{
            impuestoComputed
          }}
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
    <v-data-table
      :headers="tHeaders"
      :items="articulos"
      items-per-page="5"
      show-select
      select-strategy="single"
      density="compact"
    >
      <template
        v-slot:item.data-table-select="{
          internalItem,
          isSelected,
          toggleSelect,
          index,
        }"
      >
        <input
          type="checkbox"
          name="check"
          class="articulosInputs"
          @keydown.delete="destroyArticulo(internalItem.raw.id)"
          @keydown.enter="
            abrirEdicion(
              internalItem.raw.id,
              internalItem.raw.product_name ?? internalItem.raw.product.name,
              internalItem.raw.precio_usado,
              internalItem.raw.cantidad
            )
          "
        />
      </template>
      <template v-slot:item.name="{ item }">
        <router-link
          :to="{
            name: 'ProductosIndex',
            query: { keyword: item.name ?? item.product.name },
          }"
          tabindex="-1"
          class="text-decoration-none"
        >
          <span
            class="font-weight-bold"
            :class="[item.es_kit ? 'text-green' : 'text-primary']"
            >{{ item.product_name ?? item.product?.name }}
            <v-icon size="x-small">mdi-open-in-new</v-icon></span
          >
        </router-link>
      </template>
      <template v-slot:item.costo_al_ordenar="{ item }">
        <span>${{ item.costo_al_ordenar }}</span>
      </template>
      <template v-slot:item.total_al_ordenar="{ item }">
        <span class="font-weight-bold">${{ item.total_al_ordenar }}</span>
      </template>
      <template v-slot:item.impuesto_al_enviar="{ item }">
        <span>${{ item.impuesto_al_enviar }}</span>
      </template>
      <template v-slot:item.precio="{ item }">
        <span>${{ item.precio }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          class="me-2"
          size="small"
          @click="
            abrirEdicion(
              item.id,
              item.name ?? item.product.name,
              item.costo_al_ordenar,
              item.cantidad_ordenada
            )
          "
          v-if="item.product_id"
          tabindex="-1"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          size="small"
          class="me-2"
          @click="destroyArticulo(item.id)"
          tabindex="-1"
        >
          mdi-delete
        </v-icon>
        <!-- <v-icon size="small" @click="verImagenes(item.product.images)" v-if="item.product.images.length">
        mdi-eye
      </v-icon> -->
      </template>
    </v-data-table>
  </v-container>
  <!-- Busca Producto Nombre-->
  <v-dialog v-model="isVisible" max-width="1200">
    <v-card>
      <v-card-title>Busca producto por nombre</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="product_form.name"
          @input.stop="makeUpdate"
          label="Busca Producto por nombre"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          ref="keywordRef"
        ></v-text-field>
        <v-data-table
          :headers="headers"
          :items="products"
          items-per-page="100"
          fixed-header
          height="50vh"
        >
          <template v-slot:item.name="{ item }">
            <a
              href="#"
              @keydown.enter.prevent="getProductById(item.id)"
              @click.prevent="getProductById(item.id)"
              class="font-weight-bold text-decoration-none"
              :class="[item.es_kit ? 'text-green' : 'text-primary']"
            >
              <span>{{ item.name }}</span>
            </a>
          </template>
          <template v-slot:item.precio="{ item }">
            <span>${{ item.precio }}</span>
          </template>

          <template v-slot:item.precio_final="{ item }">
            <span>${{ item.precio_final }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <button
              tabindex="-1"
              :class="[
                item.es_kit
                  ? 'text-green-600 hover:text-green-900'
                  : 'text-indigo-600 hover:text-indigo-900',
              ]"
              @keydown.enter="abrirExistencias(item.id)"
              @click="abrirExistencias(item.id)"
            >
              {{ item.cantidad_actual }}
            </button>
            <v-icon
              class="me-2"
              size="small"
              @click="
                abrirEdicion(
                  item.id,
                  item.product_name ?? item.product.name,
                  item.precio_usado,
                  item.cantidad
                )
              "
              v-if="item.product_id"
            >
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
  <!-- Proveedores -->
  <v-dialog v-model="openProveedor" max-width="1200">
    <v-card>
      <v-card-title>Proveedores</v-card-title>
      <v-card-text>
        <v-text-field v-model="keyproveedor" label="Proveedores" prepend-inner-icon="mdi-magnify" variant="outlined"
          placeholder="Busca proveedor por nombre" hide-details single-line id="keyproveedor"></v-text-field>
      </v-card-text>
      <v-data-table :headers="proveedorsHeaders" :items="proveedors" items-per-page="5">
        <!-- Dollar sign formatting for "Importe" column -->
        <template v-slot:item.consecutivo="{ item }">
          <a href="" class="decoration-none" @keydown.enter.prevent="setProveedor(item.id)"
            @click.prevent="setProveedor(item.id)"><span color="primary">{{ item.consecutivo }}</span></a>
        </template>
        <template v-slot:item.saldo_actual="{ item }">
          <span>${{ item.saldo_actual }}</span>
        </template>
        <template v-slot:item.limite_credito="{ item }">
          <span>${{ item.limite_credito }}</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn prepend-icon="mdi-plus" size="small" tabindex="-1" @click="setProveedor(item.id)" color="primary">
            Agregar
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>
  <!-- Pendientes -->
  <v-dialog v-model="openPendiente" max-width="1200">
    <v-card>
      <v-card-title>Pendientes</v-card-title>
      <v-card-text> </v-card-text>
      <v-data-table :headers="pendientesHeaders" :items="pendientes" items-per-page="5">
        <template v-slot:item.consecutivo="{ item }">
          <a href="" class="decoration-none" @keydown.enter.prevent="getSpecificVT(item.id)"
            @click.prevent="getSpecificVT(item.id)"><span color="primary">{{ item.consecutivo }}</span></a>
        </template>
        <template v-slot:item.proveedor="{ item }">
          <span>{{ item.proveedor?.name }}</span>
        </template>
        <template v-slot:item.almacen_origen="{ item }">
          <span>{{ item.almacen_origen?.name }}</span>
        </template>
        <template v-slot:item.total_enviado="{ item }">
          <span>${{ item.total_enviado }}</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn prepend-icon="mdi-check" size="small" tabindex="-1" @click="getSpecificVT(item.id)" color="primary">
            Seleccionar
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>
  <!-- Existencias-->
  <v-dialog v-model="openExistencias">
    <v-card>
      <v-card-title>Existencias</v-card-title>
      <v-card-text> </v-card-text>
      <v-data-table
        :headers="existenciasHeaders"
        :items="existencias"
        items-per-page="5"
        show-select
        select-strategy="single"
      >
        <template
          v-slot:item.data-table-select="{
            internalItem,
            isSelected,
            toggleSelect,
            index,
          }"
        >
          <v-checkbox-btn
            :model-value="isSelected(internalItem)"
            color="primary"
            @update:model-value="toggleSelect(internalItem)"
            class="articulosInputs"
          ></v-checkbox-btn>
        </template>
        <template v-slot:item.product_name="{ item }">
          <span>{{ item.product?.name }}</span>
        </template>
        <template v-slot:item.almacen="{ item }">
          <span>{{ item.almacen?.name }}</span>
        </template>
        <template v-slot:item.pcosto="{ item }">
          <span>${{ item.product?.pcosto }}</span>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>
  <!-- Editar Articulo -->
  <!-- Ajuste Inventarios -->
  <v-dialog v-model="edicion" max-width="600">
    <v-card>
      <v-card-title>Edita Artículo {{ articulo_form.name }}</v-card-title>
      <v-card-text>
        <v-text-field
          label="Costo"
          id="pventa"
          autocomplete="off"
          placeholder=""
          density="compact"
          v-model="articulo_form.pcosto"
          @keydown.stop.enter="editarArticulo"
        />
        <v-text-field
          label="Cantidad"
          id="cantidad"
          autocomplete="off"
          placeholder="Ingresa la cantidad"
          density="compact"
          v-model="articulo_form.cantidad"
          @keydown.stop.enter="editarArticulo"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="edicion = false">Cerrar</v-btn>
        <v-btn @click="editarArticulo">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Cambio de Precio -->
  <v-dialog v-model="openCambiaPrecio" max-width="800">
    <v-card>
      <v-card-title
        >El Costo Ha Cambiado, Deseas Actualizar Precio?</v-card-title
      >
      <v-card-text>
        <v-text-field
          label="Costo Anterior"
          id="ucosto"
          autocomplete="off"
          placeholder=""
          density="compact"
          v-model="articulo_form.ucosto"
          disabled
        />
        <v-text-field
          label="Precio"
          id="pventa"
          autocomplete="off"
          placeholder="Ingresa la cantidad"
          density="compact"
          v-model="articulo_form.pventa"
          disabled
        />
        <v-text-field
          label="Costo actual"
          id="pcosto"
          autocomplete="off"
          placeholder="Ingresa la cantidad"
          density="compact"
          v-model="articulo_form.pcosto"
          disabled
        />
        <v-text-field
          label="Precio nuevo"
          id="pn"
          autocomplete="off"
          placeholder="Ingresa la cantidad"
          :suffix="`${
            product_form.precio_sugerido
              ? 'Sugerido: $' + product_form.precio_sugerido
              : ''
          }`"
          density="compact"
          v-model="articulo_form.cantidad"
          :error-messages="errors.precio ? errors.precio[0] : null"
          @keydown.enter.prevent="cambiaPrecio"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openCambiaPrecio = false">Cancelar</v-btn>
        <v-btn @click.stop="cambiaPrecio">Guardar</v-btn>
        <v-btn @click.stop="cambiaPrecioGeneral">Guardar General</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
import { useRouter } from "vue-router";
import Product from "../apis/Product";
import Movimientos from "../apis/Movimientos";
import Almacen from "../apis/Almacen";
import Proveedor from "../apis/Proveedor";
import { useUserStore } from "../s";
import { useDisplay } from "vuetify";

const { xs, mdAndUp, mdAndDown } = useDisplay();
const router = useRouter();
const store = useUserStore();
const { handleOpException } = store;
const product_form = reactive({
  name: "",
  codigo: "",
  cantidad: null,
  pcosto: null,
  existencia: null,
});
const articulo_form = reactive({
  name: "",
  cantidadActual: null,
  cantidad: null,
  pcosto: null,
  ucosto: null,
  pventa: null,
});
const almacen = reactive({
  id: null,
  name: "",
});
const tHeaders = ref([
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "name", align: "start", sortable: false },
  {
    title: "Cantidad",
    key: "cantidad_ordenada",
    align: "start",
    sortable: false,
  },
  { title: "Costo", key: "costo_al_ordenar", align: "start", sortable: false },
  {
    title: "Importe",
    key: "total_al_ordenar",
    align: "start",
    sortable: false,
  },
  {
    title: "Descuento",
    key: "importe_descuento",
    align: "start",
    sortable: false,
  },
  {
    title: "Impuesto",
    key: "impuestos_al_enviar",
    align: "start",
    sortable: false,
  },
  { title: "Precio", key: "precio", align: "start", sortable: false },
  {
    title: "Existencia",
    key: "cantidad_actual",
    align: "start",
    sortable: false,
  },
  { title: "Acciones", key: "actions", sortable: false },
]);
const headers = ref([
  "Código",
  "Nombre",
  "Precio",
  "Existencia",
  "kit",
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "name", align: "start", sortable: false },
  { title: "Precio", key: "precio", align: "start", sortable: false },
  {
    title: "Existencia",
    key: "cantidad_actual",
    align: "start",
    sortable: false,
  },
  { title: "Es kit", key: "es_kit", align: "start", sortable: false },
]);
const almacenDestino = reactive({
  id: null,
  name: "",
});
const movimientoActual = reactive({
  id: null,
  total: null,
  proveedorId: null,
  almacenOrigenId: null,
  almacenDestinoId: null,
  miAlmacenOrigenName: "",
  miAlmacenDestinoName: "",
  proveedor: "",
  notas: "",
  tipo: null,
  consecutivo: null,
});
const proveedorsHeaders = ref([
  { title: "Id", key: "id", align: "start", sortable: false },
  { title: "Nombre", key: "name", align: "start", sortable: false },
  { title: "Teléfono", key: "telefono", align: "start", sortable: false },
  { title: "Email", key: "email", align: "start", sortable: false },
]);
const pendientesHeaders = ref([
  { title: "Folio", key: "consecutivo", align: "start", sortable: false },
  { title: "Proveedor", key: "proveedor", align: "start", sortable: false },
  {
    title: "Almacén Origen",
    key: "almacen_origen",
    align: "start",
    sortable: false,
  },
  {
    title: "Almacén Destino",
    key: "almacen_destino",
    align: "start",
    sortable: false,
  },
  { title: "Total", key: "total_enviado", align: "start", sortable: false },
  { title: "", key: "actions", align: "start", sortable: false },
]);
const existenciasHeaders = ref([
  { title: "Almacen", key: "almacen", align: "start", sortable: false },
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "product_name", align: "start", sortable: false },
  { title: "Costo", key: "pcosto", align: "start", sortable: false },
  {
    title: "Existencia",
    key: "cantidad_actual",
    align: "start",
    sortable: false,
  },
]);
const destinoAlmacenItems = computed(() => {
  const al = destinoAlmacens.value.map((item) => {
    return {
      title: item.name,
      value: item.id,
    };
  });
  return al;
});
const almacenItems = computed(() => {
  const al = almacens.value.map((item) => {
    return {
      title: item.name,
      value: item.id,
    };
  });
  return al;
});
const drawer = ref(false);
const cargando = ref(false);
const codigo = ref("");
const codigoRef = ref(null);
const tipomovimiento = ref("null");
const edicion = ref(false);
const openCambiaPrecio = ref(false);
const keyword = ref("");
const keywordRef = ref(null);
const keyproveedor = ref("");
const timeOut = ref("");
const almacens = ref([]);
const destinoAlmacens = ref([]);
const tipo = ref("aumento");
const existencias = ref([]);
const productActualId = ref(null);
const products = ref([]);
const pendientes = ref([]);
const articuloActualId = ref(null);
const articulos = ref([]);
const proveedors = ref([]);
const errors = ref([]);
const isVisible = ref(false);
const openEdit = ref(false);
const openExistencias = ref(false);
const openProveedor = ref(false);
const openPendiente = ref(false);
const nombreT = ref("");
const porcentaje = ref(null);

const proveedor = computed(() => {
  if (movimientoActual.proveedor == "") {
    return "";
  } else {
    return movimientoActual.proveedor;
  }
});
const mostrarDescuentos = computed(() => {
  if (movimientoActual.almacenOrigenId && movimientoActual.tipo == "C") {
    return true;
  } else {
    return false;
  }
});
const solicitudT = computed(() => {
  return movimientoActual.tipo == "S";
});
const mostrarGuardar = computed(() => {
  if (solicitudT.value == true) {
    let myAlmaKeys = store.myAlmacens.map((almacen) => almacen.id);
    return myAlmaKeys.includes(movimientoActual.almacenOrigenId);
  } else {
    return true;
  }
});
const visibleAlmacenDestino = computed(() => {
  return (
    movimientoActual.almacenOrigenId == null &&
    movimientoActual.tipo != "C" &&
    movimientoActual.tipo != null
  );
});
const totalComputed = computed(() => {
  const suma = +subtotalComputed.value + +impuestoComputed.value;
  return roundToNearestFiveCents(suma).toFixed(2);
});
const roundToNearestFiveCents = (number) => {
  return parseFloat((Math.round(number / 0.05) * 0.05).toFixed(2));
};
const impuestoComputed = computed(() => {
  const suma = articulos.value.reduce(
    (partial_sum, a) => partial_sum + +a.impuestos_al_enviar,
    0
  );
  return suma.toFixed(2);
});
const subtotalComputed = computed(() => {
  const suma = articulos.value.reduce(
    (partial_sum, a) => partial_sum + +a.total_al_ordenar,
    0
  );
  return suma.toFixed(2);
});

watch(keyword, () => {
  getAllProducts();
});
watch(keyproveedor, () => {
  getAllProveedors();
});

function onEscape(e) {
  if (e.key === "Esc" || e.key === "Escape") {
    limpiarCampos();
    nextTick(() => codigoRef.value.select());
    isVisible.value = false;
    openExistencias.value = false;
    openEdit.value = false;
    edicion.value = false;
    openPendiente.value = false;
    openProveedor.value = false;
    openCambiaPrecio.value = false;
  }
  if (e.key === "F9") {
    abrirModalBuscaProductsNombre();
  }
  if (e.key === "F10") {
    e.preventDefault();
    abrirExistencias(productActualId.value);
  }
  if (e.key === "F2") {
    e.preventDefault();
    // abrirCobrarModal();
  }
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

    router.push({ name: "MisMovimientos" });
  }
}
function searchProduct() {
  if (codigo.value == "" || movimientoActual.almacenOrigenId == null) {
    alert("Valor Vacio, o no has asignado almacén");
    return;
  }
  if (cargando.value) return;
  cargando.value = true;
  Product.searchCode(codigo.value, movimientoActual.almacenOrigenId)
    .then((response) => {
      if (response.data == "Producto No Encontrado") {
        codigo.value = "";
        alert("Producto No Encontrado");
        return;
      }
      productActualId.value = response.data.id;
      rellenaProductForm(response.data);

      nextTick(() => document.getElementById("cantidad").select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function rellenaProductForm(response) {
  console.log(response, "rellena");

  product_form.name = response.name;
  product_form.codigo = response.codigo;
  product_form.cantidad = 1;
  product_form.pcosto = response.pcosto;
  product_form.precio_sugerido = response.precio_sugerido;
  product_form.existencia = response.cantidad_actual;
}
function limpiarCampos() {
  codigo.value = "";
  product_form.name = "";
  product_form.codigo = "";
  product_form.cantidad = "";
  product_form.pcosto = "";
  product_form.existencia = "";
}
function getProductById(productId) {
  Product.showextend(productId, movimientoActual.almacenOrigenId)
    .then((response) => {
      if (response.data == "Producto No Encontrado") {
        codigo.value = "";
        alert("Producto No Encontrado");
      }

      codigo.value = response.data.codigo;
      productActualId.value = response.data.id;
      rellenaProductForm(response.data);
      isVisible.value = false;

      nextTick(() => document.getElementById("cantidad").select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function abrirEdicion(id, name, pcosto, cantidad) {
  edicion.value = true;
  articuloActualId.value = id;
  articulo_form.name = name;
  articulo_form.pcosto = pcosto;
  articulo_form.cantidad = cantidad;
  nextTick(() => document.getElementById("pventa").select());
}
function editarArticulo() {
  if (cargando.value) return;
  cargando.value = true;
  Movimientos.update(articuloActualId.value, movimientoActual.id, articulo_form)
    .then((response) => {
      edicion.value = false;
      getSpecificVT(movimientoActual.id);

      if (response.data) {
        if (response.data == "No Inventario") {
          return alert("No hay suficiente inventario");
        }
        if (response.data[0] != response.data[1]) {
          articulo_form.ucosto = response.data[0];
          articulo_form.pcosto = response.data[1];
          articulo_form.pventa = response.data[2];
          articulo_form.cantidad = null;
          openCambiaPrecio.value = true;
          nextTick(() => document.getElementById("pn").focus());
        }
      }
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
  openEdit.value = false;
}
function getAllProducts() {
  Product.searchKeyWord(keyword.value, almacen.id)
    .then((response) => {
      products.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function getAllPendientes() {
  Movimientos.getAllPendientes()
    .then((response) => {
      pendientes.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function getAllProveedors() {
  Proveedor.search(keyproveedor.value)
    .then((response) => {
      proveedors.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function enviarArticulo() {
  if (
    productActualId.value == null ||
    movimientoActual.id == null ||
    product_form.pcosto == null ||
    product_form.cantidad == null
  ) {
    alert("Algun Valor Nulo");
    return;
  }
  if (cargando.value) return;
  cargando.value = true;
  Movimientos.register(productActualId.value, movimientoActual.id, product_form)
    .then((response) => {
      getSpecificVT(movimientoActual.id);
      limpiarCampos();
      nextTick(() => codigoRef.value.select());
      if (response.data == "No Inventario") {
        return alert("No hay suficiente Inventario");
      }
      if (response.data) {
        if (
          response.data != "Ya existe articulo" &&
          response?.data[0] != response?.data[1]
        ) {
          articulo_form.ucosto = response.data[0];
          articulo_form.pcosto = response.data[1];
          articulo_form.pventa = response.data[2];
          openCambiaPrecio.value = true;
          nextTick(() => document.getElementById("pn").focus());
        }
      }
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function cambiaPrecio() {
  if (cargando.value) return;
  cargando.value = true;
  Movimientos.cambiaPrecio(
    articulo_form.cantidad,
    productActualId.value,
    movimientoActual.almacenOrigenId
  )
    .then(() => {
      openCambiaPrecio.value = false;
      articulo_form.cantidad = null;
      getSpecificVT(movimientoActual.id);
      nextTick(() => codigoRef.value.select());
      cargando.value = false;
    })
    .catch((error) => {
      cargando.value = false;
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function cambiaPrecioGeneral() {
  if (cargando.value) return;
  cargando.value = true;
  Movimientos.cambiaPrecioGeneral(
    articulo_form.cantidad,
    productActualId.value,
    movimientoActual.almacenOrigenId
  )
    .then(() => {
      openCambiaPrecio.value = false;
      articulo_form.cantidad = null;
      getSpecificVT(movimientoActual.id);
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function destroyArticulo(articulo) {
  if (cargando.value) return;
  cargando.value = true;
  Movimientos.destroyArticulo(articulo, movimientoActual.id)
    .then(() => {
      getSpecificVT(movimientoActual.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function getVentaticket() {
  Movimientos.getAll()
    .then((response) => {
      movimientoActual.id = response.data.id;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}

function abrirModalBuscaProductsNombre() {
  isVisible.value = true;
  getAllProducts();
  nextTick(() => keywordRef.value.focus());
  // nextTick(() => document.getElementById("keyword").focus());
}
function asignarAlmacen() {
  Movimientos.asignarAlmacen(movimientoActual.id, almacen.id, almacenDestino.id)
    .then(() => {
      getSpecificVT(movimientoActual.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
async function borrarTicket() {
  let conf = await confirm("Estas Seguro de Borrar el Ticket?");
  if (conf) {
    Movimientos.borrarTicket(movimientoActual.id)
      .then(() => {
        init();
        nextTick(() => codigoRef.value.select());
      })
      .catch((error) => {
        handleOpException(error);
        alert("Ha ocurrido un error");
      });
  }
}
function setNombreTicket() {
  Movimientos.setNombreTicket(movimientoActual.id, nombreT.value)
    .then(() => {
      getSpecificVT(movimientoActual.id);
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function setProveedor(proveedor) {
  if (cargando.value) return;
  cargando.value = true;
  Movimientos.setProveedor(proveedor, movimientoActual.id)
    .then(() => {
      getSpecificVT(movimientoActual.id);
      openProveedor.value = false;
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
async function setPendiente() {
  if (!(await confirm("Seguro que quieres dejar el movimiento pendiente?")))
    return;
  if (cargando.value) return;
  cargando.value = true;
  Movimientos.setPendiente(movimientoActual.id)
    .then(() => {
      init();
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function abrirExistencias(productId = null) {
  if (productId == null) {
    productId = productActualId.value;
  }
  if (productId == null) return alert("No has seleccionado un producto");
  openExistencias.value = true;

  Movimientos.getExistencias(productId)
    .then((response) => {
      existencias.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function aplicarAumento() {
  const costo = parseFloat(product_form.pcosto);
  const multiplicacion = costo * (porcentaje.value / 100);
  if (tipo.value == "aumento") {
    product_form.pcosto = costo + multiplicacion;
  } else {
    product_form.pcosto = costo - multiplicacion;
  }
}
function abrirProveedor() {
  openProveedor.value = true;

  nextTick(() => document.getElementById("keyproveedor").select());
  getAllProveedors();
}
function abrirPendiente() {
  openPendiente.value = true;
  getAllPendientes();
}
async function rellenaTicket(response) {
  movimientoActual.id = response.id;
  almacen.id = response.almacen_origen_id;
  movimientoActual.almacenOrigenId = response.almacen_origen_id;
  movimientoActual.almacenDestinoId = response.almacen_destino_id;

  movimientoActual.tipo = response.tipo;
  movimientoActual.consecutivo = response.consecutivo;
  movimientoActual.proveedorId = response.proveedor_id;
  movimientoActual.notas = response.notas;

  if (response.proveedor) {
    movimientoActual.proveedor = response.proveedor.name;
  } else {
    movimientoActual.proveedor = "";
  }

  if (movimientoActual.almacenOrigenId) {
    movimientoActual.miAlmacenOrigenName = response.almacen_origen.name;
    almacen.name = response.almacen_origen.name;
  }

  if (movimientoActual.almacenDestinoId) {
    movimientoActual.miAlmacenDestinoName = response.almacen_destino.name;
    almacenDestino.name = response.almacen_destino.name;
  }

  if (movimientoActual.almacenOrigenId == null || solicitudT.value == true) {
    if (store.myAlmacens.length > 0) {
      response.data = store.myAlmacens;
    } else {
      response = await Almacen.getMyAlmacens();
      store.myAlmacens = response.data;
    }
    if (response.data.length > 0) {
      if (solicitudT.value == true) {
        destinoAlmacens.value = response.data;
        almacenDestino.id = response.data[0].id;
        almacenDestino.name = response.data[0].name;
      } else {
        almacens.value = response.data;
        almacen.id = response.data[0].id;
        almacen.name = response.data[0].name;
      }
    }
    Almacen.getAll().then((response) => {
      if (response.data.length > 0) {
        if (solicitudT.value == true) {
          almacens.value = response.data;
          almacen.id = response.data[0].id;
          almacen.name = response.data[0].name;
        } else {
          destinoAlmacens.value = response.data;
          almacenDestino.id = response.data[0].id;
          almacenDestino.name = response.data[0].name;
        }
      }
    });
  }
}
async function init() {
  tipomovimiento.value = "null";
  movimientoActual.miAlmacenOrigenName = "";
  movimientoActual.miAlmacenDestinoName = "";
  let response = await Movimientos.getAll();
  rellenaTicket(response.data[0]);
  articulos.value = response.data[1];
}
function getSpecificVT(movimiento) {
  Movimientos.getSpecificVT(movimiento)
    .then((response) => {
      tipomovimiento.value = "null";
      rellenaTicket(response.data[0]);
      articulos.value = response.data[1];
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ocurrio un error favor de reportarlo a soporte tecnico");
    });
  openPendiente.value = false;
  nextTick(() => codigoRef.value.select());
}
async function guardar(tipo) {
  if (!(await confirm("Estas seguro de guardar el movimiento?"))) return;
  if (
    movimientoActual.almacenOrigenId == null ||
    movimientoActual.tipo == null
  ) {
    alert("Te falta seleccionar tipo de movimiento o almacén.");
    return;
  }
  Movimientos.guardar(movimientoActual.id, tipo)
    .then((response) => {
      if (response.data == "No has habilitado caja") {
        alert("No has habilitado caja");
      }
      init();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function goPrimerArticulo() {
  var elementos = document.getElementsByClassName("articulosInputs");
  elementos[0].focus();
}
function setMovimiento($id) {
  Movimientos.setMovimiento(movimientoActual.id, $id)
    .then(() => {
      getSpecificVT(movimientoActual.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    });
}
function makeUpdate(e) {
  const task = () => (keyword.value = e.target.value);
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
<style scoped>
.ring:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 114, 191, 0.5);
  /* Blue ring effect */
}

.highlighted-select {
  animation: pulse 1.5s infinite;
  border-radius: 8px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(56, 155, 242, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(16, 37, 64, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(13, 13, 13, 0);
  }
}
</style>

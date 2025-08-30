<template>
  <!-- <BannerVue v-if="isBannerOpen" @hide-banner="hideBanner">
        <span>Primera vez aqui...! Como primer paso debes crear un almacén/sucursal </span>
        <RouterLink :to="{ name: 'Almacens' }" class="font-bold underline" @click="hideBanner">Hazlo Aqui</RouterLink>
      </BannerVue> -->
  <!-- Toolbar -->
  <v-toolbar color="neutral200" density="compact">
    <!-- <v-icon color="primary" class="ml-2">mdi-network-pos</v-icon> -->
    <v-toolbar-title class="text-primary_d600">Punto de Venta</v-toolbar-title>
    <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
      @click="drawer = true">
      <!-- <v-icon >mdi-dots-vertical</v-icon> -->
      Ticket info
    </v-btn>
  </v-toolbar>
  <!-- Header Desktop-->
  <v-card v-if="lgAndUp">
    <v-container fluid>
      <v-row dense class="mb-2">
        <v-btn @click="setPendiente" size="small" class="mx-2" prepend-icon="mdi-sort-clock-ascending" variant="tonal">
          Pendiente
        </v-btn>
        <v-btn @click="abrirPendiente" size="small" class="mx-2" prepend-icon="mdi-file-clock" variant="tonal">
          Tickets Pendientes
        </v-btn>
        <v-btn @click="abrirCliente" size="small" class="mx-2" prepend-icon="mdi-account-multiple" variant="tonal">
          Clientes
        </v-btn>
        <v-btn v-if="showOffline" @click="goOffline" class="mx-2" variant="tonal">Offline
        </v-btn>
        <v-btn @click="copyLinkToClipBoard" size="small" class="mx-2" prepend-icon="mdi-link" variant="tonal">Mi Tienda
        </v-btn>
        <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" size="small" class="mx-2" append-icon="mdi-chevron-down" variant="tonal">Ultimo
                ticket
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="openLastTicket">
                <template v-slot:prepend>
                  <v-icon icon="mdi-eye"></v-icon>
                </template>
                <v-list-item-title>
                  Ver</v-list-item-title>
              </v-list-item>
              <v-list-item @click="printLastTicket">
                <template v-slot:prepend>
                  <v-icon icon="mdi-printer-pos"></v-icon>
                </template>
                <v-list-item-title>
                  Imprimir</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn size="small" class="mx-2" append-icon="mdi-keyboard" variant="tonal"
            @click="isShortcutsOpen = true">Atajos</v-btn>
        <v-select :items="almacenItems" v-if="ticketActual.miAlmacenId == null" label="Almacenes"
            @update:modelValue="asignarAlmacen" max-width="300" hide-details :active="true"
            class="highlighted-select"></v-select>
        <div class="d-flex justify-space-around">
          <p class="mx-2">Folio: {{ ticketActual.consecutivo }}</p>
          <p v-if="ticketActual.cliente" class="mx-2">
            Cliente: {{ ticketActual.cliente }}
          </p>
          <p v-if="ticketActual.miAlmacenName" class="mx-2">
            Almacen: {{ ticketActual.miAlmacenName }}
          </p>
          <p v-if="ticketActual.nombre" class="mx-2">
            Nombre Ticket: {{ ticketActual.nombre }}
          </p>
        </div>
        <v-progress-circular color="primary" indeterminate v-if="cargando" size="small"></v-progress-circular>
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
      <!-- Cobrar -->
      <v-row dense>
        <v-col cols="1">
          <v-btn @click="borrarTicket" prepend-icon="mdi-trash-can" hide-details variant="text">
            Borrar
          </v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn @click="abrirCobrarModal" color="primary" variant="flat" prepend-icon="mdi-currency-usd">Cobrar
          </v-btn>
        </v-col>
        <v-col cols="2">
          <v-text-field label="Nombra ticket" id="nombreT" autocomplete="off" placeholder="Nombra Ticket + Enter"
            density="compact" @keydown.stop.enter="setNombreTicket" v-model="nombreT" hide-details />
        </v-col>
        <v-col cols="1">
          <div>
            <label> SubTotal: </label>
            <p class="font-weight-bold">${{ subtotalComputed }}</p>
          </div>
        </v-col>
        <v-col cols="1">
          <div>
            <label> Descuento: </label>
            <p class="font-weight-bold">${{ descuentoComputed }}</p>
          </div>
        </v-col>
        <v-col cols="1">
          <div>
            <label> Impuesto: </label>
            <p class="font-weight-bold">${{ impuestoComputed }}</p>
          </div>
        </v-col>
        <v-col cols="1">
          <p class="font-weight-bold text-primary_l300 text-h6">
            Total: ${{ totalComputed }}
          </p>
        </v-col>
        <v-spacer />
      </v-row>
    </v-container>
  </v-card>

  <!-- Mobile Subheader -->
  <v-card v-if="mdAndDown">
    <v-container>
      <!-- Codigo -->
      <v-row dense>
        <v-col cols="8">
          <v-text-field label="Codigo" id="codigo" autocomplete="off" placeholder="Codigo + Enter"
            @keydown.right.prevent="goPrimerArticulo" @keydown.enter="searchProduct" v-model="codigo" density="compact"
            variant="outlined" hide-details class="mb-3" ref="codigoRef" />
        </v-col>
        <v-col cols="4">
          <div class="d-flex around align-center">
            <v-btn @click="searchProduct" density="compact" icon="mdi-magnify" class="mr-1" color="primary">
            </v-btn>
            <v-btn @click="abrirModalBuscaProductsNombre" density="compact" icon class="mr-1">
              <v-icon icon="mdi-binoculars"></v-icon>
            </v-btn>
            <v-btn @click="emptyValues" density="compact" icon="mdi-broom">
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <!-- Nombre -->
      <v-row no-gutters v-if="product_form.name">
        <v-col>
          <v-text-field v-model="product_form.name" label="Nombre" id="name" autocomplete="off" placeholder="" readonly
            density="compact" variant="outlined" hide-details />
        </v-col>
      </v-row>
      <!-- Cantidad -->
      <v-row dense v-if="product_form.name">
        <v-col cols="4">
          <v-text-field label="Cantidad" id="cantidad" autocomplete="off" placeholder="Cantidad"
            @keydown.stop.enter="enviarArticulo" v-model="product_form.cantidad" density="compact" variant="outlined"
            hide-details />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Ancho" autocomplete="off" placeholder="Ancho" @keydown.stop.enter="enviarArticulo"
            v-model="product_form.ancho" density="compact" variant="outlined" hide-details />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Alto" autocomplete="off" placeholder="Alto" @keydown.stop.enter="enviarArticulo"
            v-model="product_form.alto" density="compact" variant="outlined" hide-details />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Precio" id="precio" autocomplete="off" placeholder=""
            @keydown.stop.enter="enviarArticulo" v-model="product_form.pventa" density="compact" variant="outlined"
            hide-details />
        </v-col>
        <v-col cols="4">
          <v-text-field label="Existencia" id="existencia" autocomplete="off" placeholder=""
            v-model="product_form.existencia" density="compact" readonly variant="outlined" />
        </v-col>
        <v-spacer />
      </v-row>
      <v-row dense v-if="product_form.name">
        <v-col>
          <v-btn @click="abrirExistencias" density="compact" prepend-icon="mdi-eye" variant="tonal">
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
          <v-btn @click="abrirCobrarModal" color="accent" block variant="elevated" prepend-icon="mdi-cash-register"
            class="mb-3">Cobrar
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
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-sort-clock-ascending"></v-icon>
                </template>
                <v-list-item-title @click="setPendiente">
                  Pendiente</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-clock"></v-icon>
                </template>
                <v-list-item-title @click="abrirPendiente">
                  Tickets Pendientes</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-multiple"></v-icon>
                </template>
                <v-list-item-title @click="abrirCliente">
                  Clientes</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="showOffline">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-multiple"></v-icon>
                </template>
                <v-list-item-title @click="goOffline">
                  Offline</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-link"></v-icon>
                </template>
                <v-list-item-title @click="copyLinkToClipBoard">
                  Mi Tienda</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>
        <v-select :items="almacenItems" v-if="ticketActual.miAlmacenId == null" label="Almacenes"
          @update:modelValue="asignarAlmacen"></v-select>
        <!-- setNombreTicket -->
        <v-text-field label="Nombra ticket" id="nombreT" placeholder="Nombra Ticket + Enter"
          @keydown.stop.enter="setNombreTicket" v-model="nombreT" append-inner-icon="mdi-check-circle"
          @click:append-inner="setNombreTicket" />
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
        <p class="font-weight-bold">
          <span class="font-weight-medium">SubTotal:</span> ${{
            subtotalComputed
          }}
        </p>
        <p class="font-weight-bold">
          <span class="font-weight-medium">Descuento:</span> ${{
            descuentoComputed
          }}
        </p>
        <p class="font-weight-bold">
          <span class="font-weight-medium">Impuesto:</span> ${{
            impuestoComputed
          }}
        </p>
        <v-divider></v-divider>
        <p class="text-h6 text-primary_l200">
          <span class="font-weight-bold">Total: </span> ${{ totalComputed }}
        </p>
      </v-container>
    </v-card>
  </v-navigation-drawer>
  <v-container fluid>
    <v-table density="compact" color="primary_d700" fixed-header height="50vh">
      <thead>
        <tr>
          <th class="text-left" v-for="header in tHeaders" :key="header">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(articulo, index) in articulos" :key="index" class="hover:bg-blue-200">
          <td>
            <input type="checkbox" name="check" class="articulosInputs" @keydown.delete="destroyArticulo(articulo.id)"
              @keydown.enter="
                abrirEdicion(
                  articulo.id,
                  articulo.product_name ?? articulo.product.name,
                  articulo.precio_usado,
                  articulo.cantidad,
                  articulo.ancho,
                  articulo.alto,

                )
                " />
          </td>
          <td>{{ articulo.codigo }}</td>
          <td>
            <router-link :to="{
              name: 'ProductosIndex',
              query: {
                keyword: articulo.product_name ?? articulo.product.name,
              },
            }" class="font-weight-bold" :class="[
              articulo.es_kit ? 'text-success' : 'text-primary',
              articulo.product_id
                ? 'text-decoration-none'
                : 'text-decoration-line-through',
            ]" tabindex="-1">
              <p>
                {{ articulo.product_name ?? articulo.product.name }}
                <v-icon size="x-small">mdi-open-in-new</v-icon>
              </p>
            </router-link>
          </td>
          <td>{{ articulo.cantidad }}</td>
          <td>{{ articulo.ancho }}</td>
          <td>{{ articulo.alto }}</td>
          <td>{{ articulo.area_total }}</td>
          <td>
            <div :title="`Descuento aplicado: $${articulo.descuento}`">
              ${{ articulo.precio_usado }}
            </div>
          </td>
          <td>
            <p class="font-weight-bold">${{ articulo.precio_final }}</p>
          </td>
          <td>${{ articulo.importe_descuento }}</td>
          <td>
            <v-tooltip :text="`Trasladado: $${articulo.impuesto_traslado}, Retenido: $${articulo.impuesto_retenido}`"
              location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props">
                  ${{
                    articulo.impuesto_traslado - articulo.impuesto_retenido
                  }}</span>

                <!-- <v-text-field label="Nombre" id="name" autocomplete="off" placeholder="" readonly hide-details
                  v-model="product_form.name" v-bind="props" /> -->
              </template>
            </v-tooltip>
          </td>
          <td>{{ articulo.cantidad_actual }}</td>
          <td>
            <div class="flex flex-wrap sm:space-x-4">
              <v-btn @click="verImagenes(articulo?.product?.images)" class="font-bold cursor-pointer text-gray-500"
                v-if="articulo?.product?.images?.length" icon="mdi-eye" size="x-small" tabindex="-1">
              </v-btn>
              <v-btn class="font-bold cursor-pointer text-indigo-600" @click="
                openDetalles(
                  articulo
                )
                " v-if="articulo.product_id" icon="mdi mdi-dots-horizontal" size="x-small" tabindex="-1">
              </v-btn>
              <v-btn class="font-bold cursor-pointer text-indigo-600" @click="
                abrirEdicion(
                  articulo.id,
                  articulo.product_name ?? articulo.product.name,
                  articulo.precio_usado,
                  articulo.cantidad,
                  articulo.ancho,
                  articulo.alto,
                )
                " v-if="articulo.product_id" icon="mdi-pencil" size="x-small" tabindex="-1">
              </v-btn>
              <v-btn @click="destroyArticulo(articulo.id)" class="font-bold cursor-pointer text-red-500"
                icon="mdi-trash-can" size="x-small" tabindex="-1">
              </v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-container>

  <!-- Busca Producto Nombre-->
  <v-dialog v-model="isVisible" max-width="1200">
    <v-card max-height="500" >
      <v-card-title>Busca producto por nombre</v-card-title>
      <v-card-text :scrollable="false">
        <p class="text-caption">
          Informacion actualizada por ultima vez hace
          {{ lastFetchTimeFormatted }}
        </p>
        <v-row dense class="mb-2">
          <v-btn @click.stop="getProductsNow" @keydown.enter.stop="getProductsNow" density="compact" icon="mdi-reload"
            class="mx-2">
          </v-btn>
          <v-text-field @input="makeUpdate" label="Buscar Producto" prepend-inner-icon="mdi-magnify" hide-details
            single-line ref="keyw"></v-text-field>
        </v-row>
        <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="headers" :items="products" items-per-page="100" density="compact" fixed-header
          keyboard-navigation="false" height="50vh">
          <template v-slot:item.name="{ item }" tabindex="-1">
            <a href="#" class="font-weight-bold text-decoration-none"
              :class="[item.es_kit ? 'text-green' : '', item.consumible == 'generico' ? 'text-warning' : '', item.consumible == 'regular' ? 'text-neutral700' : '', item.consumible === null && !!!item.es_kit ? 'text-primary' : '',]"
              @keydown.enter.prevent="getProductById(item.id)" @click.prevent="getProductById(item.id)">
              <span>{{ item.name }}</span>
            </a>
          </template>
          <template v-slot:item.precio="{ item }">
            <span>${{ item.precio }}</span>
          </template>
          <template v-slot:item.precio_final="{ item }">
            <span>${{ item.precio_final }}</span>
          </template>
          <template v-slot:item.es_kit="{ item }">
            <span>{{ item.es_kit ? "Sí" : "No" }}</span>
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
  <v-dialog v-model="openCliente" max-width="1200">
    <v-card>
      <v-card-title>Clientes</v-card-title>
      <v-card-text>
        <v-text-field v-model="keycliente" label="Cliente" prepend-inner-icon="mdi-magnify" variant="outlined"
          placeholder="Ingresa nombre del cliente" hide-details single-line id="keycliente"></v-text-field>
        <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
        <v-data-table :headers="clienteHeaders" :items="clients" items-per-page="10">
          <!-- Dollar sign formatting for "Importe" column -->
          <template v-slot:item.name="{ item }">
            <a href="" class="decoration-none" @keydown.enter.prevent="setCliente(item.id)"
              @click.prevent="setCliente(item.id)"><span color="primary">{{ item.name }}</span></a>
          </template>
          <template v-slot:item.saldo_actual="{ item }">
            <span>${{ item.saldo_actual }}</span>
          </template>
          <template v-slot:item.limite_credito="{ item }">
            <span>${{ item.limite_credito }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn prepend-icon="mdi-check" size="small" tabindex="-1" @click="setCliente(item.id)" color="primary">
              Agregar
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
  <!-- Pendientes -->
  <v-dialog v-model="openPendiente" max-width="1200">
    <v-card>
      <v-card-title>Pendientes</v-card-title>
      <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
      <v-card-text>
        <v-data-table :headers="pendientesHeaders" :items="pendientes" items-per-page="5">
          <template v-slot:item.consecutivo="{ item }">
            <a href="" class="decoration-none" @keydown.enter.prevent="getSpecificVT(item.id)"
              @click.prevent="getSpecificVT(item.id)"><span color="primary">{{ item.consecutivo }}</span></a>
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
          <template v-slot:item.actions="{ item }">
            <v-btn prepend-icon="mdi-check" size="small" tabindex="-1" @click="getSpecificVT(item.id)" color="primary">
              Asignar
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Existencias-->
  <v-dialog v-model="openExistencias" >
    <v-card>
      <v-card-title>Existencias</v-card-title>
      <v-card-text> </v-card-text>
      <v-progress-linear color="accent" indeterminate v-if="cargando"></v-progress-linear>
      <v-data-table :headers="existenciasHeaders" :items="existencias" items-per-page="5" show-select
        select-strategy="single">
        <template v-slot:item.data-table-select="{
          internalItem,
          isSelected,
          toggleSelect,
          index,
        }">
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
        <v-text-field label="Precio" id="pventa" autocomplete="off" placeholder="" v-model="articulo_form.pventa"
          @keydown.stop.enter="editarArticulo" />
        <v-text-field label="Cantidad" id="cantidad" autocomplete="off" placeholder="Ingresa la cantidad"
          density="compact" v-model="articulo_form.cantidad" @keydown.stop.enter="editarArticulo" type="number" />
        <v-text-field label="Ancho" autocomplete="off" placeholder="Ancho" density="compact"
          v-model="articulo_form.ancho" @keydown.stop.enter="editarArticulo" type="number" />
        <v-text-field label="Alto" autocomplete="off" placeholder="Alto" density="compact" v-model="articulo_form.alto"
          @keydown.stop.enter="editarArticulo" type="number" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="editarArticulo" color="accent" variant="outlined" :loading="cargando">Confirmar</v-btn>
        <v-btn @click="edicion = false" variant="text" :loading="cargando">Cancelar</v-btn>
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
          v-model="conversion_form.peso" @input.stop="modificaPeso" @keydown.stop.enter="aceptarConversion"
          type="number" />
        <v-text-field label="Total $" id="total" autocomplete="off" placeholder="" density="compact"
          @input.stop="modificaTotal" v-model="total" @keydown.stop.enter="aceptarConversion" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="openConversion = false" variant="text" :loading="cargando">Cancelar</v-btn>
        <v-btn @click="aceptarConversion" color="accent" variant="outlined" :loading="cargando">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Cobrar -->
  <v-dialog v-model="openCobrar" max-width="600">
    <v-card>
      <v-card-title>Cobrar ${{ totalComputed }}</v-card-title>
      <v-card-text>
        <v-tabs v-model="tab" color="primary" class="mb-2">
          <v-tab value="basico">Básico</v-tab>
          <v-tab value="avanzado">Avanzado</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="basico">
            <v-container>
              <v-text-field label="Su cambio" autocomplete="off" placeholder="" v-model="cambio" readonly />
              <v-text-field type="number" @wheel.prevent label="Paga Con" id="pagocon" autocomplete="off" placeholder=""
                v-model.number="pagocon" @keydown.enter.exact="guardarVenta(false)" />
              <v-text-field label="Telefono" id="telefono" autocomplete="off" placeholder="" v-model="telefono"
                @keydown.enter="guardarVenta(false)" />
              <div v-if="ticketActual.clienteId">
                <v-checkbox v-model="credito" :label="`Es venta a crédito?`" id="credito"></v-checkbox>
              </div>
            </v-container>
          </v-tabs-window-item>
          <v-tabs-window-item value="avanzado">
            <v-container>
              <v-row dense>
                <v-text-field label="Suma formas de pago" autocomplete="off" placeholder="" v-model="sumatoria"
                  @keydown.enter="guardarVenta(false)" readonly />
                <v-text-field label="Su cambio" autocomplete="off" placeholder="" v-model="cambio" readonly />
              </v-row>
              <v-row dense>
                <v-text-field label="Efectivo" autocomplete="off" v-model.number="pagocon"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.efectivo_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Tarjeta de débito" autocomplete="off" v-model.number="forma_pago.tarjeta_debito"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.tarjeta_debito_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Tarjeta de crédito" autocomplete="off" v-model.number="forma_pago.tarjeta_credito"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.tarjeta_credito_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Transferencia" autocomplete="off" v-model.number="forma_pago.transferencia"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.transferencia_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Cheque" autocomplete="off" v-model.number="forma_pago.cheque"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.cheque_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-row dense>
                <v-text-field label="Vales de despensa" autocomplete="off" v-model.number="forma_pago.vales_de_despensa"
                  @keydown.enter="guardarVenta(false)" type="number" @wheel.prevent />
                <v-text-field label="Referencia" autocomplete="off" v-model.number="forma_pago.vales_de_despensa_ref"
                  @keydown.enter="guardarVenta(false)" />
              </v-row>
              <v-text-field label="Telefono" id="telefono" autocomplete="off" placeholder="" v-model="telefono"
                @keydown.enter="guardarVenta(false)" />
            </v-container>
          </v-tabs-window-item>
        </v-tabs-window>
        <p v-if="amountExceedsTotal" class="text-error text-caption">
          *Pago inprocedente, la cantidad supera al total
        </p>
      </v-card-text>
      <v-card-actions>
        <template v-if="mdAndUp">
          <v-tooltip text="Vender" location="top">
            <template v-slot:activator="{ props }">
              <v-btn @click="guardarVenta(false)" size="small" variant="outlined" color="accent" prepend-icon="mdi-cash"
                class="ring">Vender</v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Vender e imprimir" location="top">
            <template v-slot:activator="{ props }">
              <v-btn @click="guardarVenta(true)" size="small" variant="outlined" color="accent"
                prepend-icon="mdi-printer-pos" class="ring" v-bind="props">Vender</v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Vender y mandar whatsapp" location="top">
            <template v-slot:activator="{ props }">
              <v-btn @click="guardarVentaWha(false)" size="small" variant="outlined" color="accent"
                prepend-icon="mdi-whatsapp" class="ring" v-bind="props">Vender</v-btn>
            </template>
          </v-tooltip>
        </template>
        <v-btn @click="openCobrar = false" size="small">Cancelar</v-btn>

        <v-menu transition="scale-transition" class="ma-2 pa-2" v-if="smAndDown">
          <template v-slot:activator="{ props }">
            <v-btn color="accent" v-bind="props" append-icon="mdi-menu-down" :loading="cargando">
              Vender
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="guardarVenta(false)">
              <template v-slot:prepend>
                <v-icon icon="mdi-cash"></v-icon>
              </template>
              <v-list-item-title> Vender</v-list-item-title>
            </v-list-item>
            <v-list-item @click="guardarVenta(true)">
              <template v-slot:prepend>
                <v-icon icon="mdi-printer-pos"></v-icon>
              </template>
              <v-list-item-title> Vender Imprimir</v-list-item-title>
            </v-list-item>
            <v-list-item @click="guardarVentaWha(false)">
              <template v-slot:prepend>
                <v-icon icon="mdi-whatsapp"></v-icon>
              </template>
              <v-list-item-title> Vender Whatsapp</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isDetallesOpen">
    <v-card>
      <v-card-title>
        Archivos
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-row>
              <v-col cols="12">
                <v-file-input multiple label="Upload Files" accept="image/*,application/pdf,application/photoshop"
                  @change="handleFiles" :loading="cargando" color="primary" ref="fileInput"></v-file-input>
                <v-col v-for="(file, index) in selectedFiles" :key="index" class="position-relative" cols="12">
                  <div v-if="file.type.startsWith('image/')">
                    <v-img :src="previewImages[index]" class="rounded-md" height="128px" contain />
                  </div>
                  <div v-else>
                    <v-icon large>mdi-file</v-icon>
                    <div>{{ file.name }}</div>
                  </div>
                  <v-btn icon size="small" class="absolute top-0 right-0" @click="removeImage(index)" color="error">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-col>
                <v-btn color="primary" type="submit" class="mt-4" @click="submitForm">Subir</v-btn>
              </v-col>
              <v-col cols="12">
                <v-textarea label="Descripción" v-model="articuloDescription" rows="2" color="primary"
                  variant="outlined"></v-textarea>
                <v-btn color="primary" @click="updateArticuloDescription">Guardar</v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="9">
            <v-card>
              <v-card-text>
                <!-- <v-btn text @click="isVisible = true" class="ma-2">Ver Todas</v-btn> -->
                <v-data-table :headers="filesHeaders" :items="files" items-per-page="5">
                  <template v-slot:item.image="{ item, index }">
                    <v-img :src="item.url" height="56px" contain @click="openCarousel(index)"
                      class="cursor-pointer"></v-img>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon="mdi-trash-can" size="small" color="error" @click="eliminarFile(item.id)"></v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="isDetallesOpen = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Modal Carousel Files-->
  <v-dialog v-model="isCarouselFilesOpen">
    <v-card>
      <v-card-title>
        Archivos
      </v-card-title>
      <v-card-text>
        <v-carousel v-model="selectedIndex">
          <v-carousel-item v-for="image in files" :src="image.url"></v-carousel-item>
        </v-carousel>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="isCarouselFilesOpen = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Imagenes -->
  <v-dialog v-model="isOpenImagenes">
    <v-card>
      <v-card-title>Imágenes</v-card-title>
      <v-card-text>
        <v-carousel>
          <v-carousel-item v-for="image in imagenes" :src="image.url" cover></v-carousel-item>
        </v-carousel>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isOpenImagenes = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isShortcutsOpen" max-width="600">
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
        <v-btn color="primary" @click="isShortcutsOpen = false" variant="outlined">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <DynamicSnack :snackbar="snackbar" />
</template>
<style>
.v-chip {
  font-weight: 500;
  font-family: monospace;
}

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
<script setup>
import {
  onMounted,
  onUnmounted,
  ref,
  reactive,
  watch,
  nextTick,
  computed,
  useTemplateRef,
} from "vue";

import { useRouter } from "vue-router";
import Product from "../apis/Product";
import PuntoVenta from "../apis/PuntoVenta";
import Almacen from "../apis/Almacen";
import Cliente from "../apis/Cliente";
import { useUserStore } from "../s";
import { storeToRefs } from "pinia";
import User from "../apis/User";
import { removeVuetifyTableTabIndexes } from "../utils";

import { WebviewWindow } from "@tauri-apps/api/window";

const store = useUserStore();
import Organizacion from "../apis/Organizacion";
import Articulo from "../apis/Articulo";
import { useSnackBar } from "../composables/SnackBar";
import DynamicSnack from "../components/DynamicSnack.vue";
import { useDisplay } from "vuetify";
const { xs, mdAndUp, mdAndDown, lgAndUp, smAndDown } = useDisplay();
const { productsData, lastFetchTimes } = storeToRefs(store);
const { isOpException, getExceptionMsg, handleOpException } = store;
const router = useRouter();
const { snackbar, snackSuccess, snackError, snackWarning } = useSnackBar();
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
  ancho: null,
  alto: null,
  pcosto: null,
  pventa: null,
});
const almacen = reactive({
  id: "",
  name: "",
});
const forma_pago = reactive({
  efectivo: 0,
  efectivo_ref: "",
  tarjeta_debito: 0,
  tarjeta_debito_ref: "",
  tarjeta_credito: 0,
  tarjeta_credito_ref: "",
  transferencia: 0,
  transferencia_ref: "",
  cheque: 0,
  cheque_ref: "",
  vales_de_despensa: 0,
  vales_de_despensa_ref: "",
  pago_con: 0,
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
const keyw = ref(null);

const total = ref(null);
const tab = ref(null);
const telefono = ref("");
const codigo = ref("");
const codigoRef = ref(null);
const isBannerOpen = ref(false);
const isDetallesOpen = ref(false);
const cargando = ref(false);
const credito = ref(false);
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
const isOpenImagenes = ref(false);
const imagenes = ref([]);
const isInfoAgregarExistenciaOpen = ref(false);
const isShortcutsOpen = ref(false);
const openEdit = ref(false);
const openExistencias = ref(false);
const openCobrar = ref(false);
const openCliente = ref(false);
const openPendiente = ref(false);
const openConversion = ref(false);
const nombreT = ref("");
const pagocon = ref(0);
// const isQrOpen = ref(false)
const qrString = ref("");
const selectedFiles = ref([]);
const articuloDescription = ref('');
const previewImages = ref([]);
const fileInput = ref(null);
const timeOut = ref("");
const files = ref([]);
const isCarouselFilesOpen = ref(false);
const selectedIndex = ref(0);
const tHeaders = ref([
  "-",
  "Código",
  "Nombre",
  "Cantidad",
  "Ancho",
  "Alto",
  "Área",
  "Precio",
  "Importe",
  "Descuento",
  "Impuesto",
  "Existencia",
  "Acciones",
]);
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
]
const headers = ref([
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
const filesHeaders = ref([
  { title: "Imagen", key: "image", align: "start", sortable: false },
  { title: "Nombre", key: "filename", align: "start", sortable: false },
  { title: "Formato", key: "mime_type", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
]);
const clienteHeaders = ref([
  { title: "Id", key: "id", align: "start", sortable: false },
  { title: "Nombre", key: "name", align: "start", sortable: false },
  {
    title: "Saldo Actual",
    key: "saldo_actual",
    align: "start",
    sortable: false,
  },
  {
    title: "Límite de Crédito",
    key: "limite_credito",
    align: "start",
    sortable: false,
  },
  { title: "Teléfono", key: "telefono", align: "start", sortable: false },
  { title: "Email", key: "email", align: "start", sortable: false },
  { title: "", key: "actions", align: "start", sortable: false },
]);
const pendientesHeaders = ref([
  { title: "Folio", key: "consecutivo", align: "start", sortable: false },
  { title: "Nombre", key: "nombre", align: "start", sortable: false },
  { title: "Cliente", key: "cliente", align: "start", sortable: false },
  { title: "Almacén", key: "almacen", align: "start", sortable: false },
  { title: "Total", key: "total", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
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

const showBanner = (length) => {
  return (
    !store.authuser?.configuration?.features?.crea_almacen &&
    length == 0 &&
    store.isAdmin
  );
};
const sumatoria = computed(() => {
  return (
    +forma_pago.cheque +
    +forma_pago.efectivo +
    +forma_pago.tarjeta_credito +
    +forma_pago.tarjeta_debito +
    +forma_pago.transferencia +
    +forma_pago.vales_de_despensa +
    +pagocon.value
  );
});
const lastFetchTimeFormatted = computed(() => {
  return formatRelativeTime(lastFetchTimeLocal.value);
});
const showOffline = computed(() => {
  return window.__TAURI_METADATA__;
});
const goOffline = () => {
  router.push({ name: "Offline" });
};
const showInfo = computed(() => {
  return (
    product_form.existencia == 0 &&
    !store.authuser?.configuration?.features?.howto_inventario
  );
});
const whaStatus = ref(true);
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
const drawer = ref(false);

const totalComputed = computed(() => {
  const suma =
    +subtotalComputed.value +
    +impuestoComputed.value -
    +descuentoComputed.value;
  return roundToNearestFiveCents(suma).toFixed(2);
});
const roundToNearestFiveCents = (number) => {
  return parseFloat((Math.round(number / 0.05) * 0.05).toFixed(2));
};
const impuestoComputed = computed(() => {
  const suma = articulos.value.reduce(
    (partial_sum, a) =>
      partial_sum + +a.impuesto_traslado - +a.impuesto_retenido,
    0
  );
  return suma.toFixed(2);
});
const descuentoComputed = computed(() => {
  const suma = articulos.value.reduce(
    (partial_sum, a) => partial_sum + +a.importe_descuento,
    0
  );
  return suma.toFixed(2);
});
const amountExceedsTotal = computed(() => {
  return +sumatoria.value - +pagocon.value > +totalComputed.value;
});
const amountUnderTotal = computed(() => {
  let resta =
    +pagocon.value - (totalComputed.value - sumatoria.value + +pagocon.value);
  if (resta < 0) return true;
  return false;
});
const subtotalComputed = computed(() => {
  const suma = articulos.value.reduce(
    (partial_sum, a) => partial_sum + +a.precio_final,
    0
  );
  return suma.toFixed(2);
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
const cambio = computed(() => {
  if (amountExceedsTotal.value) {
    return "Monto excede total";
  }
  let resta =
    +pagocon.value - (totalComputed.value - sumatoria.value + +pagocon.value);
  if (resta < 0) {
    return `Te Faltan $${-resta} `;
  } else {
    return `$${resta}`;
  }
});
const efectivoCalculated = computed(() => {
  return -(+sumatoria.value - +pagocon.value - +totalComputed.value);
});
const printLastTicket = async () => {
  try {
    const { data } = await PuntoVenta.getLastTicket();
    if (data) {
      print(data.id);
    }
  } catch (error) {
    handleOpException(error);
    console.log(error);

    alert("Ha ocurrido un error");
  }
};
const copyLinkToClipBoard = async () => {
  try {
    const { data } = await Organizacion.getMyOrganization();
    navigator.clipboard.writeText(data.url);
    snackSuccess(
      "El link de tu tienda se ha copiado al portapapeles, compartelo con tus clientes "
    );
  } catch (error) {
    handleOpException(error);
    console.log(error);

    alert("Ha ocurrido un error");
  }
};
const pventa_porcentaje = computed(() => {
  if (product_form.porcentaje_ganancia == 0) {
    return 0;
  }
  return (
    +product_form.pcosto +
    +product_form.pcosto * (+product_form.porcentaje_ganancia / 100)
  );
});
const resetFormaPago = () => {
  forma_pago.efectivo = 0;
  forma_pago.efectivo_ref = "";
  forma_pago.tarjeta_debito = 0;
  forma_pago.tarjeta_debito_ref = "";
  forma_pago.tarjeta_credito = 0;
  forma_pago.tarjeta_credito_ref = "";
  forma_pago.transferencia = 0;
  forma_pago.transferencia_ref = "";
  forma_pago.cheque = 0;
  forma_pago.cheque_ref = "";
  forma_pago.vales_de_despensa = 0;
  forma_pago.vales_de_despensa_ref = "";
  forma_pago.pago_con = 0;
};
watch(tab, (newVal) => {
  resetFormaPago();
  if (newVal == "avanzado") {
    credito.value = false;
  }
});
watch(keycliente, () => {
  getAllClientes();
});
function onEscape(e) {
  if (e.key === "Esc" || e.key === "Escape") {
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
    openCobrar.value = false;
    openCliente.value = false;
    openPendiente.value = false;
    openConversion.value = false;
    nextTick(() => codigoRef.value.select());
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
  if (e.key === "F2") {
    e.preventDefault();
    abrirCobrarModal();
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
    router.push({ name: "VentasIndex" });
  }
}
const openLastTicket = async () => {
  try {
    const { data } = await PuntoVenta.getLastTicket();
    if (data) {
      router.push({ name: "VentasShow", params: { ventaId: data.id } });
    }
  } catch (error) {
    handleOpException(error);
    console.log(error);
    alert("Ha ocurrido un error");
  }
};
function modificaPrecioBase(event) {
  conversion_form.precioBase = event.target.value;
  const fixed = +event.target.value * +conversion_form.peso;
  let res = Math.round(fixed * 100) / 100;
  total.value = res;
}
const openInfoAgregarExistencia = () => {
  isInfoAgregarExistenciaOpen.value = true;
};
async function updateFeatureHowTo() {
  const response = await User.updateFeature({
    key: "howto_inventario",
    value: true,
  });
  store.authuser = response.data[0];
  isInfoAgregarExistenciaOpen.value = false;
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
  if (!!cargando.value) return;
  cargando.value = true;
  if (codigo.value == "") {
    cargando.value = false;
    snackWarning("Campo Código Vacio");
    return;
  }
  if (almacen.id == null) {
    cargando.value = false;
    snackWarning("No has seleccionado almacen");
    return;
  }

  Product.searchCode(codigo.value, almacen.id)
    .then((response) => {
      if (response.data == "Producto No Encontrado") {
        snackWarning("Producto No Encontrado");
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
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function emptyValues() {
  codigo.value = "";
  product_form.name = "";
  product_form.codigo = "";
  product_form.cantidad = "";
  product_form.ancho = "";
  product_form.alto = "";
  product_form.pventa = "";
  product_form.precio_mayoreo = "";
  product_form.existencia = "";
  product_form.usa_medidas = false;
  drawer.value = false;
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
      alert("Ha ocurrido un error");
    })
    .finally(() => {
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
  const response = await User.updateFeature({
    key: "crea_almacen",
    value: true,
  });
  store.authuser = response.data[0];
};
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
      store.myAlmacens = response.data;
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
function openDetalles(articulo) {
  // blurPrimerArticulo();
  articuloActualId.value = articulo.id;
  articulo_form.name = articulo.name;
  articulo_form.pventa = articulo.pventa;
  articulo_form.cantidad = articulo.cantidad;
  articulo_form.ancho = articulo.ancho;
  articulo_form.alto = articulo.alto;
  articuloDescription.value = articulo.description;
  isDetallesOpen.value = true;
  getFiles()
  // nextTick(() => document.getElementById("pventa").select());
}
function getFiles() {
  Articulo.getFiles(articuloActualId.value)
    .then((response) => {
      files.value = response.data.images
      // console.log(imagenes.value);
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function updateArticuloDescription() {
  Articulo.updateArticuloDescription(articuloActualId.value, articuloDescription.value)
    .then((response) => {
      getSpecificVT(ticketActual.id);
      alert("Descripción Actualizada")
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function editarArticulo() {
  if (cargando.value) return;
  cargando.value = true;

  PuntoVenta.update(articuloActualId.value, ticketActual.id, articulo_form)
    .then((response) => {
      if (response.data == "No inventario") {
        return snackWarning("No hay suficiente inventario");
      }
      edicion.value = false;
      getSpecificVT(ticketActual.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
      openEdit.value = false;
    });
}
function getAllProducts() {
  const currentTime = new Date().getTime();
  const lastFetchTime = lastFetchTimes.value[keyword.value] || 0; // Default to 0 if keyword.value doesn't exist
  const isDataStale =
    !lastFetchTime || currentTime - lastFetchTime >= 5 * 60 * 1000;

  if (!productsData.value[keyword.value] || isDataStale) {
    // Fetch new data from the server
    // Update store state and last fetch time
    Product.searchKeyWord(keyword.value, almacen.id, false)
      .then((response) => {
        products.value = response.data;
        productsData.value[keyword.value] = response.data;
        lastFetchTimes.value[keyword.value] = currentTime;
        lastFetchTimeLocal.value = currentTime;
        nextTick(() => {
          removeVuetifyTableTabIndexes()
        })
      })
      .catch((error) => {
        handleOpException(error);
        alert("Ha ocurrido un error" + error.message);
      })
      .finally(() => { });
  } else {
    products.value = productsData.value[keyword.value];
    lastFetchTimeLocal.value = lastFetchTime;
    nextTick(() => {
      removeVuetifyTableTabIndexes()
    })
  }
}
function getProductsNow() {
  const currentTime = new Date().getTime();
  Product.searchKeyWord(keyword.value, almacen.id, false)
    .then((response) => {
      products.value = response.data;
      productsData.value[keyword.value] = response.data;
      lastFetchTimes.value[keyword.value] = currentTime;
      lastFetchTimeLocal.value = currentTime;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error" + error.message);
    })
    .finally(() => { });
}
function getAllPendientes() {
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.getAllPendientes()
    .then((response) => {
      pendientes.value = response.data;
      goPrimerPendiente();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
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
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function enviarArticulo() {
  if (cargando.value) return;
  cargando.value = true;
  if (product_form.usa_medidas && (!product_form.ancho || !product_form.alto)) {
    cargando.value = false;
    return snackWarning("Falta determinar: ancho o alto ");
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
    return snackWarning("Falta determinar: precio o cantidad ");
  }
  if (product_form.existencia == null || product_form.existencia == "0.00") {
    cargando.value = false;
    nextTick(() => codigoRef.value.select());
    return snackWarning("Producto sin existencia");
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
  PuntoVenta.register(productActualId.value, ticketActual.id, product_form)
    .then((response) => {
      getSpecificVT(ticketActual.id);

      emptyValues();
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
function destroyArticulo(articulo) {
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.destroyArticulo(articulo, ticketActual.id)
    .then(() => {
      getSpecificVT(ticketActual.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => { });
}
async function abrirModalBuscaProductsNombre() {
  isVisible.value = true;
  getAllProducts();
  await nextTick(() => {
    keyw.value.focus()
  });
}
function asignarAlmacen(almacenId) {
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.asignarAlmacen(ticketActual.id, almacenId)
    .then(() => {
      getSpecificVT(ticketActual.id);
      snackSuccess("Almacén asignado al ticket");
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = true;
      drawer.value = false;
    });
}
async function borrarTicket() {
  let conf = await confirm("Estas Seguro de Borrar el Ticket?");
  if (conf) {
    if (cargando.value) return;
    cargando.value = true;
    PuntoVenta.borrarTicket(ticketActual.id)
      .then(() => {
        init();
        ticketActual.miAlmacenName = "";
        emptyValues();
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
}
function setNombreTicket() {
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.setNombreTicket(ticketActual.id, nombreT.value)
    .then(() => {
      getSpecificVT(ticketActual.id);
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
function setCliente(cliente) {
  if (cargando.value) return;
  cargando.value = true;
  Cliente.setCliente(cliente, ticketActual.id)
    .then((response) => {
      if (response.data?.success && response.data?.retentionRules?.length) {
        if (
          confirm(
            "Se aplicaran las siguientes reglas de retencion: " +
            response.data.retentionRules
          ) == true
        ) {
          cargando.value = false;
          acceptRetentionRules();
        }
      }
      getSpecificVT(ticketActual.id);
      openCliente.value = false;
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      console.log(error);

      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function acceptRetentionRules() {
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.acceptRetentionRules(ticketActual.id)
    .then((response) => {
      getSpecificVT(ticketActual.id);
      openCliente.value = false;
      nextTick(() => codigoRef.value.select());
    })
    .catch((error) => {
      console.log(error);

      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
async function setPendiente() {
  if (!(await confirm("Seguro que quieres dejar la venta pendiente?"))) return;
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.setPendiente(ticketActual.id)
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
function abrirExistencias() {
  if (productActualId.value == null)
    return alert("No has seleccionado un producto");
  if (cargando.value) return;
  cargando.value = true;
  openExistencias.value = true;
  PuntoVenta.getExistencias(productActualId.value)
    .then((response) => {
      existencias.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function abrirCobrarModal() {
  tab.value = "basic";
  openCobrar.value = true;
  resetFormaPago();
  pagocon.value = totalComputed.value;
  nextTick(() => document.getElementById("pagocon").select());
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
    let response = await PuntoVenta.getAll();
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
  PuntoVenta.getSpecificVT(ventaticket)
    .then((response) => {
      rellenaTicket(response.data[0]);
      articulos.value = response.data[1];
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
      openPendiente.value = false;
      nextTick(() => codigoRef.value.select());
    });
}
function guardarVenta(imprimir) {
  if (cargando.value) return;
  cargando.value = true;
  if (amountExceedsTotal.value) {
    alert("El monto excede el total");
    cargando.value = false;
    return;
  }
  if (amountUnderTotal.value) {
    alert("El pago no cubre el total");
    cargando.value = false;
    return;
  }
  forma_pago.pago_con = pagocon.value;
  forma_pago.efectivo = efectivoCalculated.value;
  PuntoVenta.guardarVenta(ticketActual.id, forma_pago, credito.value)
    .then((response) => {
      openCobrar.value = false;
      if (imprimir) {
        print();
      }
      init();
      snackSuccess("La venta ha sido agregada exitosamente");
    })
    .catch((error) => {
      if (
        isOpException(error) &&
        getExceptionMsg(error).includes("No has habilitado la caja")
      ) {
        snackError(getExceptionMsg(error));
        setTimeout(() => {
          router.push({ name: "Cortes" });
        }, 2000);
        return;
      }
      if (error.response.status === 422) {
        alert(error.response.data.message);
        return;
      }
      handleOpException(error);

      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function print(ticket = null) {
  if (!ticket) {
    ticket = ticketActual.id;
  }
  if (window.__TAURI_METADATA__) {
    const webview = new WebviewWindow("ImprimirVenta", {
      url: `ventatickets/imprimir/${ticket}`,
      title: "Imprimir Venta",
    });
  } else {
    window.open(
      `${import.meta.env.VITE_APP_URL}/ventatickets/imprimir/${ticket}`,
      "_blank",
      "noreferrer"
    );
  }
}
function guardarVentaWha() {
  if (cargando.value) return;
  cargando.value = true;
  if (amountExceedsTotal.value) {
    alert("El monto excede el total");
    cargando.value = false;
    return;
  }
  if (amountUnderTotal.value) {
    alert("El pago no cubre el total");
    cargando.value = false;
    return;
  }
  if (!telefono.value || telefono.value.length < 10) {
    cargando.value = false;
    snackWarning("Introduce un telefono valido");
    return;
  }
  forma_pago.pago_con = pagocon.value;
  forma_pago.efectivo = efectivoCalculated.value;
  PuntoVenta.guardarVenta(ticketActual.id, forma_pago, credito.value)
    .then((response) => {
      openCobrar.value = false;
      init();
      const localTelefono = telefono.value;
      PuntoVenta.sendVentaToWha(ticketActual.id, telefono.value)
        .then((response) => {
          const text = response.data.text;
          const encodedMessage = encodeURIComponent(text);
          const whatsappMobileLink = `https://wa.me/521${localTelefono}?text=${encodedMessage}`;
          const whatsappWebLink = `https://web.whatsapp.com/send?phone=521${localTelefono}&text=${encodedMessage}`;
          const link = isMobileDevice() ? whatsappMobileLink : whatsappWebLink;
          window.open(link, "_blank");
        })
        .catch((error) => {
          handleOpException(error);

          alert("Ha ocurrido un error");
        })
        .finally(() => {
          cargando.value = false;
        });
      snackSuccess("La venta ha sido agregada exitosamente");
    })
    .catch((error) => {
      if (
        isOpException(error) &&
        getExceptionMsg(error).includes("No has habilitado la caja")
      ) {
        snackError(getExceptionMsg(error));
        setTimeout(() => {
          router.push({ name: "Cortes" });
        }, 2000);
        return;
      }
      handleOpException(error);

      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

function blurPrimerArticulo() {
  const elementos = document.getElementsByClassName("articulosInputs");
  const firstCheckbox = elementos[0].querySelector("input");
  if (firstCheckbox) {
    firstCheckbox.blur();
  }
}
function goPrimerArticulo() {
  const elementos = document.getElementsByClassName("articulosInputs");
  elementos[0].focus();
}
function goPrimerPendiente() {
  nextTick(() => {
    // const elementos = document.getElementsByClassName("articulosPendientesInputs");
    // const firstCheckbox = elementos[0].querySelector('input');
    // if (firstCheckbox) {
    //   firstCheckbox.focus();
    // }
  });
}
const removeImage = (index) => {
  selectedFiles.value.splice(index, 1);
  previewImages.value.splice(index, 1);
};
const openCarousel = (index) => {
  selectedIndex.value = index;
  isCarouselFilesOpen.value = true;
};
const eliminarFile = async (articulo) => {
  if (cargando.value) return;
  try {
    const response = await Articulo.deleteFile(articulo);
    cargando.value = true;

    if (response.status === 200) {
      getFiles();
      // alert('Archivos borrado exitosamente');
    } else {
      console.error('Failed to upload files');
      alert('Error al borrar archivos');
    }
  } catch (error) {
    console.error('An error occurred', error);
  } finally {
    cargando.value = false;
  }

}
const handleFiles = (event) => {
  cargando.value = true;
  const files = Array.from(event.target.files);
  selectedFiles.value.push(...files);

  // Generate image previews
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImages.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
  cargando.value = false;
};
const submitForm = async () => {
  if (!selectedFiles.value.length) {
    alert("No hay archivos seleccionados");
    return;
  }
  cargando.value = true;
  const formData = new FormData();
  selectedFiles.value.forEach(file => {
    formData.append('files[]', file);
  });

  try {
    const response = await Articulo.attachFiles(articuloActualId.value, formData);
    cargando.value = false;

    if (response.status === 201) {
      selectedFiles.value = [];
      selectedFiles.value = []; // limpia tus datos
      previewImages.value = []; // si estás usando previews
      fileInput.value.reset(); // limpia el input de Vuetify
      getFiles();
      console.log('Files uploaded successfully');
      // alert('Archivos subidos exitosamente');
    } else {
      console.error('Failed to upload files');
      alert('Error al subir archivos');
    }
  } catch (error) {
    console.error('An error occurred', error);
  }
};

function verImagenes(images) {
  console.log(images);

  imagenes.value = images;
  isOpenImagenes.value = true;
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

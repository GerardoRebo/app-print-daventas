<template>
  <v-card class="mb-2" v-if="mdAndUp">
    <v-card-title>Ticket venta folio # {{ ticketActual?.consecutivo }}</v-card-title>
    <v-card-text>
      <router-link :to="{ name: 'VentasIndex' }">
        <span class="text-decoration-underline text-caption">
          Regresar al historial de ventas
        </span>
      </router-link>
      <v-row dense class="mt-2">
        <v-btn size="small" @click="verFormasDePago" class="mx-2" prepend-icon="mdi-wallet">Formas de pago</v-btn>
        <v-btn size="small" @click="imprimirVenta" class="mx-2" prepend-icon="mdi-printer-pos">Reimprimir</v-btn>
        <v-btn size="small" v-if="
          !ticketActual.esta_cancelado &&
          !devuelto
        " @click="cancelarVenta" class="mx-2" prepend-icon="mdi-cancel">Cancelar</v-btn>
        <v-btn size="small" v-if="
          !ticketActual.esta_cancelado &&
          !devuelto &&
          !ticketActual.facturado_en &&
          !ticketActual.clienteId &
          !ticketActual.latest_pre_factura?.facturado_en
        " @click="abrirCliente" class="mx-2" prepend-icon="mdi-account-multiple">Clientes</v-btn>
        <v-btn size="small" v-if="
          !ticketActual.esta_cancelado &&
          !devuelto &&
          !ticketActual.facturado_en &&
          !ticketActual.latest_pre_factura?.facturado_en
        " @click="isFacturaInfoOpen = true" class="mx-2" color="primary" variant="elevated"
          prepend-icon="mdi-check">Facturar</v-btn>
        <template v-else-if="!ticketActual.esta_cancelado && ticketActual?.facturado_en">
          <v-menu class="">
            <template v-slot:activator="{ props }">
              <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small">
                Factura
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="onWatchPdf()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-eye"></v-icon>
                </template>
                <v-list-item-title>
                  Ver PDF</v-list-item-title>
              </v-list-item>
              <v-list-item @click="isEmailOpen = true">
                <template v-slot:prepend>
                  <v-icon icon="mdi-email"></v-icon>
                </template>
                <v-list-item-title>
                  Enviar por correo </v-list-item-title>
              </v-list-item>
              <v-list-item @click="descargarPdf()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-file-pdf-box"></v-icon>
                </template>
                <v-list-item-title>
                  Descarga PDF
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="descargarXml()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-xml"></v-icon>
                </template>
                <v-list-item-title>
                  Descarga XML</v-list-item-title>
              </v-list-item>
              <v-list-item @click="regenerarPdf()">
                <template v-slot:prepend>
                  <v-icon icon="mdi-sync"></v-icon>
                </template>
                <v-list-item-title>
                  Regenerar PDF</v-list-item-title>
              </v-list-item>

            </v-list>
          </v-menu>
          <div v-if="!(ticketActual.cfdi_cancellation_status == 'Cancelado')">
            <v-btn @click="isCancelarFacturaOpen = true" size="small" class="ml-2" prepend-icon="mdi-cancel"
              :loading="cargando">
              Cancelar Factura
            </v-btn>
          </div>
          <div v-else-if="ticketActual.cfdi_cancellation_status == 'PENDING'">
            <p class="mx-2 text-warning">
              Cancelación de factura en proceso...
            </p>
          </div>
          <div v-else-if="ticketActual.cfdi_cancellation_status == 'CANCELED'">
            <p class="mx-2 text-success">
              Factura cancelada correctamente.
            </p>
          </div>
          <v-btn @click="verificarEstadoCancelacion" size="small" class="ml-2" prepend-icon="mdi-progress-check"
            :loading="cargando">
            Verificar estado de cancelación
          </v-btn>
          <!-- <v-btn size="small" @click="descargarXml" class="mx-2" prepend-icon="mdi-xml">Descargar Xml</v-btn>
          <v-btn size="small" @click="descargarPdf" class="mx-2" prepend-icon="mdi-file-pdf-box">Descargar Pdf</v-btn> -->
          <p v-if="ticketActual.facturado_en" class="mx-2">
            Facturado en:
            {{ moment(ticketActual.facturado_en).format("DD-MM-YYYY h:mma") }}
          </p>
        </template>
        <template v-if="ticketActual?.latest_pre_factura?.pre_factura_global_id">
          <p class="mx-2">
            Facturado en:
            {{
              moment(ticketActual.latest_pre_factura.facturado_en).format(
                "DD-MM-YYYY h:mma"
              )
            }}
          </p>
          <p class="mx-2">
            Factura global:
            <router-link :to="{
              name: 'FacturasGlobalesShow',
              params: {
                facturaId:
                  ticketActual.latest_pre_factura.pre_factura_global_id,
              },
            }">
              {{ ticketActual.latest_pre_factura.pre_factura_global_id }}
            </router-link>
          </p>
        </template>
        <div class="mx-2">
          <p v-if="ticketActual.cfdi_cancellation_status">Estado CFDI: {{ ticketActual.cfdi_cancellation_status ?? '' }}</p>
          <p>Timbres Disponibles: {{ saldo ?? 0 }}</p>
          <p>Almacén: {{ ticketActual?.almacen?.name }}</p>
          <p>Cliente: {{ ticketActual?.cliente?.name }}</p>
        </div>
        <div>
          <p>Subtotal: ${{ formatNumber(ticketActual.subtotal) }}</p>
          <p>Descuento: ${{ formatNumber(ticketActual.descuento) }}</p>
          <p>Impuesto Retenido: ${{ formatNumber(ticketActual.impuesto_retenido) }}</p>
          <p>Impuesto Trasladado: ${{ formatNumber(ticketActual.impuesto_traslado) }}</p>
          <p>Total: ${{ formatNumber(ticketActual.total) }}</p>
        </div>
        <p class="mx-4 text-error" v-if="ticketActual.total_devuelto > 0">
          Total Devuelto: ${{ formatNumber(ticketActual.total_devuelto) }}
        </p>
        <p class="mx-4">
          Pagado en:
          {{ moment(ticketActual.pagado_en).format("DD-MM-YYYY h:mma") }}
        </p>
        <p v-if="ticketActual.esta_cancelado" class="mx-4 text-error">Cancelada</p>
      </v-row>
    </v-card-text>
  </v-card>
  <!-- Mobile -->
  <v-card class="mb-2" v-if="smAndDown">
    <v-card-title>Venta # {{ ticketActual?.id }}</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12">
          <router-link :to="{ name: 'VentasIndex' }">
            <span class="text-decoration-underline text-caption">
              Regresar al historial de ventas
            </span>
          </router-link>
        </v-col>
        <v-col cols="12">
          <v-spacer></v-spacer>
          <v-btn class="hidden-xs-only" v-if="mdAndDown" variant="outlined" size="small" append-icon="mdi-menu-down"
            @click="drawer = true">
            Detalles
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary
    v-if="mdAndDown">
    <v-card>
      <v-container>
        <v-row dense class="m2-4">
          <v-btn size="small" @click="imprimirVenta" class="my-1" block>Reimprimir</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.esta_cancelado &&
            !devuelto
          " @click="cancelarVenta" class="my-1" block>Cancelar</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.esta_cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &&
            !ticketActual.clienteId &
            !ticketActual.latest_pre_factura?.facturado_en
          " @click="abrirCliente" class="my-1" block>Clientes</v-btn>
          <v-btn size="small" v-if="
            !ticketActual.esta_cancelado &&
            !devuelto &&
            !ticketActual.facturado_en &&
            !ticketActual.latest_pre_factura?.facturado_en
          " @click="isFacturaInfoOpen = true" class="my-1" color="primary" variant="elevated" block>Facturar</v-btn>
          <template v-else-if="!ticketActual.esta_cancelado">
            <v-menu transition="scale-transition" size="small">
              <template v-slot:activator="{ props }">
                <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small" block class="my-1">
                  Factura
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="onWatchPdf(item)">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-eye"></v-icon>
                  </template>
                  <v-list-item-title>
                    Ver PDF</v-list-item-title>
                </v-list-item>
                <v-list-item @click="isEmailOpen = true">
                <template v-slot:prepend>
                  <v-icon icon="mdi-email"></v-icon>
                </template>
                <v-list-item-title>
                  Enviar por correo </v-list-item-title>
              </v-list-item>
                <v-list-item @click="descargarPdf()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-file-pdf-box"></v-icon>
                  </template>
                  <v-list-item-title>
                    Descarga PDF
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="descargarXml()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-xml"></v-icon>
                  </template>
                  <v-list-item-title>
                    Descarga XML</v-list-item-title>
                </v-list-item>
                <v-list-item @click="regenerarPdf()">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-sync"></v-icon>
                  </template>
                  <v-list-item-title>
                    Regenerar PDF</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <p v-if="ticketActual.facturado_en" class="my-1">
              Facturado en:
              {{ moment(ticketActual.facturado_en).format("DD-MM-YYYY h:mma") }}
            </p>
            <p v-else="ticketActual.facturado_en" class="my-1">
              Facturado en:
              {{
                moment(ticketActual.latest_pre_factura.facturado_en).format(
                  "DD-MM-YYYY h:mma"
                )
              }}
            </p>
            <p v-if="ticketActual.latest_pre_factura.facturado_en" class="">
              Factura global:
              <router-link :to="{
                name: 'FacturasGlobalesShow',
                params: {
                  facturaId:
                    ticketActual?.latest_pre_factura?.pre_factura_global_id ?? 1,
                },
              }">
                {{ ticketActual.latest_pre_factura.pre_factura_global_id }}
              </router-link>
            </p>
          </template>
          <div>
            <p>Timbres Disponibles: {{ saldo ?? 0 }}</p>
            <p>Almacén: {{ ticketActual?.almacen?.name }}</p>
            <p>Cliente: {{ ticketActual?.cliente?.name }}</p>
            <p>Subtotal: ${{ formatNumber(ticketActual.subtotal) }}</p>
            <p>Descuento: ${{ formatNumber(ticketActual.descuento) }}</p>
            <p>Impuesto Retenido: ${{ formatNumber(ticketActual.impuesto_retenido) }}</p>
            <p>Impuesto Trasladado: ${{ formatNumber(ticketActual.impuesto_traslado) }}</p>
            <p>Total: ${{ formatNumber(ticketActual.total) }}</p>
            <p class="text-error" v-if="ticketActual.total_devuelto > 0">
              Total Devuelto: ${{ formatNumber(ticketActual.total_devuelto) }}
            </p>
            <p>
              Pagado en:
              {{ moment(ticketActual.pagado_en).format("DD-MM-YYYY h:mma") }}
            </p>
            <p v-if="ticketActual.esta_cancelado" class="text-error">Cancelada</p>
          </div>
        </v-row>
      </v-container>
    </v-card>
  </v-navigation-drawer>
  <v-progress-linear color="primary" indeterminate v-if="cargando" class="mb-4"></v-progress-linear>
  <v-container fluid>
    <template v-if="loadingInitial">
      <v-skeleton-loader type="table" />
    </template>
    <template v-else>
      <v-data-table :headers="tHeaders" :items="articulos" dense>
        <template v-slot:item.product_name="{ item }">
          <router-link :to="{
            name: 'ProductosIndex',
            query: { keyword: item.product_name ?? item.product.name },
          }">
            <span class="text-primary text-decoration-underline cursor-pointer font-weight-medium">{{ item.product_name
              ??
              item.product?.name }}</span>
          </router-link>
        </template>
        <template v-slot:item.codigo="{ item }">
          <span>{{ item.product.codigo }}</span>
        </template>

        <template v-slot:item.precio_usado="{ item }">
          <span>${{ formatNumber(item.precio_usado) }}</span>
        </template>
        <template v-slot:item.precio_final="{ item }">
          <span>${{ formatNumber(item.precio_final) }}</span>
        </template>
        <template v-slot:item.fue_devuelto="{ item }">
          <span>{{ item.fue_devuelto ? "Si" : "No" }}</span>
        </template>
        <template v-slot:item.importe_descuento="{ item }">
          <span>{{ formatNumber(item.importe_descuento) }}</span>
        </template>
        <template v-slot:item.impuesto_traslado="{ item }">
          <span>{{ formatNumber(item.impuesto_traslado) }}</span>
        </template>
        <template v-slot:item.impuesto_retenido="{ item }">
          <span>{{ formatNumber(item.impuesto_retenido) }}</span>
        </template>
      </v-data-table>
    </template>
  </v-container>
  <!-- Modal Clientes -->
  <v-dialog v-model="openCliente" max-width="1200">
    <v-card class="">

      <!-- HEADER -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Seleccionar Cliente</span>

        <!-- Botón para crear cliente -->
        <router-link :to="{
          name: 'Clientes',
        }">
          <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-account-plus">
            Nuevo cliente
          </v-btn>
        </router-link>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">

        <!-- BUSCADOR -->
        <v-text-field id="keycliente" v-model="keycliente" prepend-inner-icon="mdi-magnify" label="Buscar cliente"
          placeholder="Ingresa nombre, teléfono o email" variant="outlined" density="compact" class="mb-4"
          hide-details></v-text-field>

        <!-- LOADING -->
        <v-progress-linear color="primary" indeterminate v-if="cargando" class="mb-4"></v-progress-linear>

        <!-- TABLA -->
        <v-data-table :headers="clienteHeaders" :items="clients" items-per-page="10" hover density="compact">
          <!-- Nombre clickable -->
          <template #item.name="{ item }">
            <v-btn variant="text" color="primary" class="text-capitalize px-0" @click="setCliente(item.id)">
              {{ item.name }}
            </v-btn>
          </template>

          <!-- Formatos -->
          <template #item.saldo_actual="{ item }">
            <span>${{ formatNumber(item.saldo_actual) }}</span>
          </template>

          <template #item.limite_credito="{ item }">
            <span>${{ formatNumber(item.limite_credito) }}</span>
          </template>

          <!-- Estado CFDI -->
          <template #item.es_apto_para_cfdi="{ item }">
            <v-chip v-if="item.es_apto_para_cfdi" color="success" size="small">
              <v-icon start icon="mdi-check-circle"></v-icon>
              Apto
            </v-chip>
            <v-chip v-else color="warning" size="small">
              <v-icon start icon="mdi-alert-circle"></v-icon>
              Incompleto
            </v-chip>
          </template>

          <!-- Acciones -->
          <template #item.actions="{ item }">
            <v-btn color="primary" size="small" prepend-icon="mdi-check" tabindex="-1" @click="setCliente(item.id)">
              Seleccionar
            </v-btn>
          </template>

        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isFacturaInfoOpen" max-width="800">
    <v-card>
      <v-card-title>Información de CFDI</v-card-title>
      <v-card-text>
        <div v-if="erroresRelacionadas + fieldErrorCount > 0" class="text-error mb-2">
          {{ erroresRelacionadas + fieldErrorCount }} error(es) en datos de facturacion
        </div>
        <!-- Navegación de Tabs -->
        <v-tabs v-model="activeTab" grow>
          <v-tab value="basico">Básico</v-tab>
          <v-tab value="avanzado">Opciones Avanzadas</v-tab>
        </v-tabs>

        <!-- Contenido de Tabs -->
        <v-window v-model="activeTab">
          <!-- TAB BÁSICO -->
          <v-window-item value="basico">
            <v-card-text>
              <p class="text-caption mb-2" v-if="ticketActual.forma_de_pago == 'C'">
                Debido a que esta venta a sido marcada como venta a credito, usa la el
                metodo de pago PPD-Pago en parcialidades o diferido y forma de pago:
                99-Por definir, para emitir complementos de pago por cada abono.
              </p>
              <v-checkbox label="Es Público en General" v-model="ticketActual.es_publico_en_general"></v-checkbox>
              <v-text-field label="Nombre del receptor (opcional)" v-model="ticketActual.nombre_receptor"
                v-if="ticketActual.es_publico_en_general"></v-text-field>
              <v-text-field label="Serie (opcional)" v-model="ticketActual.serie"></v-text-field>
              <v-select :items="metodoPagos" label="Método de pago" v-model="ticketActual.metodo_pago"
                :disabled="ticketActual.es_publico_en_general"></v-select>
              <v-select :items="pagoFormas" label="Forma de pago" v-model="ticketActual.forma_pago"></v-select>
              <v-select :items="cdfiUsos" label="Uso de CFDI" v-model="ticketActual.uso_cfdi"
                :disabled="ticketActual.es_publico_en_general"></v-select>
              <v-text-field label="Clave privada local" v-model="ticketActual.clave_privada_local"
                :error-messages="errors.clave_privada_local ? errors.clave_privada_local[0] : null"></v-text-field>
            </v-card-text>
          </v-window-item>

          <!-- TAB AVANZADO -->
          <v-window-item value="avanzado">
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-3">
                <span class="text-subtitle-1 font-weight-medium">Facturas Relacionadas</span>
                <v-btn color="primary" variant="outlined" size="small" prepend-icon="mdi-plus" @click="agregarRelacion">
                  Relación
                </v-btn>
              </div>

              <!-- Lista editable -->
              <v-container fluid>
                <v-row v-for="(relacion, index) in ticketActual.facturasRelacionadas" :key="index"
                  class="align-center mb-2">
                  <v-col cols="5">
                    <v-select :items="tiposRelacion" label="Tipo de Relación"
                      :error-messages="relacion.tipo ? '' : 'Campo requerido'" v-model="relacion.tipo" />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field label="Folio Fiscal" v-model="relacion.folio"
                      v-maska="'********-****-****-****-************'"
                      :error-messages="relacion.folio ? '' : 'Campo requerido'"
                      placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" />
                  </v-col>
                  <v-col cols="1" class="d-flex justify-end">
                    <v-btn icon="mdi-delete" color="error" variant="text" size="small"
                      @click="eliminarRelacion(index)" />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card-text>
      <!-- Acciones -->
      <v-card-actions>
        <v-spacer />
        <v-btn @click="isFacturaInfoOpen = false" variant="text" :loading="cargando">
          Cancelar
        </v-btn>
        <v-btn @click="facturar" color="primary" variant="outlined" :loading="cargando">
          Facturar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isFormasDePagoOpen" max-width="600">
    <v-card>
      <v-card-title>Formas de pago</v-card-title>
      <v-card-text>
        <p>
          Efectivo: ${{ formatNumber(ticketActual.fp_efectivo) }}
          {{ ticketActual.fp_efectivo_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Transferencia: ${{ formatNumber(ticketActual.fp_transferencia) }}
          {{ ticketActual.fp_transferencia_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Tarjeta Débito: ${{ formatNumber(ticketActual.fp_tarjeta_debito) }}
          {{ ticketActual.fp_tarjeta_debito_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Tarjeta Crédito: ${{ formatNumber(ticketActual.fp_tarjeta_credito) }}
          {{ ticketActual.fp_tarjeta_credito_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Cheque: ${{ formatNumber(ticketActual.fp_cheque) }}
          {{ ticketActual.fp_cheque_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Vales de despensa: ${{ formatNumber(ticketActual.fp_vales_de_despensa) }}
          {{ ticketActual.fp_vales_de_despensa_ref }}
        </p>
        <v-divider></v-divider>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isFormasDePagoOpen = false" variant="text" :loading="cargando">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isCancelarFacturaOpen" max-width="600">
    <v-card>
      <v-card-title>Cancelar Factura</v-card-title>
      <v-card-text>
        <v-select :items="motivosCancelacion" label="Motivo cancelacion" v-model="cancelacionData.motivo" />
        <v-text-field label="Folio Fiscal" v-model="cancelacionData.sustitucion" v-if="cancelacionData.motivo == '01'"
          v-maska="'********-****-****-****-************'" placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isCancelarFacturaOpen = false" variant="text" :loading="cargando">Cerrar</v-btn>
        <v-btn @click="cancelarFactura" variant="tonal" :loading="cargando" color="error"
          prepend-icon="mdi-cancel">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isEmailOpen" max-width="600">
    <v-card>
      <v-card-title class="text-h6">
        Enviar factura por correo
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-container fluid class="pa-0">
          <!-- Sender section -->
          <div class="text-subtitle-1 mb-2 font-weight-medium">
            De
          </div>

          <v-row dense>
            <v-col cols="12">
              <v-text-field label="Email del remitente" v-model="emailData.fromEmail" variant="outlined"
                density="comfortable" :error-messages="errors.fromEmail" />
            </v-col>

            <v-col cols="12">
              <v-text-field label="Nombre del remitente" v-model="emailData.fromName" variant="outlined"
                density="comfortable" :error-messages="errors.fromName" />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- Receiver section -->
          <div class="text-subtitle-1 mb-2 font-weight-medium">
            Para
          </div>

          <v-row dense>
            <v-col cols="12">
              <v-text-field label="Email del destinatario" v-model="emailData.toEmail" variant="outlined"
                density="comfortable" :error-messages="errors.toEmail" />
            </v-col>

            <v-col cols="12">
              <v-text-field label="Nombre del destinatario" v-model="emailData.toName" variant="outlined"
                density="comfortable" :error-messages="errors.toName" />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn variant="text" :loading="cargando" @click="isEmailOpen = false">
          Cerrar
        </v-btn>

        <v-btn color="primary" variant="flat" :loading="cargando" prepend-icon="mdi-email" @click="sendEmail">
          Enviar
        </v-btn>
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
  computed,
  nextTick,
} from "vue";

import { useRoute } from "vue-router";
import moment from "moment-timezone";
import Organizacion from "@js/apis/Organizacion";
import PuntoVenta from "../../apis/PuntoVenta";
import { vMaska } from "maska/vue"
import { useCurrency } from '@js/composables/useCurrency';
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";

const { formatNumber } = useCurrency('es-MX', 'MXN');

const s = useUserStore();
const { processRequest } = useProcessRequest();
const { notify } = useNotification();
import Cliente from "../../apis/Cliente";
import { useUserStore } from "../../s";
import { useDisplay } from "vuetify";
const { xs, mdAndUp, mdAndDown, smAndDown } = useDisplay();
const route = useRoute();
const keycliente = ref("");
const clients = ref([]);
const ventaId = ref(null);
const cancelacionData = ref({
  motivo: '01',
  sustitucion: '',
});
const isEmailOpen = ref(false)
const isFacturaInfoOpen = ref(false);
const isFormasDePagoOpen = ref(false);
const isCancelarFacturaOpen = ref(false);
const cargando = ref(false);
const errors = ref([]);
const erroresRelacionadas = ref([]);
const openCliente = ref(false);
const loadingInitial = ref(true);
const drawer = ref(false);
const cdfiUsos = ref([
  { value: "G01", title: "G01-Adquisición de mercancías." },
  { value: "G02", title: "G02-Devoluciones, descuentos o bonificaciones." },
  { value: "G03", title: "G03-Gastos en general." },
  { value: "I01", title: "I01-Construcciones." },
  {
    value: "I02",
    title: "I02-Mobiliario y equipo de oficina por inversiones.",
  },
  { value: "I03", title: "I03-Equipo de transporte." },
  { value: "I04", title: "I04-Equipo de cómputo y accesorios." },
  {
    value: "I05",
    title: "I05-Dados, troqueles, moldes, matrices y herramental.",
  },
  { value: "I06", title: "I06-Comunicaciones telefónicas." },
  { value: "I07", title: "I07-Comunicaciones satelitales." },
  { value: "I08", title: "I08-Otra maquinaria y equipo." },
  {
    value: "D01",
    title: "D01-Honorarios médicos, dentales y gastos hospitalarios.",
  },
  { value: "D02", title: "D02-Gastos médicos por incapacidad o discapacidad." },
  { value: "D03", title: "D03-Gastos funerales." },
  { value: "D04", title: "D04-Donativos." },
  {
    value: "D05",
    title:
      "D05-Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).",
  },
  { value: "D06", title: "D06-Aportaciones voluntarias al SAR." },
  { value: "D07", title: "D07-Primas por seguros de gastos médicos." },
  { value: "D08", title: "D08-Gastos de transportación escolar obligatoria." },
  {
    value: "D09",
    title:
      "D09-Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.",
  },
  { value: "D10", title: "D10-Pagos por servicios educativos (colegiaturas)." },
  { value: "S01", title: "S01-Sin efectos fiscales." },
  { value: "CP01", title: "CP01-Pagos" },
  { value: "CN01", title: "CN01-Nómina" },
]);
const saldo = ref(null);
const pagoFormas = [
  { value: "01", title: "01-Efectivo" },
  { value: "02", title: "02-Cheque nominativo" },
  { value: "03", title: "03-Transferencia electrónica de fondos" },
  { value: "04", title: "04-Tarjeta de crédito" },
  { value: "05", title: "05-Monedero electrónico" },
  { value: "06", title: "06-Dinero electrónico" },
  { value: "08", title: "08-Vales de despensa" },
  { value: "12", title: "12-Dación en pago" },
  { value: "13", title: "13-Pago por subrogación" },
  { value: "14", title: "14-Pago por consignación" },
  { value: "15", title: "15-Condonación" },
  { value: "17", title: "17-Compensación" },
  { value: "23", title: "23-Novación" },
  { value: "24", title: "24-Confusión" },
  { value: "25", title: "25-Remisión de deuda" },
  { value: "26", title: "26-Prescripción o caducidad" },
  { value: "27", title: "27-A satisfacción del acreedor" },
  { value: "28", title: "28-Tarjeta de débito" },
  { value: "29", title: "29-Tarjeta de servicios" },
  { value: "30", title: "30-Aplicación de anticipos" },
  { value: "31", title: "31-Intermediario pagos" },
  { value: "99", title: "99-Por definir" },
];
const metodoPagos = [
  { value: "PUE", title: "PUE-Pago en una sola exhibición" },
  { value: "PPD", title: "PPD-Pago en parcialidades o diferido" },
];
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
    title: "Límite de crédito",
    key: "limite_credito",
    align: "start",
    sortable: false,
  },
  { title: "Email", key: "email", align: "start", sortable: false },
  { title: "Estado CFDI", key: "es_apto_para_cfdi", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
]);
const tHeaders = ref([
  { title: "Código", key: "codigo", align: "start", sortable: false },
  { title: "Nombre", key: "product_name", align: "start", sortable: false },
  { title: "Cantidad", key: "cantidad", align: "start", sortable: false },
  { title: "Precio", key: "precio_usado", align: "start", sortable: false },
  { title: "Importe", key: "precio_final", align: "start", sortable: false },
  {
    title: "Descuento",
    key: "importe_descuento",
    align: "start",
    sortable: false,
  },
  {
    title: "Impuesto T",
    key: "impuesto_traslado",
    align: "start",
    sortable: false,
  },
  {
    title: "Impuesto R",
    key: "impuesto_retenido",
    align: "start",
    sortable: false,
  },
  {
    title: "Existencia",
    key: "cantidad_actual",
    align: "start",
    sortable: false,
  },
  { title: "Cantidad devuelta", key: "cantidad_devuelta", sortable: false },
  { title: "Devolución", key: "fue_devuelto", sortable: false },
]);
const emailData = ref({
  fromEmail: '',
  fromName: '',
  toName: '',
  toEmail: '',
});
const ticketActual = ref({});

const articulos = ref([]);
watch(ventaId, async () => {
  await getSpecificVT(ventaId.value);
  loadingInitial.value = false;
});
watch(isFacturaInfoOpen, () => {
  if (ticketActual.value.forma_de_pago == "C") {
    ticketActual.value.forma_pago = "99";
    ticketActual.value.metodo_pago = "PPD";
    ticketActual.value.uso_cfdi = "G01";
  } else {
    ticketActual.value.forma_pago = "01";
    ticketActual.value.metodo_pago = "PUE";
    ticketActual.value.uso_cfdi = "G01";
  }
});
watch(() => ticketActual.value.es_publico_en_general, (newVal) => {
  if (newVal) {
    ticketActual.value.uso_cfdi = 'S01';
    ticketActual.value.metodo_pago = 'PUE';
    ticketActual.value.nombre_receptor = 'PUBLICO EN GENERAL';
  }
});

const devuelto = computed(() =>
  articulos.value.some((articulo) => articulo.fue_devuelto == 1)
);

function abrirCliente() {
  openCliente.value = true;

  nextTick(() => document.getElementById("keycliente").select());
  getAllClientes();
}
function descargarPdf() {
  processRequest(async () => {
    const response = await PuntoVenta.descargarPdf(ventaId.value);
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "factura";
    link.click();
    URL.revokeObjectURL(link.href);
  }, cargando, {
    onError: (error) => notify.error("Ha ocurrido un error")
  });
}
function descargarXml() {
  processRequest(async () => {
    const response = await PuntoVenta.descargarXml(ventaId.value);
    const blob = new Blob([response.data], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "factura";
    link.click();
    URL.revokeObjectURL(link.href);
  }, cargando, {
    onError: (error) => notify.error("Ha ocurrido un error")
  });
}
function regenerarPdf() {
  processRequest(async () => {
    const response = await PuntoVenta.regenerarPdf(ventaId.value);
    notify.success("PDF regenerado correctamente");
  }, cargando, {
    onError: (error) => notify.error("Ha ocurrido un error")
  });
}
function onWatchPdf() {
  processRequest(async () => {
    const response = await PuntoVenta.descargarPdf(ventaId.value);
    const file = new Blob([response.data], { type: response.headers['content-type'] });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  }, cargando, {
    onError: (error) => notify.error("Ha ocurrido un error")
  });
}
function getAllClientes() {
  processRequest(async () => {
    const response = await Cliente.getAllClientes(keycliente.value);
    clients.value = response.data;
  }, cargando, {
    onError: (error) => notify.error("Ha ocurrido un error")
  });
}
function setCliente(cliente) {
  processRequest(async () => {
    const response = await Cliente.setCliente(cliente, ticketActual.value.id);
    if (response.data?.success && response.data?.retentionRules?.length) {
      if (
        confirm(
          "Se aplicaran las siguientes reglas de retencion: " +
          response.data.retentionRules
        ) == true
      ) {
        acceptRetentionRules();
      } else {
        getSpecificVT(ticketActual.value.id);
      }
    }
    openCliente.value = false;
  }, cargando, {
    onError: (error) => notify.error("Ha ocurrido un error")
  });
}
function acceptRetentionRules() {
  processRequest(async () => {
    const response = await PuntoVenta.acceptRetentionRules(ticketActual.value.id);
    getSpecificVT(ticketActual.value.id);
    openCliente.value = false;
  }, cargando, {
    onError: (error) => {
      console.log(error);
      notify.error("Ha ocurrido un error");
    }
  });
}
function onEscape(e) {
  if (e.key === "F4") {
    //ir a ventas
  }
}
async function cancelarFactura() {
  try {
    cargando.value = true;
    if (cancelacionData.value.motivo != '01') {
      cancelacionData.value.sustitucion = '';
    }
    const { data } = await PuntoVenta.cancelarFactura(ticketActual.value.id, cancelacionData.value)
    if (data.output) {
      alert(data.output)
    }
    console.log(data);
  } catch (error) {
    console.log(error);
  } finally {
    cargando.value = false;
  }
}
async function sendEmail() {
  try {
    cargando.value = true;
    const { data } = await PuntoVenta.sendEmail(ticketActual.value.id, emailData.value)
    isEmailOpen.value = false;

    alert(data.message)

  } catch (error) {
    handleOpException(error);
    errors.value = error.response?.data?.errors || [];
    console.log(error);
  } finally {
    cargando.value = false;
  }
}
async function verificarEstadoCancelacion() {
  try {
    cargando.value = true;
    const { data } = await PuntoVenta.verificarEstadoCancelacion(ticketActual.value.id)
    if (data.output) {
      alert(data.output)
    }
    console.log(data);
  } catch (error) {
    console.log(error);
  } finally {
    cargando.value = false;
  }
}

async function getSpecificVT(ventaticket) {
  try {
    const { data } = await PuntoVenta.getSpecificVT(ventaticket);
    ticketActual.value = data[0];
    articulos.value = data[1];

    emailData.value.fromName = ticketActual.value.organization?.name ?? ticketActual.value.almacen?.name;
    emailData.value.fromEmail = ticketActual.value.organization?.email ?? ticketActual.value.almacen?.email;
    emailData.value.toEmail = ticketActual.value.cliente?.email;
    emailData.value.toName = ticketActual.value.cliente?.name;
    const { data: newData } = await Organizacion.getFoliosSaldo();
    console.log(newData, 'newd');

    saldo.value = newData?.saldo;
  } catch (error) {
    console.log(error);

    handleOpException(error);
    alert("Ha ocurrido un error");
  }
}
function verFormasDePago() {
  isFormasDePagoOpen.value = true;
}
function imprimirVenta() {
  if (window.__TAURI__) {
    const webview = new WebviewWindow("ImprimirVentas", {
      url: `ventatickets/imprimir/${ventaId.id}`,
      title: "Imprimir Venta",
    });
    return;
  }
  window.open(
    `${import.meta.env.VITE_APP_URL}/ventatickets/imprimir/${ventaId.value}`,
    "_blank",
    "noreferrer"
  );
}
function cancelarVenta() {
  if (!confirm('Estas seguro de cancelar esta venta?')) {
    return;
  }
  processRequest(async () => {
    const response = await PuntoVenta.cancelarVenta(ticketActual.value.id);
    getSpecificVT(ticketActual.value.id);
  }, cargando, {
    onError: (error) => notify.error("Ha ocurrido un error")
  });
}
const validarFacturasRelacionadas = () => {
  if (!Array.isArray(ticketActual.value.facturasRelacionadas)) return true;

  let errores = 0;
  ticketActual.value.facturasRelacionadas.forEach(relacion => {
    if (!relacion.tipo || !relacion.folio) {
      errores++;
    }
  });
  erroresRelacionadas.value = errores;
  return errores === 0;
}
const fieldErrorCount = computed(() => {
  return Object.keys(errors.value).length;
})
function facturar() {
  if (!validarFacturasRelacionadas()) {
    activeTab.value = 'avanzado';
    return;
  }
  if (!saldo.value) {
    notify.warning(
      "No tienes suficientes timbres fiscales, contacta con la administración para solicitar timbres fiscales"
    );
    isFacturaInfoOpen.value = false;
    return;
  }
  processRequest(async () => {
    const response = await PuntoVenta.facturar(ticketActual.value.id, {
      forma_pago: ticketActual.value.forma_pago,
      metodo_pago: ticketActual.value.metodo_pago,
      uso_cfdi: ticketActual.value.uso_cfdi,
      serie: ticketActual.value.serie,
      clave_privada_local: ticketActual.value.clave_privada_local,
      publico_en_general: ticketActual.value.es_publico_en_general ?? false,
      nombre_receptor: ticketActual.value.nombre_receptor,
      facturas_relacionadas: ticketActual.value.facturasRelacionadas,
    });
    isFacturaInfoOpen.value = false;
    getSpecificVT(ventaId.value);
  }, cargando, {
    onError: (error) => {
      if (error.response?.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      notify.error("Ha ocurrido un error");
    }
  });
}
onMounted(() => {
  ventaId.value = route.params.ventaId;
  document.addEventListener("keydown", onEscape);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
});

// control del tab activo
const activeTab = ref("basico")

// catálogo de relaciones (SAT)
const tiposRelacion = [
  { title: "01 - Nota de crédito de los documentos relacionados", value: "01" },
  { title: "02 - Nota de débito de los documentos relacionados", value: "02" },
  { title: "03 - Devolución de mercancía sobre facturas o traslados previos", value: "03" },
  { title: "04 - Sustitución de los CFDI previos", value: "04" },
  { title: "05 - Traslados de mercancías facturados previamente", value: "05" },
  { title: "06 - Factura generada por los traslados previos", value: "06" },
  { title: "07 - CFDI por aplicación de anticipo", value: "07" }
]
const motivosCancelacion = [
  { title: "01 - Comprobantes emitidos con errores con relación", value: "01" },
  { title: "02 - Comprobantes emitidos con errores sin relación", value: "02" },
  { title: "03 - No se llevo a cabo la operacion", value: "03" },
  { title: "04 - Operación nominativa relacionada en una factura global", value: "04" },
]


// funciones
function agregarRelacion() {
  if (!Array.isArray(ticketActual.value.facturasRelacionadas)) {
    ticketActual.value.facturasRelacionadas = [{ tipo: null, folio: "" }]
    return;
  }
  ticketActual.value.facturasRelacionadas.push({ tipo: null, folio: "" })
}


function eliminarRelacion(index) {
  console.log(index);

  if (Array.isArray(ticketActual.value.facturasRelacionadas)) {
    ticketActual.value.facturasRelacionadas.splice(index, 1);
  }
}
</script>

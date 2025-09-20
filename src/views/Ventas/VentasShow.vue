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
          !devuelto &&
          !ticketActual.facturado_en &
          !ticketActual.latest_pre_factura?.facturado_en
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
          <v-menu>
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
            </v-list>
          </v-menu>
          <div v-if="!ticketActual.cfdi_cancellation_status">
            <v-btn @click="isCancelarFacturaOpen = true" size="small" class="ml-2" prepend-icon="mdi-cancel"
              :loading="cargando">
              Cancelar Factura
            </v-btn>
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
          <p>Timbres Disponibles: {{ saldo ?? 0 }}</p>
          <p>Almacén: {{ ticketActual?.almacen?.name }}</p>
          <p>Cliente: {{ ticketActual?.cliente?.name }}</p>
        </div>
        <div>
          <p>Subtotal: ${{ ticketActual.subtotal }}</p>
          <p>Descuento: ${{ ticketActual.descuento }}</p>
          <p>Impuesto Retenido: ${{ ticketActual.impuesto_retenido }}</p>
          <p>Impuesto Trasladado: ${{ ticketActual.impuesto_traslado }}</p>
          <p>Total: ${{ ticketActual.total }}</p>
        </div>
        <p class="mx-4 text-error" v-if="ticketActual.total_devuelto > 0">
          Total Devuelto: ${{ ticketActual.total_devuelto }}
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
            !devuelto &&
            !ticketActual.facturado_en &
            !ticketActual.latest_pre_factura?.facturado_en
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
                <v-btn variant="tonal" v-bind="props" append-icon="mdi-menu-down" size="small">
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
                    ticketActual.latest_pre_factura.pre_factura_global_id,
                },
              }">
                {{ ticketActual.latest_pre_factura.pre_factura_global_id }}
              </router-link>
            </p>
          </template>
          <div>
            <p>Timbres Disponibles: {{ saldo ?? 0 }}</p>
            <p>Almacén: {{ ticketActual.miAlmacenName }}</p>
            <p>Cliente: {{ ticketActual.clienteName }}</p>
            <p>Subtotal: ${{ ticketActual.subtotal }}</p>
            <p>Descuento: ${{ ticketActual.descuento }}</p>
            <p>Impuesto Retenido: ${{ ticketActual.impuesto_retenido }}</p>
            <p>Impuesto Trasladado: ${{ ticketActual.impuesto_traslado }}</p>
            <p>Total: ${{ ticketActual.total }}</p>
            <p class="text-error" v-if="ticketActual.total_devuelto > 0">
              Total Devuelto: ${{ ticketActual.total_devuelto }}
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
  <v-container fluid>
    <v-data-table :headers="tHeaders" :items="articulos" dense>
      <template v-slot:item.product_name="{ item }">
        <router-link :to="{
          name: 'ProductosIndex',
          query: { keyword: item.product_name ?? item.product.name },
        }">
          <span class="text-primary text-decoration-underline cursor-pointer font-weight-medium">{{ item.product_name ??
            item.product?.name }}</span>
        </router-link>
      </template>
      <template v-slot:item.precio_usado="{ item }">
        <span>${{ item.precio_usado }}</span>
      </template>
      <template v-slot:item.precio_final="{ item }">
        <span>${{ item.precio_final }}</span>
      </template>
      <template v-slot:item.fue_devuelto="{ item }">
        <span>{{ item.fue_devuelto ? "Si" : "No" }}</span>
      </template>
    </v-data-table>
  </v-container>
  <!-- Clientes -->
  <v-dialog v-model="openCliente" max-width="1200">
    <v-card>
      <v-card-title>Clientes</v-card-title>
      <v-card-text>
        <v-text-field v-model="keycliente" label="Cliente" prepend-inner-icon="mdi-magnify" variant="outlined"
          placeholder="Ingresa nombre del cliente" hide-details single-line id="keycliente"></v-text-field>
      </v-card-text>
      <v-progress-linear color="primary" indeterminate v-if="cargando"></v-progress-linear>
      <v-data-table :headers="clienteHeaders" :items="clients" items-per-page="5">
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
          Efectivo: ${{ ticketActual.fp_efectivo }}
          {{ ticketActual.fp_efectivo_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Transferencia: ${{ ticketActual.fp_transferencia }}
          {{ ticketActual.fp_transferencia_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Tarjeta Débito: ${{ ticketActual.fp_tarjeta_debito }}
          {{ ticketActual.fp_tarjeta_debito_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Tarjeta Crédito: ${{ ticketActual.fp_tarjeta_credito }}
          {{ ticketActual.fp_tarjeta_credito_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Cheque: ${{ ticketActual.fp_cheque }}
          {{ ticketActual.fp_cheque_ref }}
        </p>
        <v-divider></v-divider>
        <p>
          Vales de despensa: ${{ ticketActual.fp_vales_de_despensa }}
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

const s = useUserStore();
const { handleOpException } = s;
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
const isFacturaInfoOpen = ref(false);
const isFormasDePagoOpen = ref(false);
const isCancelarFacturaOpen = ref(false);
const cargando = ref(false);
const errors = ref([]);
const openCliente = ref(false);
const erroresRelacionadas = ref([]);
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
const ticketActual = ref({});

const articulos = ref([]);
watch(ventaId, () => {
  getSpecificVT(ventaId.value);
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
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.descargarPdf(ventaId.value)
    .then((response) => {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "factura";
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function descargarXml() {
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.descargarXml(ventaId.value)
    .then((response) => {
      const blob = new Blob([response.data], { type: "application/xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "factura";
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function onWatchPdf() {
  if (cargando.value) return;
  cargando.value = true;
  PuntoVenta.descargarPdf(ventaId.value)
    .then((response) => {
      const file = new Blob([response.data], { type: response.headers['content-type'] });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
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
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
    });
}
function setCliente(cliente) {
  if (cargando.value) return;
  cargando.value = true;
  Cliente.setCliente(cliente, ticketActual.value.id)
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
        } else {
          getSpecificVT(ticketActual.value.id);

        }
      }
      openCliente.value = false;
    })
    .catch((error) => {
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
  PuntoVenta.acceptRetentionRules(ticketActual.value.id)
    .then((response) => {
      getSpecificVT(ticketActual.value.id);
      openCliente.value = false;
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
async function verificarEstadoCancelacion() {
  try {
    cargando.value = true;
    const { data } = await PuntoVenta.verificarEstadoCancelacion(ticketActual.value.id)
    console.log(data);
    if (data.output) {
      alert(data.output)
    }
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
    const { data: newData } = await Organizacion.getFoliosSaldo();
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
  PuntoVenta.cancelarVenta(ticketActual.value.id)
    .then(() => {
      getSpecificVT(ticketActual.value.id);
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error");
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
    activeTab.value = 'avanzado'; // Optionally switch to the tab with errors
    return;
  }
  if (cargando.value) return;
  cargando.value = true;
  if (!saldo.value) {
    alert(
      "No tienes suficientes timbres fiscales, contacta con la administración para solicitar timbres fiscales"
    );
    isFacturaInfoOpen.value = false;
    cargando.value = false;
    return;
  }
  PuntoVenta.facturar(ticketActual.value.id, {
    forma_pago: ticketActual.value.forma_pago,
    metodo_pago: ticketActual.value.metodo_pago,
    uso_cfdi: ticketActual.value.uso_cfdi,
    serie: ticketActual.value.serie,
    clave_privada_local: ticketActual.value.clave_privada_local,
    publico_en_general: ticketActual.value.es_publico_en_general ?? false,
    nombre_receptor: ticketActual.value.nombre_receptor,
    facturas_relacionadas: ticketActual.value.facturasRelacionadas,
  })
    .then((response) => {
      isFacturaInfoOpen.value = false;
      getSpecificVT(ventaId.value);
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return
      }
      handleOpException(error);
      alert("Ha ocurrido un error");
    })
    .finally(() => {
      cargando.value = false;
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

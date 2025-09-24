<script setup>
import { toRef, toRefs, computed } from 'vue';
import moment from 'moment';
const props = defineProps(['turno_actual']);
defineEmits(['openVMovCaja'])
const { turno_actual } = toRefs(props);
const efectivoCaja = computed(
  () => {
    let eC = +turno_actual.value?.dinero_inicial +
      +turno_actual.value?.ventas_efectivo +
      +turno_actual.value?.acumulado_entradas -
      +turno_actual.value?.devoluciones_ventas_efectivo -
      +turno_actual.value?.acumulado_salidas +
      +turno_actual.value?.abonos_efectivo;
    return eC.toLocaleString()
  }
);
</script>
<template>
  <v-card>
    <v-card-title>Corte #{{ turno_actual?.id }} </v-card-title>
    <v-card-subtitle>
      <v-row dense justify="space-between">
        <p class="font-weight-medium text-caption">
          Inicio: {{ moment(turno_actual?.inicio_en).format('DD/MM/YYYY') }} <br />
          <!-- Fin: {{ turno_actual?.termino_en ? turno_actual?.termino_en: 'Abierto' }} -->
        </p>
      </v-row>
    </v-card-subtitle>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6">
          <v-card color="success">
            <v-card-title>
              Ventas
            </v-card-title>
            <v-card-text class="font-weight-bold">
              <v-row dense justify="space-between" class="mb-2">
                <p class="font-weight-medium text-caption">
                  Contado
                </p>
              </v-row>
              <div class="ml-2 mb-3">
                <v-row dense justify="space-between">
                  <v-col cols="8">
                    <p>Efectivo</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p>
                      ${{ turno_actual?.ventas_efectivo }}
                    </p>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <v-col cols="8">
                    <p>Con tarjeta de crédito</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p>
                      ${{ turno_actual?.ventas_tarjeta_credito }}
                    </p>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <v-col cols="8">
                    <p>Con tarjeta de débito</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p>
                      ${{ turno_actual?.ventas_tarjeta_debito }}
                    </p>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <v-col cols="8">
                    <p>Con vales de despensa</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p>
                      ${{ turno_actual?.ventas_vales_de_despensa }}
                    </p>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <v-col cols="8">
                    <p>Con transferencia</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p>
                      ${{ turno_actual?.ventas_transferencia }}
                    </p>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <v-col cols="8">
                    <p>Con cheque</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p>
                      ${{ turno_actual?.ventas_cheque }}
                    </p>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>

              </div>
              <v-row dense justify="space-between" class="mb-2">
                <p class="font-weight-medium text-caption">
                  Crédito
                </p>
              </v-row>
              <div class="ml-2 mb-3">
                <v-row dense justify="space-between">
                  <v-col cols="8">
                    <p>A crédito</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p>
                      ${{ turno_actual?.ventas_credito }}
                    </p>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>
              </div>
              <v-row dense justify="space-between" class="mb-2">
                <p class="font-weight-medium text-caption">
                  Devoluciones
                </p>
              </v-row>
              <div class="ml-2 mb-3">
                <v-row dense justify="space-between">
                  <v-col cols="8">
                    <p>Contado</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p>
                      - ${{ turno_actual?.devoluciones_ventas_efectivo }}
                    </p>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>
              </div>
              <div class="ml-2 mb-3">
                <v-row dense justify="space-between">
                  <v-col cols="8">
                    <p>Crédito</p>
                  </v-col>
                  <v-col cols="4" class="text-right">
                    <p>
                      - ${{ turno_actual?.devoluciones_ventas_credito }}
                    </p>
                  </v-col>
                  <v-divider></v-divider>
                </v-row>
              </div>
              <v-row dense justify="space-between">
                <p class="font-weight-bold text-h6">Total</p>
                <p class="font-weight-bold text-h6">
                  ${{ turno_actual?.acumulado_ventas }}
                </p>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card color="primary">
            <v-card-title>
              Efectivo en caja
            </v-card-title>
            <v-card-text class="font-weight-bold">
              <v-row dense justify="space-between">
                <v-col cols="8">
                  <p>Ventas efectivo</p>
                </v-col>
                <v-col cols="4" class="text-right">
                  <p>
                    ${{ turno_actual?.ventas_efectivo }}
                  </p>
                </v-col>
                <v-divider></v-divider>
              </v-row>
              <v-row dense justify="space-between">
                <v-col cols="8">
                  <p>Devoluciones Ventas</p>
                </v-col>
                <v-col cols="4" class="text-right">
                  <p>
                    - ${{ turno_actual?.devoluciones_ventas_efectivo }}
                  </p>
                </v-col>
                <v-divider></v-divider>
              </v-row>
              <v-row dense justify="space-between">
                <v-col cols="8">
                  <p class="font-weight-bold ">Abono a créditos</p>
                </v-col>
                <v-col cols="4" class="text-right">
                  <p>
                    ${{ turno_actual?.abonos_efectivo }}
                  </p>
                </v-col>
                <v-divider></v-divider>
              </v-row>
              <v-row dense justify="space-between">
                <v-col cols="8">
                  <p>Devoluciones Crédito</p>
                </v-col>
                <v-col cols="4" class="text-right">
                  <p>
                    - ${{ turno_actual?.devoluciones_ventas_credito }}
                  </p>
                </v-col>
                <v-divider></v-divider>
              </v-row>
              <v-row dense>
                <v-col cols="8">
                  <p>Movimiento de caja entrada</p>
                </v-col>
                <v-col cols="4" class="text-right">
                  <p>
                    ${{ turno_actual?.acumulado_entradas }}
                  </p>
                </v-col>
                <v-divider></v-divider>
              </v-row>
              <v-row dense justify="space-between" hover>
                <v-col cols="8">
                  <p>Movimiento de caja salida</p>
                </v-col>
                <v-col cols="4" class="text-right">
                  <p>
                    - ${{ turno_actual?.acumulado_salidas }}
                  </p>
                </v-col>
                <v-divider></v-divider>
              </v-row>
              <v-row dense justify="space-between">
                <p class="font-weight-bold text-h6">Total</p>
                <p class="font-weight-bold text-h6">
                  ${{ efectivoCaja }}
                </p>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-card color="secondary" @click="$emit('openVMovCaja')">
            <v-card-title>
              Entradas de caja
              <v-icon size="x-small" right>
                mdi-eye
              </v-icon>
            </v-card-title>
            <v-card-text>
              <v-row dense justify="space-between">
                <p>Ingresos Efectivo </p>
                <p>
                  ${{ turno_actual?.acumulado_entradas }}
                </p>
                <v-divider></v-divider>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card color="warning" @click="$emit('openVMovCaja')">
            <v-card-title>
              Salidas de caja
              <v-icon size="x-small" right>
                mdi-eye
              </v-icon>
            </v-card-title>
            <v-card-text>
              <v-row dense justify="space-between">
                <p>Salidas de Efectivo
                </p>
                <p>
                  ${{ turno_actual?.acumulado_salidas }}
                </p>
                <v-divider></v-divider>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card color="grey">
            <v-card-title>
              Compras de mercancia
            </v-card-title>
            <v-card-text>
              <v-row dense justify="space-between">
                <p>Compras Mercancia</p>
                <p>
                  ${{ turno_actual?.compras }}
                </p>
                <v-divider></v-divider>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card color="grey darken-4">
            <v-card-title>
              Ganancias
            </v-card-title>
            <v-card-text>
              <v-row dense justify="space-between">
                <p>Total</p>
                <p>
                  ${{ turno_actual?.acumulado_ganancias }}
                </p>
                <v-divider></v-divider>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
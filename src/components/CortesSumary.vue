<script setup>
import { toRef, toRefs, computed } from 'vue';
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
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6">
          <v-col cols="12">
            <v-card color="primary_d500" @click="$emit('openVMovCaja')">
              <v-card-title>
                Entradas de efectivo
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
          <v-col cols="12">
            <v-card color="warning" @click="$emit('openVMovCaja')">
              <v-card-title>
                Salidas de efectivo
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
          <v-col cols="12">
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
          <v-col cols="12">
            <v-card color="grey">
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
        </v-col>
        <v-col cols="12" sm="6">
          <v-col cols="12">
            <v-card color="success">
              <v-card-title>
                Ventas
              </v-card-title>
              <v-card-text class="font-weight-bold">
                <v-row dense justify="space-between">
                  <p>Efectivo</p>
                  <p>
                    ${{ turno_actual?.ventas_efectivo }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p>A crédito</p>
                  <p>
                    ${{ turno_actual?.ventas_credito }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p>Con tarjeta de crédito</p>
                  <p>
                    ${{ turno_actual?.ventas_tarjeta_credito }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p>Con tarjeta de débito</p>
                  <p>
                    ${{ turno_actual?.ventas_tarjeta_debito }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p>Con vales de despensa</p>
                  <p>
                    ${{ turno_actual?.ventas_vales_de_despensa }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p>Con transferencia</p>
                  <p>
                    ${{ turno_actual?.ventas_transferencia }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p>Con cheque</p>
                  <p>
                    ${{ turno_actual?.ventas_cheque }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p class="font-weight-bold text-h6">Total</p>
                  <p class="font-weight-bold text-h6">
                    ${{ turno_actual?.acumulado_ventas }}
                  </p>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card color="primary">
              <v-card-title>
                Efectivo al cierre en caja
              </v-card-title>
              <v-card-text class="font-weight-bold">
                <v-row dense justify="space-between">
                  <p>Ventas efectivo</p>
                  <p>
                    ${{ turno_actual?.ventas_efectivo }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p>Movimiento de caja entrada</p>
                  <p>
                    ${{ turno_actual?.acumulado_entradas }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between" hover>
                  <p>Movimiento de caja salida</p>
                  <p>
                    - ${{ turno_actual?.acumulado_salidas }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p class="font-weight-bold ">Abono Efectivo</p>
                  <p>
                    ${{ turno_actual?.abonos_efectivo }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p>Devoluciones Ventas</p>
                  <p>
                    - ${{ turno_actual?.devoluciones_ventas_efectivo }}
                  </p>
                  <v-divider></v-divider>
                </v-row>
                <v-row dense justify="space-between">
                  <p>Devoluciones Crédito</p>
                  <p>
                    - ${{ turno_actual?.devoluciones_ventas_credito }}
                  </p>
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
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
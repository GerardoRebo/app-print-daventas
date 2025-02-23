<template>
    <tr>
        <ta-body-vue>
            <p class="text-indigo-600 hover:text-indigo-900">
                {{ miImpuesto.descripcion }}
            </p>
        </ta-body-vue>
        <ta-body-vue>
            <p >
                {{ miImpuesto.tipo }}
            </p>
        </ta-body-vue>
        <ta-body-vue>
            <p class="">
                %{{ miImpuesto.tasa_cuota }}
            </p>
        </ta-body-vue>

        <ta-body-vue>
            <input type="checkbox" v-model="venta">
        </ta-body-vue>
        <ta-body-vue>
            <input type="checkbox" v-model="compra">
        </ta-body-vue>
        <ta-body-vue>

            <div class="flex flex-wrap sm:space-x-4">
                <simple-button-vue @click="quitarImpuesto(miImpuesto.id)">
                    <span v-if="!cargando">Eliminar</span>
                    <span v-else>Cargndo...</span>
                </simple-button-vue>
            </div>
        </ta-body-vue>
    </tr>
</template>
<script setup>
import TaBodyVue from "../util/TaBodyVue.vue";
import SimpleButtonVue from "../util/SimpleButtonVue.vue";
import { ref, watch } from "vue";
import Impuesto from "../../apis/Impuesto";
const cargando = ref(false);
const props = defineProps(['miImpuesto'])
const venta = ref(false);
const compra = ref(false);
venta.value = !!props.miImpuesto.pivot.venta;
compra.value = !!props.miImpuesto.pivot.compra;
watch(venta, (newVal) => {
    updateTypeOfTax('venta', newVal)
})
watch(compra, (newVal) => {
    updateTypeOfTax('compra', newVal)
})
const updateTypeOfTax = (type, value) => {
    if (cargando.value) return;
    cargando.value = true
    Impuesto.updateTypeOfTax(props.miImpuesto.pivot.id, { type, value }).then((response) => {

    }).catch((error) => {
        handleOpException(error);
        alert("Ha ocurrido un error")
    }).finally(() => {
        cargando.value = false
    });

}


</script>
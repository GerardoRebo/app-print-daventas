<template>
<drop-down-c>
    <!-- Button content -->
    <template v-slot:button>
      <button-content buttonTitle="Más"></button-content>
    </template>

    <!-- Opened dropdown content -->
    <template v-slot:content>
      <drop-down-content v-for="(link, index) in links" :key="index" :linkTitle="link[0]" :namedRoute="{ name: link[1] }"></drop-down-content>
    </template>
  </drop-down-c>
</template>

<script setup>
import DropDownC from "../DropDown/DropDownC.vue";
import ButtonContent from "../DropDown/ButtonContent.vue";
import DropDownContent from "../DropDown/DropDownContent.vue";
import { ref } from "vue";
const links = ref([
    ['Proveedores', 'Proveedores'],
    ['Clientes', 'Clientes'],
    ['Conceptos', 'Conceptos'],
    ['Almacenes', 'Almacens'],
    ['Departamentos', 'Departamentos'],
])
</script>
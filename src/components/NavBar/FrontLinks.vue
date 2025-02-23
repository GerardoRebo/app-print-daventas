<template>
  <!-- Nav Links -->
    <!-- Mobile -->
  <div class="w-full flex items-center">
    <p class="flex-1 text-3xl font-bold font-heading mr-4 cursor-pointer" @click="goToPuntoVenta">
      DaVentas.
    </p>
    <div class="flex flex-1 justify-end">
      <drop-down-c class="md:hidden my-2">
        <!-- Button content -->
        <template v-slot:button>
          <button-hamburger buttonTitle="Nav"></button-hamburger>
        </template>
        <!-- Opened dropdown content -->
        <template v-slot:content>
          <nav-link v-for="(link, index) in links" :key="index" :linkTitle="link[0]"
            :namedRoute="{ name: link[1] }"></nav-link>
        </template>
      </drop-down-c>
    </div>
  </div>
<!-- Desktop -->
  <ul class="
                                                    hidden
                                                    md:flex
                                                    px-4
                                                    mx-auto
                                                    font-semibold font-heading
                                                    space-x-12
                                                  ">
    <nav-link v-for="(link, index) in links" :key="index" :linkTitle="link[0]" :namedRoute="{ name: link[1] }"></nav-link>
  </ul>
</template>
<script setup>
import NavLink from "./NavLink.vue";
import DropDownC from "../DropDown/DropDownC.vue";
import ButtonHamburger from "../DropDown/ButtonHamburger.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const links = ref([
  ['PuntoVenta', 'PuntoVenta'],
  ['Cotizaciones', 'Cotizaciones'],
  ['Productos', 'Productos'],
  ['Movimientos', 'Movimientos'],
  ['Créditos', 'Creditos'],
  ['Cortes', 'Cortes'],
])
function goToPuntoVenta() {
  router.push({ name: "PuntoVenta" });
}
</script>
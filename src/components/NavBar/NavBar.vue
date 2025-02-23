<template>
  <div class=" flex flex-wrap w-full bg-gray-900">
    <section class="w-full">
      <!-- navbar -->
      <nav class="flex text-white w-full">

        <div class="px-5 py-6 w-full flex-wrap md:flex  flex-1 xl:px-12  items-center">

          <div class="flex" v-if="isLoggedIn">
            <slot></slot>
          </div>
          <div v-else>
            <p class="flex-1 text-3xl font-bold font-heading mr-4 cursor-pointer">
              DaVentas.
            </p>

          </div>

          <!-- Header Icons -->
          <div class="flex flex-1 items-center space-x-5 justify-around md:justify-end w-full">
            <!--Nofifications  -->

            <div v-if="isLoggedIn" class="flex justify-around space-x-4 items-center">
              <p class="cursor-pointer" @click="getCountNotf">&#8634;</p>
              <drop-down-c @click="getNotifications">
                <!-- Button content -->
                <template v-slot:button>
                  <button-content :buttonTitle="countNotfComputed">
                    <Bell class="mr-1"></Bell>
                  </button-content>
                </template>

                <!-- Opened dropdown content -->
                <template v-slot:content>
                  <div v-for="(notification, index) in notifications" :key="index">
                    <drop-down-content :linkTitle="notification.data.data" :namedRoute="{}"></drop-down-content>
                  </div>
                </template>
              </drop-down-c>
            </div>

            <!-- Mas      -->
            <mas v-if="isLoggedIn && s.isAdmin"></mas>

            <!-- Sesion -->
            <session  @logout="logout" :isLoggedIn="isLoggedIn" :nombre="nombre" :isAdmin="isAdmin"></session>

          </div>

        </div>

      </nav>

    </section>
  </div>
</template>

<script setup>
import User from "../../apis/User";
import { useRouter } from "vue-router";
import { useUserStore } from "../../s";
import { computed, onMounted, onUnmounted, ref } from "vue";
import DropDownC from "../DropDown/DropDownC.vue";
import ButtonContent from "../DropDown/ButtonContent.vue";
import DropDownContent from "../DropDown/DropDownContent.vue";
import Bell from "../util/Bell.vue";
import Mas from "./Mas.vue";
import Session from "./Session.vue";

const s = useUserStore();
const router = useRouter();
const countNotf = ref(0);
const notifications = ref([]);
const intervalId = ref(null);

const countNotfComputed = computed(() => {
  if (countNotf.value > 9) {
    return "+9";
  }
  return countNotf.value;
});

const isLoggedIn = computed(() => s.isLoggedIn);

const isAdmin = computed(() => {
  return (
    s.roles.includes("Admin") ||
    s.roles.includes("Owner")
  );
});
const nombre = computed(() =>
  s.authuser?.name ? s.authuser.name : "Inicio"
);
function getCountNotf() {
  if (s.isLoggedIn) {
    User.getCountNotf().then((response) => {
      countNotf.value = response.data;
    });
  }
}
function getNotifications() {
  User.getNotifications().then((response) => {
    notifications.value = response.data;
    countNotf.value = 0;
  });
}
function onEscape(e) {
  if (e.key === "F1") {
    e.preventDefault();
    e.stopPropagation();
    router.push({ name: "PuntoVenta" });
  }
  if (e.key === "F4") {
    router.push({ name: "Productos" });
  }
  if (e.key === "F8") {
    router.push({ name: "Movimientos" });
  }
}
function logout() {
  if (window.__TAURI__) {
    localStorage.removeItem("token");
    localStorage.setItem("isLoggedIn", JSON.stringify(false));
    localStorage.removeItem("authuser");
    localStorage.removeItem("myAlmacens");
    localStorage.removeItem("roles");
    localStorage.removeItem("isLoggedIn");
    s.isLoggedIn = false
    s.authuser= {};
    s.myAlmacens= [];
    s.proveedors =[];
    s.roles =[];
    s.departamentos =[];

    router.push({ name: "Login" });
    return ;
  }
  User.logout().then(() => {
    localStorage.removeItem("token");
    s.isLoggedIn = false
    s.authuser= {};
    s.myAlmacens= [];
    s.proveedors =[];
    s.roles =[];
    s.departamentos =[];
    router.push({ name: "Login" });
  });
}
onMounted(() => {
  intervalId.value = setInterval(getCountNotf, 720000);
  document.addEventListener("keydown", onEscape);
});
onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
  clearInterval(intervalId.value)

});
</script>
<style scoped></style>


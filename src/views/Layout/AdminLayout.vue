<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useUserStore } from '@js/s';
import { useRouter } from 'vue-router';
import User from '@js/apis/User';

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
const initials = computed(() =>
  s.authuser?.name ? s.authuser.name.charAt(0) : "Inicio"
);
const nombre = computed(() =>
  s.authuser?.name ? s.authuser.name : "Inicio"
);
const email = computed(() =>
  s.authuser?.email
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
    s.authuser = {};
    s.myAlmacens = [];
    s.proveedors = [];
    s.roles = [];
    s.departamentos = [];

    router.push({ name: "Login" });
    return;
  }
  User.logout().then(() => {
    localStorage.removeItem("token");
    s.isLoggedIn = false
    s.authuser = {};
    s.myAlmacens = [];
    s.proveedors = [];
    s.roles = [];
    s.departamentos = [];
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

const drawer = ref(false);

const links = computed(() => {
  if (isAdmin.value) {
    return [
      { icon: 'mdi-network-pos', title: 'Punto de Venta', href: "PuntoVenta" },
      { icon: 'mdi-domain', title: 'Mi Organización', href: "MiOrganizacion" },
      { icon: 'mdi-cash-check', title: 'Cortes', href: "AdminCortesIndex" },
      { icon: 'mdi-chart-bar', title: 'Reportes', href: "Reportes" },
      { icon: 'mdi-account-group', title: 'Usuarios', href: "UsuariosIndex" },
      { icon: 'mdi-file-presentation-box', title: 'Tabulares', href: "MiTabular" },
      { icon: 'mdi-file-excel', title: 'Datos', href: "MisDatos" },
      { icon: 'mdi-list-box', title: 'Impuestos', href: "Impuestos" },
      { icon: 'mdi-invoice-list', title: 'Facturas', href: "FacturasIndex" },
      { icon: 'mdi-view-list', title: 'FacturasGlobales', href: "FacturasGlobalesIndex" },
      { icon: 'mdi-file-document-outline', title: 'Reglas de Retención', href: "ReglasRetencionIndex" },
      // {
      //   icon: 'mdi-format-list-bulleted-type', title: 'Facturas', href: "#", children: [
      //     { icon: '', title: 'Facturas', href: "ProductosIndex" },
      //   ]
      // },
    ]
  } else {
    return [];
  }

})

</script>
<template>
  <v-app>
    <v-app-bar color="primary_d800">
      <template v-slot:prepend>
        <v-container>
          <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" color="white"
            v-if="isLoggedIn"></v-app-bar-nav-icon>

        </v-container>
      </template>
      <!-- <v-img src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" height="128px" class="mr-3" max-width="50"
          contain></v-img> -->
      <v-app-bar-title v-if="isLoggedIn">
        <router-link :to="{ name: 'Home' }" class="text-decoration-none text-white">
          Daventas
        </router-link>
      </v-app-bar-title>
      <v-app-bar-title v-else>
        <router-link :to="{ name: 'Login' }" class="text-decoration-none text-white">
          Daventas
        </router-link>
      </v-app-bar-title>
      <!-- <v-avatar>
        <v-img src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" height="128px" contain></v-img>
      </v-avatar> -->
      <!-- Avatar with Dropdown Menu -->
      <template v-slot:append>
        <v-container>
          <v-menu min-width="200px" rounded v-if="isLoggedIn">
            <template v-slot:activator="{ props }">
              <v-btn icon color="primary_l800" @click="getNotifications" v-bind="props">
                <v-badge color="primary_l100" :content="countNotf">
                  <v-icon> mdi-bell</v-icon>
                </v-badge>
              </v-btn>
            </template>
            <v-card>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="(notification, index) in notifications">{{ notification.data.data }}</v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-container>
        <v-container>
          <v-menu min-width="200px" rounded v-if="isLoggedIn">
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props">
                <v-avatar color="accent" size="small">
                  <span class="text-h5">{{ initials }}</span>
                </v-avatar>
              </v-btn>
            </template>
            <v-card>
              <v-card-text>
                <div class="mx-auto text-center">
                  <v-avatar color="accent">
                    <span class="text-h5">{{ initials }}</span>
                  </v-avatar>
                  <h3>{{ nombre }}</h3>
                  <p class="text-caption mt-1">
                    {{ email }}
                  </p>
                  <v-divider class="my-3"></v-divider>
                  <v-btn variant="text" rounded prepend-icon="mdi-account-edit" :to="{ name: 'UserSettings' }">
                    Editar Cuenta
                  </v-btn>
                  <v-btn variant="text" rounded prepend-icon="mdi-bell">
                    Notificaciones
                  </v-btn>
                  <v-btn variant="text" rounded prepend-icon="mdi-account-tie" :to="{ name: 'MiOrganizacion' }">
                    Administración
                  </v-btn>
                  <v-divider class="my-3"></v-divider>
                  <v-btn variant="text" rounded prepend-icon="mdi-logout" @click="logout">
                    Cerrar session
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-container>
      </template>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
      <v-list nav color="primary">
        <v-list-subheader>Área de Administración</v-list-subheader>
        <v-divider></v-divider>
        <!-- Loop through the main links array -->
        <div v-for="(link, index) in links" :key="index" :prepend-icon="link.icon" :value="link.title">
          <!-- Handle nested children with v-list-group -->

          <v-list-group v-if="link.children">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" :title="link.title" :prepend-icon="link.icon"></v-list-item>
            </template>

            <!-- Loop through the children of the current link -->
            <v-list-item v-for="(child, childIndex) in link.children" v-if="link.children" :key="childIndex"
              :prepend-icon="child.icon" :title="child.title" :to="{ name: child.href }"></v-list-item>
          </v-list-group>
          <v-list-item :prepend-icon="link.icon" :title="link.title" :to="{ name: link.href }" v-else></v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-progress-linear color="grey" model-value="100"></v-progress-linear>
      <slot></slot>
    </v-main>
  </v-app>
</template>
<style></style>
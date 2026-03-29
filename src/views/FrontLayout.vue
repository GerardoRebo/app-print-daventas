<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useUserStore } from "../s";
import { useRoute, useRouter } from "vue-router";
import User from "../apis/User";
import { useDisplay } from "vuetify";
import { useProcessRequest } from "@js/composables/useProcessRequest";

const { mobile } = useDisplay();
const s = useUserStore();
const router = useRouter();
const route = useRoute();
const countNotf = ref(0);
const notifications = ref([]);
const intervalId = ref(null);
const { processRequest } = useProcessRequest();

const drawer = ref(true);
const rail = ref(true);

const permanentDrawer = computed(() => {
  if (mobile.value) return false;
  return route.name === 'PuntoVenta' || route.name === 'MovimientosCreate'

})
const progressColor = computed(() => {
  if (route.name == "MovimientosCreate") {
    return "gray";
  }
  return "primary";
});


const links = computed(() => {
  if (isAdmin.value) {
    return [
      { icon: "mdi-network-pos", title: "Punto de Venta", href: "PuntoVenta" },
      { icon: "mdi-factory", title: "Producción", href: "Produccion" },
      {
        icon: "mdi-file-presentation-box",
        title: "Cotizaciones",
        href: "Cotizaciones",
      },
      { icon: "mdi-truck", title: "Movimientos", href: "MovimientosCreate" },
      {
        icon: "mdi-format-list-bulleted-type",
        title: "Catalogos",
        href: "#",
        children: [
          { icon: "", title: "Productos", href: "ProductosIndex" },
          { icon: "", title: "Proveedores", href: "Proveedores" },
          { icon: "", title: "Clientes", href: "Clientes" },
          { icon: "", title: "Conceptos", href: "Conceptos" },
          { icon: "", title: "Almacenes", href: "Almacens" },
          { icon: "", title: "Departamentos", href: "Departamentos" },
        ],
      },
      {
        icon: "mdi-view-list",
        title: "Historial",
        href: "#",
        children: [
          { icon: "", title: "Ventas", href: "VentasIndex" },
          { icon: "", title: "Devoluciones", href: "DevolucionesIndex" },
          { icon: "", title: "Movimientos", href: "MovimientosIndex" },
          { icon: "", title: "Cotizaciones", href: "CotizacionesIndex" },
        ],
      },
      {
        icon: "mdi-account-credit-card",
        title: "Créditos",
        href: "CreditosIndex",
      },
      { icon: "mdi-cash-check", title: "Cortes", href: "Cortes" },
    ];
  } else if (isLoggedIn.value) {
    return [
      { icon: "mdi-network-pos", title: "Punto de Venta", href: "PuntoVenta" },
      {
        icon: "mdi-file-presentation-box",
        title: "Cotizaciones",
        href: "Cotizaciones",
      },
      { icon: "mdi-truck", title: "Movimientos", href: "MovimientosCreate" },
      {
        icon: "mdi-format-list-bulleted-type",
        title: "Catalogos",
        href: "#",
        children: [{ icon: "", title: "Productos", href: "ProductosIndex" }],
      },
      {
        icon: "mdi-view-list",
        title: "Historial",
        href: "#",
        children: [
          { icon: "", title: "Ventas", href: "VentasIndex" },
          { icon: "", title: "Movimientos", href: "MovimientosIndex" },
          { icon: "", title: "Cotizaciones", href: "CotizacionesIndex" },
        ],
      },
      {
        icon: "mdi-account-credit-card",
        title: "Créditos",
        href: "CreditosIndex",
      },
      { icon: "mdi-cash-check", title: "Cortes", href: "Cortes" },
      // { icon: "mdi-account-cash", title: "Refiere y Gana", href: "distribuidores" },
    ];
  } else {
    return [];
  }
});
const isLoggedIn = computed(() => s.isLoggedIn);
const isAdmin = computed(() => {
  return s.roles.includes("Admin") || s.roles.includes("Owner") || s.roles.includes("Contador");
});
const initials = computed(() =>
  s.authuser?.name ? s.authuser.name.charAt(0) : "Inicio"
);
const nombre = computed(() => (s.authuser?.name ? s.authuser.name : "Inicio"));
const email = computed(() => s.authuser?.email);
const displayCountNotf = computed(() => {
  return countNotf.value > 9 ? "+9" : countNotf.value;
});
const activeOrganizationName = computed(() => {
  const orgId = s.authuser?.active_organization_id;
  const orgs = s.organizations;
  return orgs?.find((org) => org.id === orgId)?.name || "";
});
function getCountNotf() {
  if (s.isLoggedIn) {
    processRequest(async () => {
      const response = await User.getCountNotf();
      countNotf.value = response.data;
    }, ref(false), {
      onError: () => {},
    });
  }
}
function getNotifications() {
  if (!s.isLoggedIn) return;
  processRequest(async () => {
    const response = await User.getNotifications();
    notifications.value = response.data;
    countNotf.value = 0;
  }, ref(false), {
    onError: () => {},
  });
}
function onEscape(e) {
  if (e.key === "F1") {
    e.preventDefault();
    e.stopPropagation();
    router.push({ name: "PuntoVenta" });
  }
  if (e.key === "F4") {
    router.push({ name: "ProductosIndex" });
  }
  if (e.key === "F8") {
    router.push({ name: "MovimientosIndex" });
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
    s.isLoggedIn = false;
    s.authuser = {};
    s.myAlmacens = [];
    s.proveedors = [];
    s.roles = [];
    s.departamentos = [];
    s.productsData = ref({});

    router.push({ name: "Login" });
    return;
  }
  processRequest(async () => {
    await User.logout();
    localStorage.removeItem("token");
    s.isLoggedIn = false;
    s.authuser = {};
    s.myAlmacens = [];
    s.proveedors = [];
    s.roles = [];
    s.departamentos = [];
    s.productsData = ref({});
    router.push({ name: "Login" });
  }, ref(false), {
    onError: () => {},
  });
}
const isChildRouteActive = computed(() => {
  return links.value.some(link =>
    link.children?.some(child => route.name === child.href || route.path.includes(child.href))
  )
})
const isLinkActive = (link) => {
  if (link.children) {
    return link.children.some((child) => route.name === child.href);
  }
  return route.name === link.href;
};

const syncNavigationState = () => {
  if (permanentDrawer.value) {
    drawer.value = true;
  }

  if (mobile.value) {
    rail.value = false;
    return;
  }

  if (isChildRouteActive.value) {
    rail.value = false;
  } else {
    rail.value = true;
  }
};

watch(
  [() => route.name, mobile],
  () => {
    syncNavigationState();
  },
  { immediate: true }
);

onMounted(() => {
  s.initializeFromStorage();
  getCountNotf();
  intervalId.value = setInterval(getCountNotf, 600000);
  document.addEventListener("keydown", onEscape);
  syncNavigationState();
});

onUnmounted(() => {
  document.removeEventListener("keydown", onEscape);
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

</script>
<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined"
      @click="rail = false" :permanent="permanentDrawer" :rail="rail" v-if="isLoggedIn">
      <v-list>
        <v-list-item prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg" :title="nombre">
          <template v-slot:append>
            <v-btn icon="mdi-chevron-left" variant="text" @click.stop="rail = !rail"
              v-if="!$vuetify.display.mobile"></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>
      <v-list nav color="primary">
        <template v-for="(link, index) in links" :key="index">
          <v-tooltip v-if="rail && link.children" location="right">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="link.icon"
                :title="link.title"
                :active="isLinkActive(link)"
                @click.stop.prevent="rail = false"
              ></v-list-item>
            </template>
            <span>{{ link.title }}</span>
          </v-tooltip>

          <v-list-group v-else-if="!rail && link.children" :value="link.title">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="link.icon"
                :title="link.title"
                :active="isLinkActive(link)"
              ></v-list-item>
            </template>
            <v-list-item
              v-for="(child, childIndex) in link.children"
              :key="childIndex"
              :prepend-icon="child.icon"
              :title="child.title"
              :to="{ name: child.href }"
              :active="route.name === child.href"
              @click="rail = false"
            ></v-list-item>
          </v-list-group>

          <v-tooltip v-else-if="rail && !link.children" location="right">
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="link.icon"
                :title="link.title"
                :to="{ name: link.href }"
                :active="isLinkActive(link)"
                @click="rail = false"
              ></v-list-item>
            </template>
            <span>{{ link.title }}</span>
          </v-tooltip>

          <v-list-item
            v-else
            :prepend-icon="link.icon"
            :title="link.title"
            :to="{ name: link.href }"
            :active="isLinkActive(link)"
            @click="rail = false"
          ></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar color="secondary">
      <template v-slot:prepend>
        <v-container v-if="$vuetify.display.mobile">
          <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" color="white"
            v-if="isLoggedIn"></v-app-bar-nav-icon>
        </v-container>
      </template>
      <!-- <v-img src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" height="128px" class="mr-3" max-width="50"
          contain></v-img> -->
      <v-app-bar-title v-if="isLoggedIn">
        <router-link :to="{ name: 'Home' }" class="text-decoration-none text-white d-flex align-center">
          <span>Daventas</span>
          <span v-if="activeOrganizationName" class="text-caption ml-2 text-grey-lighten-1">
            / {{ activeOrganizationName }}
          </span>
          <span v-else-if="s.organizations && s.organizations.length > 0" class="text-caption ml-2 text-error">
            [orgs: {{ s.organizations.length }}]
          </span>
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
              <v-btn icon color="white" @click="getNotifications" v-bind="props">
                <v-badge color="accent" :content="displayCountNotf">
                  <v-icon> mdi-bell</v-icon>
                </v-badge>
              </v-btn>
            </template>
            <v-card min-width="400px" max-height="500px" class="overflow-y-auto">
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Notificaciones</span>
                <v-btn size="small" variant="text" icon="mdi-close" @click="notifications = []"
                  v-if="notifications.length > 0"></v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text v-if="notifications.length === 0" class="text-center py-6">
                <v-icon class="d-block mb-2" size="32" color="grey-lighten-1">mdi-bell-outline</v-icon>
                <p class="text-grey">No hay notificaciones</p>
              </v-card-text>
              <v-list v-else density="compact" class="py-0">
                <template v-for="(notification, index) in notifications" :key="notification.id || index">
                  <v-list-item class="my-1 rounded">
                    <template v-slot:prepend>
                      <v-icon color="primary" class="mr-3">mdi-information-outline</v-icon>
                    </template>
                    <v-list-item-title class="font-weight-medium text-sm">
                      {{ notification.data.data || "Notificación" }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-xs mt-1">
                      {{ notification.created_at ? new Date(notification.created_at).toLocaleString("es-MX") : "Hace poco" }}
                    </v-list-item-subtitle>
                    <template v-slot:append>
                      <v-btn size="x-small" variant="text" icon="mdi-close" density="compact"></v-btn>
                    </template>
                  </v-list-item>
                  <v-divider v-if="index < notifications.length - 1" class="my-0"></v-divider>
                </template>
              </v-list>
            </v-card>
          </v-menu>
        </v-container>
        <v-container>
          <v-menu min-width="200px" rounded v-if="isLoggedIn">
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props">
                <v-avatar color="primary" size="small">
                  <span class="text-h5">{{ initials }}</span>
                </v-avatar>
              </v-btn>
            </template>
            <v-card>
              <v-card-text>
                <div class="mx-auto text-center">
                  <v-avatar color="primary">
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
                  <v-btn variant="text" rounded prepend-icon="mdi-logout" @click="logout" color="error">
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
    <v-main>
      <v-progress-linear :color="progressColor" model-value="100"></v-progress-linear>
      <slot></slot>
    </v-main>
  </v-app>
</template>
<style></style>

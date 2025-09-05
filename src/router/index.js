import { createRouter, createWebHistory } from "vue-router";
const Home = () => import("../views/Home.vue");
const Login = () => import("../views/Login.vue");
const ForgotPassword = () => import("../views/ForgotPassword.vue");
const ResetPassword = () => import("../views/ResetPassword.vue");
const Register = () => import("../views/Register.vue");
const VerifyEmail = () => import("../views/VerifyEmail.vue");
// const VerificationHandler = () => import('../views/VerificationHandler.vue')
const ProductosIndex = () => import("../views/Productos/ProductosIndex.vue");
const ProductosShow = () => import("../views/Productos/ProductosShow.vue");
const ProductosShowBasica = () =>
  import("../views/Productos/ProductosShow/Edicionbasica.vue");
const ProductosShowComponentes = () =>
  import("../views/Productos/ProductosShow/Componentes.vue");
const ProductosShowConsumibles = () =>
  import("../views/Productos/ProductosShow/Consumibles.vue");
const ProductosShowProveedores = () =>
  import("../views/Productos/ProductosShow/Proveedores.vue");
const ProductosShowDepartamentos = () =>
  import("../views/Productos/ProductosShow/Departamentos.vue");
const ProductosShowMinMax = () =>
  import("../views/Productos/ProductosShow/MinMax.vue");
const ProductosShowCodigosEquivalentes = () =>
  import("../views/Productos/ProductosShow/CodigosEquivalentes.vue");
const ProductosShowImpuestos = () =>
  import("../views/Productos/ProductosShow/Impuestos.vue");
const ProductosShowDescuentos = () =>
  import("../views/Productos/ProductosShow/Descuentos.vue");
const ProductosShowImagenes = () =>
  import("../views/Productos/ProductosShow/Imagenes.vue");
const Clientes = () => import("../views/Clientes.vue");
const CreditosIndex = () => import("../views/Creditos/CreditosIndex.vue");
const PuntoVenta = () => import("../views/PuntoVenta.vue");
const Produccion = () => import("../views/Produccion/Produccion.vue");
const Cotizaciones = () => import("../views/Cotizaciones/Cotizaciones.vue");
const CotizacionesShow = () => import('../views/Cotizaciones/CotizacionesShow.vue')
const CotizacionesIndex = () =>
  import("../views/Cotizaciones/CotizacionesIndex.vue");
const Proveedores = () => import("../views/Proveedores.vue");
const Almacens = () => import("../views/Almacens.vue");
const Conceptos = () => import("../views/Conceptos.vue");
const Departamentos = () => import("../views/Departamentos.vue");
const UserSettings = () => import("../views/settings/UserSettings.vue");
const VentasIndex = () => import("../views/Ventas/VentasIndex.vue");
const DevolucionesIndex = () =>
  import("../views/Devoluciones/DevolucionesIndex.vue");
const Movimientos = () => import("../views/Movimientos.vue");
const MovimientosIndex = () =>
  import("../views/Movimientos/MovimientosIndex.vue");
// const Notifications = () => import('../views/Notifications.vue')
const Historial = () => import("../views/Historial.vue");
const HistorialPrecio = () => import("../views/HistorialPrecio.vue");
const HistorialCosto = () => import("../views/HistorialCosto.vue");
const VentasShow = () => import("../views/Ventas/VentasShow.vue");
const DevolucionesShow = () =>
  import("../views/Devoluciones/DevolucionesShow.vue");
const MovimientosShow = () =>
  import("../views/Movimientos/MovimientosShow.vue");
const CreditosShow = () => import("../views/Creditos/CreditosShow.vue");
const Cortes = () => import("../views/Cortes.vue");
const UsuariosIndex = () => import("../views/admin/Usuarios/UsuariosIndex.vue");
const AdminCortesIndex = () =>
  import("../views/admin/Cortes/AdminCortesIndex.vue");
const AdminCortesShow = () =>
  import("../views/admin/Cortes/AdminCortesShow.vue");
const Reportes = () => import("../views/admin/Reportes.vue");
const UsuariosShow = () => import("../views/admin/Usuarios/UsuariosShow.vue");
const MiTabular = () => import("../views/admin/MiTabular.vue");
const Impuestos = () => import("../views/admin/Impuestos.vue");
const ImpuestosAsignacionMasiva = () =>
  import("../views/admin/ImpuestosAsignacionMasiva.vue");
const Facturacion = () => import('../views/admin/Facturacion/Facturacion.vue')
const FacturasIndex = () => import("../views/admin/Facturas/FacturasIndex.vue");
// const FacturasShow = () => import('../views/admin/Facturas/FacturasShow.vue')
const ReglasRetencionIndex = () =>
  import("../views/admin/ReglasRetencion/ReglasRetencionIndex.vue");
const FacturasGlobalesIndex = () =>
  import("../views/admin/FacturasGlobales/FacturasGlobalesIndex.vue");
const FacturasGlobalesCreate = () =>
  import("../views/admin/FacturasGlobales/FacturasGlobalesCreate.vue");
const FacturasGlobalesShow = () =>
  import("../views/admin/FacturasGlobales/FacturasGlobalesShow.vue");
const MisDatos = () => import("../views/admin/MisDatos.vue");
const MiOrganizacion = () => import("../views/admin/MiOrganizacion.vue");
const NotAuthorized = () => import("../views/NotAuthorized.vue");
const Admin = () => import("../views/Admin.vue");
const Front = () => import("../views/Front.vue");
const VentaImprimir = () => import("../views/VentaImprimir.vue");
const CotizacionImprimir = () => import("../views/CotizacionImprimir.vue");
const CorteImprimir = () => import("../views/CorteImprimir.vue");
// const MisVentasOffline = () => import('../views/MisVentasOffline.vue')
// const VentaOfflineImprimir = () => import('../views/VentaOfflineImprimir.vue')
// const Offline = () => import('../views/Offline.vue')
const MovimientoImprimir = () => import("../views/MovimientoImprimir.vue");
const DevolucionImprimir = () => import("../views/DevolucionImprimir.vue");

import User from "../apis/User";
import { useUserStore } from "../s";

const frontRoutes = [
  {
    path: "",
    name: "Home",
    component: Home,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "login",
    name: "Login",
    component: Login,
    meta: { hasOrganization: false, requiresAuth: false },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: { hasOrganization: false, requiresAuth: false },
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
    meta: { hasOrganization: false, requiresAuth: false },
  },
  {
    path: "register",
    name: "Register",
    component: Register,
    meta: { hasOrganization: false, requiresAuth: false },
  },
  {
    path: "verifyemail",
    name: "VerifyEmail",
    component: VerifyEmail,
    meta: { hasOrganization: false, requiresAuth: false },
  },
  {
    path: "productos",
    children: [
      {
        path: "",
        name: "ProductosIndex",
        component: ProductosIndex,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
      {
        path: ":productId",
        name: "ProductosShow",
        component: ProductosShow,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
        children: [
          {
            path: "basica",
            name: "ProductosShowBasica",
            component: ProductosShowBasica,
            meta: { hasOrganization: true, requiresAuth: true },
          },
          {
            path: "components",
            name: "ProductosShowComponentes",
            component: ProductosShowComponentes,
            meta: { hasOrganization: true, requiresAuth: true },
          },
          {
            path: "consumibles",
            name: "ProductosShowConsumibles",
            component: ProductosShowConsumibles,
            meta: { hasOrganization: true, requiresAuth: true },
          },
          {
            path: "proveedors",
            name: "ProductosShowProveedores",
            component: ProductosShowProveedores,
            meta: { hasOrganization: true, requiresAuth: true },
          },
          {
            path: "departamentos",
            name: "ProductosShowDepartamentos",
            component: ProductosShowDepartamentos,
            meta: { hasOrganization: true, requiresAuth: true },
          },
          {
            path: "minmax",
            name: "ProductosShowMinMax",
            component: ProductosShowMinMax,
            meta: { hasOrganization: true, requiresAuth: true },
          },
          {
            path: "codigos_equivalentes",
            name: "ProductosShowCodigosEquivalentes",
            component: ProductosShowCodigosEquivalentes,
            meta: { hasOrganization: true, requiresAuth: true },
          },
          {
            path: "impuestos",
            name: "ProductosShowImpuestos",
            component: ProductosShowImpuestos,
            meta: { hasOrganization: true, requiresAuth: true },
          },
          {
            path: "descuentos",
            name: "ProductosShowDescuentos",
            component: ProductosShowDescuentos,
            meta: { hasOrganization: true, requiresAuth: true },
          },
          {
            path: "imagenes",
            name: "ProductosShowImagenes",
            component: ProductosShowImagenes,
            meta: { hasOrganization: true, requiresAuth: true },
          },
        ],
      },
    ],
  },
  {
    path: "puntoventa",
    name: "PuntoVenta",
    component: PuntoVenta,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "produccion",
    name: "Produccion",
    component: Produccion,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "proveedores",
    name: "Proveedores",
    component: Proveedores,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "almacens",
    name: "Almacens",
    component: Almacens,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "departamentos",
    name: "Departamentos",
    component: Departamentos,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "userSettings",
    name: "UserSettings",
    component: UserSettings,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "ventas",
    children: [
      {
        path: "",
        name: "VentasIndex",
        component: VentasIndex,
        meta: { hasOrganization: true, requiresAuth: true },
      },
      {
        path: ":ventaId",
        name: "VentasShow",
        component: VentasShow,
        meta: { hasOrganization: true, requiresAuth: true },
      },
    ],
  },
  {
    path: "devoluciones",
    children: [
      {
        path: "",
        name: "DevolucionesIndex",
        component: DevolucionesIndex,
        meta: { hasOrganization: true, requiresAuth: true },
      },
      {
        path: ":devolucion/:venta",
        name: "DevolucionesShow",
        component: DevolucionesShow,
        meta: { hasOrganization: true, requiresAuth: true },
      },
    ],
  },
  {
    path: "movimientos",
    children: [
      {
        path: "",
        name: "MovimientosIndex",
        component: MovimientosIndex,
        meta: { hasOrganization: true, requiresAuth: true },
      },
      {
        path: "create",
        name: "MovimientosCreate",
        component: Movimientos,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireEncargadoRole: true,
        },
      },
      {
        path: "/:movimientoId",
        name: "MovimientosShow",
        component: MovimientosShow,
        meta: { hasOrganization: true, requiresAuth: true },
      },
    ],
  },
  {
    path: "cotizaciones",
    children: [
      {
        path: "",
        name: "CotizacionesIndex",
        component: CotizacionesIndex,
        meta: { hasOrganization: true, requiresAuth: true },
      },
      { path: ':cotizacionId', name: 'CotizacionesShow', component: CotizacionesShow, meta: { hasOrganization: true, requiresAuth: true } },
      {
        path: "create",
        name: "Cotizaciones",
        component: Cotizaciones,
        meta: { hasOrganization: true, requiresAuth: true },
      },
    ],
  },
  {
    path: "creditos",
    children: [
      {
        path: "",
        name: "CreditosIndex",
        component: CreditosIndex,
        meta: { hasOrganization: true, requiresAuth: true },
      },
      {
        path: ":creditoId",
        name: "CreditosShow",
        component: CreditosShow,
        meta: { hasOrganization: true, requiresAuth: true },
      },
    ],
  },
  {
    path: "clientes",
    name: "Clientes",
    component: Clientes,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  // { path: 'Notifications', name: 'Notifications', component: Notifications, meta: { hasOrganization: true, requiresAuth: true } },
  {
    path: "historial/:almacenId/:productId",
    name: "Historial",
    component: Historial,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "historialPrecio/:almacenId/:productId",
    name: "HistorialPrecio",
    component: HistorialPrecio,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "historialCosto/:almacenId/:productId",
    name: "HistorialCosto",
    component: HistorialCosto,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "cortes",
    name: "Cortes",
    component: Cortes,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "conceptos",
    name: "Conceptos",
    component: Conceptos,
    meta: { hasOrganization: true, requiresAuth: true },
  },
  {
    path: "notauthorized",
    name: "NotAuthorized",
    component: NotAuthorized,
    meta: { hasOrganization: false, requiresAuth: false },
  },
  // { path: 'misventasOffline', name: 'MisVentasOffline', component: MisVentasOffline, meta: { hasOrganization: true, requiresAuth: true } },
  // { path: 'offline', name: 'Offline', component: Offline, meta: { hasOrganization: true, requiresAuth: true } },
];
const adminRoutes = [
  {
    path: "cortes",
    children: [
      {
        path: "",
        name: "AdminCortesIndex",
        component: AdminCortesIndex,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
      {
        path: ":corteId",
        name: "AdminCortesShow",
        component: AdminCortesShow,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
    ],
  },
  {
    path: "reportes",
    name: "Reportes",
    component: Reportes,
    meta: {
      hasOrganization: true,
      requiresAuth: true,
      requireAdministrationRole: true,
    },
  },
  {
    path: "Impuestos",
    name: "Impuestos",
    component: Impuestos,
    meta: {
      hasOrganization: true,
      requiresAuth: true,
      requireAdministrationRole: true,
    },
  },
  {
    path: "asignacion_masiva/:impuestoId",
    name: "ImpuestosAsignacionMasiva",
    component: ImpuestosAsignacionMasiva,
    meta: {
      hasOrganization: true,
      requiresAuth: true,
      requireAdministrationRole: true,
    },
  },
  { path: 'facturacion', name: 'Facturacion', component: Facturacion, meta: { hasOrganization: true, requiresAuth: true, requireAdministrationRole: true } },
  {
    path: "facturas",
    children: [
      {
        path: "",
        name: "FacturasIndex",
        component: FacturasIndex,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
      // { path: 'create', name: 'FacturasCreate', component: FacturasCreate, meta: { hasOrganization: true, requiresAuth: true, requireAdministrationRole: true } },
      // { path: ':facturaId', name: 'FacturasShow', component: FacturasShow, meta: { hasOrganization: true, requiresAuth: true, requireAdministrationRole: true } },
    ],
  },
  {
    path: "facturas_globales",
    children: [
      {
        path: "",
        name: "FacturasGlobalesIndex",
        component: FacturasGlobalesIndex,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
      {
        path: "create",
        name: "FacturasGlobalesCreate",
        component: FacturasGlobalesCreate,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
      {
        path: ":facturaId",
        name: "FacturasGlobalesShow",
        component: FacturasGlobalesShow,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
    ],
  },
  {
    path: "reglas_retencion",
    children: [
      {
        path: "",
        name: "ReglasRetencionIndex",
        component: ReglasRetencionIndex,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
    ],
  },
  {
    path: "usuarios",
    children: [
      {
        path: "",
        name: "UsuariosIndex",
        component: UsuariosIndex,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
      {
        path: ":userId",
        name: "UsuariosShow",
        component: UsuariosShow,
        meta: {
          hasOrganization: true,
          requiresAuth: true,
          requireAdministrationRole: true,
        },
      },
    ],
  },
  {
    path: "miorganizacion",
    name: "MiOrganizacion",
    component: MiOrganizacion,
    meta: {
      hasOrganization: true,
      requiresAuth: true,
      requireAdministrationRole: true,
    },
  },
  {
    path: "mitabular",
    name: "MiTabular",
    component: MiTabular,
    meta: {
      hasOrganization: true,
      requiresAuth: true,
      requireAdministrationRole: true,
    },
  },
  {
    path: "MisDatos",
    name: "MisDatos",
    component: MisDatos,
    meta: {
      hasOrganization: true,
      requiresAuth: true,
      requireAdministrationRole: true,
    },
  },
];
const routes = [
  { path: "/", redirect: "/front/puntoventa" },
  // { path: '/email/verify', component: VerificationHandler },
  { path: "/admin", component: Admin, children: adminRoutes },
  { path: "/front", component: Front, children: frontRoutes },
  {
    path: "/ventatickets/imprimir/:id",
    name: "ventaImprimir",
    component: VentaImprimir,
  },
  {
    path: "/cotizacions/imprimir/:id",
    name: "contizacionImprimir",
    component: CotizacionImprimir,
  },
  {
    path: "/cortes/imprimir/:id",
    name: "corteImprimir",
    component: CorteImprimir,
  },
  // { path: '/ventatickets/imprimirOffline/:id', name: 'ventaImprimirOffline', component: VentaOfflineImprimir },
  { path: "/devoluciones/imprimir/:id", component: DevolucionImprimir },
  { path: "/movimientos/imprimir/:id", component: MovimientoImprimir },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach(async (to, from) => {
  const store = useUserStore();

  if (!to.meta.requiresAuth) {
    return;
  }
  if (store.roles.length === 0) {
    const response = await User.auth().catch((error) => {
      if (error.message === "Request failed with status code 403") {
        return "verify";
      }
    });

    if (response === "verify") {
      return "/front/verifyemail";
    }

    if (!response && !window.__TAURI__) {
      store.isLoggedIn = false;
      localStorage.removeItem("token");
      return "/front/login";
    }
    if (!response && window.__TAURI__) {
      store.authuser = JSON.parse(localStorage.getItem("authuser") ?? "null");
      store.roles = JSON.parse(localStorage.getItem("roles") ?? "[]");
      store.isLoggedIn = JSON.parse(
        localStorage.getItem("isLoggedIn") ?? "false"
      );
    } else {
      localStorage.setItem("authuser", JSON.stringify(response.data[0]));
      localStorage.setItem("roles", JSON.stringify(response.data[1]));
      localStorage.setItem("isLoggedIn", JSON.stringify(true));
      store.authuser = response.data[0];
      store.roles = response.data[1];
      store.isLoggedIn = true;
    }
  }
  const isEncargado = store.roles.includes("Cajero");
  const rolesNecesarios = ["Admin", "Owner"];
  const isAdmin = rolesNecesarios.every((role) => {
    store.roles.includes(role);
  });

  if (to.meta.requiresAuth && !store.isLoggedIn) {
    return { path: "/front/login" };
  }
  if (to.meta.hasOrganization && !store.authuser?.organization_id) {
    return "/front/creaorganizacion";
  }
  if (to.meta.requireEncargadoRole && isEncargado) {
    return { path: "/front/puntoventa" };
  }
  if (to.meta.requireAdministrationRole && isAdmin) {
    return { path: "/front/puntoventa" };
  }
});

export default router;

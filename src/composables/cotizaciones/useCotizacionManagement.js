import { ref, reactive, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Cotizacion from '@js/apis/Cotizacion';
import Almacen from '@js/apis/Almacen';
import Cliente from '@js/apis/Cliente';
import { useNotification } from '../useNotification';
import { useProcessRequest } from '../useProcessRequest';
import { useUserStore } from '@js/s/index';
import {
  createCalculators,
} from '../helpers/ticketCalculations';
import { rellenaTicket as mapTicketData } from '../helpers/ticketDataMapping';

export function useCotizacionManagement() {
  const router = useRouter();
  const store = useUserStore();
  const { notify } = useNotification();
  const { processRequest } = useProcessRequest();

  // State
  const ticketActual = reactive({
    id: null,
    nombre: "",
    total: null,
    clienteId: null,
    miAlmacenId: null,
    miAlmacenName: "",
    consecutivo: null,
    cliente: "",
    price_type: "",
    ganancia: null,
  });

  const almacen = reactive({
    id: "",
    name: "",
  });

  const articulos = ref([]);
  const almacens = ref([]);
  const credito = ref(false);
  const nombreT = ref("");
  const cargando = ref(false);
  const drawer = ref(false);
  const openCliente = ref(false);
  const telefono = ref("");
  const codigoRef = ref(null);
  const isBannerOpen = ref(false);

  // Crear calculadoras configuradas para Cotizaciones (usa 'importe' en lugar de 'precio_final')
  const cotizacionCalc = createCalculators({ subtotalField: 'importe' });

  // Computed - Totals
  const totalComputed = computed(() => cotizacionCalc.calculateTotal(articulos.value));

  const subtotalComputed = computed(() => cotizacionCalc.calculateSubtotal(articulos.value));

  const descuentoComputed = computed(() => cotizacionCalc.calculateDescuento(articulos.value));

  const impuestoComputed = computed(() => cotizacionCalc.calculateImpuesto(articulos.value));

  // Functions
  async function init() {
    nombreT.value = "";
    processRequest(async () => {
      let response = await Cotizacion.getAll();
      await rellenaTicket(response.data[0]);
      articulos.value = response.data[1];
      // 
    }, cargando, {
      onError: (error) => notify.error(error)
    });
  }

  async function getSpecificVT(cotizacionId) {
    nombreT.value = "";
    processRequest(async () => {
      const { data } = await Cotizacion.getSpecificVT(cotizacionId);
      await rellenaTicket(data[0]);
      articulos.value = data[1];
    }, cargando, {
      onError: (error) => notify.error(error),
      onFinally: () => {

      }
    });
  }

  async function rellenaTicket(response) {
    const almacenesResult = await mapTicketData(
      response,
      ticketActual,
      almacen,
      telefono,
      store,
      { cargando }
    );

    credito.value = false;

    if (almacenesResult) {
      almacens.value = almacenesResult.almacenes;
      if (almacenesResult.soloUno) {
        await asignarAlmacen(almacenesResult.almacenes[0].id);
      }
    }
  }

  function asignarAlmacen(almacenId) {
    processRequest(async () => {
      await Cotizacion.asignarAlmacen(ticketActual.id, almacenId);
      cargando.value = false;
      await getSpecificVT(ticketActual.id);
    }, cargando, {
      onSuccess: () => notify.success("Almacén asignado al ticket"),
      onError: (error) => notify.error(error),
      onFinally: () => {
        drawer.value = false;
      }
    });
  }

  async function borrarTicket() {
    let conf = await confirm("Estas Seguro de Borrar el Ticket?");
    if (conf) {
      processRequest(async () => {
        const { data } = await Cotizacion.borrarTicket(ticketActual.id);
        cargando.value = false;
        await init();
        ticketActual.miAlmacenName = "";

      }, cargando, {
        onSuccess: () => notify.success("Ticket eliminado"),
        onError: (error) => notify.error(error)
      });
    }
  }

  function setNombreTicket() {
    processRequest(async () => {
      await Cotizacion.setNombreTicket(ticketActual.id, nombreT.value);
      cargando.value = false;
      await getSpecificVT(ticketActual.id);

    }, cargando, {
      onSuccess: () => notify.success("Nombre actualizado"),
      onError: (error) => notify.error(error)
    });
  }

  function setCliente(cliente) {
    processRequest(async () => {
      const response = await Cotizacion.setCliente(cliente, ticketActual.id);
      if (response.data?.success && response.data?.retentionRules?.length) {
        if (
          confirm(
            "Se aplicaran las siguientes reglas de retencion: " +
            response.data.retentionRules
          ) == true
        ) {
          cargando.value = false;
          await acceptRetentionRules();
          return;
        }
      }
      cargando.value = false;
      await getSpecificVT(ticketActual.id);
      openCliente.value = false;
    }, cargando, {
      onSuccess: () => notify.success("Cliente asignado"),
      onError: (error) => notify.error(error)
    });
  }

  function acceptRetentionRules() {
    processRequest(async () => {
      const response = await Cotizacion.acceptRetentionRules(ticketActual.id);
      cargando.value = false;
      await getSpecificVT(ticketActual.id);
      openCliente.value = false;

    }, cargando, {
      onSuccess: () => notify.success("Retenciones aceptadas"),
      onError: (error) => notify.error(error)
    });
  }

  async function setPendiente() {
    if (!(await confirm("Seguro que quieres dejar la venta pendiente?"))) return;
    processRequest(async () => {
      await Cotizacion.setPendiente(ticketActual.id);
      cargando.value = false;
      await init();
    }, cargando, {
      onSuccess: () => notify.success("Venta marcada como pendiente"),
      onError: (error) => notify.error(error)
    });
  }

  return {
    // State
    ticketActual,
    almacen,
    articulos,
    almacens,
    credito,
    nombreT,
    cargando,
    drawer,
    openCliente,
    telefono,
    codigoRef,
    isBannerOpen,

    // Computed
    totalComputed,
    subtotalComputed,
    descuentoComputed,
    impuestoComputed,

    // Functions
    init,
    getSpecificVT,
    rellenaTicket,
    asignarAlmacen,
    borrarTicket,
    setNombreTicket,
    setCliente,
    acceptRetentionRules,
    setPendiente,
  };
}

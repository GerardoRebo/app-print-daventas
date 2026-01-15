import { ref, reactive, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import PuntoVenta from '@js/apis/PuntoVenta';
import Cliente from '@js/apis/Cliente';
import { useNotification } from '../useNotification';
import { useProcessRequest } from '../useProcessRequest';
import { useUserStore } from '@js/s/index';
import {
  calculateTotal,
  calculateSubtotal,
  calculateDescuento,
  calculateImpuesto,
} from '../helpers/ticketCalculations';
import { rellenaTicket as mapTicketData } from '../helpers/ticketDataMapping';

export function useTicketManagement() {
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
  const cargando = ref(false);
  const drawer = ref(false);
  const openCliente = ref(false);
  const telefono = ref("");
  const isBannerOpen = ref(false);
  const nombreT = ref('');

  // Computed - Totals
  const totalComputed = computed(() => calculateTotal(articulos.value));

  const subtotalComputed = computed(() => calculateSubtotal(articulos.value));

  const descuentoComputed = computed(() => calculateDescuento(articulos.value));

  const impuestoComputed = computed(() => calculateImpuesto(articulos.value));

  // Functions
  async function init() {
    processRequest(async () => {
      let response = await PuntoVenta.getAll();
      await rellenaTicket(response.data[0]);
      articulos.value = response.data[1];
      // Parent component is responsible for focusing the codigo input
    }, cargando, {
      onError: (error) => notify.error(error)
    });
  }

  async function getSpecificVT(ventaticketId) {
    processRequest(async () => {
      const { data } = await PuntoVenta.getSpecificVT(ventaticketId);
      await rellenaTicket(data[0]);
      articulos.value = data[1];
      // Parent component is responsible for focusing the codigo input
    }, cargando, {
      onError: (error) => notify.error(error),
      onFinally: () => {
        // Parent component handles focus via ref
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
      await PuntoVenta.asignarAlmacen(ticketActual.id, almacenId);
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
        const { data } = await PuntoVenta.borrarTicket(ticketActual.id);
        cargando.value = false;
        await init();
        ticketActual.miAlmacenName = "";
        // Parent component is responsible for focusing the codigo input
      }, cargando, {
        onSuccess: () => notify.success("Ticket eliminado"),
        onError: (error) => notify.error(error)
      });
    }
  }

  function setNombreTicket(nombre) {
    processRequest(async () => {
      await PuntoVenta.setNombreTicket(ticketActual.id, nombre);
      cargando.value = false;
      await getSpecificVT(ticketActual.id);
      // Parent component is responsible for focusing the codigo input
    }, cargando, {
      onSuccess: () => notify.success("Nombre actualizado"),
    });
  }

  function setCliente(cliente) {
    processRequest(async () => {
      const response = await Cliente.setCliente(cliente, ticketActual.id);
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
      // Parent component is responsible for focusing the codigo input
    }, cargando, {
      onSuccess: () => notify.success("Cliente asignado"),
      onError: (error) => notify.error(error)
    });
  }

  function acceptRetentionRules() {
    processRequest(async () => {
      const response = await PuntoVenta.acceptRetentionRules(ticketActual.id);
      cargando.value = false;
      await getSpecificVT(ticketActual.id);
      openCliente.value = false;
      // Parent component is responsible for focusing the codigo input
    }, cargando, {
      onSuccess: () => notify.success("Retenciones aceptadas"),
      onError: (error) => notify.error(error)
    });
  }

  async function setPendiente() {
    if (!(await confirm("Seguro que quieres dejar la venta pendiente?"))) return;
    processRequest(async () => {
      await PuntoVenta.setPendiente(ticketActual.id);
      cargando.value = false;
      await init();
      // Parent component is responsible for focusing the codigo input
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
    cargando,
    drawer,
    openCliente,
    telefono,
    isBannerOpen,
    nombreT,
    
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

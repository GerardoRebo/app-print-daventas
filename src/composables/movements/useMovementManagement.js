import { ref, reactive, computed } from 'vue';
import Movimientos from '@js/apis/Movimientos';
import Almacen from '@js/apis/Almacen';
import { useNotification } from '../useNotification';
import { useProcessRequest } from '../useProcessRequest';
import { useUserStore } from '@js/s/index';
import {
  createCalculators,
} from '../helpers/ticketCalculations';

export function useMovementManagement() {
  const store = useUserStore();
  const { notify } = useNotification();
  const { processRequest, concurrentRequest } = useProcessRequest();

  // State - Movement context
  const movimientoActual = reactive({
    id: null,
    total: null,
    proveedorId: null,
    almacenOrigenId: null,
    almacenDestinoId: null,
    miAlmacenOrigenName: "",
    miAlmacenDestinoName: "",
    proveedor: "",
    notas: "",
    tipo: null,
    consecutivo: null,
    factura_uuid: null,
  });

  const almacen = reactive({
    id: null,
    name: "",
  });

  const almacenDestino = reactive({
    id: null,
    name: "",
  });

  const articulos = ref([]);
  const almacens = ref([]);
  const destinoAlmacens = ref([]);
  const cargando = ref(false);
  const cargandoConcurrent = ref(false);

  // Crear calculadoras configuradas para Cotizaciones (usa 'importe' en lugar de 'precio_final')
  const cotizacionCalc = createCalculators({ subtotalField: 'total_al_ordenar' });

  // Computed - Calculations
  const subtotalComputed = computed(() => cotizacionCalc.calculateSubtotal(articulos.value));

  const impuestoComputed = computed(() => {
    const suma = articulos.value.reduce(
      (partial_sum, a) => partial_sum + +(a.impuestos_al_enviar || 0),
      0
    );
    return suma.toFixed(2);
  });

  const totalComputed = computed(() => {
    const suma = +subtotalComputed.value + +impuestoComputed.value;
    return roundToNearestFiveCents(suma).toFixed(2);
  });

  // Computed - UI Logic (Movement-specific)
  const solicitudT = computed(() => {
    return movimientoActual.tipo === "S";
  });

  const visibleAlmacenDestino = computed(() => {
    // console.log(movimientoActual.almacenDestinoId, 'dest');
    
    return (
      !movimientoActual.almacenDestinoId &&
      movimientoActual.tipo != "C" &&
      movimientoActual.tipo != null
    );
  });

  const mostrarDescuentos = computed(() => {
    return movimientoActual.almacenOrigenId && movimientoActual.tipo == "C";
  });

  const almacenItems = computed(() => {
    return almacens.value.map((item) => ({
      title: item.name,
      value: item.id,
    }));
  });

  const destinoAlmacenItems = computed(() => {
    return destinoAlmacens.value.map((item) => ({
      title: item.name,
      value: item.id,
    }));
  });

  const proveedor = computed(() => {
    return movimientoActual.proveedor || "";
  });

  // Helper: Round to nearest 5 cents
  const roundToNearestFiveCents = (number) => {
    return parseFloat((Math.round(number / 0.05) * 0.05).toFixed(2));
  };

  // Functions
  async function init() {
    movimientoActual.tipo = null;
    movimientoActual.miAlmacenOrigenName = "";
    movimientoActual.miAlmacenDestinoName = "";

    processRequest(async () => {
      let response = await Movimientos.getAll();
      await rellenaTicket(response.data[0]);
      articulos.value = response.data[1];
    }, cargando, {
    });
  }

  async function getSpecificVT(movimientoId) {
    processRequest(async () => {
      const response = await Movimientos.getSpecificVT(movimientoId);
      movimientoActual.tipo = null;
      await rellenaTicket(response.data[0]);
      articulos.value = response.data[1];
    }, cargando, {
      onError: (error) => notify.error(error)
    });
  }

  async function rellenaTicket(response) {
    // Map basic data
    movimientoActual.id = response.id;
    movimientoActual.almacenOrigenId = response.almacen_origen_id;
    movimientoActual.almacenDestinoId = response.almacen_destino_id;
    movimientoActual.factura_uuid = response.factura_uuid;
    movimientoActual.tipo = response.tipo;
    movimientoActual.consecutivo = response.consecutivo;
    movimientoActual.proveedorId = response.proveedor_id;
    movimientoActual.notas = response.notas;
    movimientoActual.proveedor = response.proveedor?.name || "";

    // Map almacen origen
    if (movimientoActual.almacenOrigenId) {
      movimientoActual.miAlmacenOrigenName = response.almacen_origen.name;
      almacen.id = response.almacen_origen_id;
      almacen.name = response.almacen_origen.name;
    }

    // Map almacen destino
    if (movimientoActual.almacenDestinoId) {
      movimientoActual.miAlmacenDestinoName = response.almacen_destino.name;
      almacenDestino.id = response.almacen_destino_id;
      almacenDestino.name = response.almacen_destino.name;
    }

    // Load almacenes if needed
    if (movimientoActual.almacenOrigenId == null || solicitudT.value) {
      await _loadAlmacenes();
    }
  }

  // Helper: Load almacenes from store or API
  async function _loadAlmacenes() {
    let almacenesData = null;

    // Try to use cached almacenes from store
    if (store.myAlmacens?.length > 0) {
      almacenesData = store.myAlmacens;
    } else {
      // Fetch from API if not in cache
      try {
        cargando.value = true;
        const response = await Almacen.getMyAlmacens();
        almacenesData = response.data;
        store.myAlmacens = almacenesData;
      } catch (error) {
        // Handle silently
      } finally {
        cargando.value = false;
      }
    }

    // Assign to appropriate almacen collection
    if (almacenesData?.length > 0) {
      if (solicitudT.value) {
        destinoAlmacens.value = almacenesData;
        almacenDestino.id = almacenesData[0].id;
        almacenDestino.name = almacenesData[0].name;
      } else {
        almacens.value = almacenesData;
        almacen.id = almacenesData[0].id;
        almacen.name = almacenesData[0].name;
      }
    }

    // Fetch all almacenes concurrently in background
    concurrentRequest(async () => {
      const allAlmacenesResponse = await Almacen.getAll();
      if (allAlmacenesResponse.data?.length > 0) {
        if (solicitudT.value) {
          almacens.value = allAlmacenesResponse.data;
          almacen.id = allAlmacenesResponse.data[0].id;
          almacen.name = allAlmacenesResponse.data[0].name;
        } else {
          destinoAlmacens.value = allAlmacenesResponse.data;
          almacenDestino.id = allAlmacenesResponse.data[0].id;
          almacenDestino.name = allAlmacenesResponse.data[0].name;
        }
      }
    }, cargandoConcurrent, {
      onError: (error) => notify.error(error)
    });
  }

  function asignarAlmacen() {
    processRequest(async () => {
      await Movimientos.asignarAlmacen(movimientoActual.id, almacen.id, almacenDestino.id);
      cargando.value = false;
      await getSpecificVT(movimientoActual.id);
    }, cargando, {
      onSuccess: () => notify.success("Almacén asignado"),
    });
  }

  function borrarTicket() {
    processRequest(async () => {
      await Movimientos.borrarTicket(movimientoActual.id);
      cargando.value = false;
      await init();
    }, cargando, {
      onSuccess: () => notify.success("Movimiento eliminado"),
    });
  }

  function setMovimiento(tipoMovimiento) {
    processRequest(async () => {
      await Movimientos.setMovimiento(movimientoActual.id, tipoMovimiento);
      cargando.value = false;
      await getSpecificVT(movimientoActual.id);
    }, cargando, {
      onSuccess: () => notify.success("Tipo asignado"),
    });
  }

  function setProveedor(proveedor) {
    processRequest(async () => {
      await Movimientos.setProveedor(proveedor, movimientoActual.id);
      cargando.value = false;
      await getSpecificVT(movimientoActual.id);
    }, cargando, {
      onSuccess: () => notify.success("Proveedor asignado"),
    });
  }

  function setPendiente() {
    processRequest(async () => {
      await Movimientos.setPendiente(movimientoActual.id);
      cargando.value = false;
      await init();
    }, cargando, {
      onSuccess: () => notify.success("Movimiento marcado como pendiente"),
    });
  }

  function updateFolioFactura(folio) {
    processRequest(async () => {
      await Movimientos.updateFolioFactura(folio, movimientoActual.id);
      cargando.value = false;
      await getSpecificVT(movimientoActual.id);
    }, cargando, {
      onSuccess: () => notify.success("Folio actualizado"),
    });
  }

  return {
    // State
    movimientoActual,
    almacen,
    almacenDestino,
    articulos,
    almacens,
    destinoAlmacens,
    cargando,
    cargandoConcurrent,

    // Computed - Calculations
    totalComputed,
    subtotalComputed,
    impuestoComputed,

    // Computed - UI Logic
    solicitudT,
    visibleAlmacenDestino,
    mostrarDescuentos,
    almacenItems,
    destinoAlmacenItems,
    proveedor,

    // Functions
    init,
    getSpecificVT,
    rellenaTicket,
    asignarAlmacen,
    borrarTicket,
    setMovimiento,
    setProveedor,
    setPendiente,
    updateFolioFactura,
  };
}

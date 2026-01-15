/**
 * Data mapping functions for ticket/quotation management
 * These functions handle transforming API responses into local state
 */
import Almacen from '@js/apis/Almacen';

/**
 * Maps API response data into ticket state object
 * @param {Object} response - API response containing ticket data
 * @param {Object} ticketActual - Reactive ticket state object
 * @param {Object} almacen - Reactive almacen state object
 * @param {Object} telefono - Ref object for phone number
 * @param {Object} store - User store (Pinia)
 * @param {Object} options - Additional options (cargando ref, etc)
 */
export async function rellenaTicket(
  response,
  ticketActual,
  almacen,
  telefono,
  store,
  { cargando = null } = {}
) {
  ticketActual.id = response.id;
  almacen.id = response.almacen_id;
  ticketActual.miAlmacenId = response.almacen_id;
  ticketActual.nombre = response.nombre;
  ticketActual.consecutivo = response.consecutivo;
  ticketActual.clienteId = response.cliente_id;
  
  if (ticketActual.miAlmacenId) {
    ticketActual.miAlmacenName = response.almacen.name;
    almacen.name = response.almacen.name;
  }
  
  if (response.cliente) {
    ticketActual.cliente = response.cliente.name;
    ticketActual.price_type = response.cliente.price_type;
    telefono.value = response.cliente.telefono;
  } else {
    telefono.value = "";
    ticketActual.cliente = "";
  }
  
  if (ticketActual.miAlmacenId == null) {
    let almacenesData = response;
    
    if (store.myAlmacens.length > 0) {
      almacenesData.data = store.myAlmacens;
    } else {
      try {
        if (cargando) cargando.value = true;
        almacenesData = await Almacen.getMyAlmacens();
        store.myAlmacens = almacenesData.data;
      } catch (error) {
        // Handle error silently
      } finally {
        if (cargando) cargando.value = false;
      }
    }

    if (almacenesData.data && almacenesData.data[0]) {
      return {
        almacenes: almacenesData.data,
        soloUno: almacenesData.data.length === 1
      };
    }
  }
  
  return null;
}

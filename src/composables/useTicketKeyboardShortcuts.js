import { useVentasKeyboardShortcuts } from './useKeyboardShortcuts';

/**
 * Configuración centralizada para atajos de teclado
 * 
 * @param {Object} handlers - Objeto con manejadores: 
 *   { agregarProducto, goPrimerArticulo, abrirCliente, etc. }
 * @param {Object} options - Opciones adicionales: { routerName, ... }
 */
export function useTicketKeyboardShortcuts(handlers, options = {}) {
  // Por ahora, simplemente inicializa el composable de shortcuts de ventas
  // En futuro, podremos crear una capa de abstracción aquí
  
  return useVentasKeyboardShortcuts({
    agregarProducto: handlers.agregarProducto,
    goPrimerArticulo: handlers.goPrimerArticulo,
    abrirCliente: handlers.abrirCliente,
    borrarTicket: handlers.borrarTicket,
    guardarVenta: handlers.guardarVenta,
    routerName: options.routerName || 'VentasIndex',
  });
}

/**
 * Factory function para crear wrappers que ejecutan acción + focus
 * Reduce código duplicado en VentasCreate y CotizacionesCreate
 * 
 * @param {Function} action - Función de acción del composable
 * @param {Function} focusCodigoField - Función de focus management
 * @param {boolean} shouldFocus - Si debe hacer focus después de la acción (default: true)
 * @returns {Function} Wrapper que ejecuta acción + focus
 */
export function createActionWrapper(action, focusCodigoField, emptyValuesWrapper, shouldFocus = true) {
  return (...args) => {
    // Ejecuta la acción con los argumentos pasados
    action(...args);
    
    // Si está configurado, devuelve el focus al campo de código
    if (shouldFocus) {
      focusCodigoField();
    }
    if (emptyValuesWrapper) {
      emptyValuesWrapper();
    }
  };
}

/**
 * Factory para crear múltiples wrappers de una sola vez
 * Útil cuando tienes muchas acciones que necesitan wrapper
 * 
 * @param {Object} actions - Objeto con { nombreAccion: función }
 * @param {Function} focusCodigoField - Función de focus management
 * @returns {Object} Objeto con wrappers: { nombreAccionWrapper: función }
 * 
 * @example
 * const { asignarAlmacen, borrarTicket } = useTicketManagement();
 * const { asignarAlmacenWrapper, borrarTicketWrapper } = createMultipleActionWrappers(
 *   { asignarAlmacen, borrarTicket },
 *   focusCodigoField
 * );
 */
export function createMultipleActionWrappers(actions, focusCodigoField) {
  const wrappers = {};
  
  Object.entries(actions).forEach(([name, action]) => {
    const wrapperName = name + 'Wrapper';
    wrappers[wrapperName] = createActionWrapper(action, focusCodigoField);
  });
  
  return wrappers;
}

/**
 * Factory para wrappers sin focus (acciones que cierran modales, etc.)
 * 
 * @param {Function} action - Función de acción
 * @param {Function} additionalAction - Acción adicional (ej: closeAllModals)
 * @returns {Function} Wrapper que ejecuta ambas acciones
 */
export function createCompositeActionWrapper(action, additionalAction) {
  return (...args) => {
    action(...args);
    additionalAction();
  };
}

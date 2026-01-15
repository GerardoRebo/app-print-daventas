import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Composable para manejar atajos de teclado (shortcuts)
 * Soporta Escape, F2-F10 e Insert con configuración flexible
 * 
 * @param {Object} shortcuts - Mapa de shortcuts a funciones
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - { enable, disable }
 * 
 * @example
 * const { enable, disable } = useKeyboardShortcuts({
 *   'Escape': () => closeModals(),
 *   'F2': () => openPaymentModal(),
 *   'F3': () => setPending(),
 *   'F9': () => searchProducts(),
 * }, {
 *   autoMount: true, // Se ejecuta en onMounted automáticamente
 * })
 */
export function useKeyboardShortcuts(shortcuts = {}, options = {}) {
  const { autoMount = true } = options
  const enabled = ref(true)

  // Función que cierra todos los modales comunes
  // Se puede pasar como callback en shortcuts['Escape']
  const defaultEscapeHandler = (closeCallbacks = {}) => {
    const {
      emptyValues = () => {},
      selectElement = null,
    } = closeCallbacks

    if (selectElement?.value?.select) {
      selectElement.value.select()
    }
    emptyValues()
  }

  // Manejador de eventos de teclado
  const handleKeyDown = (e) => {
    
    if (!enabled.value) return

    // Obtener la tecla presionada
    const key = e.key

    // Búsqueda en shortcuts configurados
    const handler = shortcuts[key]

    if (handler) {
      e.preventDefault()
      handler()
    }
  }

  // Activar listeners
  const enable = () => {
    enabled.value = true
    document.addEventListener('keydown', handleKeyDown)
  }

  // Desactivar listeners
  const disable = () => {
    enabled.value = false
    document.removeEventListener('keydown', handleKeyDown)
  }

  // Si autoMount es true, activar en onMounted y desactivar en onUnmounted
  if (autoMount) {
    onMounted(() => {
      enable()
    })

    onUnmounted(() => {
      disable()
    })
  }

  return {
    enable,
    disable,
    isEnabled: enabled,
    defaultEscapeHandler,
  }
}

/**
 * Composable especializado para VentasCreate
 * Incluye shortcuts específicos: F2 (Cobro), F3 (Pendiente), F6 (Ver Pendientes), 
 * F7 (Volver), F9 (Buscar), F10 (Ver Existencias)
 * 
 * Nota: El enfoque del campo codigo ahora es manejado por la vista VentasCreate
 * usando refs a SalesHeaderCard (desktop) y MobileSalesCard (mobile)
 */
export function useVentasKeyboardShortcuts({
  openCobrar = () => {},
  setPendiente = () => {},
  abrirPendiente = () => {},
  abrirModalBuscaProductsNombre = () => {},
  abrirExistencias = () => {},
  emptyValues = () => {},
  emptyValuesWrapper = () => {},
  router = null,
  routerName = 'VentasIndex',
}) {
  // Usar emptyValuesWrapper si existe, si no usar emptyValues
  const emptyHandler = emptyValuesWrapper || emptyValues

  const ventasShortcuts = {
    'Escape': emptyHandler,
    'F2': openCobrar,
    'F3': setPendiente,
    'F6': abrirPendiente,
    'F7': () => {
      router?.push({ name: routerName })
    },
    'F9': abrirModalBuscaProductsNombre,
    'F10': abrirExistencias,
  }

  return useKeyboardShortcuts(ventasShortcuts, { autoMount: true })
}

/**
 * Composable especializado para Cotizaciones
 * Incluye shortcuts específicos: F3 (Pendiente), F6 (Ver Pendientes),
 * F7 (Volver), F9 (Buscar), F10 (Ver Existencias), Insert (Precio Mayoreo)
 */
export function useCotizacionesKeyboardShortcuts({
  precioMayoreo = () => {},
  setPendiente = () => {},
  abrirPendiente = () => {},
  abrirModalBuscaProductsNombre = () => {},
  abrirExistencias = () => {},
  emptyValues = () => {},
  emptyValuesWrapper = () => {},
  codigoRef = null,
  router = null,
  routerName = 'VentasIndex',
}) {
  // Usar emptyValuesWrapper si existe, si no usar emptyValues
  const emptyHandler = emptyValuesWrapper || emptyValues

  const cotizacionesShortcuts = {
    'Escape': emptyHandler,
    'F3': setPendiente,
    'F6': abrirPendiente,
    'F7': () => {
      router?.push({ name: routerName })
    },
    'F9': abrirModalBuscaProductsNombre,
    'F10': abrirExistencias,
    'Insert': precioMayoreo,
  }

  return useKeyboardShortcuts(cotizacionesShortcuts, { autoMount: true })
}

/**
 * Composable especializado para Movimientos
 * Incluye shortcuts específicos: F3 (Pendiente), F6 (Ver Pendientes),
 * F7 (Volver), F9 (Buscar), F10 (Ver Existencias)
 */
export function useMovimientosKeyboardShortcuts({
  setPendiente = () => {},
  abrirPendiente = () => {},
  abrirModalBuscaProductsNombre = () => {},
  abrirExistencias = () => {},
  emptyValues = () => {},
  emptyValuesWrapper = () => {},
  codigoRef = null,
  router = null,
  routerName = 'VentasIndex',
}) {
  // Usar emptyValuesWrapper si existe, si no usar emptyValues
  const emptyHandler = emptyValuesWrapper || emptyValues

  const movimientosShortcuts = {
    'Escape': emptyHandler,
    'F3': setPendiente,
    'F6': abrirPendiente,
    'F7': () => {
      router?.push({ name: routerName })
    },
    'F9': abrirModalBuscaProductsNombre,
    'F10': abrirExistencias,
  }

  return useKeyboardShortcuts(movimientosShortcuts, { autoMount: true })
}

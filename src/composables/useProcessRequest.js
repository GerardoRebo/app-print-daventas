import { useNotification } from "@js/composables/useNotification";

/**
 * ========================================
 * COMPOSABLE: useProcessRequest
 * ========================================
 * 
 * Proporciona dos funciones complementarias para manejar requests async:
 * 
 * 1. processRequest: Serializa ejecuciones (previene race conditions)
 *    - Usa cuando necesitas garantizar que solo una solicitud se ejecute a la vez
 *    - Ideal para: guardado de datos, cambios críticos, actualizaciones secuenciales
 * 
 * 2. concurrentRequest: Permite ejecuciones paralelas sin control de concurrencia
 *    - Usa cuando múltiples solicitudes pueden correr en paralelo
 *    - Ideal para: búsquedas, lecturas, datos no críticos, llamadas independientes
 * 
 * Características comunes:
 * - Maneja loading.value automáticamente
 * - Detecta y procesa OperationalException
 * - Proporciona callbacks para éxito/error
 * - Soporte automático para errores de validación 422
 * - Manejo completo de errores con notificaciones
 * 
 * @returns {Object} { processRequest, concurrentRequest }
 * 
 * ========================================
 * USO RECOMENDADO (PATRÓN ESTÁNDAR)
 * ========================================
 * 
 * const { processRequest, concurrentRequest } = useProcessRequest();
 * const { notify } = useNotification();
 * const cargando = ref(false);
 * const errors = ref({});
 * 
 * ========================================
 * CUÁNDO USAR CADA FUNCIÓN
 * ========================================
 * 
 * USA processRequest CUANDO:
 * - Guardas datos (create, update, delete)
 * - Las solicitudes deben ejecutarse secuencialmente
 * - Una segunda ejecución debe esperar a que la primera termine
 * - Necesitas prevenir que un usuario haga clic múltiples veces
 * 
 * USA concurrentRequest CUANDO:
 * - Cargas datos (fetch, search, list)
 * - Las solicitudes pueden correr en paralelo
 * - No hay conflicto si se ejecutan múltiples al mismo tiempo
 * - El usuario puede hacer clic en varios botones sin esperar
 * 
 * ========================================
 * EJEMPLOS: processRequest (con race condition protection)
 * ========================================
 * 
 * // Ejemplo 1: Guardar datos - debe ser secuencial
 * function saveProduct() {
 *   processRequest(async () => {
 *     await API.updateProduct(form);
 *   }, cargando);
 * }
 * 
 * // Ejemplo 2: Crear con validación de servidor
 * function createClient() {
 *   processRequest(async () => {
 *     await API.createClient(form);
 *   }, cargando, {
 *     errorsRef: errors,
 *     onSuccess: (data) => {
 *       notify.success("Cliente creado");
 *       router.push(`/clientes/${data.id}`);
 *     }
 *   });
 * }
 * 
 * // Ejemplo 3: Eliminar con confirmación
 * async function deleteItem(id) {
 *   if (!confirm("¿Estás seguro?")) return;
 *   
 *   processRequest(async () => {
 *     await API.deleteItem(id);
 *   }, cargando, {
 *     onSuccess: () => {
 *       notify.success("Eliminado");
 *       refreshList();
 *     }
 *   });
 * }
 * 
 * ========================================
 * EJEMPLOS: concurrentRequest (sin race condition protection)
 * ========================================
 * 
 * // Ejemplo 1: Búsqueda - puede ejecutarse varias veces en paralelo
 * function searchClientes() {
 *   concurrentRequest(async () => {
 *     const data = await API.searchClientes(query);
 *     clientes.value = data;
 *   }, cargando);
 * }
 * 
 * // Ejemplo 2: Cargar lista de datos
 * function loadProducts() {
 *   concurrentRequest(async () => {
 *     const data = await API.getProducts(filters);
 *     return data;
 *   }, {
 *     loading: cargando,
 *     onSuccess: (data) => {
 *       productos.value = data;
 *     }
 *   });
 * }
 * 
 * // Ejemplo 3: Múltiples búsquedas en paralelo
 * function loadDashboard() {
 *   const cargandoVentas = ref(false);
 *   const cargandoClientes = ref(false);
 *   
 *   // Ambas corren en paralelo
 *   concurrentRequest(async () => {
 *     ventas.value = await API.getVentasResumen();
 *   }, cargandoVentas);
 *   
 *   concurrentRequest(async () => {
 *     clientes.value = await API.getClientesResumen();
 *   }, cargandoClientes);
 * }
 * 
 * 
 * ========================================
 * ESTRUCTURA DE errorData (onError)
 * ========================================
 * 
 * {
 *   message: string,          // Mensaje de error procesado
 *   error: Error,             // Objeto de error completo (original)
 *   status: number,           // HTTP status code (ej: 422, 500)
 *   data: any                 // Response.data completo (ej: { errors: {...} })
 * }
 * 
 * ========================================
 * CARACTERÍSTICAS IMPORTANTES
 * ========================================
 * 
 * 1. PROCESSREQUEST - Control de Concurrencia
 *    - Establece loading.value = true al inicio
 *    - Rechaza nuevas ejecuciones mientras una está en curso
 *    - Restaura loading.value = false INMEDIATAMENTE después
 *    - Permite processRequest() anidados sin race conditions
 *    - Finally también asegura loading = false incluso en errores
 * 
 * 2. CONCURRENTREQUEST - Sin Control de Concurrencia
 *    - Establece loading.value = true
 *    - Permite múltiples ejecuciones en paralelo
 *    - No rechaza ni espera por otras ejecuciones
 *    - Ideal para búsquedas y lecturas
 *    - Restaura loading.value = false al terminar
 * 
 * 3. MANEJO DE VALIDACIÓN 422 (Ambas funciones)
 *    - Si errorsRef se proporciona:
 *      → Auto-popula: errorsRef.value = errorData.data.errors
 *      → NO notifica (el usuario ve los errores en los campos)
 *    - Si errorsRef es null/undefined:
 *      → Notifica el error normalmente
 * 
 * 4. MANEJO DE EXCEPTIONS (Ambas funciones)
 *    - Detecta OperationalException de Laravel
 *    - Extrae mensaje del servidor automáticamente
 *    - catchMessage sobrescribe si se proporciona
 * 
 * 5. CALLBACKS FLEXIBLES (Ambas funciones)
 *    - onSuccess(data): Se ejecuta si Promise resuelve
 *    - onError(errorData): Se ejecuta si hay error
 *    - Ambos opcionales
 * 
 * 6. RETURN VALUE (Ambas funciones)
 *    - Retorna el resultado del callback
 *    - Útil para acceso directo a datos
 * 
 * ========================================
 */

export function useProcessRequest() {
    // Importar notify dentro del composable para contexto correcto
    const { notify } = useNotification();

    /**
     * Detecta si el error es una OperationalException de Laravel
     * @param {Error} error - El error capturado
     * @returns {Boolean}
     */
    const isOpException = (error) => {
        return error?.response?.data?.exception === "App\\Exceptions\\OperationalException";
    };

    /**
     * Extrae el mensaje de error de la respuesta
     * @param {Error} error - El error capturado
     * @returns {String} Mensaje de error
     */
    const getExceptionMsg = (error) => {
        // Prioridad: mensaje de OperationalException > mensaje general > default
        if (isOpException(error)) {
            return error?.response?.data?.message || "Ha ocurrido un error en el servidor";
        }
        return error?.response?.data?.message || 
               error?.message || 
               "Ha ocurrido un error inesperado";
    };

    /**
     * Procesa una petición async con manejo automático de loading y errores
     * 
     * @param {Function} callback - Función async que ejecutar
     * @param {Ref<Boolean>} loading - Referencia a variable de loading
     * @param {Object|Function} options - Opciones
     * @param {Ref<Object>} options.errorsRef - Ref al objeto errors (para validación 422)
     * @param {Function} options.onSuccess - Callback si éxito: (data) => void
     * @param {Function} options.onError - Callback si error: (errorData) => void
     * @param {String} options.catchMessage - Mensaje de error personalizado
     * @returns {Promise} Resultado del callback o undefined si error
     */
    const processRequest = async (callback, loading, options = {}) => {
        // Prevenir ejecuciones simultáneas (race condition protection)
        if (loading.value) {
            console.log(callback.toString());
            
            console.warn("ProcessRequest: Ya hay una petición en curso, ignorando...");
            return;
        }

        loading.value = true;

        try {
            // Ejecutar callback y capturar resultado
            const result = await callback();
            
            // ⚠️ CRÍTICO: Liberar loading INMEDIATAMENTE después del callback
            // Esto permite que processRequest() anidados funcionen sin ser bloqueados
            // Los callbacks (onSuccess, etc.) ahora pueden hacer sus propios processRequest()
            loading.value = false;
            
            // Ejecutar callback de éxito si existe
            if (options.onSuccess && typeof options.onSuccess === 'function') {
                options.onSuccess(result);
            }

            return result;

        } catch (error) {
            // Determinar mensaje de error (en orden de prioridad)
            let errorMessage;

            if (options.catchMessage) {
                // 1. Si se proporcionó catchMessage personalizado
                errorMessage = options.catchMessage;
            } else {
                // 2. Extraer mensaje de la excepción
                errorMessage = getExceptionMsg(error);
            }

            // Preparar objeto de error con estructura clara
            const errorData = {
                message: errorMessage,
                error: error,
                status: error?.response?.status,
                data: error?.response?.data
            };

            // ========================================
            // MANEJO AUTOMÁTICO DE ERRORES 422
            // ========================================
            if (error?.response?.status === 422 && options.errorsRef) {
                // Limpiar errores previos
                options.errorsRef.value = {};

                // Auto-poplar errores de validación
                if (errorData.data?.errors) {
                    options.errorsRef.value = errorData.data.errors;
                }

                // Ejecutar callback adicional si se proporcionó
                if (options.onError && typeof options.onError === 'function') {
                    options.onError(errorData);
                }

                // NO notificar (el usuario ve los errores en los campos)
                loading.value = false;
                return;
            }

            // ========================================
            // MANEJO DE OTROS ERRORES
            // ========================================
            
            // Ejecutar callback de error si existe
            if (options.onError && typeof options.onError === 'function') {
                options.onError(errorData);
            }
            // BACKWARDS COMPATIBILITY: Si se pasó una función directamente como 3er parámetro
            else if (typeof options === 'function') {
                options(errorMessage);
            }
            else {
                // Por defecto, notificar el error
                if (isOpException(error)) {
                    notify.error(`Error: ${errorMessage}`); 
                } else {
                    notify.error(errorMessage);
                }
            }

            // En desarrollo, loguear error completo
            if (import.meta.env.MODE === 'development') {
                console.error('[ProcessRequest Error]', {
                    message: errorMessage,
                    originalError: error,
                    isOpException: isOpException(error),
                    status: error?.response?.status
                });
            }

            // Propagar error para control adicional si es necesario
            throw error;

        } finally {
            // Siempre resetear loading, incluso si error o se cancela
            loading.value = false;
        }
    };

    /**
     * Ejecuta una petición async SIN control de race conditions
     * Permite múltiples ejecuciones en paralelo
     * 
     * Ideal para: búsquedas, lecturas, datos no críticos
     * 
     * @param {Function} callback - Función async que ejecutar
     * @param {Ref<Boolean>} loading - Referencia a variable de loading
     * @param {Object} options - Opciones
     * @param {Ref<Object>} options.errorsRef - Ref al objeto errors (para validación 422)
     * @param {Function} options.onSuccess - Callback si éxito: (data) => void
     * @param {Function} options.onError - Callback si error: (errorData) => void
     * @param {String} options.catchMessage - Mensaje de error personalizado
     * @returns {Promise} Resultado del callback o undefined si error
     */
    const concurrentRequest = async (callback, loading, options = {}) => {
        // Helper functions
        const setLoading = (state) => {
            loading?.value !== undefined && (loading.value = state);
        };

        setLoading(true);

        try {
            // Ejecutar callback y capturar resultado
            const result = await callback();
            
            setLoading(false);
            
            // Ejecutar callback de éxito si existe
            if (options.onSuccess && typeof options.onSuccess === 'function') {
                options.onSuccess(result);
            }

            return result;

        } catch (error) {
            // Determinar mensaje de error
            let errorMessage;

            if (options.catchMessage) {
                errorMessage = options.catchMessage;
            } else {
                errorMessage = getExceptionMsg(error);
            }

            // Preparar objeto de error
            const errorData = {
                message: errorMessage,
                error: error,
                status: error?.response?.status,
                data: error?.response?.data
            };

            // ========================================
            // MANEJO AUTOMÁTICO DE ERRORES 422
            // ========================================
            if (error?.response?.status === 422 && options.errorsRef) {
                options.errorsRef.value = {};
                
                if (errorData.data?.errors) {
                    options.errorsRef.value = errorData.data.errors;
                }

                if (options.onError && typeof options.onError === 'function') {
                    options.onError(errorData);
                }

                setLoading(false);
                return;
            }

            // ========================================
            // MANEJO DE OTROS ERRORES
            // ========================================
            if (options.onError && typeof options.onError === 'function') {
                options.onError(errorData);
            } else if (typeof options === 'function') {
                options(errorMessage);
            } else {
                if (isOpException(error)) {
                    notify.error(`Error: ${errorMessage}`);
                } else {
                    notify.error(errorMessage);
                }
            }

            // En desarrollo, loguear error completo
            if (import.meta.env.MODE === 'development') {
                console.error('[ConcurrentRequest Error]', {
                    message: errorMessage,
                    originalError: error,
                    isOpException: isOpException(error),
                    status: error?.response?.status
                });
            }

            throw error;

        } finally {
            // Siempre resetear loading
            setLoading(false);
        }
    };

    return { processRequest, concurrentRequest };
}

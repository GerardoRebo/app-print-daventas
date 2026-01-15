/**
 * ========================================
 * COMPOSABLE: useFormRequest
 * ========================================
 * 
 * Composable especializado para manejar peticiones en formularios
 * - Extiende ProcessRequest con manejo automático de errores 422
 * - Auto-popula errores de validación en errors.value
 * - Mantiene notificación limpia para otros errores
 * - Elimina boilerplate repetitivo
 * 
 * @returns {Object} { formRequest }
 * 
 * ========================================
 * ¿POR QUÉ useFormRequest?
 * ========================================
 * 
 * ANTES (Boilerplate):
 * ----
 * processRequest(async () => {
 *   await API.register(form);
 * }, loading, {
 *   onError: (errorData) => {
 *     if (errorData.status === 422) {
 *       errors.value = errorData.data.errors;  // ← Repetitivo en TODOS los formularios
 *       return;
 *     }
 *     notify.error(errorData.message);         // ← También repetitivo
 *   }
 * });
 * 
 * DESPUÉS (Limpio):
 * ----
 * formRequest(async () => {
 *   await API.register(form);
 * }, errors, loading);  // ← ¡Solo esto!
 * 
 * ========================================
 * DIFERENCIA CON ProcessRequest
 * ========================================
 * 
 * ProcessRequest: Para cualquier petición async genérica
 * useFormRequest: Especializado en formularios con validación
 * 
 * ========================================
 * USO RECOMENDADO
 * ========================================
 * 
 * const { formRequest } = useFormRequest();
 * const { notify } = useNotification();
 * const errors = ref({});
 * const loading = ref(false);
 * 
 * // Sin callbacks - manejo automático de errores 422
 * function register() {
 *   formRequest(async () => {
 *     await API.register(form);
 *   }, errors, loading);
 * }
 * 
 * // Con callback de éxito personalizado
 * function register() {
 *   formRequest(async () => {
 *     await API.register(form);
 *   }, errors, loading, {
 *     onSuccess: () => {
 *       notify.success("Registro completado");
 *       router.push('/login');
 *     }
 *   });
 * }
 * 
 * // Con mensaje de error personalizado
 * function register() {
 *   formRequest(async () => {
 *     await API.register(form);
 *   }, errors, loading, {
 *     catchMessage: "Error al registrar usuario",
 *     onSuccess: () => notify.success("¡Registro exitoso!")
 *   });
 * }
 * 
 * // Con callback de error adicional (raro, pero soportado)
 * function register() {
 *   formRequest(async () => {
 *     await API.register(form);
 *   }, errors, loading, {
 *     onError: (errorData) => {
 *       // Lógica adicional específica del formulario
 *       console.log("Error adicional:", errorData);
 *     },
 *     onSuccess: () => notify.success("Éxito")
 *   });
 * }
 * 
 * ========================================
 * FLUJO DE ERROR AUTOMÁTICO
 * ========================================
 * 
 * 1. Si status === 422 (Validación)
 *    → Auto-popula: errors.value = errorData.data.errors
 *    → NO ejecuta notify (el usuario ve los errores en los campos)
 *    → Ejecuta onError si se proporcionó (lógica adicional)
 * 
 * 2. Si status !== 422 (Otros errores)
 *    → Ejecuta onError si se proporcionó
 *    → Si NO hay onError, notifica el error al usuario
 * 
 * ========================================
 * PARÁMETROS
 * ========================================
 * 
 * @param {Function} callback - Función async a ejecutar
 * @param {Ref<Object>} errorsRef - Ref del objeto errors del formulario
 * @param {Ref<Boolean>} loadingRef - Ref del estado de carga
 * @param {Object} options - Opciones
 *   - onSuccess: (data) => void - Ejecutado si la petición es exitosa
 *   - onError: (errorData) => void - Ejecutado si hay error (después de auto-poblar)
 *   - catchMessage: string - Mensaje de error personalizado
 * 
 * ========================================
 */

import { useProcessRequest } from './ProcessRequest';
import { useNotification } from './useNotification';

export function useFormRequest() {
    const { processRequest } = useProcessRequest();
    const { notify } = useNotification();

    /**
     * Procesa una petición de formulario con manejo automático de errores 422
     * 
     * @param {Function} callback - Función async que ejecutar
     * @param {Ref<Object>} errorsRef - Ref al objeto errors del formulario
     * @param {Ref<Boolean>} loadingRef - Ref al estado de carga
     * @param {Object} options - Opciones (onSuccess, onError, catchMessage)
     * @returns {Promise}
     */
    const formRequest = async (callback, errorsRef, loadingRef, options = {}) => {
        return processRequest(
            callback,
            loadingRef,
            {
                // Mantener catchMessage si se proporciona
                catchMessage: options.catchMessage,
                
                // Callback de éxito (directo)
                onSuccess: options.onSuccess,
                
                // Callback de error mejorado
                onError: (errorData) => {
                    // Limpiar errores previos
                    errorsRef.value = {};

                    // Si es error 422 (validación), auto-poplar errors
                    if (errorData.status === 422 && errorData.data?.errors) {
                        errorsRef.value = errorData.data.errors;
                        
                        // Ejecutar callback adicional si se proporcionó
                        if (options.onError && typeof options.onError === 'function') {
                            options.onError(errorData);
                        }
                        
                        // NO notificar (el usuario ve los errores en los campos)
                        return;
                    }

                    // Para otros errores
                    if (options.onError && typeof options.onError === 'function') {
                        options.onError(errorData);
                    } else {
                        // Si no hay callback personalizado, notificar
                        notify.error(errorData.message);
                    }
                }
            }
        );
    };

    return { formRequest };
}

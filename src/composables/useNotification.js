import { useToasterStore } from "../s/toaster";

/**
 * Composable profesional para notificaciones en toda la app
 * Wrapper sobre useToasterStore para API más limpia
 * 
 * @example
 * const { notify } = useNotification();
 * notify.success("Guardado correctamente");
 * notify.error("Error al guardar");
 * notify.warning("Acción pendiente");
 * notify.info("Información importante", { timeout: 5000 });
 */
export function useNotification() {
    const toasterStore = useToasterStore();

    const notify = {
        /**
         * Notificación de éxito
         * @param {string} message - Mensaje a mostrar
         * @param {Object} options - { timeout, title }
         */
        success: (message, options = {}) => {
            toasterStore.success({
                text: message,
                title: options.title || "Éxito",
                timeout: options.timeout || 3500
            });
        },

        /**
         * Notificación de error
         * @param {string} message - Mensaje a mostrar
         * @param {Object} options - { timeout, title }
         */
        error: (message, options = {}) => {
            toasterStore.error({
                text: message,
                title: options.title || "Error",
                timeout: options.timeout || 4000
            });
        },

        /**
         * Notificación de advertencia
         * @param {string} message - Mensaje a mostrar
         * @param {Object} options - { timeout, title }
         */
        warning: (message, options = {}) => {
            toasterStore.warning({
                text: message,
                title: options.title || "Advertencia",
                timeout: options.timeout || 3500
            });
        },

        /**
         * Notificación de información
         * @param {string} message - Mensaje a mostrar
         * @param {Object} options - { timeout, title }
         */
        info: (message, options = {}) => {
            toasterStore.info({
                text: message,
                title: options.title || "Información",
                timeout: options.timeout || 3500
            });
        }
    };

    return {
        notify,
        /**
         * Acceso directo a toasterStore para casos avanzados
         */
        store: toasterStore
    };
}

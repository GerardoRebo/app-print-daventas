import { computed } from 'vue';

/**
 * Composable para UI compartida entre VentasCreate y CotizacionesCreate
 * Contiene propiedades calculadas comunes a ambos componentes
 * 
 * @param {Ref} almacens - Array reactivo de almacenes
 * @param {Object} router - Vue Router instance
 * @returns {Object} { showOffline, goOffline, almacenItems }
 */
export function useTicketUI(almacens, router) {
  /**
   * Detecta si la aplicación está en modo Tauri (desktop)
   * para mostrar opción de offline
   */
  const showOffline = computed(() => {
    return window.__TAURI_METADATA__;
  });

  /**
   * Navega a la vista Offline
   */
  const goOffline = () => {
    router.push({ name: 'Offline' });
  };

  /**
   * Transforma array de almacenes a formato para v-select
   * { title: name, value: id }
   */
  const almacenItems = computed(() => {
    return almacens.value.map((item) => ({
      title: item.name,
      value: item.id,
    }));
  });

  return {
    showOffline,
    goOffline,
    almacenItems,
  };
}

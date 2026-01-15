/**
 * Composable para formateo de tiempo relativo
 * Utiliza Intl.RelativeTimeFormat para soporte i18n automático
 * 
 * @example
 * const { formatRelativeTime } = useTimeFormatting('es');
 * formatRelativeTime(Date.now() - 120000) // "Hace 2 minutos"
 */

export function useTimeFormatting(locale = 'es') {
  /**
   * Formatea un timestamp a tiempo relativo legible
   * Ej: "Hace 2 minutos", "Hace 3 horas", "Hace 1 día"
   * 
   * @param {number|null} timestamp - Timestamp en milisegundos desde epoch
   * @returns {string} Texto formateado en idioma especificado
   */
  const formatRelativeTime = (timestamp) => {
    // Validación: si no hay timestamp, retorna placeholder
    if (!timestamp) {
      return 'Sin datos';
    }

    try {
      // Crear formateador RelativeTimeFormat con el locale especificado
      // numeric: 'auto' permite salidas como "Ayer" en vez de "Hace 1 día"
      const rtf = new Intl.RelativeTimeFormat(locale, { 
        numeric: 'auto',
        style: 'long'
      });

      // Calcular diferencia en segundos
      const diffInSeconds = Math.floor((Date.now() - timestamp) / 1000);

      // Determinar unidad y valor apropiados
      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
      } 
      
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return rtf.format(-minutes, 'minute');
      }
      
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return rtf.format(-hours, 'hour');
      }

      const days = Math.floor(diffInSeconds / 86400);
      return rtf.format(-days, 'day');

    } catch (error) {
      // Fallback si hay error en formato
      console.error('Error al formatear tiempo:', error);
      return 'Hace poco';
    }
  };

  return {
    formatRelativeTime
  };
}

/**
 * Pure calculation functions for ticket/quotation totals
 * These functions have no side effects and work with any article data structure
 */

/**
 * Rounds a number to the nearest five cents (0.05)
 * @param {number} number - The number to round
 * @returns {number} - Rounded number
 */
export const roundToNearestFiveCents = (number) => {
  return Math.round(number * 20) / 20;
};

/**
 * Factory function que crea un conjunto de calculadoras configuradas
 * Permite usar diferentes nombres de campos según la API (Ventas vs Cotizaciones)
 * 
 * @param {Object} fieldMapping - Mapeo de nombres de campos
 * @param {string} fieldMapping.subtotalField - Campo de subtotal ('precio_final' o 'importe')
 * @returns {Object} Objeto con todas las funciones de cálculo configuradas
 * 
 * @example
 * // Para Ventas
 * const ventasCalc = createCalculators({ subtotalField: 'precio_final' });
 * const total = ventasCalc.calculateTotal(articulos);
 * 
 * // Para Cotizaciones
 * const cotizacionCalc = createCalculators({ subtotalField: 'importe' });
 * const total = cotizacionCalc.calculateTotal(articulos);
 */
export const createCalculators = (fieldMapping = {}) => {
  // Normalizar con defaults (compatibilidad hacia atrás)
  const fields = {
    subtotalField: fieldMapping.subtotalField || 'precio_final', // Default: Ventas
    ...fieldMapping
  };

  /**
   * Calculate the total amount including taxes for a list of articles
   */
  const calculateTotal = (articulos) => {
    if (!articulos || !Array.isArray(articulos) || articulos.length === 0) {
      return "0.00";
    }
    
    let suma = 0;
    articulos.forEach((item) => {
      const precioFinal = +item[fields.subtotalField] || 0;
      const impuestoTraslado = +item.impuesto_traslado || 0;
      const impuestoRetenido = +item.impuesto_retenido || 0;
      const impuesto = impuestoTraslado - impuestoRetenido;
      suma += precioFinal + impuesto;
    });
    return roundToNearestFiveCents(suma).toFixed(2);
  };

  /**
   * Calculate the subtotal (base amount without taxes)
   */
  const calculateSubtotal = (articulos) => {
    if (!articulos || !Array.isArray(articulos) || articulos.length === 0) {
      return "0.00";
    }
    
    let suma = 0;
    articulos.forEach((item) => {
      const precioFinal = +item[fields.subtotalField] || 0;
      const importeDescuento = +item.importe_descuento || 0;
      suma += precioFinal - importeDescuento;
    });
    return suma.toFixed(2);
  };

  /**
   * Calculate total discount amount
   */
  const calculateDescuento = (articulos) => {
    if (!articulos || !Array.isArray(articulos) || articulos.length === 0) {
      return "0.00";
    }
    
    let suma = 0;
    articulos.forEach((item) => {
      const importeDescuento = +item.importe_descuento || 0;
      suma += importeDescuento;
    });
    return suma.toFixed(2);
  };

  /**
   * Calculate total tax amount (traslado minus retenciones)
   */
  const calculateImpuesto = (articulos) => {
    if (!articulos || !Array.isArray(articulos) || articulos.length === 0) {
      return "0.00";
    }
    
    let suma = 0;
    articulos.forEach((item) => {
      const impuestoTraslado = +item.impuesto_traslado || 0;
      const impuestoRetenido = +item.impuesto_retenido || 0;
      suma += impuestoTraslado - impuestoRetenido;
    });
    return suma.toFixed(2);
  };

  // Retorna todas las funciones configuradas
  return {
    calculateTotal,
    calculateSubtotal,
    calculateDescuento,
    calculateImpuesto
  };
};

// Exportar instancia por defecto (compatible con código existente - Ventas)
export const calculateTotal = (articulos) => {
  return createCalculators().calculateTotal(articulos);
};

export const calculateSubtotal = (articulos) => {
  return createCalculators().calculateSubtotal(articulos);
};

export const calculateDescuento = (articulos) => {
  return createCalculators().calculateDescuento(articulos);
};

export const calculateImpuesto = (articulos) => {
  return createCalculators().calculateImpuesto(articulos);
};

/**
 * Movement-specific calculation helper
 * Reuses core calculations from ticketCalculations.js
 * Specialized for movement-specific fields like impuestos_al_enviar and total_al_ordenar
 */
import {
  calculateTotal as basCalculateTotal,
  calculateSubtotal as baseCalculateSubtotal,
  roundToNearestFiveCents,
} from './ticketCalculations';

/**
 * Calculate movement subtotal using total_al_ordenar field
 * @param {Array} articulos - Array of article objects
 * @returns {string} - Subtotal formatted to 2 decimal places
 */
export const calculateMovementSubtotal = (articulos) => {
  if (!articulos || !Array.isArray(articulos) || articulos.length === 0) {
    return "0.00";
  }
  
  let suma = 0;
  articulos.forEach((item) => {
    const total = +item.total_al_ordenar || 0;
    suma += total;
  });
  return suma.toFixed(2);
};

/**
 * Calculate movement impuesto using impuestos_al_enviar field
 * @param {Array} articulos - Array of article objects
 * @returns {string} - Total tax formatted to 2 decimal places
 */
export const calculateMovementImpuesto = (articulos) => {
  if (!articulos || !Array.isArray(articulos) || articulos.length === 0) {
    return "0.00";
  }
  
  let suma = 0;
  articulos.forEach((item) => {
    const impuesto = +item.impuestos_al_enviar || 0;
    suma += impuesto;
  });
  return suma.toFixed(2);
};

/**
 * Calculate movement total
 * @param {Array} articulos - Array of article objects
 * @returns {string} - Total formatted to 2 decimal places
 */
export const calculateMovementTotal = (articulos) => {
  const subtotal = +calculateMovementSubtotal(articulos);
  const impuesto = +calculateMovementImpuesto(articulos);
  const suma = subtotal + impuesto;
  return roundToNearestFiveCents(suma).toFixed(2);
};

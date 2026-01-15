/**
 * Composable para gestión centralizada del enfoque en campos
 * Evita duplicación de lógica de focus en componentes
 * 
 * @param {Ref} codigoFieldRef - Referencia al campo de código (SalesHeaderCard o MobileSalesCard)
 * @returns {Object} { focusCodigoField }
 */
export function useFocusManagement(codigoFieldRef) {
  /**
   * Enfoca y selecciona el campo de código
   * Funciona tanto en desktop (SalesHeaderCard) como en mobile (MobileSalesCard)
   */
  const focusCodigoField = () => {
    if (!codigoFieldRef.value) return;

    // Desktop (SalesHeaderCard - tiene $refs internamente)
    if (codigoFieldRef.value.$refs?.codigoField) {
      codigoFieldRef.value.$refs.codigoField.focus();
      codigoFieldRef.value.$refs.codigoField.select?.();
      return;
    }

    // Mobile (MobileSalesCard - tiene $refs internamente)
    if (codigoFieldRef.value.$refs?.codigoInput) {
      codigoFieldRef.value.$refs.codigoInput.focus();
      codigoFieldRef.value.$refs.codigoInput.select?.();
      return;
    }

    // Fallback: intenta enfoque directo
    codigoFieldRef.value.focus?.();
  };

  return {
    focusCodigoField,
  };
}

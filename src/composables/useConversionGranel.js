import { ref, reactive } from 'vue'

/**
 * Composable for handling bulk/granel conversions (price base, weight, total calculations)
 * Used in VentasCreate and Cotizaciones views
 * @returns {Object} conversion form state and calculation functions
 */
export function useConversionGranel() {
  // Conversion form state
  const conversion_form = reactive({
    precioBase: 0,
    peso: 1,
  })

  const total = ref(0)
  const openConversion = ref(false)

  /**
   * Updates conversion form price base and recalculates total
   * Total = precioBase * peso
   * Accepts either an event or a numeric value
   */
  function modificaPrecioBase(eventOrValue) {
    const value = typeof eventOrValue === 'object' ? eventOrValue.target.value : eventOrValue
    const precioBase = parseFloat(value) || 0
    conversion_form.precioBase = precioBase
    const fixed = precioBase * parseFloat(conversion_form.peso || 0)
    let res = Math.round(fixed * 100) / 100
    total.value = res
  }

  /**
   * Updates conversion form weight and recalculates total
   * Total = peso * precioBase
   * Accepts either an event or a numeric value
   */
  function modificaPeso(eventOrValue) {
    const value = typeof eventOrValue === 'object' ? eventOrValue.target.value : eventOrValue
    const peso = parseFloat(value) || 0
    conversion_form.peso = peso
    const fixed = peso * parseFloat(conversion_form.precioBase || 0)
    let res = Math.round(fixed * 100) / 100
    total.value = res
  }

  /**
   * Updates total and recalculates weight
   * Peso = total / precioBase
   * Accepts either an event or a numeric value
   */
  function modificaTotal(eventOrValue) {
    const value = typeof eventOrValue === 'object' ? eventOrValue.target.value : eventOrValue
    const totalVal = parseFloat(value) || 0
    total.value = totalVal
    const precioBase = parseFloat(conversion_form.precioBase || 0)
    if (precioBase > 0) {
      conversion_form.peso = totalVal / precioBase
    }
  }

  /**
   * Resets conversion form to default values
   */
  function resetConversionForm() {
    conversion_form.precioBase = 0
    conversion_form.peso = 1
    total.value = 0
  }

  /**
   * Closes conversion modal and resets form
   */
  function closeConversionModal() {
    openConversion.value = false
    resetConversionForm()
  }

  return {
    conversion_form,
    total,
    openConversion,
    modificaPrecioBase,
    modificaPeso,
    modificaTotal,
    resetConversionForm,
    closeConversionModal,
  }
}

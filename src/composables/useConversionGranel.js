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
   */
  function modificaPrecioBase(event) {
    conversion_form.precioBase = event.target.value
    const fixed = +event.target.value * +conversion_form.peso
    let res = Math.round(fixed * 100) / 100
    total.value = res
  }

  /**
   * Updates conversion form weight and recalculates total
   * Total = peso * precioBase
   */
  function modificaPeso(event) {
    conversion_form.peso = event.target.value
    const fixed = +event.target.value * +conversion_form.precioBase
    let res = Math.round(fixed * 100) / 100
    total.value = res
  }

  /**
   * Updates total and recalculates weight
   * Peso = total / precioBase
   */
  function modificaTotal(event) {
    total.value = event.target.value
    const fixed = +event.target.value / +conversion_form.precioBase
    conversion_form.peso = fixed
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

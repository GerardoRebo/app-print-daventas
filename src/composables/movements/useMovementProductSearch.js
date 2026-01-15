import { ref, reactive, nextTick } from 'vue'
import { useNotification } from '@js/composables/useNotification'
import { useProcessRequest } from '@js/composables/useProcessRequest'
import Product from '@js/apis/Product'

export function useMovementProductSearch(movimientoActual, almacen) {
  // ============ Notifications & Processing ============
  const { notify } = useNotification()
  const { processRequest, concurrentRequest } = useProcessRequest()

  // ============ State ============
  const codigo = ref('')
  const cargando = ref(false)
  const cargandoConcurrent = ref(false)
  const productActualId = ref(null)
  const codigoRef = ref(null)

  const product_form = reactive({
    name: '',
    codigo: '',
    cantidad: '',
    pcosto: '',
    precio_sugerido: '',
    existencia: ''
  })

  // ============ Functions ============

  /**
   * Fills product_form with API response data
   */
  function rellenaProductForm(response) {
    productActualId.value = response.id
    product_form.name = response.name
    product_form.codigo = response.codigo
    product_form.cantidad = 1
    product_form.pcosto = response.pcosto
    product_form.precio_sugerido = response.precio_sugerido
    product_form.existencia = response.cantidad_actual
  }

  /**
   * Searches product by codigo from movement input
   */
  function searchProduct() {
    if (codigo.value === '') {
      notify.warning('Campo Código Vacio')
      return
    }

    if (movimientoActual.almacenOrigenId === null) {
      notify.warning('No has asignado almacén')
      return
    }

    if (cargando.value) return

    concurrentRequest(
      async () => {
        const response = await Product.searchCode(codigo.value, movimientoActual.almacenOrigenId)
        if (response.data === 'Producto No Encontrado') {
          notify.warning('Producto No Encontrado')
          codigo.value = ''
          return
        }
        productActualId.value = response.data.id
        rellenaProductForm(response.data)
        nextTick(() => document.getElementById('cantidad')?.select())
      },
      cargandoConcurrent,
      {
        onError: (error) => notify.error(error)
      }
    )
  }

  /**
   * Gets product by ID (from dialog selection)
   */
  function getProductById(productId) {
    if (movimientoActual.almacenOrigenId === null) {
      return notify.warning('No has asignado almacén')
    }

    processRequest(
      async () => {
        const response = await Product.showextend(productId, movimientoActual.almacenOrigenId)
        if (response.data === 'Producto No Encontrado') {
          codigo.value = ''
          notify.warning('Producto No Encontrado')
          return
        }

        codigo.value = response.data.codigo
        productActualId.value = response.data.id
        rellenaProductForm(response.data)
        nextTick(() => document.getElementById('cantidad')?.select())
      },
      ref(false),
      {
        onError: (error) => notify.error(error)
      }
    )
  }

  /**
   * Clears all product form fields
   */
  function limpiarCampos() {
    codigo.value = ''
    product_form.name = ''
    product_form.codigo = ''
    product_form.cantidad = ''
    product_form.pcosto = ''
    product_form.precio_sugerido = ''
    product_form.existencia = ''
  }

  // ============ Return ============
  return {
    // State
    codigo,
    productActualId,
    product_form,
    cargando,
    cargandoConcurrent,
    codigoRef,

    // Functions
    rellenaProductForm,
    searchProduct,
    getProductById,
    limpiarCampos
  }
}

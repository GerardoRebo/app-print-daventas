import { ref, reactive, nextTick } from 'vue'
import { useNotification } from './useNotification'
import { useProcessRequest } from './useProcessRequest'
import  PuntoVenta  from '@js/apis/PuntoVenta.js'
import  Product  from '@js/apis/Product'

export function useProductForm(ticketActual, almacen, { onOpenConversion } = {}) {
  // ============ Notifications & Processing ============
  const {notify} = useNotification()
  const { processRequest} = useProcessRequest()

  // ============ State ============
  const codigo = ref('')
  const cargando = ref(false)
  const productActualId = ref(null)
  const productos = ref([])
  
  const product_form = reactive({
    name: '',
    codigo: '',
    cantidad: '',
    pventa: '',
    pcosto: '',
    porcentaje_ganancia: '',
    pventa_base: '',
    precio_mayoreo: '',
    precio_medio_mayoreo: '',
    existencia: ''
  })

  const priceOptions = ref([])
  const isShowPricesOpen = ref(false)
  const openExistencias = ref(false)
  const existencias = ref([])

  // ============ Functions ============

  /**
   * Fills product_form with API response data
   * Applies price_type logic for client pricing
   */
  function rellenaProductForm(response) {
    productActualId.value = response.data.id
    product_form.name = response.data.name
    product_form.codigo = response.data.codigo
    product_form.cantidad = 1
    product_form.pventa = response.data.precio
    product_form.pcosto = response.data.pcosto
    product_form.porcentaje_ganancia = response.data.porcentaje_ganancia
    product_form.pventa_base = response.data.precio
    product_form.precio_mayoreo = response.data.precio_mayoreo
    product_form.precio_medio_mayoreo = response.data.precio_medio_mayoreo
    product_form.existencia = response.data.cantidad_actual

    priceOptions.value = []

    if (response.data.precio !== null) {
      priceOptions.value.push({
        title: +response.data.precio + ' (Base)',
        value: response.data.precio
      })
    }

    if (response.data.precio_medio_mayoreo !== null) {
      priceOptions.value.push({
        title: response.data.precio_medio_mayoreo + ' (Medio Mayoreo)',
        value: response.data.precio_medio_mayoreo
      })
    }

    if (response.data.precio_mayoreo !== null) {
      priceOptions.value.push({
        title: response.data.precio_mayoreo + ' (Mayoreo)',
        value: response.data.precio_mayoreo
      })
    }

    // Apply price_type adjustments
    if (
      ticketActual.price_type === 'medio_mayoreo' &&
      response.data.precio_medio_mayoreo !== null
    ) {
      product_form.pventa = response.data.precio_medio_mayoreo
    }

    if (
      ticketActual.price_type === 'mayoreo' &&
      response.data.precio_mayoreo !== null
    ) {
      product_form.pventa = response.data.precio_mayoreo
    }
  }

  /**
   * Searches product by codigo from POS input
   */
  function searchProduct() {
    if (codigo.value == '') {
      notify.warning('Campo Código Vacio')
      return
    }

    if (almacen.id == null) {
      notify.warning('No has seleccionado almacen')
      return
    }

    processRequest(
      async () => {
        const response = await Product.searchCode(codigo.value, almacen.id)
        if (response.data == 'Producto No Encontrado') {
          notify.warning('Producto No Encontrado')
          codigo.value = ''
          return
        }
        rellenaProductForm(response)
        if (response.data.tventa === 'G') {
          abrirConversion(response)
          return
        }
        nextTick(() => document.getElementById('cantidad').select())
      },
      cargando,
      {
        onError: (error) => notify.error(error)
      }
    )
  }

  /**
   * Gets product by ID (from dialog selection)
   */
  function getProductById(productId) {
    if (!ticketActual.miAlmacenId) {
      return notify.warning('No has seleccionado almacen')
    }

    processRequest(
      async () => {
        const response = await Product.showextend(productId, ticketActual.miAlmacenId)
        if (response.data == 'Producto No Encontrado') {
          codigo.value = ''
          notify.warning('Producto No Encontrado')
          return
        }
        rellenaProductForm(response)
        codigo.value = response.data.codigo
        if (response.data.tventa === 'G') {
          abrirConversion(response)
          return
        }
        nextTick(() => document.getElementById('cantidad').select())
      },
      cargando,
      {
        onError: (error) => notify.error(error)
      }
    )
  }

  /**
   * Opens conversion modal for bulk products (tventa === 'G')
   */
  function abrirConversion(response) {
    // Call the callback to open the conversion modal from the parent
    if (onOpenConversion) {
      const dataToSend = {
        precioBase: response.data.precio,
        peso: 1,
        total: response.data.precio
      }
      onOpenConversion(dataToSend)
    }
    nextTick(() => document.getElementById('peso')?.select())
  }

  /**
   * Accepts bulk conversion (called from parent via enviarArticulo)
   * @param {Object} conversionData - Contains precioBase, peso, total from conversion modal
   */
  function aceptarConversion(conversionData) {
    if (conversionData) {
      product_form.pventa = conversionData.precioBase
      product_form.cantidad = conversionData.peso
    }
  }

  /**
   * Clears all product form fields
   */
  function emptyValues() {
    codigo.value = ''
    product_form.name = ''
    product_form.codigo = ''
    product_form.cantidad = ''
    product_form.pventa = ''
    product_form.precio_mayoreo = ''
    product_form.existencia = ''
    priceOptions.value = []
  }

  /**
   * Opens prices selection modal
   */
  function showPrices() {
    isShowPricesOpen.value = true
  }

  /**
   * Selects price from modal and applies to forms
   * NOTE: This should NOT be used during granel conversion workflow!
   */
  function usePrice(value) {
    product_form.pventa = value
    isShowPricesOpen.value = false
  }

  /**
   * Opens inventory/existencias modal for selected product
   */
  function abrirExistencias() {
    if (productActualId.value == null) {
      return notify.warning('No has seleccionado un producto')
    }
    
    openExistencias.value = true
    processRequest(
      async () => {
        const response = await PuntoVenta.getExistencias(productActualId.value)
        existencias.value = response.data
      },
      cargando,
      {
        onError: (error) => notify.error(error)
      }
    )
  }

  // ============ Return ============
  return {
    // State
    codigo,
    productActualId,
    productos,
    product_form,
    priceOptions,
    isShowPricesOpen,
    openExistencias,
    existencias,
    cargando,

    // Functions
    rellenaProductForm,
    searchProduct,
    getProductById,
    abrirConversion,
    aceptarConversion,
    emptyValues,
    showPrices,
    usePrice,
    abrirExistencias
  }
}

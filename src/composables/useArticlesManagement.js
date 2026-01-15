import { ref, reactive, computed } from 'vue';
import { useNotification } from './useNotification';
import { useProcessRequest } from './useProcessRequest';

/**
 * Composable para gestión de artículos en tickets/cotizaciones
 * Maneja: crear, editar, eliminar y validar artículos
 * 
 * @param {Object} dependencies - Dependencias inyectadas
 * @param {Reactive} dependencies.ticketActual - Ticket/Cotización actual en edición
 * @param {Reactive} dependencies.product_form - Formulario de producto
 * @param {Ref} dependencies.productActualId - ID del producto seleccionado
 * @param {Object} dependencies.articlesAPI - API para operaciones de artículos (ej: PuntoVenta, Cotizacion)
 * @param {Function} dependencies.emptyValues - Función para vaciar formulario
 * @param {Function} dependencies.getSpecificVT - Función para recargar ticket/cotización
 * @param {Function} dependencies.focusCodigoField - Función para enfocar campo código
 * @param {Object} dependencies.fieldMapping - Mapeo de nombres de campos (ej: { precioField: 'precio_usado' })
 * @returns {Object} Estado y métodos de gestión de artículos
 */
export function useArticlesManagement({
  ticketActual,
  product_form,
  productActualId,
  articlesAPI,
  emptyValues,
  getSpecificVT,
  focusCodigoField,
  fieldMapping = {}
}) {
  // Normalizar field mapping con defaults
  const fields = {
    precioField: fieldMapping.precioField || 'precio_usado', // Default: VentasCreate
    ...fieldMapping
  };
  // Composables
  const { notify } = useNotification();
  const { processRequest } = useProcessRequest();

  // STATE REACTIVO
  const articuloActualId = ref(null);
  const articulo_form = reactive({
    id: null,
    name: '',
    pventa: null,
    cantidad: null,
    ancho: null,
    alto: null
  });
  const edicion = ref(false);
  const openEdit = ref(false);
  const cargando = ref(false);

  // COMPUTED PROPERTIES
  const pventa_porcentaje = computed(() => {
    if (product_form.porcentaje_ganancia == 0) {
      return 0;
    }
    return (
      +product_form.pcosto +
      +product_form.pcosto * (+product_form.porcentaje_ganancia / 100)
    );
  });

  // FUNCIONES DE ARTÍCULOS

  /**
   * Abre el modal de edición con los datos del artículo
   * Wrapper que convierte objeto artículo en parámetros para abrirEdicion
   * Usa el campo de precio según fieldMapping (precio_usado o precio)
   */
  function handleArticleEdit(articulo) {
    const precioValue = articulo[fields.precioField];
    articuloActualId.value = articulo.id;
    articulo_form.id = articulo.id;
    articulo_form.name = articulo.product_name ?? articulo.product?.name;
    articulo_form.pventa = precioValue;
    articulo_form.cantidad = articulo.cantidad;
    articulo_form.ancho = articulo.ancho;
    articulo_form.alto = articulo.alto;
    edicion.value = true;
  }

  /**
   * Inicializa el formulario de edición y abre el modal
   */
  function abrirEdicion(id, name, pventa, cantidad, ancho, alto) {
    articuloActualId.value = id;
    articulo_form.id = id;
    articulo_form.name = name;
    articulo_form.pventa = pventa;
    articulo_form.cantidad = cantidad;
    articulo_form.ancho = ancho;
    articulo_form.alto = alto;
    edicion.value = true;
  }

  /**
   * Edita un artículo existente del ticket
   * Realiza llamada API y recarga el ticket
   */
  function editarArticulo(updatedArticulo) {
    processRequest(
      async () => {
        const payload = updatedArticulo || articulo_form;
        const response = await articlesAPI.update(
          articuloActualId.value,
          ticketActual.id,
          payload
        );
        cargando.value = false;

        if (response.data == 'No inventario') {
          notify.warning('No hay suficiente inventario');
          return;
        }

        edicion.value = false;
        await getSpecificVT(ticketActual.id);
      },
      cargando,
      {
        onSuccess: () => notify.success('Artículo actualizado'),
        onError: (error) => notify.error(error),
        onFinally: () => {
          openEdit.value = false;
          focusCodigoField();
        }
      }
    );
  }

  /**
   * Agrega un artículo nuevo al ticket
   * Realiza validaciones de inventario, precio y existencias
   */
  async function enviarArticulo() {
    // Validación de datos requeridos
    if (
      productActualId.value == null ||
      ticketActual.id == null ||
      ticketActual.miAlmacenId == null ||
      product_form.pventa == null ||
      product_form.cantidad == null ||
      product_form.cantidad == ''
    ) {
      return notify.warning('Falta determinar: precio o cantidad ');
    }

    // Validación de existencia
    if (product_form.existencia == null || product_form.existencia == '0.00') {
      focusCodigoField();
      return notify.warning('Producto sin existencia');
    }

    // Validaciones de precio (con alertas)
    if (+product_form.pventa <= +product_form.pcosto) {
      alert('Revisar Precio Menor Que Costo');
    } else if (
      +pventa_porcentaje.value != 0 &&
      +product_form.pventa < +pventa_porcentaje.value
    ) {
      alert(
        'Revisar!! Precio Menor del Sugerido, Precio Sugerido: $' +
          pventa_porcentaje.value
      );
    }

    processRequest(
      async () => {
        const { data } = await articlesAPI.register(
          productActualId.value,
          ticketActual.id,
          product_form
        );
        cargando.value = false;
        await getSpecificVT(ticketActual.id);
        emptyValues();
        focusCodigoField();
      },
      cargando,
      {
        onSuccess: () => notify.success('Artículo agregado')
      }
    );
  }

  /**
   * Elimina un artículo del ticket
   * Realiza llamada API y recarga el ticket
   */
  function destroyArticulo(articulo) {
    processRequest(
      async () => {
        await articlesAPI.destroyArticulo(articulo, ticketActual.id);
        cargando.value = false;
        await getSpecificVT(ticketActual.id);
        focusCodigoField();
      },
      cargando,
      {
        onSuccess: () => notify.success('Artículo eliminado'),
        onError: (error) => notify.error(error)
      }
    );
  }

  // RETURN - Expone estado y métodos
  return {
    // STATE
    articuloActualId,
    articulo_form,
    edicion,
    openEdit,
    cargando,

    // COMPUTED
    pventa_porcentaje,

    // METHODS
    handleArticleEdit,
    abrirEdicion,
    editarArticulo,
    enviarArticulo,
    destroyArticulo
  };
}

import { ref, reactive, computed } from 'vue';
import { useNotification } from '../useNotification';
import { useProcessRequest } from '../useProcessRequest';

/**
 * Composable para gestión de artículos en movimientos de inventario
 * Maneja: crear, editar, eliminar y validar artículos de movimientos
 * Específico para Compra, Transferencia y Solicitud Transferencia
 * 
 * @param {Object} dependencies - Dependencias inyectadas
 * @param {Reactive} dependencies.movimientoActual - Movimiento actual en edición
 * @param {Reactive} dependencies.product_form - Formulario de producto
 * @param {Ref} dependencies.productActualId - ID del producto seleccionado
 * @param {Object} dependencies.movimientosAPI - API para operaciones de movimientos
 * @param {Function} dependencies.emptyValues - Función para vaciar formulario
 * @param {Function} dependencies.getSpecificVT - Función para recargar movimiento
 * @param {Function} dependencies.focusCodigoField - Función para enfocar campo código
 * @returns {Object} Estado y métodos de gestión de artículos en movimientos
 */
export function useMovementArticlesManagement({
  movimientoActual,
  product_form,
  productActualId,
  movimientosAPI,
  emptyValues,
  getSpecificVT,
  focusCodigoField,
}) {
  // Composables
  const { notify } = useNotification();
  const { processRequest } = useProcessRequest();

  // STATE REACTIVO - Específico para movimientos
  const articuloActualId = ref(null);
  const articulo_form = reactive({
    name: "",
    cantidadActual: null,
    cantidad: null,
    pcosto: null,
    ucosto: null,
    pventa: null,
    precio_medio_mayoreo: null,
    precio_medio_mayoreo_nuevo: null,
    precio_mayoreo: null,
    precio_mayoreo_nuevo: null,
  });
  const edicion = ref(false);
  const openEdit = ref(false);
  const openCambiaPrecio = ref(false);
  const cargando = ref(false);

  // COMPUTED PROPERTIES - Movimiento específicas
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
   * Abre el modal de edición con datos del artículo
   * Mapea los campos del artículo al formulario local
   */
  function handleArticleEdit(articulo) {
    articuloActualId.value = articulo.id;
    articulo_form.name = articulo.name;
    articulo_form.cantidadActual = articulo.cantidad_actual;
    articulo_form.cantidad = articulo.cantidad_ordenada;
    articulo_form.pcosto = articulo.costo_al_ordenar;
    articulo_form.ucosto = articulo.costo_al_recibir;
    articulo_form.pventa = articulo.precio_usado;
    articulo_form.precio_medio_mayoreo = articulo.precio_medio_mayoreo;
    articulo_form.precio_mayoreo = articulo.precio_mayoreo;
    edicion.value = true;
    openEdit.value = true;
  }

  /**
   * Inicializa el formulario de edición de precios
   * Abre el diálogo para cambios de precio general (todos los artículos)
   */
  function abrirCambioPrecio() {
    if (!productActualId.value) {
      notify.warning("No has seleccionado un producto");
      return;
    }
    
    articulo_form.cantidad = product_form.pventa;
    articulo_form.precio_medio_mayoreo_nuevo = product_form.precio_medio_mayoreo;
    articulo_form.precio_mayoreo_nuevo = product_form.precio_mayoreo;
    openCambiaPrecio.value = true;
  }

  /**
   * Edita un artículo existente del movimiento
   * Realiza llamada API y recarga el movimiento
   */
  function editarArticulo(updatedArticulo) {
    processRequest(
      async () => {
        const payload = updatedArticulo || articulo_form;
        const response = await movimientosAPI.update(
          articuloActualId.value,
          movimientoActual.id,
          payload
        );
        cargando.value = false;

        if (response.data === 'No inventario') {
          notify.warning('No hay suficiente inventario');
          return;
        }

        edicion.value = false;
        openEdit.value = false;
        await getSpecificVT(movimientoActual.id);
        focusCodigoField();
      },
      cargando,
      {
        onSuccess: () => notify.success('Artículo actualizado'),
        onError: (error) => notify.error(error),
      }
    );
  }

  /**
   * Agrega un artículo nuevo al movimiento
   * Validaciones: inventario, precio, existencias
   * Específico para Compra, Transferencia y Solicitud
   * Si el costo cambió en el servidor, abre diálogo para confirmar cambios de precio
   */
  async function enviarArticulo() {
    // Validación de datos requeridos
    if (
      productActualId.value == null ||
      movimientoActual.id == null ||
      movimientoActual.almacenOrigenId == null ||
      product_form.pcosto == null ||
      product_form.cantidad == null ||
      product_form.cantidad === ''
    ) {
      return notify.warning('Falta determinar: precio o cantidad');
    }

    // Validación de existencia (según tipo de movimiento)
    if (movimientoActual.tipo === 'C') {
      // Compra: validar que haya cantidad
      if (product_form.cantidad <= 0) {
        return notify.warning('Cantidad debe ser mayor a 0');
      }
    } else if (movimientoActual.tipo === 'T' || movimientoActual.tipo === 'S') {
      // Transferencia/Solicitud: validar existencia
      if (product_form.existencia == null || product_form.existencia === '0.00') {
        focusCodigoField();
        return notify.warning('Producto sin existencia');
      }
    }

    processRequest(
      async () => {
        const { data } = await movimientosAPI.register(
          productActualId.value,
          movimientoActual.id,
          product_form
        );
        cargando.value = false;

        if (data === 'No inventario') {
          notify.warning('No hay suficiente inventario');
          return;
        }

        // Chequear si el costo cambió en el servidor
        // data = [ucosto, pcosto, precios] si hay cambio
        if (data && Array.isArray(data) && data[0] !== data[1]) {
          // Cargar precios actualizados del servidor
          articulo_form.ucosto = data[0];
          articulo_form.pcosto = data[1];
          articulo_form.pventa = data[2].precio;
          articulo_form.precio_mayoreo = data[2].precio_mayoreo;
          articulo_form.precio_mayoreo_nuevo = data[2].precio_mayoreo;
          articulo_form.precio_medio_mayoreo = data[2].precio_medio_mayoreo;
          articulo_form.precio_medio_mayoreo_nuevo = data[2].precio_medio_mayoreo;
          openCambiaPrecio.value = true;
        } else {
          // Sin cambios de costo, proceder normalmente
          await getSpecificVT(movimientoActual.id);
          emptyValues();
          focusCodigoField();
        }
      },
      cargando,
      {
        onSuccess: () => data => {
          if (data !== 'No inventario' && (!Array.isArray(data) || data[0] === data[1])) {
            notify.success('Artículo agregado');
          }
        },
        onError: (error) => notify.error(error)
      }
    );
  }

  /**
   * Elimina un artículo del movimiento
   * Realiza llamada API y recarga el movimiento
   */
  function destroyArticulo(articulo) {
    processRequest(
      async () => {
        await movimientosAPI.destroyArticulo(articulo, movimientoActual.id);
        cargando.value = false;
        await getSpecificVT(movimientoActual.id);
        focusCodigoField();
      },
      cargando,
      {
        onSuccess: () => notify.success('Artículo eliminado'),
        onError: (error) => notify.error(error)
      }
    );
  }

  /**
   * Maneja cambio de precio para un artículo individual
   * Mapea valores del diálogo de precio al formulario
   */
  function handlePriceSingle(prices) {
    articulo_form.cantidad = prices.newPrice;
    articulo_form.precio_medio_mayoreo_nuevo = prices.newMedio;
    articulo_form.precio_mayoreo_nuevo = prices.newMayoreo;
    cambiaPrecio();
  }

  /**
   * Realiza cambio de precio para artículo individual
   * Valida que precios no sean mayores que precio base
   */
  function cambiaPrecio() {
    if (+articulo_form.cantidad < +articulo_form.precio_medio_mayoreo_nuevo ||
      +articulo_form.cantidad < +articulo_form.precio_mayoreo_nuevo
    ) {
      if (articulo_form.cantidad !== null && +articulo_form.cantidad < +articulo_form.precio_mayoreo_nuevo) {
        articulo_form.precio_mayoreo_nuevo = articulo_form.cantidad;
      }
      if (articulo_form.cantidad !== null && +articulo_form.cantidad < +articulo_form.precio_medio_mayoreo_nuevo) {
        articulo_form.precio_medio_mayoreo_nuevo = articulo_form.cantidad;
      }
      notify.error('Error, los precios mayoreo no pueden ser mas altos que el precio base');
      return;
    }

    processRequest(
      async () => {
        const { data } = await movimientosAPI.cambiaPrecio(
          articulo_form.cantidad,
          articulo_form.precio_medio_mayoreo_nuevo,
          articulo_form.precio_mayoreo_nuevo,
          productActualId.value,
          movimientoActual.almacenOrigenId
        );
        cargando.value = false;
        openCambiaPrecio.value = false;
        articulo_form.cantidad = null;
        await getSpecificVT(movimientoActual.id);
      },
      cargando,
      {
        onSuccess: () => notify.success('Precio actualizado'),
        onError: (error) => notify.error(error),
        onFinally: () => focusCodigoField()
      }
    );
  }

  /**
   * Maneja cambio de precio general para todos los artículos
   * Mapea valores del diálogo de precio al formulario
   */
  function handlePriceGeneral(prices) {
    articulo_form.cantidad = prices.newPrice;
    articulo_form.precio_medio_mayoreo_nuevo = prices.newMedio;
    articulo_form.precio_mayoreo_nuevo = prices.newMayoreo;
    cambioPrecioGeneralLogic();
  }

  /**
   * Realiza cambio de precio general para todos los artículos del movimiento
   * Valida que precios no sean mayores que precio base
   */
  function cambioPrecioGeneralLogic() {
    if (+articulo_form.cantidad < +articulo_form.precio_medio_mayoreo_nuevo ||
      +articulo_form.cantidad < +articulo_form.precio_mayoreo_nuevo
    ) {
      if (articulo_form.cantidad !== null && +articulo_form.cantidad < +articulo_form.precio_mayoreo_nuevo) {
        articulo_form.precio_mayoreo_nuevo = articulo_form.cantidad;
      }
      if (articulo_form.cantidad !== null && +articulo_form.cantidad < +articulo_form.precio_medio_mayoreo_nuevo) {
        articulo_form.precio_medio_mayoreo_nuevo = articulo_form.cantidad;
      }
      notify.error('Error, los precios mayoreo no pueden ser mas altos que el precio base');
      return;
    }

    processRequest(
      async () => {
        await movimientosAPI.cambioPrecioGeneral(
          articulo_form.cantidad,
          articulo_form.precio_medio_mayoreo_nuevo,
          articulo_form.precio_mayoreo_nuevo,
          productActualId.value,
          movimientoActual.almacenOrigenId
        );
        cargando.value = false;
        openCambiaPrecio.value = false;
        articulo_form.cantidad = null;
        await getSpecificVT(movimientoActual.id);
      },
      cargando,
      {
        onSuccess: () => notify.success('Precios actualizados'),
        onError: (error) => notify.error(error),
        onFinally: () => focusCodigoField()
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
    openCambiaPrecio,
    cargando,

    // COMPUTED
    pventa_porcentaje,

    // METHODS
    handleArticleEdit,
    abrirCambioPrecio,
    editarArticulo,
    enviarArticulo,
    destroyArticulo,
    handlePriceSingle,
    cambiaPrecio,
    handlePriceGeneral,
    cambioPrecioGeneralLogic
  };
}

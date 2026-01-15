import { ref, reactive, computed, nextTick } from 'vue';
import Movimientos from '@js/apis/Movimientos';
import { useNotification } from './useNotification';
import { useProcessRequest } from './useProcessRequest';
import { useMovementProductSearch } from './useMovementProductSearch';

export function useMovementProductForm(movimientoActual, almacen) {
  const { notify } = useNotification();
  const { processRequest } = useProcessRequest();

  // Use the existing product search composable
  const {
    codigo,
    productActualId,
    product_form,
    codigoRef,
    searchProduct,
    getProductById,
    limpiarCampos,
  } = useMovementProductSearch(movimientoActual, almacen);

  // Extended form for movement-specific data
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

  const openCambiaPrecio = ref(false);
  const errors = ref([]);

  // Functions
  function abrirEdicion(id, name, pcosto, cantidad) {
    articulo_form.name = name;
    articulo_form.pcosto = pcosto;
    articulo_form.cantidad = cantidad;
  }

  function editarArticulo(onSuccess) {
    processRequest(async () => {
      const response = await Movimientos.update(
        productActualId.value,
        movimientoActual.id,
        articulo_form
      );
      
      if (response.data === "No Inventario") {
        notify.warning("No hay suficiente inventario");
        return;
      }

      if (response.data && response.data[0] != response.data[1]) {
        articulo_form.ucosto = response.data[0];
        articulo_form.pcosto = response.data[1];
        articulo_form.pventa = response.data[2].precio;
        articulo_form.precio_mayoreo = response.data[2].precio_mayoreo;
        articulo_form.precio_mayoreo_nuevo = response.data[2].precio_mayoreo;
        articulo_form.precio_medio_mayoreo = response.data[2].precio_medio_mayoreo;
        articulo_form.precio_medio_mayoreo_nuevo = response.data[2].precio_medio_mayoreo;
        articulo_form.cantidad = null;
        productActualId.value = response.data[2].product_id;
        openCambiaPrecio.value = true;
        await nextTick(() => codigoRef.value?.select());
      }
      
      if (onSuccess) onSuccess();
    }, ref(false), {
      errorsRef: errors,
      onError: (error) => notify.error(error)
    });
  }

  function enviarArticulo(onSuccess) {
    if (
      productActualId.value == null ||
      movimientoActual.id == null ||
      articulo_form.pcosto == null ||
      articulo_form.cantidad == null
    ) {
      notify.warning("Algun Valor Nulo");
      return;
    }

    processRequest(async () => {
      const { data } = await Movimientos.register(
        productActualId.value,
        movimientoActual.id,
        articulo_form
      );
      
      if (data === "No Inventario") {
        notify.warning("No hay suficiente Inventario");
        return;
      }

      if (data && data[0] != data[1]) {
        articulo_form.ucosto = data[0];
        articulo_form.pcosto = data[1];
        articulo_form.pventa = data[2].precio;
        articulo_form.precio_mayoreo = data[2].precio_mayoreo;
        articulo_form.precio_mayoreo_nuevo = data[2].precio_mayoreo;
        articulo_form.precio_medio_mayoreo = data[2].precio_medio_mayoreo;
        articulo_form.precio_medio_mayoreo_nuevo = data[2].precio_medio_mayoreo;
        openCambiaPrecio.value = true;
        await nextTick(() => codigoRef.value?.focus());
      }
      
      if (onSuccess) onSuccess();
    }, ref(false), {
      errorsRef: errors,
      onError: (error) => notify.error(error)
    });
  }

  function handlePriceSingle(prices) {
    articulo_form.cantidad = prices.newPrice;
    articulo_form.precio_medio_mayoreo_nuevo = prices.newMedio;
    articulo_form.precio_mayoreo_nuevo = prices.newMayoreo;
    cambiaPrecio();
  }

  function cambiaPrecio() {
    if (
      +articulo_form.cantidad < +articulo_form.precio_medio_mayoreo_nuevo ||
      +articulo_form.cantidad < +articulo_form.precio_mayoreo_nuevo
    ) {
      if (
        articulo_form.cantidad !== null &&
        +articulo_form.cantidad < +articulo_form.precio_mayoreo_nuevo
      ) {
        articulo_form.precio_mayoreo_nuevo = articulo_form.cantidad;
      }
      if (
        articulo_form.cantidad !== null &&
        +articulo_form.cantidad < +articulo_form.precio_medio_mayoreo_nuevo
      ) {
        articulo_form.precio_medio_mayoreo_nuevo = articulo_form.cantidad;
      }
      notify.error(
        "Error, los precios mayoreo no pueden ser mas altos que el precio base"
      );
      return;
    }

    processRequest(
      async () => {
        await Movimientos.cambiaPrecio(
          articulo_form.cantidad,
          articulo_form.precio_medio_mayoreo_nuevo,
          articulo_form.precio_mayoreo_nuevo,
          productActualId.value,
          movimientoActual.almacenOrigenId
        );
        openCambiaPrecio.value = false;
        articulo_form.cantidad = null;
      },
      ref(false),
      {
        errorsRef: errors,
        onError: (error) => notify.error(error)
      }
    );
  }

  function handlePriceGeneral(prices) {
    articulo_form.cantidad = prices.newPrice;
    articulo_form.precio_medio_mayoreo_nuevo = prices.newMedio;
    articulo_form.precio_mayoreo_nuevo = prices.newMayoreo;
    cambiaPrecioGeneral();
  }

  function cambiaPrecioGeneral() {
    if (
      +articulo_form.cantidad < +articulo_form.precio_medio_mayoreo_nuevo ||
      +articulo_form.cantidad < +articulo_form.precio_mayoreo_nuevo
    ) {
      if (
        articulo_form.cantidad !== null &&
        +articulo_form.cantidad < +articulo_form.precio_mayoreo_nuevo
      ) {
        articulo_form.precio_mayoreo_nuevo = articulo_form.cantidad;
      }
      if (
        articulo_form.cantidad !== null &&
        +articulo_form.cantidad < +articulo_form.precio_medio_mayoreo_nuevo
      ) {
        articulo_form.precio_medio_mayoreo_nuevo = articulo_form.cantidad;
      }
      notify.error(
        "Error, los precios mayoreo no pueden ser mas altos que el precio base"
      );
      return;
    }

    processRequest(
      async () => {
        await Movimientos.cambioPrecioGeneral(
          articulo_form.cantidad,
          articulo_form.precio_medio_mayoreo_nuevo,
          articulo_form.precio_mayoreo_nuevo,
          productActualId.value,
          movimientoActual.almacenOrigenId
        );
        openCambiaPrecio.value = false;
        articulo_form.cantidad = null;
      },
      ref(false),
      {
        onError: (error) => notify.error(error)
      }
    );
  }

  return {
    // From useMovementProductSearch
    codigo,
    productActualId,
    product_form,
    codigoRef,
    searchProduct,
    getProductById,
    limpiarCampos,

    // Movement-specific form
    articulo_form,
    openCambiaPrecio,
    errors,

    // Functions
    abrirEdicion,
    editarArticulo,
    enviarArticulo,
    handlePriceSingle,
    cambiaPrecio,
    handlePriceGeneral,
    cambioPrecioGeneral: cambioPrecioGeneral,
  };
}

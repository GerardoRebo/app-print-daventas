import Api from "./Api";

export default {
  cloneVentaToCotizacion(data) {
    return Api().post("/document-template/venta-to-cotizacion", data);
  },
};

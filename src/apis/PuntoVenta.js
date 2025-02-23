import Api from "./Api";
import ApiBlob from "./ApiBlob";

export default {
  getAll() {
    return Api().get("/puntoventa/ventaticket");
  },
  getSpecificVT(ventaticket) {
    return Api().get("/puntoventa/specific", {
      params: {
        ventaticket,
      },
    });
  },
  getLastTicket(ventaticket) {
    return Api().get("/puntoventa/lastTicket");
  },
  getMisVentas(page, dfecha, hfecha) {
    return Api().get("/puntoventa/misventas", {
      params: {
        page,
        dfecha,
        hfecha,
      },
    });
  },
  getAllPendientes() {
    return Api().get("/puntoventa/pendientes");
  },
  setPendiente(ventaticket) {
    return Api().get(`/puntoventa/setpendiente`, {
      params: {
        ventaticket,
      },
    });
  },
  guardarVenta(ventaticket, forma_pago, credito) {
    return Api().post("/puntoventa/guardarventa", {
      ventaticket,
      forma_pago,
      credito,
    });
  },
  acceptRetentionRules(ventaticket) {
    return Api().post(`/puntoventa/acceptRetentionRules/` + ventaticket);
  },
  sendVentaToWha(ventaticket, telefono) {
    return Api().post("/puntoventa/sendVentaToWha/" + ventaticket, {
      telefono,
    });
  },

  getExistencias(productId) {
    return Api().get("/puntoventa/getexistencias", {
      params: {
        productId,
      },
    });
  },
  asignarAlmacen(ventaticket, almacen) {
    return Api().get("/puntoventa/asignaralmacen", {
      params: {
        ventaticket: ventaticket,
        almacen: almacen,
      },
    });
  },
  register(productActualId, ticketActual, product_form) {
    return Api().post("/puntoventa/register", {
      params: {
        productActualId: productActualId,
        ticketActual: ticketActual,
        precio: product_form.pventa,
        cantidad: product_form.cantidad,
      },
    });
  },
  destroyArticulo(articulo, ventaticket) {
    return Api().post("/puntoventa/destroyarticulo", {
      params: {
        articulo,
        ventaticket,
      },
    });
  },
  update(articulo, ventaticket, articulo_form) {
    return Api().post("/puntoventa/update", {
      params: {
        articulo,
        ventaticket,
        precio: articulo_form.pventa,
        cantidad: articulo_form.cantidad,
      },
    });
  },
  borrarTicket(ventaticket) {
    return Api().post("/puntoventa/borrarticket", {
      params: {
        ventaticket,
      },
    });
  },
  setNombreTicket(ticket, nombre) {
    return Api().post("/puntoventa/setnombreticket", {
      params: {
        nombre,
        ticket,
      },
    });
  },
  cancelarVenta(ticket) {
    return Api().post("/puntoventa/cancelarventa", {
      params: {
        ticket,
      },
    });
  },
  verificarVentas(turno) {
    return Api().post("/puntoventa/verificarVentas", turno);
  },
  getSpecificVTForPrinting(ventaticket) {
    return Api().get("/puntoventa/getSpecificVTForPrinting/" + ventaticket);
  },
  syncLocalVentas(post) {
    return Api().post("/puntoventa/syncLocalVentas/", { tickets: post });
  },
  facturar(ticket, post) {
    return Api().post("/puntoventa/facturar/" + ticket, post);
  },
  descargarXml(ticket) {
    return Api().get("/puntoventa/descargarXml/" + ticket);
  },
  descargarPdf(ticket) {
    return ApiBlob().get("/puntoventa/descargarPdf/" + ticket);
  },
};

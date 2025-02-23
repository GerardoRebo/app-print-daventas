import Api from "./Api";
import ApiBlob from "./ApiBlob";
let baseRoute = "cotizacion";

export default {
    getAll() {
        return Api().get(`/${baseRoute}/cotizacion`);
    },
    getSpecificVT(cotizacion) {

        return Api().get(`/${baseRoute}/specific`, {
            params: {
                cotizacion
            }
        });
    },
    getMisVentas(page, dfecha, hfecha) {

        return Api().get(`/${baseRoute}/misventas`, {
            params: {
                page,
                dfecha,
                hfecha
            }
        });
    },
    getAllPendientes() {

        return Api().get(`/${baseRoute}/pendientes`)
    },
    setPendiente(cotizacion) {
        return Api().get(`/${baseRoute}/setpendiente`, {
            params: {

                cotizacion
            }
        })

    },
    setCliente(cliente, cotizacion) {
        return Api().post(`/${baseRoute}/setcliente`, {
                cliente,
                cotizacion
        })

    },
    guardarVenta(cotizacion, pagocon, credito) {
        return Api().post(`/${baseRoute}/guardarventa`, {
            cotizacion,
            pagocon,
            credito
        })
    },
    archivar(cotizacion) {
        return Api().post(`/${baseRoute}/archivar/`+cotizacion)
    },
    enviarCopia(cotizacion) {
        return Api().post(`/${baseRoute}/enviarCopia`+cotizacion, {
            telefono
        })
    },
    // sendVentaToWha(cotizacion, telefono) {
    //     return Api().post(`/${baseRoute}/sendVentaToWha/` + cotizacion,
    //         { telefono }
    //     )
    // },

    getExistencias(productId) {

        return Api().get(`/${baseRoute}/getexistencias`, {
            params: {
                productId
            }
        })
    },
    asignarAlmacen(cotizacion, almacen) {

        return Api().get(`/${baseRoute}/asignaralmacen`, {
            params: {
                cotizacion: cotizacion,
                almacen: almacen,
            }
        })
    },
    register(productActualId, ticketActual, product_form) {
        return Api().post(`/${baseRoute}/register`, {
            params: {
                productActualId: productActualId,
                ticketActual: ticketActual,
                precio: product_form.pventa,
                cantidad: product_form.cantidad,
            }
        })

    },
    destroyArticulo(articulo, cotizacion) {
        return Api().post(`/${baseRoute}/destroyarticulo`, {
            params: {
                articulo,
                cotizacion
            }
        })

    },
    update(articulo, cotizacion, articulo_form) {
        return Api().post(`/${baseRoute}/update`, {
            params: {
                articulo,
                cotizacion,
                precio: articulo_form.pventa,
                cantidad: articulo_form.cantidad
            }
        })

    },
    borrarTicket(cotizacion) {
        return Api().post(`/${baseRoute}/borrarticket`, {
            params: {
                cotizacion
            }
        })

    },
    setNombreTicket(ticket, nombre) {
        return Api().post(`/${baseRoute}/setnombreticket`, {
            params: {
                nombre,
                ticket
            }
        })

    },
    cancelarVenta(ticket) {
        return Api().post(`/${baseRoute}/cancelarventa`, {
            params: {
                ticket
            }
        })

    },
    verificarVentas(turno) {
        return Api().post(`/${baseRoute}/verificarVentas`, turno)

    },
    getSpecificVTForPrinting(cotizacion) {
        return Api().get(`/${baseRoute}/getSpecificVTForPrinting/` + cotizacion)
    },
    syncLocalVentas(post) {
        return Api().post(`/${baseRoute}/syncLocalVentas/`, { tickets: post })
    },
}
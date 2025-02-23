import Api from "./Api";

export default {
    getSpecificDevolucion(ventaticket) {
        return Api().get("/devolucion/specificDevolucion", {
            params: {
                ventaticket
            }
        });
    },
    getSpecificTicketForPrinting(ventaticket) {
        return Api().get("/devolucion/getSpecificTicketForPrinting/" + ventaticket);
    },
    getMisDevoluciones(page, dfecha, hfecha) {
        return Api().get("/devolucion/misDevoluciones", {
            params: {
                page,
                dfecha,
                hfecha
            }
        });
    },
    eliminarDevolucion(devolucion) {
        return Api().post("/devolucion/eliminarDevolucion", {
            devolucion,
        })

    },
    enviarArticuloDevolucion(devolucion, articulo, cantidad) {
        return Api().post("/devolucion/enviarArticuloDevolucion", {
            devolucion,
            articulo,
            cantidad
        })

    },
    realizarDevolucion(ticket) {
        return Api().post("/devolucion/realizardevolucion", {
            ticket,
        })

    },
    createDevolucion(venta) {
        return Api().post("/devolucion/createDevolucion", {
            venta,
        })
    },
    eliminarArticuloDevolucion(id) {
        return Api().post("/devolucion/destroyArticulo", {
            id,
        })
    },
}
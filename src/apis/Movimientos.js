import Api from "./Api";

export default {
    getAll() {

        return Api().get("/movimientos/movimiento");
    },
    getOcById(folio) {

        return Api().get("/movimientos/getOcById", {
            params: {
                folio
            }
        });
    },
    getSpecificVT(movimiento) {

        return Api().get("/movimientos/specific", {
            params: {
                movimiento
            }
        });
    },
    getSpecificTicketForPrinting(ticket) {
        return Api().get("/movimientos/getSpecificTicketForPrinting/" + ticket);
    },
    getMisMovimientos(page, dfecha, hfecha, estadomovimiento, proveedor, almacen) {

        return Api().get("/movimientos/mismovimientos", {
            params: {
                page,
                dfecha,
                hfecha,
                estadomovimiento,
                proveedor,
                almacen
            }
        });
    },
    // getArticulos(movimiento, almacen) {

    //     return Api().get("/movimientos/articulos", {
    //         params: {
    //             almacen,
    //             movimiento
    //         }
    //     })
    // },
    getAllPendientes() {

        return Api().get("/movimientos/pendientes")
    },
    setPendiente(movimiento) {
        return Api().get(`/movimientos/setpendiente`, {
            params: {
                movimiento
            }
        })

    },
    setProveedor(proveedor, movimiento) {
        return Api().post(`/movimientos/setproveedor`, {
            params: {
                proveedor,
                movimiento
            }
        })

    },
    guardar(movimiento, tipo) {

        return Api().post("/movimientos/guardar", {
            movimiento,
            tipo,
        })
    },
    getExistencias(productId) {

        return Api().get("/movimientos/getexistencias", {
            params: {
                productId
            }
        })
    },
    asignarAlmacen(movimiento, almacen, almacenDestino) {

        return Api().get("/movimientos/asignaralmacen", {
            params: {
                movimiento,
                almacen,
                almacenDestino
            }
        })
    },
    register(productActualId, movimiento, product_form) {
        return Api().post("/movimientos/register", {
            params: {
                productActualId,
                movimiento,
                precio: product_form.pcosto,
                cantidad: product_form.cantidad,
            }
        })
    },
    destroyArticulo(articulo, movimiento) {
        return Api().post("/movimientos/destroyarticulo", {
            articulo,
            movimiento
        })

    },
    update(articulo, movimiento, articulo_form) {
        return Api().post("/movimientos/update", {
            params: {
                articulo,
                movimiento,
                costo: articulo_form.pcosto,
                cantidad: articulo_form.cantidad
            }
        })

    },
    borrarTicket(movimiento) {
        return Api().post("/movimientos/borrarticket", {
            movimiento
        })

    },
    setNombreTicket(ticket, nombre) {
        return Api().post("/movimientos/setnombreticket", {
            params: {
                nombre,
                ticket
            }
        })

    },
    setMovimiento(movimiento, tipomovimiento) {
        return Api().post("/movimientos/setmovimiento", {
            params: {
                movimiento,
                tipomovimiento
            }
        })

    },
    cancelarMovimiento(movimiento) {
        return Api().post("/movimientos/cancelarmovimiento", {
            movimiento
        })

    },
    cambiaPrecio(precio, producto, almacen) {
        return Api().post("/movimientos/cambiaprecio", {
            precio,
            producto,
            almacen
        })

    },
    cambiaPrecioGeneral(precio, producto, almacen) {
        return Api().post("/movimientos/cambiaPrecioGeneral", {
            precio,
            producto,
            almacen
        })

    },


}
import Api from "./Api";



export default {
    getAll() {

        return Api().get("/impuestos");
    },
    getTrasladoImpuestos() {
        return Api().get("/impuestos", {
            params: {
                type: 'traslado'
            }
        });
    },
    getMyRetainedTaxes() {

        return Api().get("/impuestos/retained");
    },
    getAllClaves(post) {

        return Api().get("/impuestos/claves", {
            params: post
        });
    },
    updateTypeOfTax(id, post) {
        return Api().put("/impuestos/updateTypeOfTax/" + id, post);
    },
    getAllUnidades(post) {
        return Api().get("/impuestos/unidades", {
            params: post
        });
    },
    register(impuesto_form) {

        return Api().post("/impuestos", impuesto_form);

    },
    show(impuestoId) {

        return Api().get("/impuestos/" + impuestoId)

    },
    showPD(productActualId) {

        return Api().get(`/impuestos/showpd/${productActualId}`)

    },
    agregarD(proveedorActualId, productActualId) {

        return Api().get(`/impuestos/agregard/${proveedorActualId}/${productActualId}`)

    },
    quitarD(proveedorActualId, productActualId) {

        return Api().get(`/impuestos/quitarD/${proveedorActualId}/${productActualId}`)

    },
    update(impuestoActualId, impuesto_form) {

        return Api().put("/impuestos/" + impuestoActualId, impuesto_form)

    },
    updateClave(clave, productId) {

        return Api().put("/impuestos/claves/" + productId, { clave: clave })

    },
    updateUnidad(unidad, productId) {

        return Api().put("/impuestos/unidades/" + productId, { unidad: unidad })

    },
    delete(impuestoId) {

        return Api().delete("/impuestos/" + impuestoId)

    },

}
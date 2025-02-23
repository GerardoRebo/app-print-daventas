import Api from "./Api";

export default {

    habilitarCaja() {
        return Api().get(`/cortes/habilitarcaja`)
    },
    getTurnoActual() {
        return Api().get(`/cortes/getturnoactual`)
    },
    getCorte(id) {
        return Api().get(`/cortes/getCorte/${id}`)
    },
    show(id) {
        return Api().get(`/cortes/${id}`)
    },
    getAcumulados(dfecha, hfecha) {
        return Api().get(`/cortes/getAcumulados`, {
            params: {
                dfecha,
                hfecha
            }
        })
    },
    getMisCortes(page, dfecha, hfecha) {
        return Api().get(`/cortes/getMisCortes`, {
            params: {
                page,
                dfecha,
                hfecha
            }
        })
    },
    getUserMovimientos(turno) {
        return Api().get(`/cortes/getUserMovimientos`, {
            params: {
                turno,
            }
        })
    },
    getMisMovimientos() {
        return Api().get(`/cortes/getMisMovimientos`)
    },
    realizarCorte(cantidad, comments, diferencia) {
        return Api().post(`/cortes/realizarcorte`, {
            cantidad,
            comments,
            diferencia
        })
    },
    realizarMovimiento(tipo, cantidad, comments, concepto) {
        return Api().post(`/cortes/realizarmovimiento`, {
            tipo,
            cantidad,
            comments,
            concepto
        })
    },
    getConceptos(tipo) {
        return Api().post(`/cortes/getconceptos`, {
            params: {
                tipo
            }
        })
    },




}
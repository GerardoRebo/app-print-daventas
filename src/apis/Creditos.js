import Api from "./Api";
import ApiBlob from "./ApiBlob";

export default {

    getCreditos(todos, keyword) {
        return Api().get(`/creditos/getcreditos`, {
            params: {
                todos, 
                keyword
            }
        })
    },
    getClienteInfo(credito) {
        return Api().get(`/creditos/getClienteInfo`, {
            params: {
                credito
            }
        })
    },
    getDeudas(credito, params) {
        return Api().get(`/creditos/${credito}/getdeudas`, {
            params
        })
    },
    getAbonos(deuda) {
        return Api().get(`/creditos/getabonos`, {
            params: {
                deuda
            }
        })
    },
    getAbonosHistorial(cliente, params = {}) {
        return Api().get(`/creditos/${cliente}/getAbonosHistorial`, {
            params
        })
    },
    getAbonosHistorialGeneral(params = {}) {
        return Api().get(`/creditos/allAbonosHistorial`, {
            params
        })
    },
    getSaldo(deuda) {
        return Api().get(`/creditos/getsaldo`, {
            params: {
                deuda
            }
        })
    },
    realizarAbono(deuda, postData) {
        return Api().post(`/creditos/realizarabono/${deuda}`, postData);
    },
    realizarAbonoGlobal(payload) {
        return Api().post(`/creditos/realizarabonoGlobal`, payload);
    },
    facturarAbono(abono, payload) {
        return Api().post(`/creditos/facturarabono/${abono}`, payload);
    },
    cancelarAbono(abono, payload) {
        return Api().post(`/creditos/cancelarabono/${abono}`, payload);
    },
    downloadPdf(abono) {
        return ApiBlob().get("/creditos/downloadPdf/" + abono);
    },
    downloadXml(abono) {
        return ApiBlob().get("/creditos/downloadXml/" + abono);
    },
    regenerarPdf(abono) {
        return ApiBlob().get("/creditos/regenerarPdf/" + abono);
    },

}
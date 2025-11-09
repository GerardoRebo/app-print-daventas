import Api from "./Api";

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
    facturarAbono(abono) {
        return Api().post(`/creditos/facturarabono/${abono}`);
    },
     downloadPdf(abono) {
        return ApiBlob().get("/creditos/downloadPdf/" + abono);
      },
    downloadXml(abono) {
        return ApiBlob().get("/creditos/downloadXml/" + abono);
      },

}
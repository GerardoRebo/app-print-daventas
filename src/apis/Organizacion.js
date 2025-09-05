import Api from "./Api";
import ApiBlob from "./ApiBlob";



export default {
    getMisUsers(organizacionActualId = null) {

        return Api().get("/organizacions/misusers",
            {
                params: {
                    organizacionActualId
                }
            });
    },
    getConfigurations(organizacionActualId = null) {

        return Api().get("/organizacions/configurations")

    },
    preProcesar(facturaInfo) {
        return Api().post("/organizacions/pre_procesar/", facturaInfo);
    },
    timbrarFacturaGlobal(facturaId, postData) {
        return Api().post("/organizacions/timbrarFacturaGlobal/" + facturaId, postData);
    },
    deleteFacturaGlobal(facturaId) {
        return Api().delete("/organizacions/facturas_globales/" + facturaId);
    },
    getGlobalVentatickets(postData) {
        return Api().get("/organizacions/global", {
            params: {
                desde: postData.desde,
                hasta: postData.hasta,
            }
        });
    },
    getFacturas(postData) {
        return Api().get("/organizacions/facturas", {
            params: {
                desde: postData.desde,
                hasta: postData.hasta,
            }
        });
    },
    getFacturasGlobales(postData) {
        return Api().get("/organizacions/facturas_globales", {
            params: {
                desde: postData.desde,
                hasta: postData.hasta,
            }
        });
    },
    facturasGlobalesShow(facturaId, type) {
        return Api().get("/organizacions/facturas_globales/" + facturaId);
    },
    getFoliosSaldo() {
        return Api().get("/organizacions/foliosSaldo/");
    },
    loadFacturacionData() {
        return Api().get("/organizacions/facturacionData/");
    },
    downloadFile(file) {
        return Api().get("excelfile/excelfile/downloadExported/" + file);
    },
    facturasShow(facturaId, type) {
        return Api().get("/organizacions/facturas/" + facturaId, {
            params: {
                type,
            }
        });
    },
    setUserOrganizationNew(organization) {

        return Api().get("/organizacions/setuserorganizationnew",
            {
                params: {
                    organization
                }
            });
    },
    register(organizacion_form) {

        return Api().post("/organizacions", organizacion_form);

    },
    getOrganizations() {
        return Api().get("/organizacions/getorganizations", {
            params: {
            }
        });
    },
    getMyOrganization() {

        return Api().get("/organizacions/getmyorganization");
    },
    update(id, post) {
        return Api().put("/organizacions/" + id, post);
    },
    updateClavePrivadaSat(id, value) {
        return Api().put(`/organizacions/updateClavePrivadaSat/${id}`, { value: value });
    },
    updateClavePrivadaLocal(id, value) {
        return Api().put(`/organizacions/updateClavePrivadaLocal/${id}`, { value: value });
    },
    getSolicitudes() {

        return Api().get("/organizacions/getsolicitudes");
    },
    enviarSolicitud(post) {

        return Api().post("/organizacions/enviarsolicitud", post);
    },
    destroyInvitation(id) {

        return Api().post("/organizacions/destroyInvitation", {
            id
        });
    },
    desvincularUser(userId) {

        return Api().post("/organizacions/desvincularUser", {
            userId
        });
    },
    getTabulares() {

        return Api().get("/organizacions/gettabulares");
    },
    getDescuentos() {

        return Api().get("/organizacions/getDescuentos");
    },
    enviarTabular(index, value) {

        return Api().get("/organizacions/enviartabular", {
            params: {
                index,
                value
            }
        });
    },
    eliminarTabular(index) {

        return Api().get("/organizacions/eliminartabular", {
            params: {
                index,

            }
        });
    },
    uploadLogo(file) {
        return Api().post("/organizacions/uploadLogo", file);
    },
    uploadKey(file) {

        return Api().post("/organizacions/uploadKey", file);
    },
    uploadCer(file) {

        return Api().post("/organizacions/uploadCer", file);
    },
    descargarXml(ticket) {
        return Api().get("/organizacions/descargarXml/" + ticket)
    },
    descargarPdf(ticket) {
        return ApiBlob().get("/organizacions/descargarPdf/" + ticket)
    }
}
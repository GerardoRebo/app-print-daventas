import Api from "./Api";

const resource = 'products'
export default {
    store(productId, taxId, venta, compra) {
        return Api().post(`/${resource}/${productId}/taxes/${taxId}`, {
            venta,
            compra
        });
    },
    update(taxId, venta, compra) {
        return Api().put(`/${resource}/taxes/${taxId}`, {
            venta,
            compra
        });
    }
}
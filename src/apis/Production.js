import Api from "./Api";
const base = "production_orders";

export default {
  index() {
    return Api().get(`${base}/`, {});
  },
  updateState(productionOrder, payload) {
    return Api().put(`${base}/${productionOrder}`, payload);
  },
  storeConsumibleGenerico(productionOrder, payload) {
    return Api().post(
      `${base}/${productionOrder}/storeConsumibleGenerico`,
      payload
    );
  },
};

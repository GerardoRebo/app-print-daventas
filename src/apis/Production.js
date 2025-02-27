import Api from "./Api";
const base = "production_orders";

export default {
  index() {
    return Api().get(`${base}/`, {});
  },
};

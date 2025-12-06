import Api from "./Api";

export default {

    index({ params }) {
        return Api().get(`/gastos`, { params });
    },
}
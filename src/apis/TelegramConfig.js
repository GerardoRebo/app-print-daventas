import Api from "./Api";

export default {
  getAll() {
    return Api().get("/telegram");
  },

  store(data) {
    return Api().post("/telegram", data);
  },

  update(id, data) {
    return Api().put(`/telegram/${id}`, data);
  },

  delete(id) {
    return Api().delete(`/telegram/${id}`);
  },

  sendTest(id) {
    return Api().post(`/telegram/${id}/test`);
  }
};

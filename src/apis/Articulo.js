import Api from "./Api";

export default {
  attachFiles(articuloId, formData) {
    return Api().post(`/articulos/${articuloId}/files/`, formData);
  },
  deleteFile(articuloId) {
    return Api().delete(`/articulos_files/${articuloId}`);
  },
  updateArticuloDescription(articuloId, description) {
    return Api().put(`/puntoventa/articulo/${articuloId}/description`, {description});
  },
  getFiles(articuloId) {
    return Api().get(`/articulos/${articuloId}/files/`);
  },
}
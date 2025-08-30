import Api from "./Api";
import ApiBlob from "./ApiBlob";

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
  downloadFile(fileId) {
    return ApiBlob().get(`/articulos/files/${fileId}/download`);
  },
  retocarImagen(fileId) {
    return Api().post(`/articulos/files/${fileId}/retocar`);
  },
  crearAnimacion(fileId) {
    return Api().post(`/articulos/files/${fileId}/animate`);
  },
  checkStatusAnimations(fileId) {
    return Api().post(`/articulos/files/${fileId}/checkStatusAnimations`);
  },
}
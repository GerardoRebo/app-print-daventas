import Api from "./Api";

export default {
  // getAll() {

  //     return Api().get("/products");
  // },
  generateDesktopProducts() {
    return Api().post("/products/desktop/");
  },
  getDesktopProducts() {
    return Api().get("/products/desktop/download");
  },
  getComponents(productActualId) {
    return Api().get("/products/getcomponents", {
      params: {
        productActualId,
      },
    });
  },
  getImages(productId) {
    return Api().get(`/products/${productId}/images/`);
  },
  attachImages(productId, formData) {
    return Api().post(`/products/${productId}/images/`, formData);
  },
  eliminarImagen(productId, imageId) {
    return Api().delete(`/products/${productId}/images/${imageId}`);
  },
  agregarComponente(productActualId, productEncontradoId, cantidad) {
    return Api().get("/products/agregarcomponente", {
      params: {
        productActualId,
        productEncontradoId,
        cantidad,
      },
    });
  },
  eliminarComponente(componente) {
    return Api().get("/products/eliminarComponente", {
      params: {
        componente,
      },
    });
  },
  register(product_form) {
    return Api().post("/products", product_form);
  },
  show(productId) {
    return Api().get("/products/" + productId);
  },
  showextend(productId, almacenActualId) {
    return Api().get(`/products/showextend/${productId}/${almacenActualId}`);
  },
  searchCode(codigo, almacenActualId) {
    return Api().get(`/products/searchcode/${codigo}/${almacenActualId}`, {
      params: {
        codigo: codigo,
        almacenActualId: almacenActualId,
      },
    });
  },
  searchCodeSimple(codigo) {
    return Api().get(`/products/searchcodesimple`, {
      params: {
        codigo: codigo,
      },
    });
  },
  showextended(productId) {
    return Api().get(`/products/showextended/${productId}`);
  },
  update(prodcutActualId, product_form) {
    return Api().put("/products/" + prodcutActualId, product_form);
  },
  ajustar(prodcutActualId, almacenActualId, product_form) {
    return Api().put(
      `/products/ajustar/${prodcutActualId}/${almacenActualId}`,
      product_form
    );
  },
  ajustarGeneral(prodcutActualId, almacenActualId, product_form) {
    return Api().put(
      `/products/ajustarGeneral/${prodcutActualId}/${almacenActualId}`,
      product_form
    );
  },
  ajustarMinMax(prodcutActualId, almacenActualId, product_form) {
    return Api().put(
      `/products/ajustarminmax/${prodcutActualId}/${almacenActualId}`,
      product_form
    );
  },
  delete(productId) {
    return Api().delete("/products/" + productId);
  },
  search(
    page,
    keyword,
    almacenActualId,
    departamentoActualId,
    proveedorActualId,
    bajostock,
    prioritario,
    todos
  ) {
    return Api().get(`/products/search/`, {
      params: {
        page,
        keyword,
        almacenActualId,
        departamentoActualId,
        proveedorActualId,
        bajostock,
        prioritario,
        todos,
      },
    });
  },
  searchKeywordSimple(keyword) {
    return Api().get(`/products/searchkeywordsimple`, {
      params: {
        keyword,
      },
    });
  },
  searchKeyWord(keyword, almacenActualId) {
    return Api().get(`/products/searchkeyword`, {
      params: {
        codigo: keyword,
        almacenActualId: almacenActualId,
      },
    });
  },
  getHistorials(page, dfecha, hfecha, almacenActualId, productActualId) {
    return Api().get(`/products/historials`, {
      params: {
        page,
        dfecha,
        hfecha,
        almacenActualId,
        productActualId,
      },
    });
  },
  getHistorialCosto(page, dfecha, hfecha, almacenActualId, productActualId) {
    return Api().get(`/products/historialCosto`, {
      params: {
        page,
        dfecha,
        hfecha,
        almacenActualId,
        productActualId,
      },
    });
  },
  getHistorialPrecio(page, dfecha, hfecha, almacenActualId, productActualId) {
    return Api().get(`/products/historialPrecio`, {
      params: {
        page,
        dfecha,
        hfecha,
        almacenActualId,
        productActualId,
      },
    });
  },
  getDescuentos(id) {
    return Api().get(`/products/getDescuentos`, {
      params: {
        id,
      },
    });
  },
  eliminarDescuento(id) {
    return Api().post(`/products/eliminarDescuento`, {
      params: {
        id,
      },
    });
  },
  enviarDescuento(desde, hasta, porcentaje, id, porcentaje_type) {
    return Api().post(`/products/enviarDescuento`, {
      params: {
        desde,
        hasta,
        porcentaje,
        id,
        porcentaje_type,
      },
    });
  },
};

import Api from "./Api";



export default {
    getAll() {
       
        return Api().get("/proveedors");
    },
    register(proveedor_form) {
       
        return Api().post("/proveedors",proveedor_form);
        
    },
    show(proveedorId) {
       
        return Api().get("/proveedors/" + proveedorId) 
        
    },
    showPP(productActualId) {
       
        return Api().get(`/proveedors/showpp/${productActualId}`) 
        
    },
    agregarP(proveedorActualId,productActualId) {
       
        return Api().get(`/proveedors/agregarp/${proveedorActualId}/${productActualId}`) 
        
    },
    quitarP(proveedorActualId,productActualId) {
       
        return Api().get(`/proveedors/quitarP/${proveedorActualId}/${productActualId}`) 
        
    },
    update(proveedorActualId,proveedor_form) {
       
        return Api().put("/proveedors/" + proveedorActualId,proveedor_form) 
        
    },
    delete(proveedorId) {
       
        return Api().delete("/proveedors/" + proveedorId) 
        
    },
    search(keyword) {
       
        return Api().get("/proveedors/search/" + keyword) 
        
    },

    

}

import Api from "./Api";



export default {
    getAll() {
       
        return Api().get("/departamentos");
    },
    register(departamento_form) {
       
        return Api().post("/departamentos",departamento_form);
        
    },
    show(departamentoId) {
       
        return Api().get("/departamentos/" + departamentoId) 
        
    },
    showPD(productActualId) {
       
        return Api().get(`/departamentos/showpd/${productActualId}`) 
        
    },
    agregarD(proveedorActualId,productActualId) {
       
        return Api().get(`/departamentos/agregard/${proveedorActualId}/${productActualId}`) 
        
    },
    quitarD(proveedorActualId,productActualId) {
       
        return Api().get(`/departamentos/quitarD/${proveedorActualId}/${productActualId}`) 
        
    },
    update(departamentoActualId,departamento_form) {
       
        return Api().put("/departamentos/" + departamentoActualId,departamento_form) 
        
    },
    delete(departamentoId) {
       
        return Api().delete("/departamentos/" + departamentoId) 
        
    },
    search(keyword) {
       
        return Api().get("/departamentos/search/" + keyword) 
        
    },

    

}
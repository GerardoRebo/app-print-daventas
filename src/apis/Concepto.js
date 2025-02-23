import Api from "./Api";



export default {
    getAll() {
       
        return Api().get("/conceptos");
    },
    register(concepto_form) {
       
        return Api().post("/conceptos",concepto_form);
        
    },
    show(conceptoId) {
       
        return Api().get("/conceptos/" + conceptoId) 
        
    },
    update(conceptoActualId,concepto_form) {
       
        return Api().put("/conceptos/" + conceptoActualId,concepto_form) 
        
    },
    delete(conceptoId) {
       
        return Api().delete("/conceptos/" + conceptoId) 
        
    },

}
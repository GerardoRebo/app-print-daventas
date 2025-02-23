import Api from "./Api";



export default {
    getAll(productActualId) {
       
        return Api().get(`/codigos/${productActualId}`);
    },
    
    agregar(codigo,productActualId) {
       
        return Api().get(`/codigos/agregar/${codigo}/${productActualId}`) 
        
    },
    eliminarCodigoEq(codigo) {
       
        return Api().post(`/codigos/eliminar`,{
            params:{
                codigo,
            }
        }) 
        
    },

    

}
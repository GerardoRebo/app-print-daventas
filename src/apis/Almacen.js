import Api from "./Api";

export default {
    getAll() {
       
        return Api().get("/almacens");
    },

    getMyAlmacens() {
       
        return Api().get("almacens/myalmacens");
    },

    getUserAlmacens(userId) {
       
        return Api().get("almacens/useralmacens",{
            params: {
                userId
            }
        });
    },
    attachAlmacen(userId, almacenId) {
       
        return Api().post("almacens/attachalmacen",{
            params: {
                userId,
                almacenId
            }
        });
    },

    detachAlmacen(userId, almacenId) {
       
        return Api().post("almacens/detachalmacen",{
            params: {
                userId,
                almacenId
            }
        });
    },
    register(almacen_form) {
       
        return Api().post("/almacens",almacen_form);
        
    },
    show(almacenId) {
       
        return Api().get("/almacens/" + almacenId) 
        
    },
    update(almacenActualId,almacen_form) {
       
        return Api().put("/almacens/" + almacenActualId,almacen_form) 
        
    },
    delete(almacenId) {
       
        return Api().delete("/almacens/" + almacenId) 
        
    },
    search(keyword) {
       
        return Api().get("/almacens/search/" + keyword) 
        
    },

    

}
import Api from "./Api";



export default {

    getAllClientes(keycliente) {
        return Api().get(`/clients`, {
            params: {
                keycliente
            }
        })

    },
    setCliente(cliente, ventaticket) {
        return Api().post(`/clients/setcliente`, {
            params: {
                cliente,
                ventaticket
            }
        })

    },
    getAll() {

        return Api().get("/clients/allclients");
    },
    register(cliente_form) {

        return Api().post("/clients", cliente_form);

    },
    show(clienteId) {

        return Api().get("/clients/show", {
            params: { clienteId }
        })

    },
    /* showPD(productActualId) {
       
        return Api.get(`/clients/showpd`,{
            params: {
                productActualId
            }
        }) 
        
    }, */
    /* agregarD(proveedorActualId, productActualId) {

        return Api.get(`/clients/agregard`, {
            params: {
                productActualId,
                proveedorActualId
            }
        })

    }, */
    update(clienteActualId, cliente_form) {

        return Api().put("/clients/" + clienteActualId, cliente_form)

    },
    delete(clienteId) {

        return Api().delete("/clients", {
            params: {
                clienteId
            }
        })

    },
    search(keyword) {

        return Api().get("/clients/search", {
            params: {
                keyword
            }
        })

    },



}
import Api from "./Api";

let base = '/retention_rules';

export default {
    index() {
        return Api().get(base);
    },
    store(post){
        return Api().post(base,post);
    },
    update(id,post){
        return Api().put(base + `/${id}`,post);
    },
    delete(id){
        return Api().delete(base + `/${id}`);
    },
}
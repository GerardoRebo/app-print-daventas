import Api from "./Api";


export default {
    import(file) {
        return Api().post("/excelfile/import", file);
    },
    export(desde, hasta, almacen) {
        return Api().post("/excelfile/export", {
            desde,
            hasta,
            almacen,
        });
    },
    fetchFiles() {
        return Api().get("/excelfile/fetchFiles");
    },
    getReport() {
        return Api().post("/excelfile/getReport");
    },
    deleteFile(file) {
        return Api().post("/excelfile/deleteFile",{file});
    },


}
import Api from "./Api";

export default {
    register(form) {
        return Api().post("/register", form);
    },
    googleCallback(code) {
        return Api().get(`/auth/google/callback?code=${code}`);
    },
    registerWithGoogle() {
        return Api().get(`/auth/google`);
    },

    updateLead(form) {
        return Api().post("/updateLead", form);
    },

    login(form) {
        return Api().post("/login", form);

    },
    forgotPassword(form) {
        return Api().post("/forgot-password", form);

    },
    resetPassword(form) {
        return Api().post("/reset-password", form);

    },
    reenviarLink() {
        return Api().post("/email/verification-notification");

    },
    getMyEmail() {
        return Api().get("/email/getMyEmail");

    },
    verify(
        verify_url
    ) {
        return Api().get(`${verify_url}`);

    },
    logout() {
        return Api().post("/logout");
    },
    auth() {
        return Api().get("/user")
    },
    getUserRol(userId) {

        return Api().get("/user/getUserRol", {
            params: {
                userId
            }
        });
    },
    asignarRol(rolName, userId) {

        return Api().post("/user/asignarRol",
            {
                userId,
                rolName
            }
        );
    },
    getAllRoles() {

        return Api().get("/user/getAllRoles", {
            params: {
            }
        });
    },
    actualizarInfo(form) {
        return Api().post("/user/actualizarInfo", form);
    },
    cambiaContrasena(form) {

        return Api().post("/user/cambiaConstrasena", form);
    },
    getCountNotf() {

        return Api().get("/user/getCountNotf");
    },
    getNotifications() {

        return Api().get("/user/getNotifications");
    },
    getAllNotifications(page, dfecha, hfecha) {

        return Api().get("/user/getAllNotifications", {
            params: {
                page,
                dfecha,
                hfecha
            }
        });
    },
    getUserInfo(userId) {
        return Api().get("/user/userInfo", {
            params: {
                userId,
            }
        });
    },
    searchTimezones() {
        return Api().get("/user/searchTimezones");
    },
    setTimezone(id) {
        return Api().post("/user/setTimezone", { id });
    },
    updateFeature(post) {
        return Api().post("/user/updateFeature", post);
    },
    getDistribuidorInfo(){
        return Api().get("/user/distribuidor_info");
    },
}
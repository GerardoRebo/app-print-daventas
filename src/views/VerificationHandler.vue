<template></template>
<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import User from "../apis/User";
import { useUserStore } from "../s";
const s = useUserStore();
const { handleOpException} = s;
const route = useRoute()
const router = useRouter();
function verify() {
    User.verify(
        route.query.verify_url
    )
        .then((response) => {
            router.push({ name: "Home" });

        })
        .catch((error) => {
            handleOpException(error);
            alert('Ocurrió un error, asegurate de abrir el link en el mismo navegador donde empezaste el proceso de registro')
        });
}
onMounted(() => {
    verify()
})
</script>
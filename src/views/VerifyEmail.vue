<template>
    <v-container>
        <v-card class="pa-5 mx-auto" max-width="400">
            <v-card-title>Gracias por registrarte</v-card-title>
            <v-card-subtitle>
                Un link de verificación ha sido enviado a tu correo.
            </v-card-subtitle>
            <v-card-text>
                Queremos ofrecerte el mejor servicio, si necesitas ayuda no dudes en ponerte en contacto con
                nosotros:
                <ul class="list-disc px-8 mt-2">
                    <li>
                        <a href="https://www.facebook.com/Daventaspuntocom">Facebook</a>
                    </li>
                    <li>
                        Correo: daventas.mexico@gmail.com
                    </li>

                </ul>
            </v-card-text>
            <v-card-actions>
                <v-btn color="accent" class="mt-3" block @click.prevent="reenviarLink" variant="elevated">
                    Reenviar link
                </v-btn>
            </v-card-actions>

        </v-card>
    </v-container>
</template>
<script setup>
import User from "../apis/User";
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../s";
const s = useUserStore();
const { handleOpException } = s;
const cargando = ref(false)
const intervalId = ref(null);
const router = useRouter();
function reenviarLink() {
    if (cargando.value) return;
    cargando.value = true
    User.reenviarLink()
        .then((response) => {
            alert('Mantente pendiente de tu correo electrónico, en breve se enviará un link de activación')
        })
        .catch((error) => {
            handleOpException(error);
            alert('Ocurrió un error')
        }).finally(() => {
            cargando.value = false
        });
}
const goToHome = () => {
    router.push({ name: "Home" });
}
onMounted(() => {
    intervalId.value = setInterval(goToHome, 5000);
});
onUnmounted(() => {
    clearInterval(intervalId.value)

});
</script>
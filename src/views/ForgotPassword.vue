<template>
  <v-container>
    <v-card class="pa-5 mx-auto" max-width="400">
      <v-card-title>Olvide mi contraseña</v-card-title>
      <v-card-text>
        Te enviaremos un link para que reestablezcas tu contraseña
        <v-text-field label="Correo" name="email" v-model="form.email" hide-details class="my-4"
          :error="errors.email ? errors.email[0] : null" append-inner-icon="mdi-email" />
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" class="mt-3" block @click.prevent="forgotPassword" variant="elevated">
          Enviar
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-container>
</template>
<script setup>
import User from "../apis/User";
import { reactive, ref } from "@vue/reactivity";
import { useRouter } from "vue-router";
import { useUserStore } from "../s";
const s = useUserStore();
const { handleOpException } = s;
const router = useRouter();
const form = reactive({
  email: "",
  password: "",
  device_name: "browser",
});
const errors = ref([]);
const cargando = ref(false);
function forgotPassword() {
  errors.value = [];
  if (cargando.value) return;
  cargando.value = true;
  User.forgotPassword(form)
    .then((response) => {
      let msg = ""
      if (response.data.status) {
        msg = response.data.status
      } else if (response.data.email) {
        msg = response.data.email
      }
      alert(msg);
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
</script>
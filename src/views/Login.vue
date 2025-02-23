<template>
  <v-container>
    <v-card class="pa-5 mx-auto" max-width="400">
      <v-card-title>Iniciar Sesión</v-card-title>
      <v-card-text>
        <v-text-field label="Correo" name="email" v-model="form.email" class="my-4"
          :error-messages="errors.email ? errors.email[0] : null" append-inner-icon="mdi-email" />
        <v-text-field label="Contraseña" autocomplete="password" v-model="form.password" class="my-4"
          :error-messages="errors.password ? errors.password[0] : null" :type="show1 ? 'text' : 'password'"
          :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show1 = !show1"
          @keydown.enter="login" />
        <v-btn color="accent" class="mt-3" block @click.prevent="login" variant="elevated" :loading="cargando">
          Iniciar Sesión
        </v-btn>
      </v-card-text>
      <v-divider class="my-3"></v-divider>

      <!-- Botón de Iniciar Sesión con Facebook -->
      <!-- <v-btn @click="loginWithFacebook" color="blue darken-4" class="mb-3" block>
        <v-icon left>mdi-facebook</v-icon>
        Iniciar Sesión con Facebook
      </v-btn> -->

      <v-card-actions class="justify-center">
        <router-link :to="{ name: 'Register' }">
          <v-btn variant="text">¿No tienes una cuenta? Regístrate</v-btn>
        </router-link>
      </v-card-actions>
      <v-card-actions class="justify-center pa-0 ma-0" dense>
        <router-link :to="{ name: 'ForgotPassword' }">
          <v-btn variant="text" size="small" class="text-decoration-underline">Olvide mi contraseña</v-btn>
        </router-link>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script setup>
import User from "../apis/User";
import { reactive, ref } from "@vue/reactivity";
import { useRouter } from "vue-router";
import { useUserStore } from "../s";
const store = useUserStore();
const { handleOpException } = store;
const router = useRouter();
const cargando = ref(false);
const show1 = ref(false);
const form = reactive({
  email: "",
  password: "",
  device_name: "browser",
});
const errors = ref([]);
function login() {
  if (!navigator.onLine) {
    alert('No estas conectado a internet')
    return;
  }
  if (cargando.value) return;
  cargando.value = true
  User.login(form)
    .then((response) => {
      localStorage.setItem("token", response.data);
      store.isLoggedIn = true;
      localStorage.setItem("isLoggedIn", JSON.stringify(true));
      store.setUserRoles()
      router.push({ name: "Home" });
    })
    .catch((error) => {
      if (error?.response?.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false
    });
}
</script>
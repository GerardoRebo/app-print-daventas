<template>
  <v-container>
    <v-card class="pa-5 mx-auto" max-width="600">
      <v-card-title>Registro</v-card-title>
      <v-card-text>
        <p>Organización</p>
        <v-text-field label="Nombre del negocio" autocomplete="password" class="my-4"
          :error="errors.organization_name ? errors.organization_name[0] : null" v-model="form.organization_name" />
        <p>Personal</p>
        <v-text-field label="Nombre" autocomplete="password" class="my-4" :error="errors.name ? errors.name[0] : null"
          v-model="form.name" />
        <v-text-field label="Email" autocomplete="password" v-model="form.email" class="my-4"
          :error="errors.email ? errors.email[0] : null" append-inner-icon="mdi-email" />
        <v-text-field label="Contraseña" autocomplete="password" v-model="form.password" class="my-4"
          :error="errors.password ? errors.password[0] : null" :type="show1 ? 'text' : 'password'"
          :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show1 = !show1" />
        <v-text-field label="Confirmación de contraseña" autocomplete="password" v-model="form.password_confirmation"
          class="my-4" :error="errors.password_confirmation ? errors.password_confirmation[0] : null"
          :type="show2 ? 'text' : 'password'" :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="show2 = !show2" />
        <v-btn color="accent" class="mt-3" block @click.prevent="register" variant="elevated"
          append-icon="mdi-account-plus">
          Registro
        </v-btn>
      </v-card-text>
      <v-divider class="my-3"></v-divider>
      <v-card-actions class="justify-center">
        <router-link :to="{ name: 'Login' }">
          <v-btn variant="text">Ya tengo cuenta</v-btn>
        </router-link>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script setup>
import { ref, reactive } from "vue";
import User from "../apis/User";
import { useRouter } from "vue-router";
import { useUserStore } from "../s";
const router = useRouter();
const store = useUserStore();
const { handleOpException } = store;
const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  organization_name: "",
});
const isLocalhost = import.meta.env.VITE_BASE_URL === "http://localhost:80";
if (isLocalhost) {
  form.name = "asdf";
  form.email = "asdf" + Date.now() + "@example.com";
  form.password = "12345678";
  form.password_confirmation = "12345678";
  form.organization_name = "asdf";
}

const cargando = ref(false);
const show1 = ref(false);
const show2 = ref(false);
const errors = ref([]);
function register() {
  if (cargando.value) return;
  cargando.value = true;
  User.register(form)
    .then((response) => {
      localStorage.setItem("token", response.data);
      store.isLoggedIn = true;
      store.setUserRoles()
      router.push({ name: "Home" });
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}

</script>
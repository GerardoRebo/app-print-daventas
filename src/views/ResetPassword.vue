<template>
  <v-container>
    <v-card class="pa-5 mx-auto" max-width="600">
      <v-card-title>Reestablece tu contraseña</v-card-title>
      <v-card-text>
        <v-text-field label="Email" name="email" v-model="form.email" class="my-4"
          :error="errors.email ? errors.email[0] : null" append-inner-icon="mdi-email" />
        <v-text-field label="Contraseña" autocomplete="password" v-model="form.password" class="my-4"
          :error="errors.password ? errors.password[0] : null" :type="show1 ? 'text' : 'password'"
          :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show1 = !show1" />
        <v-text-field label="Confirmación de contraseña" autocomplete="password" v-model="form.password_confirmation"
          class="my-4" :error="errors.password_confirmation ? errors.password_confirmation[0] : null"
          :type="show2 ? 'text' : 'password'" :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="show2 = !show2" />
        <v-btn color="accent" class="mt-3" block @click.prevent="resetPassword" variant="elevated"
          append-icon="mdi-account-check">
          Confirmar
        </v-btn>
      </v-card-text>
      <v-divider class="my-3"></v-divider>
      <!-- <v-card-actions class="justify-center">
        <router-link :to="{ name: 'Login' }">
          <v-btn variant="text">Ya tengo c</v-btn>
        </router-link>
      </v-card-actions> -->
    </v-card>
  </v-container>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import User from "../apis/User";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../s";
const s = useUserStore();
const { handleOpException } = s;
const route = useRoute()
const router = useRouter();
const form = reactive({
  email: "",
  token: "",
  password: "",
  password_confirmation: "",
});
const show1 = ref(false);
const show2 = ref(false);
const errors = ref([]);
const cargando = ref(false);
function resetPassword() {
  if (cargando.value) return;
  cargando.value = true;
  User.resetPassword(form)
    .then((response) => {
      alert('Tu contraseña ha sido cambiada exitosamente')
      router.push({ name: "Login" });
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
onMounted(() => {
  form.token = route.query.token
})

</script>
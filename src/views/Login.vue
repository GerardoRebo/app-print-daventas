<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Lado izquierdo: Formulario -->
      <v-col cols="12" md="5" class="d-flex align-center justify-center">
        <div>
          <div class="text-center">
            <a href="/">
              <v-img src="/logo.png" max-height="40" class="my-8" aspect-ratio="auto" alt="App Logo" contain></v-img>
            </a>
          </div>
          <v-card class="pa-2 pa-md-5 mx-auto" max-width="400" color="white" elevation="4">
            <v-card-title class="text-h4">Iniciar Sesión</v-card-title>
            <v-card-text>
              <v-text-field label="Correo" name="email" v-model="form.email" class="my-4"
                :error-messages="errors.email ? errors.email[0] : null" append-inner-icon="mdi-email" />
              <v-text-field label="Contraseña" autocomplete="password" v-model="form.password"
                :error-messages="errors.password ? errors.password[0] : null" :type="show1 ? 'text' : 'password'"
                :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show1 = !show1"
                @keydown.enter="login" />
              <v-btn color="primary" class="mt-3" block @click.prevent="login" variant="elevated" :loading="cargando">
                Iniciar Sesión
              </v-btn>
            </v-card-text>

            <v-divider class="my-3"></v-divider>

            <!-- Botón de Iniciar Sesión con Google -->
            <!-- <v-btn @click="loginWithGoogle" color="secondary" class="mb-3" block>
              <v-icon left size="small" class="mr-2">mdi-google</v-icon>
              Iniciar Sesión con Google
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
        </div>
      </v-col>
      <v-col cols="12" md="7"
        class="overlay d-none d-md-flex flex-column justify-center align-center text-center rounded-bl-xl">
        <div>
          <p class="text-h1 font-weight-medium">¡Bienvenido!</p>
          <h6 class="text-body-2 font-weight-medium">
            Accede a tu cuenta para seguir construyendo algo increíble.
          </h6>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import User from "../apis/User";
import { reactive, ref } from "@vue/reactivity";
import { useRouter } from "vue-router";
import { useUserStore } from "../s";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useNotification } from "@js/composables/useNotification";
import { useAuthHandler } from "@js/composables/useAuthHandler";

const store = useUserStore();
const router = useRouter();
const { handleAuthSuccess } = useAuthHandler();
const { processRequest } = useProcessRequest();
const { notify } = useNotification();

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
    notify.error('No estás conectado a internet');
    return;
  }

  processRequest(async () => {
    const response = await User.login(form);
    handleAuthSuccess(response.data);
  }, cargando, {
    errorsRef: errors,
    onSuccess: () => notify.success("¡Sesión iniciada correctamente!")
  });
}

const loginWithGoogle = async () => {
  try {
    const { data } = await User.registerWithGoogle();
    window.location.href = data.url;
  } catch (error) {
    console.error('Google Login Error:', error);
    notify.error('Error al iniciar sesión con Google');
  }
};
</script>
<style>
.overlay {
  background: linear-gradient(to right, #3084f2, #97c0f7);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  color: #ffffff;
  height: 100%;
  width: 100%;
}

.v-application .rounded-bl-xl {
  border-bottom-left-radius: 300px !important;
}

.v-application .rounded-br-xl {
  border-bottom-right-radius: 300px !important;
}
</style>
<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height ">
      <!-- Lado izquierdo: Formulario -->
      <v-col cols="12" md="5" class="d-flex-column align-center d-flex-md justify-center pa-2 ma-0">
        <div class="">
          <div class="text-center">
            <a href="/">
              <v-img src="/logo.png" max-height="40" class="my-8" aspect-ratio="auto" alt="App Logo"
                contain></v-img>
            </a>
          </div>
          <v-card class="pa-2 pa-md-5 mx-auto " max-width="400" elevation="4" color="white">
            <v-card-title class="text-h4">Mi Registro</v-card-title>
            <v-card-text>
              <v-text-field label="Nombre" class="my-2" :error-messages="errors.name?.[0]" v-model="form.name" />
              <v-text-field label="Email" v-model="form.email" class="my-2" autocomplete="email"
                :error-messages="errors.email?.[0]" append-inner-icon="mdi-email" @blur="updateLead">
                <template v-slot:append>
                  <v-icon v-if="emailSuccess" class="mr-2" color="success">mdi-check-circle</v-icon>
                </template>
                <template v-slot:loader>
                  <v-progress-linear :active="cargandoTwo" color="primary" indeterminate></v-progress-linear>
                </template>
              </v-text-field>

              <v-alert v-if="emailWarning" :text="didYouMean ? 'Quisiste decir: ' + didYouMean : ''"
                title="Verifica que email esté bien escrito" variant="outlined" type="warning" class="mb-8" />

              <v-text-field label="Contraseña" autocomplete="password" v-model="form.password" class="my-4"
                :error-messages="errors.password?.[0]" :type="show1 ? 'text' : 'password'"
                :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show1 = !show1" />

              <v-text-field label="Confirmación de contraseña" autocomplete="password"
                v-model="form.password_confirmation" class="my-4" :error-messages="errors.password_confirmation?.[0]"
                :type="show2 ? 'text' : 'password'" :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="show2 = !show2" />

              <v-btn color="primary" class="mt-3" block @click.prevent="register" variant="elevated"
                append-icon="mdi-account-plus" :loading="cargando">
                Registro
              </v-btn>
            </v-card-text>

            <v-divider class="my-3"></v-divider>

            <!-- <v-btn @click="registerWithGoogle" color="primary" class="mb-3" block :loading="cargando">
              <v-icon left size="small" class="mr-2">mdi-google</v-icon>
              Registrarse con Google
            </v-btn> -->

            <v-divider class="my-3"></v-divider>

            <v-card-actions class="justify-center">
              <router-link :to="{ name: 'Login' }">
                <v-btn variant="text">Ya tengo cuenta</v-btn>
              </router-link>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>
      <!-- Lado derecho: Fondo con texto -->
      <v-col cols="12" md="7"
        class="overlay d-none d-md-flex flex-column justify-center align-center text-center rounded-bl-xl">
        <div>
          <p class="text-h1 font-weight-medium">¿Aún no tienes cuenta?</p>
          <h6 class="text-body-2 font-weight-medium">Vamos a crearte una para que empieces tu primera experiencia de
            onboarding.</h6>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import User from "../apis/User";
import { useRoute, useRouter } from "vue-router";
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

const didYouMean = ref(null);
const emailWarning = ref(false);
const emailSuccess = ref(false);
const cargando = ref(false);
const cargandoTwo = ref(false);
const show1 = ref(false);
const show2 = ref(false);
const errors = ref([]);
const route = useRoute()
function register() {
  if (cargando.value) return;
  cargando.value = true;
  const ref = route.query.ref
  const refType = route.query.ref_type
  form.ref = ref
  form.ref_type = refType
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
async function updateLead() {
  try {
    cargandoTwo.value = true;
    didYouMean.value = null;
    emailWarning.value = false;
    emailSuccess.value = false;
    const { data } = await User.updateLead(form)
    if (data.success) {
      if (data.email_state == "email_ok" || data.email_state == "ok") {
        emailSuccess.value = true;
      } else {
        emailWarning.value = true;
        didYouMean.value = data.did_you_mean;
      }
    }
  } catch (error) {
  } finally {
    cargandoTwo.value = false;
  }
}

const registerWithGoogle = async () => {
  try {
    const { data } = await User.registerWithGoogle();
    // console.log('Google Registration Data:', data);
    window.location.href = data.url;
  } catch (error) {
    console.error('Google Login Error:', error);
  }
  // window.location.href = '/auth/google';
};
onMounted(() => {
})

</script>
<style>
.overlay {
  background: linear-gradient(to right, #102540, #389bf2);
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
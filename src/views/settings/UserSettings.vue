<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title> Mi perfil</v-card-title>
          <v-card-text>
            <v-text-field label="Email" autocomplete="password" v-model="myPerfil.email" readonly />
            <v-text-field label="Nombre" autocomplete="password" v-model="myPerfil.name" />
            <v-text-field label="Dirección" autocomplete="password" v-model="myPerfil.direccion" />
            <v-text-field label="Teléfono" autocomplete="password" v-model="myPerfil.telefono" />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click.prevent="abrirIsVisible" :loading="cargando">Cambiar Contraseña</v-btn>
            <v-btn @click.prevent="actualizarInfo" color="accent" variant="outlined"
              :loading="cargando">Actualizar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <MasSettings></MasSettings>
      </v-col>
    </v-row>
  </v-container>
  <v-dialog v-model="isVisible" max-width="600">
    <v-card>
      <v-card-title>Cambiar Contraseña</v-card-title>
      <v-card-text>
        <v-text-field label="Password Actual" autocomplete="password" ref="passwordARef"
          :error-messages="errors.passwordA ? errors.passwordA[0] : null" v-model="form.passwordA" type="password"
          class="my-2" />
        <v-text-field label="Tu nuevo Password" autocomplete="password"
          :error-messages="errors.password ? errors.password[0] : null" v-model="form.password" type="password"
          class="my-2" />
        <v-text-field label="Confirma tu nuevo Password" autocomplete="password"
          :error-messages="errors.password_confirmation ? errors.password_confirmation[0] : null"
          v-model="form.password_confirmation" type="password" class="my-2" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false">Cancelar</v-btn>
        <v-btn @click.prevent="cambiaContrasena" color="accent" variant="outlined" :loading="cargando">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref, reactive, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
const store = useUserStore();
import User from "../../apis/User";
import { useUserStore } from "../../s";
import MasSettings from "./MasSettings.vue";

const isVisible = ref(false);
const passwordARef = ref(null);
const form = reactive({
  password: "",
  passwordA: "",
  password_confirmation: "",
});
const myPerfil = reactive({
  name: "",
  direccion: "",
  email: "",
  telefono: "",
});
const errors = ref([]);
const cargando = ref(false);

function emptyValues() {
  form.password = "";
  form.passwordA = "";
  form.password_confirmation = "";
}

function abrirIsVisible() {
  emptyValues()
  isVisible.value = true;
  nextTick(() => passwordARef.value.focus());
}

function cambiaContrasena() {
  if (cargando.value) return;
  cargando.value = true;
  User.cambiaContrasena(form)
    .then(() => {
      cargando.value = false;
      User.auth()
        .then((response) => {
          isVisible.value = false
          form.password = ""
          form.password_confirmation = ""
          form.passwordA = ""
          alert("Exitoso");
        })
        .catch((error) => {
          handleOpException(error);
        });
    })
    .catch((error) => {
      cargando.value = false;
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
        return;
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
    });
}
function actualizarInfo() {
  if (cargando.value) return;
  cargando.value = true;
  User.actualizarInfo(myPerfil)
    .then(() => {
      store.setUserRoles()
      alert("Exitoso");
    })
    .catch((error) => {
      if (error.response.status === 422) {
        errors.value = error.response.data.errors;
      }
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}

onMounted(() => {
  const obj = { ...store.authuser };
  myPerfil.name = obj.name;
  myPerfil.email = obj.email;
  myPerfil.telefono = obj.telefono;
  myPerfil.direccion = obj.direccion;
});

</script>

<style></style>
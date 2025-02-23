<template>
  <v-card class="mb-2">
    <v-card-title>Usuarios</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-btn @click="abrirVisible" :loading="cargando">Agregar colaborador</v-btn>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container>

    <v-data-table :headers="headers" :items="misUsers" items-per-page="5">
      <template v-slot:item.precio_final="{ item }">
        <span>${{ item.precio_final }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <router-link :to="{
          name: 'UsuariosShow',
          params: {
            userId: item.id,
          },
        }">
          <v-btn size="small" class="mx-4" prepend-icon="mdi-cog">
            Configuracion
          </v-btn>
        </router-link>
        <v-btn @click="desvincularUser(item.id)" size="small" prepend-icon="mdi-account-off">Desvincular</v-btn>
      </template>
    </v-data-table>

  </v-container>
  <v-dialog v-model="isVisible">
    <v-card>
      <v-card-title>Envia solicitud a colaborador</v-card-title>
      <v-card-text>
        <v-row>
          <v-text-field label="Correo" name="email" v-model="email" class="mx-4"
            :error-messages="errors.email ? errors.email[0] : null" append-inner-icon="mdi-email" />
          <v-text-field label="Contraseña" autocomplete="password" v-model="password" class="mx-4"
            :error-messages="errors.password ? errors.password[0] : null" :type="show1 ? 'text' : 'password'"
            :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show1 = !show1"
            @keydown.enter="enviarSolicitud" />
          <v-btn color="accent" @click.prevent="enviarSolicitud" :loading="cargando">
            Enviar solicitud
          </v-btn>
        </v-row>
        <v-data-table :headers="tHeaders" :items="misSolicitudes" items-per-page="5" show-select
          select-strategy="single">
          <template v-slot:item.name="{ item }">
            {{ item.user?.name }}
          </template>
          <template v-slot:item.email="{ item }">
            {{ item.user?.email }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn @click="destroyInvitation(item.id)" size="small" prepend-icon="mdi-trash-can">Eliminar</v-btn>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="isVisible = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script setup>
import Organizacion from "../../../apis/Organizacion";

import { ref } from "@vue/reactivity";
import { nextTick } from "@vue/runtime-core";
import { onMounted } from "vue";

const misUsers = ref([]);
const misSolicitudes = ref([]);
const email = ref("");
const password = ref("");
const errors = ref([]);
const cargando = ref(false);
const isVisible = ref(false);
const show1 = ref(false);
const headers = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Email', key: 'email', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const tHeaders = ref([
  { title: 'Id solicitud', key: 'id', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Email', key: 'email', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);

function getMisUsers() {

  if (cargando.value) return;
  cargando.value = true;

  Organizacion.getMisUsers()
    .then((response) => {
      misUsers.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}
async function desvincularUser(userId) {

  if (cargando.value) return;
  cargando.value = true;
  const response = await confirm('Estas seguro?');
  if (!response) {
    cargando.value = false;
    return;
  };
  Organizacion.desvincularUser(userId)
    .then((response) => {
      cargando.value = false;
      getMisUsers();
    })
    .catch((error) => {
      //:todo
      cargando.value = false;
      alert("Ha ocurrido un error")
    }).finally(() => {
    });
}
function getSolicitudes() {
  Organizacion.getSolicitudes()
    .then((response) => {
      misSolicitudes.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
    });
}
function abrirVisible() {
  isVisible.value = true;
  nextTick(() => {
    // nextTick(() => document.getElementById("email").select());
  });
  getSolicitudes();
}

function enviarSolicitud() {
  if (cargando.value) return;
  cargando.value = true;
  errors.value = [];
  Organizacion.enviarSolicitud({ email: email.value, password: password.value })
    .then((response) => {
      if (response.data == "OtraOrg") {
        alert("No se ha enviado la solicitud, El usuario esta activo en otra organización");
      }
      if (response.data == "No Existe el Usuario") {
        alert("No Existe Usuario Registrado Con Ese Correo");
      }
      if (response.data == "El Usuario Ya Tiene Invitacion") {
        alert("El Usuario Ya Tiene Invitacion");
      }
      email.value = null;
      password.value = null;
      getSolicitudes();
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
function destroyInvitation(id) {
  if (cargando.value) return;
  cargando.value = true;
  Organizacion.destroyInvitation(id)
    .then(() => {
      getSolicitudes();
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false;
    });
}

onMounted(() => {
  getMisUsers();
});
</script>

<style></style>
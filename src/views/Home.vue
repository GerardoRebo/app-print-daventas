<template>
  <v-container>
    <v-row justify="center" class="py-6">
      <v-col cols="12" sm="4" class="text-center">
        <p class="text-h3">¡Hola {{ s?.authuser?.name}}!</p>
      </v-col>
    </v-row>
    <v-row class="pa-4" justify="center">
      <v-col cols="12" sm="4">
        <v-card class="mx-auto" :to="{ name: 'PuntoVenta' }" height="240" max-width="344" color="primary" hover
          append-icon="mdi-open-in-app">
          <template v-slot:title>
            <span class="font-weight-black">Punto de venta</span>
          </template>
          <v-card-text>Incia aqui</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card append-icon="mdi-open-in-new" height="240" class="mx-auto"
          href="https://www.facebook.com/Daventaspuntocom" max-width="344" prepend-icon="mdi-facebook" rel="noopener"
          target="_blank" title="Siguenos en FaceBook" color="grey" hover>
          <v-card-text>
            <ul class="pa-4">
              <li>Publicaremos nuevas funcionalidades del sistema</li>
              <li>Te proporcionaremos ayuda tecnica</li>
              <li>Podrás reportar problemas con el sistema</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "../s";
const router = useRouter();
const s = useUserStore();
</script>
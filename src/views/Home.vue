<template>
  <v-container>
    <v-row class="pa-4">
      <v-col cols="12" sm="4">
        <v-card class="mx-auto" :to="{ name: 'PuntoVenta' }" max-width="344" color="primary" hover
          append-icon="mdi-open-in-app">
          <template v-slot:title>
            <span class="font-weight-black">Punto de venta</span>
          </template>
          <v-card-text>Para inicar haz click aqui</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card append-icon="mdi-open-in-new" class="mx-auto" href="https://www.facebook.com/Daventaspuntocom"
          max-width="344" prepend-icon="mdi-facebook" rel="noopener" target="_blank" title="Siguenos en FaceBook"
          color="primary" hover>
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
const router = useRouter();

</script>
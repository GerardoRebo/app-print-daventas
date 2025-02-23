<template>
    <v-card>
        <v-card-title>Otras configuraciones</v-card-title>
        <v-card-text>
            <v-text-field label="Zona horaria" autocomplete="password" v-model="zona"
                :error-messages="errors.zona ? errors.zona[0] : null" />
        </v-card-text>
        <v-card-actions>
            <v-btn @click.prevent="abrirIsVisible" :loading="cargando">Buscar</v-btn>
            <v-btn @click.prevent="setZona(zona)" color="accent" variant="outlined" :loading="cargando">Guardar</v-btn>
        </v-card-actions>
    </v-card>
    <v-dialog v-model="isVisible" max-width="600">
        <v-card>
            <v-card-title>Busca tu zona horaria</v-card-title>
            <v-card-text>
                <v-data-table :headers="headers" :items="timezones" items-per-page="5">
                    <template v-slot:item.zona="{ item }">
                        {{ item }}
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-icon @keydown.enter="setZona(item)" @click="setZona(item)" size="small"
                            color="primary">mdi-check</v-icon>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script setup>
import { useUserStore } from "../../s";
const store = useUserStore();
import {
    nextTick,
    onMounted,
    ref,
} from "@vue/runtime-core";
import User from "../../apis/User";

const headers = ref([
    { title: 'Zona', key: 'zona', align: 'start', sortable: false },
    { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
const isVisible = ref(false);
const errors = ref([]);
const cargando = ref(false);
const timezones = ref([]);
const zona = ref('');

function emptyValues() {
}
async function searchTimezones() {
    if (cargando.value) return;
    cargando.value = true
    try {
        let response = await User.searchTimezones();
        timezones.value = response.data
    } catch (error) {

    } finally {
        cargando.value = false
    }
}
const setZona = async (id) => {
    if (cargando.value) return;
    cargando.value = true;
    errors.value = [];
    try {
        let response = await User.setTimezone(id);
        isVisible.value = false
        zona.value = id
        store.authuser = response.data[0];
        alert('Actualizado Exitosamente')
    } catch (error) {
        if (error.response.data.message == 'NoTz') {
            errors.value = { zona: ['Time Zone invalido'] }
            return;
        }
        alert("Ha ocurrido un error")

    } finally {
        cargando.value = false
    }
}

async function abrirIsVisible() {
    // emptyValues()
    await searchTimezones()
    isVisible.value = true;
    nextTick(() => document.getElementById("zona").select());
}

onMounted(() => {
    zona.value = store.authuser?.configuration?.time_zone
});
</script>

<style></style>
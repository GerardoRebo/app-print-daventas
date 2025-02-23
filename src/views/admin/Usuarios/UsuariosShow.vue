<template>
  <v-card class="mb-2">
    <v-card-title>Usuario {{ userInfo }}</v-card-title>
    <v-card-text>
      <v-row dense class="mt-4">
        <v-btn @click="abrirVisible" :loading="cargando" class="mx-4">Asignar almacén</v-btn>
        <v-select :items="roles" label="Elige rol" max-width="300" v-model="rol"
          @update:modelValue="asignarRol"></v-select>
      </v-row>
    </v-card-text>
  </v-card>
  <v-container>
    <v-data-table :headers="headers" :items="misAlmacens" items-per-page="5">
      <template v-slot:item.actions="{ item }">
        <v-btn @click="detachAlmacen(item.id)" size="small" prepend-icon="mdi-cancel">Quitar</v-btn>
      </template>
    </v-data-table>
  </v-container>
  <v-dialog v-model="isVisible">
    <v-card>
      <v-card-title>Asigna almacén</v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="allAlmacens" items-per-page="5">
          <template v-slot:item.actions="{ item }">
            <v-btn @click="attachAlmacen(item.id)" size="small" prepend-icon="mdi-check">Asignar</v-btn>
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
import { onMounted, ref, watch } from "@vue/runtime-core";
import { useRoute } from "vue-router";
import Almacen from "@js/apis/Almacen";
import User from "@js/apis/User";
import { useUserStore } from "@js/s";
const s = useUserStore();
const route = useRoute();
const userId = ref(null);
const misAlmacens = ref([]);
const allAlmacens = ref([]);
const isVisible = ref(false);
const roles = ref([]);
const rol = ref(null);
const userInfo = ref(null);
const cargando = ref(false);
const headers = ref([
  { title: 'Id', key: 'id', align: 'start', sortable: false },
  { title: 'Nombre', key: 'name', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);

watch(userId, () => {
  getUserAlmacens();
  getUserInfo()
});
function getUserInfo() {
  User.getUserInfo(userId.value).then((response) => {
    userInfo.value = response.data
  }).catch((error) => {
    handleOpException(error);
    alert("Ha ocurrido un error")
  })

}
function abrirVisible() {
  isVisible.value = true;
  getAllAlmacens();
}
function getUserAlmacens() {
  Almacen.getUserAlmacens(userId.value)
    .then((response) => {
      misAlmacens.value = response.data;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    }).finally(() => {
    });
}
function getAllAlmacens() {
  Almacen.getAll()
    .then((response) => {
      allAlmacens.value = response.data;
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    }).finally(() => {
    });
}
function detachAlmacen(almacenId) {
  if (cargando.value) return
  cargando.value = true
  Almacen.detachAlmacen(userId.value, almacenId)
    .then(() => {
      s.myAlmacens = [];
      getUserAlmacens();
    })
    .catch((error) => {
      alert("Ha ocurrido un error")
      handleOpException(error);
    }).finally(() => {
      cargando.value = false
    });
}
function attachAlmacen(almacenId) {
  if (cargando.value) return
  cargando.value = true
  Almacen.attachAlmacen(userId.value, almacenId)
    .then(() => {
      getUserAlmacens();
      isVisible.value = false;
      s.myAlmacens = [];
      alert(
        "Para que estos cambios se vean reflejados, el usuario al que se le asigno un nuevo almacen debe recargar la página"
      );
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
      cargando.value = false
    });
}
function getAllRoles() {
  User.getAllRoles()
    .then((response) => {
      roles.value = response.data.map((item) => {
        return {
          value: item.name,
          title: item.name
        }
      });
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
    });
}
function getUserRol(userId) {
  User.getUserRol(userId)
    .then((response) => {
      rol.value = response.data;
    })
    .catch((error) => {
      handleOpException(error);
      alert("Ha ocurrido un error")
    }).finally(() => {
    });
}
function asignarRol() {
  if (cargando.value) return
  cargando.value = true
  User.asignarRol(rol.value, userId.value)
    .then((response) => {
      getUserRol(userId.value);
    })
    .catch((error) => {
      console.log(error);
      alert("Ha ocurrido un error")
      handleOpException(error);
    }).finally(() => {
      cargando.value = false
    });
}
onMounted(() => {
  userId.value = route.params.userId;
  getUserRol(userId.value);
  getAllRoles();
});
</script>
<template>
    <drop-down-c>
        <!-- Button content -->
        <template v-slot:button>
            <button-content :buttonTitle="nombre"></button-content>
        </template>

        <!-- Opened dropdown content -->
        <template v-slot:content>

            <drop-down-content v-if="!isLoggedIn" linkTitle="LogIn" :namedRoute="{ name: 'Login' }"></drop-down-content>
            <drop-down-content v-if="isLoggedIn" linkTitle="Configuraciones" :namedRoute="{ name: 'UserSettings' }"></drop-down-content>
            <drop-down-content v-if="isLoggedIn" linkTitle="Notificaciones" :namedRoute="{ name: 'Notifications' }"></drop-down-content>
            <drop-down-content v-if="isAdmin" linkTitle="Administración"
                :namedRoute="{ name: 'MisUsuarios' }"></drop-down-content>
            <!-- <drop-down-content v-if="isLoggedIn" linkTitle="LogOut" :namedRoute="{name:'MisUsuarios'}"></drop-down-content> -->
            <drop-down-content v-if="!isLoggedIn" linkTitle="Register"
                :namedRoute="{ name: 'Register' }"></drop-down-content>
            <p class="
                                    flex
                                    w-full
                                    justify-between
                                    items-center
                                    rounded
                                    px-2
                                    py-1
                                    my-1
                                    hover:bg-blue-600 hover:text-white
                                    cursor-pointer
                                  " v-if="showLogOut" @click.prevent="$emit('logout')">
                                  Cerrar Sesion
            </p>
            
        </template>
    </drop-down-c>
</template>
<script setup>
import DropDownC from "../DropDown/DropDownC.vue";
import ButtonContent from "../DropDown/ButtonContent.vue";
import DropDownContent from "../DropDown/DropDownContent.vue";
import { computed } from "vue";
const props =defineProps({
    'isLoggedIn': Boolean,
    'nombre': String,
    'isAdmin':Boolean
})
const showLogOut =computed(()=>{
    if(props.isLoggedIn  || localStorage.getItem('token')) return true;
    return false;
})

</script>
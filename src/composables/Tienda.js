import { ref } from "vue";

export function useTienda(tiendaProp) {
    const tienda = ref({
        name: '',
        coverPhotoUrl: '',
        slug_name: '',
        profilePhotoUrl: '',
    });
    tienda.value.name = tiendaProp.name;
    tienda.value.slug_name = tiendaProp.slug_name;
    tienda.value.coverPhotoUrl = 'https://cdn.vuetifyjs.com/images/cards/docks.jpg';
    tienda.value.profilePhotoUrl = 'https://cdn.vuetifyjs.com/images/cards/docks.jpg';
    return { tienda }
}
<template>
  <v-card>
    <v-card-text>
      <p class="font-weight-bold">Producto: {{ productActual.name }}</p>
      <p class="font-weight-bold">Codigo: {{ productActual.codigo }}</p>
      <v-divider></v-divider>
    </v-card-text>
  </v-card>
  <v-container fluid>
    <v-row class="my-2">
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <v-form @submit.prevent="submitForm">
              <v-row>
                <v-col cols="12">
                  <v-file-input multiple label="Upload Images" @change="handleFiles" :loading="cargando"
                    color="primary"></v-file-input>
                </v-col>
                <v-col cols="12">
                  <v-row>
                    <v-col v-for="(image, index) in previewImages" :key="index" class="position-relative" cols="12">
                      <v-img :src="image" class="rounded-md" height="128px" contain></v-img>
                      <v-btn icon size="small" class="absolute top-0 right-0" @click="removeImage(index)" color="error">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-btn color="primary" type="submit" class="mt-4">Subir</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="9">
        <v-card>
          <v-card-text>
            <v-btn text @click="isVisible = true" class="ma-2">Ver Todas</v-btn>
            <v-data-table :headers="tHeaders" :items="imagenes" items-per-page="5">
              <template v-slot:item.imagen="{ item }">
                <v-img :src="item.url" height="56px" contain></v-img>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-trash-can" size="small" color="error" @click="eliminarImagen(item.id)"></v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-dialog v-model="isVisible">
    <v-card>
      <v-card-title>
        Imagenes
      </v-card-title>
      <v-card-text>
        <v-carousel>
          <v-carousel-item v-for="image in imagenes" :src="image.url"></v-carousel-item>
        </v-carousel>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="isVisible = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import Product from "@js/apis/Product";
import { ref } from "vue";
import { nextTick, onMounted } from "vue";
import ImageCarousel from "@js/components/ImageCarousel.vue";
import { useProductActual } from "@js/composables/ProductActual";
import { useSnackBar } from "@js/composables/SnackBar";
import { useRoute } from "vue-router";
const route = useRoute();
const productId = ref(route.params.productId);
const imagenes = ref([]);
const selectedFiles = ref([]);
const previewImages = ref([]);
const isVisible = ref(false);
const cargando = ref(false);
const { snackbar, snackSuccess, snackError, snackWarning } = useSnackBar();
const productActual = ref({});
const tHeaders = ref([
  { title: 'Imagen', key: 'imagen', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', align: 'start', sortable: false },
]);
useProductActual(productId.value, productActual, cargando, snackError);
const handleFiles = (event) => {
  cargando.value = true;
  const files = Array.from(event.target.files);
  selectedFiles.value.push(...files);

  // Generate image previews
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImages.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
  cargando.value = false;
};

const removeImage = (index) => {
  selectedFiles.value.splice(index, 1);
  previewImages.value.splice(index, 1);
};

const submitForm = async () => {
  cargando.value = true;
  const formData = new FormData();
  selectedFiles.value.forEach(file => {
    formData.append('images[]', file);
  });

  try {
    const response = await Product.attachImages(productId.value, formData);
    cargando.value = false;

    if (response.status === 201) {
      // Handle success
      console.log('Images uploaded successfully');
      location.reload()
    } else {
      // Handle error
      console.error('Failed to upload images');
    }
  } catch (error) {
    console.error('An error occurred', error);
  }
};

function getImages() {
  Product.getImages(productId.value)
    .then((response) => {
      imagenes.value = response.data.images
      // console.log(imagenes.value);
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function setFeatured() {
  Product.enviarImagen(productId.value)
    .then(() => {
      getImages()
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function eliminarImagen(id) {
  Product.eliminarImagen(productId.value, id)
    .then(() => {
      getImages();
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
onMounted(() => {
  getImages();
});
</script>

<style></style>
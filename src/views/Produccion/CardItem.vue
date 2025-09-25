<script setup>
import { computed, ref } from 'vue';
import moment from 'moment-timezone';
import Articulo from "../../apis/Articulo";

const props = defineProps(['order']);
const isDetallesOpen = ref(false);
const selectedFiles = ref([]);
const files = ref([]);
const fileInput = ref(null);
const cargando = ref(false);
const previewImages = ref([]);
const articuloDescription = ref('');
const isCarouselFilesOpen = ref(false);
const selectedIndex = ref(0);
const filesHeaders = ref([
  { title: "Imagen", key: "image", align: "start", sortable: false },
  { title: "Nombre", key: "filename", align: "start", sortable: false },
  { title: "Formato", key: "mime_type", align: "start", sortable: false },
  { title: "Acciones", key: "actions", align: "start", sortable: false },
]);

const retocarImagen = async (fileId) => {
  try {
    await Articulo.retocarImagen(fileId);
    alert('La imagen se está retocando');
  } catch (error) {
    console.error('Error retocando la imagen:', error);
    alert('Error al retocar la imagen');
  }
};

const crearAnimacion = async (fileId) => {
  cargando.value = true;
  try {
    await Articulo.crearAnimacion(fileId);
    // alert('La animación se está creando');
  } catch (error) {
    console.error('Error creando la animación:', error);
    alert('Error al crear la animación');
  }finally{
    cargando.value = false;
  }

};
const animationCheckStatus = async (fileId) => {
  cargando.value = true;
  try {
    await Articulo.checkStatusAnimations(fileId);
    // alert('La animación se está creando');
  } catch (error) {
    console.error('Error creando la animación:', error);
    alert('Error al crear la animación');
  }finally{
    cargando.value = false;
  }

};

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
const submitForm = async () => {
  if (!selectedFiles.value.length) {
    alert("No hay archivos seleccionados");
    return;
  }
  cargando.value = true;
  const formData = new FormData();
  selectedFiles.value.forEach(file => {
    formData.append('files[]', file);
  });

  try {
    const response = await Articulo.attachFiles(props.order.ventaticket_articulo.id, formData);
    cargando.value = false;

    if (response.status === 201) {
      selectedFiles.value = []; // limpia tus datos
      previewImages.value = []; // si estás usando previews
      fileInput.value.reset(); // limpia el input de Vuetify
      console.log('Files uploaded successfully');
      alert('Archivos subidos exitosamente');
    } else {
      console.error('Failed to upload files');
      alert('Error al subir archivos');
    }
  } catch (error) {
    console.error('An error occurred', error);
  }
};
const eliminarFile = async (articulo) => {
  if (!confirm('¿Está seguro de que desea eliminar este archivo?')) {
    return;
  }
  if (cargando.value) {
    return;
  }
  try {
    const response = await Articulo.deleteFile(articulo);
    cargando.value = true;

    if (response.status === 200) {
      getFiles();
      // alert('Archivos borrado exitosamente');
    } else {
      console.error('Failed to upload files');
      alert('Error al borrar archivos');
    }
  } catch (error) {
    console.error('An error occurred', error);
  } finally {
    cargando.value = false;
  }

}
function updateArticuloDescription() {
  Articulo.updateArticuloDescription(articuloActualId.value, articuloDescription.value)
    .then((response) => {
      // getSpecificVT(ticketActual.id);
      alert("Descripción Actualizada")
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    });
}
function getFiles() {
  Articulo.getFiles(props.order.ventaticket_articulo.id)
    .then((response) => {
      files.value = response.data.images
      // console.log(imagenes.value);
    })
    .catch((error) => {
      // handleOpException(error);
      alert("Ha ocurrido un error")
    });
}

const downloadFile = async (fileId, filename) => {
  try {
    const response = await Articulo.downloadFile(fileId);
    const blob = await response.data;
    const link = document.createElement('a');
    const blobUrl = window.URL.createObjectURL(blob);
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading the file:', error);
    alert('Error al descargar el archivo');
  }
};

const firstImageUrl = computed(() => {
  const imageFile = files.value.find(file => file.mime_type?.startsWith('image/'));
  return imageFile ? imageFile.url : null;
});
const openCarousel = (index) => {
  selectedIndex.value = index;
  isCarouselFilesOpen.value = true;
};

getFiles();


</script>
<template>
  <v-row>
    <v-col cols="12" sm="4" class="pa-4">
      <v-card variant="flat">
        <v-list-item :title="order.ventaticket_articulo?.product?.name" density="comfortable" lines="one">
          <template v-slot:title>
            <strong class="text-h6">
              {{ order.ventaticket_articulo?.product?.name }}
            </strong>
          </template>
        </v-list-item>
        <v-card-text>
          <p><span class="font-weight-bold">Fecha:</span>
            {{ `${moment(order.ventaticket?.created_at).format('DD-MM-YYYY h:mm:ss a')}` }} </p>
          <RouterLink :to="{ name: 'VentasShow', params: { ventaId: order.ventaticket?.id } }" target="_blank"
            rel="noopener">
            <p><span class="font-weight-bold">Ticket:</span> {{ `${order.ventaticket?.id}` }} </p>
          </RouterLink>
          <p v-if="order.ventaticket?.fecha_entrega"><span class="font-weight-bold">Fecha Entrega:</span> {{moment(order.ventaticket?.fecha_entrega).format('DD/MM/YYYY') }} </p>
          <p><span class="font-weight-bold">Cliente:</span> {{ `${order.ventaticket?.cliente?.name ?? ''}` }} </p>
          <p><span class="font-weight-bold">Generó:</span> {{ `${order.ventaticket?.almacen?.name}` }} </p>
          <p><span class="font-weight-bold">Vendio:</span> {{ `${order.ventaticket.user?.name}` }} </p>
          <p><span class="font-weight-bold">Medidas</span><span class="text-caption"> (Ancho x Alto) </span>: {{
            `${order.ventaticket_articulo.ancho ?? ''}x${order.ventaticket_articulo.alto ?? ''}` }} </p>
          <p><span class="font-weight-bold">Cantidad:</span> {{ `${order.ventaticket_articulo.cantidad}` }} </p>
          <p><span class="font-weight-bold">Descripción:</span> {{ `${order.ventaticket_articulo.description ?? ''}` }}
          </p>
          <v-btn class="font-bold cursor-pointer text-indigo-600" @click="isDetallesOpen = true"
            icon="mdi mdi-dots-horizontal" size="x-small" tabindex="-1">
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="8">
      <v-card variant="flat">
        <v-card-text>
          <v-img v-if="firstImageUrl" @click="openCarousel(0)" :src="firstImageUrl" height="200" cover></v-img>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-dialog v-model="isDetallesOpen">
    <v-card>
      <v-card-title>
        Archivos
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-row>
              <v-col cols="12">
                <v-file-input multiple label="Upload Files" accept="image/*,application/pdf,application/photoshop"
                  @change="handleFiles" :loading="cargando" color="primary" ref="fileInput"></v-file-input>
                <v-col v-for="(file, index) in selectedFiles" :key="index" class="position-relative" cols="12">
                  <div v-if="file.type.startsWith('image/')">
                    <v-img :src="previewImages[index]" class="rounded-md" height="128px" contain />
                  </div>
                  <div v-else>
                    <v-icon large>mdi-file</v-icon>
                    <div>{{ file.name }}</div>
                  </div>
                  <v-btn icon size="small" class="absolute top-0 right-0" @click="removeImage(index)" color="error">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-col>
                <v-btn color="primary" type="submit" class="mt-4" @click="submitForm">Subir</v-btn>
              </v-col>
              <v-col cols="12">
                <v-textarea label="Descripción" v-model="articuloDescription" rows="2" color="primary"
                  variant="outlined"></v-textarea>
                <v-btn color="primary" @click="updateArticuloDescription">Guardar</v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="9">
            <v-card>
              <v-card-text>
                <!-- <v-btn text @click="isVisible = true" class="ma-2">Ver Todas</v-btn> -->
                <v-data-table :headers="filesHeaders" :items="files" items-per-page="5">
                  <template v-slot:item.image="{ item, index }">
                    <v-img :src="item.url" height="56px" contain @click="openCarousel(index)"
                      class="cursor-pointer"></v-img>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <!-- <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-dots-vertical" size="small" class="mx-2" v-bind="props"></v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="retocarImagen(item.id)">
                          <v-list-item-title>Retocar Imagen</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="crearAnimacion(item.id)">
                          <v-list-item-title>Crear Animación</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="animationCheckStatus(item.id)">
                          <v-list-item-title>Checar status</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu> -->
                    <v-btn icon="mdi-download" size="small" color="primary" class="mr-2" @click="downloadFile(item.id, item.filename)"></v-btn>
                    <v-btn icon="mdi-trash-can" size="small" color="error" @click="eliminarFile(item.id)"></v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="isDetallesOpen = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="isCarouselFilesOpen">
    <v-card>
      <v-card-title>
        Archivos
      </v-card-title>
      <v-card-text>
        <v-carousel v-model="selectedIndex">
          <v-carousel-item v-for="image in files" :src="image.url"></v-carousel-item>
        </v-carousel>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="downloadFile(files[selectedIndex].id, files[selectedIndex].filename)">Descargar</v-btn>
        <v-spacer></v-spacer>
        <v-btn text @click="isCarouselFilesOpen = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
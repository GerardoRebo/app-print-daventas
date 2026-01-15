<template>
  <v-container>
    <v-row justify="center" class="py-6">
      <v-col cols="12" sm="8" md="6">
        <v-row class="mb-6" align="center">
          <v-col>
            <h1 class="text-h4 font-weight-bold">Mis Organizaciones</h1>
          </v-col>
          <v-col cols="auto">
            <v-btn 
              color="primary" 
              prepend-icon="mdi-plus"
              @click="showCreateDialog = true"
            >
              Nueva Organización
            </v-btn>
          </v-col>
        </v-row>

        <!-- Diálogo para crear organización -->
        <v-dialog v-model="showCreateDialog" max-width="500">
          <v-card>
            <v-card-title>Crear Nueva Organización</v-card-title>
            <v-card-text class="pt-4">
              <v-text-field
                v-model="newOrgName"
                label="Nombre de la Organización"
                variant="outlined"
                placeholder="Ej: Mi Empresa"
                @keyup.enter="createOrganization"
                :disabled="creatingOrg"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn 
                variant="text"
                @click="showCreateDialog = false"
                :disabled="creatingOrg"
              >
                Cancelar
              </v-btn>
              <v-btn 
                color="primary"
                variant="elevated"
                @click="createOrganization"
                :loading="creatingOrg"
              >
                Crear
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Snackbar para notificaciones -->
        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          :timeout="snackbar.timeout"
          location="top"
        >
          {{ snackbar.message }}
        </v-snackbar>

        <!-- Organización Activa -->
        <v-card class="mb-6" v-if="activeOrganization">
          <v-card-title>
            <!-- <v-icon color="success" class="mr-2">mdi-check-circle</v-icon> -->
            Organización Activa
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="primary" class="text-white">
                    {{ activeOrganization.name.charAt(0).toUpperCase() }}
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">
                  {{ activeOrganization.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ activeOrganization.slug_name }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Otras Organizaciones -->
        <v-card v-if="otherOrganizations.length > 0">
          <v-card-title>
            <v-icon class="mr-2">mdi-office-building-multiple</v-icon>
            Otras Organizaciones
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item 
                v-for="org in otherOrganizations" 
                :key="org.id"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <v-avatar color="secondary" class="text-white">
                    {{ org.name.charAt(0).toUpperCase() }}
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">
                  {{ org.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ org.slug_name }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn 
                    color="primary" 
                    @click="switchOrganization(org.id)"
                    :loading="switching === org.id"
                    size="small"
                  >
                    Cambiar
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Sin otras organizaciones -->
        <v-alert 
          v-if="organizations.length <= 1" 
          type="info" 
          class="mt-4"
        >
          Solo tienes acceso a una organización.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../s'
import { useRouter } from 'vue-router'
import OrganizationContext from '../../apis/OrganizationContext'

const userStore = useUserStore()
const router = useRouter()

const organizations = ref([])
const activeOrganizationId = ref(null)
const switching = ref(null)
const loading = ref(true)
const showCreateDialog = ref(false)
const newOrgName = ref('')
const creatingOrg = ref(false)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000
})

const activeOrganization = computed(() => {
  return organizations.value.find(org => org.id === activeOrganizationId.value)
})

const otherOrganizations = computed(() => {
  return organizations.value.filter(org => org.id !== activeOrganizationId.value)
})

const fetchOrganizations = async () => {
  try {
    loading.value = true
    const response = await OrganizationContext.list()
    console.log('Fetched organizations:', response.data)
    organizations.value = response.data?.organizations || []
    
    // Solo actualizar activeOrganizationId si no ha sido cambiado recientemente
    if (!switching.value) {
      activeOrganizationId.value = response.data?.active_organization_id
      userStore.activeOrganizationId = response.data?.active_organization_id
      if (userStore.authuser) {
        userStore.authuser.active_organization_id = response.data?.active_organization_id
      }
    }
    
    // Actualizar el store con las organizaciones y guardar en localStorage
    userStore.organizations.splice(0, userStore.organizations.length, ...organizations.value)
    localStorage.setItem("organizations", JSON.stringify(organizations.value))
  } catch (error) {
    console.error('Error fetching organizations:', error)
  } finally {
    loading.value = false
  }
}

const switchOrganization = async (organizationId) => {
  try {
    switching.value = organizationId
    const response = await OrganizationContext.switch(organizationId)
    
    console.log('Switch response:', response.data)
    
    const responseData = response.data || response
    
    if (responseData.success || response.status === 200) {
      // Update local state
      activeOrganizationId.value = organizationId
      
      // Update user store with new organization
      userStore.authuser = {
        ...userStore.authuser,
        active_organization_id: organizationId
      }
      userStore.activeOrganizationId = organizationId
      userStore.myAlmacens = []; // Clear almacens to be re-fetched
      
      // Save to localStorage
      localStorage.setItem("active_organization_id", JSON.stringify(organizationId))
      localStorage.setItem("authuser", JSON.stringify(userStore.authuser))
      localStorage.setItem("organizations", JSON.stringify(organizations.value))
      
      // Refresh the organizations list to update the UI
      await fetchOrganizations()
      
      const orgName = organizations.value.find(org => org.id === organizationId)?.name || 'Organización'
      showSnackbar(`Cambiado a "${orgName}" exitosamente`, 'success')
    } else {
      showSnackbar('Error: La respuesta del servidor no es válida', 'error')
    }
  } catch (error) {
    console.error('Error switching organization:', error)
    console.error('Error response:', error.response)
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
    showSnackbar(`Error: ${errorMessage}`, 'error', 5000)
  } finally {
    switching.value = null
  }
}

const showSnackbar = (message, color = 'success', timeout = 3000) => {
  snackbar.value = {
    show: true,
    message,
    color,
    timeout
  }
}

const createOrganization = async () => {
  if (!newOrgName.value.trim()) {
    showSnackbar('Por favor ingresa un nombre para la organización', 'warning')
    return
  }

  try {
    creatingOrg.value = true
    const response = await OrganizationContext.create(newOrgName.value.trim())
    
    console.log('Response from create:', response)
    console.log('Response data:', response.data)
    
    const responseData = response.data || response
    
    if (responseData.success || response.status === 201) {
      const orgId = responseData.active_organization_id
      const orgName = newOrgName.value
      
      showSnackbar(`Organización "${orgName}" creada exitosamente`, 'success', 4000)
      
      // Update user store with new active organization
      userStore.authuser = {
        ...userStore.authuser,
        active_organization_id: orgId
      }
      userStore.activeOrganizationId = orgId
      
      // Save to localStorage
      localStorage.setItem("active_organization_id", JSON.stringify(orgId))
      localStorage.setItem("authuser", JSON.stringify(userStore.authuser))
      
      // Reset form
      newOrgName.value = ''
      activeOrganizationId.value = orgId
      
      // Refresh organizations list
      await fetchOrganizations()
      
      // Close dialog after a short delay to show the snackbar message
      setTimeout(() => {
        showCreateDialog.value = false
      }, 500)
    } else {
      showSnackbar('Error: La respuesta del servidor no es válida', 'error', 5000)
    }
  } catch (error) {
    console.error('Error creating organization:', error)
    console.error('Error response:', error.response)
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
    showSnackbar(`Error: ${errorMessage}`, 'error', 5000)
  } finally {
    creatingOrg.value = false
  }
}

onMounted(() => {
  fetchOrganizations()
})
</script>

<style scoped>
</style>

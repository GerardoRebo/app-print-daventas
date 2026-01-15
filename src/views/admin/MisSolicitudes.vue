<template>
  <v-container>
    <v-row justify="center" class="py-6">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-inbox-multiple</v-icon>
            Invitaciones Pendientes
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- Sin invitaciones -->
            <v-alert 
              v-if="invitations.length === 0" 
              type="info"
              class="mb-4"
            >
              No tienes invitaciones pendientes
            </v-alert>

            <!-- Lista de invitaciones -->
            <v-list v-else>
              <v-list-item 
                v-for="invitation in invitations" 
                :key="invitation.id"
                class="mb-4 border"
              >
                <template v-slot:prepend>
                  <v-avatar 
                    color="primary" 
                    class="text-white"
                  >
                    {{ invitation.organization.name.charAt(0).toUpperCase() }}
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-bold">
                  {{ invitation.organization.name }}
                </v-list-item-title>
                
                <v-list-item-subtitle>
                  {{ invitation.organization.slug_name }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn-group divided>
                    <v-btn 
                      color="success" 
                      @click="acceptInvitation(invitation.id)"
                      :loading="acceptingId === invitation.id"
                      size="small"
                      prepend-icon="mdi-check"
                    >
                      Aceptar
                    </v-btn>
                    <v-btn 
                      color="error" 
                      @click="declineInvitation(invitation.id)"
                      :loading="decliningId === invitation.id"
                      size="small"
                      prepend-icon="mdi-close"
                    >
                      Rechazar
                    </v-btn>
                  </v-btn-group>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Snackbar para notificaciones -->
        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          :timeout="snackbar.timeout"
          location="top"
        >
          {{ snackbar.message }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../s'
import { useRouter } from 'vue-router'
import Invitations from '../../apis/Invitations'
import OrganizationContext from '../../apis/OrganizationContext'

const userStore = useUserStore()
const router = useRouter()

const invitations = ref([])
const loading = ref(true)
const acceptingId = ref(null)
const decliningId = ref(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000
})

const fetchInvitations = async () => {
  try {
    loading.value = true
    const response = await Invitations.getPending()
    invitations.value = response.data.invitations || []
  } catch (error) {
    console.error('Error fetching invitations:', error)
    showSnackbar('Error al cargar las invitaciones', 'error')
  } finally {
    loading.value = false
  }
}

const acceptInvitation = async (invitationId) => {
  acceptingId.value = invitationId
  try {
    const response = await Invitations.accept(invitationId)
    
    if (response.data.success) {
      // Actualizar el store con la nueva organización
      await userStore.initializeFromStorage()
      
      // Recargar invitaciones
      await fetchInvitations()
      
      showSnackbar(`Te has unido a ${response.data.organization.name}`, 'success', 4000)
      
      // Redirigir al home después de 2 segundos
      setTimeout(() => {
        router.push({ name: 'Home' })
      }, 2000)
    }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    const errorMessage = error.response?.data?.message || 'Error al aceptar la invitación'
    showSnackbar(errorMessage, 'error', 5000)
  } finally {
    acceptingId.value = null
  }
}

const declineInvitation = async (invitationId) => {
  decliningId.value = invitationId
  try {
    const response = await Invitations.decline(invitationId)
    
    if (response.data.success) {
      await fetchInvitations()
      showSnackbar('Invitación rechazada', 'warning')
    }
  } catch (error) {
    console.error('Error declining invitation:', error)
    const errorMessage = error.response?.data?.message || 'Error al rechazar la invitación'
    showSnackbar(errorMessage, 'error', 5000)
  } finally {
    decliningId.value = null
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

onMounted(() => {
  fetchInvitations()
})
</script>

<style scoped>
.border {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 12px;
}
</style>

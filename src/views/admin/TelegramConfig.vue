<template>
  <div class="mt-8">
    <v-card elevation="2">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-send</v-icon>
        Configuración de Notificaciones por Telegram
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <!-- Lista de configuraciones existentes -->
        <div v-if="telegramConfigs.length > 0" class="mb-6">
          <h3 class="text-subtitle2 mb-4">Tus configuraciones:</h3>
          <v-list>
            <v-list-item v-for="config in telegramConfigs" :key="config.id" class="border mb-2">
              <template v-slot:prepend>
                <v-icon color="primary">mdi-send</v-icon>
              </template>

              <v-list-item-title>
                Bot Token: {{ maskToken(config.telegram_bot_token) }}
              </v-list-item-title>

              <v-list-item-subtitle>
                <div>Chat ID: {{ config.telegram_chat_id }}</div>
                <div class="text-caption mt-1">
                  Creado por: <strong>{{ config.user?.name || 'Sistema' }}</strong>
                  <span v-if="config.organization"> ({{ config.organization?.name }})</span>
                </div>
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn variant="text" icon="mdi-dots-vertical" v-bind="props"></v-btn>
                  </template>

                  <v-list>
                    <v-list-item @click="editConfig(config)">
                      <template v-slot:prepend>
                        <v-icon>mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Editar</v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="testConfig(config)">
                      <template v-slot:prepend>
                        <v-icon>mdi-test-tube</v-icon>
                      </template>
                      <v-list-item-title>Enviar prueba</v-list-item-title>
                    </v-list-item>

                    <v-divider></v-divider>

                    <v-list-item @click="deleteConfig(config)">
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title class="text-error">Eliminar</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <!-- Formulario para nueva configuración o edición -->
        <v-expansion-panels v-model="showForm" class="mb-4">
          <v-expansion-panel :title="editingId ? 'Editar Configuración' : 'Agregar Nueva Configuración'">
            <template v-slot:text>
              <v-form @submit.prevent="saveConfig">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.telegram_bot_token"
                        label="Token del Bot de Telegram"
                        hint="Obtén el token de @BotFather en Telegram"
                        type="password"
                        persistent-hint
                        required
                        density="compact"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.telegram_chat_id"
                        label="Chat ID"
                        hint="El ID del chat donde recibirás notificaciones"
                        persistent-hint
                        required
                        density="compact"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12">
                      <v-checkbox
                        v-model="formData.notify_delivery_today"
                        label="Recibir notificaciones a las 10 AM de entregas para hoy"
                        density="compact"
                      ></v-checkbox>
                    </v-col>

                    <v-col cols="12">
                      <v-checkbox
                        v-model="formData.notify_delivery_tomorrow"
                        label="Recibir notificaciones a las 7 PM de entregas para mañana"
                        density="compact"
                      ></v-checkbox>
                    </v-col>
                  </v-row>

                  <v-row class="mt-4">
                    <v-col cols="12" class="d-flex gap-2">
                      <v-btn color="primary" type="submit" :loading="loading">
                        {{ editingId ? "Actualizar" : "Agregar" }}
                      </v-btn>
                      <v-btn variant="outlined" @click="resetForm">
                        Cancelar
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Información útil -->
        <v-alert type="info" class="mt-6" icon="mdi-information">
          <strong>¿Cómo configurar Telegram?</strong>
          <ol class="mt-2 ml-4">
            <li>Abre Telegram y busca @BotFather</li>
            <li>Crea un nuevo bot con el comando /newbot</li>
            <li>Copia el token que te proporciona</li>
            <li>Inicia una conversación con tu bot, ej. "Hola"</li>
            <li>Abre en el navegador: https://api.telegram.org/bot[TOKEN]/getUpdates</li>
            <li>[TOKEN] (ej: 123456:ABC-DEF...)</li>
            <li>Busca "chat" en el JSON para obtener tu Chat ID</li>
            <li>Pega ambos valores en los campos de arriba</li>
          </ol>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Snackbar para mensajes -->
    <v-snackbar v-model="snackbar.active" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import TelegramConfig from "../../apis/TelegramConfig";
import { useUserStore } from "../../s";

const s = useUserStore();
const telegramConfigs = ref([]);
const showForm = ref(null);
const editingId = ref(null);
const loading = ref(false);

const formData = ref({
  telegram_bot_token: "",
  telegram_chat_id: "",
  notify_delivery_today: true,
  notify_delivery_tomorrow: true,
});

const snackbar = ref({
  active: false,
  message: "",
  color: "success",
  timeout: 3000,
});

// Mascarar el token para privacidad
const maskToken = (token) => {
  if (!token) return "";
  const first = token.substring(0, 5);
  const last = token.substring(token.length - 5);
  return `${first}...${last}`;
};

// Cargar configuraciones
const loadConfigs = async () => {
  try {
    const response = await TelegramConfig.getAll();
    telegramConfigs.value = response.data;
  } catch (error) {
    console.log(error);
    
    showMessage("Error al cargar configuraciones", "error");
  }
};

// Guardar configuración
const saveConfig = async () => {
  if (!formData.value.telegram_bot_token || !formData.value.telegram_chat_id) {
    showMessage("Por favor completa todos los campos requeridos", "warning");
    return;
  }

  loading.value = true;
  try {
    if (editingId.value) {
      await TelegramConfig.update(editingId.value, formData.value);
      showMessage("Configuración actualizada correctamente", "success");
    } else {
      await TelegramConfig.store(formData.value);
      showMessage("Configuración agregada correctamente", "success");
    }
    await loadConfigs();
    resetForm();
  } catch (error) {
    const errorMsg = error.response?.data?.error || "Error al guardar la configuración";
    showMessage(errorMsg, "error");
  } finally {
    loading.value = false;
  }
};

// Editar configuración
const editConfig = (config) => {
  editingId.value = config.id;
  formData.value = { ...config };
  showForm.value = 0;
};

// Eliminar configuración
const deleteConfig = async (config) => {
  if (!confirm("¿Estás seguro de que deseas eliminar esta configuración?")) {
    return;
  }

  try {
    await TelegramConfig.delete(config.id);
    showMessage("Configuración eliminada correctamente", "success");
    await loadConfigs();
  } catch (error) {
    showMessage("Error al eliminar la configuración", "error");
  }
};

// Enviar mensaje de prueba
const testConfig = async (config) => {
  loading.value = true;
  try {
    await TelegramConfig.sendTest(config.id);
    showMessage("Mensaje de prueba enviado. Revisa tu Telegram", "success");
  } catch (error) {
    showMessage("Error al enviar mensaje de prueba", "error");
  } finally {
    loading.value = false;
  }
};

// Resetear formulario
const resetForm = () => {
  editingId.value = null;
  formData.value = {
    telegram_bot_token: "",
    telegram_chat_id: "",
    notify_delivery_today: true,
    notify_delivery_tomorrow: true,
  };
  showForm.value = null;
};

// Mostrar mensaje
const showMessage = (message, color = "success") => {
  snackbar.value = {
    active: true,
    message,
    color,
    timeout: 3000,
  };
};

onMounted(() => {
  loadConfigs();
});
</script>

<style scoped>
.border {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
}
</style>

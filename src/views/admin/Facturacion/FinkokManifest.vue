<script setup>
import { onMounted, reactive, ref } from 'vue';
import Organizacion from "@js/apis/Organizacion";
import { useNotification } from "@js/composables/useNotification";
import { useProcessRequest } from "@js/composables/useProcessRequest";
import { useRouter } from 'vue-router';

const router = useRouter();
const { notify } = useNotification();
const { processRequest } = useProcessRequest();

const cargando = ref(false);
const paso = ref(1);
const mostrarPassphrase = ref(false);
const customerInfo = reactive({
    exists: false,
    customers: [],
});

const fielForm = reactive({
    fiel_cer: null,
    fiel_key: null,
    fiel_passphrase: '',
});

const contratos = reactive({
    privacy_xml: null,
    contract_xml: null,
});

const registrarClienteFinkok = () => {
    processRequest(async () => {
        const response = await Organizacion.addFinkokCustomer();
        const data = response.data;

        if (data.success) {
            customerInfo.exists = data.exists;
            customerInfo.customers = data.customers;

            if (data.nextStep === 'manifest') {
                paso.value = 2;
                notify.success(data.message);
                obtenerContratos();
            } else if (data.nextStep === 'upload_credentials') {
                notify.warning(data.message);
                router.push({ name: 'Facturacion' });
            }
        } else {
            notify.error(data.message);
        }
    }, cargando, {
        onError: (error) => {
            notify.error('Error al registrar cliente: ' + (error.response?.data?.message || error.message));
        }
    });
};

const obtenerContratos = () => {
    processRequest(async () => {
        const response = await Organizacion.getFinkokContracts();
        const data = response.data;

        if (data.success) {
            contratos.privacy_xml = data.privacy_xml;
            contratos.contract_xml = data.contract_xml;
            notify.success('Contratos obtenidos correctamente');
        } else {
            notify.error(data.message);
        }
    }, cargando, {
        onError: (error) => {
            notify.error('Error al obtener contratos: ' + (error.response?.data?.message || error.message));
        }
    });
};

const onCerFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        if (!file.name.endsWith('.cer')) {
            notify.error('El archivo debe tener extensión .cer');
            return;
        }
        fielForm.fiel_cer = file;
    }
};

const onKeyFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        if (!file.name.endsWith('.key')) {
            notify.error('El archivo debe tener extensión .key');
            return;
        }
        fielForm.fiel_key = file;
    }
};

const enviarFiel = () => {
    if (!fielForm.fiel_cer || !fielForm.fiel_key || !fielForm.fiel_passphrase) {
        notify.error('Debe cargar ambos archivos (CER y KEY) e ingrese el passphrase');
        return;
    }

    processRequest(async () => {
        const formData = new FormData();
        formData.append('fiel_cer', fielForm.fiel_cer);
        formData.append('fiel_key', fielForm.fiel_key);
        formData.append('fiel_passphrase', fielForm.fiel_passphrase);

        const response = await Organizacion.signFinkokContracts(formData);
        const data = response.data;

        if (data.success) {
            notify.success('FIEL cargada y contratos firmados exitosamente');
            setTimeout(() => {
                router.push({ name: 'Facturacion' });
            }, 2000);
        } else {
            notify.error(data.message);
        }
    }, cargando, {
        onError: (error) => {
            notify.error('Error al enviar FIEL: ' + (error.response?.data?.message || error.message));
        }
    });
};

const volver = () => {
    router.push({ name: 'Facturacion' });
};

onMounted(() => {
    registrarClienteFinkok();
});
</script>

<template>
    <div class="finkok-manifest-container">
        <v-container>
            <v-row class="mb-6">
                <v-col cols="12">
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <h1 class="text-h4 font-weight-bold">Manifiesto de Finkok</h1>
                            <p class="text-subtitle-1 mt-2">Registro y firma de cliente en Finkok</p>
                        </div>
                        <v-btn icon @click="volver" class="text-muted">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </div>
                </v-col>
            </v-row>

            <v-row class="mb-6">
                <v-col cols="12">
                    <v-stepper v-model="paso" :items="['Registrar Cliente', 'Firmar Manifiesto']">
                        <template #item.1>
                            <v-card>
                                <v-card-text class="py-8">
                                    <div v-if="customerInfo.exists" class="text-center">
                                        <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
                                        <h3 class="text-h6 mb-2">Cliente ya registrado</h3>
                                        <p class="text-body2">El cliente ya existe en Finkok. Procediendo a firmar manifiesto...</p>
                                        <v-divider class="my-6"></v-divider>
                                    </div>
                                    <div v-else class="text-center">
                                        <v-progress-circular indeterminate :size="64" color="primary" class="mb-4"></v-progress-circular>
                                        <h3 class="text-h6 mb-2">Registrando cliente en Finkok...</h3>
                                        <p class="text-body2">Por favor, espere mientras registramos su cliente.</p>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </template>

                        <template #item.2>
                            <div class="py-6">
                                <h3 class="text-h6 mb-4">Carga de Certificado Digital (FIEL)</h3>
                                <p class="text-body2 mb-8">
                                    Antes de cargar su certificado, por favor lea atentamente los documentos contractuales a continuacion.
                                </p>

                                <div class="mb-8">
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <v-card class="contract-card" elevation="4">
                                                <v-card-title class="text-subtitle-1 bg-primary text-white">
                                                    <v-icon class="mr-2">mdi-file-document</v-icon>
                                                    Aviso de Privacidad
                                                </v-card-title>
                                                <v-card-text class="contract-content">
                                                    <div v-if="contratos.privacy_xml" class="contract-text">{{ contratos.privacy_xml }}</div>
                                                    <div v-else class="text-center py-8">
                                                        <v-progress-circular indeterminate></v-progress-circular>
                                                        <p class="mt-4">Cargando documento...</p>
                                                    </div>
                                                </v-card-text>
                                            </v-card>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-card class="contract-card" elevation="4">
                                                <v-card-title class="text-subtitle-1 bg-success text-white">
                                                    <v-icon class="mr-2">mdi-file-document</v-icon>
                                                    Contrato
                                                </v-card-title>
                                                <v-card-text class="contract-content">
                                                    <div v-if="contratos.contract_xml" class="contract-text">{{ contratos.contract_xml }}</div>
                                                    <div v-else class="text-center py-8">
                                                        <v-progress-circular indeterminate></v-progress-circular>
                                                        <p class="mt-4">Cargando documento...</p>
                                                    </div>
                                                </v-card-text>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </div>

                                <v-alert type="info" class="mb-8" outlined>
                                    <strong>Importante:</strong> Ha leido y acepta los terminos y condiciones de ambos documentos al cargar su certificado digital (FIEL).
                                </v-alert>

                                <v-card outlined class="mb-8">
                                    <v-card-title class="text-subtitle-1">
                                        <v-icon class="mr-2">mdi-certificate</v-icon>
                                        Datos de Certificacion
                                    </v-card-title>
                                    <v-card-text>
                                        <p class="text-body2 mb-6">
                                            Cargue su certificado digital (FIEL) para firmar electronicamente los contratos de Finkok.
                                        </p>

                                        <v-row>
                                            <v-col cols="12">
                                                <h4 class="text-body2 mb-3">Archivo .CER (Certificado)</h4>
                                                <div class="file-upload-area border-2 pa-4 text-center" style="border-style: dashed; border-radius: 8px; border-color: rgb(224, 224, 224);">
                                                    <input
                                                        ref="cerInput"
                                                        type="file"
                                                        accept=".cer"
                                                        @change="onCerFileSelected"
                                                        style="display: none;"
                                                    />
                                                    <v-btn
                                                        variant="outlined"
                                                        @click="$refs.cerInput?.click()"
                                                        prepend-icon="mdi-upload"
                                                        class="mb-2"
                                                    >
                                                        Seleccionar archivo .cer
                                                    </v-btn>
                                                    <div v-if="fielForm.fiel_cer" class="mt-2 text-success">
                                                        <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                                                        {{ fielForm.fiel_cer.name }}
                                                    </div>
                                                    <div v-else class="text-muted text-caption mt-2">
                                                        Ningun archivo seleccionado
                                                    </div>
                                                </div>
                                            </v-col>

                                            <v-col cols="12" class="mt-4">
                                                <h4 class="text-body2 mb-3">Archivo .KEY (Clave Privada)</h4>
                                                <div class="file-upload-area border-2 pa-4 text-center" style="border-style: dashed; border-radius: 8px; border-color: rgb(224, 224, 224);">
                                                    <input
                                                        ref="keyInput"
                                                        type="file"
                                                        accept=".key"
                                                        @change="onKeyFileSelected"
                                                        style="display: none;"
                                                    />
                                                    <v-btn
                                                        variant="outlined"
                                                        @click="$refs.keyInput?.click()"
                                                        prepend-icon="mdi-upload"
                                                        class="mb-2"
                                                    >
                                                        Seleccionar archivo .key
                                                    </v-btn>
                                                    <div v-if="fielForm.fiel_key" class="mt-2 text-success">
                                                        <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                                                        {{ fielForm.fiel_key.name }}
                                                    </div>
                                                    <div v-else class="text-muted text-caption mt-2">
                                                        Ningun archivo seleccionado
                                                    </div>
                                                </div>
                                            </v-col>

                                            <v-col cols="12" class="mt-4">
                                                <v-text-field
                                                    v-model="fielForm.fiel_passphrase"
                                                    :type="mostrarPassphrase ? 'text' : 'password'"
                                                    label="Passphrase de la FIEL"
                                                    hint="Contrasena de su certificado digital"
                                                    persistent-hint
                                                    outlined
                                                    required
                                                    :append-inner-icon="mostrarPassphrase ? 'mdi-eye-off' : 'mdi-eye'"
                                                    @click:append-inner="mostrarPassphrase = !mostrarPassphrase"
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>

                                <v-row class="mt-8">
                                    <v-col cols="12" class="d-flex justify-end gap-3">
                                        <v-btn variant="outlined" size="large" @click="volver" :disabled="cargando">
                                            Cancelar
                                        </v-btn>
                                        <v-btn
                                            color="success"
                                            size="large"
                                            @click="enviarFiel"
                                            :disabled="!fielForm.fiel_cer || !fielForm.fiel_key || !fielForm.fiel_passphrase || cargando"
                                            :loading="cargando"
                                            prepend-icon="mdi-check"
                                        >
                                            Firmar y Enviar
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </div>
                        </template>
                    </v-stepper>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<style scoped>
.finkok-manifest-container {
    padding: 20px 0;
}

.contract-card {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.contract-content {
    flex: 1;
    overflow-y: auto;
    max-height: 600px;
    font-size: 0.875rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    padding: 20px !important;
}

.contract-text {
    font-family: 'Courier New', monospace;
    background-color: #fafafa;
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
}

.file-upload-area {
    transition: all 0.3s ease;
}

.file-upload-area:hover {
    border-color: rgb(25, 118, 210) !important;
    background-color: rgba(25, 118, 210, 0.04);
}

.gap-3 {
    gap: 12px;
}
</style>

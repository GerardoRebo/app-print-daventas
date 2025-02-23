import { defineStore } from "pinia";
import { ref } from "vue";

export const useToasterStore = defineStore('toaster', () => {
    const toasts = ref([]);

    const updateState = (payload, status) => {
        const defaultTimeout = 3500;
        const { text, timeout, title } = payload;

        const toast = createToast(title, text, status);

        toasts.value.push(toast);

        setTimeout(() => {
            toasts.value = toasts.value.filter((t) => t.id !== toast.id);
        }, timeout ?? defaultTimeout);
    }
    const remove = (toast) => {
        toasts.value = toasts.value.filter((t) => t.id !== toast);
    }
    const createToast = (title, text, status, ) => ({
        text,
        title,
        status,
        id: Math.random() * 1000,
    });
    const success = (payload) => {
        updateState(payload, "success");
    }
    const info = (payload) => {
        updateState(payload, "info");
    }
    const warning = (payload) => {
        updateState(payload, "warning");
    }
    const error = (payload) => {
        updateState(payload, "danger");
    }

    return { toasts, updateState, success, remove, warning,info, error }
})
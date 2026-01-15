import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * Professional toast/notification store using Pinia
 * Supports multiple simultaneous notifications with auto-removal
 * 
 * @example
 * const toasterStore = useToasterStore();
 * toasterStore.success({ text: "Saved!", title: "Success" });
 * toasterStore.error({ text: "Error message", title: "Error", timeout: 5000 });
 */
export const useToasterStore = defineStore('toaster', () => {
    const toasts = ref([]);
    const maxToasts = 5; // Limit concurrent notifications

    const updateState = (payload, status) => {
        const defaultTimeout = 3500;
        const { text, timeout, title } = payload;

        // Limit concurrent notifications
        if (toasts.value.length >= maxToasts) {
            toasts.value.shift(); // Remove oldest
        }

        const toast = createToast(title, text, status, true);
        toasts.value.push(toast);

        setTimeout(() => {
            toasts.value = toasts.value.filter((t) => t.id !== toast.id);
        }, timeout ?? defaultTimeout);
    };

    const remove = (toastId) => {
        toasts.value = toasts.value.filter((t) => t.id !== toastId);
    };

    const removeAll = () => {
        toasts.value = [];
    };

    const createToast = (title, text, status, active) => ({
        text,
        title: title || "Notificación",
        status,
        active,
        id: `${Date.now()}-${Math.random()}`, // Unique ID
    });

    const success = (payload) => {
        updateState(payload, "success");
    };

    const info = (payload) => {
        updateState(payload, "info");
    };

    const warning = (payload) => {
        updateState(payload, "warning");
    };

    const error = (payload) => {
        updateState(payload, "error");
    };

    return { toasts, updateState, success, remove, removeAll, warning, info, error };
});

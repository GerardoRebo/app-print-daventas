export function useProcessRequest() {
    const processRequest = async (callback, loading, snackbar) => {
        if (loading.value) return; // Stop execution if already loading

        loading.value = true; // Set loading to true
        try {
            await callback(); // Execute the function
        } catch (error) {
            if (
                isOpException(error)
            ) {
                snackbar(getExceptionMsg(error))
                return
            }
            if (import.meta.env.VITE_ENV == 'local') {
                console.log(error);
            } else {
                alert("Ha ocurrido un error")
            }
        }
        finally {
            loading.value = false; // Reset loading state after operation
        }
    };
    const isOpException = (error) => {
        return error?.response?.data?.exception == "App\\Exceptions\\OperationalException"
    }
    const getExceptionMsg = (error) => {
        return error?.response?.data?.message
    }

    return { processRequest };
}

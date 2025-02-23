import { reactive} from "vue";

export function useSnackBar() {
    const snackbar = reactive({
        active: false,
        text: '',
        timeout: 1500,
        variant: 'elevated',
        color: 'success'
    });
    const snackSuccess = (msg)=>{
        snackbar.active = true;
        snackbar.text = msg;
        snackbar.color = 'success';
    }
    const snackError = (msg)=>{
        snackbar.active = true;
        snackbar.text = msg;
        snackbar.color = 'error';
    }
    const snackWarning = (msg)=>{
        snackbar.active = true;
        snackbar.text = msg;
        snackbar.color = 'warning';
    }
    return { snackbar, snackSuccess, snackError, snackWarning }
}
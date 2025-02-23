import { defineStore } from 'pinia'
import { useToasterStore } from "../s/toaster";
import { computed, ref, watch } from 'vue'
import User from "../apis/User";


export const useUserStore = defineStore('index', () => {
  const toasterStore = useToasterStore();

  const myAlmacens = ref([]);
  const proveedors = ref([]);
  const roles = ref([]);
  const departamentos = ref([]);
  const isLoggedIn = ref(false);
  const authuser = ref(null);
  const productsQuery = ref("");
  const productsData = ref({});
  const lastFetchTimes = ref({});

  watch(myAlmacens, (newVal) => {
    localStorage.setItem("myAlmacens", JSON.stringify(newVal))
  })

  const setUserRoles = () => {
    User.auth()
      .then((response) => {
        authuser.value = response.data[0]
        roles.value = response.data[1]
        localStorage.setItem("authuser", JSON.stringify(response.data[0]));
        localStorage.setItem("roles", JSON.stringify(response.data[1]));
      })
      .catch((error) => {
        handleOpException(error);
      });
  }
  const isAdmin = computed(() => {
    return (roles.value.includes("Admin") ||
      roles.value.includes("Owner") ||
      roles.value.includes("Encargado"))
  })
  const isOpException = (error) => {
    return error?.response?.data?.exception == "App\\Exceptions\\OperationalException"
  }
  const getExceptionMsg = (error) => {
    console.log();
    return error?.response?.data?.message
  }
  const handleOpException = (error) => {
    if (isOpException(error)) {
      toasterStore.error({ text: getExceptionMsg(error), title: "" })
      alert(getExceptionMsg(error));
      throw new Error('Operational exception');
    }
  }


  return {
    myAlmacens,
    proveedors,
    roles,
    departamentos,
    isLoggedIn,
    authuser,
    productsQuery,
    productsData,
    lastFetchTimes,
    isAdmin,
    setUserRoles,
    isOpException,
    getExceptionMsg,
    handleOpException
  }
})
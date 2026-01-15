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
  const organizations = ref([]);
  const activeOrganizationId = ref(null);

  // Initialize from localStorage on app load
  const initializeFromStorage = () => {
    try {
      const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
      const storedAuthuser = localStorage.getItem("authuser");
      const storedRoles = localStorage.getItem("roles");
      const storedOrganizations = localStorage.getItem("organizations");
      const storedActiveOrgId = localStorage.getItem("active_organization_id");
      const storeApiToken = localStorage.getItem("token");


      if (!storeApiToken) {
        return;
      }

      if (storedIsLoggedIn) isLoggedIn.value = JSON.parse(storedIsLoggedIn);
      if (storedAuthuser) authuser.value = JSON.parse(storedAuthuser);
      if (storedRoles) roles.value = JSON.parse(storedRoles);
      if (storedOrganizations) organizations.value = JSON.parse(storedOrganizations);
      if (storedActiveOrgId) {
        activeOrganizationId.value = JSON.parse(storedActiveOrgId);
        // Sync active_organization_id in authuser
        if (authuser.value) {
          authuser.value.active_organization_id = activeOrganizationId.value;
        }
      }
    } catch (error) {
      console.error("Error initializing store from storage:", error);
    }
  };

  // Watch activeOrganizationId changes and sync with authuser
  watch(activeOrganizationId, (newVal) => {
    if (authuser.value) {
      authuser.value.active_organization_id = newVal;
    }
  });

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
    return error?.response?.data?.message
  }
  const handleOpException = (error) => {
    if (isOpException(error)) {
      toasterStore.error({ text: getExceptionMsg(error), title: "Error operacional" })
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
    organizations,
    activeOrganizationId,
    isAdmin,
    setUserRoles,
    isOpException,
    getExceptionMsg,
    handleOpException,
    initializeFromStorage
  }
})
import { computed, ref, watch } from "vue";
import moment from "moment-timezone";
import useQuery from "@js/composables/useQuery";

export default function useMisFechas() {
  const { pushQuery } = useQuery();

  // Flag para evitar que los watchers disparen requests al montar
  const initializing = ref(true);

  // Refs de fechas
  const dfecha = ref(null);
  const hfecha = ref(null);

  // Formatos bonitos para inputs (UI)
  const formattedDFecha = computed(() =>
    dfecha.value ? moment(dfecha.value).format("DD-MM-YYYY") : ""
  );

  const formattedHFecha = computed(() =>
    hfecha.value ? moment(hfecha.value).format("DD-MM-YYYY") : ""
  );
  const updateDFecha = (value) => {
    if (!value) {
      dfecha.value = null;
      return;
    }

    dfecha.value = moment(value, "DD-MM-YYYY").toDate();
  };
  const updateHFecha = (value) => {
    if (!value) {
      hfecha.value = null;
      return;
    }

    hfecha.value = moment(value, "DD-MM-YYYY").toDate();
  };

  // Formato seguro para backend (query params)
  const formatForQuery = (date) =>
    date ? moment(date).format("YYYY-MM-DD") : null;

  // 🔥 Watchers inteligentes: solo actúan si no estamos inicializando
  watch(dfecha, (val) => {
    // if (initializing.value) return;
    pushQuery("dfecha", formatForQuery(val));
  });

  watch(hfecha, (val) => {
    // if (initializing.value) return;
    pushQuery("hfecha", formatForQuery(val));
  });

  // Función para cargar fechas desde la URL sin activar watchers
  const loadFromQuery = (query) => {
    // initializing.value = true;

    if (query.dfecha) dfecha.value = new Date(query.dfecha);
    if (query.hfecha) hfecha.value = new Date(query.hfecha);

    // Terminamos inicialización
    // initializing.value = false;
  };

  return {
    dfecha,
    hfecha,
    formattedDFecha,
    formattedHFecha,
    loadFromQuery,
    updateDFecha,
    updateHFecha,
    initializing
  };
}
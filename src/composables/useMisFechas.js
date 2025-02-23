import { computed, ref, watch } from "vue";
import moment from "moment-timezone"
import useQuery from "@js/composables/useQuery";

export default function useMisFechas() {
  const { pushQuery } = useQuery();
  const dfecha = ref(new Date);
  const hfecha = ref(new Date);
  const formattedDFecha = computed(() => {
    return moment(dfecha.value).format('YYYY-MM-DD');
  })
  const formattedHFecha = computed(() => {
    return moment(hfecha.value).format('YYYY-MM-DD');
  })
  watch(dfecha, () => {
    if (dfecha.value) {
      pushQuery('dfecha', formattedDFecha.value);
    } else {
      pushQuery('dfecha', null);
    }
  });

  watch(hfecha, () => {
    if (hfecha.value) {
      pushQuery('hfecha', formattedHFecha.value)
    } else {
      pushQuery('hfecha', null);
    }
  });
  return { dfecha, hfecha, formattedDFecha, formattedHFecha }
}
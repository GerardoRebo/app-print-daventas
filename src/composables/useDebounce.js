import { ref } from "vue";
const timeOut = ref("");

export default function useDebounce() {
  const debounce = async (func, wait = 1000) => {
    clearTimeout(timeOut.value);
    timeOut.value = setTimeout(func, wait);
  }
  return { debounce }
}
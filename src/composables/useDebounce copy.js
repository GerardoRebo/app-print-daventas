import { ref } from "vue";

export default function useDebounce() {
  const timeOut = ref(null);

  const debounce = (func, wait = 1000) => {
    clearTimeout(timeOut.value);
    timeOut.value = setTimeout(() => {
      func();  // Call the function after the debounce period
    }, wait);
  };

  return { debounce };
}

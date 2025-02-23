import { useRoute, useRouter } from "vue-router";

export default function useQuery() {

  const router = useRouter();
  const route = useRoute();
  const pushQuery = (key, value) => {
    [key].value = value;
    router.push({ query: { ...route.query, [key]: value } })
  };
  return {pushQuery}
}
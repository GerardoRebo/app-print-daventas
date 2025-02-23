import { ref } from "vue";
import { useProcessRequest } from "./ProcessRequest";
import Product from "@js/apis/Product";

const { processRequest } = useProcessRequest();

export function useProductActual(productId,productActual, cargando, snackbar) {
        processRequest(async () => {
            const { data } = await Product.show(productId)
            productActual.value.id = data.id;
            productActual.value.name = data.name;
            productActual.value.codigo = data.codigo;
            return productActual;
        }, cargando, snackbar)
}
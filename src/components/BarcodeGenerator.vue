<template>
    <div class="mt-8">
      <div>
        <label for="product-select">Select Product:</label>
        <select id="product-select" v-model="selectedProduct">
          <option v-for="product in products" :key="product.code" :value="product.code">
            {{ product.name }}
          </option>
        </select>
        <button @click="addProductToPrintList">Add to Print List</button>
      </div>
  
      <ul>
        <li v-for="(item, index) in printList" :key="index">
          <span>{{ item.name }}</span>
          <input type="number" v-model.number="item.printCount" min="1" />
          <button @click="removeProductFromPrintList(index)">Remove</button>
        </li>
      </ul>
  
      <button @click="printBarcodes">Print Barcodes</button>
    </div>
  </template>
  
  <script>
  import { ref, reactive } from 'vue';
  import JsBarcode from 'jsbarcode';
  import { jsPDF } from 'jspdf';
  
  export default {
    setup() {
      const products = ref([
        { name: "Product 1", code: "123456789012" },
        { name: "Product 2", code: "987654321098" },
        // Add more products here
      ]);
  
      const selectedProduct = ref(null);
      const printList = reactive([]);
  
      const addProductToPrintList = () => {
        const product = products.value.find(p => p.code === selectedProduct.value);
        if (product && !printList.some(p => p.code === product.code)) {
          printList.push({ ...product, printCount: 1 });
        }
      };
  
      const removeProductFromPrintList = (index) => {
        printList.splice(index, 1);
      };
  
      const generateBarcode = (code) => {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, code, { format: "CODE128" });
        return canvas.toDataURL("image/png");
      };
  
      const printBarcodes = () => {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const barcodeWidth = 50;
        const barcodeHeight = 30;
        const barcodeSpacingX = 10;
        const barcodeSpacingY = 10;
  
          let x = 10;
          let y = 10;
        printList.forEach((item) => {
          const barcodeDataUrl = generateBarcode(item.code);
  
          for (let i = 0; i < item.printCount; i++) {
            if (x + barcodeWidth > pageWidth) {
              x = 10;
              y += barcodeHeight + barcodeSpacingY;
            }
            if (y + barcodeHeight > pageHeight) {
              pdf.addPage();
              x = 10;
              y = 10;
            }
            console.log(y);
  
            pdf.addImage(barcodeDataUrl, "PNG", x, y, barcodeWidth, barcodeHeight);
            x += barcodeWidth + barcodeSpacingX;
          }
        });
  
        pdf.save("barcodes.pdf");
      };
  
      return {
        products,
        selectedProduct,
        printList,
        addProductToPrintList,
        removeProductFromPrintList,
        printBarcodes
      };
    }
  };
  </script>
  
  <style scoped>
  /* Add any necessary styles here */
  </style>
  
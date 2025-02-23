<template>
  <div>
    <canvas ref="qrCanvas"></canvas>
  </div>
</template>

<script setup>
import QRCode from 'qrcode';
import { onMounted, ref, watch } from 'vue';

const props = defineProps(['qrString']);
const qrCanvas = ref(null);

const generateQRCode = async () => {
  try {
    await QRCode.toCanvas(qrCanvas.value, props.qrString, { width: 300 });
  } catch (error) {
    console.error('Could not generate QR code:', error);
  }
}
watch(props, ()=>{
  generateQRCode();
})
onMounted(()=>{
  generateQRCode();
})
</script>

<style scoped>
/* Add any necessary styles here */
</style>
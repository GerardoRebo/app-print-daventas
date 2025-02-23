import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// import './index.css'
import router from "./router/index.js";
// import { RecycleScroller } from 'vue-virtual-scroller'
// import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import vuetify from './vuetify'
const pinia = createPinia()
const app = createApp(App);
// app.component('RecycleScroller', RecycleScroller)
app.use(pinia)
app.use(vuetify)
app.use(router)
app.mount('#app');
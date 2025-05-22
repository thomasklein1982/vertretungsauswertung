import { createApp } from 'vue'
import './style.css'
import PrimeVue from "primevue/config";
import App from './App.vue'
import Aura from "@primeuix/themes/aura";

const app=createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
app.mount('#app')

import { createApp } from 'vue'
import App from './App.vue'

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import './style/index.scss'

createApp(App)
    .use(Toast, {closeOnClick: false, draggable: false})
    .mount('#app')

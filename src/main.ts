import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import './assets/scss/common.scss';

import "./style.css"; // Tailwind 포함되어 있을 수 있음

createApp(App).use(router).mount("#app");
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./styles/_tokens.scss";
import "./styles/global.scss";
import './assets/scss/common.scss';
import "@/firebase/firebase";

createApp(App).use(router).mount("#app");
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./styles/_tokens.scss";
import "./styles/global.scss";
import './assets/scss/common.scss';
import "@/firebase/firebase";
// useAuth 초기화를 위해 import (모듈 레벨에서 onAuthStateChanged 구독 시작)
import "@/composables/useAuth";

createApp(App).use(router).mount("#app");
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

import router from "./router/index";
import { setupStore } from "@/store";
import { useThemeStore } from "@/store/themeStore";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "./styles/dark-overrides.css";

// 引入动画
import 'animate.css';
import "@/assets/font_4394635_lwuldvb474/iconfont.css";

setupStore(app);
useThemeStore().initTheme();
app.use(router);
app.use(ElementPlus);
app.mount("#app");


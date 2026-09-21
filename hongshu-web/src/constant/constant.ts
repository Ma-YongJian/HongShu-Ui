import loading from "@/assets/loading.png";
import error from "@/assets/error.png";
import { reactive } from "vue";

function trimSlash(value: string) {
  return value.replace(/\/$/, "");
}

const apiBase = trimSlash(import.meta.env.VITE_APP_BASE_API || "/dev-api");

export const baseURL = apiBase + "/";

export function buildWsUrl(uid: string, token?: string) {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const hostBase = apiBase.startsWith("http")
    ? apiBase.replace(/^http/, "ws")
    : `${proto}//${window.location.host}${apiBase}`;
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${hostBase}/web/ws/${uid}${query}`;
}

// 兼容旧引用：开发环境走当前站点 + /dev-api 代理
export const wsKey = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}${apiBase}/web/ws/`;

// 图片必须保持在336和186之间

export const options = reactive({
  // 唯一key值
  rowKey: "id",
  // 卡片之间的间隙
  gutter: 10,
  // 是否有周围的gutter
  hasAroundGutter: false,
  // 卡片在PC上的宽度
  width: 240,
  // 自定义行显示个数，主要用于对移动端的适配
  breakpoints: {
    2000: {
      // 当屏幕宽度小于等于1200
      rowPerView: 5,
    },
    1200: {
      // 当屏幕宽度小于等于1200
      rowPerView: 4,
    },
    1000: {
      // 当屏幕宽度小于等于800
      rowPerView: 3,
    },
  },
  // 动画效果
  animationEffect: "animate__zoomIn",
  // 动画时间
  animationDuration: 2000,
  // 动画延迟
  animationDelay: 300,
  // 背景色
  backgroundColor: "#2C2E3A",
  // imgSelector
  imgSelector: "src.original",
  // 加载配置
  loadProps: {
    loading,
    error,
  },
  // 是否懒加载
  lazyload: true,
});

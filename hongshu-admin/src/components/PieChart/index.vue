<template>
  <div
    :class="className"
    :style="{ height: height, width: width }"
    ref="chartRef"
  ></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as echarts from "echarts";
import "echarts/theme/macarons";
import { debounce } from "@/utils";

// 定义传入的 props
const props = defineProps({
  className: {
    type: String,
    default: "chart",
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "400px",
  },
  value: {
    type: Array,
    default: () => [],
  },
  tagName: {
    type: Array,
    default: () => [],
  },
});

// 获取 emit 函数
const emit = defineEmits(["clickPie"]);

// 定义图表相关的变量
const chartRef = ref(null);
let chart = null;

// 初始化图表
const initChart = () => {
  if (chart) {
    chart.dispose();
  }
  chart = echarts.init(chartRef.value, "macarons");

  chart.on("click", (param) => {
    emit("clickPie", param.dataIndex);
  });

  updateChart();
};

// 更新图表
const updateChart = () => {
  if (chart) {
    chart.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      legend: {
        left: "center",
        bottom: "10",
        data: props.tagName,
      },
      series: [
        {
          name: "笔记所占数目",
          type: "pie",
          roseType: "radius",
          radius: [15, 95],
          center: ["50%", "38%"],
          data: props.value,
          animationEasing: "cubicInOut",
          animationDuration: 2600,
        },
      ],
    });
  }
};

// 处理窗口大小调整
const resizeHandler = debounce(() => {
  if (chart) {
    chart.resize();
  }
}, 100);

onMounted(() => {
  initChart();
  window.addEventListener("resize", resizeHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler);
  if (chart) {
    chart.dispose();
    chart = null;
  }
});

// 监控 props 的变化并更新图表
watch(() => [props.value, props.tagName], updateChart);
</script>

<template>
  <div :class="['pie-panel', className]" :style="{ height: height, width: width }">
    <div v-if="!seriesData.length" class="pie-empty">暂无分类数据</div>
    <div v-else ref="chartRef" class="pie-canvas"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import { debounce } from "@/utils";

const PALETTE = [
  "#165DFF",
  "#14C9C9",
  "#F7BA1E",
  "#F77234",
  "#722ED1",
  "#00B42A",
  "#F5319D",
  "#3491FA",
  "#9FDB1D",
  "#D91AD9",
  "#0FC6C2",
  "#FF7D00",
];

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
    default: "340px",
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

const emit = defineEmits(["clickPie"]);

const chartRef = ref(null);
let chart = null;

function foldPieOthers(list, maxItems = 8) {
  const sorted = [...list]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  if (sorted.length <= maxItems) return sorted;
  const head = sorted.slice(0, maxItems - 1);
  const tail = sorted.slice(maxItems - 1);
  const otherVal = tail.reduce((sum, item) => sum + item.value, 0);
  if (otherVal <= 0) return head;
  return [...head, { name: "其他", value: otherVal, __others: true }];
}

const seriesData = computed(() => {
  const rows = (props.value || []).map((item, index) => ({
    ...item,
    name: item.name || props.tagName[index] || `分类${index + 1}`,
    value: Number(item.value) || 0,
  }));
  return foldPieOthers(rows);
});

const total = computed(() =>
  seriesData.value.reduce((sum, item) => sum + item.value, 0)
);

function outsidePercentFormatter(params) {
  const pct = params?.percent;
  if (pct == null || Number.isNaN(pct) || pct < 3) return "";
  return `${pct.toFixed(1)}%`;
}

function initChart() {
  if (!chartRef.value) return;
  if (chart) {
    chart.dispose();
  }
  chart = echarts.init(chartRef.value);
  chart.on("click", (param) => {
    const item = seriesData.value[param.dataIndex];
    if (!item || item.__others) return;
    emit("clickPie", item);
  });
  updateChart();
}

function updateChart() {
  if (!chart || !seriesData.value.length) return;
  const data = seriesData.value;
  chart.setOption(
    {
      color: PALETTE,
      legend: {
        type: "scroll",
        orient: "horizontal",
        left: "center",
        bottom: 2,
        data: data.map((item) => item.name),
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 14,
        pageButtonPosition: "end",
        pageIconSize: 10,
        textStyle: {
          color: "#86909C",
          fontSize: 11,
        },
        pageTextStyle: {
          color: "#86909C",
          fontSize: 10,
        },
        itemStyle: { borderWidth: 0 },
      },
      tooltip: {
        show: true,
        trigger: "item",
        confine: true,
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "#E5E6EB",
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: "#4E5969", fontSize: 12 },
        extraCssText: "box-shadow: 0 4px 14px rgba(15,23,42,0.08); border-radius: 8px;",
        formatter: (params) => {
          const pct =
            params?.percent != null ? Number(params.percent).toFixed(2) : "0.00";
          return `${params.name}<br/>数量：${params.value}<br/>占比：${pct}%`;
        },
      },
      graphic: {
        elements: [
          {
            type: "text",
            left: "center",
            top: "38%",
            style: {
              text: "合计",
              align: "center",
              fill: "#86909C",
              fontSize: 12,
            },
          },
          {
            type: "text",
            left: "center",
            top: "44%",
            style: {
              text: String(total.value),
              align: "center",
              fill: "#4E5969",
              fontSize: 22,
              fontWeight: 600,
            },
          },
        ],
      },
      series: [
        {
          type: "pie",
          radius: ["30%", "58%"],
          center: ["50%", "44%"],
          padAngle: 1.5,
          avoidLabelOverlap: true,
          minShowLabelAngle: 8,
          labelLayout: { hideOverlap: true },
          label: {
            show: true,
            position: "outside",
            formatter: outsidePercentFormatter,
            fontSize: 11,
            color: "#4E5969",
            fontWeight: 500,
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 8,
            smooth: 0.15,
            lineStyle: {
              color: "#C9CDD4",
              width: 1,
            },
          },
          emphasis: {
            scale: true,
            scaleSize: 5,
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 600,
              formatter: outsidePercentFormatter,
            },
            labelLine: {
              show: true,
              lineStyle: { width: 1.5 },
            },
          },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 2,
            borderRadius: 4,
            shadowBlur: 6,
            shadowColor: "rgba(29,33,41,0.08)",
          },
          data,
        },
      ],
    },
    true
  );
}

const resizeHandler = debounce(() => {
  if (chart) chart.resize();
}, 100);

onMounted(() => {
  nextTick(() => {
    initChart();
  });
  window.addEventListener("resize", resizeHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler);
  if (chart) {
    chart.dispose();
    chart = null;
  }
});

watch(
  seriesData,
  async () => {
    await nextTick();
    if (!seriesData.value.length) {
      if (chart) {
        chart.dispose();
        chart = null;
      }
      return;
    }
    if (!chart) {
      initChart();
    } else {
      updateChart();
      chart.resize();
    }
  },
  { deep: true }
);
</script>

<style scoped>
.pie-panel {
  width: 100%;
  min-width: 0;
}

.pie-canvas {
  width: 100%;
  height: 100%;
}

.pie-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  font-size: 13px;
}
</style>

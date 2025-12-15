<template>
  <div id="container" style="width: 100%; height: 300px"></div>
</template>

<script setup>
import { getBlogContributeCount } from "@/api/web/index";
import * as echarts from "echarts";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

const contributeDate = ref([]);
const blogContributeCount = ref([]);
let chart = null;

async function initDate() {
  try {
    const response = await getBlogContributeCount();
    if (response.code === 200) {
      contributeDate.value = response.data.contributeDate;
      blogContributeCount.value = response.data.blogContributeCount;
      renderChart();
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
}

function renderChart() {
  const container = document.getElementById("container");
  if (!container) {
    console.error("容器元素未找到");
    return;
  }

  if (!chart) {
    chart = echarts.init(container);
  }

  const option = {
    title: {
      top: 30,
      text: "笔记贡献度",
      subtext: "一年内笔记提交的数量",
      left: "center",
      textStyle: {
        color: "#000",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        return params.data[0] + "<br>笔记数：" + params.data[1];
      },
    },
    legend: {
      top: "30",
      left: "100",
      data: ["笔记数", "Top 12"],
      textStyle: {
        color: "#000",
      },
    },
    calendar: [
      {
        top: 100,
        left: "center",
        range: contributeDate.value,
        splitLine: {
          show: true,
          lineStyle: {
            color: "#D3D3D3",
            width: 4,
            type: "solid",
          },
        },
        yearLabel: { show: false },
        dayLabel: {
          nameMap: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
          textStyle: {
            color: "#000",
          },
          firstDay: 1,
        },
        monthLabel: {
          nameMap: "cn",
          textStyle: {
            color: "#000",
          },
        },
        itemStyle: {
          color: "#ffffff",
          borderWidth: 1,
          borderColor: "#D3D3D3",
        },
      },
    ],
    series: [
      {
        name: "笔记数",
        type: "scatter",
        coordinateSystem: "calendar",
        data: blogContributeCount.value,
        symbolSize: function (val) {
          let size = val[1] === 0 ? 0 : Math.min(18, 8 + val[1] * 2);
          return size;
        },
        itemStyle: {
          color: "#2ec7c9",
        },
      },
    ],
  };

  chart.setOption(option);
}

function resizeChart() {
  chart && chart.resize();
}

onMounted(() => {
  initDate();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  if (chart) {
    chart.dispose();
    chart = null;
  }
});

watch([contributeDate, blogContributeCount], renderChart);
</script>

<template>
  <div :class="className" :style="{ height: height, width: width }"></div>
</template>

<script>
import * as echarts from "echarts";
import { debounce } from "@/utils";

const PV_COLOR = "#165DFF";
const UV_COLOR = "#14C9C9";

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function areaLineSeries({ name, data, color }) {
  return {
    name,
    type: "line",
    data,
    smooth: 0.35,
    showSymbol: false,
    symbol: "circle",
    symbolSize: 7,
    sampling: "lttb",
    itemStyle: {
      color,
      borderWidth: 2,
      borderColor: "#fff",
    },
    lineStyle: {
      width: 2,
      color,
    },
    areaStyle: {
      color: {
        type: "linear",
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: hexToRgba(color, 0.22) },
          { offset: 1, color: hexToRgba(color, 0.02) },
        ],
      },
    },
    emphasis: {
      focus: "series",
      showSymbol: true,
      symbolSize: 8,
      lineStyle: { width: 2.5 },
    },
    animationDuration: 900,
    animationEasing: "cubicOut",
  };
}

export default {
  props: {
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
    autoResize: {
      type: Boolean,
      default: true,
    },
    chartData: {
      type: Object,
      default: () => ({ date: [], expectedData: [], actualData: [] }),
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.initChart();
    if (this.autoResize) {
      this.__resizeHanlder = debounce(() => {
        if (this.chart) this.chart.resize();
      }, 100);
      window.addEventListener("resize", this.__resizeHanlder);
      const sidebarElm = document.getElementsByClassName("sidebar-container")[0];
      if (sidebarElm) {
        sidebarElm.addEventListener("transitionend", this.__resizeHanlder);
      }
    }
  },
  beforeUnmount() {
    if (!this.chart) return;
    if (this.autoResize && this.__resizeHanlder) {
      window.removeEventListener("resize", this.__resizeHanlder);
      const sidebarElm = document.getElementsByClassName("sidebar-container")[0];
      if (sidebarElm) {
        sidebarElm.removeEventListener("transitionend", this.__resizeHanlder);
      }
    }
    this.chart.dispose();
    this.chart = null;
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val);
      },
    },
  },
  methods: {
    setOptions({ date, expectedData, actualData } = {}) {
      if (!this.chart) return;
      const labels = date || [];
      const pv = (expectedData || []).map((n) => Number(n) || 0);
      const uv = (actualData || []).map((n) => Number(n) || 0);
      this.chart.setOption(
        {
          color: [PV_COLOR, UV_COLOR],
          legend: {
            data: ["访问量(PV)", "独立用户(UV)"],
            top: 0,
            left: "center",
            itemWidth: 8,
            itemHeight: 8,
            itemGap: 16,
            icon: "roundRect",
            textStyle: {
              color: "#86909C",
              fontSize: 11,
            },
          },
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255,255,255,0.96)",
            borderColor: "#E5E6EB",
            borderWidth: 1,
            padding: [8, 12],
            textStyle: { color: "#4E5969", fontSize: 12 },
            extraCssText:
              "box-shadow: 0 4px 14px rgba(15,23,42,0.08); border-radius: 8px;",
            axisPointer: {
              type: "line",
              lineStyle: {
                color: "#C9CDD4",
                width: 1,
                type: "dashed",
              },
            },
            formatter: (params) => {
              if (!params || !params.length) return "";
              const header = `<div style="font-weight:600;color:#1D2129;margin-bottom:6px;">${params[0].axisValue}</div>`;
              const rows = params
                .map((item) => {
                  return `
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin:4px 0;min-width:140px;">
                      <span style="display:inline-flex;align-items:center;gap:6px;color:#4E5969;">
                        <i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${item.color};"></i>
                        ${item.seriesName}
                      </span>
                      <strong style="color:#1D2129;font-variant-numeric:tabular-nums;">${item.value}</strong>
                    </div>`;
                })
                .join("");
              return header + rows;
            },
          },
          grid: {
            left: "2%",
            right: "3%",
            bottom: "6%",
            top: "16%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: labels,
            boundaryGap: false,
            axisLine: { lineStyle: { color: "#E5E6EB" } },
            axisTick: { show: false },
            axisLabel: {
              color: "#86909C",
              fontSize: 10,
              margin: 10,
            },
          },
          yAxis: {
            type: "value",
            min: 0,
            minInterval: 1,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: "#86909C",
              fontSize: 10,
            },
            splitLine: {
              lineStyle: {
                color: "#F2F3F5",
                type: "dashed",
              },
            },
          },
          series: [
            areaLineSeries({
              name: "访问量(PV)",
              data: pv,
              color: PV_COLOR,
            }),
            areaLineSeries({
              name: "独立用户(UV)",
              data: uv,
              color: UV_COLOR,
            }),
          ],
        },
        true
      );
    },
    initChart() {
      this.chart = echarts.init(this.$el);
      this.setOptions(this.chartData);
    },
  },
};
</script>

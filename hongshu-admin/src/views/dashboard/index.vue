<template>
  <div class="dashboard-editor-container">
    <!-- 顶部内容 -->
    <el-row class="panel-group" :gutter="40">
      <!-- IP数 -->
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="btnClick('1')">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="eye" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">今日IP数：</div>
            <CountTo
              class="card-panel-num"
              :startVal="0"
              :endVal="visitAddTotal"
              :duration="3200"
            />
          </div>
        </div>
      </el-col>
      <!-- 用户数 -->
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="btnClick('2')">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">会员数:</div>
            <CountTo
              class="card-panel-num"
              :startVal="0"
              :endVal="userTotal"
              :duration="2600"
            />
          </div>
        </div>
      </el-col>
      <!-- 笔记数 -->
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="btnClick('4')">
          <div class="card-panel-icon-wrapper icon-shoppingCard">
            <svg-icon icon-class="form" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">笔记数:</div>
            <CountTo
              class="card-panel-num"
              :startVal="0"
              :endVal="blogTotal"
              :duration="3200"
            />
          </div>
        </div>
      </el-col>
      <!-- 评论数 -->
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="btnClick('3')">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="message" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">评论数：</div>
            <CountTo
              class="card-panel-num"
              :startVal="0"
              :endVal="commentTotal"
              :duration="3000"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <!--文章贡献度-->
    <el-row>
      <CalendarChart />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="10">
        <div class="chart-wrapper pie-card">
          <div class="chart-title pie-card__title">
            <span class="pie-card__title-icon">
              <svg-icon icon-class="form" />
            </span>
            <span class="pie-card__title-text">分类占比</span>
          </div>
          <div class="pie-chart-panel">
            <PieChart
              ref="blogSortPie"
              @clickPie="clickBlogSortPie"
              v-if="showPieBlogSortChart"
              :value="blogCountByBlogSort"
              :tagName="blogSortNameArray"
              height="340px"
            />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="14">
        <div class="chart-wrapper line-card">
          <div class="chart-title pie-card__title">
            <span class="pie-card__title-icon line-card__title-icon">
              <svg-icon icon-class="eye" />
            </span>
            <span class="pie-card__title-text">近 7 日访问</span>
          </div>
          <div class="pie-chart-panel">
            <LineChart v-if="showLineChart" :chart-data="lineChartData" height="340px" />
            <el-empty v-else description="暂无访问数据" :image-size="80" />
          </div>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { init, getVisitByWeek, getBlogCountByBlogSort } from "@/api/web/index";
import CountTo from "@/components/CountTo/index.js";
import CalendarChart from "@/components/CalendarChart";
import PieChart from "@/components/PieChart";
import LineChart from "@/components/LineChart";

const router = useRouter();

const blogTotal = ref(0);
const commentTotal = ref(0);
const userTotal = ref(0);
const visitAddTotal = ref(0);

const lineChartData = ref({
  date: [],
  expectedData: [],
  actualData: [],
});
const blogCountByBlogSort = ref([]);
const blogSortNameArray = ref([]);
const showLineChart = ref(false);
const showPieBlogSortChart = ref(false);

function clickBlogSortPie(payload) {
  const blogSort =
    payload && typeof payload === "object"
      ? payload
      : blogCountByBlogSort.value[payload];
  if (!blogSort || blogSort.__others) return;
  router.push({
    path: "/note/note",
    query: { blogSort: JSON.stringify(blogSort) },
  });
}

async function fetchData() {
  try {
    const [initResponse, visitResponse, blogSortResponse] = await Promise.all([
      init(),
      getVisitByWeek(),
      getBlogCountByBlogSort(),
    ]);

    if (initResponse.code === 200) {
      blogTotal.value = initResponse.data.blogCount;
      commentTotal.value = initResponse.data.commentCount;
      userTotal.value = initResponse.data.userCount;
      visitAddTotal.value = initResponse.data.visitCount;
    } else {
      console.error("Failed to fetch init data");
    }

    if (visitResponse.code === 200) {
      const visitByWeek = visitResponse.data || {};
      lineChartData.value = {
        date: visitByWeek.date || [],
        expectedData: visitByWeek.pv || [],
        actualData: visitByWeek.uv || [],
      };
      showLineChart.value = (visitByWeek.date || []).length > 0;
    } else {
      console.error("Failed to fetch visit data");
    }

    if (blogSortResponse.code === 200) {
      blogCountByBlogSort.value = blogSortResponse.data;
      const blogSortList = blogSortResponse.data;
      blogSortNameArray.value = blogSortList.map((blogSort) => blogSort.name);
      showPieBlogSortChart.value = true;
    } else {
      console.error("Failed to fetch blog count by blog sort");
    }
  } catch (error) {
    console.error("An error occurred while fetching data:", error);
  }
}

const btnClick = (id) => {
  const routes = {
    1: "/loginlog/loginlog",
    2: "/member/member",
    3: "/message/comment",
    4: "/note/note",
  };
  router.push({ path: routes[id] });
};

onMounted(fetchData);
</script>

<style scoped>
.dashboard-editor-container {
  padding: 42px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 8px;
    margin-bottom: 32px;
    min-height: 400px;
    border-radius: 8px;
  }
  .chart-title {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
    padding-left: 4px;
    text-align: left;
  }
  .pie-card .chart-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 0;
    text-align: center;
  }
  .pie-card__title {
    gap: 8px;
    height: 26px;
  }
  .pie-card__title-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 7px;
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.12);
    font-size: 14px;
  }
  .pie-card__title-text {
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
    line-height: 26px;
  }
  .pie-chart-panel {
    width: 100%;
    border-radius: 8px;
    background: #f7f8fa;
    border: 1px solid #e5e6eb;
    padding: 6px 4px 2px;
    box-sizing: border-box;
  }
  .line-card .chart-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 0;
    text-align: center;
  }
  .line-card .pie-chart-panel {
    min-height: 340px;
  }
  .line-card__title-icon {
    color: #14c9c9;
    background: rgba(20, 201, 201, 0.12);
  }
}
.btn {
  width: 80px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 14px;
  display: inline-block;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.btnClick {
  color: #3b82f6;
  border-color: #bfdbfe;
  background-color: #eff6ff;
}

.btn:hover {
  color: #3b82f6;
  border-color: #bfdbfe;
  background-color: #eff6ff;
}

.statistics-item {
  width: 600px;
  height: 400px;
  float: left;
  margin: 20px auto;
}

.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
        background: #40c9c6;
      }
      .icon-message {
        background: #36a3f7;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shoppingCard {
        background: #34bfa3;
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shoppingCard {
      color: #34bfa3;
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: left;
      font-weight: bold;
      margin: 26px 0 0 70px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
</style>

<template>
  <div class="dashboard-editor-container">
    <!-- 右上角github图标 -->
    <el-tooltip content="Github源码" effect="dark" placement="bottom">
      <GithubCorner style="position: absolute; top: 0px; border: 0; right: 0" />
    </el-tooltip>

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

    <!-- 分类图-->
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <PieChart
            ref="blogSortPie"
            @clickPie="clickBlogSortPie"
            v-if="showPieBlogSortChart"
            :value="blogCountByBlogSort"
            :tagName="blogSortNameArray"
          />
        </div>
      </el-col>

      <!-- <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <PieChart
            v-if="showPieChart"
            @clickPie="clickBlogTagPie"
            :value="blogCountByTag"
            :tagName="tagNameArray"
          />
        </div>
      </el-col> -->
    </el-row>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  init,
  getVisitByWeek,
  getBlogCountByTag,
  getBlogCountByBlogSort,
} from "@/api/web/index";
import CountTo from "@/components/CountTo/index.js";
import GithubCorner from "@/components/GithubCorner";
import CalendarChart from "@/components/CalendarChart";
import PieChart from "@/components/PieChart";

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
const blogCountByTag = ref({});
const blogCountByBlogSort = ref({});
const tagNameArray = ref([]);
const blogSortNameArray = ref([]);
const showLineChart = ref(false);
const showPieChart = ref(false);
const showPieBlogSortChart = ref(false);

function clickBlogSortPie(index) {
  const blogSort = blogCountByBlogSort.value[index];
  router.push({
    path: "/note/note",
    query: { blogSort: JSON.stringify(blogSort) },
  });
}

function clickBlogTagPie(index) {
  const tag = blogCountByTag.value[index];
  router.push({
    path: "/note/note",
    query: { tag: JSON.stringify(tag) },
  });
}

async function fetchData() {
  try {
    const [initResponse, visitResponse, tagResponse, blogSortResponse] =
      await Promise.all([
        init(),
        getVisitByWeek(),
        getBlogCountByTag(),
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
      const visitByWeek = visitResponse.data;
      lineChartData.date = visitByWeek.date;
      lineChartData.expectedData = visitByWeek.pv;
      lineChartData.actualData = visitByWeek.uv;
      showLineChart.value = true;
    } else {
      console.error("Failed to fetch visit data");
    }

    if (tagResponse.code === 200) {
      blogCountByTag.value = tagResponse.data;
      const tagList = tagResponse.data;
      tagNameArray.value = tagList.map((tag) => tag.name);
      showPieChart.value = true;
    } else {
      console.error("Failed to fetch blog count by tag");
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
    padding: 16px 16px 0;
    margin-bottom: 32px;
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
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
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

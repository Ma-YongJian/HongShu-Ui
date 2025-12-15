<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <!-- 项目介绍 -->
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2><b>红薯后台管理系统</b></h2>
        <p>
          仿小红书设计的一个基于Springboot架构的前后端分离项目。
          <br />
          此项目基于Springboot+vue架构的前后端分离系统。
          <br />
          Web 端使用Vue3+ts+ElementUi，后端使用 SpringBoot +
          Mybatis-plus进行开发。
          <br />
          使用ElasticSearch作为全文检索服务。
          <br />
          使用webSocket做聊天和消息推送。
        </p>
        <p>
          <b>当前版本:</b> <span>v{{ version }}</span>
        </p>
        <p>
          <el-tag type="danger">&yen;免费开源</el-tag>
        </p>
        <p>
          <el-button
            type="primary"
            icon="Cloudy"
            plain
            @click="goTarget('https://gitee.com/Maverick_Ma/hongshu')"
          >
            访问码云
          </el-button>
          <el-button
            icon="HomeFilled"
            plain
            @click="goTarget('https://gitee.com/Maverick_Ma/hongshu')"
          >
            访问主页
          </el-button>
        </p>
      </el-col>

      <!-- 技术介绍 -->
      <el-col :sm="24" :lg="12" style="padding-left: 100px">
        <el-row>
          <el-col :span="12">
            <h2><b>技术选型</b></h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <h4>后端技术</h4>
            <ul>
              <li>SpringBoot</li>
              <li>Spring Security</li>
              <li>JWT</li>
              <li>MyBatis</li>
              <li>Druid</li>
              <li>Fastjson</li>
              <li>...</li>
            </ul>
          </el-col>
          <el-col :span="6">
            <h4>前端技术</h4>
            <ul>
              <li>Vue</li>
              <li>Vuex</li>
              <li>Element-ui</li>
              <li>Axios</li>
              <li>Sass</li>
              <li>Quill</li>
              <li>...</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider />

    <!-- 服务器选择部署 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div
              class="clearfix"
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <span>项目部署</span>
              <div style="margin-left: auto">
                <el-link
                  href="https://www.yuque.com/xiaomage-ippj7/ghqo5y/tk2l80dcs7cgd8k9"
                  type="primary"
                  target="_blank"
                  >查看部署文档</el-link
                >
              </div>
            </div>
          </template>
          <div style="margin: 10px auto; text-align: center">
            <h3 class="text-danger">
              部署该项目选择 阿里云/腾讯云 “2核2G” 配置即可
            </h3>
          </div>
          <blockquote class="text-warning" style="font-size: 16px">
            阿里云服务器折扣区
            <br />
            <el-link
              href="https://www.aliyun.com/minisite/goods?source=5176.11533457&userCode=ojvsntx1"
              type="primary"
              target="_blank"
              >☛☛ 点我进入 ☚☚</el-link
            >
            <br />
            腾讯云服务器秒杀区
            <br />
            <el-link
              href="https://curl.qcloud.com/efTJbNyi"
              type="primary"
              target="_blank"
              >☛☛ 点我进入 ☚☚</el-link
            >
          </blockquote>
          <div style="margin: 20px 20px">
            <h4 class="text-danger">
              云产品通用红包，可叠加官网常规优惠使用。(仅限新用户)
            </h4>
          </div>
        </el-card>
      </el-col>

      <!-- 捐赠支持 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="6">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>捐赠支持</span>
            </div>
          </template>
          <div class="body">
            <img
              src="@/assets/images/pay.png"
              alt="donate"
              style="width: 92%"
            />
            <span
              style="
                display: inline-block;
                height: 30px;
                line-height: 30px;
                text-align: center;
                width: 90%;
              "
            >
              你可以请作者喝杯咖啡表示鼓励❤️
            </span>
          </div>
        </el-card>
      </el-col>

      <!-- 更新日志 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>更新日志</span>
            </div>
          </template>
          <el-collapse accordion>
            <el-collapse-item title="v1.0.0 - 2024-06-01">
              <ol>
                <li>红薯🍠前后端分离系统正式发布</li>
              </ol>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
    <el-divider />

    <el-row :gutter="20">
      <!-- 联系信息 -->
      <!-- <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>联系信息</span>
            </div>
          </template>
          <div class="body">
            <img
              src="@/assets/images/wx.png"
              alt="donate"
              class="center-img"
              style="width: 52%"
            />
            <span class="donate-text">备注：源码</span>
          </div>
        </el-card>
      </el-col> -->
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref("1.0.0");

function goTarget(url) {
  window.open(url, "__blank");
}
</script>

<style scoped lang="scss">
.donate-text {
  display: inline-block;
  height: 28px;
  line-height: 30px;
  text-align: center;
  width: 100%;
  margin-top: 10px; /* 调整与图片的间距 */
}
.center-img {
  width: 50%;
  display: block;
  margin: 0 auto;
}
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

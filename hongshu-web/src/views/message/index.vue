<template>
  <div class="notice-page">
    <div v-if="isLogin">
      <div class="notice-tabs">
        <el-badge :value="_countMessage.chatCount" :max="99" :hidden="_countMessage.chatCount == 0">
          <div :class="['tab-item', { active: type === 3 }]" @click="toPage(3)">消息</div>
        </el-badge>
        <el-badge :value="_countMessage.commentCount" :max="99" :hidden="_countMessage.commentCount == 0">
          <div :class="['tab-item', { active: type === 1 }]" @click="toPage(1)">评论和@</div>
        </el-badge>
        <el-badge
          :value="_countMessage.likeOrCollectionCount"
          :max="99"
          :hidden="_countMessage.likeOrCollectionCount == 0"
        >
          <div :class="['tab-item', { active: type === 0 }]" @click="toPage(0)">赞和收藏</div>
        </el-badge>
        <el-badge :value="_countMessage.followCount" :max="99" :hidden="_countMessage.followCount == 0">
          <div :class="['tab-item', { active: type === 2 }]" @click="toPage(2)">新增关注</div>
        </el-badge>
      </div>

      <div class="notice-body">
        <Message v-if="type == 3"></Message>
        <Comment v-if="type == 1" @click-main="toMain"></Comment>
        <LikeCollection v-if="type == 0" @click-main="toMain"></LikeCollection>
        <Follower v-if="type == 2"></Follower>
      </div>

      <Main
        v-show="mainShow"
        :nid="nid"
        :nowTime="new Date()"
        class="animate__animated animate__zoomIn animate__delay-0.5s"
        @click-main="close"
      ></Main>
    </div>
    <div v-else class="notice-guest">
      <el-empty description="登录后查看消息和通知">
        <el-button type="primary" round @click="openLogin()">去登录</el-button>
      </el-empty>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watchEffect, inject } from "vue";
import Message from "@/views/message/children/message.vue";
import LikeCollection from "@/views/message/children/like-collection.vue";
import Follower from "@/views/message/children/follower.vue";
import Comment from "@/views/message/children/comment.vue";
import Main from "@/views/main/main.vue";
import { useImStore } from "@/store/imStore";
import { clearMessageCount } from "@/api/im";
import { useUserStore } from "@/store/userStore";

const imStore = useImStore();
const userStore = useUserStore();
const openLogin = inject("openLogin", () => {});

const type = ref(3);
const nid = ref("");
const currentUid = ref("");
const mainShow = ref(false);
const _countMessage = ref({
  chatCount: 0,
  likeOrCollectionCount: 0,
  commentCount: 0,
  followCount: 0,
});
const isLogin = ref(false);

watchEffect(() => {
  _countMessage.value = imStore.countMessage;
});

const toPage = (val: number) => {
  type.value = val;
  if (val === 3 || !currentUid.value) {
    return;
  }
  const counts = imStore.countMessage;
  clearMessageCount(currentUid.value, val).then(() => {
    if (val === 0) {
      counts.likeOrCollectionCount = 0;
    } else if (val === 1) {
      counts.commentCount = 0;
    } else if (val === 2) {
      counts.followCount = 0;
    }
    imStore.setCountMessage(counts);
  });
};

const close = () => {
  mainShow.value = false;
};

const toMain = (val: string) => {
  nid.value = val;
  mainShow.value = true;
};

const initData = () => {
  isLogin.value = userStore.isLogin();
  if (isLogin.value) {
    currentUid.value = userStore.getUserInfo().id;
  }
};
initData();
</script>
<style lang="less" scoped>
.notice-page {
  flex: 1;
  padding: 72px 24px 32px;
  width: 67%;
  margin: 0 auto;
  min-height: calc(100vh - 72px);
  box-sizing: border-box;

  .notice-tabs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 16px 0 12px;
    position: sticky;
    top: 72px;
    z-index: 2;
    width: 100%;
    max-width: 40rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  .tab-item {
    height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 15px;
    color: rgba(51, 51, 51, 0.7);
    white-space: nowrap;
  }

  .tab-item.active {
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .notice-body {
    padding-top: 8px;
    width: 100%;
    max-width: 40rem;
  }

  .notice-guest {
    padding-top: 80px;
    max-width: 40rem;
  }
}
</style>

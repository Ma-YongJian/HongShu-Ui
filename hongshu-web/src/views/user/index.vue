<template>
  <div class="user-page">
    <div class="user">
      <div class="user-info">
        <div class="avatar">
          <div class="avatar-wrapper">
            <img :src="userInfo.avatar" class="user-image" style="border: 0.0625rem solid rgba(0, 0, 0, 0.08)" />
          </div>
        </div>
        <div class="info-part">
          <div class="info">
            <div class="basic-info">
              <div class="user-basic">
                <div class="user-nickname">
                  <div class="user-name">{{ userInfo.username }}</div>
                  <el-button v-if="uid === currentUid" type="primary" plain round size="small" @click="editShow = true">
                    编辑资料
                  </el-button>
                </div>
                <div class="user-content">
                  <span class="user-redId">来因号：{{ userInfo.hsId }}</span>
                  <span class="user-IP">IP属地：{{ userInfo.address }}</span>
                </div>
              </div>
            </div>
            <div class="user-desc">
              <span v-if="!userInfo.description">这个人什么都没有写～</span>
              <span v-else>{{ userInfo.description }}</span>
            </div>
            <div class="user-tags">
              <el-tag
                v-for="tag in tagList"
                :key="tag"
                effect="light"
                type="info"
                round
                style="margin-left: 0.3125rem"
              >
                {{ tag }}
              </el-tag>
              <span v-if="!tagList.length" class="no-tags">还没有添加标签</span>
            </div>
            <div class="data-info">
              <div class="user-interactions">
                <div>
                  <span class="count">{{ userInfo.trendCount }}</span
                  ><span class="shows">作品</span>
                </div>
                <div>
                  <span class="count">{{ userInfo.followerCount }}</span
                  ><span class="shows">关注</span>
                </div>
                <div>
                  <span class="count">{{ userInfo.fanCount }}</span
                  ><span class="shows">粉丝</span>
                </div>
              </div>
            </div>
          </div>
          <div class="follow"></div>
        </div>
        <div class="tool-btn" v-show="uid !== currentUid">
          <el-button :icon="ChatLineRound" circle @click="chatShow = true" />
          <el-button type="info" plain round v-if="_isFollow" @click="follow(uid, 1)">已关注</el-button>
          <el-button type="primary" round v-else @click="follow(uid, 0)">关注</el-button>
        </div>
      </div>
    </div>
    <div class="user-tabs">
      <div :class="['tab-item', { active: type == 1 }]" @click="toPage(1)">笔记</div>
      <div :class="['tab-item', { active: type == 2 }]" @click="toPage(2)">点赞</div>
      <div :class="['tab-item', { active: type == 3 }]" @click="toPage(3)">收藏</div>
    </div>
    <div class="feeds-tab-container">
      <Chat
        v-if="chatShow"
        :acceptUid="uid"
        class="animate__animated animate__zoomIn animate__delay-0.5s"
        @click-chat="chatShow = false"
      >
      </Chat>
      <Note :type="type"> </Note>
    </div>
    <UserEdit v-model="editShow" :user-info="userInfo" @success="initData" />
  </div>
</template>

<script lang="ts" setup>
import { ChatLineRound } from "@element-plus/icons-vue";
import { ref } from "vue";
import { getUserById } from "@/api/user";
import Note from "@/components/Note.vue";
import { useUserStore } from "@/store/userStore";
import Chat from "@/components/Chat.vue";
import { followById, isFollow } from "@/api/follower";
import { useRoute } from "vue-router";
import UserEdit from "./user-edit.vue";

const route = useRoute();
const userStore = useUserStore();
const currentUid = userStore.getUserInfo()?.id;
const userInfo = ref<any>({});
const uid = route.query.uid as string;
const type = ref(1);
const chatShow = ref(false);
const editShow = ref(false);
const _isFollow = ref(false);
const tagList = ref<string[]>([]);

const toPage = (val: number) => {
  type.value = val;
};

const follow = (fid: string, type: number) => {
  followById(fid).then(() => {
    _isFollow.value = type == 0;
  });
};

const initData = () => {
  getUserById(uid).then((res) => {
    userInfo.value = res.data;
    try {
      tagList.value = res.data.tags ? JSON.parse(res.data.tags) : [];
    } catch {
      tagList.value = [];
    }
  });
  isFollow(uid).then((res) => {
    _isFollow.value = res.data;
  });
};

initData();
</script>

<style lang="less" scoped>
.user-page {
  background: #fff;
  min-height: 100vh;

  .user {
    padding-top: 4.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .user-info {
      display: flex;
      justify-content: center;
      padding: 3rem 0;

      .avatar {
        .avatar-wrapper {
          text-align: center;
          width: 15.6667rem;
          height: 10.9667rem;

          .user-image {
            border-radius: 50%;
            margin: 0 auto;
            width: 70%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .info-part {
        position: relative;
        width: 100%;

        .info {
          @media screen and (min-width: 108rem) {
            width: 33.3333rem;
          }

          margin-left: 2rem;

          .basic-info {
            display: flex;
            align-items: center;

            .user-basic {
              width: 100%;

              .user-nickname {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;

                .user-name {
                  font-weight: 600;
                  font-size: 1.5rem;
                  line-height: 120%;
                  color: #333;
                }
              }

              .user-content {
                width: 100%;
                font-size: 0.75rem;
                line-height: 120%;
                color: rgba(51, 51, 51, 0.6);
                display: flex;
                margin-top: 0.5rem;

                .user-redId {
                  padding-right: 0.75rem;
                }
              }
            }
          }

          .user-desc {
            width: 100%;
            font-size: 0.875rem;
            line-height: 140%;
            color: #333;
            margin-top: 1rem;
            white-space: pre-line;
          }

          .user-tags {
            min-height: 1.5rem;
            margin-top: 1rem;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            font-size: 0.75rem;
            color: #333;

            .no-tags {
              color: rgba(51, 51, 51, 0.45);
              font-size: 0.8125rem;
            }
          }

          .data-info {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1.25rem;

            .user-interactions {
              width: 100%;
              display: flex;
              align-items: center;

              .count {
                font-weight: 500;
                font-size: 0.875rem;
                margin-right: 0.25rem;
              }

              .shows {
                color: rgba(51, 51, 51, 0.6);
                font-size: 0.875rem;
                line-height: 120%;
              }
            }

            .user-interactions > div {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              margin-right: 1rem;
            }
          }
        }

        .follow {
          position: absolute;
          margin-left: auto;
          display: block;
          right: 0;
          top: 0;
        }
      }

      .tool-btn {
        position: absolute;
        top: 50%;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  .user-tabs {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 8px 0 16px;
    background: #fff;

    .tab-item {
      height: 36px;
      padding: 0 16px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 15px;
      color: rgba(51, 51, 51, 0.7);
    }

    .tab-item.active {
      font-weight: 600;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }

  .feeds-tab-container {
    padding-left: 2rem;
  }
}
</style>

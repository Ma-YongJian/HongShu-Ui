<template>
  <div class="container" v-infinite-scroll="loadMoreData" :infinite-scroll-distance="50">
    <div v-if="isLogin">
      <template v-if="trendTotal > 0">
        <ul class="trend-container">
          <li class="trend-item" v-for="(item, index) in trendData" :key="index">
            <a class="user-avatar">
              <img class="avatar-item" :src="item.avatar" @click="toUser(item.uid)" />
            </a>
            <div class="main">
              <div class="info">
                <div class="user-info">
                  <a class>{{ item.username }}</a>
                </div>
                <div class="interaction-hint">
                  <span>{{ item.time }}</span>
                </div>
                <div class="interaction-content" @click="toMain(item.nid)">
                  {{ item.content }}
                </div>
                <div class="interaction-imgs" @click="toMain(item.nid)">
                  <!-- 限制最多显示三张图片 -->
                  <div
                    class="details-box"
                    v-for="(url, index) in item.imgUrls.slice(0, 3)"
                    :key="index"
                    style="position: relative"
                  >
                    <el-image
                      v-if="!item.isLoading"
                      :src="url"
                      @load="handleLoad(item)"
                      style="height: 230px; width: 100%"
                    ></el-image>
                    <el-image
                      v-else
                      :src="url"
                      class="note-img animate__animated animate__fadeIn animate__delay-0.5s"
                      fit="cover"
                      style="height: 230px; width: 100%"
                    ></el-image>

                    <!-- 在第三张图片上显示覆盖标识 -->
                    <div v-if="index === 2 && item.imgUrls.length > 3" class="overlay">
                      <span class="more-text">+{{ item.imgUrls.length - 3 }}</span>
                    </div>
                  </div>
                </div>
                <div class="interaction-footer">
                  <div class="icon-item">
                    <i
                      class="iconfont icon-follow-fill"
                      :style="{ width: '1em', height: '1em', color: item.isLike ? 'red' : 'black' }"
                      @click="like(item.nid, item.uid, index, -1)"
                      v-if="item.isLike"
                    >
                    </i>
                    <i
                      class="iconfont icon-follow"
                      style="width: 1em; height: 1em"
                      @click="like(item.nid, item.uid, index, 1)"
                      v-else
                    ></i
                    ><span class="count">{{ item.likeCount }}</span>
                  </div>
                  <div class="icon-item">
                    <ChatRound style="width: 0.9em; height: 0.9em" /><span class="count">{{ item.commentCount }}</span>
                  </div>
                  <div class="icon-item">
                    <More style="width: 1em; height: 1em" />
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </template>
      <template v-else>
        <div class="el-empty">
          <div class="el-empty__image">
            <svg
              viewBox="0 0 79 86"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
            >
              <defs>
                <linearGradient id="linearGradient-1-el-id-2187-74" x1="38.8503086%" y1="0%" x2="61.1496914%" y2="100%">
                  <stop stop-color="var(--el-empty-fill-color-1)" offset="0%"></stop>
                  <stop stop-color="var(--el-empty-fill-color-4)" offset="100%"></stop>
                </linearGradient>
                <linearGradient id="linearGradient-2-el-id-2187-74" x1="0%" y1="9.5%" x2="100%" y2="90.5%">
                  <stop stop-color="var(--el-empty-fill-color-1)" offset="0%"></stop>
                  <stop stop-color="var(--el-empty-fill-color-6)" offset="100%"></stop>
                </linearGradient>
                <rect id="path-3-el-id-2187-74" x="0" y="0" width="17" height="36"></rect>
              </defs>
              <g id="Illustrations" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="B-type" transform="translate(-1268.000000, -535.000000)">
                  <g id="Group-2" transform="translate(1268.000000, 535.000000)">
                    <path
                      id="Oval-Copy-2"
                      d="M39.5,86 C61.3152476,86 79,83.9106622 79,81.3333333 C79,78.7560045 57.3152476,78 35.5,78 C13.6847524,78 0,78.7560045 0,81.3333333 C0,83.9106622 17.6847524,86 39.5,86 Z"
                      fill="var(--el-empty-fill-color-3)"
                    ></path>
                    <polygon
                      id="Rectangle-Copy-14"
                      fill="var(--el-empty-fill-color-7)"
                      transform="translate(27.500000, 51.500000) scale(1, -1) translate(-27.500000, -51.500000) "
                      points="13 58 53 58 42 45 2 45"
                    ></polygon>
                    <g
                      id="Group-Copy"
                      transform="translate(34.500000, 31.500000) scale(-1, 1) rotate(-25.000000) translate(-34.500000, -31.500000) translate(7.000000, 10.000000)"
                    >
                      <polygon
                        id="Rectangle-Copy-10"
                        fill="var(--el-empty-fill-color-7)"
                        transform="translate(11.500000, 5.000000) scale(1, -1) translate(-11.500000, -5.000000) "
                        points="2.84078316e-14 3 18 3 23 7 5 7"
                      ></polygon>
                      <polygon
                        id="Rectangle-Copy-11"
                        fill="var(--el-empty-fill-color-5)"
                        points="-3.69149156e-15 7 38 7 38 43 -3.69149156e-15 43"
                      ></polygon>
                      <rect
                        id="Rectangle-Copy-12"
                        fill="url(#linearGradient-1-el-id-2187-74)"
                        transform="translate(46.500000, 25.000000) scale(-1, 1) translate(-46.500000, -25.000000) "
                        x="38"
                        y="7"
                        width="17"
                        height="36"
                      ></rect>
                      <polygon
                        id="Rectangle-Copy-13"
                        fill="var(--el-empty-fill-color-2)"
                        transform="translate(39.500000, 3.500000) scale(-1, 1) translate(-39.500000, -3.500000) "
                        points="24 7 41 7 55 -3.63806207e-12 38 -3.63806207e-12"
                      ></polygon>
                    </g>
                    <rect
                      id="Rectangle-Copy-15"
                      fill="url(#linearGradient-2-el-id-2187-74)"
                      x="13"
                      y="45"
                      width="40"
                      height="36"
                    ></rect>
                    <g id="Rectangle-Copy-17" transform="translate(53.000000, 45.000000)">
                      <use
                        id="Mask"
                        fill="var(--el-empty-fill-color-8)"
                        transform="translate(8.500000, 18.000000) scale(-1, 1) translate(-8.500000, -18.000000) "
                        xlink:href="#path-3-el-id-2187-74"
                      ></use>
                      <polygon
                        id="Rectangle-Copy"
                        fill="var(--el-empty-fill-color-9)"
                        mask="url(#mask-4-el-id-2187-74)"
                        transform="translate(12.000000, 9.000000) scale(-1, 1) translate(-12.000000, -9.000000) "
                        points="7 0 24 0 20 18 7 16.5"
                      ></polygon>
                    </g>
                    <polygon
                      id="Rectangle-Copy-18"
                      fill="var(--el-empty-fill-color-2)"
                      transform="translate(66.000000, 51.500000) scale(-1, 1) translate(-66.000000, -51.500000) "
                      points="62 45 79 45 70 58 53 58"
                    ></polygon>
                  </g>
                </g>
              </g>
            </svg>
          </div>
          <div class="el-empty__description"><p>暂无动态～</p></div>
        </div>
      </template>
      <FloatingBtn @click-refresh="refresh"></FloatingBtn>
      <Main
        v-show="mainShow"
        :nid="nid"
        :nowTime="new Date()"
        class="animate__animated animate__zoomIn animate__delay-0.5s"
        @click-main="close"
      ></Main>
    </div>
    <div v-else>
      <el-empty description="用户未登录" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChatRound, More } from "@element-plus/icons-vue";
import { ref } from "vue";
import { getFollowTrend } from "@/api/follower";
import { formateTime, refreshTab } from "@/utils/util";
import FloatingBtn from "@/components/FloatingBtn.vue";
import Main from "@/views/main/main.vue";
import type { LikeOrCollectionDTO } from "@/type/likeOrCollection";
import { likeOrCollectionByDTO } from "@/api/likeOrCollection";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";

const router = useRouter();
const userStore = useUserStore();
const currentPage = ref(1);
const pageSize = ref(5);
const trendData = ref<Array<any>>([]);
const trendTotal = ref(0);
const topLoading = ref(false);
const mainShow = ref(false);
const nid = ref("");
const likeOrCollectionDTO = ref<LikeOrCollectionDTO>({
  likeOrCollectionId: "",
  publishUid: "",
  type: 0,
});
const isLogin = ref(false);

const handleLoad = (item: any) => {
  item.isLoading = true;
};

const toUser = (uid: string) => {
  //router.push({ name: "user", state: { uid: uid } });
  router.push({ name: "user", query: { uid: uid } });
};

const getFollowTrends = () => {
  getFollowTrend(currentPage.value, pageSize.value).then((res) => {
    const { records, total } = res.data;
    records.forEach((item: any) => {
      item.time = formateTime(item.time);
      trendData.value.push(item);
    });
    trendTotal.value = total;
  });
};

const loadMoreData = () => {
  currentPage.value += 1;
  getFollowTrends();
};

const toMain = (noteId: string) => {
  nid.value = noteId;
  mainShow.value = true;
};

const close = (nid: string, val: any) => {
  const index = trendData.value.findIndex((item) => item.nid === nid);
  console.log("---val", val, index);
  const _data = trendData.value[index];
  if (_data.isLike != val.isLike) {
    _data.isLike = val.isLike;
    _data.likeCount += val.isLike ? 1 : -1;
  }
  if (val.isComment) {
    _data.commentCount += 1;
  }
  mainShow.value = false;
};

const refresh = () => {
  refreshTab(() => {
    topLoading.value = true;
    setTimeout(() => {
      currentPage.value = 1;
      trendData.value = [];
      getFollowTrends();
      topLoading.value = false;
    }, 500);
  });
};

const like = (nid: string, uid: string, index: number, val: number) => {
  likeOrCollectionDTO.value.likeOrCollectionId = nid;
  likeOrCollectionDTO.value.publishUid = uid;
  likeOrCollectionDTO.value.type = 1;
  likeOrCollectionByDTO(likeOrCollectionDTO.value).then(() => {
    if (val < 0 && trendData.value[index].likeCount == 0) {
      return;
    }
    trendData.value[index].isLike = val == 1;
    trendData.value[index].likeCount += val;
  });
};

const initData = () => {
  isLogin.value = userStore.isLogin();
  getFollowTrends();
};

initData();
</script>

<style lang="less" scoped>
.details-box {
  position: relative;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}

.more-text {
  color: white;
  font-size: 20px;
}

.container {
  flex: 1;
  padding: 0 24px;
  padding-top: 72px;
  width: 67%;
  height: 100vh;
  margin: 0 auto;

  .feeds-loading {
    margin: 3vh;
    text-align: center;
  }

  .trend-container {
    .trend-item {
      display: flex;
      flex-direction: row;
      padding-top: 24px;
      max-width: 100vw;

      .user-avatar {
        margin-right: 24px;
        flex-shrink: 0;

        .avatar-item {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 100%;
          border: 1px solid rgba(0, 0, 0, 0.08);
          object-fit: cover;
        }
      }

      .main {
        flex-grow: 1;
        flex-shrink: 1;
        display: flex;
        flex-direction: row;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);

        .info {
          flex-grow: 1;
          flex-shrink: 1;

          .user-info {
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;

            a {
              color: #333;
            }
          }

          .interaction-hint {
            font-size: 14px;
            color: rgba(51, 51, 51, 0.6);
            margin-bottom: 8px;
          }

          .interaction-content {
            display: flex;
            font-size: 14px;
            color: #333;
            margin-bottom: 12px;
            line-height: 140%;
            cursor: pointer;
          }

          .interaction-imgs {
            display: flex;

            .details-box {
              width: 25%;
              border-radius: 4px;
              margin: 8px 12px 0 0;
              cursor: pointer;

              .note-img {
                width: 100%;
                height: 230px;
                display: flex;
                border-radius: 10px;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                object-fit: cover;
              }
            }
          }

          .interaction-footer {
            margin: 8px 12px 0 0;
            padding: 0 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .icon-item {
              display: flex;
              justify-content: left;
              align-items: center;
              color: rgba(51, 51, 51, 0.929);

              .count {
                margin-left: 3px;
              }
            }
            :hover {
              cursor: pointer; /* 显示小手指针 */
              transform: scale(1.2); /* 鼠标移入时按钮稍微放大 */
            }
          }
        }
      }
    }
  }
}
</style>

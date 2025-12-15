<template>
  <div class="container" id="container">
    <div class="top">
      <header class="mask-paper">
        <a style="display: flex">
          <img src="@/assets/logo.png" style="width: 80px" />
        </a>
        <div class="tool-box"></div>
        <div class="input-box" id="sujContainer">
          <input
            type="text"
            v-model="keyword"
            class="search-input"
            placeholder="搜索小红书"
            @input="changeInput"
            @focus="focusInput"
            @keyup.enter="searchPage"
            ref="SearchInput"
          />
          <div class="input-button">
            <div class="close-icon" v-show="showClose" @click="clearInput">
              <Close style="width: 1.2em; height: 1.2em; margin-right: 20px; margin-top: 5px" />
            </div>
            <div class="search-icon" @click="searchPage">
              <a href="#">
                <Search style="width: 1.2em; height: 1.2em; margin-right: 20px; margin-top: 5px" />
              </a>
            </div>
          </div>
          <SearchContainer v-show="showSearch" :recordList="recordList"></SearchContainer>
          <SujContainer v-show="showHistory" :closeHistoryRecord="showHistory"></SujContainer>
        </div>
        <div class="right">
          <el-tooltip
            content="移动端"
            effect="dark"
            placement="bottom"
          >
            <Iphone class="right-icon" @click="handleClick('http://115.190.73.103/app')" />
          </el-tooltip>

          <el-tooltip
            content="后台管理"
            effect="dark"
            placement="bottom"
          >
            <Monitor class="right-icon" @click="handleClick('http://115.190.73.103/admin')" />
          </el-tooltip>

          <el-tooltip
            content="Arco后台"
            effect="dark"
            placement="bottom"
          >
            <DataLine class="right-icon" @click="handleClick('http://115.190.73.103/arco-admin')" />
          </el-tooltip>

          <el-tooltip
            content="码云仓库"
            effect="dark"
            placement="bottom"
          >
            <span class="right-icon" @click="handleClick('https://gitee.com/Maverick_Ma')">
              <svg t="1746051409026" class="icon" viewBox="0 0 1242 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8939" width="25" height="25">
                <path d="M531.252288 0C248.42147 0 19.252288 229.169181 19.252288 512S248.42147 1024 531.252288 1024s512-229.169181 512-512S814.083107 0 531.252288 0zM389.527887 678.340777h234.31905c40.786964 0 73.952122-33.062161 73.952123-73.952123v-12.256689c0-13.595655-11.02072-24.719372-24.719373-24.719372H500.45607c-13.698652 0-24.719372-11.02072-24.719372-24.719372v-61.592436c0-13.698652 11.02072-24.719372 24.719372-24.719373H784.007871c13.595655 0 24.719372 11.02072 24.719372 24.719373v141.724401c0 91.976665-74.570107 166.443774-166.443774 166.443774H278.496706c-13.595655 0-24.719372-11.02072-24.719372-24.719372v-345.04124c0-102.070408 82.809897-184.880306 184.880305-184.880305H784.007871c13.698652 0 24.719372 11.02072 24.719372 24.719372l-0.102997 61.592436c0 13.698652-11.02072 24.719372-24.719373 24.719372H438.760637c-40.786964 0-73.952122 33.062161-73.952123 73.952123v234.216053c0 13.492657 11.02072 24.513378 24.719373 24.513378z" fill="#C2191F" p-id="8940"></path>
              </svg>
            </span>
          </el-tooltip>

          <el-tooltip
            content="GitHub仓库"
            effect="dark"
            placement="bottom"
          >
            <span class="right-icon" @click="handleClick('https://github.com/Ma-YongJian')">
              <svg t="1746051827779" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9914" width="25" height="25">
                <path d="M960 512c0 97.76-28.704 185.216-85.664 263.264-56.96 78.016-130.496 131.84-220.64 161.856-10.304 1.824-18.368 0.448-22.848-4.032a22.4 22.4 0 0 1-7.2-17.504v-122.88c0-37.632-10.304-65.44-30.464-82.912a409.856 409.856 0 0 0 59.616-10.368 222.752 222.752 0 0 0 54.72-22.816c18.848-10.784 34.528-23.36 47.104-38.592 12.544-15.232 22.848-35.904 30.912-61.44 8.096-25.568 12.128-54.688 12.128-87.904 0-47.072-15.232-86.976-46.208-120.16 14.368-35.456 13.024-74.912-4.48-118.848-10.752-3.616-26.432-1.344-47.072 6.272s-38.56 16.16-53.824 25.568l-21.984 13.888c-36.32-10.304-73.536-15.232-112.096-15.232s-75.776 4.928-112.096 15.232a444.48 444.48 0 0 0-24.672-15.68c-10.336-6.272-26.464-13.888-48.896-22.432-21.952-8.96-39.008-11.232-50.24-8.064-17.024 43.936-18.368 83.424-4.032 118.848-30.496 33.632-46.176 73.536-46.176 120.608 0 33.216 4.032 62.336 12.128 87.456 8.032 25.12 18.368 45.76 30.496 61.44 12.544 15.68 28.224 28.704 47.072 39.04 18.848 10.304 37.216 17.92 54.72 22.816a409.6 409.6 0 0 0 59.648 10.368c-15.712 13.856-25.12 34.048-28.704 60.064a99.744 99.744 0 0 1-26.464 8.512 178.208 178.208 0 0 1-33.184 2.688c-13.024 0-25.568-4.032-38.144-12.544-12.544-8.512-23.296-20.64-32.256-36.32a97.472 97.472 0 0 0-28.256-30.496c-11.232-8.064-21.088-12.576-28.704-13.92l-11.648-1.792c-8.096 0-13.92 0.928-17.056 2.688-3.136 1.792-4.032 4.032-2.688 6.72s3.136 5.408 5.376 8.096 4.928 4.928 7.616 7.168l4.032 2.688c8.544 4.032 17.056 11.232 25.568 21.984 8.544 10.752 14.368 20.64 18.4 29.6l5.824 13.44c4.928 14.816 13.44 26.912 25.568 35.872 12.096 8.992 25.088 14.816 39.008 17.504 13.888 2.688 27.36 4.032 40.352 4.032s23.776-0.448 32.288-2.24l13.472-2.24c0 14.784 0 32.288 0.416 52.032 0 19.744 0.48 30.496 0.48 31.392a22.624 22.624 0 0 1-7.648 17.472c-4.928 4.48-12.992 5.824-23.296 4.032-90.144-30.048-163.68-83.84-220.64-161.888C92.256 697.216 64 609.312 64 512c0-81.152 20.192-156.064 60.096-224.672s94.176-122.88 163.232-163.232C355.936 84.192 430.816 64 512 64s156.064 20.192 224.672 60.096 122.88 94.176 163.232 163.232C939.808 355.488 960 430.848 960 512" fill="#000000" p-id="9915"></path>
              </svg>
            </span>
          </el-tooltip>
        </div>
      </header>
    </div>
    <div class="main">
      <div class="side-bar">
        <ul class="channel-list">
          <li :class="activeLink == 0 ? 'active-channel' : ''" @click="toLink(0)">
            <a class="link-wrapper">
              <House style="width: 1.3em; height: 1.3em; margin-right: 8px" /><span class="channel">发现</span>
            </a>
          </li>
          <li :class="activeLink == 1 ? 'active-channel' : ''" @click="toLink(1)">
            <Star style="width: 1.3em; height: 1.3em; margin-right: 8px" /><span class="channel"> 动态</span>
          </li>
          <li :class="activeLink == 2 ? 'active-channel' : ''" @click="toLink(2)">
            <Bell style="width: 1.3em; height: 1.3em; margin-right: 8px" />

            <el-badge is-dot class="item" v-if="messageCount > 0 && userInfo != null">
              <span class="channel"> 通知</span></el-badge
            >
            <span class="channel" v-else>通知</span>
          </li>
          <li :class="activeLink == 3 ? 'active-channel' : ''" @click="toLink(3)">
            <CirclePlus style="width: 1.3em; height: 1.3em; margin-right: 8px" /><span class="channel"> 发布</span>
          </li>
          <div v-if="userInfo == null">
            <el-button type="danger" round @click="login" class="custom-button">登录</el-button>
          </div>
          <li v-else :class="activeLink == 4 ? 'active-channel' : ''" @click="toLink(4)">
            <el-avatar :src="userInfo.avatar" :size="22" />
            <span class="channel">我</span>
          </li>
        </ul>

        <div v-if="userInfo == null">
          <div data-v-6432121e="" data-v-7d49aed8="" class="floating-box visible">
            <div data-v-6432121e="" class="title">马上登录即可</div>
            <div data-v-6432121e="" class="line-container">
              <svg data-v-23d27ada="" data-v-6432121e="" class="reds-icon icon" width="16" height="16">
                <use data-v-23d27ada="" xlink:href="#thumbUp"></use>
              </svg>
              <span data-v-6432121e="" class="desc">刷到更懂你的优质内容</span>
            </div>
            <div data-v-6432121e="" class="line-container">
              <svg data-v-23d27ada="" data-v-6432121e="" class="reds-icon icon" width="16" height="16">
                <use data-v-23d27ada="" xlink:href="#convention_b"></use>
              </svg>
              <span data-v-6432121e="" class="desc">搜索最新种草、拔草信息</span>
            </div>
            <div data-v-6432121e="" class="line-container">
              <svg data-v-23d27ada="" data-v-6432121e="" class="reds-icon icon" width="16" height="16">
                <use data-v-23d27ada="" xlink:href="#collect"></use>
              </svg>
              <span data-v-6432121e="" class="desc">查看收藏、点赞的笔记</span>
            </div>
            <div data-v-6432121e="" class="line-container">
              <svg data-v-23d27ada="" data-v-6432121e="" class="reds-icon icon" width="16" height="16">
                <use data-v-23d27ada="" xlink:href="#chat"></use>
              </svg>
              <span data-v-6432121e="" class="desc">与他人更好地互动、交流</span>
            </div>
          </div>
        </div>

        <!-- 嵌入 SVG 图标定义 -->
        <svg style="display: none">
          <symbol id="thumbUp" viewBox="0 0 24 24">
            <!-- SVG 路径数据 -->
            <path
              d="M1 21h4V9H1v12zM23 10h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L16.17 3 9.59 9.59C9.21 9.95 9 10.45 9 11v8c0 .55.45 1 1 1h6c.38 0 .72-.21.89-.55l3.66-7.33c.08-.14.13-.3.13-.46V11c0-.55-.45-1-1-1zm-2 7h-4v-6h4v6z"
            />
          </symbol>
          <symbol id="convention_b" viewBox="0 0 24 24">
            <!-- SVG 路径数据 -->
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
            />
          </symbol>
          <symbol id="collect" viewBox="0 0 24 24">
            <!-- SVG 路径数据 -->
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </symbol>
          <symbol id="chat" viewBox="0 0 24 24">
            <!-- SVG 路径数据 -->
            <path d="M20 2H4c-1.1 0-2 .9-2 2v14l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 9H6V9h12v2zm0-3H6V6h12v2z" />
          </symbol>
        </svg>

        <div class="information-container" id="informationContainer">
          <div class="information-pad" v-show="padShow">
            <div class="container">
              <div class="group-wrapper">
                <a
                  class="menu-item hover-effect links"
                  target="_blank"
                  href="https://agree.xiaohongshu.com/h5/terms/ZXXY20220331001/-1"
                >
                  <span>关于小红书</span>
                  <div class="icon">
                    <ArrowRight style="width: 1em; height: 1em; margin-right: 8px" />
                  </div>
                </a>
                <a
                  class="menu-item hover-effect links"
                  target="_blank"
                  href="https://agree.xiaohongshu.com/h5/terms/ZXXY20220509001/-1"
                >
                  <span>隐私，协议</span>
                  <div class="icon">
                    <ArrowRight style="width: 1em; height: 1em; margin-right: 8px" />
                  </div>
                </a>
                <div class="menu-item hover-effect">
                  <a href="#" @click="toUpshow = true">
                    <span> 帮助与客服 </span>
                  </a>
                </div>
              </div>
              <div>
                <div class="group-wrapper">
                  <div class="group-header">设置</div>
                  <div class="menu-item hover-effect">
                    <span>深色模式</span>
                    <div class="multistage-toggle component">
                      <button class="toggle-item active">
                        <div class="icon-wrapper">
                          <Sunny style="width: 1em; height: 1em" />
                        </div>
                      </button>
                      <button class="toggle-item">
                        <div class="icon-wrapper">
                          <Moon style="width: 1em; height: 1em" />
                        </div>
                      </button>
                    </div>
                  </div>
                  <div v-if="userInfo != null">
                    <div class="menu-item hover-effect" @click="logout">
                      <a href="#"><span>退出登录</span></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="information-wrapper" @click="loadPad">
            <!-- <More style="width: 1em; height: 1em; margin-right: 8px" /> -->
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M19.75 12a.75.75 0 0 0-.75-.75H5a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 .75-.75m0-5a.75.75 0 0 0-.75-.75H5a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 .75-.75m0 10a.75.75 0 0 0-.75-.75H5a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 .75-.75"
                clip-rule="evenodd"
              />
            </svg>
            <span class="channel">更多</span>
          </div>
        </div>
      </div>
      <div class="main-content with-side-bar">
        <router-view />
      </div>
    </div>
    <Login v-show="loginShow" @click-child="close"></Login>
    <ToUP v-show="toUpshow" @click-to-up="toUpshow = false"></ToUP>
  </div>
</template>

<script lang="ts" setup>
import {
  Search,
  Sunny,
  Moon,
  Close,
  House,
  Star,
  Bell,
  ArrowRight,
  CirclePlus,
  Iphone,
  Monitor,
  DataLine,
} from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
import Login from "@/views/login.vue";
import { ref, watch, onMounted, computed, watchEffect } from "vue";
import { useUserStore } from "@/store/userStore";
import { useSearchStore } from "@/store/searchStore";
import SujContainer from "@/components/SujContainer.vue";
import SearchContainer from "@/components/SearchContainer.vue";
import { addRecord, getRecordByKeyWord } from "@/api/search";
import { getRandomString } from "@/utils/util";
import { getChatUserList, getCountMessage } from "@/api/im";
import { useImStore } from "@/store/imStore";
import { loginOut } from "@/api/user";
import { wsKey } from "@/constant/constant";
import ToUP from "@/views/to-up/index.vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const searchStore = useSearchStore();
const imStore = useImStore();
const loginShow = ref(true);
const userInfo = ref<any>({});
const showHistory = ref(false);
const showSearch = ref(false);
const keyword = ref("");
const showClose = ref(false);
const SearchInput = ref();
const recordList = ref<Array<string>>([]);
const activeLink = ref(1);
const padShow = ref(false);
const ws = ref();
const toUpshow = ref(false);
const isShowDot = ref(false);

const routerList = ["/dashboard", "/followTrend", "/notice", "/push", "/user", "/search"];

// 监听外部点击
onMounted(() => {
  document.getElementById("container")!.addEventListener("click", function (e) {
    let event = e || window.event;
    let target = event.target || (event.srcElement as any);
    isInDiv("sujContainer", target).then((data) => {
      if (!data) {
        showHistory.value = false;
        showSearch.value = false;
      }
    });

    isInDiv("informationContainer", target).then((data) => {
      if (!data) {
        padShow.value = false;
      }
    });
  });
});

const isInDiv = (dom: string, target: any) => {
  return new Promise((res) => {
    const data = document.getElementById(dom)!.contains(target);
    res(data);
  });
};

const searchPage = () => {
  // 1.storage中添加搜索记录
  searchStore.setKeyword(keyword.value);
  if (keyword.value.length > 0) {
    addRecord(keyword.value);
    searchStore.pushRecord(keyword.value);
    searchStore.setSeed(getRandomString(12));
  }
  showSearch.value = false;

  router.push({ name: "search", query: { keyword: keyword.value } });
};

watch(
  () => [searchStore.seed, route.query.date],
  (newVal, oldVal) => {
    if (newVal[0] != oldVal[0]) {
      keyword.value = searchStore.keyWord;
      showHistory.value = false;
      showSearch.value = false;
    }
    if (newVal[1] != oldVal[1]) {
      initData();
    }
  },
  {
    deep: true,
  }
);

watch(
  () => [imStore.countMessage],
  (val) => {
    const allCount = val[0].chatCount + val[0].likeOrCollectionCount + val[0].commentCount + val[0].followCount;
    if (allCount === 0) {
      isShowDot.value = false;
    }
  },
  {
    deep: true,
  }
);

const messageCount = computed({
  get: () => {
    return (
      imStore.countMessage.chatCount +
      imStore.countMessage.likeOrCollectionCount +
      imStore.countMessage.commentCount +
      imStore.countMessage.followCount
    );
  },
  set: (val) => {
    imStore.setCountMessage(val);
  },
});

watchEffect(() => {
  const url = window.location.href;
  const _keyword = "keyword";
  if (url.indexOf("?") != -1 && url.indexOf(_keyword) != -1) {
    const val = url.substring(url.lastIndexOf(_keyword) + _keyword.length + 1, url.length);
    keyword.value = decodeURI(val);
  }
});

const handleClick = (url: string | URL | undefined) => {
  window.open(url, "_blank"); // 打开外链到新标签页
};

const changeInput = (e: any) => {
  const { value } = e.target;
  keyword.value = value;
  showClose.value = keyword.value == "" ? false : true;
  showSearch.value = keyword.value.length == 0 ? false : true;
  showHistory.value = keyword.value.length > 0 ? false : true;
  if (keyword.value.length > 0) {
    getRecordByKeyWord(keyword.value).then((res) => {
      recordList.value = res.data;
    });
  }
};

const focusInput = () => {
  showClose.value = keyword.value == "" ? false : true;
  showSearch.value = keyword.value.length == 0 ? false : true;
  showHistory.value = keyword.value.length > 0 ? false : true;
};

const clearInput = () => {
  keyword.value = "";
  showClose.value = false;
  showHistory.value = true;
  showSearch.value = false;
  SearchInput.value.focus();
};

const toLink = (num: number) => {
  activeLink.value = num;
  const url = routerList[num];
  if (url === "/user") {
    router.push({ name: "user", query: { uid: userInfo.value.id } });
    return;
  }
  router.push({ path: url });
};

const close = (val: boolean) => {
  loginShow.value = val;
  userInfo.value = userStore.getUserInfo();
};

const loadPad = () => {
  padShow.value = !padShow.value;
};

const maxRetries = 5; // 最大重试次数
let retryCount = 0; // 当前重试次数

const connectWs = (uid: string) => {
  ws.value = new WebSocket(wsKey + uid);
  ws.value.onopen = () => {
    console.log("连接成功");
    retryCount = 0; // 重置重试计数
  };
  ws.value.onclose = () => {
    console.log("连接断开");
    if (userInfo.value != null && userInfo.value != undefined) {
      if (retryCount < maxRetries) {
        retryCount++;
        const retryDelay = Math.min(1000 * retryCount, 5000); // 延迟时间（1秒，2秒，3秒，最多5秒）
        console.log(`尝试重新连接，第 ${retryCount} 次重试，将在 ${retryDelay} 毫秒后重试`);
        setTimeout(() => connectWs(userInfo.value.id), retryDelay);
      } else {
        console.log("已达到最大重试次数，停止重连");
      }
    }
  };
  ws.value.onmessage = (e: any) => {
    const message = JSON.parse(e.data);
    console.log("收到消息", message);

    if (message.msgType === 0) {
      const content = message.content;
      const _countMessage = imStore.countMessage;
      _countMessage.likeOrCollectionCount = content.likeOrCollectionCount;
      _countMessage.commentCount = content.commentCount;
      _countMessage.followCount = content.followCount;
      imStore.setCountMessage(_countMessage);
    }
    if (message.msgType === 1) {
      imStore.setMessage(message);
    }
    if (message.msgType === 5) {
      const userList = message.content;
      imStore.setUserList(userList);
    }
  };
};

const getChatUserListMethod = () => {
  return new Promise((resolve) => {
    getChatUserList().then((res: any) => {
      const data = res.data;
      const _countMessage = imStore.countMessage;
      data.forEach((item: any) => {
        _countMessage.chatCount += item.count;
      });
      imStore.setCountMessage(_countMessage);
      imStore.setUserList(data);
      resolve(_countMessage.chatCount);
    });
  });
};

const getCountMessageMethod = () => {
  return new Promise((resolve) => {
    getCountMessage().then((res: any) => {
      const data = res.data;
      imStore.setCountMessage(data);
      resolve(data);
    });
  });
};

const login = () => {
  loginShow.value = true;
};

const logout = () => {
  loginOut(userInfo.value.id).then(() => {
    userStore.loginOut();
    userInfo.value = null;
    loginShow.value = true;
    activeLink.value = 0;
    ws.value.onclose();
    router.push({ path: "/" });
  });
};

const getWsMessage = async () => {
  if (userInfo.value === null || userInfo.value === undefined) {
    return;
  }
  loginShow.value = false;
  connectWs(userInfo.value.id);
  const p = await getChatUserListMethod();
  const q = (await getCountMessageMethod()) as any;

  // TODO: 需要修复显示数量bug
  const _countMessage = {} as any;
  _countMessage.chatCount = p;
  _countMessage.likeOrCollectionCount = q.likeOrCollectionCount;
  _countMessage.commentCount = q.commentCount;
  _countMessage.followCount = q.followCount;

  messageCount.value = _countMessage;
};

const getPath = () => {
  const url = window.location.href;
  let path = "";
  if (url.indexOf("?") != -1) {
    const index = url.indexOf("?");
    path = url.substring(url.lastIndexOf("/"), index);
  } else {
    path = url.substring(url.lastIndexOf("/"), url.length);
  }
  return path;
};

const initData = () => {
  userInfo.value = userStore.getUserInfo();
  const path = getPath();
  activeLink.value = path === "/search" ? 0 : routerList.findIndex((item) => item === path);
  getWsMessage();
};

initData();
</script>

<style lang="less" scoped>
a {
  text-decoration: none;
  color: rgba(51, 51, 51, 0.8);
}

.right-icon {
  width: 1.5em;
  height: 1.5em;
  margin-top: 5px;
  cursor: pointer;
}

.right-icon:not(:last-child) {
  margin-right: 30px;
}
.right-icon:last-child {
  margin-right: 50px;
}

.right-icon:hover {
  transform: scale(1.2); /* 鼠标移入时放大 1.2 倍 */
}

/* 添加选中标签的效果 */
.channel-list li:hover {
  border-radius: 20px;
  background-color: #f0f0f0;
  cursor: pointer;
  width: 90%;
}

/* 激活的选中标签样式 */
.active-channel {
  background-color: #f0f0f0;
}

/* 浮动框容器 */
.floating-box {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 20px; /* 调整内边距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  max-width: 300px; /* 调整宽度 */
  margin: 0 auto; /* 使浮动框居中 */
  margin-left: -2px; /* 向左移动 2px */
  cursor: pointer;
  width: 90%;
}

/* 标题样式 */
.title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

/* 行容器样式 */
.line-container {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

/* 图标样式 */
.reds-icon {
  fill: #ff2442; /* 图标颜色 */
  margin-right: 10px;
}

/* 描述文本样式 */
.desc {
  font-size: 13px;
  color: #666;
}

.custom-button {
  margin-top: 2px;
  margin-bottom: 15px;
  margin-left: -2px;
  height: 48px;
  background: #ff2442;
  color: #fff;
  opacity: 1;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 90%;
}

.container {
  max-width: 1728px;
  background-color: #fff;
  margin: 0 auto;

  .top {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100vw;
    height: 72px;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
    align-items: center;
    background: #fff;

    header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1728px;
      height: 72px;
      padding: 0 16px 0 24px;
      z-index: 10;

      .tool-box {
        width: 24px;
        height: 70px;
        position: absolute;
        left: 0;
        top: 0;
      }

      .input-box {
        height: 40px;
        position: fixed;
        left: 50%;
        transform: translate(-50%);

        @media screen and (max-width: 695px) {
          display: none;
        }

        @media screen and (min-width: 960px) and (max-width: 1191px) {
          width: calc(-36px + 50vw);
        }

        @media screen and (min-width: 1192px) and (max-width: 1423px) {
          width: calc(-33.6px + 40vw);
        }

        @media screen and (min-width: 1424px) and (max-width: 1727px) {
          width: calc(-42.66667px + 33.33333vw);
        }

        @media screen and (min-width: 1728px) {
          width: 533.33333px;
        }

        .search-input {
          padding: 0 84px 0 16px;
          width: 100%;
          height: 100%;
          font-size: 16px;
          line-height: 120%;
          color: #333;
          caret-color: #ff2442;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 999px;
        }

        .input-button {
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(51, 51, 51, 0.8);

          .close-icon .search-icon {
            width: 40px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: rgba(51, 51, 51, 0.8);
          }
          :hover {
            cursor: pointer; /* 显示小手指针 */
            transform: scale(1.15); /* 鼠标移入时按钮稍微放大 */
          }
        }
      }
    }
  }

  .main {
    display: flex;

    .side-bar {
      @media screen and (max-width: 695px) {
        display: none;
      }

      @media screen and (min-width: 696px) and (max-width: 959px) {
        display: none;
      }

      @media screen and (min-width: 960px) and (max-width: 1191px) {
        width: calc(-18px + 25vw);
        margin-left: 12px;
      }

      @media screen and (min-width: 1192px) and (max-width: 1423px) {
        width: calc(-16.8px + 20vw);
        margin-left: 12px;
      }

      @media screen and (min-width: 1424px) and (max-width: 1727px) {
        width: calc(-21.33333px + 16.66667vw);
        margin-left: 16px;
      }

      @media screen and (min-width: 1728px) {
        width: 266.66667px;
        margin-left: 16px;
      }

      height: calc(100vh - 72px);
      overflow-y: scroll;
      background-color: #fff;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      padding-top: 16px;
      margin-top: 72px;
      position: fixed;
      overflow: visible;

      .channel-list {
        min-height: auto;
        -webkit-user-select: none;
        user-select: none;

        .active-channel {
          background-color: rgba(0, 0, 0, 0.03);
          border-radius: 999px;
          color: #333;
          width: 90%;
        }

        li {
          padding-left: 16px;
          min-height: 48px;
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-bottom: 8px;
          color: rgba(51, 51, 51, 0.6);

          .link-wrapper {
            display: flex;
            width: 100%;
            height: 48px;
            align-items: center;
          }

          .message-count {
            margin-left: 7rem;
            background-color: red;
            width: 20px;
            height: 20px;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
            border-radius: 50%;
            color: #fff;
          }
        }

        .channel {
          font-size: 16px;
          font-weight: 600;
          margin-left: 12px;
          color: #333;
        }
      }

      .information-container {
        display: inline-block;
        width: 100%;
        color: #333;
        font-size: 16px;
        position: absolute;
        bottom: 0;
        margin-left: -6px;

        .information-pad {
          z-index: 16;
          margin-bottom: 4px;
          width: 90%;

          .container {
            width: 100%;
            background: #fff;
            box-shadow:
              0 4px 32px 0 rgba(0, 0, 0, 0.08),
              0 1px 4px 0 rgba(0, 0, 0, 0.04);
            border-radius: 12px;

            .divider {
              margin: 0px 12px;
              list-style: none;
              height: 0;
              border: 1px solid rgba(0, 0, 0, 0.08);
              border-width: 1px 0 0;
            }

            .group-wrapper {
              padding: 4px;

              .group-header {
                display: flex;
                align-items: center;
                padding: 0 12px;
                font-weight: 400;
                height: 32px;
                color: rgba(51, 51, 51, 0.6);
                font-size: 12px;
              }

              .menu-item {
                height: 40px;
                color: rgba(51, 51, 51, 0.8);
                font-size: 16px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                padding: 0 12px;
                font-weight: 400;

                .icon {
                  color: rgba(51, 51, 51, 0.3);
                  margin-left: auto;
                }

                .component {
                  margin-left: auto;
                }

                .multistage-toggle {
                  position: relative;
                  background: rgba(0, 0, 0, 0.03);
                  display: flex();
                  padding: 2px;
                  border-radius: 999px;
                  cursor: pointer;

                  .active {
                    background: #fff;
                    box-shadow:
                      0 2px 8px 0 rgba(0, 0, 0, 0.04),
                      0 1px 2px 0 rgba(0, 0, 0, 0.02);
                    color: #333;
                  }

                  .toggle-item {
                    border-radius: 999px;
                    background: transparent;
                    color: rgba(51, 51, 51, 0.6);

                    .icon-wrapper {
                      width: 24px;
                      height: 24px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      cursor: pointer;
                    }
                  }
                }
              }
              /* 添加选中标签的效果 */
              .menu-item:hover {
                border-radius: 20px;
                background-color: #f0f0f0;
                cursor: pointer;
                width: 100%;
              }
            }
          }
        }

        .information-wrapper {
          -webkit-user-select: none;
          user-select: none;
          cursor: pointer;
          position: relative;
          margin-bottom: 20px;
          height: 48px;
          width: 100%;
          display: flex;
          font-weight: 600;
          align-items: center;
          border-radius: 999px;
        }

        /* 添加选中标签的效果 */
        .information-wrapper:hover {
          border-radius: 20px;
          background-color: #f0f0f0;
          cursor: pointer;
          width: 90%;
        }
      }
    }

    .main-content {
      width: 100%;
    }

    .main-content {
      @media screen and (min-width: 960px) and (max-width: 1191px) {
        padding-left: calc(-6px + 25vw);
      }

      @media screen and (min-width: 1192px) and (max-width: 1423px) {
        padding-left: calc(-4.8px + 20vw);
      }

      @media screen and (min-width: 1424px) and (max-width: 1727px) {
        padding-left: calc(-5.33333px + 16.66667vw);
      }

      @media screen and (min-width: 1728px) {
        padding-left: 282.66667px;
      }
    }
  }
}
</style>

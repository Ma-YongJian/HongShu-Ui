<template>
  <div>
    <div class="reds-modal login-modal" role="presentation">
    <i tabindex="-1" class="reds-mask" aria-label="弹窗遮罩"></i>
    <div class="login-container">
      <div class="icon-btn-wrapper close-button" @click="close">
        <Close style="width: 1em; height: 1em" />
      </div>
      <div class="left">
        <div class="login-reason">登录后推荐更懂你的笔记</div>
        <img class="logo" src="@/assets/logo.png" alt="来因" />
        <div class="brand-board">
          <p class="brand-title">来因社区</p>
          <p class="brand-desc">记录生活，发现同好</p>
        </div>
      </div>
      <div class="right">
        <div class="title">账号登录</div>
        <div class="input-container">
          <form @submit.prevent="loginMethod">
            <label class="phone">
              <input
                v-model.trim="userLogin.phone"
                placeholder="请输入账号（手机号）"
                type="text"
                name="account"
                autocomplete="username"
                maxlength="11"
              />
            </label>
            <div style="height: 16px"></div>
            <label class="auth-code">
              <input
                v-model="userLogin.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="current-password"
              />
            </label>
            <div class="err-msg">{{ errMsg }}</div>
            <button class="submit" type="submit" :disabled="submitting">
              {{ submitting ? "登录中..." : "登录" }}
            </button>
          </form>
        </div>
        <div class="agreements">
          <label class="agreement-label">
            <input v-model="agreedToTerms" type="checkbox" class="agreement-checkbox" />
            <span class="checkmark"></span>
          </label>
          <span class="agree-text">
            我已阅读并同意
            <a href="javascript:void(0)" class="agree-link" @click.stop="openAgreement('manual')">《用户协议》</a>
            <a href="javascript:void(0)" class="agree-link" @click.stop="openAgreement('privacy')">《隐私政策》</a>
          </span>
        </div>
        <div class="oauth-tip">
          <span class="oauth-tip-line">新用户可直接登录</span>
        </div>
      </div>
    </div>
    </div>
    <AgreementDialog v-model="agreementShow" :type="agreementType" />
  </div>
</template>

<script lang="ts" setup>
import { Close } from "@element-plus/icons-vue";
import type { UserLogin } from "@/type/user";
import { login } from "@/api/user";
import { ref } from "vue";
import { storage } from "@/utils/storage";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import AgreementDialog from "@/components/AgreementDialog.vue";
import type { AgreementType } from "@/constants/agreements";

const userStore = useUserStore();
const router = useRouter();

const agreedToTerms = ref(false);
const submitting = ref(false);
const errMsg = ref("");
const agreementShow = ref(false);
const agreementType = ref<AgreementType>("manual");

const userLogin = ref<UserLogin>({
  phone: "",
  email: "",
  code: "",
  username: "",
  password: "",
});

const emit = defineEmits(["clickChild"]);
const close = () => {
  emit("clickChild", false);
};

const openAgreement = (type: AgreementType) => {
  agreementType.value = type;
  agreementShow.value = true;
};

const phoneRegex = /^1[3-9]\d{9}$/;

const loginMethod = () => {
  errMsg.value = "";
  if (!agreedToTerms.value) {
    ElMessage.warning("请先阅读并同意用户协议和隐私政策");
    return;
  }
  const phoneNumber = userLogin.value.phone;
  if (!phoneNumber) {
    ElMessage.warning("请输入账号");
    return;
  }
  if (!phoneRegex.test(phoneNumber)) {
    ElMessage.warning("请输入正确的11位手机号");
    return;
  }
  if (!userLogin.value.password) {
    ElMessage.warning("请输入密码");
    return;
  }
  submitting.value = true;
  login(userLogin.value)
    .then((res: any) => {
      const { data } = res;
      storage.set("accessToken", data.accessToken);
      storage.set("refreshToken", data.refreshToken);
      userStore.setUserInfo(data.userInfo);
      router.push({ path: "/", query: { date: Date.now() } });
      emit("clickChild", false);
    })
    .catch((error: any) => {
      console.log(error);
      errMsg.value = "账号或密码不正确";
      ElMessage.error("登录失败");
    })
    .finally(() => {
      submitting.value = false;
    });
};
</script>

<style lang="less" scoped>
a {
  text-decoration: none;
  background-color: transparent;
}

.login-reason {
  height: 48px;
  padding: 0 20px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--el-color-primary);
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
  line-height: 120%;
  margin-top: 40px;
  margin-bottom: -40px;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agreements {
  .agreement-label {
    position: relative;
    cursor: pointer;
    display: inline-block;
    margin-right: 20px;
  }

  .agreement-checkbox {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .checkmark {
    position: absolute;
    top: -12px;
    left: 0;
    height: 15px;
    width: 15px;
    background-color: #eee;
    border: 1px solid #ccc;
    border-radius: 3px;
  }

  .agreement-checkbox:checked ~ .checkmark:after {
    content: "";
    position: absolute;
    display: block;
    left: 4px;
    top: -1px;
    width: 5px;
    height: 10px;
    border: solid var(--el-color-primary);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .agree-text {
    font-size: 12px;
    color: rgba(51, 51, 51, 0.6);
  }

  .agree-link {
    color: var(--el-color-primary);
    cursor: pointer;
  }
}

.login-modal {
  z-index: 100010;
  flex-direction: column;
}

.reds-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000002;
  box-sizing: border-box;
  visibility: visible;
  opacity: 1;
  transition:
    opacity 0.2s,
    visibility 0.2s;

  .reds-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.25);
    z-index: -1;
  }

  .login-container {
    display: flex;
    position: relative;
    width: 800px;
    height: 480px;
    background: #fff;
    border-radius: 16px;
    box-shadow:
      0 4px 32px 0 rgba(0, 0, 0, 0.08),
      0 1px 4px 0 rgba(0, 0, 0, 0.04);
    transition: all 0.2s;

    .close-button {
      position: absolute;
      right: 20px;
      top: 20px;
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
    }

    .left {
      width: 400px;
      display: flex;
      align-items: center;
      flex-direction: column;
      border-right: 1px solid rgba(0, 0, 0, 0.08);

      img {
        border-style: none;
      }

      .logo {
        margin-top: 70px;
        width: 80px;
        height: 35px;
        object-fit: contain;
        user-select: none;
        pointer-events: none;
      }

      .brand-board {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 28px;
        width: 192px;
        height: 192px;
        border: 2px solid rgba(59, 130, 246, 0.18);
        border-radius: 12px;
        background: linear-gradient(180deg, #eff6ff 0%, #fff 100%);
      }

      .brand-title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: var(--el-color-primary);
        letter-spacing: 2px;
      }

      .brand-desc {
        margin: 10px 0 0;
        font-size: 13px;
        color: rgba(51, 51, 51, 0.55);
      }

    }

    .right {
      width: 400px;
      display: flex;
      align-items: center;
      flex-direction: column;
      margin-top: 48px;

      .title {
        font-size: 18px;
        color: rgba(51, 51, 51, 0.8);
        font-weight: 600;
        line-height: 120%;
      }

      .input-container {
        margin-top: 24px;
        width: 304px;
        display: flex;
        flex-direction: column;

        .auth-code,
        .phone {
          display: flex;
          align-items: center;
          font-size: 16px;
          line-height: 22px;
          color: rgba(51, 51, 51, 0.8);
          height: 48px;
          padding: 0 20px;
          background: #f7f8fa;
          border-radius: 999px;
          border: 1px solid transparent;
          transition: border-color 0.2s, background 0.2s;
        }

        .auth-code:focus-within,
        .phone:focus-within {
          background: #fff;
          border-color: var(--el-color-primary);
        }

        .auth-code input,
        .phone input {
          font-size: 16px;
          width: 100%;
          height: 100%;
          caret-color: var(--el-color-primary);
          color: #333;
          background: transparent;
        }

        .err-msg {
          margin-top: 9.5px;
          height: 16px;
          line-height: 16px;
          color: #f56c6c;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submit {
          margin-top: 24px;
          height: 48px;
          background: var(--el-color-primary);
          color: #fff;
          border-radius: 999px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .submit:hover:not(:disabled) {
          opacity: 0.92;
        }

        .submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .submit:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
      }

      .agreements {
        width: 280px;
        position: relative;
        margin-top: 16px;
        padding-left: 18px;
        font-size: 12px;
        color: rgba(51, 51, 51, 0.6);
        line-height: 120%;
      }

      .oauth-tip:after,
      .oauth-tip:before {
        margin-top: 20px;
        display: block;
        width: 50px;
        height: 1px;
        content: "";
        background-color: rgba(0, 0, 0, 0.08);
      }

      .oauth-tip-line {
        margin: 0 12px;
        margin-top: 20px;
      }

      .oauth-tip {
        margin-top: 29px;
        display: flex;
        align-items: center;
        font-weight: 400;
        font-size: 14px;
        color: rgba(51, 51, 51, 0.6);
      }
    }
  }
}
</style>

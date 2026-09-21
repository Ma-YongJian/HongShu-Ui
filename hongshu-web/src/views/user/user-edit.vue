<template>
  <el-dialog
    :model-value="modelValue"
    title="编辑资料"
    width="480px"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="edit-body">
      <el-upload
        class="avatar-uploader"
        :action="fileAction"
        :show-file-list="false"
        :headers="uploadHeader"
        :on-success="onAvatarSuccess"
        accept="image/*"
      >
        <div class="avatar-wrap">
          <img :src="form.avatar" class="avatar" alt="" />
          <div class="avatar-mask">更换头像</div>
        </div>
      </el-upload>

      <div class="field">
        <div class="field-head">
          <label>昵称</label>
          <span>{{ (form.username || "").length }}/10</span>
        </div>
        <el-input v-model="form.username" maxlength="10" placeholder="请输入昵称" />
      </div>

      <div class="field">
        <div class="field-head">
          <label>简介</label>
          <span>{{ (form.description || "").length }}/250</span>
        </div>
        <el-input
          v-model="form.description"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
          maxlength="250"
          placeholder="介绍一下自己吧"
        />
      </div>

      <div class="field">
        <div class="field-head">
          <label>标签</label>
          <span>{{ form.tags.length }}/4</span>
        </div>
        <div class="tags">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            round
            effect="plain"
            type="primary"
            @close="removeTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            size="small"
            maxlength="8"
            style="width: 88px"
            @keyup.enter="confirmTag"
            @blur="confirmTag"
          />
          <el-button v-else size="small" round :disabled="form.tags.length >= 4" @click="showTagInput">
            + 添加
          </el-button>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { nextTick, reactive, ref, watch } from "vue";
import { ElInput, ElMessage, type UploadProps } from "element-plus";
import { updateUser } from "@/api/user";
import { useUserStore } from "@/store/userStore";
import { baseURL } from "@/constant/constant";

const props = defineProps<{
  modelValue: boolean;
  userInfo: any;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}>();

const userStore = useUserStore();
const fileAction = baseURL + "web/oss/save/1";
const uploadHeader = { accessToken: userStore.getToken() };
const saving = ref(false);
const inputVisible = ref(false);
const inputValue = ref("");
const InputRef = ref<InstanceType<typeof ElInput>>();
const form = reactive({
  avatar: "",
  username: "",
  description: "",
  tags: [] as string[],
});

const resetForm = () => {
  form.avatar = props.userInfo?.avatar || "";
  form.username = props.userInfo?.username || "";
  form.description = props.userInfo?.description || "";
  try {
    form.tags = props.userInfo?.tags ? JSON.parse(props.userInfo.tags) : [];
  } catch {
    form.tags = [];
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm();
  }
);

const onAvatarSuccess: UploadProps["onSuccess"] = (response) => {
  if (response?.data) {
    form.avatar = response.data;
  }
};

const showTagInput = () => {
  inputVisible.value = true;
  nextTick(() => InputRef.value?.input?.focus());
};

const removeTag = (tag: string) => {
  form.tags = form.tags.filter((item) => item !== tag);
};

const confirmTag = () => {
  const tag = inputValue.value.trim();
  if (tag && !form.tags.includes(tag) && form.tags.length < 4) {
    form.tags.push(tag);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

const save = () => {
  const username = form.username.trim();
  if (!username) {
    ElMessage.warning("请输入昵称");
    return;
  }
  saving.value = true;
  updateUser({
    id: props.userInfo.id,
    avatar: form.avatar,
    username,
    description: form.description,
    tags: JSON.stringify(form.tags),
  })
    .then(() => {
      const user = userStore.getUserInfo();
      user.avatar = form.avatar;
      user.username = username;
      userStore.setUserInfo(user);
      ElMessage.success("资料已更新");
      emit("update:modelValue", false);
      emit("success");
    })
    .catch(() => {
      ElMessage.error("保存失败，请稍后再试");
    })
    .finally(() => {
      saving.value = false;
    });
};
</script>

<style lang="less" scoped>
.edit-body {
  padding: 4px 4px 0;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-wrap:hover .avatar-mask {
  opacity: 1;
}

.field {
  margin-bottom: 16px;
}

.field-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: rgba(51, 51, 51, 0.7);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
</style>

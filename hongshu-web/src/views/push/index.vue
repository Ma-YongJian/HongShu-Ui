<template>
  <div class="container" id="container">
    <div v-if="isLogin" class="push-container">
      <div class="header">
        <span class="header-icon"></span>
        <span class="header-title">{{ note.id ? "编辑笔记" : "发布图文" }}</span>
      </div>

      <div class="img-list">
        <div class="section-label">
          <span class="required">*</span>图片
          <span class="count">{{ fileList.length }}/9</span>
        </div>
        <el-upload
          v-model:file-list="fileList"
          :action="uploadAction"
          list-type="picture-card"
          multiple
          :limit="9"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          :headers="uploadHeader"
          :auto-upload="false"
          :on-preview="handlePreview"
          :on-exceed="() => ElMessage.warning('最多上传 9 张图片')"
        >
          <div class="upload-plus">
            <el-icon :size="22"><Plus /></el-icon>
            <span>上传图片</span>
          </div>
        </el-upload>
        <p class="upload-tip">支持 JPG / PNG / WEBP，单次最多 9 张</p>
        <el-dialog v-model="dialogVisible" width="640px" append-to-body>
          <img class="preview-img" :src="dialogImageUrl" alt="预览" />
        </el-dialog>
      </div>

      <div class="push-content">
        <div class="section-label"><span class="required">*</span>标题</div>
        <el-input
          v-model="note.title"
          maxlength="20"
          show-word-limit
          type="text"
          placeholder="填写标题会有更多赞哦"
          class="input-title"
        />
        <div class="section-label">正文</div>
        <el-input
          v-model="note.content"
          maxlength="250"
          show-word-limit
          :autosize="{ minRows: 4, maxRows: 6 }"
          type="textarea"
          placeholder="添加正文描述，让更多人看到你"
        />

        <div class="section-label">标签 {{ dynamicTags.length }}/5</div>
        <div class="tag-list">
          <el-tag
            v-for="tag in dynamicTags"
            :key="tag"
            closable
            round
            effect="plain"
            type="primary"
            class="tag-item"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            maxlength="12"
            size="small"
            style="width: 96px"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else type="primary" size="small" plain round :disabled="dynamicTags.length >= 5" @click="showInput">
            + 标签
          </el-button>
        </div>
        <div v-if="hotTags.length" class="hot-tag">
          <span class="tag-title-text">推荐：</span>
          <el-tag
            v-for="tag in hotTags"
            :key="tag"
            class="hot-tag-item"
            type="info"
            effect="plain"
            round
            @click="selectHotTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <div class="categorys">
        <div class="section-label"><span class="required">*</span>分类</div>
        <el-cascader
          ref="CascaderRef"
          v-model="categoryList"
          :options="options"
          :props="props"
          placeholder="请选择笔记分类"
          style="width: 100%"
          @change="handleChange"
        />
      </div>

      <div class="submit">
        <el-button type="primary" round :loading="pushLoading" @click="pubslish">
          {{ note.id ? "保存" : "发布" }}
        </el-button>
        <el-button round @click="resetData">清空</el-button>
      </div>
    </div>
    <div v-else class="push-guest">
      <el-empty description="登录后即可发布笔记">
        <el-button type="primary" round @click="openLogin()">去登录</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, inject } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import type { UploadUserFile, CascaderProps, ElInput, UploadFile } from "element-plus";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/userStore";
import { getCategoryTreeData } from "@/api/category";
import { saveNoteByDTO, getNoteById, updateNoteByDTO } from "@/api/note";
import { getTagByKeyword } from "@/api/tag";
import { getFileFromUrl } from "@/utils/util";
import { baseURL } from "@/constant/constant";

const props: CascaderProps = {
  label: "title",
  value: "id",
  checkStrictly: true,
};
const CascaderRef = ref<any>(null);
const userStore = useUserStore();
const route = useRoute();
const openLogin = inject("openLogin", () => {});
const uploadAction = baseURL + "web/oss/saveBatch";

const fileList = ref<UploadUserFile[]>([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const uploadHeader = ref({
  accessToken: userStore.getToken(),
});
const categoryList = ref<Array<any>>([]);
const options = ref([]);
const note = ref<any>({});
const pushLoading = ref(false);
const isLogin = ref(false);
const inputValue = ref("");
const dynamicTags = ref<Array<string>>([]);
const inputVisible = ref(false);
const InputRef = ref<InstanceType<typeof ElInput>>();
const hotTags = ref<Array<string>>([]);

const handlePreview = (file: UploadFile) => {
  dialogImageUrl.value = file.url || "";
  dialogVisible.value = true;
};

const handleClose = (tag: string) => {
  dynamicTags.value = dynamicTags.value.filter((item) => item !== tag);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => InputRef.value?.input?.focus());
};

const addTag = (raw: string) => {
  const tag = raw.trim();
  if (!tag) return;
  if (dynamicTags.value.includes(tag)) {
    ElMessage.warning("标签已添加");
    return;
  }
  if (dynamicTags.value.length >= 5) {
    ElMessage.warning("最多只能选择 5 个标签");
    return;
  }
  dynamicTags.value.push(tag);
};

const handleInputConfirm = () => {
  addTag(inputValue.value);
  inputVisible.value = false;
  inputValue.value = "";
};

const selectHotTag = (val: string) => {
  addTag(val);
};

const handleChange = (ids: Array<any>) => {
  categoryList.value = ids;
  CascaderRef.value?.togglePopperVisible();
};

const getHotTag = () => {
  getTagByKeyword(1, 10, "").then((res) => {
    const { records } = res.data || {};
    hotTags.value = (records || []).map((item: any) => item.title).filter(Boolean);
  });
};

const getNoteByIdMethod = (noteId: string) => {
  getNoteById(noteId).then((res) => {
    const { data } = res;
    note.value = data;
    const urls = JSON.parse(data.urls);
    urls.forEach((item: string) => {
      const fileName = item.substring(item.lastIndexOf("/") + 1);
      getFileFromUrl(item, fileName).then((file: any) => {
        fileList.value.push({ name: fileName, url: item, raw: file });
      });
    });
    categoryList.value = [data.cpid, data.cid].filter(Boolean);
    dynamicTags.value = (data.tagList || []).map((item: any) => item.title);
  });
};

const resolveCoverUrl = () => {
  const first = fileList.value[0] as any;
  if (first?.url) return first.url;
  if (first?.raw) return URL.createObjectURL(first.raw);
  return "";
};

const pubslish = () => {
  if (!fileList.value.length) {
    ElMessage.warning("请上传图片");
    return;
  }
  if (!String(note.value.title || "").trim()) {
    ElMessage.warning("请填写标题");
    return;
  }
  if (!categoryList.value.length) {
    ElMessage.warning("请选择分类");
    return;
  }
  const coverUrl = resolveCoverUrl();
  if (!coverUrl) {
    ElMessage.warning("图片读取失败，请重新上传");
    return;
  }
  pushLoading.value = true;
  const params = new FormData();
  fileList.value.forEach((file: any) => {
    if (file.raw) params.append("uploadFiles", file.raw);
  });
  note.value.count = fileList.value.length;
  note.value.type = 1;
  note.value.title = String(note.value.title).trim();
  note.value.cpid = categoryList.value[0];
  note.value.cid = categoryList.value[1] || categoryList.value[0];
  note.value.tagList = dynamicTags.value;

  const coverImage = new Image();
  coverImage.onload = () => {
    const size = coverImage.width / coverImage.height;
    note.value.noteCoverHeight = size >= 1.3 ? 200 : 300;
    params.append("noteData", JSON.stringify(note.value));
    if (note.value.id) {
      updateNote(params);
    } else {
      saveNote(params);
    }
  };
  coverImage.onerror = () => {
    pushLoading.value = false;
    ElMessage.error("封面图加载失败，请重新选择图片");
  };
  coverImage.src = coverUrl;
};

const updateNote = (params: FormData) => {
  updateNoteByDTO(params)
    .then(() => {
      resetData();
      ElMessage.success("修改成功");
    })
    .catch(() => {
      ElMessage.error("修改失败");
    })
    .finally(() => {
      pushLoading.value = false;
    });
};

const saveNote = (params: FormData) => {
  saveNoteByDTO(params)
    .then(() => {
      resetData();
      ElMessage.success("发布成功，请等待审核");
    })
    .catch(() => {
      ElMessage.error("发布失败");
    })
    .finally(() => {
      pushLoading.value = false;
    });
};

const resetData = () => {
  note.value = {};
  categoryList.value = [];
  fileList.value = [];
  pushLoading.value = false;
  dynamicTags.value = [];
  inputVisible.value = false;
  inputValue.value = "";
};

const initData = () => {
  isLogin.value = userStore.isLogin();
  if (!isLogin.value) return;
  const noteId = route.query.noteId as string;
  if (noteId) getNoteByIdMethod(noteId);
  getCategoryTreeData().then((res) => {
    options.value = res.data;
  });
  getHotTag();
};

initData();
</script>

<style lang="less" scoped>
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
  border-radius: 8px;
}

:deep(.el-upload-list__item.is-success .el-upload-list__item-status-label) {
  display: none;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  border-color: #dbeafe;
  background: #eff6ff;
}

.container {
  flex: 1;
  padding: 72px 24px 32px;
  width: 67%;
  margin: 0 auto;
  box-sizing: border-box;

  .push-guest {
    padding-top: 80px;
  }

  .push-container {
    width: 100%;
    max-width: 720px;
    margin-top: 16px;
    padding-bottom: 8px;
    border-radius: 12px;
    box-sizing: border-box;
    box-shadow: var(--el-box-shadow-lighter);
    background: #fff;
  }

  .header {
    display: flex;
    align-items: center;
    padding: 18px 20px 8px;
    font-size: 16px;
    font-weight: 600;
    color: #333;

    .header-icon {
      display: inline-block;
      width: 4px;
      height: 16px;
      margin-right: 8px;
      background: var(--el-color-primary);
      border-radius: 3px;
    }
  }

  .section-label {
    margin: 4px 0 10px;
    font-size: 13px;
    color: rgba(51, 51, 51, 0.7);

    .required {
      margin-right: 4px;
      color: #f56c6c;
    }

    .count {
      margin-left: 6px;
      color: rgba(51, 51, 51, 0.45);
    }
  }

  .img-list,
  .push-content,
  .categorys {
    padding: 8px 20px;
  }

  .upload-plus {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--el-color-primary);
    font-size: 12px;
  }

  .upload-tip {
    margin: 8px 0 0;
    font-size: 12px;
    color: rgba(51, 51, 51, 0.45);
  }

  .preview-img {
    display: block;
    width: 100%;
  }

  .input-title {
    margin-bottom: 14px;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .hot-tag {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    .tag-title-text {
      font-size: 13px;
      color: rgba(51, 51, 51, 0.45);
    }

    .hot-tag-item {
      cursor: pointer;
    }
  }

  .submit {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 20px 20px;
  }
}
</style>

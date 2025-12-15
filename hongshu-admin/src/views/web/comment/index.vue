<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="评论人" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入评论人"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="被评论人" prop="noteUid">
        <el-input
          v-model="queryParams.noteUid"
          placeholder="请输入被评论人"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="被评论笔记" prop="nid">
        <el-input
          v-model="queryParams.nid"
          placeholder="请输入被评论笔记"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评论内容" prop="content">
        <el-input
          v-model="queryParams.content"
          placeholder="请输入评论内容"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评论时间" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['web:comment:remove']"
          >
            删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['web:comment:export']"
          >
            导出
          </el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList">
        </right-toolbar>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      :data="commentList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="评论人" align="center" prop="username" />
      <el-table-column label="头像" align="center" prop="avatar">
        <template #default="scope">
          <el-avatar :size="50" :src="scope.row.avatar"> </el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="被评论人" align="center" prop="replyUsername" />
      <el-table-column label="头像" align="center" prop="replyAvatar">
        <template #default="scope">
          <el-avatar :size="50" :src="scope.row.replyAvatar"> </el-avatar>
        </template>
      </el-table-column>
      <el-table-column
        label="笔记"
        width="120"
        align="center"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <router-link
            :to="'/web/comment-data/index/' + scope.row.nid"
            class="link-type"
          >
            <span>{{ scope.row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="笔记封面" align="center" prop="noteCover">
        <template #default="scope">
          <el-avatar
            :size="60"
            :src="scope.row.noteCover"
            shape="square"
            @mouseover="showPreview(scope.row.noteCover, $event)"
            @mouseleave="hidePreview"
          />
        </template>
      </el-table-column>
      <el-table-column label="笔记作者" align="center" prop="pushUsername" />
      <el-table-column label="评论内容" align="center" prop="content" />
      <el-table-column label="评论等级" align="center" prop="level">
        <template #default="scope">
          <el-tag :type="getTagType(scope.row.level)">
            {{ getLevelText(scope.row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="评论时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        min-width="200"
      >
        <template #default="scope">
          <el-tooltip content="删除" placement="top">
            <el-button
              type="danger"
              icon="Delete"
              size="small"
              @click="handleDelete(scope.row)"
              v-hasPermi="['web:member:remove']"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 放大预览图片的容器 -->
    <div v-if="previewVisible" class="image-preview" :style="previewStyle">
      <img :src="previewSrc" alt="Preview" />
    </div>
  </div>
</template>

<script setup name="Comment">
import { listComment, delComment } from "@/api/web/comment";
import { useRouter } from "vue-router";

const { proxy } = getCurrentInstance();
const router = useRouter();

const commentList = ref([]);
const open = ref(false);
const previewVisible = ref(false);
const previewSrc = ref("");
const previewStyle = reactive({ top: "0px", left: "0px" });
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref([]);

const levelMap = {
  1: "一级评论",
  2: "二级评论",
  3: "三级评论",
  4: "四级评论",
  5: "五级评论",
};
// 根据 level 值返回对应的颜色
const getTagType = (level) => {
  switch (level) {
    case 1:
      return "success"; // 一级评论，绿色
    case 2:
      return "primary"; // 二级评论，蓝色
    case 3:
      return "warning"; // 三级评论，黄色
    case 4:
      return "danger"; // 四级评论，红色
    case 5:
      return "info"; // 五级评论，蓝色（或者可以用其他颜色）
    default:
      return "default"; // 默认颜色
  }
};

// 根据 level 返回对应的文本
const getLevelText = (level) => {
  return levelMap[level] || "其他评论";
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    uid: undefined,
    noteUid: undefined,
    content: undefined,
  },
  rules: {},
});

const { queryParams, form } = toRefs(data);

/** 显示放大预览图片 */
function showPreview(src, event) {
  previewSrc.value = src;
  previewVisible.value = true;
  previewStyle.top = event.clientY + 10 + "px";
  previewStyle.left = event.clientX + 10 + "px";
}

/** 隐藏放大预览图片 */
function hidePreview() {
  previewVisible.value = false;
  previewSrc.value = "";
}

/** 查询评论列表 */
function getList() {
  loading.value = true;
  listComment(proxy.addDateRange(queryParams.value, dateRange.value)).then(
    (response) => {
      commentList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    }
  );
}
/** 查看详情操作 */
function handleDetail(row) {
  router.push({ path: "/message/data" });
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 删除按钮操作 */
function handleDelete(row) {
  const commentIds = row.id || ids.value;
  proxy.$modal
    .confirm('是否确认删除评论编号为"' + commentIds + '"的数据项？')
    .then(function () {
      return delComment(commentIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "system/post/export",
    {
      ...queryParams.value,
    },
    `post_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>

<style scoped>
.image-preview {
  position: fixed;
  z-index: 1000;
  border: 1px solid #ddd;
  background-color: #fff;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
}
</style>

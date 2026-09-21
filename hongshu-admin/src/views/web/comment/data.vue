<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="评论人" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入评论人ID"
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
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['web:comment:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Close" @click="handleClose">关闭</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="commentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="评论人" align="center" prop="username" />
      <el-table-column label="评论内容" align="left" prop="content" min-width="180" show-overflow-tooltip />
      <el-table-column label="评论等级" align="center" prop="level">
        <template #default="scope">
          <el-tag :type="getTagType(scope.row.level)">{{ getLevelText(scope.row.level) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="评论时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template #default="scope">
          <el-button
            type="danger"
            icon="Delete"
            size="small"
            @click="handleDelete(scope.row)"
            v-hasPermi="['web:comment:remove']"
          />
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
  </div>
</template>

<script setup name="CommentData">
import { listComment, delComment } from "@/api/web/comment";

const { proxy } = getCurrentInstance();
const route = useRoute();

const commentList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);

const levelMap = {
  1: "一级评论",
  2: "二级评论",
  3: "三级评论",
  4: "四级评论",
  5: "五级评论",
};

const getTagType = (level) => {
  switch (level) {
    case 1:
      return "success";
    case 2:
      return "primary";
    case 3:
      return "warning";
    case 4:
      return "danger";
    default:
      return "info";
  }
};

const getLevelText = (level) => {
  return levelMap[level] || "其他评论";
};

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  uid: undefined,
  content: undefined,
  nid: route.params && route.params.nid
});

function getList() {
  loading.value = true;
  queryParams.value.nid = route.params && route.params.nid;
  listComment(queryParams.value).then((response) => {
    commentList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
}

function handleDelete(row) {
  const commentIds = row.id || ids.value;
  proxy.$modal
    .confirm("是否确认删除选中评论？")
    .then(function () {
      return delComment(commentIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

function handleClose() {
  const obj = { path: "/message/comment" };
  proxy.$tab.closeOpenPage(obj);
}

getList();
</script>

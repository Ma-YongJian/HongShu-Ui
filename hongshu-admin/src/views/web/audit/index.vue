<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="分类" prop="pid">
        <el-tree-select
          v-model="queryParams.pid"
          :data="navbarOptions"
          :props="{
            value: 'id',
            label: 'title',
            children: 'children',
            disabled: 'disabled',
          }"
          value-key="id"
          placeholder="请选择分类"
          check-strictly
          clearable
          style="width: 200px"
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作者" prop="uid">
        <el-input
          v-model="queryParams.uid"
          placeholder="请输入作者"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="笔记类型"
          @change="handleQuery"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in note_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="创建时间" style="width: 308px">
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
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置 </el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['web:note:edit']"
          >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['web:note:remove']"
          >删除
        </el-button>
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="noteList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column
        label="分类"
        align="center"
        prop="cpid"
        :formatter="categoryFormatter"
      />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="作者" align="center" prop="author" />
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
      <el-table-column label="内容" align="center" prop="content" />
      <el-table-column label="图片数量" align="center" prop="count" />
      <el-table-column label="类型" align="center" prop="noteType">
        <template #default="scope">
          <dict-tag :options="note_type" :value="scope.row.noteType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="auditStatus">
        <template #default="scope">
          <dict-tag :options="audit_status" :value="scope.row.auditStatus" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        min-width="200"
      >
        <template #default="scope">
          <el-button
            @click="handleAudit(scope.row.id, 'pass')"
            type="success"
            size="small"
          >
            通过
          </el-button>
          <el-button
            @click="handleAudit(scope.row.id, 'reject')"
            type="danger"
            size="small"
          >
            驳回
          </el-button>
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

    <!-- 添加或修改笔记对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="noteRef" :model="form" :rules="rules" label-width="80px">
        <el-col :span="13">
          <el-form-item label="分类" prop="pid">
            <el-tree-select
              v-model="form.cpid"
              :data="navbarOptions"
              :props="{
                value: 'id',
                label: 'title',
                children: 'children',
              }"
              value-key="id"
              placeholder="请选择分类"
              check-strictly
            />
          </el-form-item>
        </el-col>
        <el-form-item label="笔记标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入笔记标题" />
        </el-form-item>
        <el-form-item label="笔记类型" prop="noteType">
          <el-radio-group v-model="form.noteType">
            <el-radio
              v-for="dict in note_type"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="笔记封面" prop="noteCover">
          <el-upload
            class="image-uploader"
            list-type="picture-card"
            :show-file-list="false"
            :auto-upload="false"
            :before-upload="beforeUpload"
            :on-change="handleChange"
          >
            <img v-if="form.noteCover" :src="form.noteCover" class="image" />
            <i v-else class="el-icon-plus image-uploader-icon">
              <el-icon>
                <Plus />
              </el-icon>
            </i>
          </el-upload>
        </el-form-item>
        <el-form-item label="笔记内容" prop="content">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="sort">
            <el-input-number v-model="form.sort" :min="0" />
          </el-form-item>
        </el-col>
        <el-form-item label="是否置顶" prop="pinned">
          <el-radio-group v-model="form.pinned">
            <el-radio
              v-for="dict in pinned"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="笔记状态" prop="auditStatus">
          <el-radio-group v-model="form.auditStatus">
            <el-radio
              v-for="dict in audit_status"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Note">
import {
  auditNote,
  unAuditListNote,
  addNote,
  delNote,
  getNote,
  updateNote,
} from "@/api/web/note";
import { listNavbar } from "@/api/web/navbar";

const { proxy } = getCurrentInstance();
const { sys_normal_disable, note_type, audit_status, pinned } = proxy.useDict(
  "sys_normal_disable",
  "note_type",
  "audit_status",
  "pinned"
);

const noteList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const previewVisible = ref(false);
const previewSrc = ref("");
const previewStyle = reactive({ top: "0px", left: "0px" });
const navbarOptions = ref([]);
const categoriesMap = ref({});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    type: undefined,
    status: undefined,
    pid: "",
  },
  rules: {
    title: [{ required: true, message: "笔记标题不能为空", trigger: "blur" }],
    type: [{ required: true, message: "笔记类型不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

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

/** 查询笔记列表 */
function getList() {
  loading.value = true;
  unAuditListNote(proxy.addDateRange(queryParams.value, dateRange.value)).then(
    (response) => {
      noteList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    }
  );
}
/** 查询导航栏下拉树结构 */
function getTreeSelect() {
  navbarOptions.value = [];
  listNavbar().then((response) => {
    const navbar = { id: 0, title: "主类目", children: [], disabled: true };
    navbar.children = proxy.handleTree(response.data, "id", "pid");
    navbarOptions.value.push(navbar);
    createCategoriesMap(response.data);
  });
}
/** 生成分类映射 */
function createCategoriesMap(data) {
  categoriesMap.value = {};
  data.forEach((item) => {
    categoriesMap.value[item.id] = item.title;
  });
}

/** 获取分类名称 */
function getCategoryTitle(pid) {
  return categoriesMap.value[pid] || "未知分类";
}

/** 分类名称格式化器 */
function categoryFormatter(row, column, cellValue) {
  return getCategoryTitle(cellValue);
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    title: undefined,
    type: undefined,
    status: "0",
  };
  proxy.resetForm("noteRef");
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
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getTreeSelect();
  const noteId = row.id || ids.value;
  getNote(noteId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改笔记";
  });
}
function beforeUpload(file) {
  return false;
}
function handleChange(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = (e) => {
    form.value.noteCover = e.target.result; // 设置预览图URL
    form.value.file = file.raw; // 存储选择的文件
  };
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["noteRef"].validate((valid) => {
    if (valid) {
      let params = new FormData();
      params.append("file", form.value.file);
      params.append("note", JSON.stringify(form.value));
      if (form.value.id != undefined) {
        updateNote(params).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addNote(params).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row) {
  const noteIds = row.id || ids.value;
  proxy.$modal
    .confirm('是否确认删除笔记编号为"' + noteIds + '"的数据项？')
    .then(function () {
      return delNote(noteIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

/** 审核按钮操作 */
function handleAudit(noteId, auditType) {
  const data = {
    noteId: noteId,
    auditType: auditType,
  };
  // 调用审核 API
  proxy.$modal
    .confirm(`是否确认${auditType === "pass" ? "通过" : "拒绝"}该笔记？`)
    .then(() => {
      return auditNote(data);
    })
    .then(() => {
      proxy.$modal.msgSuccess(`${auditType === "pass" ? "通过" : "拒绝"}成功`);
      getList(); // 审核成功后，刷新笔记列表
    })
    .catch(() => {});
}

getList();
onMounted(getTreeSelect);
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

.image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.image-uploader .el-upload:hover {
  border-color: #409eff;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  line-height: 145px;
  margin-left: 1px;
  text-align: center;
}

.image {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

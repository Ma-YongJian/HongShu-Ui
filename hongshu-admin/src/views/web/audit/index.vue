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
          placeholder="请输入作者ID"
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
          icon="Check"
          :disabled="multiple"
          @click="handleBatchAudit('pass')"
          v-hasPermi="['web:note:edit']"
        >
          批量通过
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Close"
          :disabled="multiple"
          @click="handleBatchAudit('reject')"
          v-hasPermi="['web:note:edit']"
        >
          批量驳回
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
        >
          删除
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
      <el-table-column label="序号" align="center" prop="id" width="80" />
      <el-table-column
        label="分类"
        align="center"
        prop="cpid"
        width="110"
        :formatter="categoryFormatter"
        show-overflow-tooltip
      />
      <el-table-column
        label="标题"
        align="left"
        prop="title"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column label="作者" align="center" prop="author" width="110" show-overflow-tooltip />
      <el-table-column label="封面" align="center" prop="noteCover" width="80">
        <template #default="scope">
          <el-image
            v-if="scope.row.noteCover"
            class="cover-thumb"
            :src="scope.row.noteCover"
            :preview-src-list="[scope.row.noteCover]"
            fit="cover"
            preview-teleported
          />
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column
        label="内容"
        align="left"
        prop="content"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column label="图片" align="center" prop="count" width="70" />
      <el-table-column label="类型" align="center" prop="noteType">
        <template #default="scope">
          <dict-tag :options="note_type" :value="displayNoteType(scope.row.noteType)" />
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
          <el-button link type="primary" size="small" @click="openDetail(scope.row)">
            查看
          </el-button>
          <el-button
            @click="handleAudit(scope.row, 'pass')"
            type="success"
            size="small"
          >
            通过
          </el-button>
          <el-button
            @click="handleAudit(scope.row, 'reject')"
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

    <el-drawer v-model="detailOpen" title="审核笔记" size="440px" append-to-body>
      <div class="audit-detail" v-if="detail">
        <el-image
          v-if="detail.noteCover"
          :src="detail.noteCover"
          :preview-src-list="[detail.noteCover]"
          fit="cover"
          preview-teleported
          class="audit-cover"
        />
        <h3>{{ detail.title || "未填写标题" }}</h3>
        <p class="meta">作者：{{ detail.author || "—" }}</p>
        <p class="meta">分类：{{ getCategoryTitle(detail.cpid, detail.cid) }}</p>
        <p class="body">{{ detail.content || "暂无正文" }}</p>
        <div class="actions">
          <el-button type="success" @click="handleAudit(detail, 'pass')">通过</el-button>
          <el-button type="danger" @click="handleAudit(detail, 'reject')">驳回</el-button>
        </div>
      </div>
    </el-drawer>

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
            v-model="form.content"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
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
const detailOpen = ref(false);
const detail = ref(null);
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

function openDetail(row) {
  detail.value = row;
  detailOpen.value = true;
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
  (data || []).forEach((item) => {
    if (!item || item.id === undefined || item.id === null) return;
    categoriesMap.value[item.id] = item.title;
    categoriesMap.value[String(item.id)] = item.title;
  });
}

/** 获取分类名称 */
function getCategoryTitle(pid, cid) {
  const lookup = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const key = String(val);
    if (key === "0" || key === "-1") return "";
    return categoriesMap.value[val] || categoriesMap.value[key] || "";
  };
  return lookup(pid) || lookup(cid) || "未知分类";
}

/** 分类名称格式化器 */
function categoryFormatter(row, column, cellValue) {
  return getCategoryTitle(cellValue, row && row.cid);
}

function displayNoteType(val) {
  if (val === 0 || val === "0") return "1";
  return val;
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
    .confirm(
      row?.title
        ? `是否确认删除笔记「${row.title}」？`
        : `是否确认删除选中的 ${Array.isArray(noteIds) ? noteIds.length : 1} 条笔记？`
    )
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
function handleAudit(row, auditType) {
  const noteId = typeof row === "object" ? row.id : row;
  const name = typeof row === "object" && row.title ? `「${row.title}」` : "该笔记";
  const action = auditType === "pass" ? "通过" : "驳回";
  proxy.$modal
    .confirm(`是否确认${action}${name}？`)
    .then(() => auditNote({ noteId, auditType }))
    .then(() => {
      proxy.$modal.msgSuccess(`${action}成功`);
      detailOpen.value = false;
      getList();
    })
    .catch(() => {});
}

function handleBatchAudit(auditType) {
  const action = auditType === "pass" ? "通过" : "驳回";
  proxy.$modal
    .confirm(`是否确认${action}选中的 ${ids.value.length} 条笔记？`)
    .then(() =>
      Promise.all(ids.value.map((noteId) => auditNote({ noteId, auditType })))
    )
    .then(() => {
      proxy.$modal.msgSuccess(`${action}成功`);
      getList();
    })
    .catch(() => {});
}

getList();
onMounted(getTreeSelect);
</script>

<style scoped>
.audit-detail {
  .audit-cover {
    width: 100%;
    height: 220px;
    border-radius: 10px;
    margin-bottom: 16px;
  }
  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: #111827;
  }
  .meta {
    margin: 0 0 6px;
    color: #6b7280;
    font-size: 13px;
  }
  .body {
    margin: 16px 0;
    line-height: 1.7;
    color: #374151;
    white-space: pre-wrap;
  }
  .actions {
    display: flex;
    gap: 8px;
  }
}

.image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.image-uploader .el-upload:hover {
  border-color: #3b82f6;
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

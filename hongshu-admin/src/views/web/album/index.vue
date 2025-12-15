<template>
  <div id="table" class="app-container calendar-list-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container" style="margin: 10px 0 10px 0; display: flex">
      <el-input
        clearable
        class="filter-item"
        style="width: 200px"
        v-model="keyword"
        placeholder="请输入专辑名称"
      >
      </el-input>
      <el-button
        class="filter-item"
        type="primary"
        icon="search"
        @click="handleFind"
        style="display: flex; align-items: center"
      >
        查找
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        @click="handleAdd"
        icon="plus"
        style="display: flex; align-items: center"
      >
        添加
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        @click="checkAll()"
        icon="edit"
        style="display: flex; align-items: center"
      >
        全选
      </el-button>
      <el-button
        class="filter-item"
        type="danger"
        @click="handleDeleteBatch"
        icon="delete"
        style="display: flex; align-items: center"
      >
        删除选中
      </el-button>
    </div>

    <el-row>
      <el-col
        v-for="(item, index) in tableData"
        :key="item.id"
        style="padding: 6px"
        :xs="24"
        :sm="12"
        :md="12"
        :lg="6"
        :xl="4"
      >
        <el-card
          :body-style="{ padding: '0px', textAlign: 'center' }"
          style="position: relative"
          shadow="always"
        >
          <div class="title">{{ item.title }}</div>
          <input
            style="position: absolute; z-index: 100"
            type="checkbox"
            :id="item.id"
            :checked="selectUids.indexOf(item.id) >= 0"
            @click="checked(item)"
          />
          <el-image
            v-if="item.albumCover"
            :src="item.albumCover"
            style="cursor: pointer"
            fit="cover"
            @click="goSubjectItem(item)"
          />
          <div>
            <span class="media-title" v-if="item.title">
              {{ item.title }}
            </span>
          </div>
          <div style="margin-bottom: 14px">
            <el-button-group>
              <el-tooltip
                class="item"
                effect="dark"
                content="专辑Item"
                placement="bottom-start"
                style="margin-right: 2px"
              >
                <el-button
                  size="small"
                  icon="document"
                  @click="goSubjectItem(item)"
                />
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="编辑专辑"
                placement="bottom-start"
                style="margin-right: 2px"
              >
                <el-button
                  type="primary"
                  size="small"
                  icon="edit"
                  @click="handleEdit(item)"
                >
                </el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="删除专辑"
                placement="bottom-start"
                style="margin-right: 2px"
              >
                <el-button
                  type="danger"
                  size="small"
                  icon="delete"
                  @click="handleDelete(item)"
                />
              </el-tooltip>
            </el-button-group>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!--分页-->
    <div class="block">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="dialogFormVisible">
      <el-form :model="form" :rules="rules" ref="form">
        <el-form-item
          label="封面图"
          :label-width="formLabelWidth"
          prop="albumCover"
        >
          <div
            class="imgBody"
            v-if="form.photoList && form.photoList.length > 0"
          >
            <i
              class="el-icon-error inputClass"
              v-show="icon"
              @click="deletePhoto"
              @mouseover="icon = true"
            ></i>
            <img
              @mouseover="icon = true"
              @mouseout="icon = false"
              :src="form.photoList[0]"
              style="display: inline; width: 195px; height: 105px"
            />
          </div>
          <div v-else class="uploadImgBody" @click="checkPhoto">
            <i class="el-icon-plus avatar-uploader-icon"></i>
          </div>
        </el-form-item>

        <el-form-item label="专辑名" :label-width="formLabelWidth" prop="title">
          <el-input v-model="form.title" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item label="用户ID" :label-width="formLabelWidth">
          <el-input v-model="form.uid" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item label="排序" :label-width="formLabelWidth" prop="sort">
          <el-input v-model="form.sort" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <CheckPhoto
      v-if="!isFirstPhotoVisible"
      @choose_data="getChooseData"
      @cancelModel="cancelModel"
      :photoVisible="photoVisible"
      :photos="photoList"
      :files="fileIds"
      :limit="1"
    ></CheckPhoto>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import {
  getSubjectList,
  addSubject,
  editSubject,
  deleteBatchSubject,
} from "@/api/web/album";
import CheckPhoto from "@/components/CheckPhoto";

const router = useRouter();
const tableData = ref([]);
const total = ref(0);
const title = ref("");
const keyword = ref("");
const chooseTitle = ref("全选");
const isCheckedAll = ref(false);
const selectUids = ref([]);
const formLabelWidth = ref("120px");
const dialogFormVisible = ref(false);
const isEditForm = ref(false);
const photoVisible = ref(false);
const photoList = ref([]);
const fileIds = ref("");
const icon = ref(false);
const isFirstPhotoVisible = ref(true);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
  },
  rules: {
    fileUid: [{ required: true, message: "封面图片不能为空", trigger: "blur" }],
    subjectName: [
      { required: true, message: "专辑名不能为空", trigger: "blur" },
      { min: 1, max: 20, message: "长度在1到20个字符" },
    ],
    sort: [
      { required: true, message: "排序字段不能为空", trigger: "blur" },
      { pattern: /^[0-9]\d*$/, message: "排序字段只能为自然数" },
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);

function subjectList() {
  getSubjectList(queryParams.value).then((response) => {
    tableData.value = response.rows;
    total.value = response.total;
  });
}

function handleFind() {
  subjectList();
}

function getFormObject() {
  return {
    id: null,
    title: null,
    sort: 0,
  };
}

function checked(data) {
  const idIndex = selectUids.value.indexOf(data.id);
  if (idIndex >= 0) {
    selectUids.value.splice(idIndex, 1);
  } else {
    selectUids.value.push(data.id);
  }
}

function checkAll() {
  if (isCheckedAll.value) {
    selectUids.value = [];
    isCheckedAll.value = false;
    chooseTitle.value = "全选";
  } else {
    selectUids.value = [];
    tableData.value.forEach((album) => {
      selectUids.value.push(album.id);
    });
    isCheckedAll.value = true;
    chooseTitle.value = "取消全选";
  }
}

function checkPhoto() {
  photoList.value = [];
  fileIds.value = "";
  photoVisible.value = true;
  isFirstPhotoVisible.value = false;
}

function getChooseData(data) {
  photoVisible.value = false;
  photoList.value = data.photoList;
  fileIds.value = data.fileIds;
  const fileId = fileIds.value.replace(",", "");
  if (photoList.value.length >= 1) {
    form.fileUid = fileId;
    form.photoList = photoList.value;
  }
}

function cancelModel() {
  photoVisible.value = false;
}

function deletePhoto() {
  form.photoList = [];
  form.fileUid = "";
}

function handleCurrentChange(val) {
  currentPage.value = val;
  subjectList();
}

function handleAdd() {
  title.value = "增加专辑";
  dialogFormVisible.value = true;
  Object.assign(form, getFormObject());
  isEditForm.value = false;
}

function handleEdit(row) {
  title.value = "编辑专辑";
  dialogFormVisible.value = true;
  isEditForm.value = true;
  Object.assign(form, row);
}

function goSubjectItem(row) {
  const uid = row.uid;
  router.push({
    path: "subjectItem",
    query: { subjectUid: uid },
  });
}

function handleDelete(row) {
  ElMessageBox.confirm("此操作将会把该专题删除, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const params = [row];
      deleteBatchSubject(params).then((response) => {
        if (response.code == "success") {
          ElMessage.success(response.message);
        } else {
          ElMessage.error(response.message);
        }
        subjectList();
      });
    })
    .catch(() => {
      ElMessage.info("已经取消删除");
    });
}

function handleDeleteBatch() {
  if (selectUids.value.length <= 0) {
    ElMessage.error("请先选中需要删除的内容！");
    return;
  }
  ElMessageBox.confirm("此操作将把选中的专题删除, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const deleteList = selectUids.value.map((id) => ({ id }));
      deleteBatchSubject(deleteList).then((response) => {
        if (response.code == this.$ECode.SUCCESS) {
          ElMessage.success(response.message);
        } else {
          ElMessage.error(response.message);
        }
        subjectList();
      });
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
}

function submitForm() {
  this.$refs.form.validate((valid) => {
    if (!valid) {
      console.log("校验出错");
    } else {
      if (isEditForm.value) {
        editSubject(form).then((response) => {
          if (response.code == this.$ECode.SUCCESS) {
            ElMessage.success(response.message);
            dialogFormVisible.value = false;
            subjectList();
          } else {
            ElMessage.error(response.message);
          }
        });
      } else {
        addSubject(form).then((response) => {
          if (response.code == this.$ECode.SUCCESS) {
            ElMessage.success(response.message);
            dialogFormVisible.value = false;
            subjectList();
          } else {
            ElMessage.error(response.message);
          }
        });
      }
    }
  });
}

onMounted(subjectList);
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  margin: 0, 0, 0, 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 195px;
  height: 105px;
  line-height: 105px;
  text-align: center;
}
.imgBody {
  width: 195px;
  height: 105px;
  border: solid 2px #ffffff;
  float: left;
  position: relative;
}
.uploadImgBody {
  margin-left: 5px;
  width: 195px;
  height: 105px;
  border: dashed 1px #c0c0c0;
  float: left;
  position: relative;
}
.uploadImgBody :hover {
  border: dashed 1px #00ccff;
}
.inputClass {
  position: absolute;
}
.img {
  width: 100%;
  height: 100%;
}

.media-title {
  color: #8492a6;
  font-size: 14px;
  padding: 14px;
  display: inline-block;
  white-space: nowrap;
  width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-image {
  width: 100%;
  height: 160px;
}

.title {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
  /*top: 15px;*/
  background: rgba(232, 40, 74, 0.8);
  color: #fff;
  padding: 3px 8px;
  font-size: 12px;
  border-radius: 3px;
}
</style>

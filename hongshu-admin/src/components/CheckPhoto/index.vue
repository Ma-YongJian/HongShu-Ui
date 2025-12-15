<template>
  <div id="body-loading" class="app-container calendar-list-container">
    <el-dialog
      title="请选择图片"
      :model-value="dialogVisible"
      fullscreen
      :before-close="before_close"
    >
      <div class="filter-container" style="margin: 10px 0 10px 0">
        <el-input
          clearable
          class="filter-item"
          style="width: 200px"
          v-model="keyword"
          @change="handleFind"
          placeholder="请输入分类名称"
        ></el-input>
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFind"
          >查找</el-button
        >
        <el-button
          class="filter-item"
          type="primary"
          @click="handleRest"
          icon="el-icon-refresh"
          >重置</el-button
        >
      </div>

      <el-tabs
        v-model="activeName"
        type="border-card"
        tab-position="left"
        style="height: 600px; width: 100%"
        @tab-click="clickTab"
      >
        <el-tab-pane
          style="height: 570px; width: 100%; overflow: auto"
          v-for="(pictureSort, index) in pictureSorts"
          :key="index"
        >
          <template #label>
            <div class="sortItem" style="float: left">
              <i class="el-icon-picture"></i>
              {{ submitText(pictureSort.name) }}
            </div>
          </template>
          <div style="clear: both"></div>
          <div>
            <img
              v-if="pictureSort.pictures"
              v-for="picture in pictureSort.pictures"
              :key="picture.fileUid"
              class="showPicture"
              @click="checkLogoConfirm(picture.fileUid, picture.pictureUrl)"
              :src="picture.pictureUrl"
            />
          </div>
          <div
            class="addPicture"
            v-if="
              pictureSort.total -
                pictureSort.pageSize * pictureSort.currentPage <
              0
            "
            @click="toPictureManager(pictureSort.pictureSortUid)"
          >
            <span>+</span>
          </div>

          <el-pagination
            class="pagination"
            @current-change="handleCurrentChange"
            :current-page="pictureSort.currentPage"
            :page-size="pictureSort.pageSize"
            small
            layout="prev, pager, next"
            :total="pictureSort.total"
          ></el-pagination>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div
          class="ChooseBody"
          :key="index"
          v-for="(picture, index) in form.photoList"
        >
          <i
            @click="deletePhoto(index)"
            class="el-icon-error inputClass"
            v-show="icon"
          ></i>
          <img style="width: 100%; height: 100%" :src="picture" />
        </div>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from "vue";
import { getPictureSortList, getPictureSortByUid } from "@/api/web/pictureSort";
import { getPictureList } from "@/api/web/picture";
import { ElLoading } from "element-plus";

export default {
  props: {
    photoVisible: Boolean,
    photos: Array,
    files: String,
    limit: Number,
  },
  setup(props, { emit }) {
    const dialogVisible = ref(props.photoVisible);
    const form = reactive({
      photoList: props.photos,
      fileIds: props.files,
    });
    const pictureSorts = ref([]);
    const activeName = ref("0");
    const keyword = ref("");
    const currentPictureSortUid = ref(null);
    const icon = ref(true);
    const limitCount = ref(props.limit);

    const loadingInstance = ElLoading.service({
      target: "#body-loading",
      text: "加载中~",
    });

    const loadData = async () => {
      const params = {
        pageSize: 500,
        currentPage: 1,
        isShow: 1,
      };

      try {
        const response = await getPictureSortList(params);
        if (response.code === 200) {
          const pictureSortsData = response.data.records;
          pictureSorts.value = pictureSortsData;
          if (pictureSortsData.length > 0) {
            const pictureSortUid = pictureSortsData[0].uid;
            currentPictureSortUid.value = pictureSortUid;
            const name = pictureSortsData[0].name;
            const params = {
              pictureSortUid: pictureSortUid,
              pageSize: 24,
              currentPage: 1,
            };
            const pictureResponse = await getPictureList(params);
            if (pictureResponse.code === 200) {
              const newObject = {
                pictureSortUid: pictureSortUid,
                name: name,
                pictures: pictureResponse.data.records,
                pageSize: pictureResponse.data.size,
                currentPage: pictureResponse.data.current,
                total: pictureResponse.data.total,
              };
              pictureSorts.value[0] = newObject;
            } else {
              this.$message({ type: "error", message: pictureResponse.data });
            }
          }
        } else {
          this.$message({ type: "error", message: response.data });
        }
      } finally {
        loadingInstance.close();
      }
    };

    onMounted(loadData);

    watch(
      () => props.photoVisible,
      (newVal) => {
        dialogVisible.value = newVal;
      }
    );

    watch(
      () => props.photos,
      (newVal) => {
        form.photoList = newVal;
      }
    );

    watch(
      () => props.files,
      (newVal) => {
        form.fileIds = newVal;
      }
    );

    watch(
      () => props.limit,
      (newVal) => {
        limitCount.value = newVal;
      }
    );

    const handleCurrentChange = async (val) => {
      const pictureSortUid = currentPictureSortUid.value;
      const sortResponse = await getPictureSortByUid({ uid: pictureSortUid });
      if (sortResponse.code === 200) {
        const pictureSort = sortResponse.data;
        const params = {
          pictureSortUid: pictureSortUid,
          currentPage: val,
          pageSize: 24,
        };
        const response = await getPictureList(params);
        if (response.code === 200) {
          const newObject = {
            pictureSortUid: pictureSortUid,
            name: pictureSort.name,
            pictures: response.data.records,
            pageSize: response.data.size,
            currentPage: response.data.current,
            total: response.data.total,
          };
          pictureSorts.value[activeName.value] = newObject;
        } else {
          this.$message({ type: "error", message: response.data });
        }
      }
    };

    const handleRest = loadData;

    const handleFind = async () => {
      if (keyword.value === "") {
        handleRest();
        return;
      }
      const params = {
        pageSize: 500,
        currentPage: 1,
        isShow: 1,
        keyword: keyword.value,
      };
      const response = await getPictureSortList(params);
      if (response.code === 200) {
        const pictureSortsData = response.data.records;
        pictureSorts.value = pictureSortsData;
        if (pictureSortsData.length <= 0) {
          this.$message({
            type: "error",
            message: "没有搜索到任何信息！",
          });
        }
        const pictureSortUid = pictureSortsData[0].uid;
        const name = pictureSortsData[0].name;
        const pictureParams = {
          pictureSortUid: pictureSortUid,
          pageSize: 24,
          currentPage: 1,
        };
        const pictureResponse = await getPictureList(pictureParams);
        if (pictureResponse.code === 200) {
          const newObject = {
            pictureSortUid: pictureSortUid,
            name: name,
            pictures: pictureResponse.data.records,
            pageSize: pictureResponse.data.size,
            currentPage: pictureResponse.data.current,
            total: pictureResponse.data.total,
          };
          pictureSorts.value[0] = newObject;
        } else {
          this.$message({ type: "error", message: pictureResponse.data });
        }
      } else {
        this.$message({ type: "error", message: response.data });
      }
    };

    const clickTab = async () => {
      const index = activeName.value;
      const pictureSortUid =
        pictureSorts.value[index].uid ||
        pictureSorts.value[index].pictureSortUid;
      currentPictureSortUid.value = pictureSortUid;
      const name = pictureSorts.value[index].name;
      const params = {
        currentPage: 1,
        pictureSortUid: pictureSortUid,
        pageSize: 24,
      };
      const response = await getPictureList(params);
      if (response.code === 200) {
        const newObject = {
          pictureSortUid: pictureSortUid,
          name: name,
          pictures: response.data.records,
          pageSize: response.data.size,
          currentPage: response.data.current,
          total: response.data.total,
        };
        pictureSorts.value[index] = newObject;
      } else {
        this.$message({ type: "error", message: response.data });
      }
    };

    const checkLogoConfirm = (fileUid, pictureUrl) => {
      if (limitCount.value == 1) {
        form.photoList = [pictureUrl];
        form.fileIds = fileUid;
        emit("input", form);
        dialogVisible.value = false;
        emit("update:photoVisible", false);
      } else {
        form.photoList.push(pictureUrl);
        form.fileIds = form.fileIds ? `${form.fileIds},${fileUid}` : fileUid;
        limitCount.value--;
        emit("input", form);
      }
    };

    const toPictureManager = (pictureSortUid) => {
      const url = `/picture/pictureManagement?uid=${pictureSortUid}`;
      window.open(url, "_blank");
    };

    const deletePhoto = (index) => {
      form.photoList.splice(index, 1);
      const arr = form.fileIds.split(",");
      arr.splice(index, 1);
      form.fileIds = arr.join(",");
      emit("input", form);
    };

    const submitText = (text) => {
      if (text.length > 6) {
        text = text.substr(0, 6) + "...";
      }
      return text;
    };

    const before_close = (done) => {
      dialogVisible.value = false;
      emit("update:photoVisible", false);
    };

    const cancel = () => {
      dialogVisible.value = false;
      emit("update:photoVisible", false);
    };

    const commit = () => {
      emit("confirm", form);
      dialogVisible.value = false;
      emit("update:photoVisible", false);
    };

    return {
      dialogVisible,
      form,
      pictureSorts,
      activeName,
      keyword,
      currentPictureSortUid,
      icon,
      limitCount,
      handleCurrentChange,
      handleRest,
      handleFind,
      clickTab,
      checkLogoConfirm,
      toPictureManager,
      deletePhoto,
      submitText,
      before_close,
      cancel,
      commit,
    };
  },
};
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 150px;
  min-height: 400px;
}
.sortItem {
  height: 38px;
  font-size: 16px;
}
.showPicture {
  width: 195px;
  height: 105px;
  float: left;
  margin-left: 10px;
  margin-top: 30px;
  border: solid 1px #c7aeae;
}
.ChooseBody {
  width: 195px;
  height: 105px;
  float: left;
  margin-left: 10px;
  margin-top: 20px;
  border: solid 1px #c7aeae;
}
.inputClass {
  position: absolute;
}
.addPicture {
  width: 195px;
  height: 105px;
  float: left;
  margin-left: 10px;
  margin-top: 30px;
  border: solid 1px #c7aeae;
  line-height: 105px;
  text-align: center;
  cursor: pointer;
}

.addPicture span {
  font-size: 30px;
  color: #97a8be;
  height: 60px;
  margin: 0 auto;
}

.pagination {
  position: absolute;
  bottom: 5%;
  left: 38%;
}
</style>

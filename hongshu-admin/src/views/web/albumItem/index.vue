<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div
      class="filter-container"
      style="margin: 10px 0 10px 0"
      v-permission="'/album/sortByCreateTime'"
    >
      <el-button
        class="filter-item"
        type="info"
        @click="handleSortByCreateTime(true)"
        icon="document"
      >
        按创建时间倒排
      </el-button>

      <el-button
        class="filter-item"
        type="info"
        @click="handleSortByCreateTime(false)"
        icon="document"
      >
        按创建时间正排
      </el-button>
    </div>

    <aside>在博客管理添加专题元素，通过拖拽实现专题内列表的排序</aside>

    <el-table
      ref="dragTable"
      :data="list"
      row-key="id"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="标题图" width="180px" align="center">
        <template slot-scope="{ row }">
          <img
            v-if="row.blog.photoList"
            :src="row.blog.photoList[0]"
            style="width: 130px; height: 70px"
          />
        </template>
      </el-table-column>

      <el-table-column width="250px" label="标题" align="center">
        <template slot-scope="{ row }">
          <el-tooltip
            @click.native="onClick(row)"
            class="item"
            effect="dark"
            :content="row.blog.title"
            placement="top"
          >
            <span style="cursor: pointer">{{
              strSubstring(row.blog.title, 20)
            }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column width="100px" label="作者" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.blog.author }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" label="是否原创" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.blog.isOriginal == 1" type="success">原创</el-tag>
          <el-tag v-if="row.blog.isOriginal == 0" type="info">转载</el-tag>
        </template>
      </el-table-column>

      <el-table-column width="100px" label="分类" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.blog.blogSort.sortName }}</span>
        </template>
      </el-table-column>

      <el-table-column width="300px" label="标签" align="center">
        <template slot-scope="{ row }">
          <template>
            <el-tag
              style="margin-left: 3px"
              type="warning"
              v-if="item"
              :key="index"
              v-for="(item, index) in row.blog.tagList"
              >{{ item.content }}</el-tag
            >
          </template>
        </template>
      </el-table-column>

      <el-table-column label="排序" width="100" align="center">
        <template slot-scope="scope">
          <el-tag type="warning">{{ scope.row.sort }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column width="100px" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            @click="handleDelete(row)"
            type="danger"
            size="small"
            v-permission="'/subjectItem/delete'"
            >删除</el-button
          >
        </template>
      </el-table-column>

      <el-table-column align="center" label="拖拽" width="80">
        <template slot-scope="{}">
          <svg-icon class="drag-handler" icon-class="drag" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getSubjectItemList,
  editSubjectItem,
  deleteBatchSubjectItem,
  sortByCreateTime,
} from "@/api/web/albumItem";
import Sortable from "sortablejs";

const list = ref([]);
const total = ref(null);
const listLoading = ref(true);
const BLOG_WEB_URL = process.env.BLOG_WEB_URL;
const subjectUid = ref("");
const listQuery = ref({
  page: 1,
  limit: 10,
});
const sortable = ref(null);

const route = useRoute();
const router = useRouter();

const statusFilter = (status) => {
  const statusMap = {
    published: "success",
    draft: "info",
    deleted: "danger",
  };
  return statusMap[status];
};

const handleSortByCreateTime = (isDesc) => {
  if (list.value.length === 0) {
    this.$commonUtil.message.error("没有专题元素，无法进行排序");
    return;
  }

  this.$confirm(
    "此操作将根据博客创建时间对所有的专题元素进行升序&降序排列, 是否继续?",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      let params = new URLSearchParams();
      params.append("subjectUid", subjectUid.value);
      params.append("isDesc", isDesc);
      sortByCreateTime(params).then((response) => {
        if (response.code === this.$ECode.SUCCESS) {
          this.$commonUtil.message.success(response.message);
          getList();
        } else {
          this.$commonUtil.message.error(response.message);
        }
      });
    })
    .catch(() => {
      this.$commonUtil.message.info("已取消批量排序");
    });
};

const getList = () => {
  // TODO 这里暂时没有做成分页而是全部显示，考虑到分页后不太好拖拽
  var params = {};
  params.subjectUid = subjectUid.value;
  params.pageSize = 100;
  params.currentPage = 1;
  getSubjectItemList(params).then((response) => {
    if (response.code === this.$ECode.SUCCESS) {
      list.value = response.data.records;
      total.value = response.total;
      nextTick(() => {
        setSort();
      });
    }
  });
};

const handleDelete = (row) => {
  this.$confirm("此操作将把博客移除该专辑, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      var params = {};
      params.uid = row.uid;
      let subjectItemList = [params];
      deleteBatchSubjectItem(subjectItemList).then((response) => {
        if (response.code === this.$ECode.SUCCESS) {
          this.$commonUtil.message.success(response.message);
        } else {
          this.$commonUtil.message.error(response.message);
        }
        getList();
      });
    })
    .catch(() => {
      this.$commonUtil.message.info("已取消删除");
    });
};

const onClick = (row) => {
  window.open(BLOG_WEB_URL + "/#/info?blogUid=" + row.blog.uid);
};

const setSort = () => {
  const el = document.querySelector(".el-table__body-wrapper > table > tbody");
  sortable.value = Sortable.create(el, {
    ghostClass: "sortable-ghost", // Class name for the drop placeholder,
    setData: function (dataTransfer) {
      dataTransfer.setData("Text", "");
    },
    onEnd: (evt) => {
      let listValue = list.value;
      const targetRow = listValue.splice(evt.oldIndex, 1)[0];
      listValue.splice(evt.newIndex, 0, targetRow);
      let subjectList = [];
      for (let a = listValue.length - 1; a >= 0; a--) {
        let params = {};
        params.uid = listValue[a].uid;
        params.blogUid = listValue[a].blogUid;
        params.subjectUid = listValue[a].subjectUid;
        params.sort = listValue.length - a;
        subjectList.push(params);
      }
      editSubjectItem(subjectList).then((response) => {
        if (response.code === this.$ECode.SUCCESS) {
          this.$commonUtil.message.success(response.message);
          router.go(0);
        }
      });
    },
  });
};

onMounted(() => {
  subjectUid.value = route.query.subjectUid;
  getList();
});
</script>

<style lang="scss">
.sortable-ghost {
  opacity: 0.8;
  color: #fff !important;
  background: #42b983 !important;
}
aside {
  background: #eef1f6;
  padding: 8px 24px;
  margin-bottom: 20px;
  border-radius: 2px;
  display: block;
  line-height: 32px;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  color: #2c3e50;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  a {
    color: #337ab7;
    cursor: pointer;

    &:hover {
      color: rgb(32, 160, 255);
    }
  }
}
</style>

<style scoped>
.icon-star {
  margin-right: 2px;
}
.drag-handler {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.show-d {
  margin-top: 15px;
}
</style>

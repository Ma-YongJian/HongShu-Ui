<template>
  <div>
    <svg-icon icon-class="crown" color="#e6a23c" @click="goto" />
  </div>
</template>

<script setup>
const url = ref("https://www.yuque.com/xiaomage-ippj7/kaoqwn/rqslw69egcbgx7v7?singleDoc#");

function goto() {
  window.open(url.value);
}
</script>

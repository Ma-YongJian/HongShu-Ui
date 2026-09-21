<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="520px"
    append-to-body
    class="agreement-dialog"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="agreement-body" v-html="dialogHtml"></div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { AGREEMENT_HTML, AGREEMENT_TITLE, type AgreementType } from "@/constants/agreements";

const props = defineProps<{
  modelValue: boolean;
  type: AgreementType;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const dialogTitle = computed(() => AGREEMENT_TITLE[props.type]);
const dialogHtml = computed(() => AGREEMENT_HTML[props.type]);
</script>

<style scoped>
.agreement-body {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(51, 51, 51, 0.82);
}

.agreement-body :deep(p) {
  margin: 0 0 12px;
}

.agreement-body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>

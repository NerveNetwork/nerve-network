<template>
  <p class="flex-center">
    <span>
      <!-- <span v-if="required"></span> -->
      {{ label }}
    </span>
    <el-tooltip
      popper-class="mint-popper"
      effect="dark"
      :content="tip"
      placement="top"
    >
      <img
        v-if="!white"
        class="tip-icon"
        src="../../assets//img/tip.svg"
        alt=""
      />
      <img
        v-else
        class="tip-icon"
        src="../../assets//img/tip-white.svg"
        alt=""
      />
    </el-tooltip>
  </p>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string;
  tip: string;
  required?: boolean;
  white?: boolean;
}>();
</script>

<style lang="scss" scoped>
.flex-center {
  .tip-icon {
    cursor: pointer;
    margin-left: 5px;
  }
}
</style>

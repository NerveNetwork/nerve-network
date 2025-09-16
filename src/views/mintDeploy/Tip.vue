<template>
  <p class="flex items-center">
    <span v-if="required" class="text-error">*</span>
    <span class="text-label">
      <!-- <span v-if="required"></span> -->
      {{ label }}
    </span>
    <el-tooltip
      popper-class="mint-popper"
      effect="dark"
      :content="tip"
      placement="top">
      <span :class="['cursor-pointer ml-1', white ? 'text-white' : 'text-label']">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z"
            stroke="#878DAB"
            stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </span>

      <!-- <img
        v-if="!white"
        class="tip-icon"
        src="../../assets//img/tip.svg"
        alt="" />
      <img
        v-else
        class="tip-icon"
        src="../../assets//img/tip-white.svg"
        alt="" /> -->
    </el-tooltip>
  </p>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string
  tip: string
  required?: boolean
  white?: boolean
}>()
</script>

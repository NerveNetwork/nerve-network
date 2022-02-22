<template>
  <div class="handle-wrap">
    <el-button @click="addLiquidity">{{ $t('info.info17') }}</el-button>
    <el-button type="primary" @click="swap">{{ $t('info.info18') }}</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function addLiquidity() {
  router.push('/liquidity');
}
function swap() {
  router.push('/swap');
}
</script>

<style lang="scss">
.handle-wrap {
  .el-button {
    min-width: 140px;
    span {
      font-size: 14px;
    }
    &:first-child {
      color: #2688F7;
      border-color: #2688F7;
    }
  }
}
</style>

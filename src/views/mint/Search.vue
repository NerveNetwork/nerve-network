<template>
  <div class="search-wrap">
    <div class="left">
      <el-input
        class="search-input"
        v-model="inputVal"
        :placeholder="$t('assets.assets8')"
        :suffix-icon="Search"
        @change="emitSearch"
      />
      <el-select
        v-model="selectVal"
        placeholder=""
        popper-class="select"
        @change="emitSearch"
      >
        <el-option :label="$t('mint.mint48')" value="1"></el-option>
        <el-option :label="$t('mint.mint49')" value="2"></el-option>
        <el-option :label="$t('mint.mint50')" value="3"></el-option>
      </el-select>
    </div>
    <div class="deploy">
      <router-link :to="{ name: 'mintDeploy' }">
        {{ $t('mint.mint1') }}
      </router-link>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';

const emits = defineEmits(['search']);

const inputVal = ref('');
const selectVal = ref('1');

function emitSearch() {
  emits('search', inputVal.value, selectVal.value);
}
</script>
<style lang="scss" scoped>
@import '../../assets/css/style.scss';
.search-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  :deep(.search-input) {
    width: 280px;
    // border-radius: 10px;
    margin-right: 10px;
    .el-input__inner {
      border-radius: 10px;
    }
  }
  :deep(.el-select) {
    width: 140px;
    // border-radius: 10px;
    .el-input__inner {
      border-radius: 10px;
    }
  }
  .deploy {
    a {
      font-size: 14px;
      color: $btnColor;
      border: 1px solid $btnColor;
      border-radius: 10px;
      padding: 8px;
      &:hover {
        opacity: 0.7;
      }
    }
  }
  @media screen and(max-width: 560px) {
    // height: 12px;
    margin: 20px 0;
    flex-wrap: wrap;
    .left {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
    :deep(.search-input) {
      width: 220px;
      margin-bottom: 15px;
    }
    :deep(.el-select) {
      width: 120px;
    }
    .deploy {
      width: 100%;
      text-align: right;
    }
  }
}
</style>

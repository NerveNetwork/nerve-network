<template>
  <div class="info-tx-list">
    <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane :label="$t('info.info20')" name="all">
        <Table :data="list" />
      </el-tab-pane>
      <el-tab-pane :label="$t('info.info21')" name="swap">
        <Table :data="list" />
      </el-tab-pane>
      <el-tab-pane :label="$t('info.info22')" name="add">
        <Table :data="list" />
      </el-tab-pane>
      <el-tab-pane :label="$t('info.info23')" name="remove">
        <Table :data="list" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import Table from './Table';

const activeTab = ref('all');

const list = [
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'},
  { handle: 'Swap NVT fro BUSD', price: '345', amount1: '2352345', amount2: '23q234', account: 'asdf3..adf', time: '23523'}
]
</script>

<style lang="scss" scoped>
.info-tx-list {
  ::v-deep .el-tabs .el-tabs__nav-wrap::after {
    width: 100%;
  }
}
</style>

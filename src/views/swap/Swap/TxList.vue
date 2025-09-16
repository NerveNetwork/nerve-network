<template>
  <div class="swap-tx-list">
    <el-table class="hidden md:block" :data="props.list" v-loading="loading">
      <el-table-column :label="$t('trading.trading3')">
        <template #default="scope">
          <el-tooltip :content="scope.row.toAmount" placement="top">
            {{ toThousands(fixNumber(scope.row.toAmount, 6)) }} {{ scope.row.toSymbol }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="lock" :label="$t('trading.trading4')">
        <template #default="scope">
          <el-tooltip :content="scope.row.fromAmount" placement="top">
            {{ toThousands(fixNumber(scope.row.fromAmount, 6)) }} {{ scope.row.fromSymbol }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="time"
        :label="$t('trading.trading2')"
      ></el-table-column>
      <el-table-column :label="$t('trading.trading5')" width="100px">
        <template #default="scope">
          <i-custom-success class="w-4 h-4 mr-2.5" />
          <i-custom-open class="btn w-4 h-4 text-primary cursor-pointer" @click="openExplorer('hash', scope.row.hash)" />

        </template>
      </el-table-column>
    </el-table>
    <div class="block md:hidden">
      <ul class=" overflow-y-auto max-h-[500px]">
        <li class="pb-2.5 mb-2.5 border-b border-line" v-for="(item, index) in props.list" :key="index">
          <div class="flex justify-between mb-1">
            <div>
              <div class="text-label">{{ $t('trading.trading3') }}</div>
              <div>{{ $thousands(item.toAmount) + item.toSymbol }}</div>
            </div>
            <div class="text-right">
              <div class="text-label">{{ $t('trading.trading5') }}</div>
              <div>{{ $t('trading.trading18') }}</div>
            </div>
          </div>
          <div class="flex justify-between  mb-1">
            <div>
              <div class="text-label">{{ $t('trading.trading4') }}</div>
              <div>{{ $thousands(item.fromAmount) + item.fromSymbol }}</div>
            </div>
            <div class="text-right">
              <div class="text-label">{{ $t('trading.trading2') }}</div>
              <div>{{ item.time }}</div>
            </div>
          </div>
          <div class="flex justify-between">
            <div class="text-label">Hash</div>
            <span class=" cursor-pointer btn text-primary" @click="openExplorer('hash', item.hash)">
              {{ superLong(item.hash, 8) }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { openExplorer, superLong, toThousands, fixNumber } from '@/utils/util';

const props = defineProps({
  list: Array,
  loading: Boolean
});
</script>

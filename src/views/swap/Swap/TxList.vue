<template>
  <div class="swap-tx-list">
    <template v-if="loading">
      <div class="flex flex-col gap-4">
        <Skeleton class="h-9" />
        <Skeleton class="h-9" />
      </div>
    </template>
    <template v-else-if="!list.length">
      <div class="pt-10 no-data">
        No Data
      </div>
    </template>
    <template v-else>
      <el-table class="hidden md:block" :data="props.list" v-loading="loading">
        <el-table-column label="Receive" min-width="120">
          <template v-slot="scope">
            {{ toThousands(scope.row.amount1) + ' ' + scope.row.token1 }}
          </template>
        </el-table-column>
        <el-table-column label="Send" min-width="120">
          <template v-slot="scope">
            {{ toThousands(scope.row.amount0) + ' ' + scope.row.token0 }}
          </template>
        </el-table-column>
        <el-table-column prop="time" label="Date" min-width="100"></el-table-column>
        <el-table-column label="" align="center">
          <template v-slot="scope">
            <i-custom-open
              class="btn h-4 w-4 cursor-pointer text-primary"
              @click="openExplorer('hash', scope.row.hash)" />
          </template>
        </el-table-column>
      </el-table>
      <div class="block md:hidden">
        <ul class="max-h-[500px] overflow-y-auto">
          <li
            class="mb-2.5 border-b border-line pb-2.5"
            v-for="(item, index) in props.list"
            :key="index">
            <div class="mb-1 flex justify-between">
              <span class="text-label">Receive</span>
              <span>{{ toThousands(item.amount1) + ' ' + item.token1 }}</span>
            </div>
            <div class="mb-1 flex justify-between">
              <span class="text-label">Send</span>
              <span>{{ toThousands(item.amount0) + ' ' + item.token0 }}</span>
            </div>
            <div class="mb-1 flex justify-between">
              <span class="text-label">Time</span>
              <span>{{ item.time }}</span>
            </div>
            <div class="flex justify-between">
              <div class="text-label">Hash</div>
              <span
                class="btn cursor-pointer text-primary"
                @click="openExplorer('hash', item.hash)">
                {{ superLong(item.hash, 8) }}
              </span>
            </div>
          </li>
        </ul>
      </div>

      <div class="text-center mt-4 text-primary">
        <router-link :to="`/info/tokens/${assetKey}`" class="btn inline-flex items-center gap-1.5">
          <span>More</span>
          <i-custom-right />
        </router-link>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { openExplorer, superLong, toThousands, fixNumber } from '@/utils/util'
import { TxItem } from '@/views/info/types'

interface Props {
  assetKey: string
  list: TxItem[]
  loading: boolean
}

const props = defineProps<Props>()
</script>

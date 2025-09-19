<template>
  <div>
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
        <el-table-column label="Address" min-width="120">
          <template v-slot="scope">
            <Link
              :label="superLong(scope.row.address, 6)"
              @click="openExplorer('address', scope.row.address)" />
          </template>
        </el-table-column>
        <el-table-column label="Amount" min-width="120">
          <template v-slot="scope">
            {{ toThousands(scope.row.balance) }}
          </template>
        </el-table-column>
        <el-table-column label="Percentage" min-width="100">
          <template v-slot="scope">
            {{ scope.row.rate }}
          </template>
        </el-table-column>
        <el-table-column label="Value">
          <template v-slot="scope">
            {{ toThousands(scope.row.value) }}
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
              <span class="text-label">Address</span>
              <Link
                :label="superLong(item.address, 6)"
                @click="openExplorer('address', item.address)" />
            </div>
            <div class="mb-1 flex justify-between">
              <span class="text-label">Amount</span>
              <span>{{ toThousands(item.balance) }}</span>
            </div>
            <div class="mb-1 flex justify-between">
              <span class="text-label">Percentage</span>
              <span>{{ item.rate }}</span>
            </div>
            <div class="flex justify-between">
              <div class="text-label">Value</div>
              <span>
                {{ toThousands(item.value) }}
              </span>
            </div>
          </li>
        </ul>
      </div>

      <div class="mt-4 text-center text-primary">
        <a
          :href="`https://scan.nerve.network/asset/${assetKey}`"
          target="_blank"
          class="btn inline-flex items-center gap-1.5">
          <span>More</span>
          <i-custom-right />
        </a>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { openExplorer, superLong, toThousands } from '@/utils/util'
import Link from '@/components/Link.vue'
import { IHolder } from '@/service/api/types/dataInfo'

interface Props {
  assetKey: string
  list: IHolder[]
  loading: boolean
}

const props = defineProps<Props>()
</script>

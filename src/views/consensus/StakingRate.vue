<template>
  <div class="mb-4 h-auto w-full rounded-xl bg-card xl:h-[360px] xl:w-[732px]">
    <!-- title -->
    <div class="flex items-center justify-between p-3 sm:px-6 sm:py-4">
      <span class="text-base font-semibold sm:text-lg">{{
        $t('staking.staking3')
      }}</span>
      <span class="font-medium text-label">
        {{ $t('staking.staking0') }}:
        <a
          href="https://scan.nerve.network"
          target="_blank"
          class="text-primary">
          ${{ $thousands(totalRewardUSD) }}
        </a>
      </span>
    </div>

    <!-- table -->
    <div class="px-3 sm:px-6">
      <template v-if="loading">
        <div class="flex flex-col gap-4">
          <Skeleton class="h-9" />
          <Skeleton class="h-9" />
          <Skeleton class="h-9" />
        </div>
      </template>
      <template v-else>
        <el-table
          :data="stakingRate"
          v-loading="loading"
          max-height="280px"
          class="hidden xl:block">
          <el-table-column
            width="170"
            :label="$t('staking.staking4')"
            prop="symbol">
          <template v-slot="scope">
          <AssetInfo :symbol="scope.row.symbol" />
        </template>
          </el-table-column>
          <el-table-column
            width="90"
            :label="$t('staking.staking5')"
            prop="rate1"></el-table-column>
          <el-table-column
            width="90"
            :label="$t('staking.staking6')"
            prop="rate2"></el-table-column>
          <el-table-column
            width="95"
            :label="$t('staking.staking7')"
            prop="rate3"></el-table-column>
          <el-table-column
            width="95"
            :label="$t('staking.staking8')"
            prop="rate4"></el-table-column>
          <el-table-column
            width="95"
            :label="$t('staking.staking9')"
            prop="rate5"></el-table-column>
          <el-table-column
            width="95"
            :label="$t('staking.staking10')"
            prop="rate6"></el-table-column>
          <el-table-column
            width="95"
            :label="$t('staking.staking11')"
            prop="rate7"></el-table-column>
          <el-table-column
            width="100"
            :label="$t('staking.staking12')"
            prop="rate8"></el-table-column>
        </el-table>
        <el-table
          :data="stakingRate"
          v-loading="loading"
          class="block xl:hidden">
          <el-table-column
            min-width="85"
            :label="$t('staking.staking4')"
            prop="symbol"></el-table-column>
          <el-table-column
            min-width="90"
            :label="$t('staking.staking5')"
            prop="rate1"></el-table-column>
          <el-table-column
            min-width="90"
            :label="$t('staking.staking6')"
            prop="rate2"></el-table-column>
          <el-table-column
            min-width="95"
            :label="$t('staking.staking7')"
            prop="rate3"></el-table-column>
          <el-table-column
            min-width="95"
            :label="$t('staking.staking8')"
            prop="rate4"></el-table-column>
          <el-table-column
            min-width="95"
            :label="$t('staking.staking9')"
            prop="rate5"></el-table-column>
          <el-table-column
            min-width="95"
            :label="$t('staking.staking10')"
            prop="rate6"></el-table-column>
          <el-table-column
            min-width="95"
            :label="$t('staking.staking11')"
            prop="rate7"></el-table-column>
          <el-table-column
            min-width="100"
            :label="$t('staking.staking12')"
            prop="rate8"></el-table-column>
        </el-table>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import Skeleton from '@/components/Base/Skeleton/index.vue'
import AssetInfo from './AssetInfo.vue'
import {
  getStakingInfo as getStakingInfoApi,
  getStackingRate
} from '@/service/api'
import { fixNumber, Plus, Times } from '@/utils/util'
import config from '@/config'
import { StakingRateListItem } from './types'
import { replaceNULS } from '@/constants/constants'

const loading = ref(true)
onMounted(() => {
  getTotalStakingInfo()
  getStakingRate().then(() => {
    loading.value = false
  })
})

const totalRewardUSD = ref('0')

async function getTotalStakingInfo() {
  const result: any = await getStakingInfoApi()
  if (result && result.length) {
    let totalUsd = '0'
    result.map((v: any) => {
      totalUsd = Plus(v.usdValue, totalUsd).toFixed()
    })
    totalRewardUSD.value = fixNumber(totalUsd, 2)
  }
}

// 年化利率表
const stakingRate = ref<StakingRateListItem[]>([])
//获取各种币种stacking收益率
async function getStakingRate() {
  const result: any = await getStackingRate()
  if (result && result.length) {
    const res: StakingRateListItem[] = []
    result.map((v: StakingRateListItem) => {
      const obj = {} as StakingRateListItem
      v.symbol = replaceNULS(v.symbol)
      obj.symbol = v.symbol
      v.detailList
        .filter(v => v.timeType !== 7)
        .forEach((item, index) => {
          obj['rate' + (index + 1)] =
            Number(Times(item.totalAddition, 100)).toFixed(2) + '%'
        })
      res.push(obj)
    })
    stakingRate.value = res
    // loading.value = false;
  }
}

function openExplorerUrl() {
  window.open(config.explorerUrl)
}
defineExpose({
  refreshList: getStakingRate
})
</script>

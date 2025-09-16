<template>
  <div
    class="mb-4 mr-0 h-[360px] w-full rounded-xl bg-card xl:mr-5 xl:w-[528px]">
    <div class="flex w-full items-center justify-between p-3 sm:px-6 sm:py-4">
      <div class="flex items-center gap-2 text-base font-semibold sm:text-lg">
        <span>{{ $t('staking.staking32') }}</span>
        <div class="h-3 w-px bg-label"></div>
        <span>${{ myTotalStake }}</span>
      </div>
      <Button
        class="h-7 rounded-lg px-2 sm:h-9 sm:rounded-xl"
        @click="joinStakingDialog = true">
        {{ $t('staking.staking1') }}
      </Button>
    </div>

    <div
      class="flex items-center gap-2 bg-[#101116] p-3 sm:gap-4 sm:px-6 sm:py-4 sm:text-base">
      <div class="text-label">{{ $t('staking.staking33') }}</div>
      <div class="font-semibold text-[#2E90FF]">
        {{ toThousands(myReward) }} ≈ ${{ toThousands(myRewardUsd) }}
      </div>
    </div>

    <div class="h-60 px-4">
      <PieChart :data="pieData" />
    </div>

    <!--加入staking弹窗-->
    <JoinStake
      v-model:show="joinStakingDialog"
      :canStakingList="props.canStakingList"
      :address="address"
      @refresh="refresh" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Button from '@/components/Base/Button/index.vue'
import PieChart from './PieChart.vue'
import JoinStake from './JoinStake.vue'
import { useWalletStore } from '@/store/wallet'
import {
  getStakingInfo as getStakingInfoApi,
  getStakingReward
} from '@/service/api'
import {
  divisionAndFix,
  Plus,
  fixNumber,
  Times,
  toThousands
} from '@/utils/util'

import { CanStakingListItem } from '@/views/consensus/types'

interface PieData {
  name: string
  amount: number
  value: number
  rate: string
}

const props = defineProps<{
  address?: string
  canStakingList: CanStakingListItem[]
}>()

const emit = defineEmits(['refresh'])

const walletStore = useWalletStore()
const { nerveAddress, nvtPrice } = storeToRefs(walletStore)

// 我的质押信息
const pieData = ref<PieData[]>([])
const myTotalStake = ref('0')

watch(
  nerveAddress,
  val => {
    if (val) {
      getStakingInfo()
      getRewardInfo()
    }
  },
  { immediate: true }
)

// onMounted(() => {
//   getStakingInfo();
//   getRewardInfo();
//   // getCanStakingList();
// });

async function getStakingInfo() {
  if (!nerveAddress.value) return
  pieData.value = []
  const result: any = await getStakingInfoApi(nerveAddress.value);
  if (result && result.length) {
    let totalUsd = 0
    result.map((v: any) => {
      totalUsd += Plus(v.usdValue, totalUsd).toNumber()
      if (v.symbol === 'ETH') {
        v.amount = divisionAndFix(v.amount, v.decimal, 8)
      } else {
        v.amount = divisionAndFix(v.amount, v.decimal, 4)
      }
      pieData.value.push({
        name: v.symbol,
        amount: v.amount,
        value: v.usdValue.toFixed(2),
        rate: parseFloat((v.rate * 100).toFixed(4)) + '%'
      })
    })
    myTotalStake.value = fixNumber(totalUsd, 2)
  }
}

// 我的奖励信息
const myReward = ref('0')
const myRewardUsd = ref('0')
async function getRewardInfo() {
  const result: any = await getStakingReward(nerveAddress.value)
  if (result) {
    // const nvtInfo = assetsList.value.find(v => v.symbol === 'NVT') as AssetItem;
    myReward.value = divisionAndFix(result.totalReward, 8, 2)
    myRewardUsd.value = fixNumber(
      Times(myReward.value, nvtPrice.value).toFixed(),
      2
    )
  }
}

const joinStakingDialog = ref(false)

function refresh() {
  emit('refresh')
}
defineExpose({
  refreshList: () => {
    getStakingInfo()
    getRewardInfo()
  }
})
</script>

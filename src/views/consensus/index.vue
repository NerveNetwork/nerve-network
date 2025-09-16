<template>
  <div class="consensus-page">
    <div class="w1200">
      <div class="flex flex-wrap">
        <MyStaking
          ref="myStaking"
          :canStakingList="canStakingList"
          :address="walletStore.nerveAddress"
          @refresh="refresh"
        />
        <StakingRate ref="stakingRate" />
      </div>
      <StakingRecord
        :canStakingList="canStakingList"
        :address="walletStore.nerveAddress"
        ref="recordList"
        @refresh="refresh" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import MyStaking from './MyStaking.vue'
import StakingRate from './StakingRate.vue'
import StakingRecord from './StakingRecord.vue'
import { getCanStackingAssetList } from '@/service/api'
import { useWalletStore } from '@/store/wallet'
import { CanStakingListItem } from '@/views/consensus/types'
import { replaceNULS } from '@/constants/constants'

const walletStore = useWalletStore()

onMounted(() => {
  getCanStakingList()
})
const canStakingList = ref<CanStakingListItem[]>([])
async function getCanStakingList() {
  const result: any = await getCanStackingAssetList()
  if (result && result.length) {
    result.map((v: any) => {
      v.assetKey = v.assetChainId + '-' + v.assetId
      v.symbol = replaceNULS(v.symbol)
      v.label = v.symbol
      v.value = v.assetKey
    })
    canStakingList.value = result as CanStakingListItem[]
  }
}

const myStaking = ref<InstanceType<typeof MyStaking>>()
const stakingRate = ref<InstanceType<typeof StakingRate>>()
const recordList = ref<InstanceType<typeof StakingRecord>>()
/*function setRecordListRef(el: InstanceType<typeof StakingRecord>) {
  recordList.value.push(el);
}*/

function refresh() {
  // console.log(myStaking.value, 'myStaking')
  // console.log(stakingRate.value, 'stakingRate')
  // console.log(recordList.value, 'recordList')
  setTimeout(() => {
    myStaking.value!.refreshList()
    stakingRate.value!.refreshList()
    recordList.value!.refreshList()
  }, 5000)
}
</script>

<template>
  <div class="min-h-[60vh]">
    <template v-if="assetsListLoading">
      <div class="flex flex-col gap-4">
        <Skeleton class="h-9" />
        <Skeleton class="h-9" />
        <Skeleton class="h-9" />
      </div>
    </template>
    <template v-else>
      <AssetsControl
        v-if="address"
        v-model:searchVal="searchVal"
        v-model:hideSmall="hideSmall"
        @showDialog="showAssetManage = true" />
      <div class="hidden lg:block">
        <el-table :data="filteredAssets" class="show_table" v-loading="loading">
          <el-table-column :label="$t('public.public1')">
            <template v-slot="scope">
              <div class="flex items-center">
                <el-tooltip placement="top" v-if="scope.row.registerContract">
                  <template #content>
                    <div>
                      <span>
                        {{ $t('assets.assets10') }}
                        {{ scope.row.registerContract }}
                      </span>
                    </div>
                  </template>
                  <SymbolInfo
                    :logo="scope.row.icon"
                    :name="scope.row.symbol"
                    :chain="scope.row.originNetwork"
                    :asset-key="scope.row.assetKey"></SymbolInfo>
                </el-tooltip>
                <SymbolInfo
                  v-else
                  :logo="scope.row.icon"
                  :name="scope.row.symbol"
                  :chain="scope.row.originNetwork"
                  :asset-key="scope.row.assetKey"></SymbolInfo>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.public2')">
            <template v-slot="scope">
              {{ toThousands(scope.row.available) }}
            </template>
          </el-table-column>
          <el-table-column prop="locking" :label="$t('public.public3')">
            <template v-slot="scope">
              {{ toThousands(scope.row.locking) }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.public4')">
            <template v-slot="scope">
              {{ toThousands(scope.row.number) }}
              <p class="mt-0.5 text-xs text-label">
                ≈${{ toThousands(scope.row.valuation) }}
              </p>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('public.public5')"
            align="center"
            width="260px">
            <template v-slot="scope">
              <div class="flex items-center justify-center gap-3" v-if="scope.row">
                <button
                  v-if="scope.row.canToL1"
                  type="button"
                  class="btn text-primary"
                  @click="toTransfer(scope.row, TransferType.CrossIn)">
                  {{ $t('transfer.transfer1') }}
                </button>
                <div v-if="scope.row.canToL1" class="h-2 w-[1px] bg-label"></div>
                <button
                  type="button"
                  class="btn text-primary"
                  @click="toTransfer(scope.row, TransferType.General)">
                  {{ $t('transfer.transfer2') }}
                </button>
                <div v-if="scope.row.canToL1" class="h-2 w-[1px] bg-label"></div>
                <button
                  type="button"
                  class="btn text-primary"
                  v-if="scope.row.canToL1"
                  @click="toTransfer(scope.row, TransferType.Withdrawal)">
                  {{ $t('transfer.transfer3') }}
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="rounded-[10px] border border-line lg:hidden">
        <el-empty
          :description="$t('public.public19')"
          v-loading="loading"
          v-if="!filteredAssets.length" />
        <div v-for="(item, index) in filteredAssets" v-else :key="index">
          <div class="border-b border-line p-3" @click="assetClick(item)">
            <div class="flex items-center justify-between">
              <SymbolInfo
                :name="item.symbol"
                :chain="item.originNetwork"
                :asset-key="item.assetKey"></SymbolInfo>
              <div class="flex flex-1 items-center justify-end">
                <div class="text-right">
                  <div>
                    {{ toThousands(item.number) }}
                  </div>
                  <div class="text-xs text-label">
                    ≈{{ toThousands(item.valuation) }}
                  </div>
                </div>
                <el-icon
                  :class="[
                    'icon-caret-right ml-1 transition-all duration-100',
                    item.showDetail ? '-rotate-90' : ''
                  ]">
                  <CaretRight />
                </el-icon>
              </div>
            </div>
            <div class="flex justify-between text-xs text-label">
              <span v-if="item.registerContract">
                {{ $t('assets.assets10') }}
                {{ superLong(item.registerContract, 10) }}
              </span>
            </div>
          </div>

          <CollapseTransition>
            <div class="border-b border-line py-3" v-if="item.showDetail">
              <div class="flex items-center justify-center gap-3">
                <button
                  class="btn flex h-8 w-20 items-center justify-center rounded-xl bg-primary text-xs"
                  @click="toTransfer(item, TransferType.CrossIn)"
                  v-if="item.canToL1">
                  {{ $t('transfer.transfer1') }}
                </button>
                <button
                  class="btn flex h-8 w-20 items-center justify-center rounded-xl bg-primary text-xs"
                  @click="toTransfer(item, TransferType.General)">
                  {{ $t('transfer.transfer2') }}
                </button>
                <button
                  class="btn flex h-8 w-20 items-center justify-center rounded-xl bg-primary text-xs"
                  @click="toTransfer(item, TransferType.Withdrawal)"
                  v-if="item.canToL1">
                  {{ $t('transfer.transfer3') }}
                </button>
              </div>
            </div>
          </CollapseTransition>
        </div>
      </div>
    </template>

    <AssetsManage
      v-model:showAssetManage="showAssetManage"
      :mainAssetKey="mainAssetKey"
      :L1ChainId="L1ChainId"
      :assetList="allAssetsList"
      :selectAssets="selectAssets"
      @addAssets="addAssets" />

    <Modal title="Tips" v-model="showSwitch">
      <p>
        The current network of the extension does not support this operation. Do
        you want to switch networks?
      </p>
      <Button class="mt-5 h-10 w-full" @click="showReConnect">
        {{ $t('public.public9') }}
      </Button>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { provide, ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Skeleton from '@/components/Base/Skeleton/index.vue'
import AssetsControl from './AssetsControl.vue'
import SymbolInfo from '@/components/SymbolInfo.vue'
import AssetsManage from './AssetsManage.vue'
// @ts-ignore
import CollapseTransition from '@/components/CollapseTransition.vue'
import Modal from '@/components/Base/Modal/index.vue'
import Button from '@/components/Base/Button/index.vue'
import { superLong, checkCanToL1OnCurrent, toThousands } from '@/utils/util'
import { useWalletStore } from '@/store/wallet'
import useAssetsList from './useAssetsList'
import { specialChain } from '@/hooks/useEthereum'
import storage from '@/utils/storage'

import { AssetItemType, rootCmpKey, TransferType } from './types'

const router = useRouter()
const walletStore = useWalletStore()
const {
  assetsListLoading,
  nerveAddress,
  chain: network,
  wrongChain: disableTx,
  addressInfo: currentAccount,
  currentAddress: address
} = storeToRefs(walletStore)

const {
  loading,
  searchVal,
  hideSmall,
  allAssetsList,
  selectAssets,
  filteredAssets,
  filterAssets,
  mainAssetKey,
  L1ChainId,
  crossInOutSymbol,
  addAssets,
  assetClick
} = useAssetsList()

watch(() => network.value, filterAssets)

const showAssetManage = ref(false) // 资产管理弹窗
const showSwitch = ref(false)

// 显示交易tab
const currentTab = ref<TransferType>(TransferType.General)
const transferAsset = ref<AssetItemType>({} as AssetItemType) // 当前交易的资产
const assetCanCross = ref(true)

function toTransfer(asset: AssetItemType, type: TransferType) {
  assetCanCross.value = !(disableTx.value || !canToL1OnCurrent(asset))
  currentTab.value = type
  transferAsset.value = asset
  if (type !== TransferType.General) {
    if (disableTx.value || !canToL1OnCurrent(asset)) {
      showSwitch.value = true
      return
    }
  }
  router.push(`/transfer/${type}?asset=${asset.assetKey}`)
}

function canToL1OnCurrent(asset: AssetItemType) {
  const assetCanToL1OnCurrent = checkCanToL1OnCurrent(asset)
  if (!assetCanToL1OnCurrent) return false
  return specialChain.indexOf(network.value) < 0
}

function showReConnect() {
  showSwitch.value = false
  const chainIds = transferAsset.value.heterogeneousList!.map(
    v => v.heterogeneousChainId
  )
  walletStore.changeConnectChainIds(chainIds)
  walletStore.changeConnectShow(true)
}

const rootCmp = reactive({
  nerveAddress,
  address,
  disableTx,
  network,
  transferAsset,
  crossInOutSymbol,
  allAssetsList,
  currentAccount
})

provide(rootCmpKey, rootCmp)
</script>

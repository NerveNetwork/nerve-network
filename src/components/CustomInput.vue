<template>
  <div
    :class="
      clsxm(
        'custom-input rounded-xl border border-transparent bg-input p-4 transition-colors duration-300',
        isFocus && 'border-primary'
      )
    ">
    <div class="mb-6 flex items-center justify-between text-label">
      <span>{{ label }}</span>
      <BalanceItem :balance="balance" v-if="nerveAddress && !isPush">
        <button
          class="btn h-[22px] rounded-xl bg-btn-primary px-1.5 text-xs leading-[22px] text-white"
          @click="max">
          Max
        </button>
      </BalanceItem>
    </div>
    <div class="mb-2 flex items-center justify-between">
      <div
        class="flex h-10 min-w-[110px] items-center rounded-[20px] bg-[#1F222B] px-2"
        @click="openDialog">
        <div class="flex w-full cursor-pointer items-center justify-between">
          <div class="flex items-center">
            <template v-if="selectedAsset">
              <symbol-icon
                :icon="selectedAsset.symbol"
                :asset-key="selectedAsset.assetKey"
                class="mr-2 md:h-7 md:w-7" />
              <template v-if="disableSelect">
                <span class="inline-block max-w-20 truncate">{{ icon }}</span>
              </template>
              <template v-else>
                <el-tooltip effect="dark" :content="icon" placement="top">
                  <span class="inline-block max-w-20 truncate">
                    {{ icon }}
                  </span>
                </el-tooltip>
              </template>
            </template>
            <template v-else>
              <span class="placeholder">{{ $t('transfer.transfer12') }}</span>
            </template>
          </div>
          <i-custom-down />
        </div>
      </div>

      <Input
        class="flex-1 border-none bg-transparent"
        input-class="text-right font-medium text-[20px] leading-5 h-10"
        custom-focus
        :value="amount"
        @input="changeInput"
        @focus="handleFocus"
        @blur="handleBlur"
        placeholder="0.0" />
    </div>
    <AssetsDialog
      v-model:showDialog="showDialog"
      :assetList="list"
      :hotAssets="hotAssets"
      :showBalance="!!nerveAddress"
      :showAmount="showAmount"
      :selectedAsset="selectedAsset || undefined"
      @filterAsset="filter"
      @changeSelect="changeSelect"></AssetsDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import Input from '@/components/Base/Input/index.vue'
import SymbolIcon from '@/components/SymbolIcon.vue'
import BalanceItem from '@/components/BalanceItem.vue'
import AssetsDialog from '@/components/AssetsDialog.vue'
import _ from 'lodash'
import { useWalletStore } from '@/store/wallet'

import { AssetItem } from '@/store/types'
import { HotAsset } from '@/views/swap/types'
import clsxm from '@/utils/clsxm'

interface Props {
  label: string
  icon?: string
  assetList: AssetItem[]
  hotAssets?: HotAsset[]
  inputVal: string
  balance?: string | number
  selectedAsset?: AssetItem | null
  showAmount?: boolean
  isPush?: boolean
  limitDecimals?: number
  disableSelect?: boolean
}

interface Emit {
  (e: 'update:inputVal', val: string): void
  (e: 'selectAsset', asset: AssetItem): void
  (e: 'max'): void
  (e: 'customerFocus', event: Event): void
  (e: 'blur', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  assetList: () => [],
  hotAssets: () => [],
  showAmount: true,
  isPush: false,
  limitDecimals: 0
})
const emit = defineEmits<Emit>()

const walletStore = useWalletStore()
const { nerveAddress } = storeToRefs(walletStore)

const amount = ref('')
watch(
  () => props.inputVal,
  val => {
    amount.value = val || ''
  }
)

const allAssetsList = computed<AssetItem[]>(() => {
  return _.cloneDeep(props.assetList)
})

const isFocus = ref(false)
const handleFocus = (event: FocusEvent) => {
  isFocus.value = true
  emit('customerFocus', event)
}
const handleBlur = (event: FocusEvent) => {
  isFocus.value = false
  emit('blur', event)
}

const searchVal = ref('')
const list = computed(() => {
  if (!searchVal.value) {
    return allAssetsList.value.filter(v => v)
  } else {
    if (props.showAmount) {
      return allAssetsList.value.filter(v => {
        return (
          v.assetKey.indexOf(searchVal.value) > -1 ||
          v.symbol.toUpperCase().indexOf(searchVal.value.toUpperCase()) > -1
        )
      })
    } else {
      return allAssetsList.value.filter((v, i) => {
        if (!v) {
          console.log(allAssetsList.value, 'allAssetsList.value', i)
        }
        const contractAddress = v.contractAddress as string
        return (
          contractAddress.indexOf(searchVal.value) > -1 ||
          v.symbol.toUpperCase().indexOf(searchVal.value.toUpperCase()) > -1
        )
      })
    }
  }
})

const showDialog = ref(false)
const openDialog = () => {
  if (!props.disableSelect) {
    showDialog.value = true
  }
}

const chooseAsset = computed(() => props.selectedAsset)

function changeInput(val: string) {
  // this.amount = val;
  const decimals = props.limitDecimals || chooseAsset.value?.decimals || 0
  let reg: RegExp
  if (!decimals) {
    reg = new RegExp('^([1-9][\\d]*|0)(\\.[\\d]*)?$|(^\\.[\\d]*$)')
  } else {
    reg = new RegExp(
      '^([1-9][\\d]*|0)(\\.[\\d]{0,' +
        decimals +
        '})?$|(^\\.[\\d]{0,' +
        decimals +
        '}$)'
      // "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
    )
  }
  if (reg.exec(val) || val === '') {
    emit('update:inputVal', val)
  }
}

function filter(str: string) {
  searchVal.value = str
}
function changeSelect(asset: AssetItem) {
  if (!asset) return
  emit('selectAsset', asset)
  showDialog.value = false
}
function max() {
  emit('max')
}
</script>

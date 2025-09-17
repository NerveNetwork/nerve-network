<template>
  <div>
    <div v-if="staking" class="batch-handle-wrap mb-3 flex items-center gap-3">
      <Checkbox
        :text="$t('staking.staking45')"
        v-model="selectAll"
        @change="chooseAll" />

      <Button
        class="h-6 rounded-lg px-2.5 text-xs"
        :disabled="choosedItems.length < 2"
        @click="batchHandle(BatchHandle.QUIT)">
        {{ $t('staking.staking36') }}
      </Button>

      <el-tooltip
        v-if="selectedItem.length > 1"
        :content="$t('staking.staking44')"
        placement="top">
        <Button disabled class="h-6 rounded-lg px-2.5 text-xs">
          {{ $t('staking.staking37') }}
        </Button>
      </el-tooltip>

      <Button
        v-else
        class="h-6 rounded-lg px-2.5 text-xs"
        :disabled="choosedItems.length < 2 || !canBatchChange"
        @click="batchHandle(BatchHandle.CHANGE)">
        {{ $t('staking.staking37') }}
      </Button>

      <el-tooltip
        v-if="selectedItem.length > 1"
        :content="$t('staking.staking43')"
        placement="top">
        <Button disabled class="h-6 rounded-lg px-2.5 text-xs">
          {{ $t('staking.staking38') }}
        </Button>
      </el-tooltip>
      <Button
        v-else
        class="h-6 rounded-lg px-2.5 text-xs"
        :disabled="choosedItems.length < 2"
        @click="batchHandle(BatchHandle.MERGE)">
        {{ $t('staking.staking38') }}
      </Button>
    </div>
    <el-table :data="tableData" class="hidden xl:block" v-if="staking">
      <el-table-column width="40">
        <template v-slot="scope">
          <Checkbox
            label-class="flex"
            :disabled="scope.row.fixedType !== 'NONE'"
            v-model="scope.row.checked"
            @change="chooseItem" />
        </template>
      </el-table-column>
      <el-table-column
        width="170"
        :label="$t('staking.staking4')"
        prop="symbol">
        <template v-slot="scope">
          <AssetInfo :symbol="scope.row.symbol" />
        </template>
      </el-table-column>
      <el-table-column width="180" label="Hash">
        <template v-slot="scope">
          <div
            class="flex items-center gap-1.5 text-primary"
            @click="toUrl(scope.row.txHash)">
            <span>
              {{ superLong(scope.row.txHash, 6) }}
            </span>
            <i-custom-open />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        width="150"
        :label="$t('staking.staking16')"
        prop="amount">
        <template v-slot="scope">
          <el-tooltip :content="scope.row.amount" placement="top">
            <span>{{ toThousands(fixNumber(scope.row.amount)) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        width="120"
        :label="$t('staking.staking17')"
        align="center">
        <template v-slot="scope">
          <span v-if="scope.row.status === 0">
            {{ $t('stakingType.' + scope.row.fixedType) }}
          </span>
          <span v-else>{{ $t('stakingType.' + scope.row.fixedType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        width="180"
        :label="$t('staking.staking21')"
        align="center">
        <template v-slot="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100" :label="$t('staking.staking31')">
        <template v-slot="scope">
          <span>{{ scope.row.interest }}%</span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="130"
        :label="$t('staking.staking22')"
        align="center">
        <template v-slot="scope">
          <div
            v-if="scope.row.status !== 1"
            class="flex items-center justify-center gap-2 text-primary">
            <span
              class="cursor-pointer"
              v-if="checkShow(scope.row)"
              @click="handleChange(scope.row)">
              {{ $t('staking.staking23') }}
            </span>
            <div v-if="checkShow(scope.row)" class="h-2 w-px bg-label"></div>
            <span class="cursor-pointer" @click="handleQuit(scope.row)">
              {{ $t('staking.staking24') }}
            </span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="block xl:hidden" v-if="staking">
      <div
        class="flex items-center border-b border-line py-1.5"
        v-for="item in tableData"
        :key="item.txHash">
        <Checkbox
          label-class="flex mr-3"
          :disabled="item.fixedType !== 'NONE'"
          v-model="item.checked"
          @change="chooseItem" />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ item.symbol }}</span>

            <div class="flex items-center gap-1.5 text-primary">
              <span class="cursor-pointer" @click="toUrl(item.txHash)">
                {{ $t('staking.staking46') }}
              </span>
              <div class="h-2 w-px bg-label"></div>
              <span
                class="cursor-pointer"
                v-if="checkShow(item)"
                @click="handleChange(item)">
                {{ $t('staking.staking23') }}
              </span>
              <div v-if="checkShow(item)" class="h-2 w-px bg-label"></div>
              <span class="cursor-pointer" @click="handleQuit(item)">
                {{ $t('staking.staking24') }}
              </span>
            </div>
          </div>
          <div class="flex">
            <div class="w-1/5">
              <p class="my-0.5 text-label">{{ $t('staking.staking17') }}</p>
              {{ $t('stakingType.' + item.fixedType) }}
            </div>
            <div class="center w-1/5">
              <p class="my-0.5 text-label">{{ $t('staking.staking16') }}</p>
              {{ item.amount }}
            </div>
            <div class="right w-3/5 text-right">
              <p class="my-0.5 text-label">{{ $t('staking.staking21') }}</p>
              {{ item.endTime }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal
      container-class="w-[380px]"
      :title="dialogTitle"
      v-model="dialogShow"
      :show-close="false"
      @closed="selectedRow = null">
      <div v-if="!selectedRow">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-label">{{ $t('staking.staking39') }}</span>
          <span>
            {{ tableData.filter(v => v.checked).length
            }}{{ $t('staking.staking53') }}
          </span>
        </div>
        <div class="mb-4 flex justify-between">
          <span class="text-label">{{ $t('staking.staking40') }}</span>
          <span class="text-right">
            <span v-for="item in selectedItem" :key="item.symbol">
              {{ item.amount + ' ' + item.symbol }}
              <br />
            </span>
          </span>
        </div>
        <div class="mb-4" v-if="batchType === 2">
          <div class="mb-2.5 text-label">{{ $t('staking.staking17') }}</div>
          <Select v-model="deadLine" :options="deadLineList"></Select>
        </div>
        <div v-if="batchType === 3" class="text-tip">
          <i-custom-tip class="mr-1" />
          {{ $t('staking.staking42') }}
        </div>
      </div>
      <div v-else>
        <div class="mb-4 flex items-center justify-between">
          <span class="text-label">{{ $t('staking.staking39') }}</span>
          1{{ $t('staking.staking53') }}
        </div>
        <div class="mb-4 flex justify-between">
          <span class="text-label">{{ $t('staking.staking40') }}</span>
          {{ selectedRow?.amount + selectedRow?.symbol }}
        </div>
        <div class="mb-4">
          <div class="mb-2.5 text-label">
            {{ $t('staking.staking17') + ': ' }}
          </div>
          <Select v-model="deadLine" :options="deadLineList"></Select>
        </div>
      </div>
      <div class="w-full flex gap-4 pt-6">
        <Button class="flex-1" variant="outline" @click="dialogShow = false">
          {{ $t('public.public8') }}
        </Button>
        <Button class="flex-1" @click="batchEmit">
          {{ $t('public.public9') }}
        </Button>
      </div>
    </Modal>
    <Modal
      container-class="w-[380px]"
      body-class="pt-4 sm:pt-6"
      title=""
      v-model="confirmQuit"
      :show-title="false"
      :show-close="false"
      @closed="quitItem=null">
      <div>
        <div class="text-center text-lg mb-4">Tips</div>
        <div class="flex items-center gap-2">
          <i-custom-tip />
          <span>
            {{ t('staking.staking48') }}
          </span>
        </div>
        <div class="flex gap-4 pt-10">
        <Button class="flex-1" variant="outline" @click="confirmQuit = false">
          {{ $t('public.public8') }}
        </Button>
        <Button class="flex-1" @click="emitQuit">
          {{ $t('public.public9') }}
        </Button>
      </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import useToast from '@/hooks/useToast'
import Checkbox from '@/components/Base/Checkbox/index.vue'
import Select from '@/components/Base/Select/index.vue'
import Button from '@/components/Base/Button/index.vue'
import Modal from '@/components/Base/Modal/index.vue'
import AssetInfo from './AssetInfo.vue'
import { fixNumber, Plus, superLong, toThousands } from '@/utils/util'
import config from '@/config'
import { BatchHandle, CanStakingListItem, StakingListItem } from './types'

const props = defineProps<{
  data: StakingListItem[]
  staking: boolean
  canStakingList: CanStakingListItem[]
}>()

const emit = defineEmits(['batchHandle', 'quitStaking'])

const { t } = useI18n()
const { toast } = useToast()

const tableData = ref<StakingListItem[]>([])
const selectAll = ref(false) // 全选
const batchType = ref<BatchHandle>(BatchHandle.QUIT) // 1 批量退出 2 转定期 3 合并
const dialogShow = ref(false)
const deadLine = ref(1) // 转定期期限
const selectedRow = ref<StakingListItem>() // 单条选中的转定期项
const confirmQuit = ref(false)
const quitItem = ref<StakingListItem | null>(null)

let symbolCount = 0
watch(
  () => props.data,
  val => {
    selectAll.value = false
    let count = 0
    val.map(v => {
      v.checked = false
      if (v.fixedType === 'NONE') {
        count++
      }
    })
    symbolCount = count
    tableData.value = [...val]
  },
  {
    immediate: true
  }
)

const dialogTitle = computed(() => {
  return batchType.value === 1
    ? t('staking.staking36')
    : batchType.value === 2
      ? t('staking.staking23')
      : t('staking.staking38')
})

const choosedItems = computed(() => {
  return tableData.value.filter(v => v.checked)
})

// selected items with merge amount by symbol
const selectedItem = computed(() => {
  const selectItems: { amount: string; symbol: string }[] = []
  tableData.value.map(v => {
    const item = { amount: '0', symbol: '' }
    if (v.checked) {
      const exist = selectItems.filter(item => item.symbol === v.symbol)
      if (exist.length) {
        selectItems.map(s => {
          if (s.symbol === v.symbol) {
            s.amount = Plus(s.amount, v.amount).toFixed()
          }
        })
      } else {
        item.amount = v.amount
        item.symbol = v.symbol
        selectItems.push(item)
      }
    }
  })
  return selectItems
})

const deadLineList = computed(() => {
  return [
    { label: t('staking.staking6'), value: 1 },
    { label: t('staking.staking7'), value: 2 },
    { label: t('staking.staking8'), value: 3 },
    { label: t('staking.staking9'), value: 4 },
    { label: t('staking.staking10'), value: 5 },
    { label: t('staking.staking11'), value: 6 },
    { label: t('staking.staking12'), value: 7 }
  ]
})

function chooseAll() {
  const newData = [...tableData.value]
  newData.map(v => {
    v.checked = selectAll.value && v.fixedType === 'NONE'
  })
  tableData.value = newData
}

function chooseItem() {
  selectAll.value = symbolCount === choosedItems.value.length
  tableData.value = [...tableData.value]
}

function batchHandle(type: BatchHandle) {
  if (choosedItems.value.length < 2) {
    toast.warning(t('staking.staking41'))
    return
  }
  //稳定币不能转定期
  if (type === BatchHandle.CHANGE) {
    const notStable = checkShow(choosedItems.value[0])
    if (!notStable) {
      toast.warning(t('staking.staking47'))
      return
    }
  }
  batchType.value = type
  dialogShow.value = true
}

// 是否能批量转定期
const canBatchChange = computed(() => {
  if (!choosedItems.value.length) return true
  const notStable = checkShow(choosedItems.value[0])
  // console.log(notStable, 123465789)
  return notStable
})

function batchEmit() {
  const selectedItem = selectedRow.value
    ? [selectedRow.value]
    : choosedItems.value
  dialogShow.value = false
  // console.log(selectedItem, 123456)
  const params = {
    type: batchType.value,
    items: selectedItem,
    deadLine: batchType.value === BatchHandle.CHANGE ? deadLine.value : null
  }
  emit('batchHandle', params)
}

//转定期
function handleChange(e: StakingListItem) {
  selectedRow.value = e
  batchType.value = 2
  dialogShow.value = true
}

//退出
function handleQuit(e: StakingListItem) {
  if (e.fixedType === 'NONE' && e.symbol === 'NVT') {
    confirmQuit.value = true
    quitItem.value = e
  } else {
    emit('quitStaking', e)
  }
}

const emitQuit = () => {
  confirmQuit.value = false
  emit('quitStaking', quitItem.value)
}

function toUrl(hash: string) {
  window.open(config.explorerUrl + '/transaction/info?hash=' + hash)
}
//稳定币不显示转定期按钮
function checkShow(item: StakingListItem) {
  // return true
  const symbol = props.canStakingList.filter(
    v => v.assetChainId === item.assetChainId && v.assetId === item.assetId
  )[0]
  if (symbol) return symbol.canBePeriodically
  return false
}
</script>

<template>
  <div class="mint-list" v-loading="loading">
    <Table
      title=""
      :data="list"
      :total="total"
      :columns="columns"
      @pageChange="pageChange"
    >
      <template #name="scope">
        <el-tooltip
          placement="top"
          v-if="scope.row.mintAssetSourceContract"
          popper-class="mint-popper"
        >
          <template #content>
            <div>
              <span>
                {{ $t('assets.assets10') }}
                {{ scope.row.mintAssetSourceContract }}
              </span>
            </div>
          </template>
          <SymbolInfo
            :name="scope.row.mintAssetSymbol"
            :chain="scope.row.registerChain"
            :asset-key="scope.row.mintAsset"
          ></SymbolInfo>
        </el-tooltip>
        <SymbolInfo
          v-else
          :name="scope.row.mintAssetSymbol"
          :chain="scope.row.registerChain"
          :asset-key="scope.row.mintAsset"
        ></SymbolInfo>
      </template>
      <template #amountHeader>
        <Tip label="SMA/HT" :tip="$t('mint.mint38')" white />
      </template>
      <template #amount="scope">
        {{ $thousands(scope.row.mintEach) }}/{{ $thousands(scope.row.mintMax) }}
      </template>
      <template #mintFee="scope">
        {{ $thousands(scope.row.mintFee) }} {{ scope.row.mintFeeAssetSymbol }}
      </template>
      <template #LP="scope">
        {{ scope.row.poolRatio }}%｜{{ scope.row.lpLockDay }}
        {{ $t('mint.mint56') }}
      </template>
      <template #progress="scope">
        <div class="progress-item">
          <p>{{ scope.row.progress }}%</p>
          <div class="progress-wrap">
            <div
              class="progress-bar"
              :style="{ width: scope.row.progress + 'px' }"
            ></div>
          </div>
        </div>
      </template>
      <template #opt="scope">
        <MintHandle :item="scope.row" @mint="mint" />
      </template>
    </Table>
  </div>
  <ConfirmModal
    v-model:show="showConfirmModal"
    :id="pid"
    :targetAddress="targetAddress"
    @refresh="emit('refresh')"
  />
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Table from '@/components/Table/index.vue';
import SymbolInfo from '@/components/SymbolInfo.vue';
import MintHandle from './MintHandle.vue';
import ConfirmModal from './ConfirmModal.vue';
import Tip from '../mintDeploy/Tip.vue';
import { IMintItem } from '@/service/api/types/mint';

const props = defineProps<{
  loading: boolean;
  list: IMintItem[];
  total: number;
  targetAddress: string;
}>();

const emit = defineEmits(['onChange', 'refresh']);

const { t } = useI18n();
const columns = computed(() => {
  return [
    { width: 10 },
    {
      label: t('mint.mint37'),
      slotName: 'name',
      width: 170
    },
    {
      label: t('mint.mint38'),
      width: 120,
      slotName: 'amount',
      headerSlot: 'amountHeader'
    },
    {
      prop: 'startTime',
      label: t('mint.mint39'),
      width: 160
    },
    {
      prop: 'assetUnlockTime',
      label: t('mint.mint40'),
      width: 160
    },
    { label: t('mint.mint41'), width: 130, slotName: 'mintFee' },
    {
      label: t('mint.mint42'),
      width: 130,
      slotName: 'LP'
    },
    {
      label: t('mint.mint43'),
      width: 124,
      slotName: 'progress'
    },
    {
      label: t('mint.mint44'),
      'min-width': 150,
      slotName: 'opt'
    }
  ];
});

const pid = ref(0);

const pageChange = () => {
  emit('onChange');
};

const mint = (id: number) => {
  pid.value = id;
  showConfirmModal.value = true;
};

const showConfirmModal = ref(false);
</script>
<style lang="scss" scoped>
@import '../../assets/css/style.scss';
.mint-list {
  .progress-item {
    p {
      text-align: center;
      font-size: 12px;
      line-height: 16px;
    }
  }
  .progress-wrap {
    width: 100px;
    height: 4px;
    border-radius: 2px;
    background-color: #eef2fc;
    .progress-bar {
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(to right, #37e4cc, #4d62e4);
    }
  }
}
:deep(.mint-popper) {
  background-color: red !important;
}
</style>

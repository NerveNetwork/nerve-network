<template>
  <div class="multi-routing card-wrapper">
    <Table
      :loading="loading"
      :title="$t('info.info32')"
      :data="pairs"
      :total="total"
      :columns="columns"
      @rowClick="rowClick"
      @pageChange="pageChange"
    >
      <template #name="scope">
        <div class="flex items-center">
          <SymbolIcon class="mr-1.5 md:mr-3" :icon="scope.row.logo" />
          {{ scope.row.name }}
        </div>
      </template>
      <template #tx_24="scope">${{ $format(scope.row.tx_24) }}</template>
      <template #tx_7d="scope">${{ $format(scope.row.tx_7d) }}</template>
      <template #liq="scope">{{ $format(scope.row.liq) }}</template>
      <template #liqTvl="scope">${{ $format(scope.row.liqTvl) }}</template>
      <template #supportChain="scope">
        <div class="flex gap-2 flex-wrap">
          <template v-for="item in scope.row.supportChain" :key="item">
            <SymbolIcon class="!w-6 !h-6" :icon="item" />
          </template>
        </div>
      </template>
    </Table>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Table from '@/components/Table/index.vue';
import { MultiRoutingItem } from '@/views/info/types';
import { getMultiPairs } from '@/service/api';
import { divisionAndFix } from '@/utils/util';
import { _networkInfo, getChainNameById } from '@/utils/heterogeneousChainConfig';

const { t } = useI18n();
const router = useRouter();

const columns = computed(() => {
  return [
    {
      prop: 'name',
      label: t('info.info36'),
      slotName: 'name',
      width: 210
    },
    { prop: 'lpTokenSymbol', label: t('info.info37'), width: 180 },
    { prop: 'tx_24', label: t('info.info11'), width: 140, slotName: 'tx_24' },
    { prop: 'tx_7d', label: t('info.info12'), width: 140, slotName: 'tx_7d' },
    { prop: 'liq', label: t('info.info4'), width: 140, slotName: 'liq' },
    {
      prop: 'liqTvl',
      label: t('info.info45'),
      width: 140,
      slotName: 'liqTvl'
    },
    {
      prop: 'supportChain',
      label: t('info.info38'),
      'min-width': 180,
      slotName: 'supportChain'
    }
  ];
});

onMounted(() => {
  getList();
});

const loading = ref(true)
const pairs = ref<MultiRoutingItem[]>([]);
const total = ref(0);
async function getList(pageIndex = 1) {
  const data = { pageIndex };
  const res = await getMultiPairs(data);
  if (res) {
    const list: MultiRoutingItem[] = [];
    res.list.map(v => {
      list.push({
        address: v.pairAddress,
        name: v.name,
        logo: v.logo || v.name,
        lpTokenSymbol: v.lpTokenSymbol,
        assetKey: v.lpTokenChainId + '-' + v.lpTokenAssetId,
        price: v.price,
        tx_24: divisionAndFix(v.amountUsdtValue24H, 18, 2),
        tx_7d: divisionAndFix(v.amountUsdtValue7D, 18, 2),
        liq: v.reserve,
        liqTvl: divisionAndFix(v.reserveUsdtValue, 18, 2),
        supportChain: v.tokenList.map(v =>
          getChainNameById(v.sourceChainId, v.assetChainId)
        )
      });
    });
    loading.value = false
    pairs.value = list;
    total.value = res.total;
  }
}

function rowClick(item: MultiRoutingItem) {
  router.push('/info/multi-routing/' + item.address);
}
function pageChange(index: number) {
  // console.log(index);
  getList(index);
}
</script>

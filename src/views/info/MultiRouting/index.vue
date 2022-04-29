<template>
  <div class="multi-routing">
    <Table
      :title="$t('info.info32')"
      :data="list"
      :total="total"
      :columns="columns"
      @rowClick="rowClick"
      @pageChange="pageChange"
    >
      <template #name="scope">
        <div class="asset-wrap flex-center">
          <SymbolIcon :icon="scope.row.name" />
          {{ scope.row.name }}
        </div>
      </template>
      <template #tx_24="scope">${{ $format(scope.row.tx_24) }}</template>
      <template #tx_7d="scope">${{ $format(scope.row.tx_7d) }}</template>
      <template #liq="scope">${{ $format(scope.row.liq) }}</template>
      <template #supportChain="scope">
        <div class="chain-list">
          <template v-for="item in scope.row.supportChain" :key="item">
            <SymbolIcon :icon="item" />
          </template>
        </div>
      </template>
    </Table>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Table from '@/components/Table/index.vue';
import { MultiRoutingItem } from '@/views/info/types';

const { t } = useI18n();
const router = useRouter();

const columns = computed(() => {
  return [
    { width: 40 },
    {
      prop: 'name',
      label: t('info.info36'),
      slotName: 'name',
      'width': 140
    },
    { prop: 'proof', label: t('info.info37'), width: 180 },
    { prop: 'tx_24', label: t('info.info11'), width: 180, slotName: 'tx_24' },
    { prop: 'tx_7d', label: t('info.info12'), width: 180, slotName: 'tx_7d' },
    { prop: 'liq', label: t('info.info4'), width: 180, slotName: 'liq' },
    { prop: 'supportChain', label: t('info.info38'), 'min-width': 180, slotName: 'supportChain' },
  ];
});

const list = ref<MultiRoutingItem[]>([
  { name: 'NVT', proof: 'USDTN', tx_24: '3435789', tx_7d: '35789', liq: '33789', supportChain: ['ETH', 'BNB', 'OKT'] },
  { name: 'BNB', proof: 'NFIL', tx_24: '35789', tx_7d: '3435789', liq: '337343578989', supportChain: ['BNB', 'OKT'] },
  { name: 'NVT', proof: 'USDTN', tx_24: '3435789', tx_7d: '35789', liq: '3435789', supportChain: ['ETH',  'OKT'] },
  { name: 'BNB', proof: 'NFIL', tx_24: '35789', tx_7d: '3435789', liq: '33789', supportChain: ['ETH', 'BNB'] },
  { name: 'NVT', proof: 'USDTN', tx_24: '3435789', tx_7d: '35789', liq: '3435789', supportChain: [ 'OKT'] },
  { name: 'BNB', proof: 'NFIL', tx_24: '35789', tx_7d: '3435789', liq: '33789', supportChain: ['ETH', 'BNB', 'OKT'] },
]);
const total = ref(14);

function rowClick(item: MultiRoutingItem) {
  // console.log(item);
  // emit('rowClick', item);
  // router.push('/info/multi-routing/' + item.name);
  router.push('/info/multi-routing/' + '5-1');
}
function pageChange(index: number) {
  // console.log(index);
  // emit('pageChange', index);
}
</script>

<style lang="scss">
.multi-routing {
  .asset-wrap img {
    width: 28px;
    height: 28px;
    margin-right: 10px;
  }
  .chain-list {
    display: flex;
    img {
      width: 28px;
      height: 28px;
      margin-right: 10px;
    }
  }
  tr.el-table__row {
    cursor: pointer;
  }
}
</style>

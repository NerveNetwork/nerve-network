<template>
  <div class="funds-table">
    <Table v-bind="props" :columns="columns" @pageChange="pageChange">
      <template #name="scope">
        <div class="symbol-wrap flex-center">
          <SymbolIcon :icon="scope.row.name" />
        </div>
      </template>
      <template #contract="scope">
        <span class="link">{{ superLong(scope.row.contract) }}</span>
      </template>
      <template #liq="scope">${{ $format(scope.row.liq) }}</template>
      <template #rate="scope">
        <el-progress :percentage="scope.row.rate" color="#2688F7" stroke-width="8" />
      </template>
    </Table>
  </div>
</template>

<script lang="ts" setup>
import { computed, withDefaults } from 'vue';
import Table from '@/components/Table/index.vue';
import SymbolIcon from '@/components/SymbolIcon.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { superLong } from '@/utils/util';
import { PoolItem } from '../types';

const props = withDefaults(
  defineProps<{
    title: string;
    data: PoolItem[];
    total: number | string;
    pageIndex?: number;
    pagination?: boolean;
    pageSize?: number | string;
  }>(),
  {
    pagination: true
  }
);
const emit = defineEmits(['pageChange']);

const { t } = useI18n();
const router = useRouter();

const columns = computed(() => {
  return [
    { width: 30 },
    {
      prop: 'name',
      label: t('info.info44'),
      slotName: 'name',
      width: 180
    },
    { prop: 'contract', label: t('info.info40'), 'min-width': 160, slotName: 'contract' },
    { prop: 'assetKey', label: t('info.info41'), width: 180, slotName: 'assetKey' },
    { prop: 'liq', label: t('info.info4'), width: 180, slotName: 'liq' },
    { prop: 'rate', label: t('info.info42'), 'min-width': 140, slotName: 'rate' },
    { width: 30 },
  ];
});
function rowClick(item: PoolItem) {
  // console.log(item);
  // emit('rowClick', item);
  router.push('/info/pools/' + item.address);
}
function pageChange(index: number) {
  // console.log(index);
  emit('pageChange', index);
}
</script>

<style lang="scss">
.funds-table {
  .symbol-wrap {
    img {
      width: 30px;
      height: 30px;
      background-color: #fff;
    }
  }
}
</style>

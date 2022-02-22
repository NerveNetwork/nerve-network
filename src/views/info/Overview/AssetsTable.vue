<template>
  <div class="assets-table">
    <Table v-bind="props" :columns="columns">
      <template #symbol="scope">
        {{ scope.row.symbol }}
      </template>
      <template #price="scope">$ {{ scope.row.price }}</template>
      <template #priceChange="scope">
        <span :class="scope.row.priceChange > 0 ? 'price-up' : 'price-down'">
          {{ scope.row.priceChange }}
        </span>
      </template>
      <template #txs="scope">{{ scope.row.txs }} M</template>
      <template #liq="scope">{{ scope.row.liq }} M</template>
    </Table>
  </div>
</template>

<script lang="ts" setup>
import { computed, withDefaults } from 'vue';
import Table from '@/components/Table/index.vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    title: string;
    data: any[];
    total: number | string;
    pagination?: boolean;
    pageSize?: number | string;
  }>(),
  {
    pagination: true
  }
);

const { t } = useI18n();

const columns = computed(() => {
  return [
    { width: 60 },
    { prop: 'symbol', label: t('info.info8'), slotName: 'symbol' },
    { prop: 'price', label: t('info.info9'), width: 180, slotName: 'price' },
    {
      prop: 'priceChange',
      label: t('info.info10'),
      width: 180,
      slotName: 'priceChange'
    },
    { prop: 'txs', label: t('info.info11'), width: 180, slotName: 'txs' },
    { prop: 'liq', label: t('info.info4'), width: 180, slotName: 'liq' }
  ];
});
</script>

<style lang="scss">
.assets-table {
  .price-up {
    color: #47cd85;
  }

  .price-down {
    color: #e24a58;
  }
}
</style>

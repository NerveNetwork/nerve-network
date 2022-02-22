<template>
  <div class="pools-table">
    <Table v-bind="props" :columns="columns">
      <template #name="scope">
        {{ scope.row.name }}
      </template>
      <template #tx_24="scope">$ {{ scope.row.tx_24 }} M</template>
      <template #tx_7d="scope">$ {{ scope.row.tx_7d }} B</template>
      <template #lp_24="scope">$ {{ scope.row.lp_24 }} K</template>
      <template #apr="scope">{{ scope.row.apr }}%</template>
      <template #liq="scope">$ {{ scope.row.liq }} M</template>
    </Table>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, withDefaults } from 'vue';
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
    { prop: 'name', label: t('info.info2'), slotName: 'name' },
    { prop: 'tx_24', label: t('info.info11'), width: 180, slotName: 'tx_24' },
    { prop: 'tx_7d', label: t('info.info12'), width: 180, slotName: 'tx_7d' },
    { prop: 'lp_24', label: t('info.info13'), width: 180, slotName: 'lp_24' },
    { prop: 'apr', label: t('info.info14'), width: 180, slotName: 'apr' },
    { prop: 'liq', label: t('info.info4'), width: 180, slotName: 'liq' }
  ];
});
</script>

<style lang="scss">
.assets-table {
  //
}
</style>

<template>
  <Table :columns="columns" :data="props.data">
    <template #handle="scope">
      <span>{{ scope.row.handle }}</span>
    </template>
    <template #price="scope">
      <span>{{ scope.row.price }}</span>
    </template>
    <template #amount1="scope">
      <span>{{ scope.row.amount1 }}</span>
    </template>
    <template #amount2="scope">
      <span>{{ scope.row.amount2 }}</span>
    </template>
    <template #account="scope">
      <span>{{ scope.row.account }}</span>
    </template>
    <template #time="scope">
      <span>{{ scope.row.time }}</span>
    </template>
  </Table>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Table from '@/components/Table/index.vue';

const props = defineProps<{
  data: any[];
}>();

const { t } = useI18n();

const columns = computed(() => {
  return [
    { width: 60 },
    { prop: '', label: t('info.info24'), slotName: 'handle' },
    { prop: 'price', label: t('info.info9'), width: 180, slotName: 'price' },
    {
      prop: 'amount1',
      label: t('info.info10'),
      width: 180,
      slotName: 'amount1'
    },
    { prop: 'amount2', label: t('info.info11'), width: 180, slotName: 'amount2' },
    { prop: 'account', label: t('info.info4'), width: 180, slotName: 'account' },
    { prop: 'time', label: t('info.info4'), width: 180, slotName: 'time' }
  ]
})
</script>

<style></style>

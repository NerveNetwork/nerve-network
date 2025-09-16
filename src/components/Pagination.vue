<template>
  <div class="pagination-bar" v-if="newPager.total > newPager.size">
    <el-pagination
      layout="total, prev, pager, next"
      :pager-count="5"
      :current-page="newPager.index"
      :total="newPager.total"
      :page-size="newPager.size"
      @current-change="pageChange"
    ></el-pagination>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Pager } from '@/views/swap/types';

const props = withDefaults(defineProps<{
  pager: Pager
}>(), {
  pager: () => ({} as Pager)
})

const emit = defineEmits<{
  (e: 'update:pager', pager: Pager): void
  (e: 'change', index: number): void
}>()

const newPager = computed<Pager>({
  get() {
    return props.pager;
  },
  set(val) {
    emit('update:pager', val);
  }
});
function pageChange(index: number) {
  newPager.value.index = index;
  emit('change', index);
}
</script>

<style scoped>
.pagination-bar {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

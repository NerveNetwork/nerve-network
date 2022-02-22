<template>
  <div class="chart-tab">
    <div class="tabs flex">
      <template v-for="item in props.tabs" :key="item.label">
        <div
          class="tab-item"
          :class="item.key === props.modelValue ? 'active' : ''"
          @click="emit('update:modelValue', item.key)"
        >
          {{ item.label }}
        </div>
      </template>
    </div>
    <div class="tab-content">
      <template v-for="item in props.tabs" :key="item.label">
        <Chart
          :type="item.type"
          v-if="props.modelValue === item.key"
        ></Chart>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import Chart from '../Overview/Chart.vue';

interface TabItem {
  label: string;
  type: string;
  data?: any[];
  key: string;
}

const props = defineProps<{
  modelValue: string;
  tabs: TabItem[];
}>();

const emit = defineEmits(['update:modelValue']);

/*const activeChart = computed(() => {
  return props.tabs.find(v => v.key === props.modelValue);
});
const name = ref('hi');*/
</script>

<style lang="scss">
.chart-tab {
  .tabs {
    height: 68px;
    line-height: 68px;
    color: #94A6CE;
    background-color: #F3F6FD;
    font-size: 18px;
    border-radius: 20px 20px 0 0;
  }
  .tab-item {
    flex: 1;
    text-align: center;
    cursor: pointer;
    &.active {
      background-color: #fff;
      border-radius: 20px 20px 0 0;
      color: #475472;
    }
  }
  .tab-content {
    height: 385px;
    padding: 15px 30px 30px;
    background-color: #fff;
    border-radius: 0 0 20px 20px;
  }
}
</style>

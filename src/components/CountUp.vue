<template>
  <span ref="countUpDom"></span>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { CountUp, CountUpOptions } from 'countup.js';

const props = withDefaults(
  defineProps<{
    endVal: string;
    options?: CountUpOptions;
  }>(),
  {
    endVal: '0'
  }
);

watch(
  () => props.endVal,
  val => {
    if (val) {
      update(val);
    }
  }
);

const countUpDom = ref<HTMLElement>();

let countUpInstance: CountUp;
onMounted(() => {
  if (!countUpDom.value) return
  countUpInstance = new CountUp(countUpDom.value, +props.endVal, props.options);
  if (props.endVal) {
    update(props.endVal);
  }
});

function update(newEndVal: string | number) {
  return countUpInstance.update(newEndVal);
}
</script>

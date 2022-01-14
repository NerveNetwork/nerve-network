<template>
  <div class="farm-item-symbol">
    <div class="mult-img-wrap" v-if="symbols.length > 1">
      <symbol-icon :icon="symbols[0]"></symbol-icon>
      <symbol-icon :icon="symbols[1]"></symbol-icon>
    </div>
    <div class="img-wrap" v-else>
      <symbol-icon :icon="symbols[0]"></symbol-icon>
    </div>
    <div class="name">{{ name }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import SymbolIcon from '@/components/SymbolIcon.vue';

const props = defineProps({
  name: String
});
const symbols = computed(() => props.name?.split('-') || []);
</script>

<style lang="scss">
.farm-item-symbol {
  width: 265px;
  height: 100%;
  padding: 16px 0;
  display: flex;
  align-items: center;
  .mult-img-wrap,
  .img-wrap {
    width: 65px;
    height: 100%;
    margin-right: 10px;
    flex-shrink: 0;
    img {
      width: 40px;
      height: 40px;
    }
  }
  .mult-img-wrap {
    position: relative;
    img {
      position: absolute;
      &:first-child {
        bottom: 0;
        left: 0;
        z-index: 2;
      }
      &:last-child {
        top: 0;
        right: 0;
      }
    }
  }
  .img-wrap {
    display: flex;
    align-items: center;
  }
  .name {
    font-size: 20px;
    //font-weight: bold;
  }
}
</style>

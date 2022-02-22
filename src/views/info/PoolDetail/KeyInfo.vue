<template>
  <div class="key-info flex-between">
    <div class="left flex-center">
      <div class="symbol-wrap flex-center">
        <div><img src="" alt="" /></div>
        <div><img src="" alt="" /></div>
      </div>
      <div class="symbol-info">
        <p class="name">{{ props.name }}</p>
        <p class="key">ID: {{ props.assetKey }}</p>
      </div>
    </div>
    <div class="collect" @click="isCollected = !isCollected">
      <img :src="isCollected ? collected : collect" alt="" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import collect from '@/assets/img/star.svg';
import collected from '@/assets/img/star-fill.svg';

const props = defineProps<{
  name: string;
  assetKey: string;
}>();

const isCollected = ref(false);
</script>

<style lang="scss">
.key-info {
  .symbol-wrap {
    margin-right: 10px;
    div {
      width: 42px;
      height: 42px;
      background-color: red;
      border-radius: 50%;
      overflow: hidden;
    }
  }
  .symbol-info {
    .name {
      font-size: 20px;
    }
    .key {
      color: #94A6CE;
      font-size: 14px;
    }
  }
  .collect {
    cursor: pointer;
  }
}
</style>

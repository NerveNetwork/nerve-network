<template>
  <div class="w1200">
    <!-- <div class="trading-tabs">
      <div class="wrap">
        <span
          v-for="item in tabs"
          :key="item.value"
          class="click fw"
          :class="{ active: item.value === activeTab }"
          @click="activeTab = item.value"
        >
          {{ item.label }}
        </span>
      </div>
    </div> -->
    <SwapPage v-show="activeTab === 'swap'" />
    <!-- <PushPage v-show="activeTab === 'push'" /> -->
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import SwapPage from './Swap/SwapPage.vue';
// import PushPage from './Push/PushPage.vue';

const tabs = [
  { label: 'SWAP', value: 'swap' },
  { label: 'PUSH', value: 'push' }
];
const activeTab = ref('swap');
</script>

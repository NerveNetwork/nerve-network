<template>
  <div class="w1200 trading-page">
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
    <PushPage v-show="activeTab === 'push'" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import SwapPage from './Swap/SwapPage.vue';
import PushPage from './Push/PushPage.vue';

const tabs = [
  { label: 'SWAP', value: 'swap' },
  { label: 'PUSH', value: 'push' }
];
const activeTab = ref('swap');
</script>

<style lang="scss">
.trading-page {
  padding: 0 20px;

  .trading-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 40px;

    .wrap {
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid #e4e9f4;
    }

    span {
      color: #387cf4;
      background: #fff;
      width: 150px;
      height: 46px;
      line-height: 46px;
      text-align: center;
      display: inline-block;
    }

    .active {
      color: #fefefe;
      background: #387cf4;
      border-radius: 24px;
    }
  }

  @media screen and (max-width: 1200px) {
    .trading-tabs {
      margin-bottom: 25px;

      .wrap {
        border-radius: 20px;
      }

      span {
        width: 120px;
        height: 36px;
        line-height: 36px;
        font-size: 14px;
      }
    }
  }
}
</style>

<template>
  <div class="overview-data-info">
    <div class="info-item">
      <p>{{ $t('home.home7') }}</p>
      <p>$ 367,374,375</p>
    </div>
    <div class="info-item">
      <p>TVL</p>
      <p>$ 7,374,375</p>
    </div>
    <div class="info-item">
      <p>{{ $t('home.home8') }}</p>
      <p>3875%</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const name = ref('');
</script>

<style lang="scss">
.overview-data-info {
  display: flex;
  background-color: #fff;
  padding: 50px 0;
  border-radius: 15px;

  .info-item {
    flex: 1;
    text-align: center;
    p {
      color: #a7b1c3;
      line-height: 1;

      &:last-of-type {
        font-size: 24px;
        padding-top: 16px;
        color: #475472;
        font-weight: 600;
      }
    }

    &:nth-child(2) {
      border-left: 1px solid #5d6779;
      border-right: 1px solid #5d6779;
    }
  }
  @media screen and (max-width: 1200px) {
    padding: 15px 10px;
    display: block;
    border: 1px solid #e4e9f4;
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      p {
        &:last-of-type {
          font-size: 18px;
          padding-top: 0;
        }
      }
      &:nth-child(2) {
        border: none;
      }
      &:last-of-type {
        margin: 0;
      }
    }
  }
}
</style>

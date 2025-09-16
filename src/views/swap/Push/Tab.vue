<template>
  <div class="tabs">
    <div
      v-for="(item, index) in tabs"
      :key="item.value"
      :class="['tab-item', item.value === activeTab && 'active']"
      @click="tabChange(item.value)"
    >
      {{ item.label }}
    </div>
    <p class="change" @click="changeMode">
      <img src="../../../assets/img/push-change.png" alt="" />
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (e: 'tabChange', tab: string): void;
  (e: 'modeChange', buyMode: boolean): void;
}>();
const { t } = useI18n();

const buyMode = ref(true);
const tabs = computed(() => {
  if (buyMode.value) {
    return [
      { label: t('trading.trading25'), value: '1' },
      { label: t('trading.trading26'), value: '2' }
    ];
  } else {
    return [
      { label: t('trading.trading26'), value: '1' },
      { label: t('trading.trading25'), value: '2' }
    ];
  }
});
const activeTab = ref('1');

const tabChange = (value: string) => {
  activeTab.value = value;
  emit('tabChange', value);
};

const changeMode = () => {
  buyMode.value = !buyMode.value;
  emit('modeChange', buyMode.value);
};
</script>

<style lang="scss">
@use '../../../assets/css/style';
.tabs {
  position: relative;
  display: flex;
  background: #f8fafd;
  margin-bottom: 30px;
  .tab-item {
    flex: 1;
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-weight: 600;
    color: $subLabelColor;
    background: #f8fafd;
    position: relative;
    cursor: pointer;
    &.active {
      color: #387cf4;
      background: #fff;
      z-index: 1;
    }
    &:first-of-type.active {
      border-radius: 0 30px 0 0;
      box-shadow: 20px 20px 0 0 #fff, -20px 20px 0 0 #fff;
      &::before {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        width: 30px;
        height: 50%;
        background: #fff;
        border-radius: 0 30px 0 0;
        border-right: 1px solid #e4e9f4;
      }
      &::after {
        content: '';
        position: absolute;
        right: -30px;
        bottom: 0;
        width: 30px;
        height: 50%;
        background: #f8fafd;
        border-radius: 0 0 0 30px;
        border-left: 1px solid #e4e9f4;
      }
    }
    &:last-of-type.active {
      border-radius: 30px 0 0 0;
      box-shadow: 20px 20px 0 0 #fff, -20px 20px 0 0 #fff;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 30px;
        height: 50%;
        background: #fff;
        border-radius: 30px 0 0 0;
        border-left: 1px solid #e4e9f4;
      }
      &::after {
        content: '';
        position: absolute;
        left: -30px;
        bottom: 0;
        width: 30px;
        height: 50%;
        background: #f8fafd;
        border-radius: 0 0 30px 0;
        border-right: 1px solid #e4e9f4;
      }
    }
  }
  .change {
    position: absolute;
    z-index: 2;
    cursor: pointer;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 40px;
    }
  }
}
</style>

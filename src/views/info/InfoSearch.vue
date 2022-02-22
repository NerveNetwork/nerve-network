<template>
  <div class="info-search">
    <div class="mask" v-show="showMask" @click.stop="changeShowMask(false)"></div>
    <!--    <el-input :placeholder="$t('info.info6')"></el-input>-->
    <div class="search-content" ref="wrapper">
      <el-input :placeholder="$t('info.info6')" @focus="changeShowMask(true)">
        <template #suffix>
          <el-icon class="el-input__icon"><search /></el-icon>
        </template>
      </el-input>
      <div class="search-result" v-show="showMask">
        <div class="assets">
          <div class="head">
            <div>{{ $t('info.info3') }}</div>
            <div>{{ $t('info.info9') }}</div>
            <div>{{ $t('info.info4') }}</div>
          </div>
          <div class="content">
            <div>2</div>
            <div>2</div>
            <div>2</div>
          </div>
        </div>
        <div class="pools">
          <div class="head">
            <div>{{ $t('info.info2') }}</div>
            <div></div>
            <div>{{ $t('info.info4') }}</div>
          </div>
          <div class="content">
            <div>2</div>
            <div></div>
            <div>2</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import useClickOutside from '@/hooks/useClickOutside';
import useMask from '@/hooks/useMask';

const { showMask, changeShowMask } = useMask();
const wrapper = ref<HTMLElement>();
const { isClickOutside } = useClickOutside(wrapper);

watch(
  () => isClickOutside.value,
  val => {
    if (val) {
      changeShowMask(false);
    }
  }
);
</script>

<style lang="scss">
.info-search {
  //position: relative;
  .mask {
    position: fixed;
    left: 0;
    right: 0;
    top: 80px;
    bottom: 0;
    z-index: 10;
    opacity: 0.46;
    background-color: #212121;
  }
  .search-content {
    position: relative;
    z-index: 20;
    bottom: 12px;
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    .el-input {
      width: 300px;
      .el-input__inner {
        padding-left: 18px;
        border-radius: 20px;
        &::-webkit-input-placeholder {
          color: #bdc4d6;
        }
      }
    }
    .search-result {
      width: 580px;
      padding: 30px;
      margin-top: 20px;
      background: #fff;
      border: 1px solid #e4e9f4;
      border-radius: 20px;
      position: absolute;
      top: 40px;
    }
  }
  .search-result {
    .assets {
      margin-bottom: 35px;
    }
    .assets, .pools {
      .head,
      .content {
        display: grid;
        gap: 1em;
        grid-template-columns: 1.5fr 1.2fr 0.5fr;//repeat(2, 1fr);
      }
      .head {
        font-size: 14px;
        color: #475472;
        margin-bottom: 15px;
      }
      .content {
        color: #475472;
      }
    }
  }
}
</style>

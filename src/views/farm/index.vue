<template>
  <div class="w1200 farm">
    <div class="search">
      <div class="sort">
        <el-select
          v-model="state.sortValue"
          placeholder=""
          popper-class="farm-select"
        >
          <el-option :label="$t('farmRankType.apr')" value="1"></el-option>
          <el-option :label="$t('farmRankType.usd')" value="2"></el-option>
        </el-select>
        <div class="status">
          <span
            :class="{ 'active-status': state.farmStatus === 'pending' }"
            @click="filterListByStatus('pending')"
          >
            {{ $t('farm.farm24') }}
          </span>
          <span
            :class="{ 'active-status': state.farmStatus === 'end' }"
            @click="filterListByStatus('end')"
          >
            {{ $t('farm.farm25') }}
          </span>
        </div>
      </div>
      <div class="mortgage flex-center">
        <div class="create">
          <el-button type="primary" @click="createFarm">
            {{ $t('farm.farm11') }}
          </el-button>
        </div>
        <el-switch
          v-model="state.mortgageValue"
          :active-text="$t('farm.farm1')"
          :width="35"
        ></el-switch>
      </div>
    </div>
    <div class="farm-wrap box_wrapper">
      <farm-item
        :list="nerveList"
        :loading="nerveLoading"
        @handleLoading="handleLoading"
        :isPool="props.isPool"
        isNerve
        :isFinished="state.farmStatus === 'end'"
      ></farm-item>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, reactive } from 'vue';
import FarmItem from './FarmItem.vue';
import useFarmData from './hooks/useData';
import { useRoute, useRouter } from 'vue-router';

import { SearchState } from './types';

const props = defineProps({
  isPool: {
    type: Boolean,
    default: true
  }
});

const route = useRoute();
const router = useRouter();
const nerveLoading = ref(true);
const state = reactive<SearchState>({
  sortValue: '1', // apr -1 liquid -2
  farmStatus: 'pending', // pending | end
  mortgageValue: false
});
const { nerveList, getFarmData, getUserFarm, filterList } = useFarmData();
watch(
  () =>
    [state.sortValue, state.mortgageValue, state.farmStatus] as [
      string,
      boolean,
      string
    ],
  ([type, status, farmStatus]) => {
    // console.log(type, status, 999);
    filterList(type, status, farmStatus);
  }
);
onMounted(async () => {
  const hash = route.params?.hash as string;
  // console.log(hash, 123, route)
  // init();
  await getFarmData(hash);
  getUserFarm(hash);
  nerveLoading.value = false;
});

function handleLoading(status: boolean) {
  nerveLoading.value = status;
}
function filterListByStatus(status: 'pending' | 'end') {
  state.farmStatus = status;
}

function createFarm() {
  router.push({ name: 'createFarm' });
}
</script>

<style lang="scss">
@import '../../assets/css/style.scss';
.tab-bar {
  display: none;
  margin-left: 30px;
  align-items: center;
  font-size: 16px;
  border-bottom: 1px solid #ffffff;
  color: $labelColor;
  span {
    cursor: pointer;
    box-sizing: border-box;
    height: 30px;
    margin-right: 15px;
  }
  .active {
    color: $txColor;
    border-bottom: 2px solid #ffffff;
  }
}
.farm {
  //min-height: 750px;
  //padding: 0 20px;
  .top {
    width: 360px;
    height: 48px;
    margin: 0 auto;
    border-radius: 24px;
    background-color: #2a2a56;
    .tab-item {
      width: 180px;
      height: 48px;
      text-align: center;
      line-height: 48px;
      color: $labelColor;
      font-size: 16px;
      cursor: pointer;
    }
    .isActive {
      background-color: #004884;
      border-radius: 24px;
      margin: 0 0 0 -1px;
      color: #fff;
      //border: 0 solid #5f71f5;
    }
  }
  .search {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    margin: 0 0 20px;
    .sort {
      //width: 170px;
      height: 40px;
      display: flex;
      .el-select {
        width: 170px;
        margin-right: 30px;
      }
      .status {
        border: 1px solid #dcdfe6;
        border-radius: 16px;
        height: 40px;
        span {
          display: inline-block;
          //width: 50%;
          padding: 0 18px;
          line-height: 38px;
          font-size: 14px;
          border-radius: 16px;
          cursor: pointer;
          &.active-status {
            background-color: #409eff;
            color: #fff;
          }
        }
      }
      .el-input__inner {
        //background: #5f71f5;
        //border: none;
        border-radius: 12px;
        //color: #fff;
      }
      ::-webkit-input-placeholder {
        //color: #fff;
      }
      .el-select__caret {
        //color: #fff;
      }
    }
    .el-select {
      input {
        //background: #2a2a56;
      }
    }
    .el-switch {
      .el-switch__label {
        color: $labelColor;
      }
    }
    .create {
      margin-right: 20px;
      .el-button {
        min-height: 32px;
        padding: 7px 15px;
        border-radius: 8px;
      }
    }
  }
  .info {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px 0 80px;
    min-height: 200px;
    position: relative;
    .lis {
      .title {
        height: 90px;
        border-bottom: 1px solid #e4efff;
        display: flex;
        align-items: center;
        padding: 0 40px;
        .symbol {
          min-width: 200px;
          .names {
            font-size: 20px;
            font-weight: bold;
          }
        }
        ul {
          /* width: 1000px; */
          flex: 1;
          li {
            width: 25%;
            text-align: center;
            p {
              font-size: 14px;
              color: #7e87c2;
              line-height: 1;
              margin-bottom: 8px;
            }
            h2 {
              font-size: 18px;
              font-weight: bold;
              line-height: 1;
            }
          }
        }
        .view {
          font-size: 15px;
        }
      }
    }
    .more {
      position: absolute;
      width: 100%;
      text-align: center;
      bottom: 20px;
    }
  }
  @media screen and (max-width: 500px) {
    //padding: 0 16px;
  }
}
.farm-select.el-select__popper.el-popper[role='tooltip'] {
  //background: $btnColor !important;
  //border: 0 !important;
  border-radius: 10px;
  //.el-select-dropdown__item.hover,
  //.el-select-dropdown__item:hover {
  //  background: $btnColor!important;
  //}
  .el-select-dropdown__item {
    //color: $labelColor;
    &:hover,
    &.selected {
      //background: $btnColor !important;
      //opacity: 0.65;
    }
  }
  .el-select-dropdown__item {
    span {
      //color: #fff;
    }
    &:hover {
      //background: $btnColor;
      //opacity: 0.65;
    }
  }
  .el-popper__arrow:before {
    //background: $btnColor;
    //border: 0 !important;
  }
}
@media screen and (max-width: 1200px) {
  .tab-bar {
    display: flex;
    margin-left: 20px;
    margin-top: -30px;
  }
  .farm .top {
    display: none;
    width: 300px;
    .tab-item {
      width: 150px;
    }
  }
  .farm .search {
    flex-wrap: wrap;
    height: auto;
    margin-bottom: 10px;
    .sort {
      .el-select {
        margin-right: 10px;
      }
      .el-input__inner {
        height: 36px;
        line-height: 36px;
        border-radius: 8px;
      }
      .status {
        height: 36px;
        span {
          line-height: 34px;
          padding: 0 10px;
        }
      }
    }
  }
}
@media screen and (max-width: 500px) {
  .tab-bar {
    margin-top: 0;
  }
}
</style>

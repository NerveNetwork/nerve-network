<template>
  <div class="partner">
    <h3>{{ $t('home.home9') }}</h3>
    <!--    <div class="partner-list">-->
    <el-row :gutter="20" class="partner-list">
      <el-col :span="12" :lg="6" v-for="item in partners" :key="item.src">
        <a :href="item.href" target="_blank">
          <img :src="item.src" alt="" />
        </a>
      </el-col>
    </el-row>
    <!--    </div>-->
  </div>
</template>

<script lang="ts" setup>
import NULS from '@/assets/img/partner/nuls.png';
import Nabox from '@/assets/img/partner/nabox.png';
import Binance from '@/assets/img/partner/binance.png';
import OKEXChain from '@/assets/img/partner/okexchain.png';
import SlowMist from '@/assets/img/partner/slowmist.png';
import UniSwap from '@/assets/img/partner/uniswap.png';
import ChainGuard from '@/assets/img/partner/chainsguard.png';
import PancakeSwap from '@/assets/img/partner/pancake.png';
import MDEX from '@/assets/img/partner/mdex.png';

const partners = [
  {
    src: NULS,
    href: 'https://www.nuls.io/'
  },
  {
    src: Nabox,
    href: 'http://nabox.io/'
  },
  {
    src: Binance,
    href: 'https://bscscan.com/'
  },
  {
    src: OKEXChain,
    href: 'https://okex.com/okchain'
  },
  {
    src: SlowMist,
    href: 'https://www.slowmist.com/'
  },
  {
    src: UniSwap,
    href: 'https://app.uniswap.org/#/swap'
  },
  {
    src: ChainGuard,
    href: 'https://www.chainsguard.com/index.html#home'
  },
  {
    src: PancakeSwap,
    href: 'https://pancakeswap.finance/'
  },
  {
    src: MDEX,
    href: 'https://ht.mdex.com/'
  }
];
</script>

<style lang="scss">
.partner {
  margin-bottom: 70px;

  h3 {
    color: #475472;
    font-size: 30px;
    margin: 80px 0 40px;
    text-align: center;
    font-weight: 600;
  }

  .partner-list {
    .el-col {
      margin-bottom: 20px;
    }

    a {
      display: inline-block;
      background-color: #fff;
      //border: 1px solid #e4e9f4;
      border-radius: 20px;
      overflow: hidden;

      img {
        width: 100%;
        //height: 90px;
      }
    }
  }
  @media screen and (max-width: 1200px) {
    margin-bottom: 20px;
    h3 {
      font-size: 24px;
      margin: 50px 0 20px;
    }
    .partner-list {
      .el-col {
        margin-bottom: 10px;
      }
    }
    .el-col-12 {
      padding-left: 6px !important;
      padding-right: 6px !important;
    }
  }
}
</style>

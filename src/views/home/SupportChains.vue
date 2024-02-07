<template>
  <div class="support-chains">
    <h3>{{ $t('home.home15') }}</h3>
    <!--    <div class="partner-list">-->
    <el-row :gutter="20" class="chain-list">
      <el-col :span="12" :lg="6" v-for="item in supportChains" :key="item.src">
        <div class="img-wrap">
          <img :src="item.src" alt="" />
        </div>
        <!--        <a :href="item.href" target="_blank">-->
        <!--          <img :src="item.src" alt="" />-->
        <!--        </a>-->
      </el-col>
    </el-row>
    <!--    </div>-->
  </div>
</template>

<script lang="ts" setup>
import Ethereum from '@/assets/img/supportChains/Ethereum.png';
import BSC from '@/assets/img/supportChains/BSC.png';
import Polygon from '@/assets/img/supportChains/Polygon.png';
import Heco from '@/assets/img/supportChains/Heco.png';
import OKX from '@/assets/img/supportChains/OKX.png';
import Avalanche from '@/assets/img/supportChains/Avalanche.png';
import Harmany from '@/assets/img/supportChains/Harmany.png';
import KCC from '@/assets/img/supportChains/KCC.png';
import Cronos from '@/assets/img/supportChains/Cronos.png';
import Arbitrum from '@/assets/img/supportChains/Arbitrum.png';
import Fantom from '@/assets/img/supportChains/Fantom.png';
import TRON from '@/assets/img/supportChains/TRON.png';
import METIS from '@/assets/img/supportChains/METIS.png';
import IOTX from '@/assets/img/supportChains/IOTX.png';
import Optimism from '@/assets/img/supportChains/Optimism.png';
import Klaytn from '@/assets/img/supportChains/Klaytn.png';
import smartBCH from '@/assets/img/supportChains/smartBCH.png';
import NULS from '@/assets/img/supportChains/NULS.png';
import KAVA from '@/assets/img/supportChains/KAVA.png';
import ETHW from '@/assets/img/supportChains/ETHW.png';
import ENULS from '@/assets/img/supportChains/ENULS.png';
import REI from '@/assets/img/supportChains/REI.jpg';
import zkSync from '@/assets/img/supportChains/zkSync.jpg';
import EOSEVM from '@/assets/img/supportChains/EOSEVM.jpg';
import PolygonEVM from '@/assets/img/supportChains/polygonEVM.jpg';
import Linea from '@/assets/img/supportChains/Linea.jpg';
import CELO from '@/assets/img/supportChains/CELO.png';
import ETC from '@/assets/img/supportChains/ETC.png';
import BASE from '@/assets/img/supportChains/BASE.png';
import Scroll from '@/assets/img/supportChains/Scroll.png';
import Bitgert from '@/assets/img/supportChains/Bitgert.jpg';
import BTC from '@/assets/img/supportChains/btc.png';
import Manta from '@/assets/img/supportChains/manta.png';
import Janus from '@/assets/img/supportChains/janus.png';
import X1 from '@/assets/img/supportChains/x1.png';
import Zeta from '@/assets/img/supportChains/zeta.png';

const supportChains = [
  // { src: BTC },
  { src: Ethereum },
  { src: BSC },
  { src: Polygon },
  { src: OKX },
  { src: Avalanche },
  { src: Harmany },
  { src: KCC },
  { src: Cronos },
  { src: Arbitrum },
  { src: Fantom },
  { src: TRON },
  { src: METIS },
  { src: IOTX },
  { src: Optimism },
  { src: Klaytn },
  { src: smartBCH },
  { src: NULS },
  { src: KAVA },
  { src: ETHW },
  { src: ENULS },
  { src: REI },
  { src: zkSync },
  { src: EOSEVM },
  { src: PolygonEVM },
  { src: Linea },
  { src: CELO },
  { src: ETC },
  { src: BASE },
  { src: Scroll },
  { src: Bitgert },
  /* { src: Manta },
  { src: Janus },
  { src: X1 },
  { src: Zeta },
  { src: Heco } */
];
</script>

<style lang="scss">
.support-chains {
  padding-top: 90px;
  margin-bottom: 50px;

  h3 {
    color: #475472;
    font-size: 30px;
    margin-bottom: 50px;
    text-align: center;
    font-weight: 600;
  }

  .chain-list {
    .el-col {
      margin-bottom: 20px;
    }
    .img-wrap {
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 15px;
    }
    img {
      width: 224px;
    }
  }
  @media screen and (max-width: 1200px) {
    margin-bottom: 20px;
    padding-top: 0;
    h3 {
      font-size: 24px;
      margin: 50px 0 20px;
    }
    .chain-list {
      .el-col {
        margin-bottom: 10px;
        img {
          width: 80%;
        }
      }
    }
    .el-col-12 {
      padding-left: 6px !important;
      padding-right: 6px !important;
    }
  }
}
</style>

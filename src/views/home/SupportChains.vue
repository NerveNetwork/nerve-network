<template>
  <div class="support-chains" ref="chainsRef">
    <h3>{{ $t('home.home15') }}</h3>
    <!--    <div class="partner-list">-->
    <div class="chain-list">
      <div
        class="img-wrap"
        v-for="(item, idx) in supportChains"
        :key="item.src"
      >
        <!-- :ref="el => itemRefs[index] = el" -->
        <img :src="item.src" alt="" />
      </div>
    </div>
    <!-- <el-row :gutter="20" class="chain-list">
      <el-col :span="12" :lg="6" v-for="(item, idx) in supportChains" :key="item.src">
        <div class="img-wrap">
          <img :src="item.src" alt="" />
        </div>
      </el-col>
    </el-row> -->
  </div>
</template>

<script lang="ts" setup>
import BTC from '@/assets/img/supportChains/btc.svg';
import Ethereum from '@/assets/img/supportChains/Ethereum.svg';
import BSC from '@/assets/img/supportChains/BSC.svg';
import OKX from '@/assets/img/supportChains/OKX.svg';
import TRON from '@/assets/img/supportChains/TRON.svg';
import BASE from '@/assets/img/supportChains/BASE.svg';
import Polygon from '@/assets/img/supportChains/Polygon.svg';
import Optimism from '@/assets/img/supportChains/Optimism.svg';
import Avalanche from '@/assets/img/supportChains/Avalanche.svg';
import zkSync from '@/assets/img/supportChains/zkSync.svg';
import Arbitrum from '@/assets/img/supportChains/Arbitrum.svg';
import CELO from '@/assets/img/supportChains/CELO.svg';
import KCC from '@/assets/img/supportChains/KCC.svg';
import METIS from '@/assets/img/supportChains/METIS.svg';
import IOTX from '@/assets/img/supportChains/IOTX.svg';
import KAIA from '@/assets/img/supportChains/KAIA.svg';
import smartBCH from '@/assets/img/supportChains/smartBCH.svg';
import Fantom from '@/assets/img/supportChains/Fantom.svg';
import BCH from '@/assets/img/supportChains/BCH.svg';
import ETC from '@/assets/img/supportChains/ETC.svg';
import Linea from '@/assets/img/supportChains/Linea.svg';
import Scroll from '@/assets/img/supportChains/Scroll.svg';
import X1 from '@/assets/img/supportChains/XLayer.svg';
import NULS from '@/assets/img/supportChains/NULSAI.svg';
import Manta from '@/assets/img/supportChains/manta.svg';
import KAVA from '@/assets/img/supportChains/KAVA.svg';
import PolygonEVM from '@/assets/img/supportChains/polygonEVM.svg';
import EOSEVM from '@/assets/img/supportChains/EOSEVM.svg';
import REI from '@/assets/img/supportChains/REI.svg';
import Harmany from '@/assets/img/supportChains/Harmany.svg';
import Cronos from '@/assets/img/supportChains/Cronos.svg';
import Bitgert from '@/assets/img/supportChains/Bitgert.svg';
import Zeta from '@/assets/img/supportChains/zeta.svg';
import ETHW from '@/assets/img/supportChains/ETHW.svg';
import Mode from '@/assets/img/supportChains/Mode.svg';
import Blast from '@/assets/img/supportChains/Blast.svg';
import Merlin from '@/assets/img/supportChains/Merlin.svg';
import Pulse from '@/assets/img/supportChains/Pulse.svg';
import FCH from '@/assets/img/supportChains/FCH.svg';
import TBC from '@/assets/img/supportChains/TBC.svg';
import ENULS from '@/assets/img/supportChains/ENULS.svg';
import Akashic from '@/assets/img/supportChains/akashic.svg';

/* import Heco from '@/assets/img/supportChains/Heco.png';
import Janus from '@/assets/img/supportChains/janus.png';
import Shardeum from '@/assets/img/supportChains/shardeum.png'; */

import { useObserveAnimate } from '@/hooks/useObserveAnimate';

const supportChains = [
  { src: BTC },
  { src: Ethereum },
  { src: BSC },
  { src: OKX },
  { src: TRON },
  { src: BASE },
  { src: Polygon },
  { src: Optimism },
  { src: Avalanche },
  { src: zkSync },
  { src: Arbitrum },
  { src: CELO },
  { src: KCC },
  { src: METIS },
  { src: IOTX },
  { src: KAIA },
  { src: smartBCH },
  { src: Fantom },
  { src: BCH },
  { src: ETC },
  { src: Linea },
  { src: Scroll },
  { src: X1 },
  { src: NULS },
  { src: Manta },
  { src: KAVA },
  { src: PolygonEVM },
  { src: EOSEVM },
  { src: REI },
  { src: Harmany },
  { src: Cronos },
  { src: Bitgert },
  { src: Zeta },
  { src: ETHW },
  { src: Mode },
  { src: Blast },
  { src: Merlin },
  { src: Pulse },
  { src: FCH },
  { src: TBC },
  { src: ENULS },
  { src: Akashic }
];

const chainsRef = useObserveAnimate();

// 为每一项生成ref和observer，延迟依次递增
// const itemRefs = supportChains.map((_, idx) => useObserveAnimate('animate-in', undefined, idx * 500));
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
    display: grid;
    gap: 24px;
    // grid-column: ;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    .el-col {
      margin-bottom: 20px;
    }
    .img-wrap {
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      // width: 180px;
      height: 78px;
      border-radius: 15px;
    }
    img {
      // width: 100%;
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
      grid-template-columns: repeat(4, minmax(0, 1fr));
      // .el-col {
      //   margin-bottom: 10px;
      //   img {
      //     width: 80%;
      //   }
      // }
    }
    .el-col-12 {
      padding-left: 6px !important;
      padding-right: 6px !important;
    }
  }
  @media screen and (max-width: 768px) {
    .chain-list {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      .img-wrap {
        height: 60px;
      }
    }
  }
  @media screen and (max-width: 520px) {
    .chain-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>

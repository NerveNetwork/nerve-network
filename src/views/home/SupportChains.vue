<template>
  <div class="w1200 py-20" ref="chainsRef">
    <h3 class="text-2xl font-semibold text-center mb-14">{{ $t('home.home15') }}</h3>
    <!--    <div class="partner-list">-->
    <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <div
        class="flex items-center justify-center border border-[#42465A] h-[68px] rounded-[40px]"
        v-for="(item, idx) in supportChains"
        :key="item.src"
      >
        <img :src="item.src" alt="" />
      </div>
    </div>
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

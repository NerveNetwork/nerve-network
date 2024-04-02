import config from '@/config';
const isBeta = config.isBeta;

import NULSLogo from '@/assets/img/chainLogo/NULS.png';
import NERVELogo from '@/assets/img/chainLogo/NERVE.png';
import ETHLogo from '@/assets/img/chainLogo/ETH.png';
import BSCLogo from '@/assets/img/chainLogo/BSC.jpg';
import HecoLogo from '@/assets/img/chainLogo/Heco.png';
import OECLogo from '@/assets/img/chainLogo/OEC.png';
import HarmonyLogo from '@/assets/img/chainLogo/Harmony.png';
import PolygonLogo from '@/assets/img/chainLogo/Polygon.png';
import KCCLogo from '@/assets/img/chainLogo/KCC.png';
import CROLogo from '@/assets/img/chainLogo/Cronos.png';
import AVAVLogo from '@/assets/img/chainLogo/AVAX.png';
import ARBILogo from '@/assets/img/chainLogo/arbitrum.png';
import FTMLogo from '@/assets/img/chainLogo/fantom.png';
import TRONLogo from '@/assets/img/chainLogo/tron.png';
import MetisLogo from '@/assets/img/chainLogo/Metis.png';
import LotexLogo from '@/assets/img/chainLogo/LOTEX.png';
import OptimismLogo from '@/assets/img/chainLogo/optimism.png';
import KlaytnLogo from '@/assets/img/chainLogo/Klaytn.png';
import SmartBCHLogo from '@/assets/img/chainLogo/smartBCH.png';
import ENULSLogo from '@/assets/img/chainLogo/ENULS.png';
import KavaLogo from '@/assets/img/chainLogo/KAVA.png';
import ETHWLogo from '@/assets/img/chainLogo/ETHW.png';
import REILogo from '@/assets/img/chainLogo/REI.png';
import ZKLogo from '@/assets/img/chainLogo/zksync.png';
import EOSEVM from '@/assets/img/chainLogo/EOSEVM.png';
import PolygonZkEVM from '@/assets/img/chainLogo/PolygonzkEVM.png';
import Linea from '@/assets/img/chainLogo/Linea.png';
import CELOLogo from '@/assets/img/chainLogo/CELO.svg';
import ETCLogo from '@/assets/img/chainLogo/ETC.png';
import BASELogo from '@/assets/img/chainLogo/BASE.svg';
import ScrollLogo from '@/assets/img/chainLogo/Scroll.jpg';
import BitgertLogo from '@/assets/img/chainLogo/Bitgert.jpg';
import JanusLogo from '@/assets/img/chainLogo/Janus.jpg';
import MantaLogo from '@/assets/img/chainLogo/Manta.jpg';
import BTCLogo from '@/assets/img/chainLogo/BTC.png';
import ZetaLogo from '@/assets/img/chainLogo/Zeta.png';
import ShardeumLogo from '@/assets/img/chainLogo/shardeum.jpg';
import ModeLogo from '@/assets/img/chainLogo/MODE.jpg';
import BlastLogo from '@/assets/img/chainLogo/Blast.jpg';
import MerlinLogo from '@/assets/img/chainLogo/Merlin.jpg';
import PulseLogo from '@/assets/img/chainLogo/Pulse.jpg';
import FCHLogo from '@/assets/img/chainLogo/FCH.jpg';

// explorer
const Origin = {
  NERVE: isBeta
    ? 'http://beta.scan.nerve.network'
    : 'https://scan.nerve.network',
  NULS: isBeta ? 'http://beta.nulscan.io' : 'https://nulscan.io',
  ETH: isBeta ? 'https://goerli.etherscan.io' : 'https://etherscan.io',
  BSC: isBeta ? 'https://testnet.bscscan.com' : 'https://bscscan.com',
  Polygon: isBeta
    ? 'https://mumbai.polygonscan.com'
    : 'https://polygonscan.com',
  Heco: isBeta ? 'https://testnet.hecoinfo.com' : 'https://hecoinfo.com',
  OKTC: isBeta
    ? 'https://www.oklink.com/okexchain-test'
    : 'https://www.oklink.com/okexchain',
  Avalanche: isBeta ? 'https://testnet.snowtrace.io' : 'https://snowtrace.io',
  Harmony: isBeta
    ? 'https://explorer.pops.one'
    : 'https://explorer.harmony.one',
  KCC: isBeta ? 'https://scan-testnet.kcc.network' : 'https://explorer.kcc.io',
  Cronos: isBeta
    ? 'https://cronos.crypto.org/explorer/testnet3'
    : 'https://cronos.crypto.org/explorer',
  Arbitrum: isBeta ? 'https://testnet.arbiscan.io' : 'https://arbiscan.io',
  Fantom: isBeta ? 'https://testnet.ftmscan.com' : 'https://ftmscan.com',
  TRON: isBeta ? 'https://shasta.tronscan.org/#' : 'https://tronscan.org/#',
  Metis: isBeta
    ? 'https://stardust-explorer.metis.io'
    : 'https://andromeda-explorer.metis.io',
  IoTex: isBeta ? 'https://testnet.iotexscan.io' : 'https://iotexscan.io',
  Optimism: isBeta
    ? 'https://kovan-optimistic.etherscan.io'
    : 'https://optimistic.etherscan.io',
  Klaytn: isBeta
    ? 'https://baobab.scope.klaytn.com'
    : 'https://scope.klaytn.com',
  smartBCH: isBeta ? 'https://smartscan.cash' : 'https://smartscan.cash',
  ENULS: isBeta ? 'https://beta.evmscan.nuls.io' : 'https://evmscan.nuls.io',
  KAVA: isBeta
    ? 'https://explorer.testnet.kava.io'
    : 'https://explorer.kava.io',
  ETHW: 'https://mainnet.ethwscan.com',
  REI: isBeta ? 'https://scan-test.rei.network' : 'https://scan.rei.network',
  zkSync: isBeta
    ? 'https://zksync2-testnet.zkscan.io'
    : 'https://explorer.zksync.io',
  EOSEVM: isBeta
    ? 'https://explorer.testnet.evm.eosnetwork.com'
    : 'https://explorer.evm.eosnetwork.com',
  polygonZkEVM: isBeta
    ? 'https://testnet-zkevm.polygonscan.com'
    : 'https://zkevm.polygonscan.com',
  Linea: isBeta ? 'https://goerli.lineascan.build' : 'https://lineascan.build/',
  Celo: isBeta ? 'https://alfajores.celoscan.io' : 'https://celoscan.io',
  ETC: isBeta
    ? 'https://blockscout.com/etc/mordor'
    : 'https://blockscout.com/etc/mainnet',
  Base: isBeta ? 'https://goerli.basescan.org' : 'https://basescan.org',
  Scroll: isBeta
    ? 'https://alpha-blockscout.scroll.io'
    : 'https://scrollscan.com',
  Bitgert: isBeta
    ? 'https://testnet-explorer.brisescan.com'
    : 'https://brisescan.com',
  Janus: isBeta ? 'https://beta.scan.janusnetwork.io' : '',
  Manta: isBeta
    ? 'https://manta-testnet.calderaexplorer.xyz'
    : 'https://pacific-explorer.manta.network',
  X1: isBeta ? 'https://www.oklink.com/x1-test' : '',
  BTC: isBeta ? 'https://mempool.space/testnet' : 'https://mempool.space',
  Zeta: isBeta
    ? 'https://athens3.explorer.zetachain.com'
    : 'https://explorer.mainnet.zetachain.com',
  Shardeum: isBeta ? 'https://explorer-sphinx.shardeum.org' : '',
  Mode: isBeta ? 'https://sepolia.explorer.mode.network' : 'https://explorer.mode.network',
  Blast: isBeta ? 'https://testnet.blastscan.io' : 'https://blastscan.io',
  Merlin: isBeta ? 'https://testnet-scan.merlinchain.io' : 'https://scan.merlinchain.io',
  Pulse: isBeta ? 'https://scan.v4.testnet.pulsechain.com/#' : 'https://scan.mypinata.cloud/ipfs/bafybeidn64pd2u525lmoipjl4nh3ooa2imd7huionjsdepdsphl5slfowy/#',
  FCH: 'https://freecash.info'
};

export const RPC_URL = {
  Ethereum: isBeta
    ? 'https://goerli.blockpi.network/v1/rpc/public	'
    : 'https://eth.drpc.org',
  BSC: isBeta
    ? 'https://data-seed-prebsc-1-s1.binance.org:8545/'
    : 'https://bsc-dataseed.binance.org/',
  Polygon: isBeta
    ? 'https://polygon-testnet.public.blastapi.io'
    : 'https://polygon-rpc.com',
  Heco: isBeta
    ? 'https://http-testnet.hecochain.com'
    : 'https://http-mainnet.hecochain.com',
  OKTC: isBeta
    ? 'https://exchaintestrpc.okex.org'
    : 'https://exchainrpc.okex.org',
  Avalanche: isBeta
    ? 'https://api.avax-test.network/ext/bc/C/rpc'
    : 'https://api.avax.network/ext/bc/C/rpc',
  Harmony: isBeta ? 'https://api.s0.b.hmny.io' : 'https://api.harmony.one',
  KCC: isBeta
    ? 'https://rpc-testnet.kcc.network'
    : 'https://rpc-mainnet.kcc.network',
  Cronos: isBeta
    ? 'https://cronos-testnet-3.crypto.org:8545'
    : 'https://evm-cronos.crypto.org',
  Arbitrum: isBeta
    ? 'https://rinkeby.arbitrum.io/rpc'
    : 'https://arb1.arbitrum.io/rpc',
  Fantom: isBeta
    ? 'https://rpc.testnet.fantom.network'
    : 'https://rpc.ftm.tools',
  Metis: isBeta
    ? 'https://stardust.metis.io/?owner=588'
    : 'https://andromeda.metis.io/?owner=1088',
  IoTex: isBeta
    ? 'https://babel-api.testnet.iotex.io'
    : 'https://babel-api.mainnet.iotex.io',
  Optimism: isBeta
    ? 'https://kovan.optimism.io'
    : 'https://optimism-mainnet.public.blastapi.io',
  Klaytn: isBeta
    ? 'https://api.baobab.klaytn.net:8651'
    : 'https://klaytn-pokt.nodies.app',
  smartBCH: isBeta ? 'https://moeing.tech:9545' : 'https://smartbch.greyh.at',
  ENULS: isBeta ? 'https://beta.evmapi.nuls.io' : 'https://evmapi.nuls.io',
  KAVA: isBeta ? 'https://evm.testnet.kava.io' : 'https://evm.kava.io',
  ETHW: 'https://mainnet.ethereumpow.org/',
  REI: isBeta
    ? 'https://rpc-testnet.rei.network'
    : 'https://rpc-mainnet.rei.network',
  zkSync: isBeta
    ? 'https://zksync2-testnet.zksync.dev'
    : 'https://zksync2-mainnet.zksync.io',
  eosEVM: isBeta
    ? 'https://api.testnet.evm.eosnetwork.com'
    : 'https://api.evm.eosnetwork.com',
  polygonZkEVM: isBeta
    ? 'https://rpc.public.zkevm-test.net'
    : 'https://zkevm-rpc.com',

  Linea: isBeta ? 'https://rpc.goerli.linea.build' : 'https://rpc.linea.build',
  CELO: isBeta
    ? 'https://alfajores-forno.celo-testnet.org'
    : 'https://forno.celo.org',
  ETC: isBeta
    ? 'https://rpc.mordor.etccooperative.org'
    : 'https://etc.rivet.link',
  BASE: isBeta ? 'https://goerli.base.org' : 'https://mainnet.base.org',
  Scroll: isBeta ? 'https://alpha-rpc.scroll.io/l2' : 'https://rpc.scroll.io',
  Bitgert: isBeta
    ? 'https://testnet-rpc.brisescan.com'
    : 'https://mainnet-rpc.brisescan.com',
  Janus: isBeta ? 'https://rpc.test.janusnetwork.io/' : '',
  Manta: isBeta
    ? 'https://manta-testnet.calderachain.xyz/http'
    : 'https://pacific-rpc.manta.network/http',
  X1: isBeta ? 'https://x1testrpc.okx.com' : '',
  BTC: '',
  Zeta: isBeta
    ? 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public'
    : 'https://api.mainnet.zetachain.com/evm',
  Shardeum: isBeta ? 'https://sphinx.shardeum.org' : '',
  Mode: isBeta ? 'https://sepolia.mode.network' : 'https://mainnet.mode.network',
  Blast: isBeta ? 'https://sepolia.blast.io' : 'https://rpc.blast.io',
  Merlin: isBeta ? 'https://testnet-rpc.merlinchain.io' : 'https://rpc.merlinchain.io',
  Pulse: isBeta ? 'https://rpc.v4.testnet.pulsechain.com' : 'https://rpc.pulsechain.com'
};

export const _networkInfo = {
  BTC: {
    type: 'BTC',
    name: 'BTC',
    chainName: isBeta ? 'testnet' : 'livenet',
    chainId: 201,
    assetKey: isBeta ? '5-171' : '9-787',
    origin: Origin.BTC,
    mainAsset: 'BTC',
    nativeId: '0x-a',
    logo: BTCLogo,
    decimals: 8,
    rpcUrl: RPC_URL.BTC
  },
  Ethereum: {
    type: 'EVM',
    name: 'Ethereum',
    chainName: 'Ethereum', // 用于metamask添加链时显示链名称 区分正式、测试网
    chainId: 101,
    assetKey: '9-2',
    origin: Origin.ETH,
    mainAsset: 'ETH',
    nativeId: '0x1',
    logo: ETHLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Ethereum
  },
  Goerli: {
    type: 'EVM',
    name: 'Goerli',
    chainName: 'Goerli',
    chainId: 118,
    assetKey: '5-2',
    origin: Origin.ETH,
    mainAsset: 'ETH',
    nativeId: '0x5',
    logo: ETHLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Ethereum
  },
  BSC: {
    type: 'EVM',
    name: 'BSC',
    chainName: isBeta ? 'BSC_Beta' : 'BSC',
    chainId: 102,
    assetKey: isBeta ? '5-8' : '9-25',
    origin: Origin.BSC,
    mainAsset: 'BNB',
    nativeId: isBeta ? '0x61' : '0x38',
    logo: BSCLogo,
    decimals: 18,
    rpcUrl: RPC_URL.BSC
  },
  Polygon: {
    type: 'EVM',
    name: 'Polygon',
    chainName: isBeta ? 'Polygon_Beta' : 'Polygon',
    chainId: 106,
    assetKey: isBeta ? '5-34' : '9-160',
    origin: Origin.Polygon,
    mainAsset: 'MATIC',
    nativeId: isBeta ? '0x13881' : '0x89',
    logo: PolygonLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Polygon
  },
  OKTC: {
    type: 'EVM',
    name: 'OKTC',
    chainName: isBeta ? 'OKC_Beta' : 'OKTC',
    chainId: 104,
    assetKey: isBeta ? '5-12' : '9-87',
    origin: Origin.OKTC,
    mainAsset: 'OKT',
    nativeId: isBeta ? '0x41' : '0x42',
    logo: OECLogo,
    decimals: 18,
    rpcUrl: RPC_URL.OKTC
  },
  Avalanche: {
    type: 'EVM',
    name: 'Avalanche',
    chainName: isBeta ? 'Avalanche_Beta' : 'Avalanche',
    chainId: 110,
    assetKey: isBeta ? '5-94' : '9-267',
    origin: Origin.Avalanche,
    mainAsset: 'AVAX',
    nativeId: isBeta ? '0xa869' : '0xa86a',
    logo: AVAVLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Avalanche
  },
  Harmony: {
    type: 'EVM',
    name: 'Harmony',
    chainName: isBeta ? 'Harmony_Beta' : 'Harmony',
    chainId: 105,
    assetKey: isBeta ? '5-33' : '9-159',
    origin: Origin.Harmony,
    mainAsset: 'ONE',
    nativeId: isBeta ? '0x6357d2e0' : '0x63564c40',
    logo: HarmonyLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Harmony
  },
  KCC: {
    type: 'EVM',
    name: 'KCC',
    chainName: isBeta ? 'KCC_Beta' : 'KCC',
    chainId: 107,
    assetKey: isBeta ? '5-35' : '9-161',
    origin: Origin.KCC,
    mainAsset: 'KCS',
    nativeId: isBeta ? '0x142' : '0x141',
    logo: KCCLogo,
    decimals: 18,
    rpcUrl: RPC_URL.KCC
  },
  Cronos: {
    type: 'EVM',
    name: 'Cronos',
    chainName: isBeta ? 'Cronos_Beta' : 'Cronos',
    chainId: 109,
    assetKey: isBeta ? '5-93' : '9-266',
    origin: Origin.Cronos,
    mainAsset: 'CRO',
    nativeId: isBeta ? '0x152' : '0x19',
    logo: CROLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Cronos
  },
  Arbitrum: {
    type: 'EVM',
    name: 'Arbitrum',
    chainName: isBeta ? 'Arbitrum_Beta' : 'Arbitrum',
    chainId: 111,
    assetKey: isBeta ? '5-95' : '9-268',
    origin: Origin.Arbitrum,
    mainAsset: 'AETH',
    nativeId: isBeta ? '0x66eeb' : '0xa4b1',
    logo: ARBILogo,
    decimals: 18,
    rpcUrl: RPC_URL.Arbitrum
  },
  Fantom: {
    type: 'EVM',
    name: 'Fantom',
    chainName: isBeta ? 'Fantom_Beta' : 'Fantom',
    chainId: 112,
    assetKey: isBeta ? '5-96' : '9-269',
    origin: Origin.Fantom,
    mainAsset: 'FTM',
    nativeId: isBeta ? '0xfa2' : '0xfa',
    logo: FTMLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Fantom
  },
  TRON: {
    type: 'TRON',
    name: 'TRON',
    chainName: 'TRON',
    chainId: 108,
    assetKey: isBeta ? '5-55' : '9-218',
    origin: Origin.TRON,
    mainAsset: 'TRX',
    nativeId: isBeta ? '0x5f5e101' : '0x5f5e102',
    logo: TRONLogo,
    decimals: 6
  },
  Metis: {
    type: 'EVM',
    name: 'Metis',
    chainName: isBeta ? 'Metis_Beta' : 'Metis',
    chainId: 113,
    assetKey: isBeta ? '5-115' : '9-445',
    origin: Origin.Metis,
    mainAsset: 'METIS',
    nativeId: isBeta ? '0x24c' : '0x440',
    logo: MetisLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Metis
  },
  IoTex: {
    type: 'EVM',
    name: 'IoTex',
    chainName: isBeta ? 'IoTex_Beta' : 'IoTex',
    chainId: 114,
    assetKey: isBeta ? '5-116' : '9-446',
    origin: Origin.IoTex,
    mainAsset: 'IOTX',
    nativeId: isBeta ? '0x1252' : '0x1251',
    logo: LotexLogo,
    decimals: 18,
    rpcUrl: RPC_URL.IoTex
  },
  Optimism: {
    type: 'EVM',
    name: 'Optimism',
    chainName: isBeta ? 'Optimism_Beta' : 'Optimism',
    chainId: 115,
    assetKey: isBeta ? '5-117' : '9-447',
    origin: Origin.Optimism,
    mainAsset: 'OETH',
    nativeId: isBeta ? '0x45' : '0xa',
    logo: OptimismLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Optimism
  },
  Klaytn: {
    type: 'EVM',
    name: 'Klaytn',
    chainName: isBeta ? 'Klaytn_Beta' : 'Klaytn',
    chainId: 116,
    assetKey: isBeta ? '5-118' : '9-448',
    origin: Origin.Klaytn,
    mainAsset: 'KLAY',
    nativeId: isBeta ? '0x3e9' : '0x2019',
    logo: KlaytnLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Klaytn
  },
  smartBCH: {
    type: 'EVM',
    name: 'smartBCH',
    chainName: isBeta ? 'smartBCH_Beta' : 'smartBCH',
    chainId: 117,
    assetKey: isBeta ? '5-119' : '9-449',
    origin: Origin.smartBCH,
    mainAsset: 'BCH',
    nativeId: isBeta ? '0x2711' : '0x2710',
    logo: SmartBCHLogo,
    decimals: 18,
    rpcUrl: RPC_URL.smartBCH
  },
  ENULS: {
    type: 'EVM',
    name: 'ENULS',
    chainName: isBeta ? 'ENULS_Beta' : 'ENULS',
    chainId: 119,
    assetKey: isBeta ? '2-1' : '1-1',
    origin: Origin.ENULS,
    mainAsset: 'NULS',
    nativeId: isBeta ? '0x78' : '0x77',
    logo: ENULSLogo,
    decimals: 18,
    rpcUrl: RPC_URL.ENULS
  },
  KAVA: {
    type: 'EVM',
    name: 'KAVA',
    chainName: isBeta ? 'KAVA_Beta' : 'KAVA',
    chainId: 120,
    assetKey: isBeta ? '5-136' : '9-597',
    origin: Origin.KAVA,
    mainAsset: 'KAVA',
    nativeId: isBeta ? '0x8ad' : '0x8ae',
    logo: KavaLogo,
    decimals: 18,
    rpcUrl: RPC_URL.KAVA
  },
  ETHW: {
    type: 'EVM',
    // 只有主网
    name: 'ETHW',
    chainName: isBeta ? '' : 'ETHW',
    chainId: 121,
    assetKey: isBeta ? '' : '9-598',
    origin: Origin.ETHW,
    mainAsset: 'ETHW',
    nativeId: '0x2711',
    logo: ETHWLogo,
    decimals: 18,
    rpcUrl: RPC_URL.ETHW
  },
  REI: {
    type: 'EVM',
    name: 'REI',
    chainName: isBeta ? 'REI_Beta' : 'REI',
    chainId: 122,
    assetKey: isBeta ? '5-138' : '9-620',
    origin: Origin.REI,
    mainAsset: 'REI',
    nativeId: isBeta ? '0x3045' : '0xbabd',
    logo: REILogo,
    decimals: 18,
    rpcUrl: RPC_URL.REI
  },
  zkSync: {
    type: 'EVM',
    name: 'zkSync',
    chainName: isBeta ? 'zkSync_Beta' : 'zkSync',
    chainId: 123,
    assetKey: isBeta ? '5-139' : '9-621',
    origin: Origin.zkSync,
    mainAsset: 'ETH',
    nativeId: isBeta ? '0x118' : '0x144',
    logo: ZKLogo,
    decimals: 18,
    rpcUrl: RPC_URL.zkSync
  },
  EOSEVM: {
    type: 'EVM',
    name: 'EOSEVM',
    chainName: isBeta ? 'EOSEVM_Beta' : 'EOSEVM',
    chainId: 124,
    assetKey: isBeta ? '5-148' : '9-692',
    origin: Origin.EOSEVM,
    mainAsset: 'EOS',
    nativeId: isBeta ? '0x3cc5' : '0x4571',
    logo: EOSEVM,
    decimals: 18,
    rpcUrl: RPC_URL.eosEVM
  },
  'Polygon zkEVM': {
    type: 'EVM',
    name: 'Polygon zkEVM',
    chainName: isBeta ? 'Polygon zkEVM_Beta' : 'Polygon zkEVM',
    chainId: 125,
    assetKey: isBeta ? '5-149' : '9-693',
    origin: Origin.polygonZkEVM,
    mainAsset: 'ETH',
    nativeId: isBeta ? '0x5a2' : '0x44d',
    logo: PolygonZkEVM,
    decimals: 18,
    rpcUrl: RPC_URL.polygonZkEVM
  },
  Linea: {
    type: 'EVM',
    name: 'Linea',
    chainName: isBeta ? 'Linea_Beta' : 'Linea',
    chainId: 126,
    assetKey: isBeta ? '5-150' : '9-694',
    origin: Origin.Linea,
    mainAsset: 'ETH',
    nativeId: isBeta ? '0xe704' : '0xe708',
    logo: Linea,
    decimals: 18,
    rpcUrl: RPC_URL.Linea
  },
  Celo: {
    type: 'EVM',
    name: 'Celo',
    chainName: isBeta ? 'Celo_Beta' : 'Celo',
    chainId: 127,
    assetKey: isBeta ? '5-151' : '9-703',
    origin: Origin.Celo,
    mainAsset: 'CELO',
    nativeId: isBeta ? '0xaef3' : '0xa4ec',
    logo: CELOLogo,
    decimals: 18,
    rpcUrl: RPC_URL.CELO
  },
  ETC: {
    type: 'EVM',
    name: 'ETC',
    chainName: isBeta ? 'ETC_Beta' : 'Ethereum Classic Mainnet',
    chainId: 128,
    assetKey: isBeta ? '5-152' : '9-704',
    origin: Origin.ETC,
    // mainAsset: isBeta ? 'ETC' : 'METC',
    mainAsset: 'ETC',
    nativeId: isBeta ? '0x3f' : '0x3d',
    logo: ETCLogo,
    decimals: 18,
    rpcUrl: RPC_URL.ETC
  },
  Base: {
    type: 'EVM',
    name: 'Base',
    chainName: isBeta ? 'Base_Beta' : 'Base',
    chainId: 129,
    assetKey: isBeta ? '5-153' : '9-705',
    origin: Origin.Base,
    mainAsset: 'ETH',
    nativeId: isBeta ? '0x14a33' : '0x2105',
    logo: BASELogo,
    decimals: 18,
    rpcUrl: RPC_URL.BASE
  },
  Scroll: {
    type: 'EVM',
    name: 'Scroll',
    chainName: isBeta ? 'Scroll_Beta' : 'Scroll',
    chainId: 130,
    assetKey: isBeta ? '5-154' : '9-738',
    origin: Origin.Scroll,
    mainAsset: 'ETH',
    nativeId: isBeta ? '0x82751' : '0x82750',
    logo: ScrollLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Scroll
  },
  Bitgert: {
    type: 'EVM',
    name: 'Bitgert',
    chainName: isBeta ? 'Bitgert_Beta' : 'Bitgert',
    chainId: 131,
    assetKey: isBeta ? '5-159' : '9-739',
    origin: Origin.Bitgert,
    mainAsset: 'BRISE',
    nativeId: isBeta ? '0xfc9c' : '0x7f08',
    logo: BitgertLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Bitgert
  },
  Manta: {
    type: 'EVM',
    name: 'Manta',
    chainName: isBeta ? 'Manta_Beta' : 'Manta',
    chainId: 133,
    assetKey: isBeta ? '5-166' : '9-745',
    origin: Origin.Manta,
    mainAsset: 'ETH',
    nativeId: isBeta ? '0x34816d' : '0xa9',
    logo: MantaLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Manta
  },
  Zeta: {
    type: 'EVM',
    name: 'Zeta',
    chainName: isBeta ? 'Zeta_Beta' : 'Zeta',
    chainId: 135,
    assetKey: isBeta ? '5-172' : '9-786',
    origin: Origin.Zeta,
    mainAsset: 'ZETA',
    nativeId: isBeta ? '0x1b59' : '0x1b58',
    logo: ZetaLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Zeta
  },
  Janus: {
    type: 'EVM',
    name: 'Janus',
    chainName: isBeta ? 'Janus_Beta' : 'Janus',
    chainId: 132,
    assetKey: isBeta ? '5-165' : '',
    origin: Origin.Janus,
    mainAsset: 'JNS',
    nativeId: isBeta ? '0x105ac' : '',
    logo: JanusLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Janus
  },
  X1: {
    type: 'EVM',
    name: 'X1',
    chainName: isBeta ? 'X1_Beta' : 'X1',
    chainId: 134,
    assetKey: isBeta ? '5-170' : '',
    origin: Origin.X1,
    mainAsset: 'OKB',
    nativeId: isBeta ? '0xc3' : '',
    logo: OECLogo,
    decimals: 18,
    rpcUrl: RPC_URL.X1
  },
  Shardeum: {
    type: 'EVM',
    name: 'Shardeum',
    chainName: isBeta ? 'Shardeum_Beta' : 'Shardeum',
    chainId: 137,
    assetKey: isBeta ? '5-174' : '',
    origin: Origin.Shardeum,
    mainAsset: 'SHM',
    nativeId: isBeta ? '0x1f92' : '',
    logo: ShardeumLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Shardeum
  },
  Mode: {
    type: 'EVM',
    name: 'Mode',
    chainName: isBeta ? 'Mode_Beta' : 'Mode',
    chainId: 138,
    assetKey: isBeta ? '5-177' : '9-789',
    origin: Origin.Mode,
    mainAsset: 'ETH',
    nativeId: isBeta ? '0x397' : '0x868b',
    logo: ModeLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Mode
  },
  Blast: {
    type: 'EVM',
    name: 'Blast',
    chainName: isBeta ? 'Blast_Beta' : 'Blast',
    chainId: 139,
    assetKey: isBeta ? '5-178' : '9-790',
    origin: Origin.Blast,
    mainAsset: 'ETH',
    nativeId: isBeta ? '0xa0c71fd' : '0x13e31',
    logo: BlastLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Blast
  },
  Merlin: {
    type: 'EVM',
    name: 'Merlin',
    chainName: isBeta ? 'Merlin_Beta' : 'Merlin',
    chainId: 140,
    assetKey: isBeta ? '5-179' : '9-791',
    origin: Origin.Merlin,
    mainAsset: 'BTC',
    nativeId: isBeta ? '0xa7b14' : '0x1068',
    logo: MerlinLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Merlin
  },
  Pulse: {
    type: 'EVM',
    name: 'Pulse',
    chainName: isBeta ? 'Pulse_Beta' : 'Pulse',
    chainId: 141,
    assetKey: isBeta ? '5-182' : '',
    origin: Origin.Pulse,
    mainAsset: 'PLS',
    nativeId: isBeta ? '0x3af' : '0x171',
    logo: PulseLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Pulse
  },
  FCH: {
    type: 'FCH',
    name: 'FCH',
    chainName: 'FCH',
    chainId: 202,
    assetKey: isBeta ? '5-168' : '9-788',
    origin: Origin.FCH,
    mainAsset: 'FCH',
    nativeId: '0x-e',
    logo: FCHLogo,
    decimals: 8
  },
  Heco: {
    type: 'EVM',
    name: 'Heco',
    chainName: isBeta ? 'Heco_Beta' : 'Heco',
    chainId: 103,
    assetKey: isBeta ? '5-9' : '9-55',
    origin: Origin.Heco,
    mainAsset: 'HT',
    nativeId: isBeta ? '0x100' : '0x80',
    logo: HecoLogo,
    decimals: 18,
    rpcUrl: RPC_URL.Heco
  },
  NULS: {
    type: 'NULS',
    name: 'NULS',
    chainName: 'NULS',
    chainId: isBeta ? 2 : 1,
    assetKey: isBeta ? '2-1' : '1-1',
    origin: Origin.NULS,
    mainAsset: 'NULS',
    nativeId: '0x-1',
    logo: NULSLogo
  },
  NERVE: {
    type: 'NULS',
    name: 'NERVE',
    chainName: 'NERVE',
    chainId: isBeta ? 5 : 9,
    assetKey: isBeta ? '5-1' : '9-1',
    origin: Origin.NERVE,
    mainAsset: 'NVT',
    nativeId: '0x-2',
    logo: NERVELogo
  }
};

if (isBeta) {
  // @ts-ignore
  delete _networkInfo.Ethereum;
  // @ts-ignore
  delete _networkInfo.ETHW;
} else {
  // @ts-ignore
  delete _networkInfo.Goerli;
  // @ts-ignore
  delete _networkInfo.Janus;
  // @ts-ignore
  delete _networkInfo.X1;
  // @ts-ignore
  delete _networkInfo.Shardeum;
  // @ts-ignore
  delete _networkInfo.Pulse;
}

const isMobile = /Android|webOS|iPhone|iPad|BlackBerry/i.test(
  navigator.userAgent
);
if (!isMobile) {
  // @ts-ignore
  delete _networkInfo.FCH;
}

/* function parseChainID(chainId: string | number) {
  return '0x' + Number(chainId).toString(16);
} */

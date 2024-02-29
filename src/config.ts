type EnvType = 'beta' | 'prod';

const env = process.env.BUILD_ENV as EnvType;

/*function getWSUrl(): string {
  let url;
  if (env === 'beta') {
    url = 'ws://beta.api.swap.nerve.network/ws';
    // url = "ws://api.swap.nerve.network/ws"
  } else {
    url = 'wss://api.swap.nerve.network/ws';
  }
  return url;
}

const WS_URL = getWSUrl();*/
const timeout = 15000;

const config = {
  beta: {
    isBeta: true,
    API_URL: 'https://beta.public.nerve.network',
    WS_URL: 'ws://beta.api.swap.nerve.network/ws',
    swap_url: 'https://beta.api.swap.nerve.network',
    chainId: 5,
    assetId: 1,
    prefix: 'TNVT',
    symbol: 'NVT',
    NULSConfig: {
      chainId: 2,
      assetId: 1,
      prefix: 'tNULS'
    },
    timeout,
    ETHNET: 'ropsten',
    feeAddress: 'TNVTdTSPP9oSLvdtVSVFiUYCvXJdj1ZA1nyQU', //提现费用地址
    destroyAddress: 'TNVTdTSPGwjgRMtHqjmg8yKeMLnpBpVN5ZuuY', // 黑洞地址
    pushFeeAddress: '',
    pushFeeScale: '',
    trxWithdrawFee: '40000000',
    explorerUrl: 'http://beta.scan.nerve.network',
    bridgeUrl: 'http://beta.bridge.nerve.network/'
  },
  prod: {
    isBeta: false,
    API_URL: 'https://public.nerve.network',
    WS_URL: 'wss://api.swap.nerve.network/ws',
    swap_url: 'https://api.swap.nerve.network',
    chainId: 9,
    assetId: 1,
    prefix: 'NERVE',
    symbol: 'NVT',
    NULSConfig: {
      chainId: 1,
      assetId: 1,
      prefix: 'NULS'
    },
    timeout,
    ETHNET: 'homestead',
    feeAddress: 'NERVEepb69f573sRzfoTX9Kn67WeNtXhG6Y6W8',
    destroyAddress: 'NERVEepb63T1M8JgQ26jwZpZXYL8ZMLdUAK31L',
    pushFeeAddress: 'NERVEepb6BiuhyRh4Q9mcwyQd44pfz4AofM2h5',
    pushFeeScale: 6,
    trxWithdrawFee: '40000000',
    explorerUrl: 'https://scan.nerve.network',
    bridgeUrl: 'https://bridge.nerve.network/'
  }
};

export default config[env];

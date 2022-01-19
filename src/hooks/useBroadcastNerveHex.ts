import useStoreState from '@/hooks/useStoreState';
import nerve from 'nerve-sdk-js';
import { NTransfer } from '@/utils/api';
import { broadcastHex } from '@/service/api';
import storage from '@/utils/storage';
import { Account, TxInfo } from '@/store/types';

/*interface TxInfo {
  inputs: any;
  outputs: any;
  txData: any;
  type: number;
}*/

export function setAccountTxs(pub: string, tx: TxInfo) {
  const accountList: Account[] = storage.get('accountList') || [];
  accountList.map(v => {
    if (v.pub === pub) {
      if (!v.txs) {
        v.txs = [tx];
      } else {
        v.txs.unshift(tx);
      }
      if (v.txs.length > 20) {
        v.txs.pop();
      }
    }
  });
  storage.set('accountList', accountList);
}

export default function useBroadcastNerveHex() {
  const { addressInfo } = useStoreState();

  // 已有交易hex，调用metamask签名，然后广播
  async function handleHex(hex: string, type: number) {
    const tAssemble = nerve.deserializationTx(hex);
    const transfer = new NTransfer({ chain: 'NERVE' });
    const txHex = await transfer.getTxHex({
      tAssemble,
      pub: addressInfo.value?.pub,
      signAddress: addressInfo.value?.address?.Ethereum
    });
    console.log(txHex, '===txHex===');
    const res = await broadcastHex(txHex);
    if (res && res.hash) {
      const txInfo: TxInfo = {
        type,
        hash: res.hash,
        time: new Date().getTime(),
        status: 0
      };
      setAccountTxs(addressInfo.value?.pub, txInfo);
    }
    return res;
  }

  // 没有交易hex，自己组装交易获取hex，然后调用metamask签名，广播
  async function handleTxInfo(txInfo: any, type: number, txData: any) {
    const transfer = new NTransfer({ chain: 'NERVE', type });
    const inputOuput: any = await transfer.inputsOrOutputs(txInfo);
    console.log(
      {
        inputs: inputOuput.inputs,
        outputs: inputOuput.outputs,
        txData,
        pub: addressInfo.value?.pub,
        signAddress: addressInfo.value?.address?.Ethereum
      },
      '====tx===='
    );
    const txHex = await transfer.getTxHex({
      inputs: inputOuput.inputs,
      outputs: inputOuput.outputs,
      txData,
      pub: addressInfo.value?.pub,
      signAddress: addressInfo.value?.address?.Ethereum
    });
    console.log(txHex, '===txHex===');
    const res = await broadcastHex(txHex);
    if (res && res.hash) {
      const txInfo: TxInfo = {
        type,
        hash: res.hash,
        time: new Date().getTime(),
        status: 0
      };
      setAccountTxs(addressInfo.value?.pub, txInfo);
    }
    return res;
  }

  return {
    handleHex,
    handleTxInfo
  };
}

import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import nerve from 'nerve-sdk-js';
import { useWalletStore } from '@/store/wallet';
import { NTransfer } from '@/utils/api';
import { broadcastHex } from '@/service/api';
import storage from '@/utils/storage';
import { Account, TxInfo } from '@/store/types';
import { checkIsNULSLedger } from './useEthereum';
import useToast from './useToast';
import { getEVMProvider } from '@/utils/providerUtil';

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
  const walletStore = useWalletStore()
  const { addressInfo: currentAccount } = storeToRefs(walletStore)
  const { t } = useI18n();
  const { toastSuccess, toastError } = useToast();

  // 已有交易hex，调用metamask签名，然后广播
  async function handleHex(hex: string, type: number) {
    let signedHex: string;
    const isNULSLedger = checkIsNULSLedger();
    if (isNULSLedger) {
      signedHex = await window.nabox.signNULSTransaction({ txHex: hex });
    } else {
      const tAssemble = nerve.deserializationTx(hex);
      const transfer = new NTransfer({ chain: 'NERVE' });
      signedHex = await transfer.getTxHex({
        tAssemble,
        pub: currentAccount.value?.pub,
        signAddress: currentAccount.value?.address?.EVM
      });
    }
    // console.log(txHex, '===txHex===');
    const res = await broadcastHex(signedHex);
    if (res && res.hash) {
      const txInfo: TxInfo = {
        type,
        hash: res.hash,
        time: new Date().getTime(),
        status: 0
      };
      setAccountTxs(currentAccount.value?.pub, txInfo);
    }
    handleMessage(res);
    return res;
  }

  // 没有交易hex，自己组装交易获取hex，然后调用metamask签名，广播
  async function handleTxInfo(txInfo: any, type: number, txData: any) {
    const transfer = new NTransfer({ chain: 'NERVE', type });
    const inputOuput: any = await transfer.inputsOrOutputs(txInfo);
    // console.log(
    //   {
    //     inputs: inputOuput.inputs,
    //     outputs: inputOuput.outputs,
    //     txData,
    //     pub: currentAccount.value?.pub,
    //     signAddress: currentAccount.value?.address?.EVM
    //   },
    //   '====tx===='
    // );
    const isNULSLedger = checkIsNULSLedger();
    let signedHex: string;
    if (isNULSLedger) {
      const unsignedHex = await transfer.getUnSignHex({
        inputs: inputOuput.inputs,
        outputs: inputOuput.outputs,
        txData
      });
      signedHex = await window.nabox.signNULSTransaction({
        txHex: unsignedHex
      });
    } else {
      signedHex = await transfer.getTxHex({
        inputs: inputOuput.inputs,
        outputs: inputOuput.outputs,
        txData,
        pub: currentAccount.value?.pub,
        signAddress: currentAccount.value?.address?.EVM
      });
    }
    console.log(inputOuput, '===txHex===', txData);
    // throw '333'
    const res = await broadcastHex(signedHex);
    if (res && res.hash) {
      const txInfo: TxInfo = {
        type,
        hash: res.hash,
        time: new Date().getTime(),
        status: 0
      };
      setAccountTxs(currentAccount.value?.pub, txInfo);
    }
    handleMessage(res);
    return res;
  }

  function handleMessage(res: any) {
    if (res.hash) {
      toastSuccess(t('transfer.transfer14'));
    } else if (res.error) {
      toastError(t('error.' + res.error.code));
    } else {
      toastError('Unknown Error');
    }
  }

  function handleResult(type: number | string, res: any, amountRemark: string, hId?: number) {
    if (res && res.hash) {
      const txInfo: TxInfo = {
        type,
        hash: res.hash,
        time: new Date().getTime(),
        status: 0,
        amountRemark,
        hId
      };
      setAccountTxs(currentAccount.value?.pub, txInfo);
    }
    handleMessage(res);
  }

  const getWalletInfo = () => {
    const { provider } = getEVMProvider();
    return {
      provider: provider,
      EVMAddress: currentAccount.value?.address?.EVM,
      pub: currentAccount.value?.pub
    };
  };

  return {
    handleHex,
    handleTxInfo,
    handleResult,
    getWalletInfo
  };
}

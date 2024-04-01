import nerveswap from 'nerveswap-sdk';
import storage from '@/utils/storage';

// 添加已有账户波场地址
export default async function AddChain() {
  const accountList = storage.get('accountList') || [];
  if (accountList.length) {
    if (!accountList[0].address.FCH) {
      accountList.map((account: any) => {
        const { address } = nerveswap.getAccountByPub(account.pub);
        account.address = address;
      });
      storage.set('accountList', accountList);
    }
  }
}

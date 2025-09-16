import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import storage from '@/utils/storage';
import { useWalletStore } from '@/store/wallet'
import { AccountFarm } from '@/store/types';

// interface Farm {
//   type: 'farm' | 'pool';
//   hash: string;
//   name: string;
// }

export default function useMyFarm() {
  const router = useRouter();
  const myFarms = ref<AccountFarm[]>([]);
  const walletStore = useWalletStore()
  const { addressInfo: currentAccount } = storeToRefs(walletStore)
  onMounted(() => {
    myFarms.value = currentAccount.value.farms || [];
  });
  function toMyFarm(farm: AccountFarm) {
    let url;
    if (farm.type === 'farm') {
      url = `/farm/${farm.hash}`;
    } else {
      url = `/pool/${farm.hash}`;
    }
    router.push(url);
  }

  function updateMyFarms(farm: AccountFarm) {
    const accountList = storage.get('accountList') || [];
    accountList.map((v: any) => {
      if (v.pub === currentAccount.value.pub) {
        if (v.farms && v.farms.length) {
          v.farms.push(farm);
        } else {
          v.farms = [farm];
        }
        myFarms.value = v.farms;
        walletStore.changeAccount(v)
      }
    });
    storage.set('accountList', accountList);
  }

  return {
    myFarms,
    toMyFarm,
    updateMyFarms
  };
}

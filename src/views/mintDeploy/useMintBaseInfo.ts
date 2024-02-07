import { ref, onMounted } from 'vue';
import { getMintBaseInfo } from '@/service/api/mint';

export default function useMintBaseInfo() {
  const targetAddress = ref('');
  onMounted(() => {
    getBaseInfo();
  });
  async function getBaseInfo() {
    targetAddress.value = await getMintBaseInfo();
  }
  return {
    targetAddress
  };
}

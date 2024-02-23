<template>
  <div class="auth-button">
    <slot>
      <el-button
        type="primary"
        v-if="!address"
        @click="showConnectDialog(true)"
      >
        {{ $t('header.header3') }}
      </el-button>
      <el-button v-else type="primary" @click="derivedAddress">
        {{ $t('login.login2') }}
      </el-button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { generateAddress } from '@/hooks/useEthereum';
import useToast from '@/hooks/useToast';
import { useI18n } from 'vue-i18n';
import storage from '@/utils/storage';
import { Account } from '@/store/types';

const emit = defineEmits(['loading']);

const store = useStore();
const { t } = useI18n();
const { toastError } = useToast();

const address = computed(() => {
  return store.state.address;
});

function showConnectDialog(state: boolean) {
  store.commit('changeConnectShow', state);
}

async function derivedAddress() {
  let result = false;
  emit('loading', true);
  try {
    if (!address.value) {
      showConnect();
      return;
    }
    const account = await generateAddress(address.value);
    const accountList: Account[] = storage.get('accountList') || [];
    const existIndex = accountList.findIndex(v => v.pub === account.pub);
    // replace if present
    if (existIndex > -1) {
      accountList[existIndex] = {
        ...accountList[existIndex],
        address: account.address,
        pub: account.pub
      };
    } else {
      accountList.push(account);
    }
    storage.set('accountList', accountList);
    store.commit('setCurrentAddress', account);
    result = true;
  } catch (e) {
    // console.log(e, 4444)
    toastError(t('login.login3'));
  }
  emit('loading', false);
  return result;
}
function showConnect() {
  store.commit('changeConnectShow', true);
}

defineExpose({
  showConnectDialog,
  derivedAddress
});
</script>

<style lang="scss"></style>

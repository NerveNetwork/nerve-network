<template>
  <Button
    :class="props.class"
    variant="gradient"
    v-if="!walletStore.currentAddress"
    @click="showConnect">
    {{ $t('header.header3') }}
  </Button>
  <Button
    :class="props.class"
    v-else
    variant="gradient"
    @click="derivedAddress">
    {{ $t('login.login2') }}
  </Button>
</template>

<script setup lang="ts">
import Button from '@/components/Base/Button/index.vue'
import { useWalletStore } from '@/store/wallet'
import { generateAddress } from '@/hooks/useEthereum'
import useToast from '@/hooks/useToast'
import { useI18n } from 'vue-i18n'
import storage from '@/utils/storage'
import { Account } from '@/store/types'

const props = defineProps<{ class?: string }>()
const emit = defineEmits(['loading'])

const walletStore = useWalletStore()
const { t } = useI18n()
const { toastError } = useToast()

async function derivedAddress() {
  let result = false
  emit('loading', true)
  const address = walletStore.currentAddress
  try {
    if (!address) {
      showConnect()
      return
    }
    const account = await generateAddress(address)
    const accountList: Account[] = storage.get('accountList') || []
    const existIndex = accountList.findIndex(v => v.pub === account.pub)
    // replace if present
    if (existIndex > -1) {
      accountList[existIndex] = {
        ...accountList[existIndex],
        address: account.address,
        pub: account.pub
      }
    } else {
      accountList.push(account)
    }
    storage.set('accountList', accountList)
    walletStore.changeAccount(account)
    result = true
  } catch (e) {
    // console.log(e, 4444)
    toastError(t('login.login3'))
  }
  emit('loading', false)
  return result
}
function showConnect() {
  walletStore.changeConnectShow(true)
}

defineExpose({
  derivedAddress
})
</script>

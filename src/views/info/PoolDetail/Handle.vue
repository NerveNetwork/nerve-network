<template>
  <div class="">
    <Button class="mr-3 h-10 w-32" variant="outline" @click="addLiquidity">
      {{ $t('info.info17') }}
    </Button>
    <Button class="h-10 w-32" @click="swap">
      {{ $t('info.info18') }}
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import Button from '@/components/Base/Button/index.vue'
import config from '@/config'

const props = defineProps<{
  info: any
  isPool?: boolean
}>()

const router = useRouter()

function addLiquidity() {
  if (props.isPool) {
    const { token0, token1 } = props.info
    router.push(`/liquidity/${token0}/${token1}`)
  } else {
    router.push(
      `/liquidity/${props.info.assetKey}/${props.info.assetKey === config.BTCKey ? config.NVTKey : config.BTCKey}`
    )
  }
}
function swap() {
  if (props.isPool) {
    const { token0, token1 } = props.info
    router.push(`/swap/${token0}/${token1}`)
  } else {
    router.push(`/swap/${props.info.assetKey}`)
  }
}
</script>

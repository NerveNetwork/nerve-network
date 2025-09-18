<template>
  <div class="bg-footer pb-5 pt-7">
    <div class="w1200 flex flex-wrap justify-between">
      <div class="w-full lg:w-auto">
        <div class="mb-5 xl:mb-14">
          <img class="mb-4" src="../assets/img/nervelogo.svg" alt="" />
          <p class="flex items-center gap-2">
            <img src="../assets/img/NVT.svg" alt="" />
            <span>${{ walletStore.nvtPrice }}</span>
            <Button
              class="h-6 rounded-xl px-2.5 text-xs"
              variant="gradient"
              @click="buyNvt">
              {{ $t('footer.footer1') }}
            </Button>
          </p>
        </div>
        <p class="hidden text-xs text-label lg:block">{{ copyRight }}</p>
      </div>
      <div class="flex flex-wrap">
        <ul
          v-for="linkItem in linkConfig"
          :key="linkItem.label"
          class="mr-10 lg:mr-20">
          <li class="mb-2 font-medium">{{ linkItem.label }}</li>
          <li
            class="mb-2 text-label transition-colors duration-300 hover:text-primary"
            v-for="item in linkItem.items"
            :key="item.label">
            <template v-if="item.href.startsWith('/')">
              <router-link :to="item.href">{{ item.label }}</router-link>
            </template>
            <template v-else>
              <a :href="item.href" target="_blank">
                {{ item.label }}
              </a>
            </template>
          </li>
        </ul>
        <div class="mt-5 w-full sm:mt-0 sm:w-auto">
          <div class="mb-2 font-medium">{{ socials.label }}</div>
          <div class="flex gap-3">
            <a
              v-for="item in socials.items"
              :key="item.label"
              :href="item.href"
              target="_blank"
              class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#3D4152] transition-colors duration-300 hover:bg-[#3D4152]">
              <img :src="item.icon" alt="" />
            </a>
          </div>
        </div>
      </div>
      <p class="w-full pt-3 text-xs text-label lg:hidden">
        {{ copyRight }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from '@/components/Base/Button/index.vue'
import { useWalletStore } from '@/store/wallet'
import config from '@/config'
import twitterIcon from '@/assets/img/twitter.svg'
import telegramIcon from '@/assets/img/telegram.svg'
import discordIcon from '@/assets/img/discord.svg'
import mediumIcon from '@/assets/img/medium.svg'

interface LinkItem {
  label: string
  items: {
    label: string
    href: string
    icon?: string
  }[]
}

const { t } = useI18n()
const router = useRouter()
const walletStore = useWalletStore()

const copyRight = 'Copyright 2019-2025 @ All rights Reserved. NerveNetwork'

const linkConfig = computed(() => {
  return [
    {
      label: t('footer.footer2'),
      items: [
        {
          label: 'GitHub',
          href: 'https://github.com/NerveNetwork'
        },
        {
          label: t('footer.footer3'),
          href: 'https://docs.nerve.network/'
        },
        {
          label: t('footer.footer4'),
          href: 'https://drive.google.com/drive/folders/13gk5XzfJmCUyRCmoleWH47REUOyGc4yo?usp=sharing'
        },
        {
          label: t('footer.footer5'),
          href: 'https://ipfs.io/ipfs/bafybeicl27pbb2culvq7ectrarq4aurw7k5hpuldxsyzy57ypdgx73nt6y'
        }
      ]
    },
    {
      label: t('footer.footer7'),
      items: [
        {
          label: t('footer.footer8'),
          href: config.explorerUrl
        },
        {
          label: 'Listing Token',
          href: '/listing-token'
        },
        {
          label: t('footer.footer9'),
          href: '/node'
        },
        {
          label: 'Deploy Bridge Token',
          href: '/contract-deploy'
        },
        {
          label: t('footer.footer10'),
          href: 'https://github.com/NerveNetwork/nerve'
        }
        // {
        //   label: 'NerveDEX',
        //   href: 'https://dex.nerve.network/'
        // }
      ]
    }
  ]
})

const socials = computed(() => {
  return {
    label: t('footer.footer6'),
    items: [
      {
        label: 'Twitter',
        href: 'https://twitter.com/nerve_network',
        icon: twitterIcon
      },
      {
        label: 'Telegram',
        href: 'https://t.me/NerveNetwork',
        icon: telegramIcon
      },
      {
        label: 'Discord',
        href: 'https://discord.gg/PBkHeD7',
        icon: discordIcon
      },
      {
        label: 'Medium',
        href: 'https://medium.com/@NerveNetwork',
        icon: mediumIcon
      }
    ]
  }
})

function buyNvt() {
  const { chainId, assetId, NULSConfig } = config
  router.push(
    `/swap/${NULSConfig.chainId}-${NULSConfig.assetId}/${chainId}-${assetId}`
  )
}
</script>

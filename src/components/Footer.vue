<template>
  <div class="footer-bar">
    <div class="w1200 flex-between">
      <div class="left">
        <div class="top">
          <img class="logo" src="../assets/img/nervelogo.svg" alt="" />
          <p class="flex">
            <img src="../assets/img/nerveIcon.png" alt="" />
            <span class="price">${{ nvtPrice }}</span>
            <el-button size="small" type="primary" @click="buyNvt">
              {{ $t('footer.footer1') }}
            </el-button>
          </p>
        </div>
        <p class="copy-right pc">{{ copyRight }}</p>
      </div>
      <div class="right flex-between">
        <ul v-for="linkItem in linkConfig" :key="linkItem.label">
          <li>{{ linkItem.label }}</li>
          <li v-for="item in linkItem.items" :key="item.label">
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
      </div>
      <p class="copy-right mobile">
        {{ copyRight }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import useLang from '@/hooks/useLang';
import useStoreState from '@/hooks/useStoreState';
import config from '@/config';

const { t } = useI18n();
const router = useRouter();

const { lang } = useLang();
console.log(lang, 77);

const copyRight = 'Copyright 2019-2025 @ All rights Reserved. NerveNetwork';

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
      label: t('footer.footer6'),
      items: [
        {
          label: 'Twitter',
          href: 'https://twitter.com/nerve_network'
        },
        {
          label: 'Discord',
          href: 'https://discord.gg/PBkHeD7'
        },
        {
          label: 'Medium',
          href: 'https://medium.com/@NerveNetwork'
        },
        {
          label: 'Telegram',
          href: 'https://t.me/NerveNetwork'
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
          label: t('footer.footer9'),
          href: '/node'
        },
        {
          label: 'Contract Deploy',
          href: '/contract-deploy'
        },
        {
          label: t('footer.footer10'),
          href: 'https://github.com/NerveNetwork/nerve'
        },
        // {
        //   label: 'NerveDEX',
        //   href: 'https://dex.nerve.network/'
        // }
      ]
    }
  ];
});

function buyNvt() {
  const { chainId, assetId, NULSConfig } = config;
  router.push(
    `/swap/${NULSConfig.chainId}-${NULSConfig.assetId}/${chainId}-${assetId}`
  );
}

const { nvtPrice } = useStoreState();
</script>

<style lang="scss">
.footer-bar {
  //background: #fafcff;
  background-color: #fff;
  border: 1px solid #e4e9f4;
  padding: 25px 0 30px;

  .flex-between {
    align-items: start;
  }

  .left {
    .top {
      margin-bottom: 40px;

      .logo {
        width: 120px;
        margin-bottom: 15px;
      }

      p {
        align-items: center;

        img {
          width: 24px;
          height: 24px;
        }

        .price {
          color: #475472;
          font-size: 14px;
          margin: 0 15px 0 8px;
        }

        .el-button {
          height: 28px;
          min-height: auto;
          padding: 5px 15px;
          border-radius: 5px;

          span {
            font-size: 12px;
          }
        }
      }
    }
  }
  .copy-right {
    color: #8794b1;
    font-size: 14px;
  }

  .right {
    width: 50%;
    padding-right: 100px;

    li {
      font-size: 14px;

      a {
        color: #5e6983;
        line-height: 26px;

        &:hover {
          color: #2688f7;
        }
      }

      &:first-child {
        color: #475472;
        font-weight: 600;
        margin-bottom: 10px;
      }
    }
  }
  @media screen and (max-width: 1200px) {
    padding: 20px 0 20px;
    .w1200 {
      flex-wrap: wrap;
      padding: 0 20px;
    }
    .left,
    .right {
      width: 100%;
      padding: 0;
    }
    .left .top {
      margin-bottom: 20px;
      .logo {
        width: 100px;
      }
    }
    .copy-right {
      padding-top: 10px;
    }
  }
}
</style>

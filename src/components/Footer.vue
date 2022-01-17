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
        <p class="copy-right pc">Copyright © 2022 NERVE</p>
      </div>
      <div class="right flex-between">
        <ul v-for="linkItem in linkConfig" :key="linkItem.label">
          <li>{{ linkItem.label }}</li>
          <li v-for="item in linkItem.items" :key="item.label">
            <a v-if="!item.router" :href="item.href" target="_blank">
              {{ item.label }}
            </a>
            <router-link v-else :to="item.href">{{ item.label }}</router-link>
          </li>
        </ul>
      </div>
      <p class="copy-right mobile">Copyright © 2022 NERVE</p>
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
          href: 'https://github.com/NerveNetwork/nerve-docs'
        },
        {
          label: t('footer.footer4'),
          href: 'https://drive.google.com/drive/folders/13gk5XzfJmCUyRCmoleWH47REUOyGc4yo?usp=sharing'
        },
        {
          label: t('footer.footer5'),
          href:
            lang.value === 'EN'
              ? 'http://nerve-cn.oss-cn-hangzhou.aliyuncs.com/wp/Nerve_Whitepaper_ZH.pdf'
              : 'http://nervefiles.oss-us-west-1.aliyuncs.com/wp/Nerve_Whitepaper_EN.pdf'
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
          href: '/node',
          router: true
        }
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

const { assetsList } = useStoreState();
const nvtPrice = computed(() => {
  if (!assetsList.value.length) return 0;
  const nvt = assetsList.value.find(v => v.symbol === 'NVT');
  return nvt?.usdPrice || 0;
});
</script>

<style lang="scss">
.footer-bar {
  //background: #fafcff;
  background-color: #fff;
  border: 1px solid #e4e9f4;
  padding: 30px 0 40px;

  .flex-between {
    align-items: start;
  }

  .left {
    .top {
      margin-bottom: 50px;

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
    .left, .right {
      width: 100%;
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

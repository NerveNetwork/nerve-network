<template>
  <div class="horizon-menu">
    <template v-for="item in menus" :key="item.key">
      <div
        class="menu-item"
        :class="{ active: activeMenu === item.key, disable: item.disable }"
        @click="emit('clickMenu')"
      >
        <a v-if="item.url" :href="item.url" target="_blank">{{ item.label }}</a>
        <router-link v-else :to="'/' + item.key">
          {{ item.label }}
        </router-link>
<!--        <template v-else>
          <router-link v-if="!item.needAuth" :to="'/' + item.key">
            {{ item.label }}
          </router-link>
          <template v-else>
            <router-link
              v-if="props.address && props.nerveAddress"
              :to="'/' + item.key"
            >
              {{ item.label }}
            </router-link>
            <auth-button :ref="setAuthRef" v-else>
              <a href="javascript:" @click="authClick">{{ item.label }}</a>
            </auth-button>
          </template>
        </template>-->
      </div>
    </template>
    <div class="lang-warp mobile" @click="changeLang">
      <img src="../assets/img/lang.svg" alt="" />
      {{ lang }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { isBeta } from '@/utils/util';
import AuthButton from '@/components/AuthButton.vue';
import useLang from '@/hooks/useLang';

type AuthBtn = InstanceType<typeof AuthButton>;

const props = defineProps({
  address: String,
  nerveAddress: String
});

const emit = defineEmits(['clickMenu']);

const { t } = useI18n();

const route = useRoute();

const activeMenu = computed(() => {
  const path = route.path;
  return path.split('/')[1] || 'home';
});

const menus = computed(() => {
  return [
    {
      label: t('header.header10'),
      key: 'assets',
      needAuth: true
    },
    {
      label: t('header.header11'),
      key: 'consensus'
    },
    {
      label: t('header.header1'),
      key: 'swap'
    },
    {
      label: t('header.header8'),
      key: 'farm'
    },
    {
      label: t('header.header2'),
      key: 'liquidity'
    },
    {
      label: t('header.header12'),
      key: 'info'
    },
    {
      label: 'Bridge',
      key: 'Bridge',
      url: isBeta
        ? 'http://beta.bridge.nerve.network/'
        : 'https://bridge.nerve.network/'
    },
    {
      label: t('header.header13'),
      key: 'Explorer',
      url: isBeta
        ? 'http://beta.scan.nerve.network/'
        : 'https://scan.nerve.network/'
    }
  ];
});

const authRef = ref<AuthBtn[]>([]);
function setAuthRef(el: AuthBtn) {
  authRef.value.push(el);
}

function authClick() {
  // console.log(authRef, 456);
  // console.log(props, 132456)
  if (authRef.value.length) {
    const authBtn = authRef.value[0];
    if (props.address) {
      authBtn.derivedAddress();
    } else {
      authBtn.showConnectDialog(true);
    }
  }
}

const { lang, switchLang } = useLang();
function changeLang() {
  switchLang();
  emit('clickMenu');
}
</script>

<style lang="scss">
.horizon-menu {
  display: flex;

  .menu-item {
    padding: 18px 0;
    a {
      display: inline-block;
      height: 44px;
      line-height: 44px;
      padding: 0 20px;
      color: #475472;
      //font-size: 18px;
      &:hover,
      &:focus,
      &:active {
        color: #387cf4;
        //background-color: #387cf4;
      }
    }

    &.active a {
      color: #fff;
      background-color: #387cf4;
      border-radius: 20px;
    }
    &.disable {
      cursor: not-allowed;
      a {
        pointer-events: none;
      }
    }
  }
  @media screen and (max-width: 1200px) {
    position: absolute;
    z-index: 100;
    right: 0;
    width: 150px;
    height: 100%;
    background: #fff;
    flex-direction: column;
    padding-top: 20px;
    .menu-item {
      padding: 0;
      a {
        height: 48px;
        line-height: 48px;
      }

      &.active a {
        color: #387cf4;
        background-color: #fff;
        border-radius: 0;
      }
    }
    .lang-warp {
      position: absolute;
      bottom: 20px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      img {
        width: 25px;
        margin-right: 10px;
      }
    }
  }
}
</style>

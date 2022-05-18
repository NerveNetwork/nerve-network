<template>
  <img class="symbol-icon" v-lazy="iconSrc" :key="iconSrc" />
<!--  <el-image class="symbol-icon" :key="iconSrc" :src="iconSrc" lazy>
    <template #error>
      <img class="symbol-icon" :src="defaultIcon" />
    </template>
  </el-image>-->
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { getIconSrc } from '@/utils/util';
import defaultIcon from '@/assets/img/defaultIcon.svg';
export default defineComponent({
  props: {
    icon: String
  },
  name: 'SymbolIcon',
  setup(props) {
    const iconSrc = computed(() => {
      return getIconSrc(props.icon || '');
    });
    function replaceImg(e: Event) {
      const target = e.target as HTMLImageElement;
      target.src = defaultIcon;
    }
    return {
      iconSrc,
      replaceImg,
      defaultIcon
    };
  }
});
</script>

<style lang="scss">
/*.symbol-icon {
  overflow: initial;
  img {
    width: 35px;
    height: 35px;
    border-radius: 50%;
  }
}*/
.symbol-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
}
</style>

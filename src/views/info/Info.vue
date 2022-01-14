<template>
  <div class="w1200 info">info</div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'Info',
  props: {},
  setup: () => {
    const count = ref(0);
    return { count };
  }
});
</script>

<style lang="scss">
.info {
  /* min-height: 800px; */
}
</style>

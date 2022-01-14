<template>
  <div class="link-card">
    <div class="bg"></div>
    <div class="content">
      <img :src="picSrc" alt="" />
      <p class="title">{{ title }}</p>
      <p class="desc">{{ desc }}</p>
      <div class="button-wrap">
        <router-link :to="link" v-if="link.startsWith('/')">
          {{ btnLabel }}
        </router-link>
        <a :href="link" target="_blank" v-else>{{ btnLabel }}</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string;
  desc: string;
  picSrc: string;
  link: string;
  btnLabel: string;
}>();
</script>

<style lang="scss">
.link-card {
  position: relative;
  width: 448px;
  height: 550px;
  border-radius: 40px;
  overflow: hidden;
  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #17ead9, #6078ea);
    //border-radius: 0 0 20px 20px;
    z-index: -1;
  }
  .content {
    width: 100%;
    height: 540px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 0 36px;
    background-color: #fff;
    border-radius: 0 0 40px 40px;
    border: 1px solid #e4e9f4;
    border-bottom: none;
  }
  img {
    height: 280px;
    border-radius: 50%;
    margin-bottom: 35px;
  }
  p {
    color: #475472;
  }
  .title {
    font-weight: 600;
    font-size: 24px;
  }
  .desc {
    font-size: 18px;
    padding: 0 20px;
    margin-top: 8px;
    height: 50px;
    text-align: center;
  }
  .button-wrap {
    width: 280px;
    margin: 0 auto;
    text-align: center;
    background-color: #387cf4;
    border-radius: 10px;
    a {
      width: 100%;
      height: 48px;
      line-height: 48px;
      color: #fafafa;
      display: inline-block;
    }
    &:hover {
      opacity: 0.8;
    }
  }
  @media screen and (max-width: 1200px) {
    position: relative;
    width: 100%;
    height: 400px;
    border-radius: 40px;
    overflow: hidden;
    margin-bottom: 40px;
    .content {
      width: 100%;
      height: 390px;
      padding: 30px 0 16px;
      border-radius: 0 0 40px 40px;
    }
    img {
      height: 180px;
      margin-bottom: 15px;
    }
    .title {
      font-size: 20px;
    }
    .desc {
      font-size: 16px;
      height: 46px;
    }
  }
}
</style>

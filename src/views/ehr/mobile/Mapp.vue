<template>
  <div :element-loading-text="loadingMsg" class="m-main" v-loading.fullscreen.lock="!!loadingMsg">
    <m-header @click.native="showMenu++" class="header">
      <div slot="title"></div>
    </m-header>
    <m-homepage :show-menu="showMenu" class="container"></m-homepage>
    <!-- <container :idx="menu.idx" :key="Math.random()" class="container"></container>
    <menu-footer @clickMenu="m => menu=m" class="footer"></menu-footer>-->
  </div>
</template>
<script>
import MHeader from './main/MHeader'
import MHomepage from './main/MHomepage'
// import Container from './main/Container'
// import MenuFooter from './main/MenuFooter'
import { getNetStatusInter } from '@/utils/globalTimer'
export default {
  name: 'mapp',
  data() {
    return {
      loadingMsg: false,
      showMenu: 0,
      menu: { idx: 0, label: '网络' }
    }
  },
  components: {
    MHeader,
    MHomepage
    // MenuFooter,
    // Container
  },
  created() {
    getNetStatusInter()
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_mixins.scss';
@import '~@/style/utils/_variable.scss';
.m-main {
  @extend %position-absolute;
  .header {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;
  }
  .container {
    margin-top: 64px;
    overflow: auto;
  }
  // .container::-webkit-scrollbar {
  //   display: none;
  // }
  // .footer {
  //   position: fixed;
  //   left: 0;
  //   bottom: 0;
  // }
}
</style>

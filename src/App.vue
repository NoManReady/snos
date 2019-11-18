<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>
<script>
import { debounce } from '@/utils/utils'
// import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'App',
  data() {
    return {
      resizeFn: null
    }
  },
  created() {
    // this.$bus.$on('lang', this._setLang)
  },
  mounted() {
    this.resizeFn = this.debounceResize()
    window.addEventListener('resize', this.resizeFn, false)
  },
  beforeDestroy() {
    // this.$bus.$off('lang')
    window.removeEventListener('resize', this.resizeFn, fasle)
    this.resizeFn = null
  },
  computed: {
    // ...mapGetters(['loading'])
  },
  methods: {
    // ...mapActions(['setLang']),
    // _setLang({ lang = 'zh' }) {
    //   this.setLang(lang)
    // }
    debounceResize() {
      return debounce(() => {
        if (document.documentElement.clientWidth <= 768) {
          this.$store.dispatch('setCollapse', true)
        } else if (document.documentElement.clientWidth > 992) {
          this.$store.dispatch('setCollapse', false)
        }
      }, 100)
    }
  }
}
</script>
<style lang="scss">
@import './style/common.scss';
@import './style/layout.scss';
@import './style/comp/treeselect';
.app-container {
  height: 100%;
}
</style>

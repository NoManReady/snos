export default {
  data() {
    return {
      tabValue: '0',
      randomId: Math.random()
    }
  },
  watch: {
    '$route.query.tab': {
      handler() {
        this.tabValue = this.$route.query.tab || this.tab || '0'
      },
      immediate: true
    }
  },
  methods: {
    _onTabClick(v) {
      this.randomId = Math.random()
      this.$router.push({ query: { tab: v.name } })
    }
  }
}
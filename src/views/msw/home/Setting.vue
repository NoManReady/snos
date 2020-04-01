
<script>
import Alone from '@/views/common/Alone'
import { mapActions } from 'vuex'
import store from '@/store'
import switcherModule from '@/store/modules/switcher'
export default {
  name: 'Alone',
  extends: Alone,
  data() {
    return {
      timer: null
    }
  },
  async beforeRouteEnter(to, from, next) {
    store.registerModule('switcher', switcherModule())
    await store.dispatch('switcher/fetchPortinfo')
    try {
      await store.dispatch('switcher/fetchUplink')
    } catch (error) {}
    next()
  },
  async created() {
    // await this.fetchPortinfo()
    this._getUplinkTimer()
  },
  beforeDestroy() {
    store.unregisterModule('switcher')
    clearTimeout(this.timer)
    this.timer = null
  },
  methods: {
    ...mapActions('switcher', ['fetchUplink']),
    async _getUplinkTimer() {
      clearTimeout(this.timer)
      try {
        await this.fetchUplink()
      } catch (error) {}
      this.timer = setTimeout(() => {
        this._getUplinkTimer()
      }, 10000)
    }
  }
}
</script>
<style lang="scss">
.device-setting {
  min-width: 650px;
}
</style>

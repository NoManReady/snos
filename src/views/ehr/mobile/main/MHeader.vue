<template>
  <div class="m-header clearfix">
    <div class="logo fl">
      <i class="rjucd-r"></i>
    </div>
    <el-divider class="separation" direction="vertical"></el-divider>
    <!-- <slot name="title">
      <strong class="tc">{{ title }}</strong>
    </slot> -->
    <div class="fr">
      <span @click="$emit('exit')" class="pointer mr5">
        <slot name="exitText">
          <i class="rjucd-exit vm"></i>
          {{ $t("main_header.logout") }}
        </slot>
      </span>
    </div>
  </div>
</template>
<script>
import { Divider } from 'element-ui'
import { removeFromSession } from '@/utils/localStorage'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'MHeader',
  props: {},
  data() {
    return {
      timer: true
    }
  },
  components: {
    [Divider.name]: Divider
  },
  beforeDestroy() {
    clearTimeout(this.timer)
    this.timer = null
  },
  created() {
    // this._loadAlarm()
  },
  methods: {
    ...mapActions(['setLang']),
    async _loadAlarm() {
      let _res = await this.$api.getAlarm()
      this.alarmNum = (_res.list || []).length || 0
      this.timer &&
        (this.timer = setTimeout(() => {
          clearTimeout(this.timer)
          this._loadAlarm()
        }, 30000))
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable';
.m-header {
  width: 100%;
  height: $app-header-height;
  line-height: $app-header-height;
  background-color: $theme;
  padding: 0 10px;
  color: #fff;

  .logo {
    height: $app-header-height;
  }
  .separation {
    color: $border-main;
    width: 2px;
    height: 34px;
  }
  i.rjucd-r {
    height: 64px;
    line-height: 64px;
    font-size: 54px;
  }
}
</style>

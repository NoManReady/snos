<template>
  <div class="switch-panel tc">
    <port-panel-view :loading="portCount===0" :panel-ports="panelList" :ports="portinfo" :uplink="[+uplink.port]"></port-panel-view>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import PortPanelView from '@/common/PortPanelView'
export default {
  name: 'switch-panel',
  components: {
    [PortPanelView.name]: PortPanelView
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters('switch', ['item', 'portinfo', 'panelList', 'uplink']),
    portCount() {
      return this.portinfo.length
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
.switch-panel {
  min-height: 100px;
  // padding: 8px 0;
  width: 100%;
  transition: height 0.3s ease-in;
  position: relative;
  // padding-bottom: 15px;
  &--item {
    float: left;
    &.gutter {
      margin-right: 8px;
    }
    &.gutter-l {
      margin-left: 8px;
    }
  }
  &--path {
    position: relative;
    bottom: 0;
    & > div {
      position: absolute;
      border: 1px solid;
      border-top: none;
      height: 10px;
      span {
        background-color: #fff;
        font-size: 12px;
      }
      &.up {
        color: $theme;
        border-color: $theme;
      }
      &.down {
        color: $--color-info;
        border-color: $--color-info;
      }
      &.no-border {
        border: none;
      }
    }
  }
}
</style>

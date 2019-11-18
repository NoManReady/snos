<template>
  <el-popover :close-delay="0" :placement="pos" effect="dark" transition="none" trigger="hover" width="250px">
    <div class="port-panel">
      <div class="port-panel-item">
        <div class="port-panel-item__label">端口：</div>
        <div class="port-panel-item__value">{{port.interface}}</div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">端口状态：</div>
        <div class="port-panel-item__value">
          <template v-if="port.enable">
            <template v-if="port.link">
              <span class="c-success">已连接</span>
            </template>
            <template v-else>未连接</template>
          </template>
          <template v-else>
            <span class="c-info" v-if="!excepMap[port.exception.toString()]">关闭</span>
            <span class="c-danger" v-else>{{excepMap[port.exception.toString()]}}</span>
          </template>
        </div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">端口速率：</div>
        <div class="port-panel-item__value">
          <span class="c-warning" v-if="port.r_speed===0">10M</span>
          <span class="c-warning" v-else-if="port.r_speed===1">100M</span>
          <span class="c-success" v-else-if="port.r_speed===2">1000M</span>
          <span class="c-success" v-else-if="port.r_speed===3">10G</span>
          <!-- <span v-else-if="port.r_speed===3">10M-100M</span> -->
          <span v-else>--</span>
        </div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">流量：</div>
        <div class="port-panel-item__value">
          <div class="vm">
            <i class="el-icon-bottom c-warning"></i>
            <span>{{port.input_total|rateTrans}}</span>
          </div>
          <div class="vm">
            <i class="el-icon-top c-success"></i>
            <span>{{port.output_total|rateTrans}}</span>
          </div>
        </div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">速率：</div>
        <div class="port-panel-item__value">
          <div class="vm">
            <i class="el-icon-bottom c-warning"></i>
            <span>{{port.inrate_10s}}kbps</span>
          </div>
          <div class="vm">
            <i class="el-icon-top c-success"></i>
            <span>{{port.outtrate_10s}}kbps</span>
          </div>
        </div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">光电属性：</div>
        <div class="port-panel-item__value">{{port.media_type===2?'光口':'电口'}}</div>
      </div>
    </div>
    <div slot="reference">
      <slot>
        <i class="eweb-port-electric"></i>
      </slot>
    </div>
  </el-popover>
</template>
<script>
import { rateTrans } from '@/utils/utils'
export default {
  name: 'port-panel-view-tip',
  props: {
    pos: {
      type: String,
      default: 'top'
    },
    port: {
      type: Object,
      default: () => ({})
    }
  },
  filters: { rateTrans },
  data() {
    return {
      excepMap: Object.freeze({
        '-1': '未知异常',
        '1': 'bpdu异常',
        '3': '自环',
        '4': '配置广播风暴导致异常',
        '5': '配置未知名组播风暴导致异常',
        '6': '配置未知名单播风暴导致异常',
        '7': '配置ACL导致异常',
        '8': '配置端口保护导致异常',
        '9': '配置DHCP限速导致异常',
        '10': '配置ARP限速导致异常'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
@import '~@/style/utils/mixins';
.port-panel {
  min-width: 200px;
  &-item {
    margin-bottom: 5px;
    clear: both;
    @include clearfix;
    &__label,
    &__value {
      float: left;
    }
    &__label {
      width: 80px;
      text-align: left;
    }
    &__value {
      width: calc(100% - 80px);
      text-align: right;
    }
  }
}
</style>

<style lang="scss">
.no-animate {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
}
</style>

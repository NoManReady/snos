<template>
  <div class="box component-overview-ifaceinfo">
    <div class="box-header">
      <span class="box-header-tit">接口信息</span>
    </div>
    <div class="component-overview-ifaceinfo-port tc" v-show="Object.keys(portStatus).length">
      <div class="port-wrap-container">
        <div class="port-wrap vm">
          <i class="rjucd-upport vm on"></i>
          <span class="vm">已连接</span>
        </div>
        <div class="port-wrap vm ml20">
          <i class="rjucd-upport vm off"></i>
          <span class="vm">未连接</span>
        </div>
      </div>
      <div class="vm mt15 ml10" v-for="(ports,k) in portStatus" :key="k">
        <template v-for="p of ports">
          <el-tooltip placement="top" :key="p.portId">
            <port class="component-overview-ifaceinfo-port-item" :port="p">
              <template slot-scope="{port}" slot="bottom">
                {{ port.name === 'LAN' ? `${port.name}${port.portId - 1}` : `${port.name}` }}
              </template>
            </port>
            <div slot="content">
              <p>速率：{{p.speed==='auto'?'自动':(p.speed||0)+'M'}}</p>
              <template v-if="p.poe_direct!=='none'">
                <p>POE：{{p.poe_enable==='0'?'未启用':'启用'}}({{p.poe_direct==='in'?'受电':'供电'}})</p>
              </template>
            </div>
          </el-tooltip>
        </template>
        <p class="tc component-overview-ifaceinfo-port--desc">{{k.toUpperCase() == 'NULL' ? '&nbsp;' : k}}</p>
      </div>
    </div>
  </div>
</template>
<script>
import Port from '@/common/Port'
let timer = null
export default {
  name: 'OverviewPortStatus',
  data() {
    return {
      portStatus: []
    }
  },
  beforeDestroy() {
    clearTimeout(timer)
    timer = null
  },
  components: {
    Port
  },
  methods: {
    async init() {
      await this._loadPortStatus(true)
    },
    // 加载接口信息
    async _loadPortStatus(isInit) {
      try {
        let _portSataus = await this.$api.portStatus()
        let _statusMap = {}
        if (_portSataus) {
          _portSataus.List.forEach(port => {
            ;(_statusMap[port.ipaddr] || (_statusMap[port.ipaddr] = [])).push(
              Object.assign({}, port, {
                name: port.name.toLocaleUpperCase(),
                _status: port.status == 'on' ? 'on-on' : 'off-off'
              })
            )
          })
        }
        this.portStatus = Object.freeze(_statusMap)
      } finally {
        if (isInit || timer) { // 防止网络状态请求未返回时切换到其他页面，已clear的定时器又重新创建导致残留定时器
          timer = setTimeout(() => {
            this._loadPortStatus()
          }, 8000)
        }
      }

    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.component-overview-ifaceinfo {
  .port-wrap-container {
    position: absolute;
    top: 10px;
    left: 10px;
    i {
      font-size: 22px;
      border: 1px solid currentColor;
      border-radius: 3px;
      padding: 2px;
    }
    span {
      font-size: 12px;
      color: $--color-info;
    }
  }
  &-port {
    position: relative;
    border: 1px solid #ccc;
    border-radius: $--border-radius-base;
    min-width: 560px;
    overflow: auto;
    padding: 40px 10px 20px;
    &-item {
      cursor: pointer;
    }
    &--desc {
      color: #666;
      line-height: 1.5;
      padding: 5px 0 0;
    }
  }
}
</style>
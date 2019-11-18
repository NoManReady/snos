<template>
  <div class="network-neighbor">
    <help-alert json-key="neighborJson" title="网络列表">
      <div slot="content">每个网络都有各自的设备和配置，可以将“其他网络”的设备添加到“我的网络”，使配置一致。</div>
    </help-alert>
    <div class="mb20" v-if="stayMergerCount > 0">
      <div>
        正在添加
        <strong class="c-danger">{{ totalMergerCount }}</strong>个设备到我的网络， 已完成添加
        <strong class="c-success">{{ hasMergerCount }}</strong> 个设备， 剩余
        <strong class="c-danger">{{ stayMergerCount }}</strong> 个设备正在加入...
        <i class="el-icon-loading f-theme"></i>
      </div>
      <el-progress :percentage="percent" :stroke-width="18" :text-inside="true" status="success"></el-progress>
    </div>
    <div class="box-header">
      <span class="box-header-tit">
        我的网络
        <small></small>
      </span>
    </div>
    <neighbor-table
      :fromNetworkData="neighbor.myNetwork"
      :isNeiborNetwork="false"
      :toNetworkData="neighbor.neighbor"
      key="my-network"
    ></neighbor-table>
    <template v-if="neighbor.newDevice.length">
      <div class="box-header">
        <span class="box-header-tit">
          新设备列表
          <small></small>
        </span>
      </div>
      <neighbor-table
        :fromNetworkData="neighbor.newDevice"
        :isMergerLock="isMergerLock"
        :isNeiborNetwork="true"
        :toNetworkData="neighbor.myNetwork"
        @onMerger="onMerger"
        key="new-network"
      ></neighbor-table>
    </template>
    <div class="box-header">
      <span class="box-header-tit">
        其他网络
        <small></small>
      </span>
    </div>
    <neighbor-table
      :fromNetworkData="neighbor.neighbor"
      :isMergerLock="isMergerLock"
      :isNeiborNetwork="true"
      :toNetworkData="neighbor.myNetwork"
      @onMerger="onMerger"
      key="other-network"
    ></neighbor-table>
  </div>
</template>
<script>
import NeighborTable from './NeighborTable'
import { Progress } from 'element-ui'
export default {
  name: 'NetworkNeighbor',
  data() {
    return {
      neighbor: {
        neighbor: [],
        myNetwork: [
          {
            subDevice: []
          }
        ],
        newDevice: []
      },
      targetCount: 0,
      isMergerLock: false,
      totalMergerCount: 0,
      myNetLen: 1,
      mergeTimer: null,
      myDevIp: '',
      // 合并请求次数，超过20默认失败
      discCnt: 0
    }
  },
  computed: {
    isRouter() {
      return this.$store.getters.devMode.forwardMode === 'ROUTER'
    },
    stayMergerCount() {
      return Math.max(
        this.targetCount -
          Math.max(this.neighbor.myNetwork[0].subDevice.length, this.myNetLen),
        0
      )
    },
    hasMergerCount() {
      return this.totalMergerCount - this.stayMergerCount
    },
    percent() {
      return Math.floor((this.hasMergerCount / this.totalMergerCount) * 100)
    }
  },
  async created() {
    await this.getDevIp()
    this._disc_init()
  },
  beforeDestroy() {
    clearTimeout(this.mergeTimer)
    this.mergeTimer = null
  },
  components: {
    [Progress.name]: Progress,
    NeighborTable
  },
  methods: {
    async getDevIp() {
      if (this.isRouter) {
        let _portSataus = await this.$api.portStatus()
        this.myDevIp =
          _portSataus.List.find(o => o.name === 'LAN').ipaddr || '本机'
      }
    },
    async _disc_init(isMergering) {
      clearTimeout(this.mergeTimer)
      // 判断最大合并请求次数
      if (isMergering) {
        this.discCnt++
        if (this.discCnt > 20) {
          this.$alert(
            `合并成功：${this.hasMergerCount},合并失败：${this.stayMergerCount}`,
            { type: 'warning' }
          )
          this.isMergerLock = false
          this.targetCount = Math.max(
            this.neighbor.myNetwork[0].subDevice.length,
            this.myNetLen
          )
          return
        }
      }
      try {
        let neighborData = await this.$api.getNetworkNeighbor(!!isMergering)
        let myNetworkId = neighborData.curNetwork.networkId
        let data = {}
        let _sysInfo = this.$store.state.system.sysinfo
        data[myNetworkId] = Object.assign(neighborData.curNetwork, {
          subDevice: [
            {
              ip: this.isRouter ? this.myDevIp : _sysInfo.wan_ip,
              devSN: _sysInfo.serial_num,
              deviceType: _sysInfo.product_class,
              devMac: _sysInfo.sys_mac,
              software: _sysInfo.software_version
            }
          ]
        })
        neighborData.neighbor.forEach(item => {
          if (!data[item.networkId]) {
            data[item.networkId] = Object.assign(
              {
                networkId: item.networkId,
                networkName: item.networkName,
                groupId: item.groupId,
                groupName: item.groupName
              },
              { subDevice: [] }
            )
          }
          data[item.networkId].subDevice.push(item)
        })
        let neighbor = {
          neighbor: [],
          myNetwork: [],
          newDevice: []
        }
        Object.keys(data).forEach(k => {
          let type = ''
          if (k == '0' && myNetworkId != '0') {
            type = 'newDevice'
          } else if (k == myNetworkId) {
            type = 'myNetwork'
          } else {
            type = 'neighbor'
          }
          neighbor[type].push(data[k])
        })
        this.neighbor = neighbor
        if (isMergering) {
          if (neighbor.myNetwork[0].subDevice.length < this.targetCount) {
            this.mergeTimer = setTimeout(() => {
              this._disc_init(isMergering)
            }, 3700)
          } else {
            this.isMergerLock = false
            this.totalMergerCount > 0 &&
              this.$message({
                dangerouslyUseHTMLString: true,
                message: `成功添加<strong class="c-danger"> ${this.totalMergerCount} </strong>个设备到我的网络`,
                type: 'success'
              })
          }
        }
      } catch (error) {
        this.mergeTimer = setTimeout(() => {
          this._disc_init(isMergering)
        }, 3700)
      }
    },
    onMerger(count) {
      this.isMergerLock = true
      this.totalMergerCount = count
      this.myNetLen = this.neighbor.myNetwork[0].subDevice.length || 1
      this.targetCount = this.myNetLen + this.totalMergerCount
      this.discCnt = 0
      this._disc_init(true)
    }
  }
}
</script>
<style lang="scss">
.network-neighbor {
  .el-table__expanded-cell[class*='cell'] {
    padding: 0 5px;
  }
}
</style>

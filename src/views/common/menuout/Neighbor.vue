<template>
  <div class="network-neighbor" v-loading="isloading">
    <help-alert :title="$t('nei.net_list')" json-key="neighborJson" v-if="!isMacc">
      <div slot="content">{{ $t("nei.nei_tip") }}</div>
    </help-alert>
    <div :class="isMacc ? '' : 'mr20'">
      <div class="mb20" v-if="stayMergerCount > 0">
        <i18n path="nei.nei_add_tip" tag="div">
          <strong class="c-danger" place="total">{{ totalMergerCount }}</strong>
          <strong class="c-success" place="has">{{ hasMergerCount }}</strong>
          <strong class="c-danger" place="stay">{{ stayMergerCount }}</strong>
          <i class="el-icon-loading f-theme" place="loading"></i>
        </i18n>
        <el-progress :percentage="percent" :stroke-width="18" :text-inside="true" status="success"></el-progress>
      </div>
      <div class="box-header">
        <span class="box-header-tit">
          {{ $t("nei.my_net") }}
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
            {{ $t("nei.new_net") }}
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
      <div class="box-header mt15">
        <span class="box-header-tit">
          {{ isMacc ? $t("nei.wait_add_manually") : $t("nei.other_net") }}
          <small></small>
          <el-tooltip effect="light" placement="right" v-if="isMacc">
            <div slot="content">
              <!-- <strong class="ml5">待手动加入的设备分为：</strong>
              <ol class="ml20 ol-num">
                <li class="mt5">新设备，纯EAP组网时，需手动添加新设备到我的网络（点击确认即可，不需要输入密码）</li>
                <li class="mt5">已配置的设备，需要输入被添加设备的密码才能添加到我的网络（如果忘记密码，可以手动恢复出厂成新设备后添加）。</li>
              </ol>-->
              {{ $t("nei.nei_pass_tip") }}
            </div>
            <i class="el-icon-info fs18"></i>
          </el-tooltip>
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
  </div>
</template>
<script>
import NeighborTable from './NeighborTable'
export default {
  name: 'NetworkNeighbor',
  props: {
    isMacc: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      isloading: false,
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
      // 合并请求次数，超过20默认失败
      discCnt: 0
    }
  },
  computed: {
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
    this._disc_init(false, true)
  },
  mounted() {
    this.$bus.$on('LOAD-NEIGHBOR', _ => {
      this._disc_init(false, true)
    })
  },
  beforeDestroy() {
    this.$bus.$off('LOAD-NEIGHBOR')
    clearTimeout(this.mergeTimer)
    this.mergeTimer = null
  },
  components: {
    NeighborTable
  },
  methods: {
    async _disc_init(isMergering = false, isSilence = false) {
      clearTimeout(this.mergeTimer)
      // 判断最大合并请求次数
      if (isMergering) {
        this.discCnt++
        if (this.discCnt > 20) {
          this.$alert(
            I18N.t('nei.merge_tip', {
              success: this.hasMergerCount,
              fail: this.stayMergerCount
            }),
            {
              type: 'warning',
              dangerouslyUseHTMLString: true,
              confirmButtonText: I18N.t('nei.refresh_page'),
              callback: action => {
                window.top.location.reload()
              }
            }
          )
          this.isMergerLock = false
          this.$bus.$emit('LOAD-NETVIEW', { from: 'Neighbor' })
          this.targetCount = Math.max(
            this.neighbor.myNetwork[0].subDevice.length,
            this.myNetLen
          )
          return
        }
      }
      try {
        isSilence && (this.isloading = true)
        let neighborData = await this.$api.getNetworkNeighbor(
          isMergering || isSilence
        )
        this.isloading = false
        let myNetworkId = neighborData.curNetwork.networkId
        let data = {}
        let _sysInfo = this.$store.state.system.sysinfo
        data[myNetworkId] = Object.assign(neighborData.curNetwork, {
          subDevice: [
            {
              ip: _sysInfo.auth_ip,
              devSN: _sysInfo.serial_num,
              deviceType: _sysInfo.product_class,
              product: _sysInfo.productType.toLocaleUpperCase(),
              devMac: _sysInfo.sys_mac,
              software: _sysInfo.software_version,
              forwardMode: _sysInfo.forwardMode
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
          if (k == '0' && myNetworkId != '0' && !this.isMacc) {
            // 全网配置页面把新设备放在待手动加入（其他网络）中
            type = 'newDevice'
          } else if (k == myNetworkId) {
            type = 'myNetwork'
          } else {
            type = 'neighbor'
          }
          neighbor[type].push(data[k])
        })
        this.neighbor = neighbor
        this.$emit('change', neighbor)
        if (isMergering) {
          if (neighbor.myNetwork[0].subDevice.length < this.targetCount) {
            this.mergeTimer = setTimeout(() => {
              this._disc_init(isMergering)
            }, 3700)
          } else {
            if (neighbor.myNetwork[0].subDevice.length === 0) {
              this.$alert(
                I18N.t('nei.merge_change_tip'),
                I18N.t('nei.empty_nei'),
                {
                  dangerouslyUseHTMLString: true,
                  confirmButtonText: I18N.t('nei.know_fresh_page')
                }
              ).then(_ => {
                let _url =
                  window.top.location.href.split('/admin')[0] ||
                  window.top.location.origin
                window.top.location.href = `${_url}?initpath=admin/network_neighbor`
              })
              return
            }
            this.isMergerLock = false
            this.$bus.$emit('LOAD-NETVIEW', { from: 'Neighbor' })
            this.totalMergerCount > 0 &&
              this.$message({
                dangerouslyUseHTMLString: true,
                message: I18N.t('nei.success_tip', {
                  cnt: this.totalMergerCount
                }),
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

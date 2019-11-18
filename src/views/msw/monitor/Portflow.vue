<template>
  <div class="monitor-portflow">
    <help-alert title="端口流量" v-if="showHelp"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">端口信息</span>
        <div class="vm">
          <el-tooltip content="流量数据5分钟更新一次" placement="top">
            <i class="el-icon-question fs16 c-info"></i>
          </el-tooltip>
          <el-tooltip content="刷新列表" placement="top">
            <a @click="_refresh" class="c-success ml5" href="javascript:;">
              <i class="el-icon-refresh fs14"></i>
            </a>
          </el-tooltip>
        </div>
        <div class="fr" v-if="showHelp&&!isFirst">
          <el-button @click.native="_onClearData(false)" icon="el-icon-delete" size="small" type="danger">清除</el-button>
          <el-button @click.native="_onClearData(true)" icon="el-icon-delete" size="small" type="danger">全部清除</el-button>
        </div>
      </div>
      <slot :loading="isLoading||isFirst" :portinfo="viewPorts"></slot>
      <el-table :data="pageList" ref="baseTable" size="small" stripe v-loading="isLoading||isFirst">
        <el-table-column type="selection" v-if="showHelp" width="55"></el-table-column>
        <el-table-column align="center" label="端口" width="100px">
          <template slot-scope="{row}">
            <span>{{row.interface}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="端口速率">
          <template slot-scope="{row}">
            <span class="c-warning" v-if="row.r_speed===0">10M</span>
            <span class="c-warning" v-else-if="row.r_speed===1">100M</span>
            <span class="c-ok" v-else-if="row.r_speed===2">1000M</span>
            <span class="c-ok" v-else-if="row.r_speed===3">10G</span>
            <span class="c-info" v-else>未连接</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="输入/输出速率(kbps)">
          <template slot-scope="{row}">
            <span>{{row.inrate_10s}}/{{row.outtrate_10s}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="接收/发送字节">
          <template slot-scope="{row}">
            <span>{{row.input_total|rateTrans}}/{{row.output_total|rateTrans}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="接收/发送报文数">
          <template slot-scope="{row}">
            <span>{{row.inpacket_total}}/{{row.outpacket_total}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="CRC/FCS错误包">
          <template slot-scope="{row}">
            <span>{{row.crc_err}}/{{row.fcs_err}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="不完整/过大数据包">
          <template slot-scope="{row}">
            <span>{{row.undersize}}/{{row.ovbersize}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="冲突次数" width="100">
          <template slot-scope="{row}">
            <span>{{row.conflicts_num}}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.page"
        :page-size="pageModel.size"
        :page-sizes="pageModel.sizes"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/msw/pageMixins'
import { rateTrans } from '@/utils/utils'
import { mapGetters } from 'vuex'
export default {
  name: 'monitor-portflow',
  mixins: [pageMixins],
  filters: { rateTrans },
  props: {
    showHelp: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isLoading: false,
      totalPort: window.APP_CAPACITY_SW.port.port_total,
      refresh_enable: 30000,
      isFirst: true
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo', 'lagPort', 'uplink', 'logicPort']),
    viewPorts() {
      return Object.freeze(this.pageModel.allItem.slice(0, this.totalPort))
    }
  },
  methods: {
    // 加载port列表
    async _loadList() {
      let _list = []
      try {
        let params = [
          { method: 'devSta.get', params: { module: 'flow_status' } },
          { method: 'devSta.get', params: { module: 'port_base' } }
        ]
        let [flow, base] = await this.$api.cmd(
          'cmdArr',
          { params },
          { isSilence: true }
        )
        _list = flow.data
          .map((f, i) => {
            let _basedata = base.data.find(p => p.lpid === f.lpid)
            let _portinfo = this.portinfo.find(p => p.lpid === f.lpid)
            let _icon = _portinfo.media_type === 2 ? 'guangkou' : 'upport'
            let _realPort =
              this.logicPort.find(p => p.interface === f.interface) || {}
            let _ag =
              _realPort.aggregate_port > 0 ? _realPort.aggregate_port : null
            // 当前口为聚合口，提取聚合信息
            if (_ag) {
              let _agPort = this.lagPort.find(p => p.interface === `lag${_ag}`)
              if (_agPort) {
                let _baseAg = base.data.find(p => p.lpid === _agPort.lpid)
                _basedata.exception = _baseAg && _baseAg.exception
              }
            }
            // 判断端口的实时状态
            let _status = 'closed'
            if (_basedata.enable === 1) {
              if (_basedata.link === 0) {
                _status = 'info'
              } else {
                if (_basedata.r_speed >= 2) {
                  _status = 'success'
                } else {
                  _status = 'warning'
                }
              }
            } else {
              if (![0, 2].includes(_basedata.exception)) {
                _status = 'error'
              }
            }
            return {
              ..._portinfo,
              ..._basedata,
              ...f,
              icon: _icon,
              portType: _status,
              text: _ag
            }
          })
          .filter(port => {
            return (
              port.aggregate_port !== undefined ||
              this.lagPort.find(p => p.lpid === port.lpid)
            )
          })
      } catch (e) {
        console.log(e)
      }
      this.isFirst = false
      return _list
    },
    // 清除数据
    async _onClearData(isAll) {
      let _lpids = isAll ? [] : this.$refs.baseTable.selection.map(s => s.lpid)
      if (!isAll && !_lpids.length) {
        return this.$message.warning('请选择要清除的端口')
      }
      try {
        await this.$api.cmd(
          'devSta.set',
          {
            module: 'flow_status',
            data: { lpid: _lpids }
          },
          { text: '清除中' }
        )
        this._refresh()
      } catch (error) {}
    },
    // 刷新页面
    async _refresh() {
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      try {
        await this.refresh()
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.monitor-portflow {
}
</style>


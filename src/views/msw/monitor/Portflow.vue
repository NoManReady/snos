<template>
  <div class="monitor-portflow">
    <!-- <help-alert title="端口流量" v-if="showHelp"></help-alert> -->
    <div class="box">
      <div class="box-header">
        <div class="box-header-tit">
          <span class="vm">{{$t('msw.flow.port_info')}}</span>
          <port-panel--graphic class="vm" v-if="!showHelp" />
        </div>
        <div class="fr" v-if="showHelp&&!isFirst">
          <el-button
            @click.native="_onClearData(false)"
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
          >{{$t('action.patch_clear')}}</el-button>
          <el-button
            @click.native="_onClearData(true)"
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
          >{{$t('action.clear_all')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <span class="vm">{{$t('msw.flow.data_fresh_tip')}}</span>
          <el-button
            :disabled="isLoading"
            @click.native="_refresh"
            class="vm"
            icon="el-icon-refresh"
            size="mini"
            style="padding:0;"
            type="text"
          >{{$t('action.refresh')}}</el-button>
        </div>
      </help-alert>
      <slot :loading="isLoading||isFirst" :portinfo="viewPorts" :refresh="_refresh"></slot>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe tooltip-effect="light" v-loading="isLoading||isFirst">
        <el-table-column type="selection" v-if="showHelp" width="55"></el-table-column>
        <el-table-column :label="$t('msw.port')" align="center" width="100px">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.base.port_speed')" align="center">
          <template slot-scope="{row}">
            <span class="c-warning" v-if="row.r_speed===0">10M</span>
            <span class="c-warning" v-else-if="row.r_speed===1">100M</span>
            <span class="c-ok" v-else-if="row.r_speed===2">1000M</span>
            <span class="c-ok" v-else-if="row.r_speed===3">10G</span>
            <span class="c-info break-word" v-else>{{$t('msw.flow.unconnection')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.flow.inout_speed')" align="center">
          <template slot-scope="{row}">
            <span class="break-word">{{row.inrate_10s}}/{{row.outtrate_10s}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.flow.inout_byte')" align="center">
          <template slot-scope="{row}">
            <span class="break-word">{{row.input_total|rateTrans}}/{{row.output_total|rateTrans}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.flow.inout_pack')" align="center">
          <template slot-scope="{row}">
            <span class="break-word">{{row.inpacket_total}}/{{row.outpacket_total}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.flow.err_pack')" align="center">
          <template slot-scope="{row}">
            <span class="break-word">{{row.crc_err}}/{{row.fcs_err}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.flow.over_pack')" align="center" width="180">
          <template slot-scope="{row}">
            <span class="break-word">{{row.undersize}}/{{row.ovbersize}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.flow.conflict_cnt')" align="center" width="100">
          <template slot-scope="{row}">
            <span class="break-word">{{row.conflicts_num}}</span>
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
import {
  getLpidByAggid,
  isPhyPort,
  isSupportPoE,
  hasLagmemberByLpid
} from '@/utils/lag'
import PortPanelGraphic from '@/common/PortPanelGraphic'
export default {
  name: 'monitor-portflow',
  components: {
    [PortPanelGraphic.name]: PortPanelGraphic
  },
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
    ...mapGetters('switcher', ['portinfo', 'uplink']),
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
        if (APP_ROLES.includes('sw_poe')) {
          params.push({ method: 'devSta.get', params: { module: 'poe' } })
        }
        let [flow, base, poe] = await this.$api.cmd(
          'cmdArr',
          { params },
          { isSilence: true }
        )
        _list = flow.data
          .map((f, i) => {
            let _basedata = base.data.find(p => p.lpid === f.lpid)
            let _poeInfo = { power_on: 0, off_reason: 0 }
            if (poe && poe.data && isSupportPoE(f.lpid)) {
              _poeInfo = poe.data.find(p => p.lpid === f.lpid)
            }
            let _portItem = this.portinfo.find(p => p.lpid === f.lpid)
            // let _icon = _portItem.media_type === 2 ? 'guangkou' : 'upport'
            let _ag =
              _portItem.aggregate_port > 0 ? _portItem.aggregate_port : null
            // 当前口为聚合口，提取聚合信息
            if (_ag) {
              let _lpid = getLpidByAggid(_ag)
              let _baseAg = base.data.find(p => p.lpid === _lpid)
              _basedata.exception = _baseAg && _baseAg.exception
            }
            // 判断端口的实时状态
            let _status = 'closed'
            let _enable = _basedata.enable
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
            }
            if (_basedata.exception === 2) {
              _basedata.exception = 0
            }
            // 端口异常情况下，设置状态为错误且enable为0
            if (_basedata.exception) {
              _status = 'error'
              _enable = 0
            }
            return {
              ..._portItem,
              ..._basedata,
              ...f,
              // icon: _icon,
              enable: _enable,
              portType: _status,
              text: _ag,
              poeUp: _poeInfo.power_on === 1,
              poeError: _poeInfo.off_reason !== 0
            }
          })
          .filter(port => {
            return isPhyPort(port.lpid) || hasLagmemberByLpid(port.lpid)
          })
      } catch (e) {
        this.$log(e)
      }
      this.isFirst = false
      return _list
    },
    // 清除数据
    async _onClearData(isAll) {
      let _lpids = isAll ? [] : this.$refs.baseTable.selection.map(s => s.lpid)
      if (!isAll && !_lpids.length) {
        return this.$message.warning(I18N.t('msw.flow.clear_port'))
      }
      try {
        await this.$api.cmd(
          'devSta.set',
          {
            module: 'flow_status',
            data: { lpid: _lpids }
          },
          { text: I18N.t('msw.flow.clearing') }
        )
        this.$message.success(I18N.t('tip.remove_success'))
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


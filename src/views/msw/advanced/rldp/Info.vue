<template>
  <div class="advanced-rldp-status">
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
          <el-button
            plain
            size="medium"
            type="primary"
            v-auth="_onResetStatus"
            v-loading="isLoading"
          >{{$t('msw.rldp.reset_status')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="medium" stripe>
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.rldp.detect_status')" align="center" prop="detect_state">
          <template slot-scope="{row}">
            <span v-if="row.detect_state===0">Normal</span>
            <span v-else class="c-danger">Error</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.rldp.loop_action')" align="center" prop="detect_action">
          <template slot-scope="{row}">
            <span class="c-info" v-if="row.detect_action===0">--</span>
            <span v-if="row.detect_action===1">{{$t('msw.rldp.port_err_1')}}</span>
            <span v-if="row.detect_action===2">{{$t('msw.rldp.port_err_2')}}</span>
            <span v-if="row.detect_action===3">{{$t('msw.rldp.port_err_3')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.rldp.loop_action_actual')" align="center" prop="cur_status">
          <template slot-scope="{row}">
            <span class="c-info" v-if="row.aggregate_port>0">{{$t('msw.agg_port_tip',{id:row.aggregate_port})}}</span>
            <template v-else>
              <span v-if="row.cur_status===0">Shutdown</span>
              <span v-if="row.cur_status===1">Linkup</span>
              <span v-if="row.cur_status===2">Warning</span>
              <span v-if="row.cur_status===3">Block</span>
            </template>
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
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { isPhyPort, hasLagmemberByLpid } from '@/utils/lag'
import { mapGetters } from 'vuex'
export default {
  name: 'advanced-rldp-status',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('switcher', ['uplink', 'portinfo'])
  },
  methods: {
    // 加载port列表
    async _loadList() {
      try {
        let _result = await this.$api.cmd('devSta.get', {
          module: 'rldp_port_status'
        })
        return (
          _result.list
            .map(lis => {
              return {
                ...lis,
                ...this.portinfo.find(p => p.lpid === lis.lpid)
              }
            })
            // 过滤逻辑口和具有成员口的聚合口
            .filter(port => {
              return isPhyPort(port.lpid) || hasLagmemberByLpid(port.lpid)
            })
        )
      } catch (error) {
        return []
      }
    },
    // 重置状态
    async _onResetStatus() {
      try {
        await this.$confirm(I18N.t('msw.rldp.reset_warning_confirm'), {
          confirmButtonText: I18N.t('action.confirm'),
          cancelButtonText: I18N.t('action.cancel'),
          type: 'warning'
        })
        this._onSaveConf()
      } catch (error) {}
    },
    async _onSaveConf() {
      this.isLoading = true
      try {
        await this.$api.cmd('devSta.set', {
          module: 'rldp_port_status',
          data: { reset: 1 }
        })
        this.$message.success(I18N.t('tip.ope_success'))
      } catch (error) {}
      this.isLoading = false
    },
    // 合并策略方法
    _spanMethods({ row, column, rowIndex, columnIndex }) {
      if (row.aggregate_port > 0) {
        if (columnIndex > 0) {
          if (columnIndex === 3) {
            return {
              rowspan: 1,
              colspan: 3
            }
          } else {
            return {
              rowspan: 0,
              colspan: 0
            }
          }
        }
      }
    }
  }
}
</script>


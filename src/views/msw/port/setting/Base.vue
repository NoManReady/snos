<template>
  <div class="port-setting-base">
    <help-alert :title="$t('msw.base.port_cfg')">
      <div slot="content">{{$t('msw.base.port_cfg_tip')}}</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
          <el-button icon="el-icon-edit" plain size="medium" type="primary" v-auth="_onPatchEdit">{{$t('action.patch_edit')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="medium" stripe>
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.base.port_status')" align="center" prop="enable">
          <template slot-scope="{row}">
            <span v-if="row.enable===1">{{$t('phrase.enable')}}</span>
            <span v-else>{{$t('phrase.disable')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.base.dup_speed')" align="center">
          <el-table-column :label="$t('msw.base.cfg_status')" align="center">
            <template slot-scope="{row}">
              <span>{{enumMap['duplex'][row.c_duplex]}}/{{enumMap['speed'][row.c_speed]}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('msw.base.actual_status')" align="center">
            <template slot-scope="{row}">
              <span class="break-word">{{enumMap['duplex'][row.r_duplex]}}/{{enumMap['speed'][row.r_speed]}}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column :label="$t('msw.base.flow_ctrl')" align="center">
          <el-table-column :label="$t('msw.base.cfg_status')" align="center">
            <template slot-scope="{row}">
              <span v-if="row.c_flowcontrol===1">{{$t('phrase.enable')}}</span>
              <span v-else>{{$t('phrase.disable')}}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('msw.base.actual_status')" align="center">
            <template slot-scope="{row}">
              <span v-if="row.r_flowcontrol===1">{{$t('phrase.enable')}}</span>
              <span v-else>{{$t('phrase.disable')}}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{row,$index}">
            <span class="c-info" v-if="row.aggregate_port>0">{{$t('msw.agg_port_tip',{id:row.aggregate_port})}}</span>
            <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}" v-else>{{$t('action.edit')}}</el-button>
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
      <!-- baseModal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('msw.base.port_status_f')" prop="enable">
            <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.enable">
              <el-option :label="$t('phrase.disable')" :value="0"></el-option>
              <el-option :label="$t('phrase.enable')" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('msw.base.port_speed_f')" prop="c_speed">
            <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.c_speed">
              <el-option :key="sp.v" :label="sp.l" :value="sp.v" v-for="sp in enableSpeedAndDuplex.speed"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('msw.base.port_duplex_f')" prop="c_duplex">
            <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.c_duplex">
              <el-option :key="sp.v" :label="sp.l" :value="sp.v" v-for="sp in enableSpeedAndDuplex.duplex"></el-option>
            </el-select>
            <!-- <el-tooltip content="端口速率配置1000M，只能配置全双工" placement="top">
              <i class="el-icon-warning c-warning fs15 pointer" v-show="baseModel.c_speed===2"></i>
            </el-tooltip>-->
          </el-form-item>
          <el-form-item :label="$t('msw.base.flow_ctrl_f')" prop="c_flowcontrol">
            <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.c_flowcontrol">
              <el-option :label="$t('phrase.disable')" :value="0"></el-option>
              <el-option :label="$t('phrase.enable')" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <div v-if="editIndex===-1">
            <el-form-item :label="$t('msw.port_select_f')" class="inline-message" inline-message prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />
          </div>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" class="w120" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button
            :loading="isLoading"
            @click.native="_onModalConfirm"
            class="w120"
            size="medium"
            type="primary"
          >{{isLoading?$t('action.editing'):$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import {
  judgePortAttrMutil,
  getLogicportBySelect,
  isPhyPort,
  hasLagmemberByLpid
} from '@/utils/lag'
import { getIntersectionAll } from '@/utils/utils'
import { base } from '@/model/msw/port'
import { mapGetters } from 'vuex'
import { awaitOnLine_plus, waitForActionIfHasUplink } from '@/utils'
export default {
  name: 'port-setting-base',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      enumMap: Object.freeze({
        speed: {
          '-1': I18N.t('phrase.unknow'),
          '0': '10M',
          '1': '100M',
          '2': '1000M',
          '3': '10G',
          '4': I18N.t('phrase.auto')
        },
        duplex: {
          '-1': I18N.t('phrase.unknow'),
          '0': I18N.t('phrase.auto'),
          '1': I18N.t('msw.base.full_dup'),
          '2': I18N.t('msw.base.half_dup')
        }
      }),
      baseModel: base(),
      baseRules: {
        portid: [{ required: true, message: I18N.t('msw.port_is_required') }]
      },
      baseModalShow: false,
      editIndex: -1,
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item
        ? `${I18N.t('msw.port_f')}${_item.ifname}`
        : I18N.t('action.patch_edit')
    },
    // 获取速率及双工的使能值
    enableSpeedAndDuplex() {
      let _portid = getLogicportBySelect(this.baseModel.portid)
      let _speed = []
      let _duplex = []
      let _attr = judgePortAttrMutil(_portid, false)
      _duplex.push([
        { v: 2, l: I18N.t('msw.base.half_dup') },
        { v: 1, l: I18N.t('msw.base.full_dup') }
      ])
      let _speedInit = [
        { v: 0, l: '10M' },
        { v: 1, l: '100M' },
        { v: 2, l: '1000M' }
      ]
      _speed.push(_speedInit)
      if (_portid) {
        if (_attr.hasFPort) {
          _speed.push([
            { v: 0, l: '10M' },
            { v: 1, l: '100M' }
          ])
        }
        if (_attr.hasGPort) {
          if (_attr.hasFiber) {
            //光口只支持全双工
            _duplex.push([{ v: 1, l: I18N.t('msw.base.full_dup') }])
            _speed.push([
              { v: 1, l: '100M' },
              { v: 2, l: '1000M' }
            ])
          }
        }
        if (_attr.hasTPort) {
          _speedInit.push({ v: 3, l: '10G' })
          _duplex.push([{ v: 1, l: I18N.t('msw.base.full_dup') }])
          _speed.push([
            { v: 2, l: '1000M' },
            { v: 3, l: '10G' }
          ])
        }
      }

      // 千兆下只能配置全双工
      if (this.baseModel.c_speed === 2) {
        _duplex.push([{ v: 1, l: I18N.t('msw.base.full_dup') }])
      }
      // 全双工光口只能配置千兆
      // if (this.baseModel.c_duplex === 1 && _attr.hasFiber) {
      //   _speed.push([{ v: 2, l: '1000M' }])
      // }

      let _spValues = getIntersectionAll(a => a.v, ..._speed)
      let _dpValues = getIntersectionAll(a => a.v, ..._duplex)
      _spValues.unshift({ v: 4, l: I18N.t('phrase.auto') })
      _dpValues.unshift({ v: 0, l: I18N.t('phrase.auto') })
      return Object.freeze({ speed: _spValues, duplex: _dpValues })
    }
  },
  watch: {
    'baseModel.portid'() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    },
    'baseModel.c_speed'(v) {
      if (this.$refs.baseForm && this.editIndex === -1) {
        this.$refs.baseForm.validateField('portid')
      }
    },
    // 速率及双工的使能值变化联动赋值
    enableSpeedAndDuplex({ speed, duplex }) {
      let _isExistsp = speed.find(sp => sp.v === this.baseModel.c_speed)
      let _isExistdp = duplex.find(sp => sp.v === this.baseModel.c_duplex)
      if (!_isExistsp) {
        this.baseModel.c_speed = speed[0].v
      }
      if (!_isExistdp) {
        this.baseModel.c_duplex = duplex[0].v
      }
    }
  },
  methods: {
    // 加载port列表
    async _loadList() {
      try {
        let _result = await this.$api.cmd('devSta.get', { module: 'port_base' })
        let _list = _result.data
          .sort((a, b) => a.lpid - b.lpid)
          .map((port, index) => {
            return {
              ...port,
              ...this.portinfo.find(p => p.lpid === port.lpid)
            }
          })
          // 过滤逻辑口和具有成员口的聚合口
          .filter(port => {
            return isPhyPort(port.lpid) || hasLagmemberByLpid(port.lpid)
          })
        return Object.freeze(_list)
      } catch (error) {}
      return []
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = base()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.getItem(index)
      this.editIndex = index
      this.baseModalShow = true
      let _baseModel = {
        portid: [_item.lpid],
        c_flowcontrol: _item.c_flowcontrol,
        c_speed: _item.c_speed,
        enable: _item.enable,
        c_duplex: _item.c_duplex
      }
      this.baseModel = _baseModel
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let { portid, ...model } = this.baseModel
          let _confirmData = portid.map(p => {
            return {
              ...model,
              lpid: p
            }
          })
          try {
            let _hasUplink = await waitForActionIfHasUplink(
              portid,
              'msw.base.port_uplink_tip'
            )
            this.isLoading = true
            await this.$api.cmd(
              'devConfig.update',
              {
                module: 'port_base',
                data: { data: _confirmData }
              },
              { isSilence: true, timeout: 0 }
            )
            this.$message.success(I18N.t('tip.edit1_success'))
            this.baseModalShow = false
            this.refresh()
          } catch (error) {}
          this.isLoading = false
        }
      })
    },
    // 合并策略方法
    _spanMethods({ row, column, rowIndex, columnIndex }) {
      if (row.aggregate_port > 0) {
        if (columnIndex > 0) {
          if (columnIndex === 6) {
            return {
              rowspan: 1,
              colspan: 6
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


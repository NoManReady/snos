<template>
  <div class="home-poe" v-loading="isFirst">
    <!-- <help-alert title="POE端口设置"></help-alert> -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.poe.poe_global_info')}}</span>
      </div>
      <el-row :gutter="15">
        <el-col :md="6" :sm="8" :xs="12" class="mb10">
          <el-card class="tc min-height" shadow="never">
            <h2>{{$t('msw.poe.total_power')}}</h2>
            <p>
              <strong class="c-success fs22">{{_digitFilter(globalInfo.power_total)}}</strong>W
            </p>
          </el-card>
        </el-col>
        <el-col :md="6" :sm="8" :xs="12" class="mb10">
          <el-card class="tc min-height" shadow="never">
            <h2>{{$t('msw.poe.use_power')}}</h2>
            <p>
              <strong class="c-success fs22">{{_digitFilter(globalInfo.power_cons)}}</strong>W
            </p>
          </el-card>
        </el-col>
        <el-col :md="6" :sm="8" :xs="12" class="mb10">
          <el-card class="tc min-height" shadow="never">
            <h2>{{$t('msw.poe.retain_power')}}</h2>
            <p>
              <strong class="c-success fs22">{{_digitFilter(globalInfo.power_res)}}</strong>W
            </p>
          </el-card>
        </el-col>
        <el-col :md="6" :sm="8" :xs="12" class="mb10">
          <el-card class="tc min-height" shadow="never">
            <h2>{{$t('msw.poe.remain_power')}}</h2>
            <p>
              <strong class="c-success fs22">{{_digitFilter(globalInfo.power_remain)}}</strong>W
            </p>
          </el-card>
        </el-col>
        <el-col :md="6" :sm="8" :xs="12" class="mb10">
          <el-card class="tc min-height" shadow="never">
            <h2>{{$t('msw.poe.peak_power')}}</h2>
            <p>
              <strong class="c-success fs22">{{_digitFilter(globalInfo.power_peak)}}</strong>W
            </p>
          </el-card>
        </el-col>
        <el-col :md="6" :sm="8" :xs="12" class="mb10">
          <el-card class="tc min-height" shadow="never">
            <h2>{{$t('msw.poe.power_port')}}</h2>
            <p>
              <strong class="c-success fs22">{{globalInfo.power_ports}}</strong>
            </p>
          </el-card>
        </el-col>
        <!-- <el-col :md="6" :sm="8" :xs="12" class="mb10">
          <el-card class="tc min-height" shadow="never">
            <h2>工作情况</h2>
            <p>
              <strong class="c-danger fs22" v-show="globalInfo.machineFaultInfo===1">异常</strong>
              <strong class="c-success fs22" v-show="globalInfo.machineFaultInfo===0">正常</strong>
            </p>
          </el-card>
        </el-col>-->
      </el-row>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.poe.poe_global_cfg')}}</span>
      </div>
      <el-form :model="globalModel" :rules="globalRules" label-width="160px" ref="globalForm" size="medium">
        <el-form-item :label="$t('msw.poe.power_mode_f')" prop="mode">
          <el-select :placeholder="$t('msw.select')" class="w300" v-model="globalModel.mode">
            <el-option :label="$t('msw.poe.auto_mode')" :value="1"></el-option>
            <el-option :label="$t('msw.poe.energy_mode')" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('msw.poe.retain_power_f')" prop="reserve_power" v-if="globalModel.mode===2">
          <el-input :placeholder="$t('msw.range_digit',{range:'0-50%'})" class="w300" v-model.number="globalModel.reserve_power"></el-input>
          <span class="c-info">{{$t('msw.range_digit',{range:'0-50%'})}}</span>
        </el-form-item>
        <el-form-item :label="$t('msw.poe.poe_hot_f')" prop="ups" v-if="false">
          <el-switch :active-value="1" :inactive-value="0" v-model="globalModel.ups"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="isGlobalLoading"
            class="w160"
            size="medium"
            type="primary"
            v-auth="_onSaveConf"
          >{{isGlobalLoading?$t('action.editing'):$t('action.save_edit')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
          <el-button
            :disabled="isLoading"
            icon="el-icon-refresh"
            plain
            size="medium"
            type="primary"
            v-auth="_onFresh"
          >{{$t('action.refresh')}}</el-button>
          <el-button icon="el-icon-edit" plain size="medium" type="primary" v-auth="_onPatchEdit">{{$t('action.patch_edit')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe v-loading="isLoading">
        <el-table-column type="expand">
          <template slot-scope="{row}">
            <el-form class="view-form" inline label-position="left" size="medium">
              <el-row>
                <el-col :md="8" :sm="12" :xs="24">
                  <el-form-item :label="$t('msw.poe.cur_f')">
                    <span>{{ row.cur }}mA</span>
                  </el-form-item>
                </el-col>
                <el-col :md="8" :sm="12" :xs="24">
                  <el-form-item :label="$t('msw.poe.vol_f')">
                    <span>{{ row.volView }}V</span>
                  </el-form-item>
                </el-col>
                <el-col :md="8" :sm="12" :xs="24">
                  <el-form-item :label="$t('msw.poe.avg_power_f')">
                    <span>{{ row.power_avgView }}W</span>
                  </el-form-item>
                </el-col>
                <el-col :md="8" :sm="12" :xs="24">
                  <el-form-item :label="$t('msw.poe.rate_power_f')">
                    <span>{{ row.max_power===-1?$t('msw.poe.no_limit'):`${row.max_power}W` }}</span>
                  </el-form-item>
                </el-col>
                <el-col :md="8" :sm="12" :xs="24">
                  <el-form-item :label="$t('msw.poe.lldp_power_f')">
                    <span>{{ row.lldp_reqView }}W</span>
                  </el-form-item>
                </el-col>
                <el-col :md="8" :sm="12" :xs="24">
                  <el-form-item :label="$t('msw.poe.pse_power_f')">
                    <span>{{ row.lldp_allocView }}W</span>
                  </el-form-item>
                </el-col>
                <el-col :md="8" :sm="12" :xs="24">
                  <el-form-item :label="$t('msw.poe.pd_type_f')">
                    <span v-if="row.lldp_pdtype===1">type 1</span>
                    <span v-else-if="row.lldp_pdtype===2">type 2</span>
                    <span v-else>{{$t('msw.poe.no_pd_info')}}</span>
                  </el-form-item>
                </el-col>
                <el-col :md="8" :sm="12" :xs="24">
                  <el-form-item :label="$t('msw.poe.pd_class_f')">
                    <span v-if="row.pd_class===0">class0</span>
                    <span v-else-if="row.pd_class===1">class1</span>
                    <span v-else-if="row.pd_class===2">class2</span>
                    <span v-else-if="row.pd_class===3">class3</span>
                    <span v-else-if="row.pd_class===4">class4</span>
                    <span v-else-if="row.pd_class===6">NA</span>
                    <span v-else>NA</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.poe.poe_status')" align="center">
          <template slot-scope="{row}">
            <span v-if="row.enable===0">{{$t('phrase.disable')}}</span>
            <span v-if="row.enable===1">{{$t('phrase.enable')}}</span>
            <span class="c-danger" v-if="row.enable===2">{{$t('msw.poe.exception')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.poe.is_power_on')" align="center">
          <template slot-scope="{row}">
            <span v-if="row.power_on===0">{{$t('msw.poe.power_off')}}</span>
            <span class="c-ok" v-else>{{$t('msw.poe.power_on')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.poe.priority')" align="center" prop="priority">
          <template slot-scope="{row}">
            <span v-if="row.priority===1">{{$t('phrase.high')}}</span>
            <span v-if="row.priority===2">{{$t('phrase.middle')}}</span>
            <span v-if="row.priority===3">{{$t('phrase.low')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.poe.cur_power')" align="center" prop="power_curView"></el-table-column>
        <el-table-column :label="$t('msw.poe.non_standard')" align="center" prop="legacy">
          <template slot-scope="{row}">
            <span v-if="row.legacy===0">{{$t('phrase.no')}}</span>
            <span v-else>{{$t('phrase.yes')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.poe.run_status')" align="center" prop="off_reason">
          <template slot-scope="{row}">
            <template v-if="row.off_reason===0">
              <span class="c-info" v-if="row.power_on===0">{{$t('msw.poe.pd_disconnection')}}</span>
              <span class="c-ok" v-else>{{$t('msw.poe.normal')}}</span>
            </template>
            <span class="c-danger" v-else>{{reasonMap[row.off_reason]}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{row,$index}">
            <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}">{{$t('action.edit')}}</el-button>
            <el-button
              :disabled="row.power_on===0"
              size="medium"
              type="text"
              v-auth="{fn:_onReboot,params:row.lpid}"
            >{{$t('msw.poe.re_power')}}</el-button>
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
        v-show="pageTotal"
      ></el-pagination>
    </div>
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
        <el-form-item :label="$t('msw.poe.poe_function_f')" prop="enable">
          <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.enable">
            <el-option :label="$t('phrase.disable')" :value="0"></el-option>
            <el-option :label="$t('phrase.enable')" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('msw.poe.non_standard_f')" prop="legacy">
          <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.legacy">
            <el-option :label="$t('phrase.disable')" :value="0"></el-option>
            <el-option :label="$t('phrase.enable')" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('msw.poe.priority_f')" prop="priority">
          <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.priority">
            <el-option :label="$t('phrase.high')" :value="1"></el-option>
            <el-option :label="$t('phrase.middle')" :value="2"></el-option>
            <el-option :label="$t('phrase.low')" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('msw.poe.rate_power_f')" prop="max_power">
          <el-input :placeholder="$t('msw.poe.empty_no_limit')" class="w300" v-model.number="baseModel.max_power"></el-input>
          <span class="c-info">{{$t('msw.range_digit',{range:'0-30W'})}}</span>
        </el-form-item>
        <template v-if="editIndex===-1">
          <el-form-item :label="$t('msw.port_select_f')" class="inline-message" inline-message prop="portid"></el-form-item>
          <port-panel :disableds="disableIds" :selecteds.sync="baseModel.portid" :show-lag="false" mutilple />
        </template>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="baseModalShow = false" class="w120" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button
          :loading="isLoading"
          @click="_onModalConfirm"
          class="w120"
          size="medium"
          type="primary"
        >{{isLoading?$t('action.editing'):$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { Row, Col, Card } from 'element-ui'
import { port, global } from '@/model/msw/poe'
import { mapGetters } from 'vuex'
import { isBetween } from '@/utils/rulesUtils'
export default {
  name: 'home-poe',
  mixins: [pageMixins, formMixins],
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [Card.name]: Card,
    [PortPanel.name]: PortPanel
  },
  data() {
    const powerLimitValidator = (r, v, cb) => {
      if (!v) {
        return cb()
      }
      if (!/^\d+$/.test(v)) {
        return cb(new Error(I18N.t('msw.poe.input_int')))
      }
      if (!isBetween(v, ...this.powerLimitRange)) {
        return cb(
          new Error(
            I18N.t('msw.poe.power_limit_range', {
              range: `${this.powerLimitRange[0]}~${this.powerLimitRange[1]}`
            })
          )
        )
      }
      cb()
    }
    const globalPowerValidator = (r, v, cb) => {
      if (!/^\d+$/.test(v)) {
        return cb(new Error(I18N.t('msw.poe.input_int')))
      }
      if (!isBetween(v, ...this.globalPowerRange)) {
        return cb(
          new Error(
            I18N.t('msw.poe.retain_power_limit_range', {
              range: `${this.globalPowerRange[0]}~${this.globalPowerRange[1]}`
            })
          )
        )
      }
      cb()
    }
    return {
      isLoading: false,
      isGlobalLoading: false,
      globalInfo: {
        power_total: 0,
        power_res: 0,
        power_ports: 0,
        power_peak: 0,
        power_cons: 0,
        power_average: 0
      },
      baseModel: port(),
      baseRules: {
        portid: [{ required: true, message: I18N.t('msw.port_is_required') }],
        max_power: [{ validator: powerLimitValidator }]
      },
      globalModel: global(),
      globalRules: {
        reserve_power: [
          { required: true, message: I18N.t('msw.poe.retain_no_empty') },
          { validator: globalPowerValidator }
        ]
      },
      powerLimitRange: [0, 30],
      globalPowerRange: [0, 50],
      baseModalShow: false,
      editIndex: -1,
      isFirst: true,
      reasonMap: Object.freeze([
        I18N.t('msw.poe.normal'), //0
        I18N.t('msw.poe.power_err1'), //1
        I18N.t('msw.poe.power_err2'), //2
        I18N.t('msw.poe.power_err3'), //3
        I18N.t('msw.poe.power_err4'), //4
        I18N.t('msw.poe.power_err5'), //5
        I18N.t('msw.poe.power_err6'), //6
        I18N.t('msw.poe.power_err7') //7
      ])
    }
  },
  computed: {
    ...mapGetters('switcher', ['piMap']),
    modalTitle() {
      let _item = this.pageList[this.editIndex]
      return _item
        ? `${I18N.t('msw.port_f')}${_item.ifname}`
        : I18N.t('action.patch_edit')
    },
    disableIds() {
      return APP_CAPACITY_SW.port.port_list
        .filter(port => port.poe === 0)
        .map(port => port.lpid)
    }
  },
  watch: {
    'baseModel.portid'() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    }
  },
  methods: {
    // 刷新数据
    async _onFresh() {
      this.isLoading = true
      await this.refresh()
      this.isLoading = false
    },
    // 数值保留小数点处理
    _digitFilter(digit, divisor = 1000, num = 1) {
      let _diff = Math.pow(10, num)
      return parseInt((digit * _diff) / divisor) / _diff || 0
    },
    // 加载poe配置整合信息列表
    async _loadList() {
      try {
        let params = [
          { method: 'devSta.get', params: { module: 'poe' } },
          { method: 'devConfig.get', params: { module: 'poe_global' } },
          { method: 'devConfig.get', params: { module: 'poe_port' } }
        ]
        let [poeInfo, poeGlobalConfInfo, poePortConfInfo] = await this.$api.cmd(
          'cmdArr',
          { params },
          { isSilence: true }
        )
        let { data, ...globalViewInfo } = poeInfo
        this.globalInfo = Object.freeze(globalViewInfo)
        this.globalModel = poeGlobalConfInfo
        this.isFirst = false
        return poePortConfInfo.data.map(port => {
          let _info = data.find(d => d.lpid === port.lpid) || {}
          return {
            ..._info,
            ...port,
            ifname: this.piMap[port.lpid],
            volView: this._digitFilter(_info.vol),
            curView: this._digitFilter(_info.cur),
            power_curView: this._digitFilter(_info.power_cur),
            power_avgView: this._digitFilter(_info.power_avg),
            power_peakView: this._digitFilter(_info.power_peak),
            lldp_reqView: this._digitFilter(_info.lldp_req),
            lldp_allocView: this._digitFilter(_info.lldp_alloc)
          }
        })
      } catch (error) {
        this.isFirst = false
        return []
      }
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = port()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.pageList[index]
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = {
        ..._item,
        portid: [_item.lpid],
        max_power: _item.max_power === -1 ? '' : _item.max_power
      }
    },
    // poe重启
    async _onReboot(lpid) {
      let _lpids =
        lpid !== undefined
          ? [lpid]
          : this.$refs.baseTable.selection.map(s => s.lpid)
      if (!_lpids.length) {
        return this.$message.warning(I18N.t('msw.poe.select_repower_port'))
      }
      await this.$confirm(I18N.t('msw.poe.repower_confirm'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      try {
        await this.$api.cmd('devSta.set', {
          module: 'poe',
          data: { rebootList: _lpids }
        })
        await this.refresh()
        this.$message.success(I18N.t('msw.poe.repower_command_do'))
      } catch (error) {}
    },
    // 全局配置保存
    _onSaveConf() {
      this.$refs.globalForm.validate(async valid => {
        if (valid) {
          this.isGlobalLoading = true
          try {
            await this.$api.cmd('devConfig.update', {
              module: 'poe_global',
              data: this.globalModel
            })
            await this.refresh()
            this.$message.success(I18N.t('tip.edit_success'))
          } catch (error) {}
          this.isGlobalLoading = false
        }
      })
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          let _data = this.baseModel.portid.map(p => {
            return {
              lpid: p,
              enable: this.baseModel.enable,
              legacy: this.baseModel.legacy,
              max_power:
                this.baseModel.max_power === '' ? -1 : this.baseModel.max_power,
              priority: this.baseModel.priority,
              poe_off_timerange: this.baseModel.poe_off_timerange
            }
          })
          try {
            await this.$api.cmd('devConfig.update', {
              module: 'poe_port',
              data: {
                data: _data
              }
            })
            await this.refresh()
            this.$message.success(I18N.t('tip.edit_success'))
          } catch (error) {}
          this.baseModalShow = false
          this.isLoading = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.home-poe {
  .min-height {
    min-height: 104px;
  }
}
</style>



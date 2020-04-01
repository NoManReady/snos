<template>
  <div class="port-aggregation">
    <!-- <help-alert title="端口聚合">
      <div slot="content">配置交换机端口端口聚合</div>
    </help-alert>-->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.ap.global_cfg')}}</span>
      </div>
      <el-form label-width="160px" size="medium">
        <el-form-item :label="$t('msw.ap.flow_calc_f')">
          <el-select :placeholder="$t('msw.select')" class="w300" v-model="load_balance">
            <el-option :label="$t('msw.ap.source_mac')" :value="0"></el-option>
            <el-option :label="$t('msw.ap.source_ip')" :value="1"></el-option>
            <el-option :label="$t('msw.ap.source_l4_port')" :value="2"></el-option>
            <el-option :label="$t('msw.ap.source_port')" :value="3"></el-option>
            <el-option :label="$t('msw.ap.dest_mac')" :value="4"></el-option>
            <el-option :label="$t('msw.ap.dest_ip')" :value="5"></el-option>
            <el-option :label="$t('msw.ap.dest_l4_ip')" :value="6"></el-option>
            <el-option :label="$t('msw.ap.source_dest_mac')" :value="7"></el-option>
            <el-option :label="$t('msw.ap.source_dest_ip')" :value="8"></el-option>
            <el-option :label="$t('msw.ap.source_dest_l4_port')" :value="9"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoading===1" class="w160" type="primary" v-auth="_onSaveGlobalSetting">{{$t('action.save_edit')}}</el-button>
          <!-- <el-button :loading="isLoading===1" @click.native="_onSaveGlobalSettingDef" size="small" type="primary">恢复默认值</el-button> -->
        </el-form-item>
      </el-form>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.ap.ap_cfg')}}</span>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="msw.ap.ap_limit_tip">
            <b class="c-warning mlr5" place="n">{{lagMax}}</b>
            <b class="c-warning mlr5" place="m">{{lagMemberMax}}</b>
          </i18n>
        </div>
      </help-alert>
      <div class="card-box">
        <template v-if="aggList.length">
          <div class="card-box--bar">
            <el-checkbox
              :indeterminate="isIndeterminate"
              class="card-box--bar__checker"
              size="medium"
              v-model="checkAll"
            >{{$t('msw.ap.all_select')}}</el-checkbox>
          </div>
          <el-checkbox-group @change="_onCheckedChange" size="medium" v-model="checkList">
            <div
              :class="{active:editIndex===index}"
              :key="agg.aggregateport"
              @click="_onEdit(agg,index)"
              class="card-box--item pointer"
              v-for="(agg,index) in aggList"
            >
              <el-checkbox :label="agg.aggregateport" @click.native.stop class="card-box--item__checker"></el-checkbox>
              <span class="card-box--item__content">{{agg.ifname}}</span>
              <i @click.stop="_onPatchRemove(agg.aggregateport)" class="card-box--item__close el-icon-close"></i>
              <!-- <i @click="_onEdit(agg,index)" class="card-box--item__edit el-icon-setting"></i> -->
            </div>
            <el-button
              :disabled="checkList.length===0"
              :loading="isLoading===3"
              @click.native="_onPatchRemove()"
              icon="el-icon-delete"
              plain
              size="medium"
              type="primary"
            >{{$t('action.patch_delete')}}</el-button>
          </el-checkbox-group>
        </template>
        <div class="card-box--item" v-else>
          <span class="card-box--item__content">{{$t('msw.ap.empty_ap')}}</span>
        </div>
      </div>
      <div class="edit-box mt20">
        <el-form :model="baseModel" :rules="baseRules" class label-width="180px" ref="baseForm" size="medium">
          <el-form-item :label="$t('msw.ap.ap_name_f')" prop="aggregateport">
            <el-input
              :disabled="editIndex>-1"
              :placeholder="$t('msw.range_digit',{range:`1-${this.lagMax}`})"
              class="w300"
              v-model.number="baseModel.aggregateport"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('msw.ap.ap_port_f')" class="inline-message" prop="lpid" required />
          <port-panel :disableds="disabledPorts" :selecteds.sync="baseModel.lpid" mutilple />
          <el-form-item class="mt20">
            <el-button
              :loading="isLoading===2"
              class="w160"
              type="primary"
              v-auth="_onConfirm"
            >{{this.editIndex===-1?$t('action.save_edit'):(isLoading===2?$t('action.editing'):$t('action.edit1'))}}</el-button>
            <el-button @click="_onCancel" class="w160" v-show="this.editIndex!==-1">{{$t('action.cancel')}}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import { Checkbox, CheckboxGroup } from 'element-ui'
import PortPanel from '@/common/PortPanel'
import { intValidator } from '@/utils/rules'
import { isBetween } from '@/utils/rulesUtils'
import { getConnectStr } from '@/utils/utils'
import { judgePortAttrMutil } from '@/utils/lag'
import { aggregate } from '@/model/msw/port'
import { mapGetters, mapActions } from 'vuex'
import { awaitOnLine_plus } from '@/utils'
import { getLpidByAggid, hasContainUplink } from '@/utils/lag'
export default {
  name: 'port-aggregation',
  components: {
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
    [PortPanel.name]: PortPanel
  },
  data() {
    const aggValidator = (rule, value, cb) => {
      if (value === '') {
        return cb()
      }
      let _valid = isBetween(value, 1, this.lagMax)
      if (_valid) {
        let _curAggport =
          this.aggList[this.editIndex] &&
          this.aggList[this.editIndex].aggregateport
        if (value !== _curAggport && this.existAggIds.includes(value)) {
          return cb(I18N.t('msw.ap.ap_is_exist', { ap: value }))
        }
        return cb()
      } else {
        return cb(I18N.t('msw.ap.ap_is_invalid', { n: this.lagMax }))
      }
    }
    const portidValidator = (r, v, cb) => {
      if (v.length === 0) {
        return cb(I18N.t('msw.ap.apport_required'))
      }
      if (v.length > this.lagMemberMax) {
        return cb(I18N.t('msw.ap.ap_max_member', { n: this.lagMemberMax }))
      }

      let _attr = judgePortAttrMutil(v)

      if (_attr.mutilType) {
        return cb(I18N.t('msw.ap.ap_rule1'))
      }
      if (_attr.mutilSpeed) {
        return cb(I18N.t('msw.ap.ap_rule2'))
      }
      cb()
    }
    return {
      load_balance: 7,
      def_load_balance: 7,
      isLoading: 0, // 0:关闭，1:全局配置，2:更新，3:删除
      aggList: [],
      isIndeterminate: false,
      checkList: [],
      editIndex: -1,
      baseModel: aggregate(),
      baseRules: {
        aggregateport: [
          { required: true, message: I18N.t('msw.ap.ap_no_empty') },
          { validator: intValidator },
          { validator: aggValidator }
        ],
        lpid: [{ validator: portidValidator }]
      },
      lagMax: window.APP_CAPACITY_SW.port.aggregate_port.total,
      lagMemberMax: window.APP_CAPACITY_SW.port.aggregate_port.member_num
    }
  },
  computed: {
    ...mapGetters('switcher', ['lagPort', 'uplink']),
    // 是否勾选全部
    checkAll: {
      get() {
        return this.checkList.length === this.aggList.length
      },
      set(v) {
        this.checkList = v ? this.aggList.map(agg => agg.aggregateport) : []
        this.isIndeterminate = false
      }
    },
    // 已存在agg口
    existAggIds() {
      return this.aggList.map(agg => agg.aggregateport)
    },
    // 禁选portid
    disabledPorts() {
      let _aggPorts = this.aggList
        .filter((agg, i) => {
          return i !== this.editIndex
        })
        .reduce((ret, agg) => {
          ret.push(...agg.lpid)
          return ret
        }, [])
      return _aggPorts
    }
  },
  watch: {
    'baseModel.lpid'() {
      if (this.$refs.baseForm) {
        this.$nextTick(() => {
          this.$refs.baseForm.validateField('lpid')
        })
      }
    }
  },
  created() {
    this._getGlobalConfAndList()
  },
  methods: {
    ...mapActions('switcher', ['fetchPortinfo']),
    // 获取全局配置
    async _getGlobalConfAndList() {
      try {
        let params = [
          { method: 'devConfig.get', params: { module: 'load_balance' } },
          { method: 'devConfig.get', params: { module: 'aggregate_port' } }
        ]
        let [balance, aggList] = await this.$api.cmd(
          'cmdArr',
          { params },
          { noParse: false }
        )
        this.load_balance = balance.load_balance
        this.aggList = aggList.data
          .filter(ag => ag.lpid.length > 0)
          .map(lis => {
            let _port =
              this.lagPort.find(
                p => p.lpid === getLpidByAggid(lis.aggregateport)
              ) || {}
            return {
              ...lis,
              ifname: _port.ifname
            }
          })
      } catch (error) {}
    },
    // 保存全局配置
    async _onSaveGlobalSetting() {
      this.isLoading = 1
      try {
        await this.$api.cmd('devConfig.set', {
          module: 'load_balance',
          data: { load_balance: this.load_balance }
        })
        this.$message.success(I18N.t('tip.edit1_success'))
        this.def_load_balance = this.load_balance
      } catch (error) {}
      this.isLoading = 0
    },
    // 恢复全局配置默认值
    _onSaveGlobalSettingDef() {
      this.load_balance = this.def_load_balance
      this._onSaveGlobalSetting()
    },
    // 批量删除
    _onPatchRemove(aggId) {
      let _aggids = aggId ? [aggId] : this.checkList
      let _hasUplink = _aggids.find(agg => {
        return getLpidByAggid(agg) === this.uplink.lagid
      })
      let _tip = [I18N.t('msw.ap.ap_del_confirm', { ap: _aggids.join(',') })]
      if (_hasUplink) {
        _tip.unshift(I18N.t('msw.ap.ap_has_uplink'))
      }
      this.$confirm(_tip.join(''), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      }).then(() => {
        this._onPostRemoveAgg(_aggids)
      })
    },
    // 移除agg
    async _onPostRemoveAgg(ids) {
      this.isLoading = 3
      try {
        await this.$api.cmd('devConfig.del', {
          module: 'aggregate_port',
          data: {
            del_ap: ids
          }
        })
        ids.forEach(id => {
          this.aggList = this.aggList.filter(agg => agg.aggregateport !== id)
        })
        await this.fetchPortinfo()
      } catch (error) {}
      this._onReset()
      this.isLoading = 0
    },
    // check change事件
    _onCheckedChange(value) {
      let checkedCount = value.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.aggList.length
    },
    // 重置状态
    _onReset() {
      this.editIndex = -1
      this.checkAll = false
      this.$refs.baseForm.resetFields()
    },
    // 编辑agg
    _onEdit(item, index) {
      if (this.editIndex === index) {
        this._onReset()
        return
      }
      this.editIndex = index
      let _baseModel = { ...item }
      this.baseModel = _baseModel
    },
    // confirm
    _onConfirm() {
      let _isEdit = this.editIndex !== -1
      if (!_isEdit && this.aggList.length === this.lagMax) {
        this.$alert(I18N.t('msw.ap.cfg_over_limit'), { type: 'warning' })
        return
      }
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          // 移除上联口时提示
          // 编辑态并且当前编辑的是上联聚合口
          if (
            _isEdit &&
            getLpidByAggid(this.baseModel.aggregateport) === this.uplink.lagid
          ) {
            // 原先有，编辑后没有包含说明移除上联口
            let _hasUplink = hasContainUplink(this.baseModel.lpid)
            if (!_hasUplink) {
              await this.$confirm(
                I18N.t('msw.ap.remove_uplink', {
                  ap: this.baseModel.aggregateport
                }),
                {
                  confirmButtonText: I18N.t('action.confirm'),
                  cancelButtonText: I18N.t('action.cancel'),
                  type: 'warning'
                }
              )
            }
          }
          this.isLoading = 2
          // 添加ifname，名称前缀lag
          let _postData = {
            aggregateport: this.baseModel.aggregateport,
            lpid: [...this.baseModel.lpid]
          }
          let _promise1 = this.$api.cmd(
            'devConfig.update',
            {
              module: 'aggregate_port',
              data: {
                data: [_postData]
              }
            },
            { timeout: 0 }
          )
          let _promise2 = Promise.race([
            awaitOnLine_plus({
              time: 20000,
              text: 0,
              maxTry: 2
            }),
            _promise1
          ])
          _promise2
            .then(async () => {
              let _aggItem = {
                ..._postData,
                ifname: _isEdit
                  ? this.baseModel.ifname
                  : `Ag${this.baseModel.aggregateport}`
              }
              if (!_isEdit) {
                this.aggList.push(_aggItem)
              } else {
                this.aggList.splice(this.editIndex, 1, _aggItem)
              }
              this.$message.success(I18N.t('tip.edit1_success'))
              await this.fetchPortinfo()
              this._onReset()
            })
            .finally(() => {
              this.isLoading = 0
            })
        }
      })
    },
    // 取消
    _onCancel() {
      this._onReset()
    }
  }
}
</script>

<template>
  <div class="port-aggregation">
    <help-alert title="端口聚合">
      <!-- <div slot="content">配置交换机端口端口聚合</div> -->
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">全局配置</span>
      </div>
      <el-form label-width="160px" size="small">
        <el-form-item label="流量平衡算法：">
          <el-select class="w200" placeholder="请选择" v-model="load_balance">
            <el-option :value="0" label="源MAC"></el-option>
            <el-option :value="1" label="源IP"></el-option>
            <el-option :value="2" label="源L4端口"></el-option>
            <el-option :value="3" label="源端口"></el-option>
            <el-option :value="4" label="目的MAC"></el-option>
            <el-option :value="5" label="目的IP"></el-option>
            <el-option :value="6" label="目的L4端口"></el-option>
            <el-option :value="7" label="源MAC和目的MAC"></el-option>
            <el-option :value="8" label="源IP和目的IP"></el-option>
            <el-option :value="9" label="源L4端口和目的L4端口"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoading===1" size="small" type="primary" v-auth="_onSaveGlobalSetting">保存配置</el-button>
          <!-- <el-button :loading="isLoading===1" @click.native="_onSaveGlobalSettingDef" size="small" type="primary">恢复默认值</el-button> -->
        </el-form-item>
      </el-form>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">聚合口设置</span>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{lagMax}}</b>
          个聚合口，每个聚合成员不超过
          <b class="c-warning mlr5">{{lagMemberMax}}</b>个。
        </div>
      </help-alert>
      <div class="card-box">
        <template v-if="aggList.length">
          <div class="card-box--bar">
            <el-checkbox :indeterminate="isIndeterminate" class="card-box--bar__checker" v-model="checkAll">全选</el-checkbox>
          </div>
          <el-checkbox-group @change="_onCheckedChange" v-model="checkList">
            <div
              :class="{active:editIndex===index}"
              :key="agg.aggregateport"
              @click="_onEdit(agg,index)"
              class="card-box--item pointer"
              v-for="(agg,index) in aggList"
            >
              <el-checkbox :label="agg.aggregateport" @click.native.stop class="card-box--item__checker"></el-checkbox>
              <span class="card-box--item__content">{{agg.interface}}</span>
              <i @click.stop="_onPatchRemove(agg.aggregateport)" class="card-box--item__close el-icon-close"></i>
              <!-- <i @click="_onEdit(agg,index)" class="card-box--item__edit el-icon-setting"></i> -->
            </div>
            <el-button
              :disabled="checkList.length===0"
              :loading="isLoading===3"
              @click.native="_onPatchRemove()"
              icon="el-icon-delete"
              size="small"
              type="danger"
            >批量删除</el-button>
          </el-checkbox-group>
        </template>
        <div class="card-box--item" v-else>
          <span class="card-box--item__content">无聚合口</span>
        </div>
      </div>
      <div class="edit-box mt20">
        <el-form :model="baseModel" :rules="baseRules" class label-width="180px" ref="baseForm" size="small">
          <el-form-item label="聚合端口号：" prop="aggregateport">
            <el-input
              :disabled="editIndex>-1"
              :placeholder="`范围：（1~${this.lagMemberMax}）`"
              class="w200"
              v-model.number="baseModel.aggregateport"
            ></el-input>
          </el-form-item>
          <el-form-item required class="inline-message" label="选择端口加入聚合口：" prop="lpid" />
          <port-panel :disableds="disabledPorts" :selecteds.sync="baseModel.lpid" mutilple />
        </el-form>
        <div class="tc edit-box--footer">
          <el-button
            :loading="isLoading===2"
            size="small"
            type="primary"
            v-auth="_onConfirm"
          >{{this.editIndex===-1?'保存配置':'编辑配置'}}</el-button>
          <el-button @click="_onCancel" size="small">取 消</el-button>
        </div>
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
      let _valid = isBetween(value, 1, 8)
      if (_valid) {
        let _curAggport =
          this.aggList[this.editIndex] &&
          this.aggList[this.editIndex].aggregateport
        if (value !== _curAggport && this.existAggIds.includes(value)) {
          return cb(`聚合口${value}已存在`)
        }
        return cb()
      } else {
        return cb(`请输入有效的数值（范围1~${this.lagMemberMax}）`)
      }
    }
    const portidValidator = (r, v, cb) => {
      if (v.length === 0) {
        return cb(`请选择需要聚合的端口`)
      }
      if (v.length > 8) {
        return cb(`一个聚合口最多${this.lagMemberMax}个端口成员`)
      }

      let _attr = judgePortAttrMutil(v)

      if (_attr.mutil) {
        return cb(
          `聚合端口属性必须一致（电口、光口、光电复用口不可以组合配置）`
        )
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
          { required: true, message: '请输入聚合口号' },
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
                p => p.interface === `lag${lis.aggregateport}`
              ) || {}
            return {
              ...lis,
              interface: _port.interface
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
        this.$message.success('配置成功')
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
        return `lag${agg}` === this.uplink.interface
      })
      let _tip = [`是否确认删除聚合口${_aggids.join(',')}？`]
      if (_hasUplink) {
        _tip.unshift(`删除的聚合口中包含上联口，删除可能导致WEB无法访问，`)
      }
      this.$confirm(_tip.join(''), {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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
        this.fetchPortinfo()
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
        this.$alert('已配置最大容量', { type: 'warning' })
        return
      }
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          // 移除上联口时提示
          if (
            _isEdit &&
            `lag${this.baseModel.aggregateport}` === this.uplink.interface
          ) {
            let _hasUplinkId = false
            for (let _id of this.baseModel.lpid) {
              if (this.uplink.lpid.includes(_id)) {
                _hasUplinkId = true
                break
              }
            }
            if (!_hasUplinkId) {
              await this.$confirm(
                `将上联口移出聚合口${this.baseModel.aggregateport}，可能导致WEB访问不了`,
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }
              )
            }
          }
          this.isLoading = 2
          let _aggItem = {
            aggregateport: this.baseModel.aggregateport,
            lpid: [...this.baseModel.lpid],
            interface: _isEdit
              ? this.baseModel.interface
              : `lag${this.baseModel.aggregateport}`
          }
          let _promise1 = this.$api.cmd(
            'devConfig.update',
            {
              module: 'aggregate_port',
              data: {
                data: [_aggItem]
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
            .then(() => {
              if (!_isEdit) {
                this.aggList.push(_aggItem)
              } else {
                this.aggList.splice(this.editIndex, 1, _aggItem)
              }
              this.$message.success('配置成功')
              this._onReset()
              this.fetchPortinfo()
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
<style lang="scss" scoped>
.port-aggregation {
}
</style>

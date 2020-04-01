<template>
  <div class="vpn-l2tp-tunnel">
    <help-alert :title="$t('egw.pppoe.except_ip')" json-key="pppoeExceptipJson"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.pppoe.except_ip_list')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="list.length>=MAX_NUM||isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="_onAdd"
          >{{$t('action.add')}}</el-button>
          <el-button
            :disabled="isLoading"
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="_onDel"
          >{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <div class="box-content">
        <help-alert :show-icon="false" title>
          <div slot="content">
            <i18n path="egw.limit_num_tip">
              <b class="c-warning mlr5">{{MAX_NUM}}</b>
            </i18n>
          </div>
        </help-alert>
        <el-table :data="list" ref="baseTable" size="medium" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column :label="$t('egw.pppoe.start_ip_address')" align="center" prop="start_ip"></el-table-column>
          <el-table-column :label="$t('egw.pppoe.end_ip_address')" align="center" prop="end_ip"></el-table-column>
          <el-table-column :label="$t('phrase.remark')" align="center" prop="note"></el-table-column>
          <el-table-column :label="$t('phrase.status')" align="center" prop="state">
            <template slot-scope="scope">{{scope.row.state==='1'?$t('phrase.enable'):$t('phrase.disable')}}</template>
          </el-table-column>
          <el-table-column :label="$t('action.ope')" align="center">
            <template slot-scope="scope">
              <el-button
                :disabled="isLoading"
                size="medium"
                type="text"
                v-auth="{fn:_onEdit,params:scope.$index}"
              >{{$t('action.edit')}}</el-button>
              <el-button
                :disabled="isLoading"
                size="medium"
                type="text"
                v-auth="{fn:_onDel,params:scope.row}"
              >{{$t('action.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="500px">
      <el-form :model="baseModel" :rules="baseRules" :validate-on-rule-change="false" label-width="120px" ref="baseForm">
        <el-form-item :label="$t('egw.pppoe.start_ip_address')" prop="start_ip">
          <el-input class="w300" v-model="baseModel.start_ip"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.pppoe.end_ip_address')" prop="end_ip">
          <el-input class="w300" v-model="baseModel.end_ip"></el-input>
        </el-form-item>
        <el-form-item :label="$t('phrase.remark')" prop="note">
          <el-input class="w300" v-model="baseModel.note"></el-input>
        </el-form-item>
        <el-form-item :label="$t('phrase.status')" prop="state">
          <el-switch active-value="1" inactive-value="0" v-model="baseModel.state"></el-switch>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="baseModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button @click="_onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import modelFn from '@/model'
import { ipValidator } from '@/utils/rules'
import { ipToLong, isIp } from '@/utils/rulesUtils'
import { isExistIpRange } from '@/utils/commonValidates'
export default {
  name: 'pppoe-ipctrl',
  data() {
    const _ipCompare = (rule, val, cb) => {
      if (val === '') {
        cb()
      }
      if (isIp(this.baseModel.start_ip) && isIp(this.baseModel.end_ip)) {
        if (
          ipToLong(this.baseModel.start_ip) > ipToLong(this.baseModel.end_ip)
        ) {
          cb(new Error(rule.message || this.$t('egw.error_data')))
        }
      }
      cb()
    }
    const sameIpRangeValid = (rule, val, cb) => {
      if (isExistIpRange(val, this.editIndex, this.ipRangeList)) {
        return cb(new Error(I18N.t('egw.pool.addr_range_is_has')))
      }
      cb()
    }
    return {
      list: [],
      MAX_NUM: 5,
      isLoading: false,
      baseModel: modelFn.pppoeExceptipFn(),
      editIndex: -1,
      baseModalShow: false,
      baseRules: {
        start_ip: [
          {
            required: true,
            message: this.$t('egw.ipconn.ip_start_is_required')
          },
          { validator: ipValidator },
          {
            validator: _ipCompare,
            message: this.$t('egw.ipconn.ip_start_less_then_ip_end')
          },
          { validator: sameIpRangeValid }
        ],
        end_ip: [
          { required: true, message: this.$t('egw.ipconn.ip_end_is_required') },
          { validator: ipValidator },
          {
            validator: _ipCompare,
            message: this.$t('egw.ipconn.ip_end_more_then_ip_start')
          },
          { validator: sameIpRangeValid }
        ]
      }
    }
  },
  created() {
    this._initPage()
  },
  computed: {
    isAddIpctrl() {
      return this.editIndex === -1
    },
    modalTitle() {
      return this.isAddIpctrl ? I18N.t('action.add') : I18N.t('action.edit')
    },
    ipRangeList() {
      return this.list.map(o => o.start_ip + '-' + o.end_ip)
    }
  },
  methods: {
    async _initPage() {
      let _res = await this.$api.getPppoeExceptip()
      this.list = _res.list || []
    },
    // 清除验证信息
    _clearValidate() {
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    // 添加
    _onAdd() {
      this.baseModel = modelFn.pppoeExceptipFn()
      this.editIndex = -1
      this.baseModalShow = true
      this._clearValidate()
    },
    // 编辑
    _onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index
      this.baseModel = { ...this.list[index] }
      this._clearValidate()
    },
    // 删除
    _onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert(I18N.t('tip.select_del_item'), {
          type: 'warning'
        })
        return
      }
      this.$confirm(I18N.t('tip.confirm_delete'), I18N.t('phrase.tip'), {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        let delList = []
        _items.forEach(ite => {
          let _index = this.list.findIndex(d => d === ite)
          delList.push({
            start_ip: this.list[_index].start_ip,
            end_ip: this.list[_index].end_ip
          })
        })
        this.$api
          .delPppoeExceptip({ list: delList })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.list.findIndex(d => d === ite)
              this.list.splice(_index, 1)
            })
            this.$message({
              message: I18N.t('tip.del_success'),
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // 提交数据
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    _onSubmit() {
      if (
        JSON.stringify(this.baseModel) ===
        JSON.stringify(this.list[this.editIndex])
      ) {
        this.baseModalShow = false
        return
      }
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _ipctrlData = {}
      if (this.isAddIpctrl) {
        _ipctrlData = { ...this.baseModel }
      } else {
        let _old = this.list[this.editIndex]
        _ipctrlData = {
          new: { ...this.baseModel },
          old: { start_ip: _old.start_ip, end_ip: _old.end_ip }
        }
      }
      this.$api
        .setPppoeExceptip(_ipctrlData, this.isAddIpctrl)
        .then(d => {
          if (this.isAddIpctrl) {
            this.list.push(_ipctrlData)
          } else {
            this.list.splice(this.editIndex, 1, _ipctrlData.new)
          }
          this.$message({
            message: I18N.t('tip.edit1_success'),
            type: 'success'
          })
        })
        .finally(() => {
          this.baseModalShow = false
          setTimeout(() => {
            this.isLoading = false
          }, 300)
        })
    }
  }
}
</script>

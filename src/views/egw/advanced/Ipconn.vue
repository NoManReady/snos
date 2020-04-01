<template>
  <div class="component_ipconn">
    <help-alert json-key="ipConnJson" :title="$t('egw.ipconn.ip_connections_limit')">
      <div slot="content">{{$t('egw.ipconn.ip_session_connections')}}</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.ipconn.connections_rule_tab')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="{fn:onEdit,params:-1}">{{$t('action.add')}}</el-button>
          <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDel">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
         <div slot="content">
          <i18n path="egw.limit_num_tip">
              <b class="c-warning mlr5">{{MAX_NUM}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="ipconnList" ref="multipleTable" size="medium" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" :label="$t('egw.nat.rule_name')" prop="information"></el-table-column>
        <el-table-column align="center" :label="$t('egw.ip_limit')" width="200">
          <template slot-scope="scope">{{scope.row.ipStart}}-{{scope.row.ipEnd}}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('egw.ipconn.connections_bigest')" prop="connlimit"></el-table-column>
        <el-table-column align="center" :label="$t('phrase.status')" prop="status">
          <template slot-scope="scope">
            <div @click="toggleStatus(scope.row,scope.$index)" class="toggle-status pointer">
              <span class="c-success" v-if="scope.row.status==='on'" :title="$t('egw.close_by_click')">
                {{$t('phrase.enable')}}
                <i class="el-icon-circle-check"></i>
              </span>
              <span class="c-danger" v-else :title="$t('egw.open_by_click')">
                {{$t('phrase.disable')}}
                <i class="el-icon-remove"></i>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action.ope')" width="140">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index, scope.row)" size="medium" type="text">{{$t('action.edit')}}</el-button>
            <el-button @click.native="onDel(scope.row)" size="medium" type="text">{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑 -->
      <el-dialog
        :inline="true"
        :model="baseModel"
        :title="modalTitle"
        :visible.sync="isModalShow"
        class="form-inline"
        width="600px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('egw.nat.rule_name')" prop="information">
            <el-input class="w300" v-model="baseModel.information"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.ip_start')" prop="ipStart">
            <el-input @change="onValidateField('ipEnd')" class="w300" placeholder="192.168.1.0" v-model="baseModel.ipStart"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.ip_end')" prop="ipEnd">
            <el-input @change="onValidateField('ipStart')" class="w300" placeholder="192.168.1.234" v-model="baseModel.ipEnd"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.ipconn.connections_bigest')" prop="connlimit">
            <el-input class="w300" placeholder="50-20000" v-model="baseModel.connlimit"></el-input>
          </el-form-item>
          <el-form-item :label="$t('phrase.status')" prop="status">
            <el-switch active-value="on" inactive-value="off" v-model="baseModel.status"></el-switch>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button @click="onSubmitForm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import formMixins from '@/mixins/formMixins'
import { ipValidator, intValidator, quoteValidator } from '@/utils/rules'
import { isBetween, ipToLong, isIp } from '@/utils/rulesUtils'
export default {
  name: 'AdvancedIpconn',
  data() {
    const _ipCompare = (rule, val, cb) => {
      if (val === '') {
        cb()
      }
      if (isIp(this.baseModel.ipStart) && isIp(this.baseModel.ipEnd)) {
        if (ipToLong(this.baseModel.ipStart) > ipToLong(this.baseModel.ipEnd)) {
          cb(new Error(rule.message || this.$t('egw.error_data')))
        }
      }
      cb()
    }
    const _rangeValidator = (rule, val, cb) => {
      if (val === '') {
        cb()
      }
      if (!isBetween(val, 50, 20000)) {
        cb(new Error(this.$t('egw.ipconn.connections_num_tip')))
      }
      cb()
    }
    const _sameNameValidate = (r, v, cb) => {
      if (v === '') {
        cb()
      }
      let _info = ''
      if (this.editIndex > -1) {
        _info = this.ipconnList[this.editIndex].information
      }
      if (v !== _info && this.nameMap[v]) {
        return cb(new Error(this.$t('egw.rule_name_is_duplication')))
      }
      cb()
    }
    return {
      MAX_NUM: 20,
      editIndex: -1,
      ipconnList: [],
      isModalShow: false,
      baseModel: this._defaultModel(),
      baseRules: {
        ipStart: [
          { required: true, message: this.$t('egw.ipconn.ip_start_is_required') },
          { validator: ipValidator },
          { validator: _ipCompare, message: this.$t('egw.ipconn.ip_start_less_then_ip_end') }
        ],
        ipEnd: [
          { required: true, message: this.$t('egw.ipconn.ip_end_is_required') },
          { validator: ipValidator },
          { validator: _ipCompare, message: this.$t('egw.ipconn.ip_end_more_then_ip_start') }
        ],
        connlimit: [
          { required: true, message: this.$t('egw.ipconn.connections_bigest_is_required') },
          { validator: intValidator, message: this.$t('egw.enter_positive_integer') },
          { validator: _rangeValidator }
        ],
        information: [
          { required: true, message: this.$t('egw.enter_rule_name') },
          { range: true, min: 1, max: 28, message: this.$t('egw.rule_name_length_tip') },
          { validator: _sameNameValidate },
          { validator: quoteValidator }
        ]
      }
    }
  },
  mixins: [formMixins],
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? this.$t('action.add') : this.$t('action.edit1')
    },
    nameMap() {
      let map = {}
      this.ipconnList.forEach(d => (map[d.information] = true))
      return map
    }
  },
  created() {
    this._loadList()
  },
  methods: {
    _defaultModel() {
      return {
        ipStart: '',
        connlimit: '1000',
        status: 'off',
        ipEnd: '',
        information: ''
      }
    },
    async _loadList() {
      let _result = await this.$api.getIpConn()
      this.ipconnList = _result.list.reverse() // 先匹配的放上面
    },
    // 添加/编辑连接数规则
    onEdit(index, item = this._defaultModel()) {
      this.editIndex = index
      if (this.editIndex === -1 && this.ipconnList.length >= this.MAX_NUM) {
        return this.$message.warning(
          this.$t('egw.limit_num_tip3',{num: this.MAX_NUM})
        )
      }
      this.isModalShow = true
      this.baseModel = Object.assign({ connlimit: '1000' }, item)
      this._clearValidate()
    },
    // 删除连接数规则
    onDel(item) {
      let informationArr = []
      if (item) {
        informationArr = [item.information]
      } else {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning(this.$t('tip.select_del_item'))
        }
        informationArr = selection.map(item => item.information)
      }
      this.$confirm(this.$t('tip.confirm_delete')).then(() => {
        this.$api.delIpConn(informationArr).then(() => {
          informationArr.forEach(item => {
            let _index = this.ipconnList.findIndex(
              ({ information }) => information === item
            )
            this.ipconnList.splice(_index, 1)
          })
          this.$message({
            message: this.$t('tip.del_success'),
            type: 'success'
          })
        })
      })
    },
    // 编辑连接数规则确认
    onSubmitForm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _promise = null
          let _list = [this.baseModel]
          // 编辑
          if (this.editIndex > -1) {
            _promise = this.$api
              .updateIpConn({
                new: this.baseModel,
                old: this.ipconnList[this.editIndex]
              })
              .then(() => {
                this.ipconnList.splice(this.editIndex, 1, this.baseModel)
              })
          } else {
            _promise = this.$api.addIpConn(_list).then(() => {
              this.ipconnList.unshift(this.baseModel)
            })
          }
          _promise
            .then(d => {
              this.$message({
                message: this.$t('tip.edit1_success'),
                type: 'success'
              })
            })
            .finally(() => {
              this.isModalShow = false
            })
        }
      })
    },
    // 切换状态
    toggleStatus(item, index) {
      let _update = Object.assign({}, item, {
        status: item.status === 'on' ? 'off' : 'on'
      })
      this.$api.updateIpConn({ new: _update, old: item }).then(() => {
        this.ipconnList.splice(index, 1, _update)
      })
    },
    // 验证字段
    onValidateField(field) {
      this.$refs.baseForm.validateField(field)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

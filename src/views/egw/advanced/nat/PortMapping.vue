<template>
  <div class="advanced-nat">
    <help-alert json-key="natJson" :title="$t('egw.nat.portmap')"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.nat.portmap_tab')}}
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
      <el-table :data="pageList" ref="multipleTable" row-key="`${ruleName}_${destPort}`" size="medium" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" :label="$t('egw.nat.rule_name')" prop="ruleName"></el-table-column>
        <el-table-column align="center" :label="$t('egw.nat.service_agreement')" prop="proto">
          <template slot-scope="scope">{{scope.row.proto.toUpperCase()}}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('egw.nat.external_server_ip')" prop="srcIp"></el-table-column>
        <el-table-column align="center" :label="$t('egw.nat.external_port')" prop="srcPort"></el-table-column>
        <el-table-column align="center" :label="$t('egw.nat.inside_service_ip')" prop="destIp"></el-table-column>
        <el-table-column align="center" :label="$t('egw.nat.inside_port')" prop="destPort"></el-table-column>
        <el-table-column align="center" :label="$t('action.ope')">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index, scope.row)" size="medium" type="text">{{$t('action.edit')}}</el-button>
            <el-button @click.native="onDel([scope.row.ruleName])" size="medium" type="text">{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.pageIndex"
        :page-size="pageModel.pageSize"
        :page-sizes="[5, 10, 20]"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="_onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>

      <!-- 编辑对话框 -->
      <el-dialog :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="500px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('egw.nat.rule_name')" prop="ruleName">
            <el-input class="w260" v-model="baseModel.ruleName"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.nat.service_agreement')" prop="proto">
            <el-select @change="onProtoChange" class="w260" v-model="baseModel.proto">
              <el-option label="UDP" value="udp"></el-option>
              <el-option label="TCP" value="tcp"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('egw.nat.external_server_ip')" prop="srcIp">
            <arp-input
              :dataSource="wanArr"
              @input="_onValidateField('srcPort')"
              class="w260"
              :placeholder="$t('egw.nat.default_inter_ip')"
              v-model="baseModel.srcIp"
            ></arp-input>
          </el-form-item>
          <el-form-item :label="$t('egw.nat.external_port_limit')" prop="srcPort">
            <el-input @input="onInputSrcPort" class="w260" :placeholder="$t('egw.nat.external_port_limit_tip')" v-model="baseModel.srcPort"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.nat.inside_service_ip')" prop="destIp">
            <arp-input
              @input="_onValidateField('srcPort')"
              class="w260"
              filterType="LAN"
              :placeholder="$t('egw.nat.enter_ip_or_by_arp')"
              v-model="baseModel.destIp"
            ></arp-input>
          </el-form-item>
          <el-form-item :label="$t('egw.nat.inside_port_limit')" prop="destPort">
            <el-input
              :disabled="rangePort"
              :title="rangePort ? $t('egw.nat.same_port_range_reson') : ''"
              class="w260"
              :placeholder="$t('egw.nat.external_port_limit_tip')"
              v-model="baseModel.destPort"
            ></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button @click="onSubmitForm()" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { ipValidator } from '@/utils/rules'
import {
  isIp,
  isNetSeg,
  isBetween,
  isPortRange,
  intValidate
} from '@/utils/rulesUtils'
import { isIpInNet } from '@/utils/commonValidates'
import pageMixins from '@/mixins/pageMixins'
import formMixins from '@/mixins/formMixins'
import ArpInput from '@/common/ArpInput'
import model from '@/model'

export default {
  name: 'AdvancedPortMapping',
  data() {
    const isIporNetSeg = (rule, val, cb) => {
      if (!!val && !isIp(val) && !isNetSeg(val)) {
        return cb(new Error(this.$t('egw.enter_valid_ip_or_network')))
      }
      cb()
    }
    const isInWanIpNet = (rule, val, cb) => {
      if (val === '') {
        return cb()
      }
      if (this.netList.length === 0) {
        return cb(new Error(this.$t('egw.nat.empty_config_with_no_ip')))
      }
      if (!isIpInNet(val, this.netList)) {
        return cb(new Error(this.$t('egw.nat.external_wan_ip_diffrent_network')))
      }
      // if (/\.1$/.test(val)) {
      //   return cb(new Error('请勿配置.1地址防止与网关冲突'))
      // }
      cb()
    }
    const _isExit = (key, val) => {
      return this.pageModel.allItem.find(item => item[key] === val)
    }
    const nameValidator = (rule, val, cb) => {
      if (val === '') {
        cb()
      }
      let _name = ''
      if (this.editIndex > -1) {
        _name = this.pageList[this.editIndex].ruleName
      }
      if (val !== _name && _isExit('ruleName', val)) {
        cb(new Error(this.$t('egw.nat.rule_is_has',{val:val})))
      }
      cb()
    }
    const isLegalPort = (r, v, cb) => {
      if (!v.includes('-')) {
        //  单个端口号
        if (!intValidate(v)) {
          return cb(new Error(this.$t('egw.enter_positive_integer')))
        }
        //  单个端口号
        if (!isBetween(v, 1, 65535)) {
          return cb(new Error(this.$t('egw.port_limit_tip')))
        }
      } else {
        // 端口号范围
        if (!isPortRange(v)) {
          return cb(new Error(this.$t('egw.nat.port_limit_type')))
        }
        let sPort = v.split(/\s*-\s*/)[0]
        let ePort = v.split(/\s*-\s*/)[1]
        if (+sPort > +ePort) {
          return cb(new Error(this.$t('egw.nat.end_ip_mare_then_start_ip_is_required')))
        }
      }
      cb()
    }
    const isMergerPort = (r, v, cb) => {
      const _getPostNum = p => {
        if (p.includes('-')) {
          let sPort = p.split(/\s*-\s*/)[0] || 0
          let ePort = p.split(/\s*-\s*/)[1] || 0
          return +ePort - sPort
        }
        return 200
      }
      let _key = r.portKey || 'srcPort'
      if (_getPostNum(v) !== _getPostNum(this.baseModel[_key])) {
        return cb(new Error(this.$t('egw.nat.external_wan_port_diffrent_number')))
      }
      cb()
    }
    const natRepeat = (rule, val, cb) => {
      // 判断两个端口范围是否存在交集
      const _hasCovertPort = (port1, port2) => {
        const _getRange = v => {
          if (!v.includes('-')) {
            return [+v, +v]
          }
          let _tv = v.replace(/\s+/, '').split('-')
          return [+_tv[0], +_tv[1]]
        }
        let _this = _getRange(port1)
        let _other = _getRange(port2)
        return !(_this[0] > _other[1] || _this[1] < _other[0])
      }
      const _isExitPort = item => {
        let model = this.baseModel
        return _hasCovertPort(model.srcPort, item.srcPort)
      }
      const _isCurItem = item => {
        let edit = this.editData
        if (this.editIndex === -1) {
          return false
        }
        let _editData = this.pageList[this.editIndex]
        return (
          _editData.srcPort === item.srcPort &&
          _editData.srcIp === item.srcIp &&
          _editData.proto === item.proto
        )
      }
      const _isSameProto = item => {
        return item.proto === this.baseModel.proto
      }
      const _isSameIp = item => {
        // 空IP表示外网IP地址
        let model = this.baseModel
        if (item.srcIp === model.srcIp) {
          return true
        } else if (item.srcIp === '') {
          return this.wanIp.includes(model.srcIp)
        } else if (model.srcIp === '') {
          return this.wanIp.includes(item.srcIp)
        }
        return false
      }
      let _item = this.pageModel.allItem.find(item => {
        if (_isSameProto(item) && _isSameIp(item)) {
          // 外部服务器IP相同时检测端口是否已配置过
          return !_isCurItem(item) && _isExitPort(item)
        }
      })
      if (_item) {
        cb(
          new Error(
            `${_item.proto.toLocaleUpperCase()}` + this.$t('egw.nat.portmap_is_edit') + `（${_item.srcIp ||
              this.$t('egw.nat.external_port_ip')}:${_item.srcPort}）`
          )
        )
      }
      cb()
    }

    return {
      MAX_NUM: 50,
      editIndex: -1,
      baseModel: model.pmFn(),
      wanIp: [],
      netList: [],
      wanArr: [],
      isModalShow: false,
      rangePort: false,
      baseRules: {
        ruleName: [
          { required: true, message: this.$t('egw.enter_rule_name') },
          { range: true, min: 1, max: 28, message: this.$t('egw.rule_name_length_tip') },
          { validator: nameValidator }
        ],
        srcIp: [
          { validator: isIporNetSeg },
          { validator: isInWanIpNet },
          { validator: natRepeat }
        ],
        srcPort: [
          { required: true, message: this.$t('egw.nat.external_portmap_port_is_required') },
          { validator: isLegalPort },
          { validator: natRepeat }
        ],
        destIp: [
          { required: true, message: this.$t('egw.nat.inside_portmap_ip_is_required') },
          { validator: ipValidator }
        ],
        destPort: [
          { required: true, message: this.$t('egw.nat.inside_portmap_port_is_required') },
          { validator: isLegalPort },
          { validator: isMergerPort, portKey: 'srcPort' }
        ]
      }
    }
  },
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? this.$t('action.add') : this.$t('action.edit1')
    }
  },
  mixins: [pageMixins, formMixins],
  components: {
    ArpInput
  },
  watch: {
    'baseModel.srcPort'(v) {
      this.rangePort = v.includes('-')
      if (this.rangePort) {
        this.baseModel.destPort = this.baseModel.srcPort
      }
    }
  },
  methods: {
    async _loadList() {
      let _ipinfo = await this.$api.getWanIp()
      this.netList = Object.keys(_ipinfo).map(o => ({
        ipaddr: _ipinfo[o].ip,
        netmask: _ipinfo[o].mask
      }))
      this.wanArr = Object.keys(_ipinfo).map(o => ({
        ip: _ipinfo[o].ip,
        mac: o.toLocaleUpperCase()
      })) // mac是为了显示ip是哪个wan口
      this.wanIp = Object.keys(_ipinfo).map(o => _ipinfo[o].ip)
      let _result = await this.$api.getPortMapping()
      return _result.portMapping || []
    },
    // 删除、批量删除
    onDel(nameArr) {
      if (!nameArr) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning( this.$t('tip.select_del_item'))
        }
        nameArr = selection.map(item => item.ruleName)
      }
      this._onDel(nameArr)
    },
    _onDel(nameArr) {
      this.$confirm( this.$t('tip.confirm_delete')).then(() => {
        this.$api.delPortMapping(nameArr).then(d => {
          nameArr.forEach(name => {
            let _index = this.pageList.findIndex(
              ({ ruleName }) => ruleName === name
            )
            this.removeList(_index)
          })
          this.$message({
            message: this.$t('tip.del_success'),
            type: 'success'
          })
        })
      })
    },
    // 新增编辑
    onEdit(idx, row = model.pmFn()) {
      this.editIndex = idx
      if (idx === -1 && this.pageTotal >= this.MAX_NUM) {
        return this.$message.warning(
          this.$t('egw.nat.portmap_length_any_more',{num:this.MAX_NUM})
        )
      }
      this._onShowModal(row)
    },
    // open编辑框
    _onShowModal(data) {
      this.isModalShow = true
      this.baseModel = Object.assign({}, data)
    },
    // 提交数据
    onSubmitForm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _promise = null
          let _list = [this.baseModel]
          // 编辑
          if (this.editIndex > -1) {
            _promise = this.$api
              .updatePortMapping({
                new: this.baseModel,
                old: this.pageList[this.editIndex]
              })
              .then(() => {
                this.editList(this.editIndex, this.baseModel)
              })
          } else {
            _promise = this.$api.addPortMapping(_list).then(() => {
              this.addList(this.baseModel)
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
    // 外部触发内部验证
    onInputSrcPort() {
      this._onValidateField('srcIp')
      if (this.baseModel.destPort) {
        this._onValidateField('destPort')
      }
    },
    onProtoChange() {
      this._onValidateField('srcIp')
      this._onValidateField('srcPort')
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

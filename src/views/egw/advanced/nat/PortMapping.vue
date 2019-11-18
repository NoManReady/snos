<template>
  <div class="advanced-nat">
    <help-alert json-key="natJson" title="端口映射"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          端口映射列表
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="onEdit(-1)" size="small" type="primary">
            <i class="el-icon-plus"></i>
            <span>新增</span>
          </el-button>
          <el-button @click.native="onDel()" size="small" type="primary">
            <i class="el-icon-delete"></i>
            <span>批量删除</span>
          </el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{MAX_NUM}}</b>条规则。
        </div>
      </help-alert>
      <el-table :data="pageList" ref="multipleTable" row-key="`${ruleName}_${destPort}`" size="small" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="规则名称" prop="ruleName"></el-table-column>
        <el-table-column align="center" label="服务协议" prop="proto">
          <template slot-scope="scope">{{scope.row.proto.toUpperCase()}}</template>
        </el-table-column>
        <el-table-column align="center" label="外部服务器IP" prop="srcIp"></el-table-column>
        <el-table-column align="center" label="外部端口" prop="srcPort"></el-table-column>
        <el-table-column align="center" label="内部服务器IP" prop="destIp"></el-table-column>
        <el-table-column align="center" label="内部端口" prop="destPort"></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index, scope.row)" type="text">修改</el-button>
            <el-button @click.native="onDel([scope.row.ruleName])" type="text">删除</el-button>
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
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" status-icon>
          <el-form-item label="规则名称" prop="ruleName">
            <el-input class="w260" v-model="baseModel.ruleName"></el-input>
          </el-form-item>
          <el-form-item label="服务协议" prop="proto">
            <el-select @change="onProtoChange" class="w260" v-model="baseModel.proto">
              <el-option label="UDP" value="udp"></el-option>
              <el-option label="TCP" value="tcp"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="外部服务器IP" prop="srcIp">
            <arp-input
              :dataSource="wanArr"
              @input="_onValidateField('srcPort')"
              class="w260"
              placeholder="默认用外网口IP地址"
              v-model="baseModel.srcIp"
            ></arp-input>
          </el-form-item>
          <el-form-item label="外部端口/范围" prop="srcPort">
            <el-input @input="onInputSrcPort" class="w260" placeholder="格式：X或X-X (X范围：1-65535)" v-model="baseModel.srcPort"></el-input>
          </el-form-item>
          <el-form-item label="内部服务器IP" prop="destIp">
            <arp-input
              @input="_onValidateField('srcPort')"
              class="w260"
              filterType="LAN"
              placeholder="输入或从ARP列表中选择IP"
              v-model="baseModel.destIp"
            ></arp-input>
          </el-form-item>
          <el-form-item label="内部端口/范围" prop="destPort">
            <el-input
              :disabled="rangePort"
              :title="rangePort ? '原因：外部端口是端口范围时，内部端口须与外部端口范围保持一致' : ''"
              class="w260"
              placeholder="格式：X或X-X (X范围：1-65535)"
              v-model="baseModel.destPort"
            ></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false">取 消</el-button>
          <el-button @click="onSubmitForm()" type="primary">确 定</el-button>
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
        return cb(new Error('请输入有效的IP或网段'))
      }
      cb()
    }
    const isInWanIpNet = (rule, val, cb) => {
      if (val === '') {
        return cb()
      }
      if (this.netList.length === 0) {
        return cb(new Error('WAN口无IP，推荐配置为空'))
      }
      if (!isIpInNet(val, this.netList)) {
        return cb(new Error('外部IP与WAN口IP不在同一网段'))
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
        cb(new Error(`规则：${val}已存在`))
      }
      cb()
    }
    const isLegalPort = (r, v, cb) => {
      if (!v.includes('-')) {
        //  单个端口号
        if (!intValidate(v)) {
          return cb(new Error('请输入整数'))
        }
        //  单个端口号
        if (!isBetween(v, 1, 65535)) {
          return cb(new Error('端口范围为1~65535'))
        }
      } else {
        // 端口号范围
        if (!isPortRange(v)) {
          return cb(new Error('端口范围格式为 XX-YY'))
        }
        let sPort = v.split(/\s*-\s*/)[0]
        let ePort = v.split(/\s*-\s*/)[1]
        if (+sPort > +ePort) {
          return cb(new Error('结束端口必须大于等于开始端口'))
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
        return cb(new Error('内外部端口范围的个数不同'))
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
            `${_item.proto.toLocaleUpperCase()} 已设置过映射（${_item.srcIp ||
              '外网口IP'}:${_item.srcPort}）`
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
          { required: true, message: '请输入规则名称' },
          { range: true, min: 1, max: 28, message: '规则名称为1-28个字符' },
          { validator: nameValidator }
        ],
        srcIp: [
          { validator: isIporNetSeg },
          { validator: isInWanIpNet },
          { validator: natRepeat }
        ],
        srcPort: [
          { required: true, message: '外网映射端口必填' },
          { validator: isLegalPort },
          { validator: natRepeat }
        ],
        destIp: [
          { required: true, message: '内网映射IP必填' },
          { validator: ipValidator }
        ],
        destPort: [
          { required: true, message: '内网映射端口必填' },
          { validator: isLegalPort },
          { validator: isMergerPort, portKey: 'srcPort' }
        ]
      }
    }
  },
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? '新增' : '编辑'
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
          return this.$message.warning('请选择要删除的列表项')
        }
        nameArr = selection.map(item => item.ruleName)
      }
      this._onDel(nameArr)
    },
    _onDel(nameArr) {
      this.$confirm('是否确认删除？').then(() => {
        this.$api.delPortMapping(nameArr).then(d => {
          nameArr.forEach(name => {
            let _index = this.pageList.findIndex(
              ({ ruleName }) => ruleName === name
            )
            this.removeList(_index)
          })
          this.$message({
            message: '删除成功',
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
          `端口映射最多只能添加 ${this.MAX_NUM} 条数据`
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
                message: '设置成功',
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

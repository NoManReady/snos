<template>
  <div class="component_ipconn">
    <help-alert json-key="ipConnJson" title="IP连接数限制">
      <div slot="content">配置每IP的会话连接数。</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          连接数规则列表
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
      <el-table :data="ipconnList" ref="multipleTable" size="small" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="规则名称" prop="information"></el-table-column>
        <el-table-column align="center" label="IP地址范围" width="200">
          <template slot-scope="scope">{{scope.row.ipStart}}-{{scope.row.ipEnd}}</template>
        </el-table-column>
        <el-table-column align="center" label="最大连接数" prop="connlimit"></el-table-column>
        <el-table-column align="center" label="状态" prop="status">
          <template slot-scope="scope">
            <div @click="toggleStatus(scope.row,scope.$index)" class="toggle-status pointer">
              <span class="c-success" v-if="scope.row.status==='on'">
                启用
                <i class="el-icon-circle-check"></i>
              </span>
              <span class="c-danger" v-else>
                关闭
                <i class="el-icon-remove"></i>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="140">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index, scope.row)" type="text">修改</el-button>
            <el-button @click.native="onDel(scope.row)" type="text">删除</el-button>
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
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" status-icon>
          <el-form-item label="规则名称" prop="information">
            <el-input class="w300" v-model="baseModel.information"></el-input>
          </el-form-item>
          <el-form-item label="开始地址" prop="ipStart">
            <el-input @change="onValidateField('ipEnd')" class="w300" placeholder="192.168.1.0" v-model="baseModel.ipStart"></el-input>
          </el-form-item>
          <el-form-item label="结束地址" prop="ipEnd">
            <el-input @change="onValidateField('ipStart')" class="w300" placeholder="192.168.1.234" v-model="baseModel.ipEnd"></el-input>
          </el-form-item>
          <el-form-item label="最大连接数" prop="connlimit">
            <el-input class="w300" placeholder="50~20000" v-model="baseModel.connlimit"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch active-value="on" inactive-value="off" v-model="baseModel.status"></el-switch>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false">取 消</el-button>
          <el-button @click="onSubmitForm" type="primary">确 定</el-button>
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
          cb(new Error(rule.message || '数据错误'))
        }
      }
      cb()
    }
    const _rangeValidator = (rule, val, cb) => {
      if (val === '') {
        cb()
      }
      if (!isBetween(val, 50, 20000)) {
        cb(new Error('范围50~20000'))
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
        return cb(new Error('规则名称已存在'))
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
          { required: true, message: '请输入开始地址' },
          { validator: ipValidator },
          { validator: _ipCompare, message: '开始地址应小于等于结束地址' }
        ],
        ipEnd: [
          { required: true, message: '请输入结束地址' },
          { validator: ipValidator },
          { validator: _ipCompare, message: '结束地址应大于等于开始地址' }
        ],
        connlimit: [
          { required: true, message: '请输入最大连接数' },
          { validator: intValidator, message: '请输入正整数' },
          { validator: _rangeValidator }
        ],
        information: [
          { required: true, message: '请输入规则名称' },
          { range: true, min: 1, max: 28, message: '规则名称为1-28个字符' },
          { validator: _sameNameValidate },
          { validator: quoteValidator }
        ]
      }
    }
  },
  mixins: [formMixins],
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? '添加' : '编辑'
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
          `最多支持添加 ${this.MAX_NUM} 条连接数规则`
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
          return this.$message.warning('请选择要删除的列表项')
        }
        informationArr = selection.map(item => item.information)
      }
      this.$confirm('是否确认删除？').then(() => {
        this.$api.delIpConn(informationArr).then(() => {
          informationArr.forEach(item => {
            let _index = this.ipconnList.findIndex(
              ({ information }) => information === item
            )
            this.ipconnList.splice(_index, 1)
          })
          this.$message({
            message: '删除成功',
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

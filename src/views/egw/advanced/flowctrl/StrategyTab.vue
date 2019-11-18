<template>
  <div class="advanced-strategy-tab">
    <help-alert json-key="strategyJson" title="自定义策略">
      <div slot="content">
        <p class="mb5">为特定的IP地址组分配带宽，策略优先于智能流控，满足特定的用户或服务器的带宽需要。</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          策略列表
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
          <b class="c-warning mlr5">{{MAX_NUM}}</b>条策略。
        </div>
      </help-alert>
      <el-table :data="strategyList" ref="multipleTable" size="small" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="策略名称" prop="comment"></el-table-column>
        <el-table-column align="center" label="IP地址/范围" prop="ipRange"></el-table-column>
        <el-table-column align="center" label="带宽模式">
          <template slot-scope="scope">{{modeObj[scope.row.mode || 'share']}}</template>
        </el-table-column>
        <el-table-column align="center" label="上行带宽" min-width="140px">
          <template slot-scope="scope">
            <div>保证 {{scope.row.upRateG}} Kbps</div>
            <div>最大 {{scope.row.upRate}} Kbps</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="下行带宽" min-width="140px">
          <template slot-scope="scope">
            <div>保证 {{scope.row.downRateG}} Kbps</div>
            <div>最大 {{scope.row.downRate}} Kbps</div>
          </template>
        </el-table-column>
        <el-table-column :formatter="getIntfName" align="center" label="应用接口"></el-table-column>
        <el-table-column align="center" label="状态" prop="enable">
          <template slot-scope="scope">
            <el-button @click="toggleStatus(scope.row,scope.$index)" class="c-success" type="text" v-if="scope.row.enable==='on'">
              启用
              <i class="el-icon-circle-check"></i>
            </el-button>
            <el-button @click="toggleStatus(scope.row,scope.$index)" class="c-danger" type="text" v-else>
              关闭
              <i class="el-icon-remove"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="生效状态">
          <template slot-scope="scope">
            <span class="c-success" type="text" v-if="scope.row.effective === '1'">已生效</span>
            <span class="c-warning" type="text" v-else-if="scope.row.effective === '0'">
              未生效
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content" v-if="scope.row.enable === 'on'">IP地址/范围不在已有LAN的网段中</div>
                <div slot="content" v-else>当前是关闭状态</div>
                <span>
                  <i class="el-icon-question"></i>
                </span>
              </el-tooltip>
            </span>
            <i class="el-icon-loading fs18" v-else></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="匹配顺序" v-if="strategyList.length > 1">
          <template slot-scope="scope">
            <el-button @click="onSetSort(scope.$index, scope.row.comment, 'up')" type="text" v-if="scope.$index > 0">
              <i class="el-icon-sort-up"></i>
            </el-button>
            <el-button
              @click="onSetSort(scope.$index, scope.row.comment, 'down')"
              type="text"
              v-if="scope.$index < strategyList.length-1"
            >
              <i class="el-icon-sort-down"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="100px">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index, scope.row)" type="text">修改</el-button>
            <el-button @click.native="onDel(scope.row)" type="text">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- strategy编辑 -->
      <el-dialog :model="baseModel" :title="modalTitle" :visible.sync="strategyModalShow" width="600px">
        <el-form :inline="true" :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
          <el-form-item label="策略名称" prop="comment">
            <el-input :disabled="editIndex > -1" class="w320" v-model="baseModel.comment"></el-input>
          </el-form-item>
          <el-form-item :rules="ipValidate()" label="IP地址/范围" prop="ipRange">
            <el-input class="w320" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="baseModel.ipRange"></el-input>
          </el-form-item>
          <el-form-item label="带宽模式">
            <el-select class="w320" placeholder="请选择" v-model="baseModel.mode">
              <el-option :key="value" :label="key" :value="value" v-for="(key, value) in modeObj"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="上行带宽">
            <el-form-item label="保证" label-width="54px" prop="upRateG">
              <el-input @change="onValidateField('upRate')" class="w100" v-model="baseModel.upRateG"></el-input>
            </el-form-item>
            <el-form-item label="最大" label-width="54px" prop="upRate">
              <el-input @change="onValidateField('upRateG')" class="w100" v-model="baseModel.upRate"></el-input>Kbps
            </el-form-item>
          </el-form-item>
          <el-form-item label="下行带宽">
            <el-form-item label="保证" label-width="54px" prop="downRateG">
              <el-input @change="onValidateField('downRate')" class="w100" v-model="baseModel.downRateG"></el-input>
            </el-form-item>
            <el-form-item label="最大" label-width="54px" prop="downRate">
              <el-input @change="onValidateField('downRateG')" class="w100" v-model="baseModel.downRate"></el-input>Kbps
            </el-form-item>
          </el-form-item>
          <el-form-item label="应用接口">
            <el-select class="w320" placeholder="请选择" v-model="baseModel.intf">
              <el-option :key="value" :label="key" :value="value" v-for="(key, value) in intfObj"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="enable">
            <el-switch active-value="on" inactive-value="off" v-model="baseModel.enable"></el-switch>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="strategyModalShow = false">取 消</el-button>
          <el-button @click="onSubmitForm" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import model from '@/model'
import formMixins from '@/mixins/formMixins'
import { intValidator, quoteValidator } from '@/utils/rules'
import { isBetween, isIp, isIpRange } from '@/utils/rulesUtils'
import { isIpInNet } from '@/utils/commonValidates'
export default {
  name: 'AdvancedStrategyTab',
  data() {
    const _flowValidator = (rule, val, cb) => {
      if (val === '') {
        cb()
      }
      if (!isBetween(val, 1, 10000000)) {
        cb(new Error('范围1~10000000'))
      }
      cb()
    }
    const _bandCompare = (rule, val, cb) => {
      let isUp = rule.field.includes('up')
      if (val === '') {
        cb()
      }
      let m = this.baseModel
      if (isUp) {
        if (m.upRate && m.upRateG && m.upRate - m.upRateG < 0) {
          cb(new Error(rule.message || '数据错误'))
        }
      } else {
        if (m.downRate && m.downRateG && m.downRate - m.downRateG < 0) {
          cb(new Error(rule.message || '数据错误'))
        }
      }
      cb()
    }
    const _getRules = isG => {
      return [
        { required: true, message: isG ? '请输入保证带宽' : '请输入最大带宽' },
        { validator: intValidator, message: '请输入正整数' },
        { validator: _flowValidator },
        {
          validator: _bandCompare,
          message: isG ? '请小于最大带宽' : '请大于保证带宽'
        }
      ]
    }
    const _sameNameValidate = (r, v, cb) => {
      let _editName =
        this.editIndex > -1 ? this.strategyList[this.editIndex].comment : ''
      if (v != _editName && this.nameMap[v])
        return cb(new Error('规则名称已存在'))
      cb()
    }
    return {
      MAX_NUM: 30,
      modalTitle: '',
      editIndex: -1,
      strategyList: [],
      ipRange: [],
      intfObj: {},
      modeObj: {
        share: '共享',
        per_ip: '独立'
      },
      strategyModalShow: false,
      baseModel: model.strategyFn(),
      baseRules: {
        upRate: _getRules(false),
        upRateG: _getRules(true),
        downRate: _getRules(false),
        downRateG: _getRules(true),
        comment: [
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
    nameMap() {
      let map = {}
      this.strategyList.forEach(d => (map[d.comment] = true))
      return map
    },
    existIpRange() {
      return this.strategyList.map(o => o.ipRange)
    }
  },
  async created() {
    await this.loadIfaceTypes()
    await this.loadNetwork()
    await this.loadData()
  },
  destroyed() {
    this.time && clearTimeout(this.time)
  },
  methods: {
    async loadData(isSilence = false) {
      let _result = await this.$api.getPolicyFlow(isSilence)
      this.strategyList = _result.list.reverse() // 先匹配的放上面
      this.strategyList.forEach(_item => {
        // 更新生效状态
        this.updateEffective(_item)
      })
    },
    // 添加/编辑策略
    onEdit(index, item) {
      let isAdd = index < 0
      if (isAdd && this.strategyList.length >= this.MAX_NUM)
        return this.$message.warning(`最多支持添加 ${this.MAX_NUM} 条策略`)
      this.editIndex = index
      this.modalTitle = isAdd ? '添加' : '编辑'
      this.strategyModalShow = true
      this.baseModel = Object.assign(
        {},
        model.strategyFn(),
        { intf: this.intfObj['br-wan1'] ? 'br-allwan' : 'br-wan' }, // 接口默认选择“所有WAN口”或“WAN”
        item
      )
      this._clearValidate()
    },
    async loadIfaceTypes() {
      const result = await this.$api.getIfaceTypes()

      result.forEach(item => {
        this.intfObj[`br-${item}`] = item.toLocaleUpperCase()
      })
      // if (result.length > 1)
      this.intfObj['br-allwan'] = '所有WAN口'
    },
    getIntfName(row) {
      return this.intfObj[row.intf] || '-'
    },
    async loadNetwork() {
      let _res = await this.$api.getNetwork()
      this.networkLan = _res.lan
    },
    ipValidate() {
      const isLegalIp = (r, v, cb) => {
        if (!isIp(v) && !isIpRange(v)) {
          return cb(new Error('请输入正确的IP地址或范围'))
        }
        cb()
      }
      const isBelongRange = (r, v, cb) => {
        if (!isIpInNet(v, this.networkLan))
          return cb(new Error('IP范围不在已有LAN的网段中'))
        cb()
      }
      return [
        { required: true, message: '请输入IP地址或范围' },
        { validator: isLegalIp },
        { validator: isBelongRange }
      ]
    },
    // 删除策略
    async onDel(row) {
      let _nameArr = []
      if (row) {
        _nameArr = [row.comment]
      } else {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning('请选择要删除的列表项')
        }
        _nameArr = selection.map(item => item.comment)
      }
      await this.$confirm('是否确认删除？')

      this.$api.setPolicyFlow({ rulename: _nameArr }, 'del').then(() => {
        let _data = this.strategyList.filter(item => {
          return _nameArr.indexOf(item.comment) < 0
        })
        this.strategyList = _data
      })
    },
    onSort(idx, type) {
      let data = this.strategyList.splice(idx, 1)[0]
      idx = type == 'up' ? idx - 1 : idx + 1
      this.strategyList.splice(idx, 0, data)
    },
    onSetSort(idx, name, type) {
      this.$api.setStrategySort(name, type).then(d => {
        this.onSort(idx, type)
        this.$message.success(type === 'up' ? '上移成功' : '下移成功')
      })
    },
    // 编辑策略确认
    onSubmitForm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _model = Object.assign({}, this.baseModel)
          let _isAdd = this.editIndex < 0

          this.$api
            .setPolicyFlow({ list: [_model] }, _isAdd ? 'add' : 'update')
            .then(() => {
              this.$message({
                type: 'success',
                message: '设置成功'
              })
              this.updateEffective(_model)
              if (_isAdd) {
                this.strategyList.unshift(_model)
              } else {
                this.strategyList.splice(this.editIndex, 1, _model)
              }
              this.strategyModalShow = false
            })
        }
      })
    },
    updateEffective(item) {
      if (item.enable === 'off') {
        item.effective = '0'
      } else {
        item.effective = isIpInNet(item.ipRange, this.networkLan) ? '1' : '0'
      }
    },
    // 切换状态
    toggleStatus(item, index) {
      let _item = Object.assign({}, item, {
        enable: item.enable === 'on' ? 'off' : 'on'
      })
      this.updateEffective(_item)
      this.$api.setPolicyFlow({ list: [_item] }, 'update').then(() => {
        this.$message({
          type: 'success',
          message: '设置成功'
        })
        this.strategyList.splice(index, 1, _item)
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
.advanced-strategy-tab {
  .el-button--text.c-danger,
  .c-danger:hover {
    color: #ed3e6c;
  }
  .c-danger.is-disabled {
    color: #aaadb2;
  }
}
</style>

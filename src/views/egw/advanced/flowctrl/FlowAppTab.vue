<template>
  <div class="advanced-flowapp-tab">
    <help-alert json-key="flowAppJson" title="应用流控">
      <div slot="content">
        <strong class="c-warning">注意！修改配置后，请点击“保存配置”按钮，才会下发配置到设备生效！</strong>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          应用流控列表
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="onEdit(-1)" size="small" type="primary">
            <i class="el-icon-plus"></i>
            <span>新增</span>
          </el-button>
          <el-button @click.native="onBatchDel" size="small" type="primary">
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
      <el-table :data="strategy.list" ref="multipleTable" size="small" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="流控名称" prop="comment"></el-table-column>
        <el-table-column align="center" label="应用名称" prop="appName"></el-table-column>
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
        <el-table-column align="center" label="状态" prop="enable">
          <template slot-scope="scope">
            <div @click="toggleStatus(scope.row,scope.$index)" class="toggle-status pointer">
              <span class="c-success" v-if="scope.row.enable==='on'">
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
        <el-table-column align="center" label="匹配顺序" v-if="strategy.list.length > 1">
          <template slot-scope="scope">
            <span @click="onMoveUp(scope.$index)" class="pointer c-success pr10" title="上移" v-if="scope.$index > 0">
              <i class="el-icon-sort-up"></i>
            </span>
            <span
              @click="onMoveDown(scope.$index)"
              class="pointer c-success"
              title="下移"
              v-if="scope.$index < strategy.list.length-1"
            >
              <i class="el-icon-sort-down"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="100px">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index, scope.row)" type="text">修改</el-button>
            <el-button @click.native="onDel(scope.$index)" type="text">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- strategy编辑 -->
      <el-dialog :model="baseModel" :title="modalTitle" :visible.sync="strategyModalShow" width="600px">
        <el-form :inline="true" :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
          <el-form-item label="流控名称" prop="comment">
            <el-input class="w320" v-model="baseModel.comment"></el-input>
          </el-form-item>
          <el-form-item label="选择应用" prop="appName">
            <treeselect
              :multiple="false"
              :options="appTree"
              @close="onValidateField('appName')"
              @input="onValidateField('appName')"
              class="w320"
              v-model="baseModel.appName"
            />
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
          <el-form-item label="状态" prop="enable">
            <el-switch active-value="on" inactive-value="off" v-model="baseModel.enable"></el-switch>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="strategyModalShow = false">取 消</el-button>
          <el-button @click="onModalConfirm" type="primary">确 定</el-button>
        </span>
      </el-dialog>
      <div class="tc mt20">
        <el-button class="w200" type="primary" v-auth="onSubmit">保存配置</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import model from '@/model'
import formMixins from '@/mixins/formMixins'
import { intValidator, quoteValidator } from '@/utils/rules'
import { isBetween } from '@/utils/rulesUtils'
import Treeselect from '@riophae/vue-treeselect'
export default {
  name: 'AdvancedFlowAppTab',
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
      if (v != this.curEdit.name && this.nameMap[v])
        return cb(new Error('规则名称已存在'))
      cb()
    }
    // const _oneAppValidator = (r, v, cb) => {
    //   if (v && v.length !== 1) return cb(new Error('只能选择一项应用，可以一大类或者一小项。'))
    //   cb()
    // }
    return {
      MAX_NUM: 30,
      modalTitle: '',
      appTree: [],
      curEdit: {
        name: '',
        idx: 0
      },
      strategy: {
        list: []
      },
      originListString: '',
      strategyModalShow: false,
      baseModel: model.flowappFn(),
      baseRules: {
        appName: [
          { required: true, message: '请选择应用' }
          // { validator: _oneAppValidator }
        ],
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
      this.strategy.list.forEach(d => (map[d.comment] = true))
      return map
    }
  },
  async created() {
    await this._loadData()
    this._loadAppTree()
  },
  components: {
    Treeselect
  },
  methods: {
    async _loadData() {
      let _result = await this.$api.getFlowApp()
      this.strategy.list = _result.list.reverse() // 先匹配的放上面
      this.originListString = JSON.stringify(this.strategy.list) // 用于保存时判断是否有修订
    },
    // 加载应用app树
    async _loadAppTree() {
      let _result = await this.$api.getApplicationTree()
      this.appTree = this._getTreeModelData(_result.grp_list || [])
    },
    // 获取树形数据
    _getTreeModelData(tree) {
      let _tree = []
      tree.forEach(tr => {
        if (tr.app_name) {
          let _child = {
            id: tr.app_name,
            label: tr.app_name
          }
          // if (tr.app_list && Array.isArray(tr.app_list) && tr.app_list.length) { // 注释掉，不显示子类
          //   _child.children = this._getTreeModelData(tr.app_list)
          // }
          _tree.push(_child)
        }
      })
      return _tree
    },
    // 添加/编辑策略
    onEdit(index, item = {}) {
      let isAdd = index < 0
      if (isAdd && this.strategy.list.length >= this.MAX_NUM)
        return this.$message.warning(`最多支持添加 ${this.MAX_NUM} 条策略`)
      this.curEdit = {
        idx: index,
        name: item ? item.comment : ''
      }
      this.modalTitle = isAdd ? '添加' : '编辑'
      this.strategyModalShow = true
      this.baseModel = Object.assign(model.flowappFn(), item)
      this._clearValidate()
    },
    // 删除策略
    onDel(index) {
      this.$confirm('是否确认删除？').then(_ => {
        this.strategy.list.splice(index, 1)
      })
    },
    onBatchDel() {
      let selection = this.$refs.multipleTable.selection
      if (!selection.length) {
        return this.$message.warning('请选择要删除的列表项')
      }

      this.$confirm('是否确认删除？')
        .then(() => {
          selection = selection.map(item => item.comment)
          let _data = this.strategy.list.filter(item => {
            return selection.indexOf(item.comment) < 0
          })
          this.strategy.list = _data
        })
        .catch(() => {})
    },
    onMoveUp(index) {
      let _modelArr = this.strategy.list.splice(index, 1)
      this.strategy.list.splice(index - 1, 0, _modelArr[0])
    },
    onMoveDown(index) {
      let _modelArr = this.strategy.list.splice(index, 1)
      this.strategy.list.splice(index + 1, 0, _modelArr[0])
    },
    // 编辑策略确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _model = Object.assign({}, this.baseModel)
          let _isAdd = this.curEdit.idx < 0
          if (_isAdd) {
            this.strategy.list.unshift(_model)
          } else {
            this.strategy.list.splice(this.curEdit.idx, 1, _model)
          }
          this.strategyModalShow = false
        }
      })
    },
    // 切换状态
    toggleStatus(item, index) {
      this.strategy.list.splice(
        index,
        1,
        Object.assign({}, item, {
          enable: item.enable === 'on' ? 'off' : 'on'
        })
      )
    },
    // 验证字段
    onValidateField(field) {
      this.$nextTick(() => {
        this.$refs.baseForm.validateField(field)
      })
    },
    // 保存配置
    onSubmit() {
      if (this.originListString === JSON.stringify(this.strategy.list)) {
        return this.$message('配置未修改')
      }
      let _list = [].concat(this.strategy.list).reverse()
      this.$api.setFlowApp({ list: _list }).then(() => {
        this.originListString = JSON.stringify(this.strategy.list)
        this.$message({
          type: 'success',
          message: '设置成功'
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../../../style/utils/variable';
.advanced-flowapp-tab {
  .is-error {
    /deep/ .vue-treeselect .vue-treeselect__control {
      border-color: $--color-danger;
    }
  }
}
</style>

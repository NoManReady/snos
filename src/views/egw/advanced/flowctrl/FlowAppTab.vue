<template>
  <div class="advanced-flowapp-tab">
    <help-alert json-key="flowAppJson" :title="$t('egw.flowctrl.application_flow_control')">
      <div slot="content">
        <strong class="c-warning">{{$t('egw.flowctrl.set_config_success_by_save_tip')}}</strong>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.flowctrl.application_flow_control_tab')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="onEdit(-1)" size="small" type="primary">
            <i class="el-icon-plus"></i>
            <span>{{$t('action.add')}}</span>
          </el-button>
          <el-button @click.native="onBatchDel" size="small" type="primary">
            <i class="el-icon-delete"></i>
            <span>{{$t('action.patch_delete')}}</span>
          </el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="egw.limit_num_tip">
              <b class="c-warning mlr5">{{MAX_NUM}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="strategy.list" ref="multipleTable" size="medium" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" :label="$t('egw.flowctrl.name_flow_control')" prop="comment"></el-table-column>
        <el-table-column align="center" :label="$t('egw.flowctrl.app_name')" prop="appName"></el-table-column>
        <el-table-column align="center" :label="$t('egw.up_rate')" min-width="140px">
          <template slot-scope="scope">
            <div>{{$t('egw.flowctrl.ensure')}} {{scope.row.upRateG}} Kbps</div>
            <div>{{$t('egw.flowctrl.bigest')}} {{scope.row.upRate}} Kbps</div>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('egw.down_rate')" min-width="140px">
          <template slot-scope="scope">
            <div>{{$t('egw.flowctrl.ensure')}} {{scope.row.downRateG}} Kbps</div>
            <div>{{$t('egw.flowctrl.bigest')}} {{scope.row.downRate}} Kbps</div>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('phrase.status')" prop="enable">
          <template slot-scope="scope">
            <div @click="toggleStatus(scope.row,scope.$index)" class="toggle-status pointer">
              <span class="c-success" v-if="scope.row.enable==='on'">
                {{$t('phrase.enable')}}
                <i class="el-icon-circle-check"></i>
              </span>
              <span class="c-danger" v-else>
                {{$t('phrase.disable')}}
                <i class="el-icon-remove"></i>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('egw.matching_order')" v-if="strategy.list.length > 1">
          <template slot-scope="scope">
            <span @click="onMoveUp(scope.$index)" class="pointer c-success pr10" :title="$t('egw.move_up')" v-if="scope.$index > 0">
              <i class="el-icon-sort-up"></i>
            </span>
            <span
              @click="onMoveDown(scope.$index)"
              class="pointer c-success"
              :title="$t('egw.move_down')"
              v-if="scope.$index < strategy.list.length-1"
            >
              <i class="el-icon-sort-down"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action.ope')" min-width="100px">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index, scope.row)" size="medium" type="text">{{$t('action.edit')}}</el-button>
            <el-button @click.native="onDel(scope.$index)" size="medium" type="text">{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- strategy编辑 -->
      <el-dialog :model="baseModel" :title="modalTitle" :visible.sync="strategyModalShow" width="600px">
        <el-form :inline="true" :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('egw.flowctrl.name_flow_control')" prop="comment">
            <el-input class="w320" v-model="baseModel.comment"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.flowctrl.select_application')" prop="appName">
            <treeselect
              :multiple="false"
              :options="appTree"
              @close="onValidateField('appName')"
              @input="onValidateField('appName')"
              class="w320"
              v-model="baseModel.appName"
            />
          </el-form-item>
          <el-form-item :label="$t('egw.up_rate')">
            <el-form-item :label="$t('egw.flowctrl.ensure')" label-width="54px" prop="upRateG">
              <el-input @change="onValidateField('upRate')" class="w100" v-model="baseModel.upRateG"></el-input>
            </el-form-item>
            <el-form-item :label="$t('egw.flowctrl.bigest')" label-width="54px" prop="upRate">
              <el-input @change="onValidateField('upRateG')" class="w100" v-model="baseModel.upRate"></el-input>Kbps
            </el-form-item>
          </el-form-item>
          <el-form-item :label="$t('egw.down_rate')">
            <el-form-item :label="$t('egw.flowctrl.ensure')" label-width="54px" prop="downRateG">
              <el-input @change="onValidateField('downRate')" class="w100" v-model="baseModel.downRateG"></el-input>
            </el-form-item>
            <el-form-item :label="$t('egw.flowctrl.bigest')" label-width="54px" prop="downRate">
              <el-input @change="onValidateField('downRateG')" class="w100" v-model="baseModel.downRate"></el-input>Kbps
            </el-form-item>
          </el-form-item>
          <el-form-item :label="$t('phrase.status')" prop="enable">
            <el-switch active-value="on" inactive-value="off" v-model="baseModel.enable"></el-switch>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="strategyModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button @click="onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
      <div class="tc mt20">
        <el-button class="w160" size="medium" type="primary" v-auth="onSubmit">{{$t('action.save_edit')}}</el-button>
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
        cb(new Error(this.$t('egw.flowctrl.band_range')))
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
          cb(new Error(rule.message || this.$t('egw.error_data')))
        }
      } else {
        if (m.downRate && m.downRateG && m.downRate - m.downRateG < 0) {
          cb(new Error(rule.message || this.$t('egw.error_data')))
        }
      }
      cb()
    }
    const _getRules = isG => {
      return [
        { required: true, message: isG ? this.$t('egw.flowctrl.enter_ensure_rate') : this.$t('egw.flowctrl.enter_bigest_rate') },
        { validator: intValidator, message: this.$t('egw.enter_positive_integer') },
        { validator: _flowValidator },
        {
          validator: _bandCompare,
          message: isG ? this.$t('egw.flowctrl.less_then_bigest_rate') : this.$t('egw.flowctrl.more_then_bigest_rate')
        }
      ]
    }
    const _sameNameValidate = (r, v, cb) => {
      if (v != this.curEdit.name && this.nameMap[v])
        return cb(new Error( this.$t('egw.rule_name_is_duplication') ))
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
          { required: true, message: this.$t('egw.flowctrl.select_application') }
          // { validator: _oneAppValidator }
        ],
        upRate: _getRules(false),
        upRateG: _getRules(true),
        downRate: _getRules(false),
        downRateG: _getRules(true),
        comment: [
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
        return this.$message.warning( this.$t('egw.limit_num_tip3',{num: this.MAX_NUM}) )
      this.curEdit = {
        idx: index,
        name: item ? item.comment : ''
      }
      this.modalTitle = isAdd ? this.$t('action.add'): this.$t('action.edit')
      this.strategyModalShow = true
      this.baseModel = Object.assign(model.flowappFn(), item)
      this._clearValidate()
    },
    // 删除策略
    onDel(index) {
      this.$confirm( this.$t('tip.confirm_delete')).then(_ => {
        this.strategy.list.splice(index, 1)
      })
    },
    onBatchDel() {
      let selection = this.$refs.multipleTable.selection
      if (!selection.length) {
        return this.$message.warning(this.$t('tip.select_del_item'))
      }

      this.$confirm(this.$t('tip.confirm_delete'))
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
        return this.$message(this.$t('egw.config_is_no_edit'))
      }
      let _list = [].concat(this.strategy.list).reverse()
      this.$api.setFlowApp({ list: _list }).then(() => {
        this.originListString = JSON.stringify(this.strategy.list)
        this.$message({
          type: 'success',
          message: this.$t('tip.edit1_success')
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

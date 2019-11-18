<template>
  <div class="advanced-nat-dmz">
    <help-alert json-key="natdmzJson" title="NAT-DMZ规则列表">
      <div slot="content">您可以查看规则条目，还可以通过表格按钮对条目进行操作。</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          NAT-DMZ规则列表
          <small></small>
        </span>
        <div class="fr">
          <el-button size="small" type="primary" v-auth="onAdd">
            <i class="el-icon-plus"></i>
            <span>新增</span>
          </el-button>
          <el-button size="small" type="primary" v-auth="onDel">
            <i class="el-icon-delete"></i>
            <span>批量删除</span>
          </el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          当前有
          <b class="c-warning mlr5">{{MAX_NUM}}</b>个出接口，所以最大支持配置
          <b class="c-warning mlr5">{{MAX_NUM}}</b>条规则。
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" row-key="rule_name" size="small" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="规则名称" prop="rule_name"></el-table-column>
        <el-table-column align="center" label="出接口" prop="interface">
          <template slot-scope="scope">{{scope.row.interface.toLocaleUpperCase()}}</template>
        </el-table-column>
        <el-table-column align="center" label="主机地址" prop="dest_ip" width="200"></el-table-column>
        <el-table-column align="center" label="状态" prop="enable">
          <template slot-scope="scope">
            <div @click="toggleStatus(scope.row,scope.$index)" class="toggle-enable pointer">
              <span class="c-success" v-if="scope.row.enable==='1'">
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
            <el-button type="text" v-auth="{fn:onDel,params:scope.row}">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.pageIndex"
        :page-size="pageModel.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="_onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
        v-if="false"
      ></el-pagination>

      <!-- 编辑 -->
      <el-dialog
        :inline="true"
        :model="baseModel"
        :title="modalTitle"
        :visible.sync="modalShow"
        class="form-inline"
        width="600px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" status-icon>
          <el-form-item label="规则名称" prop="rule_name">
            <el-input :disabled="editIndex!==-1" class="w300" v-model="baseModel.rule_name"></el-input>
          </el-form-item>
          <el-form-item label="主机地址" prop="dest_ip">
            <el-input class="w300" placeholder="格式：192.168.1.1" v-model="baseModel.dest_ip"></el-input>
          </el-form-item>
          <el-form-item label="出接口" prop="interface">
            <el-select class="w300" placeholder="请选择" v-model="baseModel.interface">
              <el-option :key="intf.v" :label="intf.l" :value="intf.v" v-for="intf in intfs"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="enable">
            <el-switch active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="modalShow = false">取 消</el-button>
          <el-button @click="onModalConfirm" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/pageMixins'
import { ipValidator, quoteValidator } from '@/utils/rules'
import model from '@/model'

export default {
  name: 'AdvancedNatDmz',
  data() {
    const _sameNameValidate = (r, v, cb) => {
      let _editItem = this.getItem(this.editIndex)
      if (v !== _editItem.rule_name && this.nameMap.includes(v))
        return cb(new Error('规则名称已存在'))
      cb()
    }
    const _sameIntfValidate = (r, v, cb) => {
      let _editItem = this.getItem(this.editIndex)
      if (v !== _editItem.interface && this.hasConfigIntf.includes(v))
        return cb(new Error('此接口已配置过'))
      cb()
    }
    return {
      MAX_NUM: 1,
      pageData: {
        list: []
      },
      baseModel: model.natDmzFn(),
      baseRules: {
        rule_name: [
          { required: true, message: '请输入规则名称' },
          { range: true, min: 1, max: 28, message: '规则名称为1-28个字符' },
          { validator: _sameNameValidate },
          { validator: quoteValidator }
        ],
        dest_ip: [
          { required: true, message: '请输入主机地址' },
          { validator: ipValidator }
        ],
        interface: [{ validator: _sameIntfValidate }]
      },
      intfs: [],
      editIndex: -1,
      modalShow: false
    }
  },
  mixins: [pageMixins],
  computed: {
    nameMap() {
      return this.pageModel.allItem.map(o => o.rule_name) || []
    },
    hasConfigIntf() {
      return this.pageModel.allItem.map(o => o.interface) || []
    },
    modalTitle() {
      return this.editIndex !== -1 ? '编辑规则' : '新增规则'
    }
  },
  created() {
    this.loadIfaceTypes()
  },
  methods: {
    // 加载
    async _loadList() {
      let _res = await this.$api.getNatDmz()
      // this.MAX_NUM = +_res.maxLen || 80
      this.pageData = _res
      return _res.list || []
    },
    async loadIfaceTypes() {
      const _res = await this.$api.getIfaceTypes()
      this.MAX_NUM = _res.length || 1
      this.intfs = Object.freeze(
        _res.map(v => ({ l: v.toLocaleUpperCase(), v: v }))
      )
    },
    // 新增
    onAdd() {
      if (this.pageTotal >= this.MAX_NUM) {
        return this.$message.warning(
          `当前有${this.MAX_NUM}个出接口，所以最多支持配置 ${this.MAX_NUM} 条规则`
        )
      }
      this.modalShow = true
      this.editIndex = -1
      this.baseModel = model.natDmzFn()
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    // 编辑
    onEdit(index) {
      this.modalShow = true
      this.editIndex = index
      this.baseModel = this.getItem(index)
    },
    //删除
    onDel(item) {
      let _items = []
      if (item) {
        _items = [item]
      } else {
        _items = this.$refs.baseTable.selection
        if (_items.length === 0) {
          return this.$message.warning('请选择要删除的列表项')
        }
      }
      this.$confirm('是否确认删除？').then(() => {
        let _map = _items.map(o => o.rule_name)
        // 更新本地数据
        this.pageModel.allItem = this.pageModel.allItem.filter(item => {
          return !_map.includes(item.rule_name)
        })
        // 下发命令
        let _data = { rule_list: _map }
        this.onSubmit(_data, 'del')
      })
    },
    // 确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _item = { ...this.baseModel }
          // 下发命令
          let _isAdd = this.editIndex === -1
          this.onSubmit(_item, _isAdd ? 'add' : 'update')

          // 更新本地数据
          if (_isAdd) {
            this.addList(_item)
          } else {
            this.editList(this.editIndex, _item)
          }
          this.modalShow = false
        }
      })
    },
    // 提交数据
    onSubmit(data, opt = 'set') {
      if (!data) {
        data = Object.assign(this.pageData, { list: this.pageModel.allItem })
      }
      this.$api.setNatDmz(data, opt).then(d => {
        // this._initPage()
        this.$message({
          message: '配置成功',
          type: 'success'
        })
      })
    },
    // 切换状态
    toggleStatus(item, index) {
      item.enable = item.enable === '1' ? '0' : '1'
      this.onSubmit(item, 'update')
      this.editList(index, item)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

<template>
  <div class="vpn-user-pool">
    <help-alert json-key="vpnPoolJson" title="地址池管理">
      <div slot="content">
        被使用的IP地址池，不能执行
        <span class="c-warning">删除</span>操作。
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          地址池列表
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="poolList.length>=MAX_NUM||isLoading"
            icon="el-icon-plus"
            size="small"
            type="primary"
            v-auth="_onAdd"
          >新增</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" size="small" type="primary" v-auth="_onDel">批量删除</el-button>
        </div>
      </div>
      <div class="box-content">
        <help-alert :show-icon="false" title>
          <div slot="content">
            最大支持配置
            <b class="c-warning mlr5">{{MAX_NUM}}</b>个地址池。
          </div>
        </help-alert>
        <el-table :data="poolList" ref="baseTable" size="mini" stripe>
          <el-table-column :selectable="row => row.active !== '1'" type="selection" width="55"></el-table-column>
          <el-table-column align="center" label="地址池名称" prop="ippool_name"></el-table-column>
          <el-table-column align="center" label="IP地址范围" prop="ipRange">
            <template slot-scope="{row}">{{`${row.first_addr}-${row.end_addr}`}}</template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button :disabled="isLoading" type="text" v-auth="{fn:_onEdit,params:scope.$index}">修改</el-button>
              <el-button :disabled="isLoading || scope.row.active !== '0'" type="text" v-auth="{fn:_onDel,params:scope.row}">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 用户管理编辑modal -->
    <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="500px">
      <el-form
        :model="baseModel"
        :rules="getPoolRules(isAddPool)"
        :validate-on-rule-change="false"
        label-width="120px"
        ref="baseForm"
      >
        <el-form-item label="地址池名称" placeholder="名称为1-28个字符" prop="ippool_name">
          <el-input :disabled="editIndex !== -1" class="w300" v-model="baseModel.ippool_name"></el-input>
        </el-form-item>
        <el-form-item label="IP地址范围" prop="ipRange">
          <el-input class="w300" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="baseModel.ipRange"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="baseModalShow = false">取 消</el-button>
        <el-button @click="_onModalConfirm" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import modelFn from '@/model'
import formMixins from '@/mixins/formMixins'
import poolMixins from './poolMixins'
export default {
  name: 'vpn-user-pool',
  mixins: [formMixins, poolMixins],
  data() {
    return {
      baseModalShow: false,
      isLoading: false,
      editIndex: -1,
      baseModel: modelFn.vpnPoolFn(),
      MAX_NUM: 5
    }
  },
  computed: {
    isAddPool() {
      return this.editIndex === -1
    },
    modalTitle() {
      return this.isAddPool ? '添加地址池' : '编辑地址池'
    }
  },
  watch: {
    'baseModel.ipRange'(v) {
      let _vArr = !!v ? v.split(/\s*-\s*/) : []
      if (_vArr.length === 2) {
        this.baseModel.first_addr = _vArr[0] || ''
        this.baseModel.end_addr = _vArr[1] || ''
      }
    }
  },
  created() {
    this.loadIpPool()
  },
  methods: {
    // 添加
    _onAdd() {
      this.baseModel = modelFn.vpnPoolFn()
      this.baseModalShow = true
      this.editIndex = -1
      this._clearValidate()
    },
    // 编辑
    _onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index
      this.baseModel = { ...this.poolList[index] }
      this._clearValidate()
    },
    // 删除
    _onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert('请选择要删除的项目', {
          type: 'warning'
        })
        return
      }
      this.$confirm('是否确认删除?', '提示', {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.$api
          .delIpPool({ ippool_name: _items.map(ite => ite.ippool_name) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.poolList.findIndex(d => d === ite)
              this.poolList.splice(_index, 1)
            })
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // confirm确认
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    // 提交数据
    _onSubmit() {
      if (
        JSON.stringify(this.baseModel) ===
        JSON.stringify(this.poolList[this.editIndex])
      ) {
        this.baseModalShow = false
        return
      }
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _poolData = { ...this.baseModel }
      delete _poolData.ipRange
      this.$api
        .setIpPool(_poolData, this.isAddPool)
        .then(d => {
          Object.assign(_poolData, {
            ipRange: this.baseModel.ipRange,
            active: '0'
          })
          if (this.isAddPool) {
            this.poolList.push(_poolData)
          } else {
            this.poolList.splice(this.editIndex, 1, _poolData)
          }
          this.$message({
            message: '配置成功',
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
<style lang="scss" scoped>
</style>

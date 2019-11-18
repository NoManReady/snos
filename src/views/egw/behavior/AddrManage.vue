<template>
  <div class="behavior-addr-manage">
    <help-alert json-key="behaviorAddrManageJson" title="地址管理">
      <div slot="collapseFoot">
        <h3 class="tit">注意</h3>
        <p class="desc">地址组一旦在其他地方被引用则无法在本页面被删除，除非解除引用。</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          地址组列表
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="addrList.length>=maxLimit||isLoading"
            icon="el-icon-plus"
            size="small"
            type="primary"
            v-auth="onAdd"
          >新增</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" size="small" type="primary" v-auth="onDel">批量删除</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{maxLimit}}</b>条。
        </div>
      </help-alert>
      <el-table :data="addrList" ref="baseTable" size="mini" stripe>
        <el-table-column :selectable="_isSelectable" type="selection" width="55"></el-table-column>
        <!-- <el-table-column label="序号" align="center">
          <template slot-scope="scope">
            {{scope.$index+1}}
          </template>
        </el-table-column>-->
        <el-table-column align="center" label="组名称" prop="name"></el-table-column>
        <el-table-column align="center" label="IP地址段" prop="ip">
          <template slot-scope="scope">
            <p :key="i" v-for="i of scope.row.ip">{{i}}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button :disabled="scope.row.flag==='sys'" type="text" v-auth="{fn:onEdit,params:scope.$index}">修改</el-button>
            <el-button :disabled="!_isSelectable(scope.row)" type="text" v-auth="{fn:onDel,params:scope.row}">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 地址管理modal -->
      <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="550px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
          <el-form-item label="组名称" prop="name">
            <el-input
              :disabled="editIndex!==-1"
              :title="baseModel.name"
              class="w250"
              placeholder="请输入组名称"
              v-model="baseModel.name"
            ></el-input>
          </el-form-item>
          <el-form-item class="is-required" label="IP地址段" prop="ip">
            <el-form-item
              :class="{mb20:index!==baseModel.ip.length-1}"
              :key="index"
              :prop="`ip[${index}]`"
              :rules="ipValidate(item,index)"
              v-for="(item,index) in baseModel.ip"
            >
              <el-input class="w250" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="baseModel.ip[index]"></el-input>
              <el-button @click="onDelIpList(index)" size="medium" type="text" v-if="baseModel.ip.length > 1">
                <i class="el-icon-close"></i>
              </el-button>
              <el-button
                @click="onAddIpList"
                size="medium"
                type="text"
                v-if="index === baseModel.ip.length - 1 && baseModel.ip.length < 5"
              >
                <i class="el-icon-plus"></i>
              </el-button>
            </el-form-item>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false">取 消</el-button>
          <el-button :diaabled="isLoading" @click="onModalConfirm" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import model from '@/model'
import formMixins from '@/mixins/formMixins'
import { judgeIpRangeRules } from '@/utils/commonValidates'
import clone from 'clone'
export default {
  name: 'BehaviorAddrManage',
  data() {
    const uniqueValidator = (rule, value, cb) => {
      if (
        this.addrList.find(
          (addr, index) => addr.name === value && index !== this.editIndex
        )
      ) {
        cb(new Error(`地址名称已被使用`))
      }
      cb()
    }
    return {
      isLoading: true,
      baseModalShow: false,
      maxLimit: 20,
      editIndex: -1,
      baseModel: model.behaviorAddrManageFn(),
      baseRules: {
        name: [
          { required: true, message: '请输入组名称', whitespace: true },
          {
            validator: nameLengthValidator,
            size: 64,
            message: '组名称不能超过64个字符，中文占3字符'
          },
          { validator: uniqueValidator }
        ]
      },
      addrList: []
    }
  },
  mixins: [formMixins],
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? '添加地址' : '编辑地址'
    }
  },
  created() {
    this._loadAddrInfo()
  },
  methods: {
    // 加载NAT列表
    _loadAddrInfo() {
      this.isLoading = true
      this.$api
        .getAddrManage()
        .then(d => {
          this.addrList = d
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 判断是否可编辑
    _isSelectable(row, index) {
      return row.flag === 'usr' && row.ref == 0
    },
    // 添加IP范围
    onAddIpList() {
      this.baseModel.ip.push('')
    },
    // 删除IP范围
    onDelIpList(index) {
      this.baseModel.ip.splice(index, 1)
    },
    // IP范围验证数组
    ipValidate(_, index) {
      return judgeIpRangeRules(this.baseModel.ip, index)
    },
    // 删除NAT
    onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        return this.$message.warning('请选择要删除的列表项')
      }
      this.$confirm('是否确认删除？').then(() => {
        this.isLoading = true
        this.$api
          .delAddrManage({ names: _items.map(ite => ite.ip_group) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.addrList.findIndex(d => d === ite)
              this.addrList.splice(_index, 1)
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
    // 添加NAT
    onAdd() {
      this.editIndex = -1
      this.baseModalShow = true
      this.baseModel = model.behaviorAddrManageFn()
      this._clearValidate()
    },
    // 编辑NAT
    onEdit(index) {
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = clone(this.addrList[index])
      this._clearValidate()
    },
    // 编辑地址确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          if (
            JSON.stringify(this.baseModel) ===
            JSON.stringify(this.addrList[this.editIndex])
          ) {
            this.baseModalShow = false
            return
          }
          if (this.isLoading) {
            return
          }
          this.isLoading = true
          let _isnew = this.editIndex === -1
          this.$api
            .setAddrManage(this.baseModel, _isnew)
            .then(d => {
              if (_isnew) {
                this.addrList.push({ ...this.baseModel, ip_group: d.ip_group })
              } else {
                this.addrList.splice(this.editIndex, 1, { ...this.baseModel })
              }
            })
            .finally(() => {
              this.baseModalShow = false
              setTimeout(() => {
                this.isLoading = false
              }, 300)
            })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

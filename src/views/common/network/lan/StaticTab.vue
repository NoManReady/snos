<template>
  <div class="network-static">
    <help-alert json-key="staticJson" title="静态地址分配页面">
      <div slot="content">静态地址分配列表</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          静态地址分配列表
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="onAdd" size="small" type="primary">
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
          <b class="c-warning mlr5">{{MAX_NUM}}</b>条数据。
        </div>
      </help-alert>
      <el-table :data="pageList" ref="multipleTable" row-key="macaddr" size="small" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="序号" type="index"></el-table-column>
        <el-table-column align="center" label="IP地址" prop="ipaddr"></el-table-column>
        <el-table-column align="center" label="MAC地址" prop="macaddr"></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button @click="onEdit(scope.$index,scope.row)" type="text">修改</el-button>
            <el-button @click="onDel([scope.row.macaddr])" type="text">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.pageIndex"
        :page-size="pageModel.pageSize"
        :page-sizes="pageModel.pageSizes"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="_onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>

      <!-- 静态地址编辑 -->
      <el-dialog :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="500px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" status-icon>
          <el-form-item label="IP地址" prop="ipaddr">
            <arp-input
              @select="onSelectIp"
              class="w260"
              filterType="LAN"
              placeholder="格式如：192.168.1.1"
              v-model="baseModel.ipaddr"
            ></arp-input>
          </el-form-item>
          <el-form-item label="MAC地址" prop="macaddr">
            <el-input class="w260" placeholder="格式如：00:74:9c:1e:4b:f4" v-model="baseModel.macaddr"></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false">取 消</el-button>
          <el-button :disabled="isSetting" :loading="isSetting" @click="onSubmitForm()" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import ArpInput from '@/common/ArpInput'
import { ipValidator, macValidator } from '@/utils/rules'
import pageMixins from '@/mixins/pageMixins'
import formMixins from '@/mixins/formMixins'
export default {
  name: 'DhcpStatic',
  data() {
    const checkIpaddrUnit = (rule, value, cb) => {
      let _isExit = this.pageModel.allItem.find(
        (item, index) =>
          item.ipaddr === value && index !== this.getRealIndex(this.editIndex)
      )
      if (_isExit) {
        cb(new Error('IP地址已配置过'))
      }
      cb()
    }
    const _compareVal = (v, v1) => {
      return v && v1 && v.toLocaleLowerCase() === v1.toLocaleLowerCase()
    }
    const checkMacUnit = (rule, value, cb) => {
      let _isExit = this.pageModel.allItem.find(item => {
        return (
          _compareVal(item.macaddr, value) &&
          !_compareVal(
            this.editIndex > -1 ? this.pageList[this.editIndex].macaddr : '',
            value
          )
        )
      })
      if (_isExit) {
        cb(new Error('MAC地址已配置过'))
      }
      cb()
    }
    return {
      MAX_NUM: 300,
      baseModel: {
        ipaddr: '',
        macaddr: ''
      },
      editIndex: -1,
      isSetting: false,
      isModalShow: false,
      baseRules: {
        ipaddr: [
          { required: true, message: '请输入IP地址' },
          { validator: ipValidator },
          { validator: checkIpaddrUnit }
        ],
        macaddr: [
          { required: true, message: '请输入MAC地址' },
          { validator: macValidator },
          { validator: checkMacUnit }
        ]
      }
    }
  },
  mixins: [pageMixins, formMixins],
  components: {
    ArpInput
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? '编辑静态地址分配' : '添加静态地址分配'
    }
  },
  methods: {
    async _loadList() {
      let _result = await this.$api.getStaticDhcpTable()
      return _result.dhcp_static || []
    },
    // 删除静态dhcp绑定
    onDel(macArr) {
      if (!macArr) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning('请选择要删除的列表项')
        }
        macArr = selection.map(item => item.macaddr)
      }
      this._onDel(macArr)
    },
    // 删除
    _onDel(macArr) {
      this.$confirm('是否确认删除？').then(() => {
        this.$api.delStaticDhcpTable(macArr).then(d => {
          macArr.forEach(mac => {
            let _index = this.pageList.findIndex(
              ({ macaddr }) => macaddr === mac
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
    // 新增
    onAdd() {
      if (this.pageTotal >= this.MAX_NUM) {
        return this.$message.warning(`最多支持配置 ${this.MAX_NUM} 条数据`)
      }
      this.isModalShow = true
      this.editIndex = -1
      this.baseModel = { ipaddr: '', macaddr: '' }
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    // 编辑添加静态dhcp
    onEdit(idx, row = {}) {
      this.isModalShow = true
      this.editIndex = idx
      this.baseModel = Object.assign({}, row)
    },
    // 提交数据
    onSubmitForm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isSetting = true
          let _promise = null
          let _list = [this.baseModel]
          // 编辑
          if (this.editIndex > -1) {
            _promise = this.$api
              .updateStaticDhcpTable({
                new: this.baseModel,
                old: this.pageList[this.editIndex]
              })
              .then(() => {
                this.editList(this.editIndex, this.baseModel)
              })
          } else {
            _promise = this.$api.addStaticDhcpTable(_list).then(() => {
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
              this.isSetting = false
              this.isModalShow = false
            })
        }
      })
    },
    onSelectIp(item) {
      if (item.mac) {
        this.baseModel.macaddr = item.mac
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

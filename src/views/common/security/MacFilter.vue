<template>
  <div class="security-macfilter">
    <help-alert json-key="macFilterJson" title="MAC地址过滤">
      <div slot="content">通过开启MAC地址过滤和设置过滤类型，控制连接的主机上网。</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">MAC地址过滤</span>
      </div>
      <el-form :model="pageData" class="w500" label-width="160px" status-icon>
        <el-form-item label="MAC地址过滤" prop="enable">
          <el-switch active-value="1" inactive-value="0" v-model="pageData.enable"></el-switch>
          <strong class="vm ml10 c-warning" v-if="pageData.enable==='0'">开启状态下，以下配置才会生效</strong>
          <strong class="vm ml10 c-warning" v-else-if="pageData.model==='white'">只允许规则列表中的主机访问外网</strong>
          <strong class="vm ml10 c-warning" v-else-if="pageData.model==='black'">不允许规则列表中的主机访问外网</strong>
        </el-form-item>
        <el-form-item label="过滤类型">
          <el-select class="w300" v-model="pageData.model">
            <el-option label="黑名单（不允许设备访问外网）" value="black"></el-option>
            <el-option label="白名单（允许设备访问外网）" value="white"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="onSwitchMode" class="w160" type="primary">保存配置</el-button>
        </el-form-item>
      </el-form>
      <div class="box-header">
        <span class="box-header-tit">规则列表</span>
        <div class="fr">
          <el-button icon="el-icon-plus" size="small" type="primary" v-auth="onAdd">新增</el-button>
          <el-button icon="el-icon-delete" size="small" type="primary" v-auth="onDel">批量删除</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{MAX_NUM}}</b>个规则。
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" row-key="mac" size="small" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="MAC地址" prop="mac"></el-table-column>
        <el-table-column align="center" label="备注" prop="comment"></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button @click="onEdit(scope.$index)" type="text">修改</el-button>
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
      ></el-pagination>

      <!-- 新增/编辑 -->
      <el-dialog :title="modalTitle" :visible.sync="modalShow" width="550px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" status-icon>
          <el-form-item label="MAC地址" prop="mac">
            <arp-input class="w260" filterType="LAN" placeholder="输入或从ARP列表中选择MAC" v-model="baseModel.mac" valueKey="mac"></arp-input>
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <el-input class="w260" v-model="baseModel.comment"></el-input>
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
import { nameLengthValidator, macValidator } from '@/utils/rules'
import ArpInput from '@/common/ArpInput'
export default {
  name: 'SecurityMacfilter',
  data() {
    const checkMacUnit = (rule, value, cb) => {
      let _isExit = this.pageModel.allItem.find((item, index) => {
        let _mac = item.mac.toLocaleLowerCase()
        let _editmac = this.baseModel.oldmac || ''
        return _mac === value.toLocaleLowerCase() && _mac !== _editmac
      })
      if (_isExit) {
        cb(new Error('MAC地址已配置过'))
      }
      cb()
    }
    return {
      MAX_NUM: 80,
      pageData: {
        model: 'black', // 默认为黑名单：black  白名单对应：white
        list: []
      },
      baseModel: {
        comment: '',
        mac: ''
      },
      baseRules: {
        comment: [
          {
            validator: nameLengthValidator,
            size: 32,
            message: '备注不能超过32个字符(单个中文占3个字符)'
          }
        ],
        mac: [
          { required: true, message: '请输入MAC地址' },
          { validator: macValidator },
          { validator: checkMacUnit }
        ]
      },
      editIndex: -1,
      modalShow: false
    }
  },
  mixins: [pageMixins],
  components: {
    ArpInput
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? '编辑规则' : '新增规则'
    }
  },
  methods: {
    // 加载
    async _loadList() {
      let _res = await this.$api.getMacFilter()
      this.MAX_NUM = +_res.maxLen || 80
      this.pageData = _res
      return _res.list || []
    },
    _getStaListLite() {
      return new Promise(async (res, rej) => {
        let _res = await this.$api.getStaListLite()
        let _list = []
        _res.list &&
          _res.list.forEach(item => {
            _list.push({
              mac: item.mac,
              comment: item.hostName || ''
            })
          })
        res(_list)
      })
    },
    // 新增
    onAdd() {
      if (this.pageTotal >= this.MAX_NUM) {
        return this.$message.warning(`最多支持配置 ${this.MAX_NUM} 个名单`)
      }
      this.modalShow = true
      this.editIndex = -1
      this.baseModel = { comment: '', mac: '' }
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    // 编辑
    onEdit(index) {
      this.modalShow = true
      this.editIndex = index
      this.baseModel = this.getItem(index)
      this.baseModel.oldmac = this.baseModel.mac // 编辑时记录修改前的mac
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
        this.$api.delMacFilter(_items).then(() => {
          let _map = _items.map(o => o.mac)
          // 更新本地数据
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.pageModel.allItem = this.pageModel.allItem.filter(item => {
            return !_map.includes(item.mac)
          })
        })
      })
    },
    // 确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _item = { ...this.baseModel }
          let _promise = null
          if (this.editIndex === -1) {
            _promise = this.$api.addMacFilter([_item]).then(() => {
              this.addList(_item)
            })
          } else {
            _promise = this.$api.updateMacFilter(_item).then(() => {
              let _data = { ..._item }
              delete _data.oldmac
              this.editList(this.editIndex, _data)
            })
          }
          _promise
            .then(() => {
              this.$message({
                message: '配置成功',
                type: 'success'
              })
            })
            .finally(() => {
              this.modalShow = false
            })
        }
      })
    },
    // 提交数据
    onSwitchMode() {
      this.$api
        .updateMacFilter({
          enable: this.pageData.enable,
          model: this.pageData.model
        })
        .then(() => {
          this.$message({
            message: '配置成功',
            type: 'success'
          })
        })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

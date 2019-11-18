<template>
  <div class="behavior-macbwlist">
    <div class="mb20">
      <el-radio :key="k" :label="k" border v-for="(v,k) in modeMap" v-model="pageData.type">{{v}}</el-radio>
    </div>
    <help-alert
      :title="pageData.type==='allow' ? '只允许白名单列表中的无线终端关联WiFi，其他终端都不可以关联。' : '不允许黑名单列表中的无线终端关联WiFi，其他终端都可以关联。'"
      json-key="macBwlist"
      type="info"
    >
      <div slot="collapseFoot">
        <h3>提示：</h3>
        <p>
          您可以在
          <a @click="_onToStalist" class="c-success pointer">“无线用户”</a>页面将在线用户踢下线。
        </p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{pageData.type==='deny'?'黑名单列表':'白名单列表'}}</span>
        <div class="fr">
          <!-- <el-button type="primary" size="small" icon="el-icon-plus" v-auth="onAddBat">
            从在线列表中添加
          </el-button>-->
          <el-button icon="el-icon-plus" size="small" type="primary" v-auth="onAdd">新增</el-button>
          <el-button icon="el-icon-delete" size="small" type="primary" v-auth="onDel">批量删除</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{MAX_NUM}}</b>个名单。
        </div>
      </help-alert>
      <el-table :data="pageData.macList" ref="baseTable" row-key="mac" size="small" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="MAC地址" prop="mac">
          <template slot-scope="scope">{{scope.row.mac.toLocaleUpperCase()}}</template>
        </el-table-column>
        <el-table-column align="center" label="备注" prop="name"></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button @click="onEdit(scope.$index)" type="text">修改</el-button>
            <el-button type="text" v-auth="{fn:onDel,params:scope.row}">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 新增/编辑 -->
      <el-dialog :title="modalTitle" :visible.sync="modalShow" width="550px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
          <el-form-item label="MAC地址" prop="mac">
            <el-input class="w260" placeholder="格式 00:11:22:33:44" v-model="baseModel.mac"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="name">
            <el-input class="w260" v-model="baseModel.name"></el-input>
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
import { nameLengthValidator, macValidator } from '@/utils/rules'
export default {
  name: 'WifiMacbwlist',
  data() {
    const checkMacUnit = (rule, value, cb) => {
      let _isExit = this.pageData.macList.find(
        (item, index) =>
          item.mac.toLocaleLowerCase() === value.toLocaleLowerCase() &&
          this.editIndex !== index
      )
      if (_isExit) {
        cb(new Error('MAC地址已配置过'))
      }
      cb()
    }
    return {
      MAX_NUM: 30,
      modeMap: {
        deny: '黑名单模式',
        allow: '白名单模式'
      },
      pageData: {
        type: null, // 默认为黑名单：deny  白名单对应：allow
        macList: []
      },
      baseModel: {
        name: '',
        mac: ''
      },
      baseRules: {
        name: [{ validator: nameLengthValidator, size: 32 }],
        mac: [
          { required: true, message: '请输入MAC地址' },
          { validator: macValidator },
          { validator: checkMacUnit }
        ]
      },
      editIndex: -1,
      modalShow: false,
      isModeFallback: false //是否为取消切换
    }
  },
  watch: {
    'baseModel.mac'(v, o) {
      this.baseModel.mac = this.baseModel.mac.toLocaleUpperCase()
    },
    'pageData.type': {
      handler(v, o) {
        // 初始化或则取消切换不执行
        if (!o || this.isModeFallback) {
          this.isModeFallback = false
          return
        }
        let _msg
        if (v === 'allow') {
          _msg =
            '切换到“白名单模式”时，白名单列表默认为当前已在线的用户，是为了防止当前在线用户被误踢下线。您可以切换后在白名单列表中根据需要增删改“白名单列表”来控制上网用户。'
        } else {
          // deny
          _msg =
            '切换到“黑名单模式”后，黑名单列表默认为空，即允许所有已连接设备上网，您可以手动或者在“无线用户”页面将当前在线用户【踢下线】，即添加到黑名单列表中。'
        }
        this.$confirm(_msg, `是否切换到“${this.modeMap[v]}”?`, {
          type: 'info'
        }).then(
          async () => {
            if (v === 'allow') {
              this.pageData.macList = await this._getStaListLite()
            } else {
              // deny
              this.pageData.macList = []
            }
            this.onSubmit()
          },
          () => {
            this.isModeFallback = true
            this.pageData.type = o
          }
        )
      }
    }
  },
  created() {
    this._loadBwList()
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? '编辑' : '新增'
    }
  },
  methods: {
    // 加载列表
    async _loadBwList() {
      let _res = await this.$api.getMacBwList()
      this.pageData = { ...this.pageData, ..._res }
    },
    _getStaListLite() {
      return new Promise(async (res, rej) => {
        let _res = await this.$api.getStaListLite()
        let _list = []
        _res.list &&
          _res.list.forEach(item => {
            _list.push({
              mac: item.mac,
              name: item.hostName || ''
            })
          })
        res(_list)
      })
    },
    // 跳转到“无线用户”页面
    _onToStalist() {
      this.$router.push({ name: 'admin/wifi/wifi_sta' })
    },
    // 新增
    onAdd() {
      if (this.pageData.macList.length >= this.MAX_NUM) {
        return this.$message.warning(`最多支持配置 ${this.MAX_NUM} 个名单`)
      }
      this.modalShow = true
      this.editIndex = -1
      this.baseModel = { name: '', mac: '' }
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    // 编辑
    onEdit(index) {
      this.modalShow = true
      this.editIndex = index
      this.baseModel = { ...this.pageData.macList[index] }
    },
    //删除分组
    onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        return this.$message.warning('请选择要删除的列表项')
      }
      this.$confirm('是否确认删除？').then(() => {
        let _macList = _items.map(ite => ite.mac)
        this.$api
          .delMacBwList({ type: this.pageData.type, macList: _macList })
          .then(d => {
            this.pageData.macList = this.pageData.macList.filter(item => {
              return !_macList.includes(item.mac)
            })
            this.$message({
              message: '配置成功',
              type: 'success'
            })
          })
      })
    },
    // 确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _promise = null
          if (this.editIndex === -1) {
            _promise = this.$api
              .addMacBwList({ ...this.baseModel, type: this.pageData.type })
              .then(d => {
                this.pageData.macList.push(this.baseModel)
              })
          } else {
            _promise = this.$api
              .updateMacBwList({
                type: this.pageData.type,
                new: this.baseModel,
                old: this.pageData.macList[this.editIndex]
              })
              .then(d => {
                this.pageData.macList.splice(this.editIndex, 1, this.baseModel)
              })
          }
          _promise.then(() => {
            this.modalShow = false
          })
        }
      })
    },
    // 提交数据
    onSubmit() {
      this.$api.setMacBwList(this.pageData).then(d => {
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

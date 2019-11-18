<template>
  <div class="advanced-nat">
    <help-alert json-key="routeStaticJson" title="静态路由">
      <template slot="content">当数据包与静态路由匹配成功时，将按照指定的转发方式进行转发。</template>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          静态路由列表
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="onEdit(-1)" size="small" type="primary">
            <i class="el-icon-plus"></i>
            <span>新增</span>
          </el-button>
          <el-button @click.native="onDel(-1)" size="small" type="primary">
            <i class="el-icon-delete"></i>
            <span>批量删除</span>
          </el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{MAX_NUM}}</b>条路由。
        </div>
      </help-alert>
      <el-table :data="pageList" ref="multipleTable" row-key="ruleName" size="small" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="目的地址" prop="target"></el-table-column>
        <el-table-column align="center" label="子网掩码" prop="netmask"></el-table-column>
        <el-table-column align="center" label="出接口" prop="interface">
          <template slot-scope="scope">{{scope.row.interface.toLocaleUpperCase()}}</template>
        </el-table-column>
        <el-table-column align="center" label="下一跳" prop="gateway">
          <template slot-scope="{row}">{{pppoeIntfs.includes(row.interface) ? 'PPPoE拨号' : row.gateway}}</template>
        </el-table-column>
        <el-table-column align="center" label="是否可达">
          <template slot-scope="scope">
            <i class="el-icon-loading fs18" v-if="getEffective(scope.row) === null"></i>
            <span class="c-success" type="text" v-else-if="getEffective(scope.row) === '1'">可达</span>
            <span class="c-warning" type="text" v-else>
              不可达
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">当前路由不可达，请检查出接口是否能ping通下一跳</div>
                <span>
                  <i class="el-icon-question"></i>
                </span>
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index,scope.row)" type="text">编辑</el-button>
            <el-button @click.native="onDel(scope.$index)" type="text">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.pageIndex"
        :page-size="pageModel.pageSize"
        :page-sizes="[5, 10, 20]"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="_onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>

      <!-- 编辑对话框 -->
      <el-dialog :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="500px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" status-icon>
          <el-form-item label="目的地址" prop="target">
            <el-input @input="_onValidateField('netmask')" class="w200" v-model="baseModel.target"></el-input>
          </el-form-item>
          <el-form-item label="子网掩码" prop="netmask">
            <netmask-input @input="_onValidateField('target')" class="w200" v-model="baseModel.netmask"></netmask-input>
          </el-form-item>
          <el-form-item label="出接口" prop="interface">
            <el-select class="w200" v-model="baseModel.interface">
              <el-option :key="intf.v" :label="intf.l" :value="intf.v" v-for="intf in intfs"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="下一跳" prop="gateway" v-if="!pppoeIntfs.includes(baseModel.interface)">
            <el-input class="w200" v-model="baseModel.gateway"></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false">取 消</el-button>
          <el-button @click="onSubmitForm()" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { ipValidator, maskValidator } from '@/utils/rules'
import { ipToLong, longToIp, isIp } from '@/utils/rulesUtils'
import pageMixins from '@/mixins/pageMixins'
import formMixins from '@/mixins/formMixins'
import NetmaskInput from '@/common/NetMask'

export default {
  name: 'AdvancedRoute',
  data() {
    const sameNet = (r, v, cb) => {
      if (!this.baseModel.target || !this.baseModel.netmask) return cb()
      let ip = longToIp(
        ipToLong(this.baseModel.target) & ipToLong(this.baseModel.netmask)
      )
      if (this.baseModel.target !== ip)
        return cb(new Error('IP地址和子网掩码不在同一个网段'))
      return cb()
    }
    const targetLimitValidate = (rule, value, cb) => {
      if (!value) {
        return cb()
      }
      if (value === '0.0.0.0') {
        return cb(new Error('0.0.0.0不可配置'))
      }
      return cb()
    }
    return {
      MAX_NUM: 100,
      effectiveList: [],
      baseModel: {},
      isModalShow: false,
      intfs: [],
      pppoeIntfs: [],
      baseRules: {
        target: [
          { required: true, message: '请输入ip地址' },
          { validator: ipValidator, message: '请输入有效的ip地址' },
          { validator: targetLimitValidate },
          { validator: sameNet }
        ],
        netmask: [
          { required: true, message: '请输入子网掩码' },
          { validator: maskValidator, message: '请输入有效的子网掩码' },
          { validator: sameNet }
        ],
        gateway: [
          { required: true, message: '请输入下一跳地址' },
          { validator: ipValidator, message: '请输入有效的下一跳地址' }
        ],
        interface: [{ required: true, message: '请选择出接口' }]
      }
    }
  },
  mixins: [pageMixins, formMixins],
  components: {
    NetmaskInput
  },
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? '新增' : '编辑'
    },
    routListMap() {
      return this.pageModel.allItem.slice(0).map(item => {
        return this._toRoutString(item)
      })
    }
  },
  watch: {
    'baseModel.interface'(v) {
      if (this.pppoeIntfs.includes(v)) {
        this.baseModel.gateway = ''
      }
    }
  },
  destroyed() {
    this.time && clearTimeout(this.time)
  },
  methods: {
    async _loadList() {
      await this.loadNetwork()
      let _result = await this.$api.getRoutes()
      this.getRouteEffective()
      return _result.list || []
    },
    // 加载出口类型列表
    async loadNetwork() {
      const _res = await this.$api.getNetwork()

      _res.wan.forEach((w, i) => {
        let _intf = `wan${i === 0 ? '' : i}`
        this.intfs.push({ l: _intf.toLocaleUpperCase(), v: _intf })
        if (w.proto === 'pppoe') {
          this.pppoeIntfs.push(_intf)
        }
      })
    },
    // 加载可达状态
    async getRouteEffective() {
      let _res = await this.$api.getRoutesSta(true)
      this.effectiveList = _res.list || []

      if (this.effectiveList.length < this.pageModel.allItem.length) {
        this.time && clearTimeout(this.time)
        this.time = setTimeout(() => {
          this.getRouteEffective()
        }, 3000)
      }
    },
    // 判断是否可达
    getEffective(row) {
      let _key = this._toRoutString(row)
      let effective = null
      this.effectiveList.some(item => {
        if (this._toRoutString(item) === _key) {
          effective = item.effective
        }
      })
      return effective
    },
    _toRoutString(item) {
      return `${item.target}_${item.netmask}_${item.gateway || ''}_${
        item.interface
      }`
    },
    // 删除、批量删除
    onDel(idx) {
      let itemArr
      if (idx === -1) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning('请选择要删除的列表项')
        }
        itemArr = selection
      } else {
        let _item = this.getItem(idx)
        itemArr = [_item]
      }
      this._onDel(itemArr)
    },
    _onDel(itemArr) {
      this.$confirm('是否确认删除？').then(() => {
        this.$api.delRoutes(itemArr).then(() => {
          itemArr.forEach(item => {
            let _index = this.pageList.findIndex(
              route => this._toRoutString(route) === this._toRoutString(item)
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
    // 编辑
    onEdit(idx, row = {}) {
      this.editIndex = idx
      if (
        this.editIndex === -1 &&
        this.pageModel.allItem.length >= this.MAX_NUM
      ) {
        return this.$message.warning(
          `静态路由最多只能添加 ${this.MAX_NUM} 条数据`
        )
      }
      this.onShowModal(row)
    },
    // open编辑框
    onShowModal(data) {
      this.isModalShow = true
      this.baseModel = Object.assign({}, data)
    },
    // 编辑提交数据
    onSubmitForm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          if (this._isExistData(this.baseModel)) {
            this.$message({
              type: 'warning',
              title: '提示',
              message: '已存在此路由'
            })
            return
          }
          let _promise = null
          // 编辑
          if (this.editIndex > -1) {
            _promise = this.$api
              .updateRoutes({
                new_route: this.baseModel,
                old_route: this.pageList[this.editIndex]
              })
              .then(() => {
                this.editList(this.editIndex, this.baseModel)
              })
          } else {
            _promise = this.$api.addRoutes(this.baseModel).then(() => {
              this.addList(this.baseModel)
            })
          }
          _promise
            .then(d => {
              this.$message({
                message: '设置成功',
                type: 'success'
              })
              this.time && clearTimeout(this.time)
              this.time = setTimeout(() => {
                this.getRouteEffective()
              }, 3000)
            })
            .finally(() => {
              this.isModalShow = false
            })
        }
      })
    },
    // 判断数据是否存在
    _isExistData(data) {
      let _list = this.routListMap || []
      if (this.editIndex > -1) {
        _list = _list.filter(_key => {
          return _key !== this._toRoutString(this.pageList[this.editIndex])
        })
      }
      let _isRepeat = _list.some(_key => {
        return _key === this._toRoutString(data)
      })
      return _isRepeat
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

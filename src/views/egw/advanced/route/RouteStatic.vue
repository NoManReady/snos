<template>
  <div class="advanced-nat">
    <help-alert json-key="routeStaticJson" :title="$t('egw.route.route_static')">
      <template slot="content">{{$t('egw.route.route_static_tip')}}</template>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.route.route_static_tab')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="{fn: onEdit, params:-1}">{{$t('action.add')}}</el-button>
          <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="{fn: onDel, params:-1}">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="egw.limit_num_tip">
              <b class="c-warning mlr5">{{MAX_NUM}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="pageList" ref="multipleTable" row-key="ruleName" size="medium" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" :label="$t('egw.destination_addr')" prop="target"></el-table-column>
        <el-table-column align="center" :label="$t('egw.mask')" prop="netmask"></el-table-column>
        <el-table-column align="center" :label="$t('egw.interface')" prop="interface">
          <template slot-scope="scope">{{scope.row.interface.toLocaleUpperCase()}}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('egw.next_hop')" prop="gateway">
          <template slot-scope="{row}">{{pppoeIntfs.includes(row.interface) ? $t('egw.route.pppoe_dial_up') : row.gateway}}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('egw.whether_reachable')">
          <template slot-scope="scope">
            <i class="el-icon-loading fs18" v-if="getEffective(scope.row) === null"></i>
            <span class="c-success" type="text" v-else-if="getEffective(scope.row) === '1'">{{$t('egw.reachable')}}</span>
            <span class="c-warning" type="text" v-else>
              {{$t('egw.no_reachable')}}
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">{{$t('egw.route.check_ping_next_hop')}}</div>
                <span>
                  <i class="el-icon-question"></i>
                </span>
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action.ope')">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index,scope.row)" size="medium" type="text">{{$t('action.edit')}}</el-button>
            <el-button @click.native="onDel(scope.$index)" size="medium" type="text">{{$t('action.delete')}}</el-button>
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
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('egw.destination_addr')" prop="target">
            <el-input @input="_onValidateField('netmask')" class="w200" v-model="baseModel.target"></el-input>
          </el-form-item>
          <el-form-item :label="$t('egw.mask')" prop="netmask">
            <netmask-input @input="_onValidateField('target')" class="w200" v-model="baseModel.netmask"></netmask-input>
          </el-form-item>
          <el-form-item :label="$t('egw.interface')" prop="interface">
            <el-select class="w200" v-model="baseModel.interface">
              <el-option :key="intf.v" :label="intf.l" :value="intf.v" v-for="intf in intfs"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('egw.next_hop')" prop="gateway" v-if="!pppoeIntfs.includes(baseModel.interface)">
            <el-input class="w200" v-model="baseModel.gateway"></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button @click="onSubmitForm()" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
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
        return cb(new Error(this.$t('rules.ip_mask_diffrent_network')))
      return cb()
    }
    const targetLimitValidate = (rule, value, cb) => {
      if (!value) {
        return cb()
      }
      if (value === '0.0.0.0') {
        return cb(new Error(this.$t('egw.route.ip_invalid_0_0_0_0')))
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
          { required: true, message: this.$t('wan.ip_no_empty') },
          { validator: ipValidator, message: this.$t('wan.invalid_ip_addr') },
          { validator: targetLimitValidate },
          { validator: sameNet }
        ],
        netmask: [
          { required: true, message: this.$t('wan.mask_no_empty') },
          { validator: maskValidator, message: this.$t('wan.invalid_mask_addr') },
          { validator: sameNet }
        ],
        gateway: [
          { required: true, message: this.$t('egw.next_hop_is_required') },
          { validator: ipValidator, message: this.$t('egw.invalid_next_hop') }
        ],
        interface: [{ required: true, message: this.$t('egw.select_interface') }]
      }
    }
  },
  mixins: [pageMixins, formMixins],
  components: {
    NetmaskInput
  },
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? this.$t('action.add') : this.$t('action.edit1')
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
          return this.$message.warning( this.$t('tip.select_del_item'))
        }
        itemArr = selection
      } else {
        let _item = this.getItem(idx)
        itemArr = [_item]
      }
      this._onDel(itemArr)
    },
    _onDel(itemArr) {
      this.$confirm( this.$t('tip.confirm_delete')).then(() => {
        this.$api.delRoutes(itemArr).then(() => {
          itemArr.forEach(item => {
            let _index = this.pageList.findIndex(
              route => this._toRoutString(route) === this._toRoutString(item)
            )
            this.removeList(_index)
          })
          this.$message({
            message:  this.$t('tip.del_success'),
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
          this.$t('egw.route.static_route_limit_num',{num: this.MAX_NUM})
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
              title: this.$t('phrase.tip'),
              message: this.$t('egw.route.static_route_is_has')
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
                message: this.$t('tip.edit1_success'),
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

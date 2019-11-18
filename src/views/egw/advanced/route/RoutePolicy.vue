<template>
  <div class="advanced-route-policy">
    <help-alert :title="title" json-key="routePolicyJson">
      <div slot="content">
        <div>
          <strong>路由优先级：</strong>策略路由、地址库选路和静态路由都可以做为报文转发的依据。当策略同时存在的情况下，优先级是：策略路由 > 静态路由 > 地址库选路。
        </div>
        <div class="mt5">
          <strong>说明：</strong>策略路由是一种比基于目标网络进行路由更加灵活的数据包路由转发机制。
        </div>
      </div>
    </help-alert>
    <div class="box-header mt15">
      <span class="box-header-tit">
        策略路由列表
        <small></small>
      </span>
      <div class="fr">
        <el-button @click.native="onEdit(-1)" size="small" type="primary">
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
        <b class="c-warning mlr5">{{MAX_NUM}}</b>条。
      </div>
    </help-alert>
    <el-table :data="pageList" ref="multipleTable" row-key="name" size="small" stripe>
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <el-table-column align="center" label="规则名称" prop="name"></el-table-column>
      <el-table-column :formatter="formatProto" align="center" label="协议类型" prop="proto"></el-table-column>
      <el-table-column :formatter="formatIp" align="center" label="源IP地址" prop="sip"></el-table-column>
      <el-table-column :formatter="formatIp" align="center" label="目的IP地址" prop="dip"></el-table-column>
      <el-table-column :formatter="formatPort" align="center" label="源端口范围" prop="sport"></el-table-column>
      <el-table-column :formatter="formatPort" align="center" label="目的端口范围" prop="dport"></el-table-column>
      <el-table-column align="center" label="出接口" prop="intf">
        <template slot-scope="scope">{{scope.row.intf.toLocaleUpperCase()}}</template>
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
      <el-table-column align="center" label="匹配顺序" v-if="list.length > 1" width="100px">
        <template slot-scope="scope">
          <el-button
            @click="onSetSort(scope.$index, scope.row.name, 'up')"
            title="上移，优先匹配"
            type="text"
            v-if="getRealIndex(scope.$index) > 0"
          >
            <i class="el-icon-sort-up"></i>
          </el-button>
          <el-button
            @click="onSetSort(scope.$index, scope.row.name, 'down')"
            title="下移"
            type="text"
            v-if="getRealIndex(scope.$index) < list.length - 1"
          >
            <i class="el-icon-sort-down"></i>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100px">
        <template slot-scope="scope">
          <el-button @click="onEdit(scope.$index,scope.row)" type="text">修改</el-button>
          <el-button @click="onDel([scope.row.name])" type="text">删除</el-button>
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
    <el-dialog :close-on-click-modal="false" :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="550px">
      <el-form :inline="true" :model="modelData" :rules="baseRules" label-width="160px" ref="baseForm">
        <el-form-item label="规则名称" prop="name">
          <el-input :disabled="!isAdd" class="w260" v-model="modelData.name"></el-input>
        </el-form-item>
        <el-form-item label="协议类型" prop="proto">
          <el-select class="w260" placeholder="请选择协议类型" v-model="modelData.proto">
            <el-option label="IP" value="ip"></el-option>
            <el-option label="ICMP" value="icmp"></el-option>
            <el-option label="TCP" value="tcp"></el-option>
            <el-option label="UDP" value="udp"></el-option>
            <el-option label="自定义" value="udef_proto"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="modelData.proto === 'udef_proto'">
          <el-form-item label="协议号" prop="udef_proto">
            <el-input class="w260" placeholder="1~255" v-model="modelData.udef_proto"></el-input>
          </el-form-item>
        </template>
        <template v-if="modelData.proto === 'tcp' || modelData.proto === 'udp'">
          <el-form-item class="is-required" label="源端口范围">
            <!-- <el-input v-model="modelData.sport" class="w260" placeholder="1~65535"></el-input> -->
            <el-form-item label prop="sportMin">
              <el-input @change="onValidateField('sportMax')" class="w110" placeholder="1~65535" v-model="modelData.sportMin"></el-input>
            </el-form-item>
            <span>—</span>
            <el-form-item class="ml10" label prop="sportMax">
              <el-input @change="onValidateField('sportMin')" class="w110" placeholder="1~65535" v-model="modelData.sportMax"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item class="is-required" label="目的端口范围">
            <el-form-item label prop="dportMin">
              <el-input @change="onValidateField('dportMax')" class="w110" placeholder="1~65535" v-model="modelData.dportMin"></el-input>
            </el-form-item>
            <span>—</span>
            <el-form-item class="ml10" label prop="dportMax">
              <el-input @change="onValidateField('dportMin')" class="w110" placeholder="1~65535" v-model="modelData.dportMax"></el-input>
            </el-form-item>
          </el-form-item>
        </template>
        <el-form-item label="源IP地址/范围">
          <el-select class="w260" placeholder="请选择" v-model="modelData.sip">
            <el-option label="所有IP" value="all"></el-option>
            <el-option label="自定义" value="udef_src"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="modelData.sip === 'udef_src'">
          <el-form-item :rules="ipValidate()" class="is-required" label="自定义源IP" prop="sipRange">
            <el-input class="w260" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="modelData.sipRange"></el-input>
          </el-form-item>
        </template>
        <el-form-item label="目的IP地址/范围">
          <el-select class="w260" placeholder="请选择" v-model="modelData.dip">
            <el-option label="所有IP" value="all"></el-option>
            <el-option label="自定义" value="udef_dst"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="modelData.dip === 'udef_dst'">
          <el-form-item :rules="ipValidate()" class="is-required" label="自定义目的IP" prop="dipRange">
            <el-input class="w260" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="modelData.dipRange"></el-input>
          </el-form-item>
        </template>
        <el-form-item label="出接口" prop="intf">
          <el-select class="w260" placeholder="请选择出接口" v-model="modelData.intf">
            <el-option :key="index" :label="item" :value="item" v-for="(item, index) in intfArr"></el-option>
            <!-- <el-option label="WAN" value="wan"></el-option>
            <el-option label="WAN1" value="wan1"></el-option>-->
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="enable">
          <el-switch active-value="on" inactive-value="off" v-model="modelData.enable"></el-switch>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="isModalShow = false">取 消</el-button>
        <el-button @click="onClickFormBtn()" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import formMixins from '@/mixins/formMixins'
import timeSelection from '@/utils/timeSelection'
import pageMixins from '@/mixins/pageMixins'
import model from '@/model'
import { intValidator } from '@/utils/rules'
import { isBetween, isIp, isIpRange } from '@/utils/rulesUtils'
export default {
  name: 'AdvancedRoutePolicy',
  data() {
    const udefProtoValidate = (r, v, cb) => {
      if (v && !isBetween(v, 1, 255)) return cb(new Error('协议号范围为 1~255'))
      cb()
    }
    const sameNameValidate = (r, v, cb) => {
      if (this.isAdd && this.listNameMap.includes(v))
        return cb(new Error('规则名称已存在'))
      cb()
    }
    const _portValidate = (r, v, cb) => {
      if (v && !isBetween(v, 1, 65535)) return cb(new Error('范围为 1~65535'))
      cb()
    }
    const _portCompare = (rule, val, cb) => {
      let isSort = rule.field.includes('sport')
      if (val === '') {
        cb()
      }
      let m = this.modelData
      if (isSort) {
        if (m.sportMin && m.sportMax && m.sportMax - m.sportMin < 0) {
          cb(new Error(rule.message || '数据错误'))
        }
      } else {
        if (m.dportMin && m.dportMax && m.dportMax - m.dportMin < 0) {
          cb(new Error(rule.message || '数据错误'))
        }
      }
      cb()
    }
    const _getRules = isMin => {
      return [
        {
          required: true,
          message: isMin ? '请输入起始端口号' : '请输入结尾端口号'
        },
        { validator: intValidator, message: '请输入正整数' },
        { validator: _portValidate },
        {
          validator: _portCompare,
          message: isMin ? '请小于结尾端口号' : '请大于起始端口号'
        }
      ]
    }
    return {
      MAX_NUM: 30,
      title: '策略路由',
      list: [],
      modalTitle: '',
      isAdd: true,
      isModalShow: false,
      intfArr: [],
      modelData: model.routePolicyFn(),
      baseRules: {
        name: [
          { required: true, message: '请输入规则名称' },
          { range: true, min: 1, max: 28, message: '规则名称为1-28个字符' },
          { validator: sameNameValidate }
        ],
        udef_proto: [
          { required: true, message: '请输入协议号' },
          { validator: intValidator, message: '请输入正整数' },
          { validator: udefProtoValidate }
        ],
        sportMin: _getRules(true),
        sportMax: _getRules(false),
        dportMin: _getRules(true),
        dportMax: _getRules(false)
      }
    }
  },
  mixins: [pageMixins, formMixins],
  computed: {
    listNameMap() {
      return this.list.map(item => item.name)
    }
  },
  watch: {
    'modelData.proto'(v) {
      let _md = this.modelData
      if (v === 'tcp' || v === 'udp') {
        if (!!_md.sport) {
          let _sports = _md.sport.split(/\s*:\s*/)
          _md.sportMin = _md.sportMin || _sports[0]
          _md.sportMax = _md.sportMax || _sports[1]
        }

        if (!!_md.dport) {
          let _dports = _md.dport.split(/\s*:\s*/)
          _md.dportMin = _md.dportMin || _dports[0]
          _md.dportMax = _md.dportMax || _dports[1]
        }
      } else {
        delete _md.sportMin
        delete _md.sportMax
        delete _md.dportMin
        delete _md.dportMax
      }
    },
    'modelData.sip'(v) {
      let _md = this.modelData
      if (v === 'udef_src') {
        _md.sipRange = ''
      } else {
        delete _md.sipRange
      }
    },
    'modelData.dip'(v) {
      let _md = this.modelData
      if (v === 'udef_dst') {
        _md.dipRange = ''
      } else {
        delete _md.dipRange
      }
    }
  },
  created() {
    this.loadIfaceTypes()
  },
  methods: {
    async _loadList() {
      let _d = await this.$api.getRoutePolicy()
      this.list = _d.list || []
      return _d.list || []
    },
    async loadIfaceTypes() {
      const result = await this.$api.getIfaceTypes()
      this.intfArr = result.map(item => item.toLocaleUpperCase())
    },
    // 切换状态
    toggleStatus(item, index) {
      item.enable = item.enable === 'on' ? 'off' : 'on'
      this.isAdd = false
      this.onSave(item)
    },
    onEdit(idx, row = {}) {
      this.isAdd = idx < 0
      if (this.isAdd && this.list.length >= this.MAX_NUM) {
        return this.$message.warning(
          `${this.title}最多只能添加 ${this.MAX_NUM} 条路由`
        )
      }
      this.modalTitle = this.isAdd ? '添加策略路由' : '编辑策略路由'
      this.modelData = Object.assign(model.routePolicyFn(), row)
      this.modelData.intf = this.modelData.intf.toLocaleUpperCase()
      this.isModalShow = true
    },
    async onDel(nameArr) {
      if (!nameArr) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning('请选择要删除的列表项')
        }
        nameArr = selection.map(item => item.name)
      }
      await this.$confirm('是否确认删除？')
      this.$api.setRoutePolicy({ rulename: nameArr }, 'del', true).then(_ => {
        nameArr.forEach(item => {
          let _index = this.pageModel.allItem.findIndex(
            ({ name }) => name === item
          )
          this.pageModel.allItem.splice(_index, 1)
        })
        this.$message.success('删除成功')
      })
    },
    onClickFormBtn() {
      this.$refs.baseForm.validate(async ok => {
        if (ok) {
          this.onSave()
          this.isModalShow = false
        }
      })
    },
    onSave(data) {
      let _data = data
      if (!_data) {
        _data = { ...this.modelData }
        let _proto = _data.proto
        if (_proto === 'tcp' || _proto === 'udp') {
          _data.sport = `${_data.sportMin}:${_data.sportMax}`
          _data.dport = `${_data.dportMin}:${_data.dportMax}`

          delete _data.sportMin
          delete _data.sportMax
          delete _data.dportMin
          delete _data.dportMax
        }
      }
      _data.intf = _data.intf.toLocaleLowerCase()
      let _setData = {
        list: [_data]
      }
      this.$api
        .setRoutePolicy(_setData, this.isAdd ? 'add' : 'update', true)
        .then(d => {
          if (this.isAdd) {
            this.pageModel.allItem.unshift(_data)
          } else {
            let _index = this.pageModel.allItem.findIndex(
              ({ name }) => name === _data.name
            )
            this.pageModel.allItem.splice(_index, 1, _data)
          }
          this.$message.success('配置成功')
        })
    },
    onSort(idx, type) {
      let data = this.list.splice(idx, 1)[0]
      idx = type == 'up' ? idx - 1 : idx + 1
      this.list.splice(idx, 0, data)
    },
    onSetSort(idx, name, type) {
      this.$api.setRoutePolicySort(name, type).then(d => {
        let _realIdx = this.getRealIndex(idx)
        this.onSort(_realIdx, type)
        this.$message.success(type === 'up' ? '上移成功' : '下移成功')
      })
    },
    formatProto(row, col) {
      let _key = col.property
      let _v = row[_key]

      return _v === 'udef_proto'
        ? `协议号：${row.udef_proto}`
        : _v.toLocaleUpperCase()
    },
    formatIp(row, col) {
      let _key = col.property
      let _v = row[_key]

      if (_v === 'udef_src') {
        return row.sipRange
      } else if (_v === 'udef_dst') {
        return row.dipRange
      } else {
        return _v === 'all' ? '所有IP' : _v
      }
    },
    formatPort(row, col) {
      let _key = col.property
      let _v = row[_key] || '-'
      return (
        {
          all: '所有端口',
          '-': '-'
        }[_v] || _v.replace(':', '-')
      )
    },
    ipValidate() {
      const isLegalIp = (r, v, cb) => {
        if (!isIp(v) && !isIpRange(v))
          return cb(new Error('请输入正确的IP地址或范围'))
        cb()
      }
      return [
        { required: true, message: '请输入IP地址或范围' },
        { validator: isLegalIp }
      ]
    },
    // 验证字段
    onValidateField(field) {
      this.$refs.baseForm.validateField(field)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

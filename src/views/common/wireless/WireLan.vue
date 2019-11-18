<template>
  <div class="security-macfilter">
    <help-alert json-key title="有线口设置">
      <template slot="content">
        <div>此配置仅对带有线LAN口的AP生效，以实际生效的设备为准，例如：EAP101面板AP。</div>
        <div v-if="!isAlone">
          <strong>有线口设置生效规则：</strong>优先生效【AP有线口配置列表】中应用到AP的配置，
          <span class="c-warning">网络中未应用配置的EAP，会生效AP有线口默认配置。</span>
        </div>
      </template>
    </help-alert>
    <div class="box">
      <div class="box-header" v-if="!isAlone">
        <span class="box-header-tit">
          AP有线口
          <span class="c-warning">默认</span>配置
        </span>
      </div>
      <el-form :model="globalModel" class="w650" label-width="160px" ref="globalForm">
        <el-form-item label="转发类型" v-if="showTransMode">
          <el-select class="w340" v-model="globalModel.transmode">
            <el-option :key="k" :label="v" :value="k" v-for="(v, k) of transmodeMap"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :rules="[{ validator: vlanIdValidator }]"
          label="VLAN ID"
          prop="vlanId"
          v-if="globalModel.transmode === 'bridge'"
        >
          <el-autocomplete
            :fetch-suggestions="(query, cb) => cb(query ? netVlanId.filter(o => o.value.includes(query)) : netVlanId) "
            class="w340"
            placeholder="2~232,234~4090。为空表示与WAN口同VLAN"
            v-model="globalModel.vlanId"
          >
            <template slot-scope="{item}">
              <span>{{ item.value || '-'}}</span>
              <span class="c-info" v-if="item.desc">（{{ item.desc || '-' }}）</span>
            </template>
          </el-autocomplete>
          <el-button @click.native="goToLan" type="text" v-if="showVlan">去添加VLAN</el-button>
        </el-form-item>
        <el-form-item label="应用到" prop="snList" v-if="!isAlone">
          <el-popover placement="right" title trigger="hover" width="200">
            <div class="el-select clearfix" v-if="globalApList.length > 0">
              <span
                :key="sn"
                :title="`SN：${sn}\r\n型号：${apMap[sn] ? apMap[sn].dt : '-'}`"
                class="el-tag el-tag--info el-tag--small fl"
                v-for="sn in globalApList"
              >{{apMap[sn] ? apMap[sn].nm : sn}}</span>
            </div>
            <div v-else>
              网络中没有 EAP应用此配置，原因：
              {{aplist.length === 0 ? '当前网络无下联 EAP设备。' : '下联 EAP已单独配置有线口，查看下方的配置列表。' }}
            </div>
            <el-button slot="reference" type="text">
              <span>【AP有线口配置列表】</span>
              <span class="c-warning">未应用</span>到的 EAP
              <i class="el-icon-info el-icon--right"></i>
            </el-button>
          </el-popover>
        </el-form-item>
        <el-form-item>
          <el-button class="w200" type="primary" v-auth="onGlobalConfirm">保存配置</el-button>
        </el-form-item>
      </el-form>
      <template v-if="!isAlone">
        <div class="box-header">
          <span class="box-header-tit">AP有线口配置列表</span>
          <div class="fr">
            <el-button icon="el-icon-plus" size="small" type="primary" v-auth="{fn:onEdit,params:-1}">新增</el-button>
            <el-button icon="el-icon-delete" size="small" type="primary" v-auth="onDel">批量删除</el-button>
          </div>
        </div>
        <help-alert :show-icon="false" title>
          <div slot="content">
            <span>
              最大支持
              <b class="c-warning mr5">{{MAX_NUM}}</b>条配置，
            </span>
            <span>
              或最多支持匹配
              <b class="c-warning mr5">{{MAX_AP_NUM}}</b>台AP(当前已配置
              <b class="c-warning mr5">{{apConfiged.length}}</b>台)。
            </span>
          </div>
        </help-alert>
        <el-table :data="pageData.singleList" ref="baseTable" row-key="mac" size="small" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column align="center" label="转发类型" min-width="80" prop="transmode" v-if="showTransMode">
            <template slot-scope="{row}">{{ transmodeMap[row.transmode] || '-' }}</template>
          </el-table-column>
          <el-table-column align="center" label="VLAN ID" min-width="110" prop="vlanId" sortable>
            <template slot-scope="{row}">{{ row.transmode === 'bridge' ? (row.vlanId || '与WAN同VLAN') : '-' }}</template>
          </el-table-column>
          <el-table-column align="center" label="应用到AP" min-width="300" prop="snList">
            <template slot-scope="{row}">
              <div class="el-select clearfix">
                <span
                  :key="sn"
                  :title="`SN：${sn}\r\n型号：${apMap[sn] ? apMap[sn].dt : '-'}`"
                  class="el-tag el-tag--info el-tag--small fl"
                  v-for="sn in row.snList"
                >{{apMap[sn] ? apMap[sn].nm || sn : sn}}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="120">
            <template slot-scope="scope">
              <el-button type="text" v-auth="{fn:onEdit,params:scope.$index}">修改</el-button>
              <el-button type="text" v-auth="{fn:onDel,params:scope.row}">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 新增/编辑 -->
        <el-dialog :title="modalTitle" :visible.sync="modalShow" width="550px">
          <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm">
            <el-form-item label="转发类型" prop="transmode" v-if="showTransMode">
              <el-select class="w340" v-model="baseModel.transmode">
                <el-option :key="k" :label="v" :value="k" v-for="(v, k) of transmodeMap"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="VLAN ID" prop="vlanId" v-if="baseModel.transmode === 'bridge'">
              <el-autocomplete
                :fetch-suggestions="(query, cb) => cb(query ? netVlanId.filter(o => o.value.includes(query)) : netVlanId) "
                class="w340"
                placeholder="2~232,234~4090。为空表示与WAN口同VLAN"
                v-model="baseModel.vlanId"
              >
                <template slot-scope="{item}">
                  <span>{{ item.value || '-'}}</span>
                  <span class="c-info" v-if="item.desc">（{{ item.desc || '-' }}）</span>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="应用到AP" prop="snList">
              <el-select
                :filter-method="filterAp"
                class="w340"
                filterable
                multiple
                placeholder="选择AP（可输入AP名字或SN号搜索）"
                v-model="baseModel.snList"
              >
                <el-option-group
                  :disabled="AP_UNSUPPORT_LIST.includes(type)"
                  :key="type"
                  :label="`${type} 列表${!AP_UNSUPPORT_LIST.includes(type) ? `，已选 ${_getSumGroup(type)} 台` : '（不支持有线口设置）'}`"
                  v-for="type in apGroupKeys"
                >
                  <el-option
                    :disabled="disabledAp.includes(ap.sn)"
                    :key="ap.sn"
                    :label="`${ap.sn}`"
                    :value="ap.sn"
                    v-for="ap in apGroup[type]"
                  >
                    <span :title="`${ap.nm || ap.sn}-${ap.dt}`" class="fl ellipsis w150">{{ ap.nm || ap.sn}}</span>
                    <span class="fr c-info mr20">{{ ap.sn }}</span>
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
          </el-form>
          <span class="dialog-footer" slot="footer">
            <el-button @click="modalShow = false">取 消</el-button>
            <el-button @click="onModalConfirm" type="primary">确 定</el-button>
          </span>
        </el-dialog>
      </template>
    </div>
  </div>
</template>
<script>
import { vlanidOldValidator } from '@/utils/rules'
import ArpInput from '@/common/ArpInput'
export default {
  name: 'NetworkWirelan',
  data() {
    const apNumValidator = (rule, value, cb) => {
      if (value.length > this.ableApNum) {
        return cb(new Error(`选择的AP总数超过上限${this.MAX_AP_NUM}个`))
      }
      cb()
    }
    const existVlanValidator = (rule, value, cb) => {
      if (
        this.globalModel.transmode === 'bridge' &&
        value === this.globalModel.vlanId
      ) {
        return cb(new Error(`全局AP有线口已配置了VLAN ${value}`))
      }
      if (this.existVlanid.includes(value)) {
        return cb(
          new Error(
            `已存在${value ? ' VLAN ' + value : '“与WAN口同VLAN”'} 的有线口配置`
          )
        )
      }
      cb()
    }
    const existTransmodelidator = (rule, value, cb) => {
      if (
        value === 'nat' &&
        this.baseModel.editVlanId !== '233' &&
        this.pageData.singleList.some(o => o.transmode === 'nat')
      ) {
        return cb('已存在“路由”转发的匹配规则')
      }
      cb()
    }
    return {
      MAX_NUM: 8,
      MAX_AP_NUM: 32,
      AP_UNSUPPORT_LIST: ['EAP201', 'EAP202', 'EAP212(G)'],
      showTransMode: false,
      modalTitle: 'AP有线口设置',
      transmodeMap: {
        nat: '路由',
        bridge: '桥连接'
      },
      aplist: [
        // { sn: 'CAL91GE016016', dt: 'EAP201', nm: 'EAP104' },
        // { sn: 'CAL91GE016017', dt: 'EAP202', nm: 'EAP104' },
        // { sn: 'CAL91GE016018', dt: 'EAP201', nm: 'EAP105' },
        // { sn: 'CAL91GE016019', dt: 'EAP105', nm: 'EAP105 SN' },
        // { sn: 'H1MQ3W9000474', dt: 'EAP101', nm: 'ruijie1' },
        // { sn: 'CAL91GE01601C', dt: 'EAP101', nm: '工位' },
        // { sn: '1234942570022', dt: 'EAP102', nm: '11楼AP102' },
        // { sn: 'MACC8CX017421', dt: 'EAP101', nm: '8楼101' },
        // { sn: 'CAL91GE016011', dt: 'EAP102', nm: 'ABC' },
        // { sn: 'CAL91GE016012', dt: 'EAP102', nm: 'ruijie6' },
        // { sn: 'CAL91GE016013', dt: 'EAP101', nm: 'ruijie7' },
        // { sn: 'CAL91GE016014', dt: 'EAP101', nm: 'ruijie8' },
        // { sn: 'CAL91GE016015', dt: 'EAP101', nm: 'ruijie9' }
      ],
      pageData: {
        list: [],
        singleList: []
      },
      globalModel: {
        portId: '1',
        transmode: 'bridge',
        vlanId: ''
      },
      baseModel: this._getModelWirelan(),
      baseRules: {
        snList: [
          { required: true, message: '请选择要匹配的AP' },
          { validator: apNumValidator, maxApNum: this.MAX_AP_NUM }
        ],
        transmode: [{ validator: existTransmodelidator }],
        vlanId: [
          { validator: this.vlanIdValidator },
          { validator: existVlanValidator }
        ]
      },
      modalShow: false,
      disabledAp: [],
      netVlanId: [],
      editIndex: -1
    }
  },
  components: {
    ArpInput
  },
  computed: {
    isAlone() {
      return this.$roles().includes('alone')
    },
    globalApList() {
      let _global = this.pageData.list[0] || {}
      let _globalInSingleList = this.pageData.singleList.find(
        list =>
          _global.vlanId === list.vlanId && _global.transmode === list.transmode
      )
      _globalInSingleList = _globalInSingleList
        ? _globalInSingleList.snList
        : []

      return this.aplist
        .filter(
          ap =>
            !this.apConfiged.includes(ap.sn) &&
            !this.AP_UNSUPPORT_LIST.includes(ap.dt)
        )
        .map(ap => ap.sn)
        .concat(_globalInSingleList)
    },
    apConfiged() {
      return this.pageData.singleList.reduce(
        (apArr, n) => apArr.concat(n.snList),
        []
      )
    },
    apMap() {
      let _map = {}
      this.aplist.forEach(o => !_map[o.sn] && (_map[o.sn] = o))
      return _map
    },
    apGroup() {
      let _map = {}
      this.aplist.forEach(
        o => (!_map[o.dt] && (_map[o.dt] = [o])) || _map[o.dt].push(o)
      )
      return _map
    },
    // 排序AP列表，把不支持的列表放在最后
    apGroupKeys() {
      return Object.keys(this.apGroup)
        .sort()
        .sort((a, b) => (this.AP_UNSUPPORT_LIST.includes(a) ? 1 : 0))
    },
    ableApNum() {
      return this.MAX_AP_NUM - this.disabledAp.length
    },
    existVlanid() {
      return this.pageData.singleList
        .filter(
          o =>
            o.transmode === 'bridge' && o.vlanId !== this.baseModel.editVlanId
        )
        .map(o => o.vlanId)
    },
    showVlan() {
      return this.$roles().includes('ROUTER')
    }
  },
  created() {
    this._loadList()
    this._getStaListLite()
    this._getNetwork()
  },
  methods: {
    vlanIdValidator(rule, value, cb) {
      if (this.globalModel.transmode === 'bridge' && value !== '') {
        return vlanidOldValidator(rule, value, cb)
      }
      cb()
    },
    _getModelWirelan() {
      return {
        portId: '1',
        snList: [],
        transmode: 'bridge',
        vlanId: ''
      }
    },
    // 加载
    async _loadList() {
      let _res = await this.$api.getWireLan()
      // 转发模式根据设备工作模式生效，去掉转发模式配置（都设为bridge可设置vlanid）
      if (!this.showTransMode) {
        _res.list[0] && (_res.list[0].transmode = 'bridge')
        _res.singleList && _res.singleList.map(o => (o.transmode = 'bridge'))
      }
      this.globalModel = Object.assign({}, this.globalModel, _res.list[0] || {})
      this.pageData = Object.assign({}, this.pageData, _res || {})
    },
    async _getStaListLite() {
      let _res = await this.$api.getAplistLite({
        status: 'ON',
        productType: 'EAP'
      })
      this.aplist = (_res.list || []).filter(ap => ap.dt.includes('AP'))
      this.aplistCopy = [...this.aplist]
    },
    async _getNetwork() {
      let _res = await this.$api.getNetwork()
      this.netVlanId = (_res.lan || [])
        .filter(o => o.vlanid !== '233')
        .map(o => ({ value: o.vlanid, desc: o.desc }))
    },
    _getSumGroup(type) {
      const _typeList = this.apGroup[type] || []
      return (
        this.baseModel.snList.filter(sn => !!_typeList.find(ap => ap.sn === sn))
          .length || 0
      )
    },
    // 新增 || 编辑
    onEdit(index) {
      this.editIndex = index
      let row = this.pageData.singleList[index] || {}

      this.baseModel = Object.assign(this._getModelWirelan(), row)
      if (index === -1) {
        this.modalTitle = '添加AP有线口'

        if (this.pageData.singleList.length >= this.MAX_NUM) {
          return this.$message.warning(`最多支持配置 ${this.MAX_NUM} 条配置`)
        }
        if (this.apConfiged.length >= this.MAX_AP_NUM) {
          return this.$message.warning(`最多支持匹配 ${this.MAX_AP_NUM} 台AP`)
        }

        this.disabledAp = this.apConfiged
      } else {
        this.modalTitle = '编辑AP有线口'

        this.baseModel.editVlanId =
          row.transmode === 'bridge' ? row.vlanId : '233'
        this.disabledAp = this.apConfiged.filter(sn => !row.snList.includes(sn))
      }

      this.modalShow = true
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
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
        // 更新本地数据
        this.pageData.singleList = this.pageData.singleList.filter(o => {
          return !_items.find(so =>
            so.transmode === 'nat'
              ? o.transmode === 'nat'
              : o.transmode === 'bridge' && o.vlanId === so.vlanId
          )
        })
        this.onSave(true)
      })
    },
    onGlobalConfirm() {
      this.$refs.globalForm.validate(valid => {
        if (valid) {
          this.$set(
            this.pageData.list,
            0,
            Object.assign({}, this.pageData.list[0], this.globalModel)
          )
          this.onSave()
        }
      })
    },
    // 确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          delete this.baseModel.editVlanId

          this.editIndex === -1
            ? this.pageData.singleList.push(this.baseModel)
            : this.pageData.singleList.splice(this.editIndex, 1, this.baseModel)
          this.onSave()
        }
      })
    },
    // 校验通过下发数据
    async onSave(isDel) {
      await this.$api.setWireLan(this.pageData)
      this.$message.success(isDel ? '删除成功' : '保存配置成功')
      this.modalShow = false
    },
    goToLan() {
      this.$router.push({
        name: 'admin/alone/network/network_lan',
        query: { tab: '0' }
      })
    },
    filterAp(val) {
      if (val) {
        let _val = val.toLocaleLowerCase()
        this.aplist = this.aplistCopy.filter(
          ap =>
            ap.nm.toLocaleLowerCase().includes(_val) ||
            ap.sn.toLocaleLowerCase().includes(_val)
        )
      } else {
        this.aplist = this.aplistCopy
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

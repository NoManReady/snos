<template>
  <div class="network-vlan">
    <help-alert :key="showConflict" json-key="vlanJson" title="LAN设置" type="info">
      <template slot="content">
        <div class="mt10" v-if="showConflict">
          检测到LAN口存在
          <b>地址冲突</b>，为保证正常上网，已将LAN口IP地址从
          “
          <b>{{defaultVlan.lastaddr}}</b>”改为“
          <b>{{defaultVlan.ipaddr}}</b>”。
        </div>
      </template>
    </help-alert>

    <div class="box-header mt20">
      <span class="box-header-tit">
        LAN列表
        <small></small>
      </span>
      <div class="fr" v-if="showBtn">
        <el-button @click="onEdit(-1)" size="small" type="primary">
          <i class="el-icon-plus"></i>
          <span>新增</span>
        </el-button>
        <el-button size="small" type="primary" v-auth="onBatchDel">
          <i class="el-icon-delete"></i>
          <span>批量删除</span>
        </el-button>
      </div>
    </div>
    <help-alert :show-icon="false" title v-if="showBtn">
      <div slot="content">
        最大支持配置
        <b class="c-warning mlr5">{{MAX_NUM}}</b>个。
      </div>
    </help-alert>
    <el-table :data="vlanData.lan" ref="multipleTable" size="small" tooltip-effect="dark">
      <el-table-column :selectable="isSelectable" align="center" type="selection" width="50"></el-table-column>
      <el-table-column align="center" label="IP地址" prop="ipaddr"></el-table-column>
      <el-table-column align="center" label="子网掩码" prop="netmask"></el-table-column>
      <el-table-column :formatter="getVlanId" align="center" label="VlAN ID" prop="vlanid"></el-table-column>
      <el-table-column align="center" label="备注" prop="desc">
        <template slot-scope="{row}">{{row.desc || '-'}}</template>
      </el-table-column>
      <el-table-column :formatter="isDhcpOpen" align="center" label="DHCP服务" prop="ignore"></el-table-column>
      <el-table-column align="center" label="开始地址" prop="ipstart"></el-table-column>
      <el-table-column align="center" label="分配IP数" prop="limit"></el-table-column>
      <el-table-column align="center" label="地址租期(分钟)" prop="leasetime"></el-table-column>
      <el-table-column align="center" label="操作" width="100px">
        <template slot-scope="scope">
          <el-button @click="onEdit(scope.$index,scope.row)" type="text">修改</el-button>
          <el-button
            :disabled="!isCanEditVlanId(scope.row.vlanid)"
            @click="onDel(scope.$index,scope.row)"
            type="text"
            v-if="showBtn"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <div class="tc">
      <el-button type="primary" class="w200 mt20 mb20" v-auth="onSave">保存配置</el-button>
    </div>-->
    <!-- vlan编辑 -->
    <el-dialog :close-on-click-modal="false" :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="500px">
      <el-form :model="modelData" :rules="baseRules" label-width="160px" ref="baseForm" status-icon>
        <el-form-item label="IP地址" prop="ipaddr">
          <el-input @input.native="_onChangeLan" class="w200" v-model="modelData.ipaddr"></el-input>
        </el-form-item>
        <el-form-item label="子网掩码" prop="netmask">
          <netmask-input @input.native="_onChangeLan" @select="_onChangeLan(true)" class="w200" v-model="modelData.netmask"></netmask-input>
        </el-form-item>
        <el-form-item label="VlAN ID" prop="vlanid" v-if="curVlan.canEditVlanId">
          <el-input :disabled="!curVlan.canEditVlanId" class="w200" v-model="modelData.vlanid"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="desc">
          <el-input class="w200" placeholder="描述VLAN用途" v-model="modelData.desc"></el-input>
        </el-form-item>
        <el-form-item label="MAC地址" prop="macaddr">
          <el-input class="w200" v-model="modelData.macaddr"></el-input>
        </el-form-item>
        <el-form-item label="DHCP服务" prop="ignore">
          <el-switch active-value="0" inactive-value="1" v-model="modelData.ignore"></el-switch>
        </el-form-item>
        <div v-show=" modelData.ignore == '0' ">
          <el-form-item label="开始地址" prop="ipstart">
            <el-input @change="onValidateField('limit')" class="w200" v-model="modelData.ipstart"></el-input>
          </el-form-item>
          <el-form-item label="分配IP数" prop="limit">
            <el-input class="w200" v-model="modelData.limit"></el-input>
          </el-form-item>
          <el-form-item label="地址租期(分钟)" prop="leasetime">
            <el-input class="w200" v-model="modelData.leasetime"></el-input>
          </el-form-item>
          <el-form-item label="DNS服务器" v-if="isEg">
            <label class="w200">{{dnsServers || modelData.ipaddr || '-'}}</label>
            <el-tooltip effect="light" placement="bottom">
              <div slot="content">
                DNS服务器需要去“
                <a @click="_onToDhcpOption" class="c-success pointer">DHCP选项</a>
                ”页面修改
              </div>
              <i class="el-icon-info c-info"></i>
            </el-tooltip>
          </el-form-item>
        </div>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="isModalShow = false">取 消</el-button>
        <el-button type="primary" v-auth="onClickFormBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getRandomMac } from '@/utils/utils'
import {
  maskValidator,
  maskUsedValidator,
  ipValidator,
  macValidator,
  strictIpValidator,
  vlanidOldValidator
} from '@/utils/rules'
import { ipToLong, longToIp, isBetween, intValidate } from '@/utils/rulesUtils'
import formMixins from '@/mixins/formMixins'
import NetmaskInput from '@/common/NetMask'
import model from '@/model'
export default {
  name: 'NetworkVlan',
  data() {
    const limitValidate = (r, v, cb) => {
      if (!intValidate(v)) return cb(new Error('分配IP数必须为正整数'))
      let _maxLimit = this.maxLimit || 254
      if (v < 1 || v > _maxLimit)
        return cb(new Error(`分配IP数的范围为1-${_maxLimit}个`))
      cb()
    }
    const vlanipValidate = (r, v, cb) => {
      let _mask = this.modelData.netmask

      if (!_mask) return cb()
      let n = ipToLong(v) & ~ipToLong(_mask)
      let m = (ipToLong(v) + 1) & ~ipToLong(_mask)
      if (n === 0 || m === 0) return cb(new Error('请输入合法的IP地址'))
      cb()
    }
    const sameNetValidate = (r, v, cb) => {
      if (!this.modelData.netmask) return cb()
      let flag = true
      let curMaskInt = this.modelData.netmask
      curMaskInt = Number(curMaskInt.replace(/\./g, ''))
      this.vlanData.lan.forEach(item => {
        if (item.vlanid != this.curVlan.id && flag) {
          let listMaskInt = Number(item.netmask.replace(/\./g, ''))
          let mask = item.netmask
          if (listMaskInt > curMaskInt) mask = this.modelData.netmask
          if (
            (ipToLong(mask) & ipToLong(item.ipaddr)) ==
            (ipToLong(mask) & ipToLong(this.modelData.ipaddr))
          )
            flag = false
        }
      })
      if (!flag)
        return cb(new Error('此网段已存在配置，请修改IP地址或子网掩码'))
      return cb()
    }
    const starValidate = (r, v, cb) => {
      if (ipToLong(v) > this.range.end)
        return cb(new Error(`开始地址不能大于${this.range.endIp}`))
      if (ipToLong(v) < this.range.start)
        return cb(new Error(`开始地址不能小于${this.range.startIp}`))
      cb()
    }
    const sameVlanValidate = (r, v, cb) => {
      if (v != this.curVlan.id && this.vlanids.indexOf(v) >= 0)
        return cb(new Error('该VLAN ID已存在'))
      cb()
    }
    const leasetimeValidate = (r, v, cb) => {
      if (!intValidate(v)) return cb(new Error('请输入整数'))
      if (!isBetween(v, 2, 2880))
        return cb(new Error('地址租期范围为2~2880分钟'))
      cb()
    }
    return {
      MAX_NUM: 8,
      defaultVlan: { conflict: 'false' },
      dnsServers: '',
      vlanData: {
        lan: []
      },
      originDataStr: '',
      modelData: model.lanFn(),
      curVlan: {
        index: -1,
        id: '',
        canEditVlanId: true
      },
      modalTitle: '',
      isModalShow: false,
      baseRules: {
        ipaddr: [
          { required: true, message: '请输入IP地址' },
          { validator: strictIpValidator },
          { validator: vlanipValidate },
          { validator: sameNetValidate }
        ],
        macaddr: [
          { required: true, message: '请输入MAC地址' },
          { validator: macValidator }
        ],
        limit: [
          { required: true, message: '请输入分配IP数' },
          { validator: limitValidate }
        ],
        ipstart: [
          { required: true, message: '请输入开始地址' },
          { validator: ipValidator },
          { validator: starValidate }
        ],
        netmask: [
          { required: true, message: '请输入子网掩码' },
          { validator: maskValidator, message: '请输入有效的子网掩码' },
          { validator: maskUsedValidator }
        ],
        vlanid: [
          { required: true, message: '请输入VLAN ID' },
          { validator: vlanidOldValidator },
          { validator: sameVlanValidate }
        ],
        desc: [{ range: true, min: 1, max: 28, message: '备注为1-28个字符' }],
        leasetime: [
          { required: true, message: '请输入地址租期' },
          { validator: leasetimeValidate }
        ]
      }
    }
  },
  computed: {
    showConflict() {
      let _defaultVlan = this.defaultVlan
      return (
        _defaultVlan.conflict === 'true' &&
        _defaultVlan.lastaddr !== _defaultVlan.ipaddr
      )
    },
    showBtn() {
      return this.$roles().includes('ROUTER')
    },
    isError() {
      return !this.vlanData.wan
    },
    isEg() {
      return this.$dev() === 'egw'
    },
    vlanids() {
      return this.vlanData.lan.map(item => item.vlanid)
    },
    range() {
      if (!this.modelData.ipaddr || !this.modelData.netmask) {
        return {}
      }
      let _ip = this.modelData.ipaddr
      let _mask = this.modelData.netmask
      let _longIpStart = (ipToLong(_ip) & ipToLong(_mask)) + 1
      let _longIpEnd = (ipToLong(_ip) | ~ipToLong(_mask)) - 1
      return {
        start: _longIpStart,
        end: _longIpEnd,
        startIp: longToIp(_longIpStart),
        endIp: longToIp(_longIpEnd)
      }
    },
    maxLimit() {
      if (!this.range.end || !this.modelData.ipstart) {
        return ''
      }
      let _longIpStart = ipToLong(this.modelData.ipstart)
      if (_longIpStart >= this.range.start && _longIpStart <= this.range.end) {
        //合法的开始地址才更新分配IP数范围
        this.oldMaxLimit = this.range.end - _longIpStart + 1
      }
      return this.oldMaxLimit
    },
    preMac() {
      return this.$store.getters.sysinfo.sys_mac.substr(0, 8)
    }
  },
  created() {
    this.init()
  },
  mixins: [formMixins],
  components: {
    NetmaskInput
  },
  methods: {
    async init() {
      let data = await this.$api.getNetwork()

      this.vlanData = data || { lan: [] }
      if (!this.vlanData.lan || !Array.isArray(this.vlanData.lan))
        this.vlanData.lan = []
      this.originDataStr = JSON.stringify(this.vlanData.lan)
      this.getDefaultVlan(data)
      this._getDhcpOption()
    },
    async _getDhcpOption() {
      if (this.isEg) {
        let _dhcpOption = (await this.$api.getDhcpOption(true)).option || []
        this.dnsServers =
          (_dhcpOption.find(o => o.id === '6') || {}).value || ''
      }
    },
    _onToDhcpOption() {
      this.$router.push({
        name: 'admin/alone/network/network_lan',
        query: { tab: '3' }
      })
    },
    getDefaultVlan(data) {
      if (data && data.lan && data.lan.length > 0) {
        this.defaultVlan = Object.freeze({ ...data.lan[0] })
      } else {
        this.defaultVlan = Object.freeze({ conflict: 'false' })
      }
    },
    // 单个删除
    onDel(idx) {
      this.$confirm('是否确认删除？')
        .then(() => {
          this.setAcConfig(idx)
        })
        .catch(() => {})
    },
    // 批量删除
    onBatchDel() {
      let selection = this.$refs.multipleTable.selection
      if (!selection.length) {
        return this.$message.warning('请选择要删除的列表项')
      }
      this.$confirm('是否确认删除？')
        .then(() => {
          selection = selection.map(item => item.vlanid)
          let data = this.vlanData.lan.filter(item => {
            return selection.indexOf(item.vlanid) < 0
          })
          this.setAcConfig(null, data)
        })
        .catch(() => {})
    },
    onEdit(idx, row = {}) {
      let isEdit = idx >= 0
      if (!isEdit && this.vlanData.lan.length >= this.MAX_NUM)
        return this.$message.warning(`最多只能添加${this.MAX_NUM}条数据`)
      let title = isEdit ? '编辑' : '添加'
      this.onShowModal(title, idx, row, isEdit)
    },
    onShowModal(title, idx, data, isEdit) {
      this.isModalShow = true
      this.modalTitle = title
      this.curVlan.canEditVlanId = this.isCanEditVlanId(data.vlanid)
      this.curVlan.index = idx
      this.curVlan.id = data.vlanid
      this.modelData = Object.assign(model.lanFn(), data, {
        lastaddr: data.ipaddr,
        ovlanid: data.vlanid || '',
        macaddr: data.macaddr || getRandomMac(this.preMac)
      })
    },
    onClickFormBtn() {
      this.$refs.baseForm.validate(ok => {
        if (ok) {
          this.isModalShow = false
          let idx =
            this.curVlan.index < 0
              ? this.vlanData.lan.length + 1
              : this.curVlan.index

          this.modelData.limit = this.modelData.limit.toString() // 参数必须转成string类型
          if (!this.modelData.lastaddr) {
            this.modelData.lastaddr = this.modelData.ipaddr
          }
          this.setAcConfig(idx, Object.assign({}, this.modelData))
        }
      })
    },
    setAcConfig(idx, data) {
      if (typeof idx == 'number') {
        if (!data) {
          this.vlanData.lan.splice(idx, 1)
        } else {
          this.vlanData.lan.splice(idx, 1, data)
        }
      } else {
        this.vlanData.lan = data
      }
      this.vlanData.lanNum = this.vlanData.lan.length.toString()
      this.onSave()
    },
    onSave() {
      if (this.isError)
        return this.$alert(
          '数据异常，请确保网络已联通并刷新页面后配置。',
          '警告',
          { type: 'warning' }
        )
      if (this.originDataStr === JSON.stringify(this.vlanData.lan))
        return this.$message('配置未修改')
      this.$api.setNetwork(this.vlanData).then(
        data => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          this.originDataStr = JSON.stringify(this.vlanData.lan)
          this.getDefaultVlan() // 更新冲突提示信息
        },
        () => {
          return this.$alert(
            '数据异常，请确保网络已联通并刷新页面后配置。',
            '警告',
            { type: 'warning' }
          )
        }
      )
    },
    isDhcpOpen(row) {
      return row.ignore == '0' ? '已开启' : '未开启'
    },
    _onChangeLan(isSelect) {
      if (this.modelData.ipaddr) {
        // 触发校验网段是否已配置
        this.onValidateField('ipaddr')
      }
      if (this.range.startIp) {
        setTimeout(
          () => {
            this.modelData.ipstart = this.range.startIp
            this.modelData.limit = this.maxLimit
          },
          isSelect === true ? 100 : 0
        )
      }
    },
    getVlanId(row) {
      return this.isCanEditVlanId(row.vlanid) ? row.vlanid : '-'
    },
    isSelectable(row) {
      if (!this.isCanEditVlanId(row.vlanid)) return false
      return true
    },
    isCanEditVlanId(vlanid) {
      return vlanid == '233' ? false : true
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

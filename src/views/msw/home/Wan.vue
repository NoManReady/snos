<template>
  <div class="network-wan">
    <help-alert json-key="wanMswJson" title="管理IP" v-if="type==='select'">
      <div slot="content">上网配置页面</div>
    </help-alert>
    <el-form
      :class="type==='select'?'w500':''"
      :label-position="labelPos"
      :model="baseModel"
      :rules="baseRules"
      :size="type==='select'?'small':'normal'"
      class="components_wan web-form"
      label-width="160px"
      ref="baseForm"
    >
      <el-radio-group @change="_onProtoSwitch" class="radio-block mb20" v-if="type==='tab'" v-model="baseModel.proto">
        <el-radio-button
          :key="typer.value"
          :label="typer.value"
          :style="{width:100/staticTypes.length+'%'}"
          v-for="typer in staticTypes"
        >{{typer.label}}</el-radio-button>
      </el-radio-group>
      <el-form-item label="联网类型：" prop="proto" v-if="type==='select'">
        <el-select @change="_onProtoSwitch" style="width:340px;" v-model="baseModel.proto">
          <el-option :key="typer.value" :label="typer.label" :value="typer.value" v-for="typer in staticTypes"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item v-if="baseModel.proto==='dhcp'">
        <span class="c-info">DHCP动态上网无需账号密码</span>
      </el-form-item>-->
      <el-form-item label="管理VLAN：" prop="vlanid">
        <el-input placeholder="范围为1~4094,不填默认为1" v-model="baseModel.vlanid"></el-input>
        <el-tooltip class="item" content="(范围为1~4094,不填默认为1)" effect="light" placement="right">
          <i class="el-icon-info form-tip"></i>
        </el-tooltip>
      </el-form-item>
      <template v-if="baseModel.proto==='dhcp'">
        <template v-if="showStaticInfo">
          <el-form-item label="IP地址：">
            <label v-if="staticInfo.ip!=='0.0.0.0'">{{staticInfo.ip}}</label>
            <label v-else>
              <i class="el-icon-loading fs16"></i>
            </label>
          </el-form-item>
          <el-form-item label="子网掩码：">
            <label>{{staticInfo.mask}}</label>
          </el-form-item>
          <el-form-item label="网关：">
            <label>{{staticInfo.gateway||'0.0.0.0'}}</label>
          </el-form-item>
          <el-form-item label="DNS服务器：">
            <div v-if="staticInfo.dnsList.length">
              <p :key="dns+index" v-for="(dns,index) in staticInfo.dnsList.split(/\,|\s/)">{{dns}}</p>
            </div>
            <span v-else>0.0.0.0</span>
          </el-form-item>
        </template>
      </template>
      <template v-if="baseModel.proto==='static'">
        <el-form-item key="ipaddr" label="IP地址：" prop="ipaddr">
          <el-input @blur="_generateGateway('netmask')" placeholder="格式：192.168.1.1" v-model="baseModel.ipaddr"></el-input>
        </el-form-item>
        <el-form-item key="netmask" label="子网掩码：" prop="netmask">
          <net-mask
            @blur="_generateGateway('ipaddr')"
            placeholder="格式：255.255.255.0"
            style="width:100%;"
            v-model="baseModel.netmask"
          ></net-mask>
        </el-form-item>
        <el-form-item key="gateway" label="网关：" prop="gateway">
          <el-input placeholder="格式：192.168.1.1" v-model="baseModel.gateway"></el-input>
        </el-form-item>
        <el-form-item key="dns" label="DNS服务器：" prop="dns">
          <el-input placeholder="114.114.114.114，多个以空格隔开" v-model="baseModel.dns"></el-input>
          <el-tooltip class="item" content="格式：114.114.114.114（多个以空格隔开）" effect="light" placement="right">
            <i class="el-icon-info form-tip"></i>
          </el-tooltip>
        </el-form-item>
      </template>
      <el-form-item v-if="type==='select'">
        <el-button :loading="isLoading" class="w160" type="primary" v-auth="onSubmit">{{btnText}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import {
  maskValidator,
  ipValidator,
  dnsValidator,
  vlanidValidator
} from '@/utils/rules'
import { inSameNet, getGateway, isIp, getNetCodeNum } from '@/utils/rulesUtils'
import NetMask from '@/common/NetMask'
import { sleep } from '@/utils'
import { wan } from '@/model/msw/sec'
export default {
  name: 'home-wan',
  props: {
    labelPos: {
      type: String,
      default: 'right'
    },
    type: {
      type: String,
      default: 'select',
      validator(v) {
        return ['tab', 'select'].indexOf(v) > -1
      }
    }
  },
  components: {
    NetMask
  },
  data() {
    // 网关判断
    const gatewayValidator = (rule, value, cb) => {
      if (!inSameNet(this.baseModel.ipaddr, value, this.baseModel.netmask)) {
        cb(rule.message)
      } else {
        cb()
      }
    }
    // 判断管理vlan是否存在
    const vlanExistValidator = async (rule, value, cb) => {
      // vlan可以为空
      if (!value) {
        return cb()
      }
      if (this.vlanList.length === 0) {
        return cb(new Error('远程验证VLAN ID失败（请求超时或出现错误）'))
      }
      if (this.vlanList.find(lis => lis.v == value)) {
        cb()
      } else {
        cb(new Error('管理VLAN ID还未创建，请前往VLAN划分进行创建'))
      }
    }
    return {
      loop: true,
      isLoading: false,
      btnText: '加载中',
      network: null,
      staticInfo: {
        ip: '0.0.0.0',
        mask: '0.0.0.0',
        dnsList: '0.0.0.0',
        gateway: '0.0.0.0'
      },
      vlanList: [],
      baseModel: wan(),
      baseRules: {
        ipaddr: [
          { required: true, message: '请输入IP地址', whitespace: true },
          { validator: ipValidator, message: '请输入有效的IP地址' }
        ],
        netmask: [
          { required: true, message: '请输入子网掩码', whitespace: true },
          { validator: maskValidator, message: '请输入有效的子网掩码' }
        ],
        dns: [
          { required: true, message: '请输入DNS', whitespace: true },
          {
            validator: dnsValidator,
            message: '请输入有效的DNS地址,多个以空格隔开'
          }
        ],
        gateway: [
          { required: true, message: '请输入网关地址', whitespace: true },
          { validator: ipValidator, message: '请输入有效的IP地址' },
          {
            validator: gatewayValidator,
            message: '网关地址与IP地址不在同一个网段'
          }
        ],
        vlanid: [
          { validator: vlanidValidator, message: '请输入有效的VLAN ID' },
          { validator: vlanExistValidator }
        ]
      }
    }
  },
  async created() {
    try {
      await this._loadVlanList()
      await this._loadNetwork()
    } catch (error) {
      this.$message({
        message: '请求错误',
        type: 'warning'
      })
    }
  },
  beforeDestroy() {
    this.loop = false
  },
  computed: {
    staticTypes() {
      let _types = [
        {
          label: '动态IP',
          value: 'dhcp'
        },
        {
          label: '静态IP',
          value: 'static'
        }
      ]
      return _types
    },
    showStaticInfo() {
      if (!this.network) {
        return false
      }
      return (
        this.baseModel.proto === 'dhcp' &&
        this.network.wan[0].proto === this.baseModel.proto
      )
    }
  },
  methods: {
    // 加载network信息
    _loadNetwork() {
      this.isLoading = true
      let _promise = null
      _promise = this.$api.getNetwork(true)
      _promise
        .then(async d => {
          let _wan = d ? d.wan[0] : null
          if (_wan) {
            this._getWanIp()
            this.network = { ...d }
            this.baseModel = Object.assign(wan(), _wan || {})
          }
        })
        .finally(() => {
          this.btnText = '提交'
          this.isLoading = false
        })
    },
    // 获取wan口ip
    async _getWanIp() {
      if (!this.loop) {
        return
      }
      try {
        if (this.showStaticInfo) {
          let _result = await this.$api.getWanIp()
          this.staticInfo = _result.wan
        }
      } finally {
        await sleep(3000)
        this._getWanIp()
      }
    },
    // 网关生成
    _generateGateway(field) {
      try {
        this.$refs.baseForm && this.$refs.baseForm.validateField(field)
      } catch (e) {
      } finally {
        if (isIp(this.baseModel.ipaddr) && isIp(this.baseModel.netmask)) {
          if (
            this.baseModel.gateway &&
            inSameNet(
              this.baseModel.ipaddr,
              this.baseModel.gateway,
              this.baseModel.netmask
            )
          ) {
            return
          }
          this.baseModel.dns = this.baseModel.gateway = getGateway(
            this.baseModel.ipaddr,
            this.baseModel.netmask
          )
        }
      }
    },
    // 加载vlan列表
    async _loadVlanList() {
      try {
        let _result = await await this.$api.cmd(
          'devConfig.get',
          { module: 'vlan' },
          { isSilence: true, timeout: 0 }
        )
        this.vlanList = Object.freeze(_result.list || [])
      } catch (error) {}
    },
    // 协议tab切换
    _onProtoSwitch(v) {
      if (v === 'static') {
        if (!this.baseModel.ipaddr) {
          this.baseModel.ipaddr = this.staticInfo.ip
        }
        if (!this.baseModel.netmask) {
          this.baseModel.netmask = this.staticInfo.mask
        }
        if (!this.baseModel.dns) {
          this.baseModel.dns = this.staticInfo.dnsList
        }
        if (!this.baseModel.gateway) {
          this.baseModel.gateway = this.staticInfo.gateway
        }
      }
      this._clearValidate()
    },
    // 清除验证信息
    _clearValidate() {
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    // 表单验证
    validForm() {
      return new Promise((resolve, reject) => {
        this.$refs.baseForm.validate(valid => {
          if (valid) {
            let _model = {
              proto: this.baseModel.proto,
              vlanid: this.baseModel.vlanid
            }
            if (_model.proto === 'static') {
              _model.dns = this.baseModel.dns
              _model.ipaddr = this.baseModel.ipaddr
              _model.netmask = this.baseModel.netmask
              _model.gateway = this.baseModel.gateway
            }
            resolve(_model)
          } else {
            reject()
          }
        })
      })
    },
    // 表单验证
    async onSubmit() {
      let _model = await this.validForm()
      this.isLoading = true
      this.$set(this.network.wan, 0, _model)
      this.$api
        .setNetwork(this.network)
        .then(d => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        })
        .finally(async () => {
          this.isLoading = false
        })
    }
  }
}
</script>
<style lang="scss">
.network-wan {
  .form-tip {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate(105%, -50%);
  }
  .radio-block {
    width: 100%;
    .el-radio-button {
      // width: 33%;
      .el-radio-button__inner {
        width: 100%;
      }
    }
  }
}
</style>

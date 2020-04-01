<template>
  <div class="wan-wifi">
    <el-form
      :model="baseModel"
      :rules="baseRules"
      label-position="right"
      label-width="125px"
      ref="baseForm"
      size="medium"
      v-loading="loading"
    >
      <el-form-item :label="isEhr ? $t('quickmacc.net_name_ehr') : $t('quickmacc.net_name')" prop="networkName">
        <el-input
          :placeholder="isEhr ? $t('quickmacc.net_name_example_ehr') : $t('quickmacc.net_name_example')"
          v-model="baseModel.networkName"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('quickmacc.manage_pass')" prop="ewebPassword" v-if="isNew">
        <eweb-input-password :placeholder="$t('quickmacc.pass_example')" type="password" v-model="baseModel.ewebPassword"></eweb-input-password>
      </el-form-item>
      <el-form-item :label="$t('quickmacc.net_type')" prop="wan.proto">
        <el-radio-group @change="_onProtoSwitch" v-model="baseModel.wan.proto">
          <el-radio :key="typer.value" :label="typer.value" class="mr10" v-for="typer in supportTypes">
            {{ typer.label }}
            <el-button
              @click="_getIpinfo"
              plain
              size="mini"
              type="primary"
              v-if="typer.value === 'static'"
              v-show="baseModel.wan.proto === 'static'"
            >{{ $t("quickmacc.auto_set") }}</el-button>
          </el-radio>
        </el-radio-group>
        <div class="el-form-item__error c-info">
          <template v-if="dialType.includes('unknow')">{{$t("quickmacc.no_check_net_type")}}</template>
          <template v-else>
            {{$t("quickmacc.check_net_type")}}
            <span @click="_onSelectProto" class="c-success pointer">{{protoMap[dialType]}}</span>
          </template>
        </div>
      </el-form-item>
      <template v-if="baseModel.wan.proto === 'static'">
        <el-form-item :label="$t('sysinfo.ip_addr')" prop="wan.ipaddr">
          <el-input :placeholder="$t('wan.ip_example')" @blur="_generateGateway" v-model="baseModel.wan.ipaddr"></el-input>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.mask')" prop="wan.netmask">
          <net-mask
            :placeholder="$t('wan.mask_example')"
            @blur="_generateGateway"
            style="width:100%;"
            v-model="baseModel.wan.netmask"
          ></net-mask>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.gateway_addr')" prop="wan.gateway">
          <el-input :placeholder="$t('wan.ip_example')" v-model="baseModel.wan.gateway"></el-input>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.dns_addr')" prop="wan.dns">
          <el-input :placeholder="$t('wan.dns_example')" v-model="baseModel.wan.dns"></el-input>
        </el-form-item>
      </template>
      <template v-if="baseModel.wan.proto === 'pppoe'">
        <el-form-item :label="$t('network.wan.broadband_account')" prop="wan.username">
          <el-input :placeholder="$t('network.wan.broadband_account')" v-model="baseModel.wan.username"></el-input>
        </el-form-item>
        <el-form-item :label="$t('network.wan.broadband_password')" prop="wan.password">
          <eweb-input-password
            :placeholder="$t('network.wan.broadband_password')"
            type="password"
            v-model="baseModel.wan.password"
          ></eweb-input-password>
        </el-form-item>
        <pppoe-learn
          :remoteIp="slaverEgIp"
          :value="baseModel.wan.password"
          @result="_onLearnOk"
          v-if="slaverEgIp || (isEgw && !isBridgeForward)"
        ></pppoe-learn>
      </template>
      <template v-if="hasWifi">
        <el-form-item :label="$t('quickmacc.wifi_name')" prop="masterSsid.ssidName">
          <el-input placeholder v-model="baseModel.masterSsid.ssidName"></el-input>
        </el-form-item>
        <el-form-item label prop="masterSsid.encryptionMode">
          <el-radio-group v-model="baseModel.masterSsid.encryptionMode">
            <el-radio label="wpa_wpa2-psk">{{ $t("quickmacc.encrypt") }}</el-radio>
            <el-radio label="open">{{ $t("quickmacc.no_encrypt") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          :label="$t('quickmacc.wifi_pass')"
          prop="masterSsid.password"
          v-if="baseModel.masterSsid.encryptionMode !== 'open'"
        >
          <eweb-input-password type="password" v-model="baseModel.masterSsid.password"></eweb-input-password>
        </el-form-item>
      </template>
    </el-form>

    <el-dialog
      :close-on-click-modal="false"
      :title="$t('quickmacc.internet_fail')"
      :visible.sync="connectErrorShow"
      width="450px"
    >
      <strong>{{ netStatus.message || $t("quickmacc.internet_fail_reason") }}</strong>
      <span class="dialog-footer" slot="footer">
        <el-button @click="$emit('toWechat')" class="c-info" size="medium" type="text">{{ $t("quickmacc.not_connect_internet") }}</el-button>
        <el-button @click="$emit('reCheck')" size="medium" type="primary">{{ $t("diagnose.re_check") }}</el-button>
      </span>
    </el-dialog>

    <el-dialog :close-on-click-modal="false" :show-close="false" :visible.sync="connectOkShow" title width="450px">
      <div class="tc connect-ok">
        <div class="title mb15">
          <i class="el-icon-success w40 vm"></i>
          <strong class="fs20 w140 vm">{{ $t("quickmacc.cfg_success") }}</strong>
        </div>
        <div class="box">
          <ul class="content tl">
            <li>
              <label>{{ $t("quickmacc.proj_name_f") }}</label>
              <span>{{ baseModel.networkName }}</span>
            </li>
            <li v-if="hasWifi">
              <label>{{ $t("quickmacc.wifi_name_f") }}</label>
              <span>{{ baseModel.masterSsid.ssidName }}</span>
            </li>
            <li v-if="isNew">
              <label>{{ $t("quickmacc.manage_pass_f") }}</label>
              <span>{{ baseModel.ewebPassword || "-" }}</span>
            </li>
          </ul>
        </div>
        <span>{{ $t("quickmacc.judge_to_whole") }}</span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import NetMask from '@/common/NetMask'
import InputPassword from '@/common/InputPassword'
import PppoeLearn from '@/views/common/network/components/PppoeLearn'
import wanMixins from '@/views/common/quickmacc/wanMixins'
import wifiMixins from '@/views/common/quickmacc/wifiMixins'
import { ssidNameValidator, wifiNameValidator } from '@/utils/rules'
import { sleep } from '@/utils'
import { deepClone } from '@/utils/utils'
import { doSameConfig } from '@/utils'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'WanWifi',
  data() {
    let _nameMsg = this.$roles().includes('ehr')
      ? I18N.t('quickmacc.proj_name_empty_ehr')
      : I18N.t('quickmacc.proj_name_empty')
    return {
      loading: true,
      connectOkShow: false,
      connectErrorShow: false,
      isNew: true,
      dialType: 'dhcp',
      networkId: {},
      network: {},
      originalModel: {},
      baseModel: {
        networkName: ''
      },
      baseRules: {
        networkName: [
          {
            required: true,
            message: _nameMsg,
            whitespace: true
          },
          { validator: wifiNameValidator },
          { validator: ssidNameValidator, size: 32 }
        ]
      }
    }
  },
  mixins: [wanMixins, wifiMixins],
  components: {
    NetMask,
    PppoeLearn,
    [InputPassword.name]: InputPassword
  },
  computed: {
    ...mapGetters(['netStatus']),
    isEgw() {
      // egw ewr ehr
      return this.$dev() === 'egw'
    },
    isMsw() {
      return this.$roles().includes('msw')
    },
    hasWifi() {
      // 主设备或有无线的能力值
      return (
        (this.$roles().includes('master') && !this.isMsw) ||
        !!this.$store.getters.capacity.wireless
      )
    },
    slaverEgIp() {
      let _slaveEg = this.$route.meta.routeProps
      return (_slaveEg && _slaveEg.ip) || false
    }
  },
  async created() {
    this.baseModel = { ...this.baseModel, ...this.wanModel, ...this.wifiModel }
    await this._loadData()
    // 校验规则最后设置，否则有问题
    this.baseRules = { ...this.baseRules, ...this.wanRules, ...this.wifiRules }

    // 初始化时去掉检验信息（初始化会校验问题规避）
    this.$nextTick(() => {
      // 清除验证信息
      this.$refs.baseForm.clearValidate()
    })
  },
  methods: {
    ...mapActions(['getNetStatus']),
    async _loadData() {
      this.loading = true
      let params = [
        {
          method: 'devSta.get',
          params: { module: 'networkId' }
        },
        {
          method: 'devConfig.get',
          params: { module: 'network', remoteIp: this.slaverEgIp }
        }
      ]
      if (this.hasWifi) {
        params.push({
          method: 'acConfig.get',
          params: { module: 'wireless' }
        })
      }
      if (this.isEgw) {
        params.push({
          method: 'devSta.get',
          params: {
            module: 'network_dial',
            data: { port: 'wan' },
            remoteIp: this.slaverEgIp
          }
        })
      }
      const _res = await this.$api.cmd(
        'cmdArr',
        { params },
        { isSilence: true }
      )
      this.loading = false
      let _networkId = _res[0]
      this.networkId = _networkId
      this.network = _res[1]

      this.isNew = _networkId.networkId === '0'
      if (this.hasWifi) {
        this.wireless = _res[2]
        let _masterSsid = this.wireless.ssidList.find(
          ssid => ssid.wlanId === '1'
        )
        if (this.isNew && this.isRouter) {
          _masterSsid.ssidName = ''
        }
        this.baseModel.masterSsid = Object.assign(
          {},
          this.baseModel.masterSsid,
          _masterSsid
        )
      }

      this.baseModel = Object.assign(this.baseModel, {
        networkName: this.isNew
          ? this.isEhr
            ? I18N.t('quickmacc.parlor')
            : ''
          : _networkId.networkName === 'defaultNetwork'
          ? I18N.t('nei.unname_network')
          : _networkId.networkName,
        ewebPassword: '',
        wan: Object.assign({}, this.baseModel.wan, this.network.wan[0])
      })
      this.originalModel = deepClone(this.baseModel)

      if (this.isEgw) {
        this.dialType = _res[_res.length - 1].dial_type || 'static' // 不是pppoe和dhcp时

        // PPPoE校验异常的规避处理
        this.$nextTick(_ => {
          this._onSelectProto()
        })
      }
    },
    // 表单验证
    validForm() {
      return new Promise((resolve, reject) => {
        this.$refs.baseForm.validate(async (valid, d) => {
          if (valid) {
            // 自组网未完成
            const _wan0 = this._getWanModel(this.baseModel.wan)

            if (!(await this._checkUnknown(_wan0))) {
              return reject('unkonwn cancel')
            }

            // 检测配置未修改提醒确认
            let _doConfig = await doSameConfig(
              this.originalModel,
              this.baseModel
            )
            if (_doConfig === 'close') {
              return reject('close cancel')
            } else if (!_doConfig) {
              return resolve([
                { ewebPassword: this.isNew ? this.baseModel.ewebPassword : '' },
                false
              ])
            }

            // 更新修改的数据
            this.network.wan[0] = _wan0
            if (this.hasWifi) {
              this.wireless.ssidList.map(o =>
                o.wlanId === '1'
                  ? Object.assign(o, this.baseModel.masterSsid)
                  : o
              )
            }
            resolve([
              {
                networkName: this.baseModel.networkName,
                ewebPassword: this.isNew ? this.baseModel.ewebPassword : '',
                wireless: this.hasWifi ? this.wireless : false,
                network: this.network,
                remoteIp: this.slaverEgIp
              },
              _doConfig
            ])
          } else {
            this.$message.warning(I18N.t('quickset.data_invalid'))
            reject(d)
          }
        })
      })
    },
    // 未开局DHCP未获取到IP地址，角色色UNKONWN时候的提醒
    async _checkUnknown(wan) {
      if (
        this.isNew &&
        this.$roles().includes('unknown') &&
        wan.proto === 'dhcp'
      ) {
        let _doConfig = true
        try {
          _doConfig =
            (await this.$confirm(
              I18N.t('quickset.dev_no_join_tip'),
              I18N.t('phrase.tip'),
              {
                distinguishCancelAndClose: true,
                cancelButtonText: I18N.t('quickset.no_cfg_now'),
                confirmButtonText: I18N.t('quickset.cfg_ok'),
                closeOnClickModal: false,
                distinguishCancelAndClose: true
              }
            )) === 'confirm'
        } catch (error) {
          // if (error === 'close') {
          //   return false
          // }
          _doConfig = false
        }
        return _doConfig
      }
      return true
    },
    // 检测网络ok
    async checkNetwork(timeout = 30) {
      let _start = new Date().getTime()
      let _countError = 1
      let _countOk = 1
      let _isOk = false
      this.connectErrorShow = false
      const _isTimeout = () => {
        let _now = new Date().getTime()
        if (_now - _start > timeout * 1000) {
          timeout = 0
          return true
        }
        return false
      }
      // 网络不通(异常/不通)累计2次，或者 网络连通正常连续2次 退出循环
      while (timeout > 0 && _countError <= 2 && _countOk <= 2) {
        try {
          await this.getNetStatus()
        } catch (error) {}
        _isOk = this.netStatus.connnected === 'true'
        if (_isOk) {
          // 连续成功次数
          _countOk++
        } else {
          // 累计失败次数
          _countError++
          // 一旦失败重新计数
          _countOk = 1
        }
        // 判断是否超时
        if (!_isTimeout()) {
          await sleep(2000)
        }
      }
      // 连续2次OK
      if (_countOk > 2) {
        this.connectOkShow = true // 显示网络连通成功
        return true
      }
      // 网络连通失败原因
      if (_countError >= 2) {
        this.netStatus.message =
          this.netStatus.message || I18N.t('quickmacc.connect_fail')
      } else if (timeout === 0) {
        if (_isOk) {
          // 网络连通成功过
          this.netStatus.message = I18N.t('quickmacc.connect_timeout')
        } else {
          this.netStatus.message =
            this.netStatus.message || I18N.t('quickmacc.connect_err_unknow')
        }
      }
      this.connectErrorShow = true
      return false
    }
    /* async submit() {
      let params = [
        {
          method: 'devSta.set',
          params: {
            module: 'networkId',
            data: Object.assign(this.networkId, {
              networkName: this.baseModel.networkName
            })
          }
        },
        {
          method: 'acConfig.set',
          params: {
            module: 'wireless',
            data: this.wireless
          }
        },
        {
          method: 'devConfig.set',
          params: {
            module: 'network',
            data: this.network
          }
        }
      ]
      await this.$api.cmd('cmdArr', { params })
      this.$message.success('配置下发成功，检测网络连通性...')
    } */
  }
}
</script>
<style lang="scss">
@import '~@/style/utils/_variable.scss';
.wan-wifi {
  width: 50%;
  margin: 0 auto;
  .connect-ok {
    .title i {
      font-size: 40px;
      color: $--color-success;
    }
    .content {
      margin-left: 100px;
      li {
        line-height: 2;
        list-style-type: disc;
        label {
          display: inline-block;
          width: 100px;
        }
      }
    }
  }
  .box {
    background-color: $--background-color-base;
  }
}
@media only screen and (max-width: 1200px) {
  .wan-wifi {
    width: 60%;
  }
}
@media only screen and (max-width: 992px) {
  .wan-wifi {
    width: 80%;
  }
}
@media only screen and (max-width: 768px) {
  .wan-wifi {
    width: 90%;
  }
}
</style>

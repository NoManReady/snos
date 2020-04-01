<template>
  <div class="m-network">
    <div class="fs16">
      <strong>上网方式：</strong>
      <span class="fr">
        <label v-if="!dialType">
          <i class="el-icon-loading fs16 mr5"></i>正在检测上网方式
        </label>
        <label v-else>
          推荐使用
          <a @click="_onSelectProto" class="c-success pointer">{{protoMap[dialType]}}</a>
          上网
        </label>
      </span>
    </div>
    <el-form
      :model="baseModel"
      :rules="baseRules"
      class="unset-mobile lable-width"
      label-position="top"
      ref="baseForm"
      size="medium"
      v-loading="loading"
    >
      <el-radio-group @change="_onProtoSwitch" class="mt10" v-model="baseModel.wan.proto">
        <el-radio-button :key="typer.value" :label="typer.value" v-for="typer in supportTypes">{{typer.label}}</el-radio-button>
      </el-radio-group>
      <div class="block m-box network-box">
        <template v-if="baseModel.wan.proto === 'pppoe'">
          <el-form-item prop="wan.username">
            <template slot="label">
              <span>宽带账号</span>
              <span class="c-info fr">由运营商提供</span>
            </template>
            <el-input placeholder="请输入宽带账号" v-model="baseModel.wan.username"></el-input>
          </el-form-item>
          <el-form-item prop="wan.password">
            <template slot="label">
              <span>宽带密码</span>
              <pppoe-learn :is-mobile="true" :value="baseModel.wan.password" @result="_onLearnOk"></pppoe-learn>
            </template>
            <eweb-input-password
              :placeholder="$t('network.wan.broadband_password')"
              type="password"
              v-model="baseModel.wan.password"
            ></eweb-input-password>
          </el-form-item>
        </template>
        <template v-else-if="baseModel.wan.proto === 'static'">
          <el-form-item label prop="wan.ipaddr">
            <slot name="label">
              <label class="vm">IP地址</label>
              <a @click="_getIpinfo" class="c-success pointer fr">填入当前WAN口信息</a>
            </slot>
            <el-input @blur="_generateGateway" placeholder="格式：192.168.23.2" v-model="baseModel.wan.ipaddr"></el-input>
          </el-form-item>
          <el-form-item label="子网掩码" prop="wan.netmask">
            <net-mask @blur="_generateGateway" placeholder="格式：255.255.255.0" style="width:100%;" v-model="baseModel.wan.netmask"></net-mask>
          </el-form-item>
          <el-form-item label="网关地址" prop="wan.gateway">
            <el-input placeholder="格式：192.168.1.1" v-model="baseModel.wan.gateway"></el-input>
          </el-form-item>
          <el-form-item label="DNS地址" prop="wan.dns">
            <el-input placeholder="114.114.114.114，多个以空格隔开" v-model="baseModel.wan.dns"></el-input>
          </el-form-item>
        </template>
        <template v-else>
          <p class="tc c-info">由上联设备DHCP分配</p>
        </template>
      </div>
      <el-form-item class="mt10" v-if="!isQuick">
        <el-button @click="onSave" type="primary">保存</el-button>
      </el-form-item>
    </el-form>
    <!-- <div class="bottom-wrap tc" v-if="false">
        <a @click="_onToRepeater" class="vm c-success pointer fs16">
          <i class="el-icon-sort icon-rotate"></i>有线中继
        </a>
        <div class="line vm"></div>
        <a @click="_onToRepeater" class="vm c-success pointer fs16">
          <i class="el-icon-sort icon-rotate"></i>无线中继
        </a>
    </div>-->
  </div>
</template>
<script>
import NetMask from '@/common/NetMask'
import InputPassword from '@/common/InputPassword'
import PppoeLearn from '@/views/common/network/components/PppoeLearn'
import wanMixins from '@/views/common/quickmacc/wanMixins'
import { doSameConfig, sleep } from '@/utils'
export default {
  name: 'MNetwork',
  props: {
    isQuick: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: true,
      dialType: false, //'static',
      network: {},
      baseModel: {},
      baseRules: {}
    }
  },
  mixins: [wanMixins],
  components: {
    NetMask,
    PppoeLearn,
    [InputPassword.name]: InputPassword
  },
  async created() {
    this.baseModel = { ...this.wanModel }
    await this._loadData()
    this.baseRules = { ...this.wanRules }
  },
  methods: {
    async _loadData() {
      this._onLoading(true)
      let params = [
        {
          method: 'devConfig.get',
          params: { module: 'network' }
        },
        {
          method: 'devSta.get',
          params: {
            module: 'network_dial',
            data: { port: 'wan' }
          }
        }
      ]
      const _res = await this.$api.cmd(
        'cmdArr',
        { params },
        { isSilence: true }
      )
      this.network = _res[0]
      const _wan0 = _res[0].wan[0]
      this.baseModel.wan = Object.assign({}, this.baseModel.wan, _wan0)

      this.dialType = _res[_res.length - 1].dial_type || 'static' // 不是pppoe和dhcp时
      // 配置向导中才自动选择上网方式
      if (this.isQuick) {
        // PPPoE校验异常的规避处理
        this.$nextTick(_ => {
          this._onSelectProto()
        })
      }
      this._onLoading(false)
    },
    _onLoading(isLoading) {
      this.loading = isLoading
      this.$emit('post', { loading: isLoading })
    },
    _showMsg(msg) {
      this.$emit('post', { loadingMsg: msg })
      // if (!msg) {
      //   return this.loading && this.loading.close()
      // }
      // this.loading = this.$loading({ lock: true, text: msg })
    },
    async checkNetwork(_timeout = 30) {
      let _netStatus = false

      this.getNetworkStatus(_timeout - 2).then(d => (_netStatus = d))
      do {
        this._showMsg(`检测设备能否上网...${_timeout}秒`)
        await sleep(1000)
      } while (--_timeout > 0 && !_netStatus)

      this._showMsg(false)
      return await this.checkNetStatus(_netStatus)
    },
    //  0: 未联网，留本页修改配置  1: 未联网，重新检测   2: 联网正常/暂不联网，下一步
    async checkNetStatus(netStatus) {
      if (netStatus.isOk) {
        // 联网正常
        this.$message.success('设备联网正常...', { duration: 6000 })
        return 2
      }
      let _reCheck = 2
      try {
        _reCheck =
          (await this.$confirm(
            `<stong>${netStatus.message || '未知原因'}</stong>`,
            '设备未能联通外网',
            {
              distinguishCancelAndClose: true,
              dangerouslyUseHTMLString: true,
              cancelButtonText: '暂不联网，继续配置',
              confirmButtonText: '重新检测网络',
              closeOnClickModal: false
            }
          )) === 'confirm'
            ? 1
            : 2
      } catch (error) {
        _reCheck = error === 'close' ? 0 : 2
      }
      return _reCheck
    },
    // 下发配置
    onSave() {
      return new Promise((resolve, reject) => {
        this.$refs.baseForm.validate(async (valid, d) => {
          if (valid) {
            const _wan0 = this._getWanModel(this.baseModel.wan)
            let _doConfig = await doSameConfig(
              this.network.wan[0],
              _wan0,
              this.isQuick ? this.$t('quickset.skip_cfg') : '暂不配置'
            )

            if (_doConfig === 'close') {
              return false
            } else if (_doConfig) {
              // 确认下发 并 检测联网转台
              this.network.wan[0] = _wan0
              await this.$api.setNetwork(this.network, false).catch()

              if (this.isQuick) {
                // 快速配置才检测是否联网
                this._showMsg('配置已下发，努力生效中...')
                let _nextStep = 0 // 初始未联网，开始检测
                await sleep(8000)
                //  0: 未联网，留本页修改配置  1: 未联网，重新检测   2: 联网正常或暂不联网，下一步
                do {
                  let _time = _nextStep === 1 ? 20 : 35
                  _nextStep = await this.checkNetwork(_time)
                } while (_nextStep === 1) // 重新检测
                this._showMsg(false)
                return resolve(_nextStep === 2) // 联网成功或暂不联网，下一步，返回true
              }
              // 非快速配置直接诶返回成功
              this.$message.success('保存成功')
              return true
            }
            // 未修改配置，跳过配置，即下一步，返回true
            return resolve(true)
          } else {
            let _key = Object.keys(d)
            let _msg =
              (_key.length > 0 && d[_key[0]][0].message) || '请检查数据合法性'
            this.$message.warning(_msg)
            reject(d)
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.m-network {
  .network-box {
    border-top: none;
    border-radius: 0 0 4px 4px;
  }
  .line {
    display: inline-block;
    border-left: 2px solid $border-main;
    width: 1px;
    height: 24px;
    margin: 0 10px;
  }
  .icon-rotate {
    transform: rotate(90deg);
  }
  .bottom-wrap {
    position: fixed;
    bottom: 64px;
    left: 10px;
    right: 10px;
    background: #fff;
  }
}
</style>

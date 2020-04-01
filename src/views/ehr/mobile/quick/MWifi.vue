<template>
  <div class="m-wifi">
    <el-form
      :model="baseModel"
      :rules="baseRules"
      class="unset-mobile lable-width"
      label-position="top"
      ref="baseForm"
      size="medium"
      v-loading="loading"
    >
      <div class="fs18">
        <strong>Wi-Fi设置</strong>
        <a @click="$emit('toNetwork')" class="c-success pointer fr" type="text" v-if="isQuick">更改上网方式</a>
      </div>
      <div class="mtb20">
        <label>双频（2.4G/5G）二合一</label>
        <el-switch class="fr" v-model="isSameSsid"></el-switch>
      </div>
      <div class="block m-box">
        <el-form-item prop="masterSsid.ssidName">
          <template slot="label">
            <span>Wi-Fi名称(2.4G)</span>
            <span class="c-info fr">覆盖大，但速度相对慢</span>
          </template>
          <el-input :placeholder="$t('overview.wifi_no_empty')" v-model="baseModel.masterSsid.ssidName"></el-input>
        </el-form-item>
        <el-form-item prop="ssidName5G" v-if="!isSameSsid">
          <template slot="label">
            <span>Wi-Fi名称(5G)</span>
            <span class="c-info fr">速度快，但覆盖相对小</span>
          </template>
          <el-input :placeholder="$t('overview.wifi_no_empty')" v-model="baseModel.ssidName5G"></el-input>
        </el-form-item>
        <el-form-item prop="masterSsid.password">
          <template slot="label">
            <span>Wi-Fi密码</span>
            <span class="c-info fr">
              <el-checkbox v-model="isOpen">不加密</el-checkbox>
            </span>
          </template>
          <eweb-input-password placeholder="请输入WiFi密码" type="password" v-model="baseModel.masterSsid.password"></eweb-input-password>
        </el-form-item>
      </div>
      <template v-if="isNew">
        <div class="fs16 mt20">
          <strong>
            管理密码设置
            <span class="c-warning">（重要配置请记牢）</span>
          </strong>
        </div>
        <div class="mtb10">
          <el-checkbox :disabled="isOpen" v-model="isSamePwd">
            同Wi-Fi密码
            <span v-show="isOpen">（未设置Wi-Fi加密）</span>
          </el-checkbox>
        </div>
        <div class="block m-box" v-if="!isSamePwd">
          <el-form-item label="设备管理密码" prop="ewebPassword">
            <eweb-input-password placeholder="密码至少8位，最多31位" type="password" v-model="baseModel.ewebPassword"></eweb-input-password>
          </el-form-item>
        </div>
      </template>
      <el-form-item class="mt10" v-if="!isQuick">
        <el-button @click="onSave" type="primary">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import InputPassword from '@/common/InputPassword'
import wifiMixins from '@/views/common/quickmacc/wifiMixins'
import { mapGetters, mapActions } from 'vuex'
import { deepClone } from '@/utils/utils'
import { doSameConfig } from '@/utils'
export default {
  name: 'MWifi',
  props: {
    isQuick: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: true,
      isNew: false,
      isOpen: false,
      isSameSsid: false,
      isSamePwd: false,
      baseModel: { ssidName5G: '' },
      baseRules: {}
    }
  },
  async created() {
    this.baseModel = { ...this.baseModel, ...this.wifiModel }
    await this._loadData()
    this._changeWifiRules() // 手机界面Wi-Fi密码可选输入，设备密码校验减少限制
    this.baseRules = {
      ssidName5G: this.wifiRules['masterSsid.ssidName'],
      ...this.wifiRules
    }
    // 初始化时去掉检验信息（初始化会校验问题规避）
    this.$nextTick(() => {
      // 清除验证信息
      this.$refs.baseForm.clearValidate()
    })
  },
  mixins: [wifiMixins],
  components: {
    [InputPassword.name]: InputPassword
  },
  watch: {
    'baseModel.masterSsid.password'(v) {
      this.isOpen = v === ''
    },
    isOpen(v) {
      if (v) {
        this.isSamePwd = false
        if (this.baseModel.masterSsid.password !== '') {
          this.baseModel.masterSsid.password = ''
        }
      }
    },
    isSamePwd(v) {
      if (v) {
        if (this.baseModel.masterSsid.password === '') {
          this.isSamePwd = false
          return this.$message.warning('请先输入Wi-Fi密码')
        }
        this.baseModel.ewebPassword = this.baseModel.masterSsid.password
      } else {
        this.baseModel.ewebPassword = ''
      }
    },
    isSameSsid(v) {
      if (v) {
        this.baseModel.ssidName5G = ''
      } else {
        this.baseModel.ssidName5G = this._getSsidName5G()
      }
    }
  },
  computed: {
    masterSsid2() {
      return this.getMasterSsid(this.wireless.ssidList, '2')
    }
  },
  methods: {
    ...mapActions(['setIsDefaultPass']),
    _changeWifiRules() {
      Object.keys(this.wifiRules).forEach(key => {
        this.wifiRules[key] = this.wifiRules[key].filter(
          o => o.mobile !== false
        )
      })
    },
    async _loadData() {
      this.loading = true
      let params = [
        {
          method: 'devSta.get',
          params: { module: 'networkId' }
        },
        {
          method: 'acConfig.get',
          params: { module: 'wireless' }
        }
      ]
      const _res = await this.$api.cmd(
        'cmdArr',
        { params },
        { isSilence: true }
      )
      const _networkId = _res[0]
      this.isNew = _networkId.networkId === '0'
      this.wireless = _res[1]

      if (!this.isNew) {
        const _masterSsid = this.getMasterSsid(this.wireless.ssidList)

        this.isSameSsid = _masterSsid.relatedRadio === '1,2'
        this.baseModel = {
          ssidName5G: this._getSsidName5G(this.isSameSsid),
          masterSsid: {
            ssidName: _masterSsid.ssidName,
            encryptionMode: _masterSsid.encryptionMode,
            password:
              _masterSsid.encryptionMode !== 'open'
                ? _masterSsid.password || ''
                : ''
          },
          ewebPassword: ''
        }
      }
      this.loading = false
    },
    _getSsidName5G(isSameSsid) {
      if (isSameSsid) {
        return this.baseModel.masterSsid.ssidName
      }
      const _masterSsid2 =
        this.masterSsid2 || this.getMasterSsid(this.wireless.ssidList, '2')
      return _masterSsid2 && _masterSsid2.ssidName
        ? _masterSsid2.ssidName
        : `${this.baseModel.masterSsid.ssidName}_5G`
    },

    // 下发配置
    async onSave() {
      return new Promise((resolve, reject) => {
        this.$refs.baseForm.validate(async (valid, d) => {
          if (valid) {
            const _wireless_old = deepClone(this.wireless)
            this.updateWirelss(this.baseModel)

            let _doConfig = this.isNew
              ? true // 开局必下发配置
              : await doSameConfig(
                  this.wireless,
                  _wireless_old,
                  this.isQuick ? this.$t('quickset.skip_cfg') : '暂不配置'
                )

            if (_doConfig === 'close') {
              return false
            } else if (_doConfig) {
              // 确认下发
              this.$api
                .setQuickInfo(
                  {
                    wireless: this.wireless,
                    ewebPassword: this.baseModel.ewebPassword
                  },
                  this.isQuick
                )
                .catch()
              this.setIsDefaultPass(false)
            }
            _doConfig && !this.isQuick && this.$message.success('保存成功')
            return resolve({
              wechat: {
                ...this.baseModel,
                isSameSsid: this.isSameSsid // 双频合一
              },
              doConfig: _doConfig // 是否修改无线
            })
          } else {
            this.$message.warning('请检查数据合法性')
            reject(d)
          }
        })
      })
    },
    updateWirelss(baseModel) {
      const _masterSsid = {
        wlanId: '1',
        ...this.getMasterSsid(this.wireless.ssidList),
        ...baseModel.masterSsid,
        encryptionMode: baseModel.masterSsid.password ? 'wpa_wpa2-psk' : 'open'
      }
      let _masterSsid2 = false

      if (this.isSameSsid) {
        _masterSsid.relatedRadio = '1,2'
      } else {
        _masterSsid2 = deepClone(_masterSsid)
        _masterSsid2.wlanId = '2'
        _masterSsid.relatedRadio = '1'
        _masterSsid2.relatedRadio = '2'
        _masterSsid2.ssidName = baseModel.ssidName5G
      }

      // 更新主无线网络
      let _masterSsidIdx = this.wireless.ssidList.findIndex(
        wifi => wifi.wlanId === '1'
      )
      if (_masterSsidIdx >= 0) {
        this.wireless.ssidList.splice(_masterSsidIdx, 1, _masterSsid)
      } else {
        this.wireless.ssidList.unshift(_masterSsid)
      }

      // 更新主无线网络2
      let _masterSsid2Idx = this.wireless.ssidList.findIndex(
        wifi => wifi.wlanId === '2'
      )
      if (_masterSsid2Idx >= 0) {
        // 存在wlanId 2时更新/删除
        if (_masterSsid2) {
          this.wireless.ssidList.splice(_masterSsid2Idx, 1, _masterSsid2)
        } else {
          this.wireless.ssidList.splice(_masterSsid2Idx, 1)
        }
      } else if (_masterSsid2) {
        // 不存在wlanId 2 并且 设置了ssid2时 插入并排序
        this.wireless.ssidList.push(_masterSsid2)
        this.wireless.ssidList.sort(
          (wifi1, wifi2) => +wifi1.wlanId - wifi2.wlanId
        )
      }
    }
  }
}
</script>

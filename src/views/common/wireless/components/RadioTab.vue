<template>
  <div class="radio-tab">
    <help-alert type="info" v-if="showHelp">
      <template slot="title">
        <p>{{$t('wifi_comm.radio_cfg_tip')}}</p>
        <p class="mt5" v-if="isHealthyOn">
          <i18n path="wifi_comm.radio_cfg_tip1" tag="p">
            <span class="c-warning" place="place">{{$t('wifi_comm.radio_cfg_place')}}</span>
            <a @click="onToHealth" class="pointer c-success mlr5" place="healthy">{{$t('wifi_comm.healthy_mode')}}</a>
          </i18n>
        </p>
      </template>
      <template slot="content">漫游灵敏度”指无线终端在移动状态下，选择连接最佳的无线信号的速度。</template>
    </help-alert>
    <div class="box">
      <div class="box-header" v-if="showHelp">
        <span class="box-header-tit">{{$t('wifi_comm.channel_power_cfg')}}</span>
      </div>
      <div class="radio-tab-content">
        <help-alert :show-icon="false" title v-if="!showHelp && isHealthyOn">
          <template slot="content">
            <i18n path="wifi_comm.radio_cfg_tip1" tag="p">
              <span class="c-warning" place="place">{{$t('wifi_comm.radio_cfg_place')}}</span>
              <a @click="onToHealth" class="pointer c-success mlr5" place="healthy">{{$t('wifi_comm.healthy_mode')}}</a>
            </i18n>
          </template>
        </help-alert>
        <el-form :model="radios" class="web-form w800" label-width="160px" ref="baseForm" size="medium">
          <el-row>
            <el-col :key="radio.radioIndex" :lg="10" :md="12" :span="24" :xl="6" v-for="(radio,index) in radios.radioList">
              <el-form-item :prop="`radioList[${index}].channel`">
                <span slot="label">
                  <b class="f-theme">{{radio.type}}</b>
                  {{$t('wifi_comm.channel')}}
                </span>
                <el-select :disabled="isCpe || (repeaterRadio === radio.type)" v-model="radio.channel">
                  <el-option :label="$t('phrase.auto')" value="auto"></el-option>
                  <template v-if="radio.type==='2.4G'">
                    <el-option
                      :key="channel.v"
                      :label="channel.v+'（'+channel.k+'）'"
                      :value="channel.v"
                      v-for="channel in channel2G.items"
                    ></el-option>
                  </template>
                  <template v-else>
                    <el-option
                      :key="channel.v"
                      :label="channel.v+'（'+channel.k+'）'"
                      :value="channel.v"
                      v-for="channel in channel5G.items"
                    ></el-option>
                  </template>
                </el-select>
              </el-form-item>
              <slot :name="`estSetting`"></slot>
              <el-form-item :label="$t('wifi_comm.power')" :prop="`radioList[${index}].txpower`">
                <el-select v-model="radio.txpower">
                  <el-option :label="$t('phrase.auto')" value="auto"></el-option>
                  <el-option :label="$t('phrase.low')" value="50"></el-option>
                  <el-option :label="$t('phrase.middle')" value="75"></el-option>
                  <el-option :label="$t('phrase.high')" value="100"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('wifi_comm.distance')" :prop="`radioList[${index}].distance`" v-if="showDistance">
                <el-select v-model="radio.distance">
                  <el-option label="1KM" value="1000"></el-option>
                  <el-option label="2KM" value="2000"></el-option>
                  <el-option label="3KM" value="3000"></el-option>
                  <el-option label="4KM" value="4000"></el-option>
                  <el-option label="5KM" value="5000"></el-option>
                  <el-option label="6KM" value="6000"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :prop="`radioList[${index}].beacon_txpow_p`">
                <label slot="label">
                  <p>
                    <span class="vm">漫游灵敏度</span>
                    <el-tooltip effect="light" placement="top">
                      <template slot="content">
                        <ol class="ml15 ol-num">
                          <li>漫游灵敏度”指无线终端在移动状态下，选择连接最佳的无线信号的速度。</li>
                          <li>要注意的是漫游灵敏度越高，无线信号覆盖范围越小。</li>
                          <li>在固定状态下连接，不需要很高的灵敏度。</li>
                          <li>在移动状态下连接，存在多个wifi信号的前提下，可以通过提高“漫游灵敏度”来解决无线信号质量。</li>
                        </ol>
                      </template>
                      <i class="rjucd-help fs18 vm"></i>
                    </el-tooltip>
                  </p>
                </label>
                <el-row align="middle" class="form-input-pc" justify="center" type="flex">
                  <el-col :span="2" class="tl">
                    <el-tooltip effect="light" placement="top">
                      <template slot="content">
                        <p>灵敏度低，信号覆盖越广，减少终端漫游（减少终端切换Wi-Fi频率）</p>
                        <p>优点：保证无线连接不中断；缺点：保持连接的无线信号可能较差。</p>
                      </template>
                      <el-button @click="decrease(radio)" class="el-icon-remove-outline" size="mini" type="text"></el-button>
                    </el-tooltip>
                  </el-col>
                  <el-col :span="21">
                    <el-progress
                      :color="customColors"
                      :format="formatText"
                      :percentage="+radio.beacon_txpow_p"
                      :stroke-width="16"
                      :text-inside="true"
                    ></el-progress>
                  </el-col>
                  <el-col :span="1" class="tr">
                    <el-tooltip effect="light" placement="top">
                      <template slot="content">
                        <p>灵敏度高，减少信号覆盖，增加终端漫游（会增加终端切换Wi-Fi频率）</p>
                        <p>优点：保持连接较强的无线；缺点：但切换无线时终端网络会短暂断开。</p>
                      </template>
                      <el-button @click="increase(radio)" class="el-icon-circle-plus-outline" size="mini" type="text"></el-button>
                    </el-tooltip>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :lg="18" :md="22" :span="2" :xl="12">
              <el-form-item :class="{'tc': showHelp && radios.radioList.length > 1 }" v-if="showBtn && isLoadOk">
                <el-button class="w160" type="primary" v-auth="onSubmitRadio">{{$t('action.save_edit')}}</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template v-if="radios.radioList.length && !showBtn">
        <slot name="action"></slot>
      </template>
    </div>
  </div>
</template>
<script>
import radioMixins from './radioMixins'
export default {
  name: 'RadioTab',
  props: {
    showDistance: {
      default: false,
      type: Boolean
    },
    isCpe: {
      default: false,
      type: Boolean
    },
    remoteIp: {
      default: false,
      type: String | Boolean
    },
    showBtn: {
      default: true,
      type: Boolean
    },
    showHelp: {
      default: true,
      type: Boolean
    }
  },
  mixins: [radioMixins],
  data() {
    return {
      radios: {
        radioList: []
      },
      channel2G: {
        items: [],
        cur: ''
      },
      channel5G: {
        items: [],
        cur: ''
      },
      isHealthyOn: false,
      isLoadOk: false,
      customColors: [
        { color: '#018903', percentage: 41 },
        { color: '#2B6AFD', percentage: 80 },
        { color: '#F06F03', percentage: 100 }
      ]
    }
  },
  async created() {
    await this._loadChannels()
    await this._loadRadio()
    this._loadHealthy()
  },
  methods: {
    formatText(per) {
      let _txt = per
      switch (true) {
        case per >= 80:
          _txt = `信号弱 ${per}%`
          break
        case per <= 40:
          _txt = `信号强 ${per}%`
          break
        default:
          _txt = `${per}%`
          break
      }

      return _txt
    },
    increase(radio) {
      radio.beacon_txpow_p = +radio.beacon_txpow_p + 10
      if (radio.beacon_txpow_p > 100) {
        radio.beacon_txpow_p = 100
      }
    },
    decrease(radio) {
      radio.beacon_txpow_p = +radio.beacon_txpow_p - 10
      if (radio.beacon_txpow_p < 0) {
        radio.beacon_txpow_p = 0
      }
    },
    // 加载射频（设备）
    async _loadRadio() {
      let _radios = await this.$api.getRadio({ remoteIp: this.remoteIp })
      // 漫游灵敏度默认100
      _radios.radioList.map(radio => {
        radio.beacon_txpow_p = radio.beacon_txpow_p || '50'
        return radio
      })
      let [_isSingleRadio, _radioType] = [false, '2.4G']

      if (this.remoteIp) {
        // 远程配置要调用远程设备的能力值判断单双频
        let _radiosCap = await this.$api.getCapWireless({
          remoteIp: this.remoteIp
        })
        if (_radiosCap.radiolist) {
          _isSingleRadio = _radiosCap.radiolist.length === 1
          _radioType = _radiosCap.radiolist[0].band_support
        }
      } else {
        // 本地只要从vuex获取信息
        _isSingleRadio = this.$store.getters.isSingleRadio
        _radioType = this.$store.getters.singleRadioType
      }
      if (_isSingleRadio) {
        // 单频
        _radios.radioList = _radios.radioList.filter(radio => {
          return radio.type === _radioType
        })
      }
      this.radios = _radios
      this.isLoadOk = true
    },
    // 加载信道列表
    async _loadChannels() {
      let _channelStr = await this.$api.getChannel()
      this.channel2G = this._formatChannel(_channelStr.channel2G)
      this.channel5G = this._formatChannel(_channelStr.channel5G)
    },
    // 格式化信道
    _formatChannel(str) {
      let _arr = []
      let _curArr = ['auto', null]
      if (str) {
        let _temp = str.trim().split(/[↵,\n]/)
        let _last =
          _temp.filter(s =>
            s.toLocaleLowerCase().includes('current frequency')
          )[0] || ''

        let _reg = /\s*Channel\s*0?(\d+)\s*:\s*(\d+(.\d+)?\s*GHz)/
        _arr = _temp
          .filter(s => _reg.test(s))
          .map(item => {
            let _item = item.replace(_reg, '$1,$2')
            let _itemArr = _item.split(',')
            return {
              v: _itemArr[0],
              k: _itemArr[1]
            }
          })
        _curArr = _last
          .replace(/.*:(\d+(.\d+)?\s*GHz)\s*\(Channel\s*0?(\d+)\)/, '$1,$3')
          .split(',')
      }
      return {
        items: _arr,
        cur: _curArr[0] || 'auto',
        channel: _curArr[1] || '1'
      }
    },
    // 验证表单
    validateForm() {
      return new Promise((resolve, reject) => {
        this.$refs.baseForm.validate(valid => {
          if (valid) {
            this.radios.radioList.map(
              radio => (radio.beacon_txpow_p = '' + radio.beacon_txpow_p)
            ) // 转成字符串
            resolve(this.radios)
          } else {
            reject('Form validate error!')
          }
        })
      })
    },
    async _loadHealthy() {
      const _wireless = await this.$api.getWireless(
        false,
        {
          isSilence: true
        },
        { remoteIp: this.remoteIp }
      )
      this.isHealthyOn =
        !!_wireless.healthy && _wireless.healthy.enable === 'true'
    },
    // 保存配置Radio
    onSubmitRadio() {
      this.$emit('change', { res: 1, msg: 'start loading' })
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.radios.radioList.map(
            radio => (radio.beacon_txpow_p = '' + radio.beacon_txpow_p)
          ) // 转成字符串
          this.$api
            .setRadio(this.radios, { remoteIp: this.remoteIp })
            .then(d => {
              this.$emit('change', {
                res: d,
                msg: 'return set result',
                ...this.radios
              })
              if (d.code != 1) {
                this.$message({
                  type: 'success',
                  message: '设置成功'
                })
              }
            })
        }
      })
    },
    onToHealth() {
      this.$router.push({
        name: 'admin/wifi/wifi_setting',
        query: { tab: '3' }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.radio-tab {
  .form-input-pc {
    max-width: 200px;
  }
}
</style>

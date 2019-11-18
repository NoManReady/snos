<template>
  <div class="radio-tab">
    <help-alert type="info" v-if="showHelp">
      <template slot="title">
        <p>信道功率设置，只对当前设备生效。</p>
        <p class="mt5" v-if="isHealthyOn">
          在
          <span class="c-warning">健康模式生效的时段</span>里，设备优先以较低功率运行。
          您可以关闭
          <a @click="onToHealth" class="pointer c-success mlr5">健康模式</a>让功率以本页面配置为准。
        </p>
      </template>
    </help-alert>
    <div class="box">
      <div class="box-header" v-if="showHelp">
        <span class="box-header-tit">信道&功率设置</span>
      </div>
      <div class="radio-tab-content">
        <help-alert :show-icon="false" title v-if="!showHelp && isHealthyOn">
          <template slot="content">
            在
            <span class="c-warning">健康模式生效的时段</span>里，设备优先以较低功率运行。
            您可以关闭
            <a @click="onToHealth" class="pointer c-success mlr5">健康模式</a>让功率以本页面配置为准。
          </template>
        </help-alert>
        <el-form :model="radios" class="web-form w600" label-width="160px" ref="baseForm">
          <div
            :key="radio.radioIndex"
            :style="{width:1/radios.radioList.length*100+'%'}"
            class="vm"
            v-for="(radio,index) in radios.radioList"
          >
            <el-form-item :prop="`radioList[${index}].channel`">
              <span slot="label">
                <b class="f-theme">{{radio.type}}</b>信道
              </span>
              <el-select :disabled="isCpe" class="w200" v-model="radio.channel">
                <el-option label="自动" value="auto"></el-option>
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
            <el-form-item :prop="`radioList[${index}].txpower`" label="功率">
              <el-select class="w200" v-model="radio.txpower">
                <el-option label="自动" value="auto"></el-option>
                <el-option label="低" value="50"></el-option>
                <el-option label="中" value="75"></el-option>
                <el-option label="高" value="100"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :prop="`radioList[${index}].distance`" label="距离" v-if="showDistance">
              <el-select class="w200" v-model="radio.distance">
                <el-option label="1KM" value="1000"></el-option>
                <el-option label="2KM" value="2000"></el-option>
                <el-option label="3KM" value="3000"></el-option>
                <el-option label="4KM" value="4000"></el-option>
                <el-option label="5KM" value="5000"></el-option>
                <el-option label="6KM" value="6000"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <el-form-item :class="{'tc': showHelp && radios.radioList.length > 1 }" v-if="showBtn && isLoadOk">
            <el-button class="w200" type="primary" v-auth="onSubmitRadio">保存配置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <template v-if="radios.radioList.length && !showBtn">
        <slot name="action"></slot>
      </template>
    </div>
  </div>
</template>
<script>
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
      isLoadOk: false
    }
  },
  async created() {
    await this._loadChannels()
    await this._loadRadio()
    this._loadHealthy()
  },
  methods: {
    // 加载射频（设备）
    async _loadRadio() {
      let _radios = await this.$api.getRadio({ remoteIp: this.remoteIp })
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
</style>

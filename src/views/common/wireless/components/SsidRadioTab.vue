<template>
  <div class="ssid-radio-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :is-dev-group="wireless.existIndepend === 'true'" :json-key="'wifiRadioJson'" :max="MAX_NUM"></dev-ssid>
    <!-- 高级设置 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          <span class="vm">{{$t('wifi_comm.advanced_cfg')}}</span>
          <dev-group :exist-independ="wireless.existIndepend === 'true'" @change-group="changeGroup" v-if="!hideGroup"></dev-group>
        </span>
      </div>
      <el-form :disabled="!editable" :model="baseModel" class="box-content" label-width="140px" ref="baseForm" size="medium">
        <el-row>
          <el-col
            :key="index"
            :lg="10"
            :md="12"
            :span="24"
            :xl="6"
            v-for="(radio,index) in baseModel.radioList.slice(0,Math.min(2, baseModel.radioList.length))"
            v-show="showRadioFlag(radio.type)"
          >
            <el-form-item :label="$t('wifi_comm.radio_type')">
              <b class="f-theme">{{radio.type}}</b>
            </el-form-item>
            <el-form-item
              :label="$t('wifi_comm.user_cnt_max')"
              :prop="`radioList[${index}].maxSta`"
              :rules="countValidate(radio.type)"
            >
              <el-input :disabled="!editable" class="form-input-pc" v-model="radio.maxSta"></el-input>
            </el-form-item>
            <el-form-item :label="$t('wifi_comm.band_width')" :prop="`radioList[${index}].bandWidth`">
              <el-select :disabled="!editable || (repeaterRadio === radio.type)" v-model="radio.bandWidth">
                <el-option :key="band.value" :label="band.label" :value="band.value" v-for="band in _getBandByType(radio.type)"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :lg="18" :md="22" :span="2" :xl="12">
            <el-form-item :class="{'tc': baseModel.radioList.slice(0,Math.min(2, baseModel.radioList.length)) > 1 }">
              <el-button class="w160" size="medium" type="primary" v-auth="{fn:_onSaveRadio,params:'radio'}">{{$t('action.save')}}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>
<script>
import radioMixins from './radioMixins'
import { deepClone } from '@/utils/utils'
import { intValidate } from '@/utils/rulesUtils'
import DevSsid from './DevSsid'
import DevGroup from './DevGroup'
import wifiMixins from './wifiMixins'

const RADIO2G = {
  bandWidth: '20',
  country: 'CN',
  enable: 'true',
  hwmode: '11ng',
  maxSta: '32',
  radioIndex: '1',
  type: '2.4G'
}
const RADIO5G = {
  bandWidth: '40',
  country: 'CN',
  enable: 'true',
  hwmode: '11ac',
  maxSta: '32',
  radioIndex: '2',
  type: '5G'
}
export default {
  name: 'SsidRadioTab',
  data() {
    return {
      baseModel: {
        radioList: []
      }
    }
  },
  components: {
    [DevSsid.name]: DevSsid,
    [DevGroup.name]: DevGroup
  },
  mixins: [wifiMixins, radioMixins],
  computed: {
    isMaster() {
      return this.$roles().includes('master')
    }
  },
  created() {
    let _capWireless = this.$store.getters.capacity.wireless
    this.capRadiolist = _capWireless && _capWireless.radiolist
  },
  watch: {
    'wireless.radioList': {
      handler(v) {
        let _list = this.handlerRadiolist(deepClone(v))
        _list.forEach(radio => {
          radio.maxSta = this.getRadioMaxSta(radio.type, radio.maxSta)
          // macc下发为空时默认配置频宽
          if (!radio.bandWidth) {
            radio.bandWidth = 'auto'
          }
        })
        this.baseModel.radioList = _list
      },
      immediate: true
    }
  },
  methods: {
    // 获取radio频宽
    _getBandByType(type) {
      let _bands = [
        {
          value: 'auto',
          label: I18N.t('phrase.auto')
        },
        {
          value: '20',
          label: '20MHz'
        },
        {
          value: '40',
          label: '40MHz'
        }
      ]
      if (type === '5G') {
        _bands.push({ value: '80', label: '80MHz' })
      }
      return _bands
    },
    // 是否显示单频5G设置
    showRadioFlag(type) {
      let _flag = true
      if (!this.isMaster && this.capRadiolist) {
        _flag = this.capRadiolist.find(radio => {
          return radio.band_support === type
        })
      }
      return !!_flag
    },
    // 处理radiolist
    handlerRadiolist(radios = []) {
      if (!radios.length) {
        radios.push(RADIO2G)
      }
      if (radios.length === 1 && this.isMaster) {
        radios.push(RADIO5G)
      }
      return radios
    },
    // 获取最大用户数
    getRadioMaxSta(type, sta) {
      let _sta_limit_max = sta || (type === '2.4G' ? '64' : '128')
      if (this.capRadiolist) {
        let _r = this.capRadiolist.find(radio => {
          return radio.band_support === type
        })
        let _cap_sta_limit_max = !!_r ? _r.sta_limit_max : '64'
        _sta_limit_max = Math.min(_cap_sta_limit_max, _sta_limit_max) // 配置值若超过能力值，要选小值
      }
      return _sta_limit_max + ''
    },
    // 射频用户数验证
    countValidate(type) {
      let _maxSta = +this.getRadioMaxSta(type)
      return [
        {
          validator(rule, value, cb) {
            if (!intValidate(value)) {
              return cb(I18N.t('rules.require_int'))
            }
            let _value = +(value || 0)
            if (_value <= _maxSta && _value >= 1) {
              cb()
            } else {
              cb(I18N.t('wifi_comm.user_cnt_range', { max: _maxSta }))
            }
          }
        }
      ]
    },
    // ssid-radio保存
    _onSaveRadio() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _list = deepClone(this.baseModel.radioList)
          this.wireless.radioList = _list
          this._postWifiData()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.form-input-pc {
  max-width: 200px;
}
</style>
<template>
  <div class="ssid-radio-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :max="MAX_NUM" :is-dev-group="wireless.existIndepend === 'true'" :json-key="'wifiRadioJson'"></dev-ssid>
    <!-- 高级设置 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          <span class="vm">高级设置</span>
        </span>
        <dev-group @change-group="changeGroup" :exist-independ="wireless.existIndepend === 'true'" v-if="!hideGroup"></dev-group>
      </div>
      <el-form class="box-content" ref="baseForm" :model="baseModel" label-width="140px" :disabled="!editable">
        <div class="vm" v-for="(radio,index) in baseModel.radioList.slice(0,Math.min(2, baseModel.radioList.length))" :key="radio.radioIndex" :style="{width:1/Math.min(2,baseModel.radioList.length)*100+'%', minWidth: '300px'}" v-show="showRadioFlag(radio.radioIndex)">
          <el-form-item label="频段类型">
            <b class="f-theme">{{radio.type}}</b>
          </el-form-item>
          <el-form-item :prop="`radioList[${index}].maxSta`" label="最大用户数" :rules="countValidate(radio.radioIndex)">
            <el-input class="w200" v-model="radio.maxSta" :disabled="!editable"></el-input>
          </el-form-item>
          <el-form-item :prop="`radioList[${index}].bandWidth`" label="频宽">
            <el-select class="w200" v-model="radio.bandWidth" :disabled="!editable">
              <el-option v-for="band in _getBandByType(radio.radioIndex)" :key="band.value" :value="band.value" :label="band.label"></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="tc">
          <el-button class="w200" type="primary" v-auth="{fn:_onSaveRadio,params:'radio'}">保 存</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>
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
  mixins: [wifiMixins],
  computed: {
    capacity() {
      return this.$store.getters.capacity
    }
  },
  watch: {
    'wireless.radioList': {
      handler(v) {
        let _list = this.handlerRadiolist(deepClone(v))
        _list.forEach(radio => {
          radio.maxSta = this.getRadioMaxSta(
            radio.radioIndex,
            radio.maxSta
          )
          // macc下发为空时默认配置频宽
          if (!radio.bandWidth) {
            radio.bandWidth = 'auto'
            // radio.bandWidth = radio.radioIndex === '1' ? '20' : '40'
          }
        })
        this.baseModel.radioList = _list
      },
      immediate: true
    }
  },
  methods: {
    // 获取radio频宽
    _getBandByType(radioIndex) {
      let _bands = [
        {
          value: 'auto',
          label: '自动'
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
      if (radioIndex === '2') {
        _bands.push({ value: '80', label: '80MHz' })
      }
      return _bands
    },
    // 是否显示单频5G设置
    showRadioFlag(radioIndex) {
      let _flag = true
      if (this.capacity.wireless) {
        let _radioListCapacity = this.capacity.wireless.radiolist
        _flag =
          !!_radioListCapacity.find(radio => {
            return radio.index === radioIndex
          }) || this.$roles().includes('master')
      }
      return _flag
    },
    // 处理radiolist
    handlerRadiolist(radios = []) {
      if (!radios.length) {
        radios.push(RADIO2G)
      }
      if (radios.length === 1) {
        if (this.$roles().includes('egw') || this.$roles().includes('master')) {
          radios.push(RADIO5G)
        }
      }
      return radios
    },
    // 获取最大用户数
    getRadioMaxSta(radioIndex, sta) {
      let _radio = { sta_limit_max: sta || '64' }
      if (this.capacity.wireless && !this.$roles().includes('master')) {
        let _radioListCapacity = this.capacity.wireless.radiolist
        let _r = _radioListCapacity.find(radio => {
          return radio.index === radioIndex
        })
        if (_r) {
          _r = Object.assign({}, _r, {
            sta_limit_max: Math.min(_radio.sta_limit_max, _r.sta_limit_max) + ''
          })
        }
        _radio = _r || _radio
      }
      return _radio.sta_limit_max
    },
    // 射频用户数验证
    countValidate(radioIndex) {
      let _maxSta = +this.getRadioMaxSta(radioIndex)
      return [
        {
          validator(rule, value, cb) {
            if (!intValidate(value)) {
              return cb(`请输入整数`)
            }
            let _value = +(value || 0)
            if (_value <= _maxSta && _value >= 1) {
              cb()
            } else {
              cb(`用户数介于1~${_maxSta}之间`)
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
</style>
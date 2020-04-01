<template>
  <div class="healthy-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :is-dev-group="wireless.existIndepend === 'true'" :json-key="'wifiHealthyJson'" :max="MAX_NUM"></dev-ssid>
    <!-- 健康模式 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit vm">
          <span>{{$t('wifi_comm.healthy_mode')}}</span>
          <dev-group :exist-independ="wireless.existIndepend === 'true'" @change-group="changeGroup" v-if="!hideGroup"></dev-group>
        </span>
      </div>
      <el-form
        :disabled="!editable"
        :model="baseModel"
        :rules="healtyRules"
        class="box-content w550"
        label-width="160px"
        ref="baseForm"
      >
        <el-form-item :label="$t('wifi_comm.healty_status')" prop="enable">
          <el-switch active-value="true" inactive-value="false" v-model="baseModel.enable"></el-switch>
        </el-form-item>
        <template v-if="baseModel.enable==='true'">
          <!-- <el-form-item label="健康模式" prop="mode">
            <el-radio-group v-model="baseModel.mode" size="mini">
              <el-radio v-for="mode in healtyModes" :key="mode.value" :label="mode.value">{{mode.name}}</el-radio>
            </el-radio-group>
          </el-form-item>-->
          <el-form-item :label="$t('wifi_comm.effective_time')" prop="tmngtName">
            <el-select :placeholder="$t('action.select')" class="w200" v-model="baseModel.tmngtName">
              <el-option :key="item.tmngtName" :label="item.name" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
              <el-option :label="$t('wifi_comm.by_self')" value></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('wifi_comm.date')" class="is-required" prop="slot" v-if="baseModel.tmngtName === ''">
            <span @click="onOpenTimeSelection(baseModel.slot||{},editable?true:false)" class="f-theme pointer">
              <i class="el-icon-date"></i>
              {{!editable?$t('wifi_comm.view_time'):$t('wifi_comm.select_time')}}
            </span>
          </el-form-item>
        </template>
        <el-form-item label>
          <el-button class="w160" type="primary" v-auth="_onSaveHealty">{{$t('action.save')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import timeSelection from '@/utils/timeSelection'
import { deepClone } from '@/utils/utils'
import { healthyFn } from '@/model/modules/wireless'
import DevSsid from './DevSsid'
import DevGroup from './DevGroup'
import wifiMixins from './wifiMixins'

export default {
  name: 'HealthyTab',
  data() {
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    return {
      baseModel: healthyFn(),
      timeGroups: [],
      healtyModes: [
        { value: '0', name: I18N.t('wifi_comm.close_wifi') },
        { value: '25', name: I18N.t('wifi_comm.sleep_mode') },
        { value: '50', name: I18N.t('wifi_comm.healthy_mode') },
        { value: '75', name: I18N.t('wifi_comm.green_mode') }
      ],
      healtyRules: {
        slot: [
          {
            validator: timeValidator,
            message: I18N.t('wifi_comm.timerange_no_empty')
          }
        ]
      }
    }
  },
  components: {
    [DevSsid.name]: DevSsid,
    [DevGroup.name]: DevGroup
  },
  mixins: [wifiMixins],
  computed: {
    defaultTimeGroup() {
      let _firstGroup = this.timeGroups[0]
      return _firstGroup ? _firstGroup.tmngtName : ''
    }
  },
  watch: {
    'wireless.healthy': {
      handler(d) {
        this.baseModel = {
          ...healthyFn(),
          ...d,
          tmngtName: d.slot ? '' : d.tmngtName || this.defaultTimeGroup
        }
      },
      immediate: true
    }
  },
  created() {
    this._loadTimeGroupList()
  },
  methods: {
    // 加载时间对象列表
    async _loadTimeGroupList() {
      this.timeGroups = await this.$api.getDateManage(true)
    },
    // 打开时间范围控件
    onOpenTimeSelection(selections, enable) {
      timeSelection({
        selections,
        enable
      }).then(d => {
        this.baseModel.slot = Object.keys(d).length ? d : ''
        this.$refs.baseForm.validateField('slot')
      })
    },
    // 健康模式保存
    _onSaveHealty() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _healty = deepClone(this.baseModel)
          if (_healty.enable === 'true') {
            if (_healty.tmngtName) {
              _healty.slot = ''
            } else {
              _healty.tmngtName = new Date().getTime().toString()
            }
          } else {
            _healty.slot = ''
            _healty.tmngtName = ''
          }
          this.wireless.healthy = _healty
          this._postWifiData()
        }
      })
    }
  }
}
</script>
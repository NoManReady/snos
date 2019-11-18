<template>
  <div class="healthy-tab" v-show="isLoaded">
    <!-- 公寓SSID -->
    <dev-ssid :max="MAX_NUM" :is-dev-group="wireless.existIndepend === 'true'" :json-key="'wifiHealthyJson'"></dev-ssid>
    <!-- 健康模式 -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit vm">
          <span>健康模式</span>
        </span>
        <dev-group @change-group="changeGroup" :exist-independ="wireless.existIndepend === 'true'" v-if="!hideGroup"></dev-group>
      </div>
      <el-form class="box-content w550" ref="baseForm" :model="baseModel" :rules="healtyRules" label-width="100px" :disabled="!editable">
        <el-form-item label="健康模式开关" prop="enable">
          <el-switch v-model="baseModel.enable" active-value="true" inactive-value="false"></el-switch>
        </el-form-item>
        <template v-if="baseModel.enable==='true'">
          <!-- <el-form-item label="健康模式" prop="mode">
            <el-radio-group v-model="baseModel.mode" size="mini">
              <el-radio v-for="mode in healtyModes" :key="mode.value" :label="mode.value">{{mode.name}}</el-radio>
            </el-radio-group>
          </el-form-item> -->
          <el-form-item label="生效时段" prop="tmngtName">
            <el-select class="w200" v-model="baseModel.tmngtName" placeholder="请选择">
              <el-option v-for="item in timeGroups" :key="item.tmngtName" :label="item.tmngtName" :value="item.tmngtName">
              </el-option>
              <el-option label="自定义" value=""></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="is-required" label="日历" prop="slot" v-if="baseModel.tmngtName === ''">
            <span class="f-theme pointer" @click="onOpenTimeSelection(baseModel.slot||{},editable?true:false)">
              <i class="el-icon-date"></i>
              {{!editable?'查看时间':'选择时间'}}
            </span>
          </el-form-item>
        </template>
        <el-form-item label="">
          <el-button class="w200" type="primary" v-auth="_onSaveHealty">保 存</el-button>
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
        { value: '0', name: '关闭WIFI' },
        { value: '25', name: '睡眠模式' },
        { value: '50', name: '健康模式' },
        { value: '75', name: '绿色模式' }
      ],
      healtyRules: {
        slot: [{ validator: timeValidator, message: '请选择时间范围' }]
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
  created () {
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
<style lang="scss" scoped>
</style>
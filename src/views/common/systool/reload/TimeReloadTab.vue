<template>
  <div class="system-time-reload">
    <help-alert json-key="autoRreloadJson" title="定时重启">
      <div slot="content">
        <div>开启此功能将在指定时间进行定时重启，以获得更好的体验。建议定时重启时间在凌晨或无人使用网络的时间段执行。</div>
        <div class="mt5" v-if="!$roles().includes('alone')">注意：定时重启时，下联设备也会重启。</div>
      </div>
      <div slot="collapseFoot">
        <h3>注意：</h3>
        <p>定时功能基于系统时间工作，需要本设备的时间准确才能正常生效。</p>
      </div>
    </help-alert>
    <el-form class label-width="120px" ref="baseForm" size="small">
      <el-form-item label="定时重启功能">
        <el-switch active-value="1" inactive-value="0" v-model="enable"></el-switch>
      </el-form-item>
      <template v-if="enable==='1'">
        <el-form-item label="星期" prop="week">
          <el-checkbox-group v-model="week">
            <el-checkbox :key="index" :label="key" v-for="(value, key, index) in weekMap">{{value}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="时间">
          <el-select class="w100" v-model="time[0]">
            <el-option :key="hour" :label="hour-1|formatNum" :value="hour-1|formatNum" v-for="hour in 24"></el-option>
          </el-select>
          <b class="mlr5">:</b>
          <el-select class="w100" v-model="time[1]">
            <el-option :key="min" :label="min-1|formatNum" :value="min-1|formatNum" v-for="min in 60"></el-option>
          </el-select>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button class="w100" size="small" type="primary" v-auth="onSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { TimePicker } from 'element-ui'
import { awaitOnLine } from '@/utils'
const WEEKMAP = {
  mon: '一',
  tue: '二',
  wed: '三',
  thu: '四',
  fri: '五',
  sat: '六',
  sun: '日'
}
export default {
  name: 'SystemTimeReload',
  data() {
    return {
      enable: '0',
      week: [],
      time: ['00', '00'],
      orginData: {},
      weekMap: WEEKMAP
    }
  },
  filters: {
    formatNum(v) {
      return v.toString().padStart(2, 0)
    }
  },
  computed: {},
  components: {
    [TimePicker.name]: TimePicker
  },
  created() {
    this._initPage()
  },
  methods: {
    async _initPage() {
      let _d = await this.$api.getTimeReboot()
      this.orginData = _d
      this.enable = _d.enable || '0'
      this.week = Object.keys(_d.time || {})
      if (this.week.length > 0) {
        let _every_day = _d.time[this.week[0]][0][0]
        this.time = _every_day.split(':')
      }
    },
    onSave() {
      if (this.enable === '1' && this.week.length === 0) {
        this.$alert('请选择星期', { type: 'warning' })
        return
      }
      let _time = {}
      let _t = [...this.time]
      let _st = _t.join(':')
      _t[1] = (+_t[1] + 1).toString().padStart(2, 0)
      let _et = _t.join(':')
      let _tRange = [_st, _et]
      this.week.forEach(day => {
        _time[day] = [_tRange]
      })
      this.orginData.time = _time
      Object.assign(this.orginData, {
        enable: this.enable,
        time: _time
      })
      this.$api.setTimeReboot(this.orginData)
      this.$message({
        type: 'success',
        message: '保存成功'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

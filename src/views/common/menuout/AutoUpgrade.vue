<template>
  <div>
    <el-form :label-width="isMobile ? '0px' : '120px'" class="unset-mobile" size="medium">
      <el-form-item :label="isMobile ? '' : $t('systool.auto_upgrade')">
        <el-checkbox :value="autoUpgrade" @change="dialogFormVisible = true" false-label="0" true-label="1">
          <span :class="{'c-info': isMobile}">{{$t('systool.auto_upgrade_tip')}}</span>
        </el-checkbox>
      </el-form-item>
    </el-form>
    <el-dialog :append-to-body="true" :title="$t('systool.auto_upgrade')" :visible.sync="dialogFormVisible" width="480px">
      <template v-if="autoUpgrade === '0'">
        <strong class="vm mb30">{{$t('systool.auto_upgrade_open')}}</strong>
        <el-form label-width="120px" size="medium">
          <el-form-item :label="$t('systool.auto_upgrade_time')">
            <el-select class="w80" v-model="time[0]">
              <el-option :key="hour" :label="hour - 1" :value="hour - 1" v-for="hour in 24"></el-option>
            </el-select>
            <b class="mlr5">:</b>
            <el-select class="w80" v-model="time[1]">
              <el-option :key="min" :label="min - 1" :value="min - 1" v-for="min in 60"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <strong v-else>{{$t('systool.auto_upgrade_close')}}</strong>
      <div class="dialog-footer" slot="footer">
        <el-button @click="dialogFormVisible = false">{{$t('action.cancel')}}</el-button>
        <el-button @click="onSubmit" type="primary">{{$t('action.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'MenuoutAutoUpgrade',
  props: {
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogFormVisible: false,
      autoUpgrade: '0',
      time: ['3', '0']
    }
  },
  created() {
    this._loadData()
  },
  methods: {
    async _loadData() {
      let _res = await this.$api.cmd('devSta.get', {
        module: 'version_auto_upgrade'
      })
      this.autoUpgrade = _res.autoUpgrade || '0'
      this.time = (_res.cronTime || '3:0').split(':')
    },
    async onSubmit() {
      this.dialogFormVisible = false
      let _time = this.time.join(':')
      let _auto = this.autoUpgrade === '0' ? '1' : '0'
      await this.$api.cmd(
        'devSta.set',
        {
          module: 'version_auto_upgrade',
          data: {
            autoUpgrade: _auto,
            cronTime: _time
          }
        },
        { isSilence: this.isMobile }
      )
      this.autoUpgrade = _auto
      if (!this.isMobile) {
        this.$message.success(this.$t('tip.edit1_success'))
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

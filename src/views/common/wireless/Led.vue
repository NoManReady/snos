<template>
  <div>
    <div class="mb10">
      <help-alert :title="$t('wifi_comm.led_ctrl')" json-key type="info">
        <div slot="content">
          <i18n path="wifi_comm.led_ctrl_tip1">
            <strong class="c-warning">{{ isEhr ? '所有设备' : '下联EAP'}}</strong>
          </i18n>
          <label class="c-warning" v-if="!editAble">{{$t('wifi_comm.led_ctrl_tip2')}}</label>
        </div>
      </help-alert>
    </div>
    <el-form :model="baseModel" class="w500" label-width="160px" ref="baseForm" size="medium">
      <el-form-item :label="$t('wifi_comm.led_status')" prop="led_all">
        <el-switch :disabled="!editAble" active-value="restore" inactive-value="close" v-model="baseModel.led_all"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!editAble" @click="onSubmit" class="w160" type="primary">{{$t('action.save_edit')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'SystoolLedTab',
  data() {
    return {
      baseModel: {
        led_all: 'close'
      }
    }
  },
  computed: {
    editAble() {
      return !this.$roles().includes('slave')
    },
    isEhr() {
      return this.$roles().includes('ehr')
    }
  },
  created() {
    this._load()
  },
  methods: {
    // 加载wan口信息
    async _load() {
      let _res = await this.$api.cmd('acConfig.get', {
        module: 'devLed'
      })
      this.baseModel = Object.assign({}, this.baseModel, _res)
    },
    // 提交表单验证
    onSubmit() {
      this.$api
        .cmd('acConfig.set', {
          module: 'devLed',
          data: this.baseModel
        })
        .then(d => {
          this.$message({
            type: 'success',
            message: I18N.t('tip.edit1_success')
          })
        })
    }
  }
}
</script>

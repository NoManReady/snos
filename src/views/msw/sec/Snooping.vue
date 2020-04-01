<template>
  <div class="sec-snoop">
    <help-alert title="DHCP Snooping">
      <div slot="content">
        <i18n path="msw.snoop.explain_tip" tag="p">
          <b>{{$t('phrase.explain_f')}}</b>
        </i18n>
        <i18n path="msw.snoop.notice_tip" tag="p">
          <b>{{$t('phrase.notice_f')}}</b>
        </i18n>
      </div>
    </help-alert>
    <div class="box">
      <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="medium">
        <el-form-item :label="$t('msw.snoop.dhcp_switch')" prop="enable">
          <el-switch :active-value="1" :inactive-value="0" @change="_onModeChange" v-model="baseModel.enable"></el-switch>
        </el-form-item>
        <template v-if="baseModel.enable===1">
          <el-form-item label="Option 82：" prop="option82">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.option82"></el-switch>
          </el-form-item>
          <el-form-item :label="$t('msw.snoop.port_select')" class="inline-message" inline-message prop="lpid"></el-form-item>
          <port-panel :selecteds.sync="baseModel.lpid" has-agg mutilple />
          <el-form-item class="mt20">
            <el-button
              :loading="isLoading"
              class="w160"
              type="primary"
              v-auth="_onSaveConf"
            >{{isLoading?$t('action.editing'):$t('action.save_edit')}}</el-button>
          </el-form-item>
        </template>
      </el-form>
    </div>
  </div>
</template>
<script>
import PortPanel from '@/common/PortPanel'
import { rangeValidator } from '@/utils/rules'
import { snoop } from '@/model/msw/sec'
export default {
  name: 'sec-snoop',
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      isLoading: false,
      baseModel: snoop(),
      baseRules: {
        // lpid: [{ required: true, message: '请选择受信任端口' }]
      }
    }
  },
  created() {
    this._loadConf()
  },
  methods: {
    // 加载配置
    async _loadConf() {
      try {
        let _result = await this.$api.cmd(
          'devConfig.get',
          {
            module: 'dhcp_snooping'
          },
          { noParse: false }
        )
        this.baseModel = {
          enable: _result.enable,
          option82: _result.option82,
          lpid: _result.lpid || []
        }
      } catch (error) {}
    },
    // 模式改变
    async _onModeChange(v) {
      try {
        await this.$confirm(
          I18N.t('msw.snoop.dhcp_enable_confirm', {
            status: v === 1 ? I18N.t('phrase.enable') : I18N.t('phrase.disable')
          }),
          {
            confirmButtonText: I18N.t('action.confirm'),
            cancelButtonText: I18N.t('action.cancel'),
            type: 'warning'
          }
        )
        await this._onSaveConf()
      } catch (error) {
        this.baseModel.enable = v === 1 ? 0 : 1
      }
    },
    // 保存配置
    async _onSaveConf() {
      this.isLoading = true
      try {
        await this.$api.cmd('devConfig.set', {
          module: 'dhcp_snooping',
          data: this.baseModel
        })
        this.$message.success(I18N.t('tip.edit1_success'))
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>

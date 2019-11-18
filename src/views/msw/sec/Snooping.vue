<template>
  <div class="sec-snoop">
    <help-alert title="DHCP Snooping">
      <div slot="content">
        <p>
          <b>说明：</b>开启DHCP Snooping可以起到DHCP报文过滤的功能。对于DHCP客户端请求报文，仅将其转发到信任口，对于DHCP服务器响应报文，仅转发来自信任口的响应报文。
        </p>
        <p class="c-warning">
          <b>注意：</b>一般连接DHCP服务器端口设置为信任口。
        </p>
      </div>
    </help-alert>
    <div class="box">
      <el-form :model="baseModel" :rules="baseRules" label-width="165px" ref="baseForm" size="mini">
        <el-form-item label="DHCP Snooping开关：" prop="enable">
          <el-switch :active-value="1" :inactive-value="0" @change="_onModeChange" v-model="baseModel.enable"></el-switch>
        </el-form-item>
        <template v-if="baseModel.enable===1">
          <el-form-item label="Option82：" prop="option82">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.option82"></el-switch>
          </el-form-item>
          <el-form-item class="inline-message" inline-message label="选择信任口端口：" prop="lpid"></el-form-item>
          <port-panel :selecteds.sync="baseModel.lpid" has-agg mutilple />
          <el-form-item class="mt20">
            <el-button :loading="isLoading" size="small" type="primary" v-auth="_onSaveConf">保存配置</el-button>
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
          `是否确认${v === 1 ? '开启' : '关闭'}DHCP Snooping？`,
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
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
        this.$message.success('配置成功')
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>

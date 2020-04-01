<template>
  <el-popover placement="left" ref="devModePopover" trigger="click" width="340">
    <el-form :model="baseModel" label-width="120px" size="mini">
      <div class="mb20 c-info">
        <strong class="vm w45 vt">{{$t('phrase.explain_f')}}</strong>
        <ol class="ml40 ol-num">
          <li class="mt5">{{$t('overview.dev_mode_tip1')}}</li>
          <li class="mt5">{{$t('overview.dev_mode_tip2')}}</li>
          <li class="mt5">{{$t('overview.dev_mode_tip3')}}</li>
          <li class="mt5">{{$t('overview.dev_mode_tip4')}}</li>
        </ol>
      </div>
      <el-form-item :label="$t('overview.net_discovery')">
        <el-switch active-value="true" inactive-value="false" v-model="baseModel.autoJoin"></el-switch>
        <el-tooltip placement="right">
          <div slot="content">
            <ol class="ml20 ol-num">
              <li class="mt5">{{$t('overview.net_discovery_tip1')}}</li>
              <li class="mt5">{{$t('overview.net_discovery_tip2')}}</li>
            </ol>
          </div>
          <i class="rjucd-help fs20 vm c-info"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label>
        <el-button @click.native="_onSetDevMode" size="small" type="primary">{{$t('overview.switch_mode')}}</el-button>
      </el-form-item>
    </el-form>
    <slot slot="reference"></slot>
  </el-popover>
</template>
<script>
import { awaitOnLine_plus } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  name: 'dev-mode',
  data() {
    return {
      baseModel: { autoJoin: 'false' }
    }
  },
  created() {
    this.baseModel = { ...this.devMode }
  },
  computed: {
    ...mapGetters(['devMode'])
  },
  methods: {
    async _onSetDevMode() {
      if (this.baseModel.autoJoin !== this.devMode.autoJoin) {
        await this.$confirm(I18N.t('overview.modify_cfg_confirm'))
        await this.$api.setDevMode(this.baseModel)

        awaitOnLine_plus({
          time: 15000,
          text: I18N.t('overview.cfg_fresh_tip')
        }).then(() => {
          let _location = window.top.location
          window.top.location.href = `${_location.protocol}//${_location.host}`
        })
        this.$message({
          dangerouslyUseHTMLString: true,
          message: (
            <ol class="ml20 ol-num">
              <li class="mt5">{I18N.t('overview.dev_mode_tip1')}</li>
              <li class="mt5">{I18N.t('overview.dev_mode_tip2')}</li>
              <li class="mt5">{I18N.t('overview.dev_mode_tip3')}</li>
            </ol>
          ),
          center: true,
          duration: 0
        })
      } else {
        this.$message.info(I18N.t('overview.cfg_no_modify'))
        this.$refs.devModePopover.showPopper = false
      }
    }
  }
}
</script>

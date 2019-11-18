<template>
  <el-popover placement="left" ref="devModePopover" trigger="click" width="340">
    <el-form :model="baseModel" label-width="120px" size="mini">
      <div class="mb20 c-info">
        <strong class="vm w45 vt">说明：</strong>
        <ol class="ml40 ol-num">
          <li class="mt5">模式切换后，设备IP可能发生改变。</li>
          <li class="mt5">修改终端地址，让终端Ping通设备。</li>
          <li class="mt5">浏览器输入新地址重新访问WEB系统。</li>
          <li class="mt5">系统根据工作模式呈现不同的菜单项。</li>
        </ol>
      </div>
      <el-form-item label="自组网发现">
        <el-switch active-value="true" inactive-value="false" v-model="baseModel.autoJoin"></el-switch>
        <el-tooltip placement="bottom">
          <div slot="content">
            <ol class="ml20 ol-num">
              <li class="mt5">开启自组网发现，首页会显示自组网角色。</li>
              <li class="mt5">关闭自组网发现，单台设备独立模式。</li>
            </ol>
          </div>
          <i class="rjucd-help fs20 vm c-info"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label>
        <el-button @click.native="_onSetDevMode" size="small" type="primary">切换模式</el-button>
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
        await this.$confirm('确认修改配置？')
        await this.$api.setDevMode(this.baseModel)

        awaitOnLine_plus({
          time: 15000,
          text: '配置已修改，稍后将刷新页面。'
        }).then(() => {
          let _location = window.top.location
          window.top.location.href = `${_location.protocol}//${_location.host}`
        })
        this.$message({
          dangerouslyUseHTMLString: true,
          message: `<ol class="ml20 ol-num">
                      <li class="mt5">
                        模式切换后，设备IP可能会发生改变。
                      </li>
                      <li class="mt5">
                        修改终端地址，让终端与设备能够相通（同一个网段）。
                      </li>
                      <li class="mt5">
                        浏览器输入设备的地址重新访问WEB系统。
                      </li>
                    </ol>`,
          center: true,
          duration: 0
        })
      } else {
        this.$message.info('模式未修改')
        this.$refs.devModePopover.showPopper = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

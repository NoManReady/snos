<template>
  <div>
    <el-popover @show="onSwitchShow" placement="left" ref="devModePopover" trigger="click" width="340">
      <el-form :model="baseModel" label-width="120px" size="mini">
        <div class="mb20 c-info">
          <strong class="vm w45 vt">说明：</strong>
          <ol class="ml40 ol-num">
            <li class="mt5">模式切换后，设备IP可能发生改变。</li>
            <li class="mt5">修改终端地址，让终端Ping通设备。</li>
            <li class="mt5">浏览器输入新地址重新访问WEB系统。</li>
            <li class="mt5">系统根据工作模式呈现不同的菜单项。</li>
            <li class="mt5 c-danger">工作模式切换会恢复出厂并重启设备。</li>
          </ol>
        </div>
        <el-form-item label="工作模式">
          <el-select class="w100" placeholder="请选择" v-model="baseModel.forwardMode">
            <el-option :key="k" :label="v" :value="k" v-for="(v, k) in modeMap"></el-option>
          </el-select>
          <el-tooltip placement="top">
            <div slot="content">
              <ol class="ml20 ol-num">
                <li class="mt5" v-if="modeMap.ROUTER">路由模式，Nat路由转发。</li>
                <li class="mt5" v-if="modeMap.AC">AC模式，Bridge桥转发。</li>
                <li class="mt5" v-if="modeMap.AP">AP模式，Bridge桥转发。</li>
              </ol>
            </div>
            <i class="rjucd-help fs20 vm c-info"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="自组网发现">
          <el-switch
            :disabled="baseModel.forwardMode === 'AC'"
            active-value="true"
            inactive-value="false"
            v-model="baseModel.autoJoin"
          ></el-switch>
          <el-tooltip placement="bottom">
            <div slot="content">
              <ol class="ml20 ol-num">
                <li class="mt5">开启自组网发现，首页会显示自组网角色。</li>
                <li class="mt5">关闭自组网发现，单台设备独立模式。</li>
                <li class="mt5" v-if="modeMap.AC">AC模式下，设备默认开启自组网发现。</li>
              </ol>
            </div>
            <i class="rjucd-help fs20 vm c-info"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="AC功能开关" v-show="baseModel.autoJoin === 'true' && baseModel.forwardMode === 'ROUTER'">
          <el-switch active-value="true" inactive-value="false" v-model="baseModel.acEnable"></el-switch>
          <el-tooltip placement="bottom">
            <div slot="content">
              <ol class="ml20 ol-num">
                <li class="mt5">默认开启，设备具备虚拟AC功能，管理下联设备。</li>
                <li class="mt5">关闭时，设备需通过自组网选举为AC才能管理下联设备。</li>
              </ol>
            </div>
            <i class="rjucd-help fs20 vm c-info"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label>
          <el-button @click.native="onSetDevMode" size="small" type="primary">切换模式</el-button>
        </el-form-item>
      </el-form>
      <slot slot="reference"></slot>
    </el-popover>
  </div>
</template>
<script>
import { awaitOnLine } from '@/utils'
export default {
  name: 'DevMode',
  data() {
    return {
      modeMap: {
        ROUTER: '路由模式',
        AC: 'AC模式',
        AP: 'AP模式'
      },
      baseModel: {
        forwardMode: 'ROUTER', // ROUTER|AC|AP转发面：转发模式
        autoJoin: 'true', // 管理面：是否组网
        acEnable: 'true' // 管理面：是否指定为master
      }
    }
  },
  created() {
    if (this.isEg) {
      delete this.modeMap.AP
    } else {
      // EGW和EAP去掉AC模式
      delete this.modeMap.AC
    }
  },
  computed: {
    devMode() {
      return this.$store.getters.devMode || {}
    },
    // EAP设备或者AP模式
    isEap() {
      return this.$dev() === 'eap' || this.baseModel.forwardMode === 'AP'
    },
    // 不带无线功能
    isEg() {
      return this.$store.getters.capacity.dev_type === 'egw'
    }
  },
  watch: {
    'baseModel.forwardMode'(v, ov) {
      if (!this.isOpenPop) {
        if (v === 'ROUTER' || v === 'AC') {
          this.baseModel.autoJoin = 'true'
          if (this.isEap) {
            this.baseModel.acEnable = 'false'
          } else {
            // eg
            this.baseModel.acEnable = 'true'
          }
        } else {
          // AP
          this.baseModel.autoJoin = 'true'
          this.baseModel.acEnable = 'false'
        }
      }
    },
    'baseModel.autoJoin'(v, ov) {
      if (!this.isOpenPop) {
        if (v === 'false') {
          this.baseModel.acEnable = 'false'
        } else if (!this.isEap && this.baseModel.forwardMode === 'ROUTER') {
          this.baseModel.acEnable = 'true'
        }
      }
    }
  },
  methods: {
    // popover-show事件
    onSwitchShow() {
      this.isOpenPop = true // 标识用来不触发watch的联动
      this.baseModel.forwardMode = this.devMode.forwardMode || 'ROUTER'
      this.baseModel.acEnable = this.devMode.acEnable
      this.baseModel.autoJoin = this.devMode.autoJoin
      this.$nextTick(_ => {
        this.isOpenPop = false
      })
    },
    async onSetDevMode() {
      // 区别提示，开启关闭自组网开关不需要重启，其他需要重启。
      let _changMode = this.baseModel.forwardMode !== this.devMode.forwardMode
      if (
        _changMode ||
        this.baseModel.autoJoin !== this.devMode.autoJoin ||
        this.baseModel.acEnable !== this.devMode.acEnable
      ) {
        await this.$confirm(
          _changMode
            ? '工作模式切换会恢复出厂并重启设备，确认切换？'
            : '确认修改配置？'
        )

        this.$api.setDevMode(this.baseModel)

        let _msg = _changMode
          ? '模式已切换，请等设备重启恢复网络后，重新登录WEB系统。'
          : '配置已修改，稍后将自动刷新页面。'
        awaitOnLine(10000, _msg).then(() => {
          window.top.location.reload()
        })
        this.$message({
          dangerouslyUseHTMLString: true,
          message: `<ol class="ml20 ol-num">
                      <li class="mt5">
                        模式切换后，设备IP可能会发生改变。
                      </li>
                      <li class="mt5">
                        修改终端地址，让终端与设备能够相通。
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

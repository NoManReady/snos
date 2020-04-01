<template>
  <div>
    <el-popover @show="onSwitchShow" placement="top" ref="devModePopover" trigger="click" width="340">
      <el-form :model="baseModel" label-width="120px" size="small">
        <div class="mb20 c-info">
          <strong class="vm w45 vt">{{ $t("phrase.explain_f") }}</strong>
          <ol class="ml40 ol-num">
            <li class="mt5">{{ $t("overview.dev_mode_tip1") }}</li>
            <li class="mt5">{{ $t("overview.dev_mode_tip2") }}</li>
            <li class="mt5">{{ $t("overview.dev_mode_tip3") }}</li>
            <li class="mt5">{{ $t("overview.dev_mode_tip4") }}</li>
            <li class="mt5 c-danger">{{ $t("overview.dev_mode_tip5") }}</li>
          </ol>
        </div>
        <el-form-item :label="$t('sysinfo.dev_mode')">
          <el-select :placeholder="$t('action.select')" class="w100" v-model="baseModel.forwardMode">
            <el-option :key="k" :label="v" :value="k" v-for="(v, k) in modeMap"></el-option>
          </el-select>
          <el-tooltip effect="light" placement="right">
            <div slot="content">
              <ol class="ml20 ol-num">
                <li class="mt5" v-if="modeMap.ROUTER">{{ $t("overview.dev_mode_tip6") }}</li>
                <li class="mt5" v-if="modeMap.AC">{{ $t("overview.dev_mode_tip7") }}</li>
                <li class="mt5" v-if="modeMap.AP">{{ $t("overview.dev_mode_tip8") }}</li>
              </ol>
            </div>
            <i class="rjucd-help fs20 vm c-info"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('overview.net_discovery')">
          <el-switch
            :disabled="baseModel.forwardMode === 'AC' || (baseModel.autoJoin === 'false' && hasRjTag)"
            active-value="true"
            inactive-value="false"
            v-model="baseModel.autoJoin"
          ></el-switch>
          <el-tooltip effect="light" placement="right">
            <div slot="content">
              <ol class="ml20 ol-num">
                <li class="mt5">{{ $t("overview.net_discovery_tip1") }}</li>
                <li class="mt5">{{ $t("overview.net_discovery_tip2") }}</li>
                <li class="mt5" v-if="modeMap.AC">{{ $t("overview.net_discovery_tip3") }}</li>
              </ol>
            </div>
            <i class="rjucd-help fs20 vm c-info"></i>
          </el-tooltip>
          <el-tooltip effect="light" placement="right" v-if="isEgRouter && (hasRjTag || baseModel.autoJoin === 'true')">
            <div slot="content">
              <template v-if="hasRjTag">
                <p>{{ $t("overview.rj43_exist") }}</p>
                <i18n path="overview.rj43_tip" tag="p" v-if="baseModel.autoJoin === 'true'">
                  <span class="c-warning" place="tip1">{{ $t("overview.rj43_tip1") }}</span>
                  <a @click="_onToDhcpOpiton" class="c-success pointer">{{ $t("overview.rj43_tip2") }}</a>
                  <span class="c-warning">{{ $t("overview.rj43_tip3") }}</span>
                </i18n>
                <i18n path="overview.rj43_tip4" tag="p" v-else>
                  <a @click="_onToDhcpOpiton" class="c-success pointer">{{ $t("overview.rj43_tip2") }}</a>
                </i18n>
              </template>
              <template v-else>
                <p>{{ $t("overview.rj43_tip5") }}</p>
                <i18n path="overview.rj43_tip6" tag="path">
                  <a @click="_onToDhcpOpiton" class="c-success pointer">{{ $t("overview.rj43_tip2") }}</a>
                </i18n>
              </template>
            </div>
            <span class="c-warning" v-if="hasConfig">
              <i class="el-icon-warning fs18 vm"></i>
              <strong class="vm">{{ $t("phrase.warn") }}</strong>
            </span>
            <span class="c-info" v-else>
              <i class="el-icon-info fs18 vm"></i>
              <strong class="vm">{{ $t("phrase.tip") }}</strong>
            </span>
          </el-tooltip>
        </el-form-item>
        <el-form-item
          :label="$t('overview.ac_status')"
          v-show=" baseModel.autoJoin === 'true' && baseModel.forwardMode === 'ROUTER' "
        >
          <el-switch active-value="true" inactive-value="false" v-model="baseModel.acEnable"></el-switch>
          <el-tooltip effect="light" placement="right">
            <div slot="content">
              <ol class="ml20 ol-num">
                <li class="mt5">{{ $t("overview.ac_tip1") }}</li>
                <li class="mt5">{{ $t("overview.ac_tip2") }}</li>
              </ol>
            </div>
            <i class="rjucd-help fs20 vm c-info"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button @click.native="onSetDevMode" type="primary">{{ $t("overview.switch_mode") }}</el-button>
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
        ROUTER: I18N.t('overview.route_mode'),
        AC: I18N.t('overview.ac_mode'),
        AP: I18N.t('overview.ap_mode')
      },
      baseModel: {
        forwardMode: 'ROUTER', // ROUTER|AC|AP转发面：转发模式
        autoJoin: 'true', // 管理面：是否组网
        acEnable: 'true' // 管理面：是否指定为master
      },
      hasRjTag: false
    }
  },
  created() {
    if (this.isEg) {
      delete this.modeMap.AP
    } else if (this.isEac) {
      delete this.modeMap.ROUTER
    } else {
      // EGW和EAP去掉AC模式
      delete this.modeMap.AC
    }
    if (this.isEgRouter) {
      this._loadOption43()
    }
  },
  computed: {
    devMode() {
      return this.$store.getters.devMode || {}
    },
    isEac() {
      return this.$roles().includes('eac')
    },
    // EAP设备或者AP模式
    isEap() {
      return this.$dev() === 'eap' || this.baseModel.forwardMode === 'AP'
    },
    // 不带无线功能
    isEg() {
      return this.$store.getters.capacity.dev_type === 'egw'
    },
    isEgRouter() {
      return this.$dev() === 'egw' && this.baseModel.forwardMode === 'ROUTER'
    },
    hasConfig() {
      return (
        this.hasRjTag &&
        this.baseModel.autoJoin === 'true' &&
        this.baseModel.forwardMode === 'ROUTER'
      )
    }
  },
  watch: {
    'baseModel.forwardMode'(v, ov) {
      if (!this.isOpenPop) {
        if (v === 'ROUTER' || v === 'AC') {
          if (v === 'ROUTER' && this.hasRjTag) {
            this.baseModel.autoJoin = 'false'
          } else {
            this.baseModel.autoJoin = 'true'
          }

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
    async _loadOption43() {
      let _res = await this.$api.getDhcpOption()
      let _o = _res.option.find(o => o.id === '43')
      let option43 = _o ? _o.value : ''
      this.hasRjTag = option43.indexOf('#RJ#') === 0
    },
    _onToDhcpOpiton() {
      this.$router.push({
        name: 'admin/alone/network/network_lan',
        query: { tab: '3' }
      })
    },
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
      if (this.hasConfig) {
        return this.$message.warning(
          I18N.t('overview.mode_switch_tip'),
          I18N.t('overview.cfg_conflict_tip'),
          5000
        )
      }
      // 区别提示，开启关闭自组网开关不需要重启，其他需要重启。
      let _changMode = this.baseModel.forwardMode !== this.devMode.forwardMode
      if (
        _changMode ||
        this.baseModel.autoJoin !== this.devMode.autoJoin ||
        this.baseModel.acEnable !== this.devMode.acEnable
      ) {
        await this.$confirm(
          _changMode
            ? I18N.t('overview.mode_switch_confirm')
            : I18N.t('overview.modify_cfg_confirm')
        )

        this.$api.setDevMode(this.baseModel)

        let _msg = _changMode
          ? I18N.t('overview.mode_switch_success_tip')
          : I18N.t('overview.cfg_fresh_tip')
        awaitOnLine(10000, _msg).then(() => {
          window.top.location.reload()
        })
        this.$message({
          dangerouslyUseHTMLString: true,
          message: `<ol class="ml20 ol-num">
                      <li class="mt5">
                        ${I18N.t('overview.dev_mode_tip1')}
                      </li>
                      <li class="mt5">
                        ${I18N.t('overview.dev_mode_tip2')}
                      </li>
                      <li class="mt5">
                        ${I18N.t('overview.dev_mode_tip3')}
                      </li>
                    </ol>`,
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
<style lang="scss" scoped>
.vm {
  vertical-align: middle !important;
}
</style>

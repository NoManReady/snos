<template>
  <div class="overview-dev-info">
    <el-row align="middle" class="device-info" type="flex" v-if="curSysinfo">
      <el-col :lg="7" :span="4" class="device-info-brand">
        <div :title="netStatus.connnected === 'false' && netStatus.message" class="img vm">
          <i
            :class="curSysinfo.productType.toLocaleUpperCase()==='EAP'?'rjucd-apac':'rjucd-device'"
            :data-icon="deviceIcon"
            class="icon-inner"
          ></i>
        </div>
        <div>
          <sup
            :class="netStatus.connnected === 'true' ? 'online' : 'offline'"
            class="badge-dot vm"
            v-show="netStatus.connnected !== ''"
          ></sup>
          <strong class="vtm">{{ curSysinfo.product_class }}</strong>
        </div>
      </el-col>
      <el-col :lg="17" :span="20" class="tl">
        <el-form class="view-form c-info" label-width="92px" size="medium">
          <el-form-item :label="$t('overview.name_f')" class="fl" style="height: 22px;">
            <div class="mw70 md-w120">
              <el-tooltip :content="`${$t('overview.name_f')}${curHostname}`" effect="light" placement="top">
                <label class="ellipsis width">{{ curHostname }}</label>
              </el-tooltip>
            </div>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.sn_num_f')" class="fl">
            <div class="w120">{{ curSysinfo.serial_num }}</div>
          </el-form-item>
          <el-form-item :label="$t('wan.ip_addr_f')" class="fl">
            <div class="w120">{{ curSysinfo.wan_ip }}</div>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.mac_addr_f')" class="fl">
            <div class="w120">{{ curSysinfo.sys_mac }}</div>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.soft_version_f')" class="fl" v-if="showCur">
            <label class="break-word">{{ curSysinfo.software_version }}</label>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <slot></slot>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'DevInfo',
  props: {
    // 是否开启定时获取联网状态
    timer: {
      type: Boolean,
      default: true
    },
    // 是否显示当前登录的信息
    showCur: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      netTimer: true
    }
  },
  computed: {
    ...mapGetters(['netStatus', 'hostname', 'sysinfo']),
    curHostname() {
      return this.showCur ? window.top.APP_HOSTNAME : this.hostname
    },
    curSysinfo() {
      return this.showCur ? window.top.APP_SYSINFO : this.sysinfo
    },
    deviceIcon() {
      let _textMap = {
        EGW: I18N.t('nei.gateway'),
        EWR: I18N.t('nei.gateway'),
        EHR: I18N.t('nei.router'),
        EAP: '',
        EAC: 'AC',
        SW: I18N.t('nei.switch'),
        MSW: I18N.t('nei.switch')
      }
      let _type = this.curSysinfo.productType.toLocaleUpperCase()
      let _supportIcon = ['EGW', 'EWR', 'EAP', 'SW', 'MSW']
      return _textMap[_type] || '?'
    }
  },
  beforeDestroy() {
    clearTimeout(this.netTimer)
    this.netTimer = null
  },
  created() {
    if (this.timer) {
      this._loadNetStatus()
    }
  },
  methods: {
    ...mapActions(['getNetStatus']),
    async _loadNetStatus() {
      await this.getNetStatus()
      this.netTimer &&
        (this.netTimer = setTimeout(() => {
          clearTimeout(this.netTimer)
          this._loadNetStatus()
        }, 30000))
    }
  }
}
</script>
<style lang="scss">
.device-info .view-form {
  .el-form-item__label {
    padding-right: 5px;
  }
  .el-form-item__label,
  .el-form-item__content {
    font-size: 13px;
    line-height: 22px !important;
  }
}
</style>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.device-info {
  .ellipsis.width {
    display: inline-block;
    max-width: 120px;
    width: auto;
  }
  &-brand {
    text-align: center;
    // width: auto;
    min-width: 100px;
    max-width: 140px;
    .vtm {
      vertical-align: middle;
    }
    .img {
      width: 100px;
      height: 40px;
      overflow: hidden;
      i {
        font-size: 100px;
        line-height: 40px;
        color: $--color-text-regular;
      }
    }
    .badge-dot {
      height: 8px;
      width: 8px;
      padding: 0;
      border-radius: 50%;
      &.offline {
        background-color: $--color-danger;
      }
      &.online {
        background-color: $--color-success;
      }
    }
    strong {
      font-size: 15px;
      word-break: break-word;
      color: $--color-text-regular;
    }
  }
  .mw70 {
    min-width: 70px;
  }
  @media screen and (max-width: 992px) {
    .md-w120 {
      width: 120px !important;
    }
  }
}
</style>

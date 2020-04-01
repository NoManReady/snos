<template>
  <div class="header-brand">
    <div class="fs14">
      <i class="el-icon-loading fs16" v-if="!networkName"></i>
      <strong v-else>{{ networkName }}</strong>
      <i class="el-icon-arrow-right"></i>
      <label>
        <!-- <span>当前登录设备:</span> -->
        <strong :class="{ pointer: !disPopDevDetail }" @click="_onPopDevDetail" v-popover:devInfoPopover>
          <i class="el-icon-loading" v-if="!curHostname"></i>
          <template v-else>
            <strong class="ellipsis vm width">{{ curHostname }}</strong>
            <span class="c-warning" v-if="!isAlone">[{{ isSlave ? $t("devlist.slave") : $t("devlist.master") }}]</span>
            <i class="el-icon-info"></i>
          </template>
        </strong>
      </label>
    </div>
    <el-popover
      :title="`${$t('header.cur_dev_info')}${ disPopDevDetail ? '' : $t('header.click_edit_dev') }`"
      placement="right"
      ref="devInfoPopover"
      trigger="hover"
    >
      <el-form :model="curSysinfo" class="view-form" label-width="140px" size="medium">
        <el-form-item :label="$t('sysinfo.dev_name_f')">
          <label style="word-break: break-all;">{{ curHostname }}</label>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.dev_type_f')">
          <label>{{ curSysinfo.model }}</label>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.sn_num_f')">
          <label>{{ curSysinfo.serial_num }}</label>
        </el-form-item>
        <el-form-item :label="$t('wan.ip_addr_f')">
          <label>{{ curSysinfo.wan_ip }}</label>
        </el-form-item>
        <el-form-item :label="$t('wan.mac_addr_f')">
          <label>{{ curSysinfo.sys_mac }}</label>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.soft_version_f')">
          <label class="break-word">{{ curSysinfo.software_version }}</label>
        </el-form-item>
      </el-form>
    </el-popover>
  </div>
</template>
<script>
import { popDevDetail } from '@/utils/iframeUtils'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Brand',
  data() {
    return {
      curHostname: window.top.APP_HOSTNAME,
      curSysinfo: window.top.APP_SYSINFO
    }
  },
  mounted() {
    window.addEventListener(
      'message',
      e => {
        if (e.data && e.data.type) {
          if (
            e.data.type === 'ewebHostname' &&
            e.data.sn === this.curSysinfo.serial_num
          ) {
            window.top.APP_HOSTNAME = e.data.value
            this.curHostname = e.data.value
          }
          if (
            e.data.type === 'ewebSysinfo' &&
            e.data.sn === window.top.APP_SYSINFO.serial_num
          ) {
            window.top.APP_SYSINFO = e.data.value
            this.curSysinfo = e.data.value
          }
        }
      },
      false
    )
  },
  async created() {
    await this.getNetworkId()
  },
  computed: {
    ...mapGetters(['networkId']),
    networkName() {
      if (!this.networkId) {
        this.getNetworkId()
        return false
      }
      if (
        this.networkId.networkId === '0' ||
        this.networkId.networkName === 'defaultNetwork'
      ) {
        return I18N.t('header.unknow_projname')
      }
      return this.networkId.networkName
    },
    isSlave() {
      return window.top.APP_ROLES.includes('slave')
    },
    isAlone() {
      return window.top.APP_ROLES.includes('alone')
    },
    isMaster() {
      return window.APP_ROLES.includes('master')
    },
    isInIframe() {
      return window !== window.top
    },
    disPopDevDetail() {
      return this.isAlone || (this.isSlave && !this.isInIframe)
    }
  },
  methods: {
    ...mapActions(['getNetworkId']),
    _onPopDevDetail() {
      if (this.disPopDevDetail) {
        return
      }
      popDevDetail(this.curSysinfo, 'Brand')
    }
  }
}
</script>

<style lang="scss" scope>
.header-brand {
  .ellipsis.width {
    max-width: 130px;
    width: auto;
  }
}
</style>

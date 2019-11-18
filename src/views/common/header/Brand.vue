<template>
  <div>
    <el-breadcrumb class="header-brand" separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>
        <strong>{{networkName}}</strong>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        当前登录设备:
        <strong :class="{'pointer': !disPopDevDetail}" @click="_onPopDevDetail" v-popover:devInfoPopover>
          <i class="el-icon-loading" v-if="!curHostname"></i>
          <template v-else>
            <span class="ellipsis vm width" v-if="disPopDevDetail">{{curHostname}}</span>
            <el-tooltip :content="`点击配置此设备（${curHostname}）`" effect="light" placement="right" v-else>
              <span>
                <span class="ellipsis vm width c-success">{{curHostname}}</span>
              </span>
            </el-tooltip>
            <span class="c-warning" v-if="!isAlone">【{{isSlave ? "从" : "主"}}】</span>
          </template>
        </strong>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <el-popover placement="bottom" ref="devInfoPopover" trigger="hover">
      <el-form :model="curSysinfo" class="view-form" label-width="100px" size="mini">
        <el-form-item label="型号：">
          <label>{{curSysinfo.model}}</label>
        </el-form-item>
        <el-form-item label="SN号：">
          <label>{{curSysinfo.serial_num}}</label>
        </el-form-item>
        <el-form-item label="IP地址：">
          <label>{{curSysinfo.wan_ip}}</label>
        </el-form-item>
        <el-form-item label="MAC地址：">
          <label>{{curSysinfo.sys_mac}}</label>
        </el-form-item>
        <el-form-item label="软件版本：">
          <label>{{curSysinfo.software_version}}</label>
        </el-form-item>
      </el-form>
    </el-popover>
  </div>
</template>
<script>
import { Breadcrumb, BreadcrumbItem } from 'element-ui'
import { mapActions, mapGetters } from 'vuex'
import { popDevDetail } from '@/utils/iframeUtils'
export default {
  name: 'Brand',
  components: {
    [Breadcrumb.name]: Breadcrumb,
    [BreadcrumbItem.name]: BreadcrumbItem
  },
  data() {
    return {
      networkName: 'defaultNetwork',
      curHostname: window.top.APP_HOSTNAME,
      curSysinfo: window.top.APP_SYSINFO
    }
  },
  mounted() {
    // alone和master设备需要监听header的hostname变更信息
    if (this.isMaster || this.isAlone) {
      window.addEventListener(
        'message',
        e => {
          if (
            e.data &&
            e.data.type === 'ewebHostname' &&
            e.data.sn === this.curSysinfo.serial_num
          ) {
            window.top.APP_HOSTNAME = e.data.value
            this.curHostname = e.data.value
          }
        },
        false
      )
    }
  },
  computed: {
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
  async created() {
    let groupsData = await this.$api.getNetworkGroup({ isSilence: true })
    this.networkName = groupsData.networkName
    // this.getHostname()
  },
  methods: {
    // ...mapActions(['getHostname']),
    _onPopDevDetail() {
      if (!this.disPopDevDetail) {
        let _isSlaveEg = this.curSysinfo.productType === 'egw' && this.isSlave // 从EG要弹出

        popDevDetail(
          {
            ip: this.curSysinfo.auth_ip,
            sn: this.curSysinfo.serial_num
          },
          'Brand',
          _isSlaveEg ? false : this.curSysinfo.productType
        )
      }
    }
  }
}
</script>

<style lang="scss" scope>
.header-brand {
  line-height: 64px !important;
  height: 64px !important;
  .ellipsis.width {
    max-width: 100px;
    width: auto;
  }
}
</style>

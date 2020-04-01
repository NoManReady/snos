<template>
  <div class="box home-overview-sysinfo">
    <div class="box-header">
      <span class="box-header-tit">{{$t('msw.base_info')}}</span>
    </div>
    <el-form class="view-form" label-width="130px" size="medium" v-show="sysinfo">
      <el-row>
        <el-col :md="7" :sm="12" :xs="24">
          <el-form-item :label="$t('sysinfo.dev_name_f')">
            <common-popover
              :rules="hostnameRules"
              :title="$t('sysinfo.dev_name_modify')"
              :value="hostname"
              @submit="_onHostnameSubmit"
            >
              <el-tooltip :content="$t('sysinfo.dev_name_modify')" placement="top">
                <div>
                  <i class="el-icon-loading" v-if="!hostname||isLoading"></i>
                  <label class="c-success break-word" v-else>
                    {{hostname}}
                    <i class="el-icon-edit" v-show="hostname"></i>
                  </label>
                </div>
              </el-tooltip>
            </common-popover>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.dev_type_f')">
            <label class="web-static-form--label">{{sysinfo.product_class}}</label>
          </el-form-item>
          <el-form-item :label="$t('overview.network_status_f')">
            <div class="vm" v-show="netStatus.connnected">
              <i :class="{'c-success':netStatus.connnected==='true','c-danger':netStatus.connnected==='false'}">●</i>
              <span v-if="netStatus.connnected==='true'">{{$t('overview.online')}}</span>
              <span v-else-if="netStatus.connnected==='false'">{{$t('overview.offline')}}</span>
              <span v-else>--</span>
            </div>
            <span v-show="!netStatus.connnected">
              <i class="el-icon-loading fs14"></i>
            </span>
            <template v-if="netStatus.message">
              <el-tooltip placement="top">
                <p slot="content">{{netStatus.message}}</p>
                <i class="el-icon-info c-warning fs14 vm"></i>
              </el-tooltip>
            </template>
          </el-form-item>
          <el-form-item :label="$t('msw.master_addr_f')" v-if="$roles().includes('slave')">
            <el-tooltip :content="$t('msw.go_to_master')" placement="top">
              <a :href="`http://${masterIp}`" class="c-success" target="_blank">
                <span>{{masterIp}}</span>
              </a>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.dev_mode_f')">
            <dev-mode class="vm">
              <span class="pointer">
                <a
                  class="c-success fs14"
                  href="javascript:;"
                >{{devMode.autoJoin==='true'?$t('msw.net_mode'):$t('msw.alone_mode')}}</a>
                <i class="el-icon-edit ml5 c-success"></i>
              </span>
            </dev-mode>
          </el-form-item>
        </el-col>
        <el-col :md="7" :sm="12" :xs="24">
          <el-form-item :label="$t('msw.manage_ip_addr_f')">
            <el-tooltip :content="$t('msw.goto_manage_ip_addr')" placement="top">
              <a @click="_goToIp" class="c-success" href="javascript:;">
                <span>{{sysinfo.wan_ip==='nil'?'--':sysinfo.wan_ip}}</span>
                <i class="el-icon-setting"></i>
              </a>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('wan.mac_addr_f')">
            <label>{{sysinfo.sys_mac}}</label>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.sn_num_f')">
            <label>{{sysinfo.serial_num}}</label>
          </el-form-item>
        </el-col>
        <el-col :md="10" :sm="24" :xs="24">
          <el-form-item :label="$t('sysinfo.soft_version_f')">
            <label class="break-word">{{sysinfo.software_version}}</label>
          </el-form-item>
          <el-form-item :label="$t('overview.sys_time_f')">
            <label>{{deviceInfo.local_time|formatDay}}</label>
          </el-form-item>
          <el-form-item :label="$t('overview.sys_run_f')">
            <label>{{deviceInfo.uptime|formatTime}}</label>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import { hostNameValidator, nameLengthValidator } from '@/utils/rules'
import { formatTime, formatDay } from '@/filters/time'
import { mapGetters, mapActions } from 'vuex'
import { Col, Row } from 'element-ui'
import CommonPopover from '@/common/CommonPopover'
import DevMode from './DevMode'
export default {
  name: 'home-overview-sysinfo',
  components: {
    [DevMode.name]: DevMode,
    [CommonPopover.name]: CommonPopover,
    [Col.name]: Col,
    [Row.name]: Row
  },
  data() {
    return {
      isLoading: false,
      dateTimer: null,
      deviceInfo: {},
      hostnameRules: [
        {
          required: true,
          message: I18N.t('overview.hostname_no_empty'),
          whitespace: true
        },
        {
          validator: nameLengthValidator,
          max: 64,
          message: I18N.t('overview.hostname_len_rule')
        },
        { validator: hostNameValidator }
      ]
    }
  },
  filters: {
    formatTime,
    formatDay
  },
  computed: {
    ...mapGetters(['sysinfo', 'hostname', 'devMode', 'netStatus', 'masterIp'])
  },
  async created() {
    await this._loadDeviceInfo()
  },
  beforeDestroy() {
    clearInterval(this.dateTimer)
    this.dateTimer = null
  },
  methods: {
    ...mapActions(['setHostname', 'getNetStatus']),
    // 加载设备信息
    async _loadDeviceInfo() {
      this.deviceInfo = await this.$api.deviceInfo()
      this.dateTimer = setInterval(() => {
        this.deviceInfo.local_time += 1000
        this.deviceInfo.uptime += 1
      }, 1000)
      this.getNetStatus()
    },
    // 跳转ip管理
    _goToIp() {
      this.$router.push({ name: 'admin/alone/port/home_wan' })
    },
    // 提交hostname
    async _onHostnameSubmit(hostname) {
      this.isLoading = true
      try {
        await this.setHostname(hostname)
        this.$message.success(I18N.t('tip.edit_success'))
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>

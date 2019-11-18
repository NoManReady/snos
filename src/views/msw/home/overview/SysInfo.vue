<template>
  <div class="box home-overview-sysinfo">
    <div class="box-header">
      <span class="box-header-tit">基本信息</span>
      <dev-mode class="vm ml10">
        <el-button plain round size="mini">
          <a class="c-success" href="javascript:;">{{devMode.autoJoin==='true'?'组网模式':'独立模式'}}</a>
          <i class="el-icon-edit ml5 c-success"></i>
        </el-button>
      </dev-mode>
    </div>
    <el-form class="view-form" label-width="96px" size="mini" v-show="sysinfo">
      <el-row>
        <el-col :md="7" :sm="12" :xs="24">
          <el-form-item label="设备名称：">
            <common-popover :rules="hostnameRules" :value="hostname" @submit="_onHostnameSubmit($event)" title="修改设备名称">
              <el-tooltip content="修改设备名称" placement="top">
                <div>
                  <i class="el-icon-loading" v-if="!hostname||isLoading"></i>
                  <span class="c-success" v-else>
                    {{hostname}}
                    <i class="el-icon-edit" v-show="hostname"></i>
                  </span>
                </div>
              </el-tooltip>
            </common-popover>
          </el-form-item>
          <el-form-item label="设备型号：">
            <label class="web-static-form--label">{{sysinfo.product_class}}</label>
          </el-form-item>
          <el-form-item label="联网状态：">
            <div class="vm" v-show="netStatus.connnected">
              <i :class="{'c-success':netStatus.connnected==='true','c-danger':netStatus.connnected==='false'}">●</i>
              <span v-if="netStatus.connnected==='true'">已联网</span>
              <span v-else-if="netStatus.connnected==='false'">未联网</span>
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
          <el-form-item label="主设备地址：" v-if="$roles().includes('slave')">
            <el-tooltip content="前往主设备配置页面" placement="top">
              <a :href="`http://${masterIp}`" class="c-success" target="_blank">
                <span>{{masterIp}}</span>
              </a>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :md="7" :sm="12" :xs="24">
          <el-form-item label="管理IP地址：">
            <el-tooltip content="前往配置管理IP" placement="top">
              <a @click="_goToIp" class="c-success" href="javascript:;">
                <span>{{sysinfo.wan_ip==='nil'?'--':sysinfo.wan_ip}}</span>
                <i class="el-icon-setting"></i>
              </a>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="MAC地址：">
            <label>{{sysinfo.sys_mac}}</label>
          </el-form-item>
          <el-form-item label="序列号：">
            <label>{{sysinfo.serial_num}}</label>
          </el-form-item>
        </el-col>
        <el-col :md="10" :sm="24" :xs="24">
          <el-form-item label="软件版本：">
            <label>{{sysinfo.software_version}}</label>
          </el-form-item>
          <el-form-item label="系统时间：">
            <label>{{deviceInfo.local_time|formatDay}}</label>
          </el-form-item>
          <el-form-item label="已运行：">
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
      networkStatusTimer: null,
      dateTimer: null,
      deviceInfo: {},
      hostnameRules: [
        { required: true, message: '请输入设备名称', whitespace: true },
        {
          validator: nameLengthValidator,
          max: 64,
          message: '设备名称不能超过64个字符，中文占3字符'
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
    clearInterval(this.networkStatusTimer)
    this.networkStatusTimer = null
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
        this.$message.success('修改成功')
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.home-overview-sysinfo {
  .mode-switcher {
  }
}
</style>

<template>
  <div class="box overview-sysinfo">
    <div class="box-header">
      <span class="box-header-tit">设备详细信息</span>
    </div>
    <el-form class="view-form" label-width="100px" size="mini" v-show="sysinfo">
      <el-row :gutter="20">
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item label="设备型号：">
            <label>{{sysinfo.product_class}}</label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item label="设备名称：" style="height: 24px;">
            <common-popover :rules="hostnameRules" :value="hostname" @submit="_onHostnameSubmit($event)" title="修改设备名称">
              <i class="el-icon-loading" v-if="!hostname||isLoading"></i>
              <template v-else>
                <span class="c-success ellipsis vm width">{{hostname}}</span>
                <i class="el-icon-edit c-success" v-show="hostname"></i>
              </template>
            </common-popover>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item label="序列号：">
            <label>{{sysinfo.serial_num}}</label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item label="MAC地址：">
            <label>{{sysinfo.sys_mac}}</label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item label="硬件版本：">
            <label>{{sysinfo.hardware_version}}</label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item label="工作模式：">
            <dev-mode>
              <label class="pointer">
                <a class="c-success" href="javascript:;">{{forwardMode}}</a>
                <i class="el-icon-edit fs16 c-success ml5"></i>
              </label>
            </dev-mode>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item label="自组网角色：" v-if="workMode">
            <label>
              {{workMode}}
              <el-tooltip effect="light" placement="bottom">
                <ol class="ml15 ol-li" slot="content">
                  <li>主AP/AC：设备做为AC可以管理下联设备。</li>
                  <li>从AP/设备：设备已通过自组网接入AC管理。</li>
                  <li>未知：设备未自组网成功，以普通AP运行。</li>
                  <li>独立模式：设备未参与自组网。</li>
                  <li>
                    若角色不对，尝试按
                    <a @click="reload" class="c-success pointer">F5刷新</a>
                    页面后查看。
                  </li>
                </ol>
                <i class="el-icon-info c-info"></i>
              </el-tooltip>
              <span v-if="this.$roles().includes('slave')">{{`（AC地址：${masterIp}）`}}</span>
            </label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item label="软件版本：">
            <label class="vm mw250">{{sysinfo.software_version}}</label>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import { hostNameValidator, nameLengthValidator } from '@/utils/rules'
import DevMode from '@/views/common/overview/components/DevMode'
import { mapGetters, mapActions } from 'vuex'
import { Col, Row } from 'element-ui'
import CommonPopover from '@/common/CommonPopover'
export default {
  name: 'OverviewSysinfo',
  data() {
    return {
      isLoading: false,
      hostnameRules: [
        { required: true, message: '请输入设备名称', whitespace: true },
        {
          validator: nameLengthValidator,
          size: 64,
          message: '设备名称不能超过64个字符，中文占3字符'
        },
        { validator: hostNameValidator }
      ]
    }
  },
  components: {
    [CommonPopover.name]: CommonPopover,
    [DevMode.name]: DevMode,
    [Col.name]: Col,
    [Row.name]: Row
  },
  computed: {
    ...mapGetters(['sysinfo', 'hostname']),
    deviceRole() {
      return this.$store.getters.deviceRole
    },
    // 网络角色
    workMode() {
      if (this.$roles().includes('alone')) {
        return false
      }
      return (
        {
          AC: '主AC',
          ACG: '主AC',
          ACP: '主AP',
          AP: '从AP',
          EG: '从设备',
          UNKNOW: '未知'
        }[this.deviceRole] || false
      )
    },
    forwardMode() {
      return {
        ROUTER: '路由模式',
        AC: 'AC模式',
        AP: 'AP模式'
      }[this.$store.getters.devMode.forwardMode || 'ROUTER']
    },
    masterIp() {
      return this.$store.getters.masterIp || '-'
    }
  },
  async created() {
    this.getNetStatus()
  },
  methods: {
    ...mapActions(['setHostname', 'getNetStatus']),
    reload() {
      window.top.location.reload()
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
.overview-sysinfo {
  ol.ol-li li {
    list-style-type: disc;
  }
  .mw250 {
    min-width: 250px;
  }
  .ellipsis.width {
    max-width: 100px;
    width: auto;
  }
}
</style>

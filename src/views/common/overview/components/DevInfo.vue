<template>
  <div class="overview-dev-info">
    <el-row align="middle" class="device-info" type="flex" v-if="curSysinfo">
      <el-col :lg="5" :span="3" class="device-info-brand">
        <div :title="netStatus.connnected === 'false' && netStatus.message" class="img">
          <i class="rjucd-gateway"></i>
          <sup
            :class="netStatus.connnected === 'true' ? 'online' : 'offline'"
            class="badge-dot"
            v-show="netStatus.connnected !== ''"
          ></sup>
        </div>
        <span>{{curSysinfo.product_class}}</span>
      </el-col>
      <el-col :lg="19" :span="21" class="tl">
        <el-form class="view-form c-info" label-width="85px" size="mini">
          <el-form-item class="fl" label="名称：" style="height: 22px;">
            <div class="w100">
              <el-tooltip :content="`名称：${curHostname}`" effect="light" placement="top">
                <label class="ellipsis width">{{ curHostname }}</label>
              </el-tooltip>
            </div>
          </el-form-item>
          <el-form-item class="fl" label="SN号：">
            <label>{{curSysinfo.serial_num}}</label>
          </el-form-item>
          <el-form-item class="fl" label="IP地址：">
            <label>{{curSysinfo.wan_ip}}</label>
          </el-form-item>
          <el-form-item class="fl" label="MAC地址：">
            <label>{{curSysinfo.sys_mac}}</label>
          </el-form-item>
          <el-form-item class="fl" label="软件版本：" v-if="!alone">
            <label>{{curSysinfo.software_version}}</label>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <slot></slot>
  </div>
</template>
<script>
import { Col, Row } from 'element-ui'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'DevInfo',
  props: {
    // 是否开启定时获取联网状态
    timer: {
      type: Boolean,
      default: true
    },
    // 是否显示本机，设置false的时候显示顶层iframe的信息（比如：显示登录的设备）
    alone: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      netTimer: true
    }
  },
  components: {
    [Col.name]: Col,
    [Row.name]: Row
  },
  computed: {
    ...mapGetters(['netStatus', 'hostname', 'sysinfo']),
    curHostname() {
      return this.alone ? this.hostname : window.top.APP_HOSTNAME
    },
    curSysinfo() {
      return this.alone ? this.sysinfo : window.top.APP_SYSINFO
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
        }, 11000))
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
    width: auto;
    min-width: 90px;
    max-width: 138px;
    .img,
    span {
      display: inline-block;
      vertical-align: middle;
    }
    .img {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: $box-bgc;
      i {
        font-size: 40px;
        line-height: 56px;
      }
      .badge-dot {
        position: absolute;
        top: 0px;
        right: 8px;
        height: 8px;
        width: 8px;
        padding: 0;
        border-radius: 50%;
        transition: translateY(-50%) translateX(100%);
        &.offline {
          background-color: $--color-danger;
        }
        &.online {
          background-color: $--color-success;
        }
      }
    }
    span {
      color: #000;
      font-weight: bold;
      font-size: 15px;
      word-break: break-word;
    }
  }
}
</style>

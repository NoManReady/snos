<template>
  <div class="box overview-deviceinfo">
    <div class="box-header">
      <span class="box-header-tit">设备概况</span>
    </div>
    <el-row :gutter="10" v-if="deviceInfo">
      <el-col :md="7" :sm="6" :xs="24">
        <div class="data-box">
          <span class="data-box--tit">内存使用率</span>
          <span class="data-box--val">
            <b v-scroll="parseInt(deviceInfo.mem_used/deviceInfo.mem_total*100)"></b>%
          </span>
        </div>
      </el-col>
      <el-col :md="7" :sm="6" :xs="24">
        <div class="data-box">
          <span class="data-box--tit">{{$dev()==='est'?'桥接组总设备数':'在线用户数'}}</span>
          <span class="data-box--val">
            <i class="el-icon-loading fs16" v-if="userCount===-1"></i>
            <b :class="{pointer: hasUsersPage}" @click="_onGotoAccount" v-else v-scroll="userCount||0"></b>
          </span>
        </div>
      </el-col>
      <el-col :md="10" :sm="12" :xs="24">
        <div class="data-box" style="line-height:1.1;">
          <span class="data-box--tit c-success" style="margin-top:2px;">
            联网状态：
            <small class="c-success fs14" v-show="connectInfo.connnected==='true'">已联网</small>
            <small class="c-warning fs14" v-show="connectInfo.connnected==='false'">未联网</small>
            <small v-show="connectInfo.connnected===''">
              <i class="el-icon-loading fs14"></i>
            </small>
            <small v-show="connectInfo.connnected==='error'">--</small>

            <small @click="onToDiagnoseNet" class="pointer fs14" v-if="connectInfo.connnected==='false'&&hasDiagnoseNet">（检测网络）</small>
          </span>
          <span class="data-box--tit">
            系统运行：
            <small class="fs14">{{deviceInfo.uptime|formatTime}}</small>
          </span>
          <span class="data-box--tit">
            系统时间：
            <small class="fs14">{{deviceInfo.local_time|formatDay}}</small>
          </span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { formatTime, formatDay } from '@/filters/time'
import numberScroller from '@/directives/numberScroller'
import { Col, Row } from 'element-ui'
let dateTimer = null
export default {
  name: 'OverviewDeviceinfo',
  data() {
    return {
      userCount: -1,
      deviceInfo: null
    }
  },
  components: {
    [Col.name]: Col,
    [Row.name]: Row
  },
  created() {
    this.$bus.$on('userCountChange', ({ count }) => {
      this.userCount = count
    })
  },
  beforeDestroy() {
    clearInterval(dateTimer)
    dateTimer = null
    this.$bus.$off('userCountChange')
  },
  filters: {
    formatTime,
    formatDay
  },
  directives: {
    scroll: numberScroller
  },
  computed: {
    hasDiagnoseNet() {
      return this.$roles().includes('egw') || this.$roles().includes('eap')
    },
    connectInfo() {
      return this.$store.getters.netStatus
    },
    hasUsersPage() {
      return this.$dev() == 'egw' || this.$roles().includes('wifi_sta')
    }
  },
  methods: {
    async init() {
      await this._loadUserCount()
      await this._loadDeviceInfo()
    },
    // 加载用户数
    async _loadUserCount() {
      let _result = await this.$api.userCount()
      this.userCount = _result.count || 0
    },
    // 加载设备信息
    async _loadDeviceInfo() {
      this.deviceInfo = await this.$api.deviceInfo()
      dateTimer = setInterval(() => {
        this.deviceInfo.local_time += 1000
        this.deviceInfo.uptime += 1
      }, 1000)
    },
    onToDiagnoseNet() {
      this.$router.push({
        name: `admin/alone/diagnose/diagnose_network`,
        query: { start: true }
      })
    },
    // 跳转用户页（eg->用户流量，eap->无线用户,est->不跳转）
    _onGotoAccount() {
      let _userPathName = false
      if (this.$dev() == 'egw') {
        _userPathName = this.$roles().includes('master')
          ? 'admin/home_online'
          : 'admin/alone/network/home_online'
      } else if (this.$roles().includes('wifi_sta')) {
        _userPathName = 'admin/alone/wifi/wifi_sta'
        // _userPathName = this.$roles().includes('master')
        //   ? 'admin/wifi/wifi_sta'
        //   : 'admin/alone/wifi/wifi_sta'
      }
      _userPathName && this.$router.push({ name: _userPathName })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
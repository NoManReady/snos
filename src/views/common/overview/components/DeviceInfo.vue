<template>
  <div class="box overview-deviceinfo">
    <div class="box-header">
      <span class="box-header-tit">{{ $t("overview.dev_survey") }}</span>
    </div>
    <el-row :gutter="10" v-if="deviceInfo">
      <el-col :md="7" :sm="6" :xs="24">
        <div class="data-box">
          <span class="data-box--tit">{{ $t("overview.mem_usage") }}</span>
          <span class="data-box--val">
            <b v-scroll="parseInt((deviceInfo.mem_used / deviceInfo.mem_total) * 100)"></b>%
          </span>
        </div>
      </el-col>
      <el-col :md="7" :sm="6" :xs="24">
        <div class="data-box">
          <span class="data-box--tit">{{ $t("overview.online_user_cnt") }}</span>
          <span class="data-box--val">
            <i class="el-icon-loading fs16" v-if="userCount === -1"></i>
            <b :class="{ pointer: hasUsersPage }" @click="_onGotoAccount" v-else v-scroll="userCount || 0"></b>
          </span>
        </div>
      </el-col>
      <el-col :md="10" :sm="12" :xs="24">
        <div class="data-box" style="line-height:1.1;">
          <span class="data-box--tit" style="margin-top:2px;">
            {{ $t("overview.network_status_f") }}
            <small
              class="c-success fs14"
              v-show="connectInfo.connnected === 'true'"
            >{{ $t("overview.online") }}</small>
            <small class="c-warning fs14" v-show="connectInfo.connnected === 'false'">
              {{ $t("overview.offline") }}
              <el-popover :content="connectInfo.message" placement="top" trigger="hover">
                <i class="el-icon-info" slot="reference"></i>
              </el-popover>
            </small>
            <small v-show="connectInfo.connnected === ''">
              <i class="el-icon-loading fs14"></i>
            </small>
            <small v-show="connectInfo.connnected === 'error'">--</small>
            <small
              @click="onToDiagnoseNet"
              class="pointer fs14"
              v-if="connectInfo.connnected === 'false' && hasDiagnoseNet"
            >{{ $t("overview.check_net") }}</small>
          </span>
          <span class="data-box--tit">
            {{ $t("overview.sys_run_f") }}
            <small class="fs14">{{ deviceInfo.uptime | formatTime }}</small>
          </span>
          <span class="data-box--tit">
            {{ $t("overview.sys_time_f") }}
            <small class="fs14">{{ deviceInfo.local_time | formatDay }}</small>
          </span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { formatTime, formatDay } from '@/filters/time'
import numberScroller from '@/directives/numberScroller'
let dateTimer = null
export default {
  name: 'OverviewDeviceinfo',
  data() {
    return {
      userCount: -1,
      deviceInfo: null
    }
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
      let _initpath = false
      if (this.$dev() == 'egw') {
        _initpath =
          this.$roles().includes('master') && !this.$roles().includes('ehr')
            ? 'admin/home_online'
            : 'admin/alone/network/home_online'
      } else if (this.$roles().includes('wifi_sta')) {
        _initpath = 'admin/alone/wifi/wifi_sta'
        // _initpath = this.$roles().includes('master')
        //   ? 'admin/wifi/wifi_sta'
        //   : 'admin/alone/wifi/wifi_sta'
      }
      if (
        _initpath &&
        this.$router.getMatchedComponents({ name: _initpath }).length > 0
      ) {
        this.$router.push({ name: _initpath })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

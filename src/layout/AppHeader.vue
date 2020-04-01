<template>
  <div class="app-header clearfix">
    <div class="tm fl">
      <div class="fl" v-if="collapse && !isMacc || isMobile">
        <i class="rjucd-r"></i>
      </div>
      <!-- <img :src="logoUrl" class="header-logo fl" v-else /> -->
      <div class="header-logo fl" v-else>
        <i :style="{ backgroundImage: `url(${logoUrl})` }"></i>
      </div>
      <div class="tm fl separation"></div>
      <strong class="tc" v-if="isMobile">{{ title }}</strong>
      <div class="fl" v-else>
        <strong v-if="isMacc">{{ title }}</strong>
        <brand v-else />
      </div>
    </div>
    <div class="tm fr">
      <span @click="$emit('exit')" class="pointer mr5" v-if="isMacc || isMobile">
        <i class="rjucd-exit vm"></i>
        <slot name="exitText">{{ $t("main_header.logout") }}</slot>
      </span>
      <ul class="nav-group clearfix" v-else>
        <li v-if="showLang">
          <el-select class="w100" size="mini" v-model="langConf">
            <el-option label="中文" value="zh_cn"></el-option>
            <el-option label="English" value="en"></el-option>
          </el-select>
        </li>
        <li v-if="!$roles().includes('ehr')">
          <noc-qrcode>
            <a class="nav-item" href="javascript:;">
              <el-tooltip :content="$t('main_header.macc_dev')" effect="light" placement="bottom">
                <i class="rjucd-cloud"></i>
              </el-tooltip>
              <span>{{ $t("main_header.macc_dev") }}</span>
            </a>
          </noc-qrcode>
        </li>
        <li v-if="showApp">
          <qrcode>
            <a class="nav-item" href="javascript:;">
              <el-tooltip :content="$t('main_header.app_download')" effect="light" placement="bottom">
                <i class="rjucd-sys"></i>
              </el-tooltip>
              <span>{{ $t("main_header.app_download") }}</span>
            </a>
          </qrcode>
        </li>
        <template v-if="isDefUser">
          <li v-if="!$roles().includes('slave')">
            <a @click="goQuickmacc" class="nav-item" href="javascript:;">
              <el-tooltip
                :content="isMaster ? $t('main_header.network_cfg') : $t('main_header.quick_cfg')"
                effect="light"
                placement="bottom"
              >
                <i class="rjucd-rocket"></i>
              </el-tooltip>
              <span>{{ isMaster ? $t("main_header.network_cfg") : $t("main_header.quick_cfg")}}</span>
            </a>
          </li>
          <template v-if="!isMsw">
            <li>
              <a @click="onToDiagnoseNet" class="nav-item" href="javascript:;">
                <el-tooltip :content="$t('main_header.network_check')" effect="light" placement="bottom">
                  <i class="rjucd-diagnosis"></i>
                </el-tooltip>
                <span>{{ $t("main_header.network_check") }}</span>
              </a>
            </li>
            <li>
              <!-- <el-badge :max="9" :value="alarmNum" style="line-height: 1"> -->
              <a @click="gotoAlarm" class="nav-item" href="javascript:;">
                <el-tooltip :content="$t('main_header.warn_view')" effect="light" placement="bottom">
                  <i class="rjucd-warning"></i>
                </el-tooltip>
                <span>{{ $t("main_header.warn") }}</span>
              </a>
              <!-- </el-badge> -->
            </li>
          </template>
        </template>
        <li>
          <a :class="{ 'cursor-def': isDefaultPass !== false }" class="nav-item" href="javascript:;" v-auth="logout">
            <el-tooltip
              :content="isDefaultPass ? $t('main_header.def_pass_login') : $t('main_header.logout_safe')              "
              effect="light"
              placement="bottom"
            >
              <span>
                {{!isDefUser?userName:''}}
                <i class="rjucd-exit"></i>
                <i class="el-icon-loading fs16" v-if="isDefaultPass === ''"></i>
                <span v-else>{{ isDefaultPass ? $t("main_header.def_pass") : $t("main_header.logout")}}</span>
              </span>
            </el-tooltip>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { Badge } from 'element-ui'
import { removeFromSession } from '@/utils/localStorage'
import Qrcode from '@/views/common/header/Qrcode'
import NocQrcode from '@/views/common/header/NocQrcode'
import Brand from '@/views/common/header/Brand'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'AppHeader',
  props: {
    isMacc: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isMobile: !!ISMOBILE,
      alarmNum: 0,
      timer: true
    }
  },
  components: {
    [Brand.name]: Brand,
    [Qrcode.name]: Qrcode,
    [NocQrcode.name]: NocQrcode,
    [Badge.name]: Badge
  },
  beforeDestroy() {
    clearTimeout(this.timer)
    this.timer = null
  },
  created() {
    // this._loadAlarm()
  },
  computed: {
    ...mapGetters(['lang', 'userName']),
    isDefUser() {
      return this.userName === 'admin'
    },
    // 家用路由器
    isEhr() {
      return this.$roles().includes('ehr')
    },
    showLang() {
      // 家用路由器先去掉国际化，使用中文显示
      if (this.isEhr) {
        if (this.lang === 'en') {
          this.setLang('zh_cn')
        }
        return false
      }
      return true
    },
    langConf: {
      get() {
        return this.lang
      },
      set(v) {
        this.setLang(v)
      }
    },
    isSmb() {
      return !this.$store.getters.isIndustry
    },
    logoUrl() {
      let _snos = window.BASE_URI.split(/cgi-bin/)[0]
      return `${_snos === '/' ? '' : _snos}${
        process.env.STATIC_PATH
      }/static/image/${
        this.lang === 'en'
          ? 'logo_en.svg'
          : this.isSmb
          ? 'logo.svg'
          : 'logo-rj.svg'
      }`
    },
    devType() {
      if (this.isEwr) {
        return 'EWR'
      }
      return this.$dev().toUpperCase()
    },
    // 带无线功能
    isEwr() {
      return this.$roles().includes('ewr')
    },
    // 是否显示APP下载
    showApp() {
      return this.isSmb && ['egw', 'eap', 'msw'].includes(this.$dev())
    },
    // MSW不显示网络体检和告警
    isMsw() {
      return this.$roles().includes('msw')
    },
    collapse() {
      return this.$store.getters.collapse
    },
    isDefaultPass() {
      return this.$store.getters.isDefaultPass
    },
    curSn() {
      return (window.top.APP_SYSINFO || this.$store.getters.sysinfo).serial_num
    },
    isMaster() {
      return this.$roles().includes('master')
    }
  },
  methods: {
    ...mapActions(['setLang']),
    async _loadAlarm() {
      let _res = await this.$api.getAlarm()
      this.alarmNum = (_res.list || []).length || 0
      this.timer &&
        (this.timer = setTimeout(() => {
          clearTimeout(this.timer)
          this._loadAlarm()
        }, 30000))
    },
    // 跳转网络体检页面
    onToDiagnoseNet() {
      // this.$router.push({
      //   path: '/admin/alone/diagnose_network',
      //   query: { start: true }
      // })
      // 已在自检页面再次点击页头的网络体检无相应，所以要用时间方式触发
      this.$emit('select-item', {
        fullPath: 'admin/alone/diagnose/diagnose_network'.split('/'),
        query: { start: true }
      })
    },
    // 跳转告警页
    gotoAlarm() {
      this.$router.push({
        name: `admin/alone/diagnose/diagnose_alarm`,
        query: { fromHead: true }
      })
    },
    // 跳转向导页
    goQuickmacc() {
      // this.$router.push({ name: this.isMaster ? 'quickmacc' : 'quickset' })
      this.$router.push({ name: 'quickmacc' })
    },
    // 注销
    logout() {
      if (this.isDefaultPass === false) {
        this.$api.common('logout', { sn: this.curSn }).then(d => {
          removeFromSession('APP_DEFAULT_PATH')
          window.top.location = window.top.location.origin
        })
      } else {
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../style/utils/variable';
@import '../style/utils/mixins';
.app-header {
  padding: 0 10px;
  .separation {
    border-left: 1px solid $border-main;
    height: 34px !important;
    margin-top: 15px;
    padding-right: 18px;
  }
  a {
    color: #fff;
  }
  .header-logo {
    width: $app-aside-width;
    height: 100%;
    margin-left: -10px;
    position: relative;
    text-align: center;
    overflow: hidden;
    i {
      display: inline-block;
      width: 100%;
      height: 100%;
      background-repeat: no-repeat;
      // background-size: 280% 319%;
      // background-size: auto;
      background-position: 50% 49%;
      background-size: 120%;
    }
  }
  i {
    &.rjucd-r {
      height: 64px;
      line-height: 64px;
      font-size: 54px;
      margin-left: -5px;
    }
  }
  .tm {
    @include text-middle($app-header-height);
  }
  .nav-group {
    & > li {
      float: left;
      margin-left: 14px;
    }
    .nav-item {
      cursor: pointer;
      display: inline-block;
      vertical-align: middle;
      text-align: center;
      &:hover {
        color: $--border-color-lighter;
      }
      [class^='rjucd-'],
      [class*=' rjucd-'] {
        vertical-align: middle;
        line-height: 1;
        font-size: 24px;
        & ~ span {
          margin-left: -4px;
          display: none;
        }
      }
    }
  }
  @media screen and (min-width: 992px) {
    .nav-group {
      .nav-item {
        [class^='rjucd-'],
        [class*=' rjucd-'] {
          font-size: 20px;
          & ~ span {
            display: inline;
          }
        }
      }
    }
  }
  .cursor-def {
    cursor: default !important;
  }
}
</style>

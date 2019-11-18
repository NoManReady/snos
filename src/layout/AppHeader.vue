<template>
  <div class="app-header clearfix">
    <div class="tm fl">
      <div class="brand fl">
        <a class="brand-logo" v-if="!collapse" />
        <span class="brand-txt vm">SNOS</span>
      </div>
      <ul class="nav-group fl">
        <li class="ml5">
          <a class="nav-item nav-item__toggle" href="javascript:;">
            <i :class="{'rjucd-menu-left':!collapse,'rjucd-menu-right':collapse}" @click="onCollapse" class="fs28 collapse-icon"></i>
          </a>
        </li>
        <li>
          <brand />
        </li>
      </ul>
    </div>
    <div class="tm fr">
      <ul class="nav-group clearfix">
        <li v-if="showCheck">
          <a @click="onToDiagnoseNet" class="nav-item" href="javascript:;">
            <el-tooltip content="网络体检" effect="light" placement="bottom">
              <i class="rjucd-diagnosis"></i>
            </el-tooltip>
            <span>网络体检</span>
          </a>
        </li>
        <li v-if="showApp">
          <qrcode>
            <a class="nav-item" href="javascript:;">
              <el-tooltip content="下载APP" effect="light" placement="bottom">
                <i class="rjucd-sys"></i>
              </el-tooltip>
              <span>下载APP</span>
            </a>
          </qrcode>
        </li>
        <li v-if="!$roles().includes('slave')">
          <a @click="goQuickset" class="nav-item" href="javascript:;">
            <el-tooltip content="快速配置" effect="light" placement="bottom">
              <i class="rjucd-rocket"></i>
            </el-tooltip>
            <span>快速配置</span>
          </a>
        </li>
        <li v-if="showCheck">
          <!-- <el-badge :max="9" :value="alarmNum" style="line-height: 1"> -->
          <a @click="gotoAlarm" class="nav-item" href="javascript:;">
            <el-tooltip content="查看告警详情" effect="light" placement="bottom">
              <i class="rjucd-warning"></i>
            </el-tooltip>
            <span>告警</span>
          </a>
          <!-- </el-badge> -->
        </li>
        <li>
          <a :class="{'c-info cursor-def': isDefaultPass}" @click="logout" class="nav-item" href="javascript:;">
            <el-tooltip :content="isDefaultPass ? '默认密码免登录' : '安全退出到登录页'" effect="light" placement="bottom">
              <!-- <i class="rjucd-reload"></i> -->
              <span>{{isDefaultPass ? '默认密码' : '注销'}}</span>
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
import Brand from '@/views/common/header/Brand'
export default {
  name: 'AppHeader',
  data() {
    return {
      alarmNum: 0,
      timer: true
    }
  },
  components: {
    [Brand.name]: Brand,
    [Qrcode.name]: Qrcode,
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
      return (
        this.$roles().includes('egw') ||
        this.$roles().includes('eap') ||
        this.$roles().includes('msw')
      )
    },
    // 是否显示网络体检
    showCheck() {
      return !this.$roles().includes('msw')
    },
    collapse() {
      return this.$store.getters.collapse
    },
    isDefaultPass() {
      return this.$store.getters.isDefaultPass
    }
  },
  watch: {
    collapse() {
      if (window.Event) {
        setTimeout(() => {
          let $resize = new Event('resize')
          window.dispatchEvent($resize)
        }, 100)
      }
    }
  },
  methods: {
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
    // 切换侧边菜单栏
    onCollapse() {
      this.$store.dispatch('setCollapse', !this.collapse)
    },
    // 跳转告警页
    gotoAlarm() {
      this.$router.push({
        name: `admin/alone/diagnose/diagnose_alarm`,
        query: { fromHead: true }
      })
    },
    // 跳转向导页
    goQuickset() {
      this.$router.push({ name: 'quickset' })
    },
    // 注销
    logout() {
      if (!this.isDefaultPass) {
        this.$api.common('logout').then(d => {
          removeFromSession('APP_DEFAULT_PATH')
          window.top.location = window.top.location.origin
        })
      }
    }
  }
}
</script>
<style lang="scss">
ol.ol-num li {
  list-style: decimal;
}
</style>
<style lang="scss" scoped>
@import '../style/utils/variable';
@import '../style/utils/mixins';
.qrcode-tip li {
  margin-top: 5px;
  list-style: disc;
}
.app-header {
  padding: 0 10px;
  .tm {
    @include text-middle($app-header-height);
  }
  .nav-group {
    & > li {
      float: left;
      margin-left: 14px;
    }
    .nav-item {
      &__toggle {
        display: none;
      }
      cursor: pointer;
      display: inline-block;
      vertical-align: middle;
      text-align: center;
      &:hover {
        color: $--color-text-primary;
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
  @media screen and (min-width: 768px) {
    .nav-group {
      .nav-item {
        &__toggle {
          display: inline-block;
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
    cursor: default;
  }
}
</style>

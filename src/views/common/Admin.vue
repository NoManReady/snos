<template>
  <div class="admin">
    <iframe :src="masterUrl" @load="onIframeLoad" class="iframe" ref="adminIframe" v-if="showIframe"></iframe>
    <template v-else>
      <app-header @select-item="selectItem" v-if="!hideHead"></app-header>
      <div :class="hideHead && 'top0'" class="app-main">
        <app-aside :menus="menus" :p-path="pPath" @select-item="selectItem" v-if="!hideMenu"></app-aside>
        <div :style="contentStyl" class="app-content">
          <!-- <app-breadcrumb class="mb10" v-if="!isHomeOverview" /> -->
          <router-view :class="{ block: hasBlock }" :key="`${routerId}`"></router-view>
        </div>
      </div>
      <template v-if="detailShow">
        <dev-config @closed="detailShow = false" v-bind="devConfig"></dev-config>
      </template>
      <transition mode="in-out" name="fade">
        <common-robot v-if="!isInIframe && isSmb" />
      </transition>
    </template>
  </div>
</template>
<script>
import {
  loadOnlineVers,
  loadNetworkNeighbor,
  showPppoeTimeout
} from '@/utils/index'
import { AppAside, AppHeader } from '@/layout'
import Top from '@/common/Top'
import Robot from '@/common/Robot'
import DevConfig from '@/views/common/DevConfig'
import { flatMenus } from '@/utils/menus'
import { getIframeUrl, isNewVersion } from '@/utils/iframeUtils'
export default {
  name: 'Admin',
  data() {
    return {
      routerId: Math.random(),
      detailShow: false,
      devConfig: {},
      masterUrl: getIframeUrl(),
      iframeOk: true // 判断iframe加载资源和entry页是否正常
    }
  },
  components: {
    // AppBreadcrumb,
    AppAside,
    AppHeader,
    DevConfig,
    [Robot.name]: Robot,
    [Top.name]: Top
  },
  mounted() {
    let _iframe = this.$refs.adminIframe
    if (_iframe) {
      // 资源加载错误处理
      _iframe.contentWindow.addEventListener(
        'error',
        event => {
          let _name =
            (event.target &&
              event.target.nodeName &&
              event.target.nodeName.toLocaleUpperCase()) ||
            ''
          if (_name === 'SCRIPT' || _name === 'LINK') {
            this.iframeOk = false
            this.$alert(
              I18N.t('admin.master_source_err_tip'),
              I18N.t('admin.master_source_err')
            )
          }
        },
        true
      )
    }
  },
  computed: {
    isSmb() {
      return !this.$store.getters.isIndustry
    },
    // 内容模块style
    contentStyl() {
      return this.hideMenu
        ? { left: '0' }
        : this.$store.getters.collapse
        ? { left: '64px' }
        : { left: '180px' }
    },
    isSlave() {
      return this.$roles().includes('slave')
    },
    isMaster() {
      return this.$roles().includes('master')
    },
    hasPppoeServer() {
      return (
        this.$store.getters.devMode.forwardMode === 'ROUTER' &&
        this.$roles().includes('pppoe_server')
      )
    },
    isAloneMenu() {
      return this.$roles().includes('alone') || this.isEhr // ehr当作alone处理菜单
    },
    pPath() {
      return Object.freeze(
        this.isAloneMenu || this.isSlave ? ['admin', 'alone'] : ['admin']
      )
    },
    aloneMenus() {
      let _deviceMenus =
        this.$store.getters.adminMenus.find(menu => menu.path === 'alone') || {}
      return _deviceMenus.children || []
    },
    // master和slaver的左侧菜单都是全局的
    adminMenus() {
      return this.$store.getters.adminMenus
    },
    isEhr() {
      return this.$roles().includes('ehr')
    },
    menus() {
      return this.isAloneMenu ? this.aloneMenus : this.adminMenus
    },
    flatMenus() {
      return flatMenus(this.menus, {}, this.pPath)
    },
    childMenus() {
      return this.$store.getters.childMenus
    },
    isHomeOverview() {
      return ['/admin/home_overview', '/admin/slave_eg'].includes(
        this.$route.path
      )
    },
    hasBlock() {
      return (
        this.childMenus.menus.length === 0 &&
        !this.isHomeOverview &&
        !this.isAloneMenu
      )
    },
    PROXY() {
      return window.PROXY || {}
    },
    // 是否隐藏页头
    hideHead() {
      // 显示指定优先级最高
      if (this.PROXY.hideHead === 'true') {
        return true
      }
      // 参数未指定时，如果是从模式，在iframe里则隐藏，其他情况不隐藏
      return this.isSlave ? this.isInIframe : false
    },
    // 是否隐藏左侧纵向菜单
    hideMenu() {
      // 显示指定优先级最高
      if (this.PROXY.menuMode === 'none') {
        return true
      }
      // 参数未指定时，如果是从模式则隐藏
      return this.isSlave
    },
    /**
     * 判断页面是否在iframe中
     *  iframe中的页面，默认隐藏Head和menu
     */
    isInIframe() {
      return window !== window.top
    },
    // 从设备嵌入master页面
    showIframe() {
      return (
        this.isSlave &&
        !this.isInIframe &&
        this.isSupport &&
        this.master.pingOk &&
        this.iframeOk &&
        !this.isEhrMaster
      )
    },
    isEhrMaster() {
      return this.isEhr && this.master.devModel.indexOf('EW') === 0
    },
    master() {
      return this.$store.getters.master || {}
    },
    isSupport() {
      return this.isSlave ? isNewVersion(this.master.software) : true
    }
  },
  beforeDestroy() {
    this.$bus.$off('popDevDetail')
  },
  async created() {
    // 当前为从设备，主设备不可访问时设置目的window
    if (this.isSlave && !this.isInIframe) {
      if (!this._checkMasterPingOk() || !this._checkSupportVer()) {
        window.top.$$MASTER_WINDOW = window
        return
      }
    }
    // 非从设备，设置第一个具有header的设备为目的window
    if (!this.isSlave && !this.hideHead && !window.top.$$MASTER_WINDOW) {
      window.top.$$MASTER_WINDOW = window
    }
    // 延迟检测版本和冲突（刚进入冲突检测可能有误）
    if (!this.hideHead) {
      setTimeout(() => {
        // 检测是否有在线可升级版本
        if (!this.isSlave) {
          loadOnlineVers()
        }
        // 主控制器进行冲突检测
        if (this.isMaster) {
          loadNetworkNeighbor()
        }
        // pppoe账号到期状态
        if (this.hasPppoeServer) {
          showPppoeTimeout()
        }
      }, 3000)
    }
    // 顶层监听右侧弹框
    this.$bus.$on('popDevDetail', ({ devConfig }) => {
      this.devConfig = devConfig
      this.detailShow = true
    })
  },
  watch: {
    '$route.fullPath': {
      handler(v, ov) {
        this._initMenu()
      },
      immediate: true
    }
  },
  methods: {
    _checkMasterPingOk() {
      if (this.master.pingOk === false) {
        this.$alert(
          I18N.t('admin.master_ping_err_tip'),
          I18N.t('admin.master_ping_err'),
          {
            showClose: false,
            confirmButtonText: I18N.t('admin.view_slave_only'),
            closeOnClickModal: false
          }
        )
        return false
      }
      return true
    },
    _checkSupportVer() {
      if (!this.isSupport) {
        this.$confirm(
          I18N.t('admin.master_old_err_tip'),
          I18N.t('admin.master_old_err'),
          {
            // type: 'warning',
            showClose: false,
            cancelButtonText: I18N.t('admin.view_slave_only'),
            confirmButtonText: I18N.t('admin.upgrade_master'),
            closeOnClickModal: false
          }
        ).then(
          _ => {
            let _masterUrl = getIframeUrl(
              {
                ip: this.master.ip,
                sn: this.master.sn
              },
              false
            )
            window.open(_masterUrl, '_blank')
          },
          _ => {}
        )
        return false
      }
      return true
    },
    onIframeLoad(e, a) {
      let _iframe = this.$refs.adminIframe
      if (_iframe) {
        // 主设备WEB页面根节点异常 (可能服务器异常)
        if (!_iframe.contentDocument.body.className.includes('rj-body')) {
          this.iframeOk = false
          this.$alert(
            I18N.t('admin.master_unknow_err_tip'),
            I18N.t('admin.master_unknow_err')
          )
        }
      }
    },
    // 设置子路由_
    _initMenu() {
      if (this.isSlave) {
        return this.$store.commit('APP_CHILD_MENUS', {
          menus: this.aloneMenus,
          path: ['admin', 'alone']
        })
      }
      let _routeMatcheds = this.$route.matched || []
      let _curMatch = _routeMatcheds[this.pPath.length]
      if (_curMatch) {
        let _curPath = _curMatch.path
        let _curMenu = this.flatMenus[_curPath]
        if (_curMenu) {
          this.$store.commit('APP_CHILD_MENUS', {
            menus: _curMenu.children || [],
            path: _curMenu.fullPath
          })
        }
      }
    },
    // 菜单栏触发事件
    selectItem(menu) {
      let _routeName = `${menu.fullPath.join('/')}`
      if (_routeName === this.$route.name) {
        let _compName = this.pPath[this.pPath.length - 1]
        _compName = _compName.replace(
          /(\w)(\w+)/,
          (all, a, b) => `${a.toUpperCase()}${b}`
        )
        let _vm = this.getComponentByName(this.$parent, _compName) || this
        _vm.routerId = Math.random()
        _vm.$route.query.tab && (_vm.$route.query.tab = '0')
      } else {
        this.$router.push({
          name: _routeName,
          query: menu.query || {}
        })
      }
    },
    getComponentByName(parent, name) {
      for (let _child of parent.$children) {
        let _name = _child.$options.name
        if (_name === name) {
          return _child
        } else {
          let _comp = this.getComponentByName(_child, name)
          if (_comp) {
            return _comp
          }
        }
      }
      return null
    }
  }
}
</script>
<style lang="scss" scoped>
.admin {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;

  .top0 {
    top: 0 !important;
  }
  .iframe {
    width: 100%;
    height: 100%;
    border: none;
    // 解决iframe内联元素，导致了div被撑开出现滚动条的问题
    display: block;
    // vertical-align: top;
  }
  .iframe-content {
    padding: 0;
  }
}
</style>

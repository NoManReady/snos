<template>
  <div class="admin">
    <iframe :src="masterUrl" @load="iframeLoadOk" class="iframe" ref="adminIframe" v-if="showIframe"></iframe>
    <template v-else>
      <app-header @select-item="selectItem" v-if="!hideHead"></app-header>
      <div :class="hideHead && 'top0'" class="app-main">
        <app-aside :menus="menus" :p-path="pPath" @select-item="selectItem" v-if="!hideMenu"></app-aside>
        <div :style="contentStyl" class="app-content">
          <!-- <app-breadcrumb class="mb10" v-if="!isHomeOverview" /> -->
          <router-view :class="{'block': hasBlock}" :key="`${routerId}`"></router-view>
        </div>
      </div>
      <template v-if="detailShow">
        <dev-config @closed="detailShow = false" v-bind="devConfig"></dev-config>
      </template>
      <transition mode="in-out" name="fade">
        <common-robot />
      </transition>
    </template>
  </div>
</template>
<script>
import { loadOnlineVers, loadNetworkNeighbor } from '@/utils/index'
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
      masterUrl: ''
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
      if (_iframe.attachEvent) {
        _iframe.attachEvent('onload', function() {
          // console.log('Local iframe is now loaded. Attach')
        })
      } else {
        _iframe.onload = function() {
          // console.log('Local iframe is now loaded.')
        }
      }
    }
  },
  computed: {
    // 内容模块style
    contentStyl() {
      return this.hideMenu
        ? { left: '0' }
        : this.$store.getters.collapse
        ? { left: '64px' }
        : { left: '155px' }
    },
    isSlave() {
      return this.$roles().includes('slave')
    },
    isMaster() {
      return this.$roles().includes('master')
    },
    isAlone() {
      return this.$roles().includes('alone')
    },
    pPath() {
      return Object.freeze(this.isMaster ? ['admin'] : ['admin', 'alone'])
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
    menus() {
      return this.isAlone ? this.aloneMenus : this.adminMenus
    },
    flatMenus() {
      return flatMenus(this.menus, {}, this.pPath)
    },
    childMenus() {
      return this.$store.getters.childMenus
    },
    isHomeOverview() {
      return this.$route.path === '/admin/home_overview'
    },
    hasBlock() {
      return this.childMenus.menus.length === 0 && !this.isHomeOverview
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
        this.isSlave && !this.isInIframe && this.isSupport && this.master.pingOk
      )
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
    if (this.isSlave && !this.isInIframe) {
      await this._checkMasterPingOk()
      await this._checkSupportVer()
    }
    if (this.showIframe) {
      this.masterUrl = getIframeUrl()
    }
    // 设置postMessage目的window
    if (this.isAlone || (this.isMaster && !window.top.$$MASTER_WINDOW)) {
      window.top.$$MASTER_WINDOW = window
    }
    // 延迟检测版本和冲突（刚进入冲突检测可能有误）
    !this.PROXY.hideHead &&
      setTimeout(() => {
        // 检测是否有在线可升级版本
        if (!this.isSlave) {
          loadOnlineVers()
        }
        // 主控制器进行冲突检测
        if (this.isMaster) {
          loadNetworkNeighbor()
        }
      }, 3000)
    this._onPopDevDetail()
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
    async _checkMasterPingOk() {
      if (this.master.pingOk === false) {
        return this.$confirm(
          `您当前登录的是从设备，由于主设备无法ping通，无法查看整网信息，将为您展示从设备（本机）的信息。`,
          `检测到当前网络的主设备无法ping通`,
          {
            // type: 'warning',
            showClose: false,
            cancelButtonText: '知道了，只看从设备',
            confirmButtonText: '尝试网络自检查看原因',
            closeOnClickModal: false
          }
        ).then(
          _ => {
            this.$router.push({
              name: `admin/alone/diagnose/diagnose_network`,
              query: { start: true }
            })
          },
          _ => {}
        )
      }
    },
    _checkSupportVer() {
      if (!this.isSupport) {
        return this.$confirm(
          `您当前登录的是从设备，由于主设备的版本较旧，无法查看整网信息，将为您展示从设备（本机）的信息。`,
          `检测到当前网络的主设备版本较旧`,
          {
            // type: 'warning',
            showClose: false,
            cancelButtonText: '知道了，只看从设备',
            confirmButtonText: '想看整网信息，去升级主设备',
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
        let _vm = this.getComponentByName(this.$root, _compName) || this
        _vm.routerId = Math.random()
      } else {
        this.$router.push({
          name: _routeName,
          query: menu.query || {}
        })
      }
    },
    iframeLoadOk(e, a) {},
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
    },
    _onPopDevDetail(data) {
      this.$bus.$on('popDevDetail', ({ devConfig }) => {
        this.devConfig = devConfig
        this.detailShow = true
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.admin {
  height: 100%;

  .top0 {
    top: 0 !important;
  }
  .iframe {
    width: 100%;
    height: 99%;
    border: none;
  }
  .iframe-content {
    padding: 0;
  }
}
</style>

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// 国际化配置
import { i18n } from '@/plugins/i18n'
import App from './App'
import router from './router'
import store from './store'
import HelpAlert from '@/common/HelpAlert'
import './utils/promise-finally'

// 开发环境登录模拟
import {
  login,
  getCommonInfo
} from '@/utils/debug'
import { log } from '@/utils'

Vue.component(HelpAlert.name, HelpAlert)
// cookies配置
import cookie from 'cookies-js'
window.Cookie = cookie
// router进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({
  showSpinner: false
})

// UI框架
// import ElementUI from 'element-ui'
import '@/utils/elementUiImport'
// 配置皮肤（打开编译比较慢）
import '@/style/iconfont.css'
// import '../dev/css/index.css'

// webpack加载动态js加载使用__webpack_public_path__
window.__pulicPath = __webpack_public_path__ = `${window.BASE_URI.split(/\/cgi-bin/)[0]}${process.env.STATIC_PATH}/`
log("__webpack_public_path__", __webpack_public_path__)

// 工具配置
import {
  checkBackupFile
} from '@/utils'
import apis from '@/api'
import bus from '@/utils/bus'
import auth from '@/directives/auth'

Vue.directive('auth', auth)

Object.defineProperties(Vue.prototype, {
  $api: {
    value: apis
  },
  $log: {
    value: log
  },
  $bus: {
    value: bus
  },
  $dev: {
    value() {
      // ewr 也返回egw，兼容旧的路由设置等
      return ["ewr", "ehr"].includes(store.getters.capacity.dev_type) ? "egw" : store.getters.capacity.dev_type
    }
  },
  $roles: {
    value() {
      return store.getters.roles
    }
  },
  $encry: {
    value(v, k) {
      return GibberishAES.enc(v, k || process.env.KEY).replace(/\s$/g, '')
    }
  },
  $decry: {
    value(v, k) {
      return GibberishAES.dec(v, k || process.env.KEY).replace(/\s$/g, '')
    }
  }
})

// 环境配置
const dev = process.env.NODE_ENV !== 'production'
Vue.config.debug = dev
Vue.config.devtools = dev
Vue.config.productionTip = !dev

// 页面路由对象记录配置（选配）
const HISTORY_CACHE = Object.create(null)
let HISTORY_CACHE_KEY_COUNT = 0
HISTORY_CACHE['/'] = 0

let PAGE_INIT = false

function loadRoutes(next, to) {
  return new Promise(async (resolve, reject) => {
    if (!store.getters.dynamicRoutes.length) {
      try {
        await getCommonInfo()
        setTimeout(() => {
          store.dispatch('getIsDefaultPass').then(isDefpass => {
            if (isDefpass) {
              // 出厂设置需要设置下系统时间
              apis.setSysTime({ time: (new Date().getTime() / 1000).toFixed(0) })
            }
          })
        }, 2000)
      } catch (error) {
        log(error)
      }
      store.dispatch('getDynamicRoute').then(d => {
        router.addRoutes(d)
        next(to.fullPath)
      })
    } else {
      next()
    }
    resolve()
  })
}

router.beforeEach((to, from, next) => {
  // 设置title，开启加载条
  NProgress.start()
  // store.dispatch('title', i18n.t(`nav.${to.meta.t}`) )
  /*页面级animated--begin*/
  let toName = to.name || to.path
  let fromName = from.name || from.path
  const toIndex = HISTORY_CACHE[toName]
  const fromIndex = HISTORY_CACHE[fromName]
  // 判断当前页面是否进入过
  // 是：如果当前权级>前一个权级，进入（forward），否则退出（reverse）
  // 否：记录当前路径-权级+1，并进入（forward）
  if (toIndex) {
    if (parseInt(toIndex, 10) > parseInt(fromIndex, 10)) {
      store.dispatch('direction', 'forward')
    } else {
      store.dispatch('direction', 'reverse')
    }
  } else {
    ++HISTORY_CACHE_KEY_COUNT
    toName !== '/' && (HISTORY_CACHE[toName] = HISTORY_CACHE_KEY_COUNT)
    store.dispatch('direction', 'forward')
  }
  /*页面级animated--end*/

  // 开发环境进行登录操作，然后再进行路由跳转
  if (dev) {
    login().then(() => {
      loadRoutes(next, to)
    })
  } else {
    loadRoutes(next, to)
  }
})

const loadingTrans = () => {
  if (!PAGE_INIT) {
    document.title = I18N.t('main_header.web_manage')
    checkBackupFile()
    let _loadEle = document.querySelector('[eweb-loader]')
    PAGE_INIT = true
    // if (_loadEle) {
    //   let _opacity = +(_loadEle.style.opacity || 1)
    //   while (_opacity > 0.1) {
    //     _opacity -= 0.1
    //     _loadEle.style.opacity = _opacity
    //     await sleep(50)
    //   }
    //   _loadEle.parentElement.removeChild(_loadEle)
    //   // _loadEle.remove()
    // }
    _loadEle.parentElement.removeChild(_loadEle)
  }
}

router.afterEach((to, from) => {
  loadingTrans()
  // 关闭加载条
  NProgress.done()
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: {
    App
  }
})

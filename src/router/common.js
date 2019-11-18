import store from '@/store'
import { log } from '@/utils'

const Err404 = () =>
  import('@/views/common/404')
// const ModifyPass = () =>
//   import( /* webpackChunkName: "group-common" */ '@/views/admin/systool/Password')
// const Admin = () =>
//   import( /* webpackChunkName: "group-common" */ '@/views/common/Admin')

function getFirstLeaf(menus) {
  let _leaf = {
    name: 'Err404'
  }
  if (menus.length) {
    let _root = menus[0]
    _leaf = _root.path
    while (_root.children && _root.children.length) {
      _root = _root.children[0]
      _leaf = `${_leaf}/${_root.path}`
    }
  }
  return _leaf
}

// 根据菜单回去动态路由
function getDynamicRoutes(menus = [], pMenu = {}) {
  let _routes = []
  menus.forEach(menu => {
    let { children, ...props } = menu
    if (!menu.compPath) {
      if (menu.children && menu.children.length > 0) {
        _routes.push(...getDynamicRoutes(menu.children, props))
      }
    } else {
      let _curPathString = menu.fullPath.join('/')
      // let _commonPath = 'views/common'
      let _route = {
        path: `/${_curPathString}`,
        name: _curPathString,
        components: {
          default:
            () => {
              if (menu.compPath.indexOf("views/common") > -1) {
                let _comppath = menu.compPath.replace("views/common", '')
                return import(/* webpackChunkName: "common" */`@/views/common${_comppath}.vue`)
              }
              if (menu.compPath.indexOf(process.env.VIEWS_PATH) > -1) {
                let _comppath = menu.compPath.replace(process.env.VIEWS_PATH, '')
                return import(/* webpackChunkName: "device" */`@/${process.env.VIEWS_PATH}${_comppath}.vue`)
              }
            }
        },
        meta: {
          ...props
        },
        props: true
      }
      // if (menu.path === 'device_setting') {
      //   _route.components.deviceMenu = () =>
      //     import(/* webpackChunkName: "deviceMenu" */`@/components/DeviceMenu.vue`)
      // }
      log(_route.name + '----->' + menu.compPath)
      // 设置路由别名(移除父路径操作)
      // if (pMenu.showChilds === false) {
      //   _route.alias = _route.path.replace(`/${pMenu.path}`, '')
      //   log(_route.path + '-----alias----->' + _route.alias)
      // }
      if (children && children.length) {
        // 路由路径
        let _pathArr = [_curPathString, getFirstLeaf(children)]
        log(_route.name + '------->' + `/${_pathArr.join('/')}`)
        _route.redirect = () => {
          return `/${_pathArr.join('/')}`
        }
        _route.children = getDynamicRoutes(children, props)
      }
      _routes.push(_route)
    }
  })
  return _routes
}

// 获取所有路由
export const getAllRoutes = () => {
  let _dynamicRoutes = getDynamicRoutes(store.getters.menus)
  return [
    ..._dynamicRoutes,
    {
      path: '/404',
      name: 'Err404',
      component: Err404,
      meta: {
        t: 'notfound'
      }
    },
    {
      path: '*',
      name: 'redirect',
      redirect: () => {
        // 初始进入且自动登录INITPATH
        if (window.INITPATH) {
          // 待修改：这个initpath如果不存在就会死循环
          return INITPATH
        }
        if (window.APP_ROLES.includes('slave') && window.APP_ROLES.includes("egw")) {
          return "admin/alone"
        }
        log(getFirstLeaf(store.getters.menus))
        return getFirstLeaf(store.getters.menus)
      }
    }
  ]
}

export const routes = []

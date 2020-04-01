import * as types from './constant'
import {
  getAllRoutes
} from '@/router/common'
import {
  getQuene
} from '@/utils/menus'
import { common } from '@/api/modules/api'
/**
 * 全局布局状态相关
 */
export default {
  state: {
    // 菜单
    menus: [],
    // 子菜单
    childMenus: { menus: [], path: [] },
    // 角色
    roles: [],
    // 动态路由
    dynamicRoutes: [],
    // 能力表
    capacity: {},
    // 默认路由
    defaultPath: '',
    // 组网角色
    deviceRole: '',
    // 是否默认密码
    isDefaultPass: '',
    // 设备模式
    devMode: {},
    // 是否行业版
    isIndustry: false,
    userName: window.APP_USERNAME
  },
  actions: {
    setMenus({
      commit
    }, menus) {
      commit(types.APP_MENUS, getQuene(menus))
    },
    setUsreName({
      commit
    }, username) {
      commit(types.APP_USERNAME, username)
    },
    setRoles({
      commit
    }, roles) {
      commit(types.APP_ROLES, roles)
    },
    setDeviceRole({
      commit
    }, role) {
      commit(types.APP_DEVICE_ROLE, role)
    },
    setDevMode({
      commit
    }, devMode) {
      commit(types.APP_DEV_MODE, devMode)
    },
    setCapacity({
      commit
    }, capacity) {
      commit(types.APP_CAPACITY, capacity)
    },
    getDynamicRoute({
      commit,
      getters
    }) {
      return new Promise((resolve, reject) => {
        const _routes = getAllRoutes()
        commit(types.APP_ROUTES, _routes)
        resolve(_routes)
      })
    },
    setDefaultPath({
      commit
    }, path) {
      commit(types.APP_DEFAULT_PATH, path)
    },
    getIsDefaultPass({ commit }) {
      return common('isDefPass', null, { isSilence: true }).then(d => {
        commit(types.APP_DEFAULT_PASS, d.isDef)
        return d.isDef
      })
    },
    setIsDefaultPass({ commit }, isDefaultPass) {
      commit(types.APP_DEFAULT_PASS, isDefaultPass)
    }
  },
  mutations: {
    [types.APP_MENUS](state, payload) {
      state.menus = Object.freeze(payload)
    },
    [types.APP_ROLES](state, payload) {
      state.roles = Object.freeze(payload)
    },
    [types.APP_USERNAME](state, payload) {
      state.userName = payload
    },
    [types.APP_DEVICE_ROLE](state, payload) {
      state.deviceRole = payload
    },
    [types.APP_DEV_MODE](state, payload) {
      state.devMode = payload
    },
    [types.APP_CAPACITY](state, payload) {
      state.capacity = Object.freeze(payload)
    },
    [types.APP_ROUTES](state, payload) {
      state.dynamicRoutes = Object.freeze(payload)
    },
    [types.APP_DEFAULT_PATH](state, payload) {
      state.defaultPath = payload
    },
    [types.APP_DEFAULT_PASS](state, payload) {
      state.isDefaultPass = payload
    },
    [types.APP_CHILD_MENUS](state, payload) {
      state.childMenus = payload
    }
  },
  getters: {
    dynamicRoutes(state) {
      return state.dynamicRoutes
    },
    capacity(state) {
      return state.capacity
    },
    isIndustry(state) {
      return state.capacity.product_type === 'industry'
    },
    menus(state) {
      return state.menus
    },
    childMenus(state) {
      return state.childMenus
    },
    adminMenus(state) {
      let _adminMenu = state.menus.find(menu => menu.path === 'admin')
      return _adminMenu ? _adminMenu.children : []
    },
    roles(state) {
      return state.roles
    },
    deviceRole(state) {
      return state.deviceRole
    },
    devMode(state) {
      return state.devMode
    },
    isSingleRadio(state, getters) {
      return !!(
        getters.capacity.wireless &&
        getters.capacity.wireless.radiolist.length === 1
      )
    },
    singleRadioType(state, getters) {
      if (getters.isSingleRadio) {
        return getters.capacity.wireless.radiolist[0].band_support
      }
      return '2.4G'
    },
    defaultPath(state) {
      return state.defaultPath
    },
    rsMapValue(state, getters) {
      let _hasWireless = getters.capacity.wireless
      if (_hasWireless && !getters.roles.includes('master')) {
        let _all = []
        _hasWireless.radiolist.forEach(radio => {
          _all.push(radio.index)
        })
        return _all.join(',')
      } else {
        return '1,2'
      }
    },
    rsMaps(state, getters) {
      let _rsMapValue = getters.rsMapValue.split(',')
      let _rsMap = []
      if (_rsMapValue.length > 1) {
        _rsMap.push({
          k: '2.4G + 5G',
          v: '1,2'
        })
      }
      if (_rsMapValue.includes('1')) {
        _rsMap.push({
          k: '2.4G',
          v: '1'
        })
      }
      if (_rsMapValue.includes('2')) {
        _rsMap.push({
          k: '5G',
          v: '2'
        })
      }
      return _rsMap
    },
    isDefaultPass(state, getters) {
      return state.isDefaultPass
    },
    userName(state) {
      return state.userName
    }
  }
}

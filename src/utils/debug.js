import api from '@/api'
import store from '@/store'
import config from '../../../config'
import {
  loadFromLocal
} from '@/utils/localStorage'

export const getCommonInfo = async () => {
  try {
    let _commonInfo = await api.common('getAuthorityInfo', null, { isSilence: true })
    window.APP_MASTER = _commonInfo.master || ''
    window.APP_DEV_MODE = _commonInfo.devMode || {}
    window.APP_MENUS = _commonInfo.menus || []
    window.APP_ROLES = _commonInfo.roles || []
    window.APP_DEVICE_ROLE = _commonInfo.deviceRole || ''
    window.APP_CAPACITY = _commonInfo.capacity || {}
    window.APP_CAPACITY_SW = {}
    window.APP_HOSTNAME = _commonInfo.hostname
    window.APP_SYSINFO = _commonInfo.sysinfo
    window.APP_ACCOUNT_CTRL = _commonInfo.accountMenus
    if (_commonInfo.capacity_sw) {
      try {
        window.APP_CAPACITY_SW = JSON.parse(_commonInfo.capacity_sw)
      } catch (error) {
        window.APP_CAPACITY_SW = {}
      }
    }
    window.APP_DEFAULT_PATH = _commonInfo.defaultPath || ''
    window.APP_NETWORK_ID = _commonInfo.networkId
    window.APP_CURRENT_IP = _commonInfo.currentIp
    window.APP_USERNAME = _commonInfo.username
    store.dispatch('setMenus', window.APP_MENUS)
    store.dispatch('setRoles', window.APP_ROLES)
    store.dispatch('setUsreName', window.APP_USERNAME)
    store.dispatch('setDeviceRole', window.APP_DEVICE_ROLE)
    store.dispatch('setCapacity', window.APP_CAPACITY)
    store.dispatch('setDefaultPath', window.APP_DEFAULT_PATH)
    store.dispatch('setDevMode', window.APP_DEV_MODE)
    store.dispatch('setMaster', window.APP_MASTER)
    store.commit('APP_SET_HOSTNAME', window.APP_HOSTNAME)
    store.commit('APP_SET_SYSINFO', window.APP_SYSINFO)
    store.commit('APP_SET_NETWORKID', window.APP_NETWORK_ID)
    window.$$json = window.APP_ROLES.includes('msw')
    resolve()
  } catch (error) {
  }
}

export const login = () => {
  if (window.sid) {
    return Promise.resolve()
  }
  if (location.pathname === "/") {
    location.pathname = '/cgi-bin/luci'
  }
  return new Promise((resolve, reject) => {
    api
      .auth('login', {
        username: 'admin',
        password: process.env.EWEB_PASS || config.server.ewebpass || 'ruijie'
      }, { isSilence: true })
      .then(async d => {
        window.sn = d.sn
        window.sid = d.sid
        window.Cookie.set(d.sn, d.sid, {
          path: window.BASE_URI || '/cgi-bin/luci',
          expires: 3600
        })
        window.LANG = d.lang || loadFromLocal('APP_LANG') || 'zh_cn'
        resolve()
      })
  })
}


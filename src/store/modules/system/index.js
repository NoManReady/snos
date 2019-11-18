import * as types from './constant'
import { getHostName, setHostName } from '@/api/modules/overview'
import { cmd } from '@/api/modules/api'
/**
 * 全局布局状态相关
 */
export default {
  state: {
    // 设备名称
    hostname: '',
    // 系统信息
    sysinfo: null,
    // P20新增接口包含主设备的ip sn等信息
    master: '',
    // 设备联网状态
    netStatus: { connnected: '' },
  },
  actions: {
    // 获取hostname
    getHostname({ commit, state }) {
      if (state.hostname) {
        return state.hostname
      }
      return getHostName().then((d) => {
        window.APP_HOSTNAME = d.hostname
        commit(types.APP_SET_HOSTNAME, d.hostname)
      })
    },
    // 配置hostname
    setHostname({ commit, state, rootState }, hostname) {
      return setHostName({
        name: hostname,
        sn: [state.sysinfo.serial_num]
      }).then(() => {
        commit(types.APP_SET_HOSTNAME, hostname)
      })
    },
    getSysinfo({ commit }, sysinfo) {
      return cmd('devSta.get', { module: 'sysinfo' }, { isSilence: true }).then((d) => {
        commit(types.APP_SET_SYSINFO, d)
      })
    },
    setMaster({
      commit
    }, master) {
      commit(types.APP_SET_MASTER, master)
    },
    getNetStatus({ commit }) {
      return cmd('devSta.get', { module: 'networkConnect' }, {
        isSilence: true,
        timeout: 0
      }).then(d => {
        commit(types.APP_NET_STATUS, d)
      })
    }
  },
  mutations: {
    [types.APP_SET_HOSTNAME](state, payload) {
      state.hostname = payload
    },
    [types.APP_SET_SYSINFO](state, payload) {
      payload.auth_ip = state.master.auth_ip || payload.wan_ip
      state.sysinfo = payload
      window.APP_SYSINFO = payload
    },
    [types.APP_SET_MASTER](state, payload) {
      state.master = payload
    },
    [types.APP_NET_STATUS](state, payload) {
      state.netStatus = payload
    }
  },
  getters: {
    sysinfo(state) {
      return state.sysinfo || {}
    },
    hostname(state) {
      return state.hostname
    },
    master(state) {
      return state.master
    },
    masterIp(state) {
      return state.master.ip
    },
    netStatus(state) {
      return state.netStatus
    }
  }
}

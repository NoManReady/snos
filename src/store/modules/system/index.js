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
    // 网络id
    networkId: null,
    // CWMP上云状态
    cwmpStatus: { connected: '' }
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
    getSysinfo({ commit, state, dispatch }, sysinfo) {
      return cmd('devSta.get', { module: 'sysinfo' }, { isSilence: true }).then((d) => {
        if (d.wan_ip === "") {
          setTimeout(() => {
            // IP地址未获取到，重新获取
            dispatch('getSysinfo')
          }, 5000);
        } else {
          if (window.top.$$MASTER_WINDOW) {
            try {
              window.top.$$MASTER_WINDOW.postMessage({ value: d, sn: d.serial_num, type: 'ewebSysinfo' }, '*')
            } catch (error) { }
          }
          commit(types.APP_SET_SYSINFO, d)
        }
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
        timeout: 15000
      }).then(d => {
        commit(types.APP_NET_STATUS, d)
      }, _ => {
        commit(types.APP_NET_STATUS, { connnected: '' })
      })
    },
    setNetworkId({ commit }, networkId) {
      return cmd('devSta.set', { module: 'networkId', data: networkId }, { isSilence: true }).then((d) => {
        commit(types.APP_SET_NETWORKID, networkId)
      })
    },
    getNetworkId({ commit }) {
      return cmd('devSta.get', { module: 'networkId' }, { isSilence: true }).then((d) => {
        commit(types.APP_SET_NETWORKID, d)
      })
    },
    updateNetworkId({ commit }, networkId) {
      commit(types.APP_SET_NETWORKID, networkId)
    },
    getCwmpStatus({ commit, state, dispatch }) {
      return cmd('devSta.get', { module: 'cwmp_status' }, { isSilence: true }).then((d) => {
        commit(types.APP_GET_CWMP_STATUS, d)
        // 定时获取CWMP上云状态
        // if (d.connected === "false") {
        //   setTimeout(() => {
        //     // IP地址未获取到，重新获取
        //     dispatch('getSysinfo')
        //   }, 30000);
        // }
      })
    }
  },
  mutations: {
    [types.APP_SET_HOSTNAME](state, payload) {
      state.hostname = payload
    },
    [types.APP_SET_SYSINFO](state, payload) {
      state.sysinfo = payload
    },
    [types.APP_SET_MASTER](state, payload) {
      state.master = payload
    },
    [types.APP_NET_STATUS](state, payload) {
      state.netStatus = payload
    },
    [types.APP_SET_NETWORKID](state, payload) {
      state.networkId = payload
    },
    [types.APP_GET_CWMP_STATUS](state, payload) {
      state.cwmpStatus = payload
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
    },
    networkId(state) {
      return state.networkId
    },
    cwmpStatus(state) {
      return state.cwmpStatus
    }
  }
}

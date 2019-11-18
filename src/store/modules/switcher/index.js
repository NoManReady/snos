import * as types from './constant'
import { cmd } from '@/api/modules/api'
/**
 * 交换机全局共享状态
 */

export default {
  namespaced: true,
  state: {
    // 系统信息
    portinfo: [],
    // 上联口信息
    uplink: {
      lpid: -1,
      ip: '',
      interface: '',
      mac: ''
    }
  },
  actions: {
    setPortinfo({ commit }, portinfo) {
      commit(types.PORT_INFO, portinfo)
    },
    fetchPortinfo({ commit }) {
      return cmd('devSta.get', { module: 'port_info' }, { isSilence: true }).then(d => {
        commit(types.PORT_INFO, Object.freeze(d.data))
        return d
      })
    },
    fetchUplink({ commit }) {
      return cmd('devSta.get', { module: 'linkup' }, { isSilence: true, showError: false }).then(d => {
        commit(types.UP_LINK, Object.freeze(d))
        return d
      })
    }
  },
  mutations: {
    [types.PORT_INFO](state, payload) {
      state.portinfo = payload
    },
    [types.UP_LINK](state, payload) {
      state.uplink = payload
    }
  },
  getters: {
    uplink(state, getters) {
      let _uplinkObj = { ...state.uplink, lpid: [] }
      // 判断是否为聚合口(查找link态的端口)
      if (state.uplink.lpid > window.APP_CAPACITY_SW.port.port_total - 1) {
        let _uplinkGroup = getters.lagPortsMap[state.uplink.lpid] || []
        _uplinkObj.lagid = state.uplink.lpid
        for (let upport of _uplinkGroup) {
          let _port = getters.logicPort.find(p => p.lpid === upport)
          if (_port && _port.link === 1) {
            _uplinkObj.lpid.push(_port.lpid)
          }
        }
      } else {
        _uplinkObj.lpid.push(state.uplink.lpid)
      }
      return _uplinkObj
    },
    portinfo(state, getters) {
      return state.portinfo.map(port => {
        return {
          ...port,
          isUplink: getters.uplink.lpid.includes(port.lpid)
        }
      })
    },
    // 普通逻辑口
    logicPort(state) {
      return state.portinfo.filter(port => !port.interface.includes('lag')).map(p => {
        return {
          ...p,
          isStaticFiber: p.media_flag === 0 && p.media_type === 2,
          isDynamicFiber: p.media_flag === 1 && p.media_type === 2,
          showPort: p.lpid + 1
        }
      })
    },
    // lag聚合口
    lagPort(state, getters) {
      return state.portinfo.filter(port => {
        return port.interface.includes('lag') && getters.logicPort.find(p => `lag${p.aggregate_port}` === port.interface)
      })
    },
    // 名称与portid的相互映射
    piMap(state) {
      return state.portinfo.reduce((map, port) => {
        map[map[port.interface] = port.lpid] = port.interface
        return map
      }, {})
    },
    // lag与端口集合的映射
    lagPortsMap(_, getters) {
      return getters.lagPort.reduce((map, port) => {
        map[port.lpid] = getters.logicPort.filter(p => `lag${p.aggregate_port}` === port.interface).map(p => p.lpid)
        return map
      }, {})
    }
  }
}

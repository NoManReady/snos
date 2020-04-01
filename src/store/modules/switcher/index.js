import * as types from './constant'
import { cmd } from '@/api/modules/api'
import { isPhyPort, getAggidByLpid } from '@/utils/lag'
/**
 * 交换机全局共享状态
 * lpid<window.APP_CAPACITY_SW.port.port_total判断为物理口，否则为聚合口；
 * 聚合口id从1开始，对应的lpid从1+window.APP_CAPACITY_SW.port.port_total-1开始
 */

export default () => ({
  namespaced: true,
  state: {
    // 系统信息
    portinfo: [],
    // 上联口信息
    uplink: {
      lagid: -1,
      lpid: -1,
      ip: '',
      interface: '',
      mac: ''
    }
  },
  actions: {
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
      let _uplinkObj = { ...state.uplink, lpid: [], lagid: -1 }
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
      return state.portinfo.map((port, index) => {
        // 端口物理能力值（读取poe及ifname），暂时没用
        let _capacity = window.APP_CAPACITY_SW.port.port_list.find(p => p.lpid === port.lpid)
        return {
          ...port,
          ifname: _capacity.ifname.replace(/^(\w)(.*)/, (_, a, b) => `${a.toUpperCase()}${b}`)
        }
      })
    },
    // 光电复合口（包含聚合）
    hybridPort(_, getters) {
      return getters.portinfo.filter(port => port.media_flag === 1)
    },
    // 普通逻辑口（物理口）
    logicPort(_, getters) {
      return getters.portinfo.filter(port => isPhyPort(port.lpid))
    },
    // lag聚合口
    lagPort(_, getters) {
      return getters.portinfo.filter(port => {
        return !isPhyPort(port.lpid) &&
          getters.logicPort.find(p => p.aggregate_port === getAggidByLpid(port.lpid))
      })
    },
    // 名称与portid的相互映射
    piMap(_, getters) {
      return getters.portinfo.reduce((map, port) => {
        map[map[port.ifname] = port.lpid] = port.ifname
        return map
      }, {})
    },
    // lag与端口集合的映射
    lagPortsMap(_, getters) {
      return getters.lagPort.reduce((map, port) => {
        map[port.lpid] = getters.logicPort.filter(p => p.aggregate_port === getAggidByLpid(port.lpid))
          .map(p => p.lpid)
        return map
      }, {})
    }
  }
})

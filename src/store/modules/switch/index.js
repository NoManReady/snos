
import { switchApi } from '@/api/modules/api'
import * as types from './constant'
import Vue from 'vue'
import device_panel from './device_panel'
export default () => ({
  namespaced: true,
  state: {
    //交换机端口列表信息
    portInfoList: [],
    // 交换机vlan模式
    vmode: '',
    // 当前设备信息
    item: null,
    // 上联口信息
    uplink: {
      port: -1,
      mac: '',
      vlan: ''
    }
  },
  actions: {
    // 更新当前sw项目
    updateCurrentItem({ commit }, patch) {
      commit(types.UPDATE_CUR_ITEM, patch)
      return Vue.nextTick()
    },
    // 设置当前sw项目
    setCurrentItem({ commit }, item) {
      commit(types.SET_CUR_ITEM, item)
      commit(types.PORT_INFO_LIST, [])
      return Vue.nextTick()
    },
    // 获取端口信息信息
    async fetchPortInfo({ commit, state }) {
      let { ip, devSN } = state.item
      try {
        let result = await switchApi(
          'doSwitchApi',
          {
            ip,
            sn: devSN,
            method: 'get',
            url: 'rest_get_port.cgi'
          },
          { isSilence: true }
        )
        let portInfoList = result.sort((a, b) => a.port - b.port)
        commit(types.PORT_INFO_LIST, portInfoList)
      } catch (error) {
        console.log(error)
      }
    },
    // 获取vlan模式
    async fetchVMode({ commit, state }) {
      let { ip, devSN } = state.item
      try {
        let result = await switchApi(
          'doSwitchApi',
          {
            ip,
            sn: devSN,
            method: 'get',
            url: 'rest_get_vlan_mode.cgi'
          },
          { isSilence: true }
        )
        commit(types.V_MODE, result.mode)
      } catch (error) {
        commit(types.V_MODE, '-1')
      }
    },
    // 获取上联口
    async fetchUplink({ commit, state }) {
      let { ip, devSN } = state.item
      try {
        let result = await switchApi(
          'doSwitchApi',
          {
            ip,
            sn: devSN,
            method: 'get',
            url: 'rest_get_upports.cgi'
          },
          { isSilence: true }
        )
        commit(types.UPLINK, result)
      } catch (error) {
        commit(types.UPLINK, {
          port: -1,
          mac: '',
          vlan: ''
        })
      }
    },
    // 设置vlan模式
    async patchVMode({ commit, state }, vmode) {
      return new Promise(async (resolve, reject) => {
        let { ip, devSN } = state.item
        let data = {}
        if (vmode === '1') {
          data.mode = '1'
        }
        try {
          commit(types.V_MODE, '')
          await switchApi(
            'doSwitchApi',
            {
              ip,
              sn: devSN,
              data,
              method: 'post',
              url: 'set_vlan_mode.cgi'
            },
            { isSilence: true }
          )
          commit(types.V_MODE, vmode)
          resolve(vmode)
        } catch (error) {
          let _prev = vmode === '1' ? '0' : '1'
          commit(types.V_MODE, _prev)
          reject(_prev)
        }
      })
    }
  },
  mutations: {
    [types.PORT_INFO_LIST](state, payload) {
      state.portInfoList = payload
    },
    [types.V_MODE](state, payload) {
      state.vmode = payload
    },
    [types.UPLINK](state, payload) {
      state.uplink = payload
    },
    [types.SET_CUR_ITEM](state, payload) {
      state.item = payload
    },
    [types.UPDATE_CUR_ITEM](state, payload) {
      for (let key in payload) {
        state.item[key] = payload[key]
      }
    }
  },
  getters: {
    // vmode
    vmode(state) {
      return state.vmode
    },
    // uplink
    uplink(state) {
      return state.uplink
    },
    // portInfoList
    portInfoList(state) {
      return state.portInfoList
    },
    // item
    item(state) {
      return state.item
    },
    // 是否是千兆设备
    isGillionDev({ item }) {
      return /GC/.test(item.deviceType)
    },
    // 是否有千兆口
    hasGillionPort({ item }) {
      return /GC/.test(item.deviceType) || /209/.test(item.deviceType)
    },
    // 设备大类型（5/8,26）
    devBelongType({ item }) {
      return /226|218/.test(item.deviceType) ? 'big' : 'small'
    },
    // 简单port信息
    easyPortList({ portInfoList }) {
      return portInfoList.map(info => {
        return {
          id: info.port,
          label: `端口${info.port + 1}`,
          isFiber: info.isFiber
        }
      })
    },
    // 端口树对象
    portTreeList(_, getters) {
      return Object.freeze([
        {
          id: 'all',
          children: getters.easyPortList,
          label: '全部'
        }
      ])
    },
    // 获取面板信息
    panelList(state) {
      return Object.freeze(device_panel[state.item.deviceType])
    },
    hasDhcp(state, getters) {
      return getters.portInfoList.length > 16
    }
  }
})

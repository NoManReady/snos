
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
        if (result && result.port) {
          commit(types.UPLINK, result)
        }
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
    // 获取面板信息
    panelList(state) {
      return Object.freeze(device_panel[state.item.deviceType])
    },
    // portinfo
    portinfo(state, getters) {
      return state.portInfoList.map(p => {
        let _port = Array.prototype.concat.apply([], getters.panelList).find(_p => _p && _p.lpid === p.port) || { ifname: '' }
        let _r_speed
        switch (p.dup_r) {
          case 1:
          case 2:
            _r_speed = 0
            break
          case 3:
          case 4:
            _r_speed = 1
            break
          case 5:
            _r_speed = 2
            break
          default:
            _r_speed = -1
            break
        }
        let _port_type = 'closed'
        if (p.enable) {
          if (p.status) {
            if (p.dup_r === 5) {
              _port_type = 'success'
            } else {
              _port_type = 'warning'
            }
          } else {
            _port_type = 'info'
          }
        }
        let _execption = p.loop !== 0 ? (p.loop === 1 ? 3 : -1) : 0
        let _portInfo = {
          ...p,
          // media_type:端口类型，lpid端口id
          ..._port,
          // 端口状态
          link: p.status,
          // 端口使能
          enable: p.enable,
          // 端口名称
          ifname: _port.ifname.replace(/^(\w)(.*)/, (_, a, b) => `${a.toUpperCase()}${b}`),
          // 显示icon
          icon: p.isFiber ? 'guangkou' : 'upport',
          // 端口状态（图标场景颜色）
          portType: _port_type,
          // poe是否上电
          poeUp: p.pEnable && p.pPower,
          // poe是否异常
          poeError: p.pEnable && p.pFault,
          // 端口速率（协商）
          r_speed: _r_speed,
          // 收\发字节（流量B）
          input_total: (p.rxBytes || 0) * 1024,
          output_total: (p.txBytes || 0) * 1024,
          input: (p.rxBytes || 0) * 1024,
          output: (p.txBytes || 0) * 1024,
          // 收\发速率（kbps）
          inrate_10s: p.rxSpeed || 0,
          outtrate_10s: p.txSpeed || 0,
          input_rate: p.rxSpeed || 0,
          output_rate: p.txSpeed || 0,
          // 异常信息
          exception: _execption
        }
        // esw自环时设置端口使能为0
        if (p.loop) {
          _portInfo.enable = 0
          _portInfo.portType = 'error'
        }
        return _portInfo
      })
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
          label: `${I18N.t('esw.port')} ${info.port + 1}`,
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
          label: I18N.t('phrase.all')
        }
      ])
    },
    hasDhcp(state, getters) {
      return getters.portinfo.length > 16
    }
  }
})

import store from '@/store'

// 根据选中口id获取真实面板口id
export const getLogicportBySelect = (ids) => {
  let _lagPortMap = store.getters['switcher/lagPortsMap']
  return ids.reduce((ports, id) => {
    if (id >= window.APP_CAPACITY_SW.port.port_total) {
      ports.push(..._lagPortMap[id])
    } else {
      ports.push(id)
    }
    return ports
  }, [])
}

// 获取选中口的逻辑属性
export const getSelectLogicAttr = (ids, lag = true) => {
  let _ids = [...ids]
  if (lag) {
    _ids = getLogicportBySelect(ids)
  }
  let _logicPort = store.getters['switcher/logicPort']
  return _ids.map(id => _logicPort.find(p => p.lpid === id))
}

// 判断选中口是否属性一致（光电口）
export const judgePortAttrMutil = (ids, lag = true) => {
  let _ports = getSelectLogicAttr(ids, lag)

  // 百兆口
  let _FPort = _ports.filter(p => /^FA\d+$/.test(p.ifname.toUpperCase()))
  // 千兆口
  let _GPort = _ports.filter(p => /^GI\d+$/.test(p.ifname.toUpperCase()))
  // 万兆口
  let _TPort = _ports.filter(p => /^TE\d+$/.test(p.ifname.toUpperCase()))

  // 电口(集合)
  let _electricPort = _ports.filter(p => p.media_type === 1)
  // 百兆电口
  let _FelectricPort = _electricPort.filter(p => /^FA\d+$/.test(p.ifname.toUpperCase()))
  // 千兆电口
  let _GelectricPort = _electricPort.filter(p => /^GI\d+$/.test(p.ifname.toUpperCase()))

  // 光口(集合)
  let _fiberPort = _ports.filter(p => p.media_type === 2)
  // 千兆光口
  let _GfiberPort = _fiberPort.filter(p => /^GI\d+$/.test(p.ifname.toUpperCase()))
  // 万兆光口
  let _TfiberPort = _fiberPort.filter(p => /^TE\d+$/.test(p.ifname.toUpperCase()))

  // 光电复用口
  let _fiberElectriPort = _ports.filter(p => p.media_flag === 1)
  // // 光电复用口（光口）
  // let _fiberElectriPortFilterFiber = _fiberElectriPort.filter(p => p.media_type === 2)
  // // 光电复用口（电口）
  // let _fiberElectriPortFilterElectri = _fiberElectriPort.filter(p => p.media_type === 1)
  // 口类型集合
  let _portTypes = []
  if (_electricPort.length) {
    _portTypes.push('electric')
  }
  if (_fiberPort.length) {
    _portTypes.push('fiber')
  }
  // if (_fiberElectriPort.length) {
  //   _portTypes.push('electricAndFiber')
  // }
  // 口速率属性集合
  let _portSpeeds = []
  if (_FPort.length) {
    _portSpeeds.push('F-port')
  }
  if (_GPort.length) {
    _portSpeeds.push('G-port')
  }
  if (_TPort.length) {
    _portSpeeds.push('T-port')
  }
  return {
    mutilType: _portTypes.length > 1,
    mutilSpeed: _portSpeeds.length > 1,
    electric: _electricPort.length === _ports.length,
    fiber: _fiberPort.length === _ports.length,
    electricAndFiber: _fiberElectriPort.length === _ports.length,
    allTPorts: _TfiberPort.length === _ports.length,
    hasFPort: _FPort.length,
    hasGPort: _GPort.length,
    hasTPort: _TPort.length,
    hasFiber: _fiberPort.length,
    hasGFiber: _GfiberPort.length,
    hasTFiber: _TfiberPort.length,
    hasElectric: _electricPort.length,
    hasFElectric: _FelectricPort.length,
    hasGElectric: _GelectricPort.length,
    hasElectricAndFiber: _fiberElectriPort.length,
    portTypes: _portTypes
  }
}

//  判断是否为物理口
export const isPhyPort = (lpid) => lpid < window.APP_CAPACITY_SW.port.port_total

// 根据lpid获取聚合口编号id
export const getAggidByLpid = (lpid) => lpid + 1 - window.APP_CAPACITY_SW.port.port_total

// 根据聚合口编号id获取lpid
export const getLpidByAggid = (aggid) => aggid - 1 + window.APP_CAPACITY_SW.port.port_total

// 判断聚合口是否有成员
export const hasLagmemberByLpid = (lpid) => {
  let _lagPortMap = store.getters['switcher/lagPortsMap']
  if (_lagPortMap[lpid]) {
    return true
  } else {
    return false
  }
}

//  判断是否支持PoE
export const isSupportPoE = (lpid) => {
  return window.APP_CAPACITY_SW.port.port_list.find(port => port.lpid === lpid && port.poe === 1) !== void 0
}

// 判断成员口是否包含上联口
export const hasContainUplink = (portids) => {
  return portids.filter(lpid => {
    let _uplink = store.getters['switcher/uplink']
    if (!isPhyPort(lpid)) {
      return _uplink.lagid === lpid
    } else {
      return _uplink.lpid.includes(lpid)
    }
  }).length
}

// 判断是否包含复合口
export const hasHybridPort = (portids) => {
  let _hybridPort = store.getters['switcher/hybridPort']
  for (let id of getLogicportBySelect(portids)) {
    if (_hybridPort.find(port => port.lpid === id)) {
      return true
    }
  }
  return false
}

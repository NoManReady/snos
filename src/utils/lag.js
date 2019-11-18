import store from '@/store'

// 根据选中口id获取真实面板口id
export const getLogicportBySelect = (ids) => {
  return ids.reduce((ports, id) => {
    if (id >= window.APP_CAPACITY_SW.port.port_total) {
      ports.push(...store.getters['switcher/lagPortsMap'][id])
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
  return _ids.map(id => store.getters['switcher/logicPort'].find(p => p.lpid === id))
}

// 判断选中口是否属性一致（光电口）
export const judgePortAttrMutil = (ids, lag = true) => {
  let _ports = getSelectLogicAttr(ids, lag)
  // 电口(集合)
  let _electricPort = _ports.filter(p => p.media_type === 1 && p.media_flag === 0)

  // 百兆口
  let _FPort = _ports.filter(p => /^fa\d+$/.test(p.interface))
  // 千兆口
  let _GPort = _ports.filter(p => /^gi\d+$/.test(p.interface))

  // 百兆电口
  let _FelectricPort = _electricPort.filter(p => /^fa\d+$/.test(p.interface))
  // 千兆电口
  let _GelectricPort = _electricPort.filter(p => /^gi\d+$/.test(p.interface))
  // 光口(集合)
  let _fiberPort = _ports.filter(p => p.media_type === 2 && p.media_flag === 0)
  // 千兆光口
  let _GfiberPort = _fiberPort.filter(p => /^gi\d+$/.test(p.interface))
  // 万兆光口
  let _TfiberPort = _fiberPort.filter(p => /^tgi\d+$/.test(p.interface))
  // 光电复用口
  let _fiberElectriPort = _ports.filter(p => p.media_flag === 1)
  // 口类型集合
  let _portTypes = []
  if (_electricPort.length) {
    _portTypes.push('electric')
  }
  if (_fiberPort.length) {
    _portTypes.push('fiber')
  }
  if (_fiberElectriPort.length) {
    _portTypes.push('electricAndFiber')
  }
  return {
    mutil: _portTypes.length > 1,
    electric: _electricPort.length === _ports.length,
    fiber: _fiberPort.length === _ports.length,
    electricAndFiber: _fiberElectriPort.length === _ports.length,
    allTPorts: _TfiberPort.length === _ports.length,
    hasFPort: _FPort.length,
    hasGPort: _GPort.length,
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


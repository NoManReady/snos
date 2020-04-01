import * as api from './api'

/**
 * 获取ap列表版本信息
 */
export const getAplist = (query = {}) => {
  let _params = { module: 'ap_list' }
  if (Object.keys(query).length > 0) {
    _params.data = query
  }
  return api.cmd('devSta.get', _params, { noParse: true })
}
/**
 * 获取ap列表版本信息精简版
 */
export const getAplistLite = query => {
  return api.cmd('devSta.get', { module: 'ap_list_lite', data: query }, { noParse: true })
}
/**
 * 升级ap列表
 */
export const updateVersion = version => {
  return api.wireless('updateVersion', version)
}

/**
 * 删除ap列表
 */
export const deleteDevice = data => {
  return api.cmd('devSta.set', { module: 'deleteDevice', data })
}

/**
 * 获取wifi信息
 */
export const getWireless = (data, config = {}, auth = {}) => {
  return api.cmd(
    'acConfig.get',
    {
      module: 'wireless',
      data,
      ...auth
    },
    config
  )
}
/**
 * 获取是否是公寓SSID
 */
export const getExistIndepend = params => {
  return api.cmd('devConfig.get', {
    module: 'wirelessIndepend'
  }, { isSilence: true })
}
/**
 * 获取公寓SSID的wifi信息
 */
export const getWirelessIndepend = (config = {}) => {
  return api.cmd(
    'devConfig.get',
    {
      module: 'wireless'
    },
    config
  )
}

/**
 * 设置wifi信息
 */
export const setWireless = data => {
  return api.wireless('setWifiConfig', data)
}

/**
 * 获取无线用户信息
 */
export const getStaList = query => {
  return api.cmd('devSta.get', { module: 'sta_list', data: query })
}
/**
 * 获取所有无线用户信息 - 精简版
 */
export const getStaListLite = query => {
  return api.cmd('devSta.get', { module: 'sta_list_lite' })
}
/**
 * 获取MAC黑白名单
 */
export const getMacBwList = (isSilence = false) => {
  return api.cmd(
    'acConfig.get', {
    module: 'wirelessMacFilter'
  }, { isSilence }
  )
}

/**
 * 增加MAC黑白名单
 */
export const addMacBwList = (data, isSilence = false) => {
  return api.cmd(
    'acConfig.add', {
    module: 'wirelessMacFilter',
    data
  }, { isSilence }
  )
}

/**
 * 编辑MAC黑白名单
 */
export const updateMacBwList = (data, isSilence = false) => {
  return api.cmd(
    'acConfig.update', {
    module: 'wirelessMacFilter',
    data
  }, { isSilence }
  )
}

/**
 * 删除MAC黑白名单
 */
export const delMacBwList = (data, isSilence = false) => {
  return api.cmd(
    'acConfig.del', {
    module: 'wirelessMacFilter',
    data
  }, { isSilence }
  )
}

/**
 * 设置MAC黑白名单
 */
export const setMacBwList = params => {
  return api.cmd(
    'acConfig.set', {
    module: 'wirelessMacFilter',
    data: params
  }
  )
}
/**
 * 获取radio信息
 */
export const getRadio = (auth = {}) => {
  return api.wireless('getRadioList', auth, { isSilence: true, timeout: 0 })
}
/**
 * 获取无线能力值信息
 */
export const getCapWireless = (auth = {}) => {
  return api.cmd('devCap.get', {
    module: 'wireless',
    ...auth
  }, { timeout: 0 })
}

/**
 * 设置radio信息
 */
export const setRadio = (data, auth = {}) => {
  return api.cmd('devConfig.update', {
    module: 'radio',
    data,
    ...auth
  }, { timeout: 0 })
}

/**
 * 加载信道
 * @param {string} type
 */
export const getChannel = type => {
  return api.wireless('getChannel', { type })
}

/**
 * 获取est-wifi
 */
export const getEstWifi = (auth = {}) => {
  return api.cmd('devConfig.get', {
    module: 'est_wireless',
    ...auth
  })
}

/**
 * 设置est-wifi
 */
export const setEstWifi = (data, auth = {}) => {
  return api.cmd('devConfig.set', {
    module: 'est_wireless',
    data,
    ...auth
  })
}

/**
 * 设置临时锁状态
 * @param {string} lock
 */
export const setTempLock = lock => {
  return api.cmd(
    'devSta.set',
    {
      module: 'wds_lock',
      data: { lock }
    },
    { isSilence: true }
  )
}

/**
 * 获取临时锁状态
 */
export const getTempLock = () => {
  return api.cmd(
    'devSta.get',
    {
      module: 'wds_lock'
    },
    { isSilence: true }
  )
}

/**
 * 扫描ap
 */
export const scanApList = () => {
  return api.cmd(
    'devSta.get',
    {
      module: 'scan_ap'
    },
    { isSilence: true, timeout: 0 }
  )
}

/**
 * 获取无线桥接信息
 */
export const wdsStatusInfo = (auth = {}) => {
  return api.cmd('devSta.get', {
    module: 'wds_status',
    ...auth
  }, { isSilence: true })
}

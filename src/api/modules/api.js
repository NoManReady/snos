import fetch from '@/utils/fetch'
/**
 * config接口
 */
const PREFIX = '/api'

/**
 *公共api接口
 */
export const common = (method, params, setting) => {
  return fetch(`${PREFIX}/common`, { method, params }, setting)
}

/**
 * 认证模块
 */
export const auth = (method, params, setting) => {
  return fetch(`${PREFIX}/auth`, { method, params }, setting)
}

/**
 * 统一模块
 */
export const cmd = (method, params, setting) => {
  params.device = 'pc'
  return fetch(`${PREFIX}/cmd`, { method, params }, setting)
}

/**
 * 故障诊断接口
 */
export const diagnose = (method, params, setting) => {
  return fetch(`${PREFIX}/diagnose`, { method, params }, setting)
}

/**
 * 网络接口
 */
export const network = (method, params, setting) => {
  return fetch(`${PREFIX}/network`, { method, params }, setting)
}

/**
 * 首页信息接口
 */
export const overview = (method, params, setting) => {
  return fetch(`${PREFIX}/overview`, { method, params }, setting)
}

/**
 * system接口
 */
export const system = (method, params, setting) => {
  return fetch(`${PREFIX}/system`, { method, params }, setting)
}

/**
 * Wifi接口
 */
export const wireless = (method, params, setting) => {
  return fetch(`${PREFIX}/wireless`, { method, params }, setting)
}

/**
 * 快速配置接口
 */
export const quickset = (method, params, setting) => {
  return fetch(`${PREFIX}/quickset`, { method, params }, setting)
}
/**
 * 高级功能接口
 */
export const advanced = (method, params, setting) => {
  return fetch(`${PREFIX}/advanced`, { method, params }, setting)
}

/**
 * 交换机接口
 */
export const switchApi = (method, params, setting, search = {}) => {
  let _params = []
  for (let key in search) {
    _params.push(`${key}=${search[key]}`)
  }
  if (_params.length) {
    let _hasParams = /\?/.test(params.url)
    if (_hasParams) {
      params.url += `&${_params.join('&')}`
    } else {
      params.url += `?${_params.join('&')}`
    }
  }
  return fetch(`${PREFIX}/switch`, { method, params }, setting)
}

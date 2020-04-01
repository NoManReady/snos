import * as api from './api'

// 设置快速配置状态
export const setQuickStatus = data => {
  return api.common('setQuickStatus', data)
}

// 获取快速配置状态
export const getQuickStatus = () => {
  return api.common('getQuickStatus')
}

// 获取配置
export const getQuickInfo = () => {
  return api.common('getQuickInfo')
}

// 设置配置
export const setQuickInfo = (data, isSilence = false) => {
  return api.common('setQuickInfo', data, { timeout: 0, isSilence })
}

import * as api from './api'

/**
 * 修改密码
 * @param {旧密码，新密码，过期时间} param0
 */
export const pwdmodify = ({ password, type }, setQuick = false) => {
  return api.common('pwdmodify', { password, type, setQuick })
}

/**
 * 修改session
 */
export const setSessionTime = (sessiontime) => {
  return api.common('setSessionTime', { sessiontime })
}

/**
 * 校验密码
 * @param {密码} password
 */
export const checkPassword = (password, type) => {
  return api.common('checkPassword', { password, type }, { isSilence: true })
}

/**
 * 注销
 */
export const logout = () => {
  return api.common('logout')
}

/**
 * 检测网络
 */
export const checkNet = () => {
  return api.auth('checkNet')
}

/**
 * 配置时间
 * @param {time: 时间} params
 */
export const setSysTime = (params) => {
  return api.common('setSysTime', params)
}
// 账户信息
export const advancedAccountFn = () => {
  return {
    name: '',
    password: ''
  }
}
// 策略路由对象
export const routePolicyFn = () => {
  return {
    name: '',
    sip: 'all',
    dip: 'all',
    proto: 'ip',
    intf: 'wan',
    enable: 'on'
  }
}
// 整机端口映射对象
export const natDmzFn = () => {
  return {
    rule_name: '',
    dest_ip: '',
    interface: 'wan',
    enable: '1'
  }
}

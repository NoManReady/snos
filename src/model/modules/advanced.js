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
    sipRange: '',
    dip: 'all',
    dipRange: '',
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
// PPPoE全局设置
export const pppoeGlobalFn = () => {
  return {
    "state": "1",
    "force_state": "0",
    "monitor_port": "",
    "first_dns_server": "",
    "second_dns_server": "",
    "max_sessions": "",
    "max_noreply_lcp": "",
    "idle_time": "",
    "chap": true,
    "mschap": true,
    "mschapv2": true,
    "pap": true
   }
}
// PPPoE IP地址池
export const pppoePoolFn = () => {
  return  {
    ippool_name: "",
    first_addr: "",
    end_addr: "",
    netmask: "255.255.128.0",
    ipRange: ""
  }
}
// PPPoE账号管理
export const pppoeManageFn = () => {
  return {
    "name": "",
    "passwd": "",
    "dealline": "",
    "note": "",
    "enable":"1"
  }
}
// PPPoE例外IP管理
export const pppoeExceptipFn = () => {
  return{
    "start_ip": "",
    "end_ip": "",
    "note": "",
    "state": "1"
  }
}
// PPPoE账号信息列表
export const pppoeUserinfoFn = () => {
  return{
    "state": "1",
    "name": "",
    "time": "",
    "mac": "",
    "pid": "",
    "ip": ""
  } 
}

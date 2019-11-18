export const strategyFn = () => {
  return {
    intf : '',
    ipRange: '',
    mode: 'share',
    upRate: '',
    upRateG: '',
    downRate: '',
    downRateG: '',
    enable: 'on',
    comment: ''
  }
}
export const flowappFn = () => {
  return {
    appName: undefined, // treesecelct为空时传
    upRate: '',
    upRateG: '',
    downRate: '',
    downRateG: '',
    enable: 'on',
    comment: ''
  }
}
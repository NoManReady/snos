export const wirelessFn = (radio = '1,2', fowardType = 'bridge', ssidName = '') => {
  return {
    // 是否5G优先
    bandSelectEnable: 'false',
    // 关联射频
    relatedRadio: radio || '1,2',
    // 是否启用
    enable: 'true',
    // 模式
    mode: 'ap',
    // 是否为访客wifi
    guest: 'false',
    // 加密模式
    encryptionMode: 'open',
    // 密码
    password: '',
    // 是否隐藏
    ishidden: 'false',
    // 转发模式
    fowardType: fowardType || 'bridge',
    // ssid编码
    ssidEncode: 'utf-8',
    // ssid名称
    ssidName: ssidName,
    // vlanid
    vlanId: '1',
    xpress: 'false',
    // 时间管理模式
    tmMode: 'all',
    tmValue: {
      tmngtName: '所有时段',
      slot: ''
    },
    // 三层漫游
    roam: 'false'
  }
}


export const healthyFn = () => {
  return {
    enable: 'false',
    mode: '0',
    tmngtName: '',
    slot: ''
  }
}
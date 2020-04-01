// 地址管理
export const behaviorAddrManageFn = () => {
  return {
    name: '',
    ip: [''],
    flag: 'usr',
    ip_group: '',
    ref: '0'
  }
}

// 时间对象
export const behaviorDateManageFn = () => {
  return {
    tmngtName: '',
    type: 'user',
    time: {},
    user: '0'
  }
}

// 网站分组对象
export const behaviorSiteGroupManageFn = () => {
  return {
    alias_name: '',
    entry_name: '',
    url_list: []
  }
}

// 网站访问对象
export const behaviorSiteVisiterManageFn = (defaultIpGroup = '', defaultTimeGroup = '') => {
  return {
    comment: '',
    policy: '',
    ip_group: defaultIpGroup,
    ip_slots: [''],
    tr_group: defaultTimeGroup,
    tr_slots: {},
    enable: '1',
    url_class: [],
    action: 'deny',
    time_mode: 'calendar'
  }
}

// 应用控制对象
export const behaviorApplicationControlFn = (defaultIpGroup = '', defaultTimeGroup = '') => {
  return {
    comment: '',
    policy: '',
    ip_group: defaultIpGroup,
    ip_slots: [''],
    tr_group: defaultTimeGroup,
    tr_slots: {},
    enable: '1',
    applist: [],
    time_mode: 'calendar'
  }
}

// qq黑白名单对象
export const behaviorQqbwlistFn = (defaultIpGroup = '', defaultTimeGroup = '') => {
  return {
    comment: '',
    policy: '',
    ip_group: defaultIpGroup,
    ip_slots: [''],
    tr_group: defaultTimeGroup,
    tr_slots: {},
    enable: '1',
    account: [],
    time_mode: 'calendar'
  }
}
// 访问控制对象
export const behaviorAccessCtrlFn = (defaultTimeGroup = I18N.t('phrase.alltime')) => {
  return {
    by: 'mac',
    mac: '',
    src: 'lan', // 页面没提供配置，但是要设置
    dest: 'wan',
    srcIP: '',
    destIP: '',
    srcPort: '',
    destPort: '',
    proto: 'all',
    target: 'ACCEPT',
    tmngtName: defaultTimeGroup,
    ruleName: '',
    time: {}
  }
}
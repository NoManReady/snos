// wan口model
export const wanFn = (metric = '0') => {
  return {
    proto: 'dhcp', // 默认dhcp
    ipaddr: '',
    netmask: '',
    dns: '',
    gateway: '',
    password: '',
    username: '',
    mtu: '1500',
    macaddr: '',
    vlanid: '',
    metric: metric || '0',
    special_line: '0'
  }
}

// route配置model
export const routeFn = () => {
  return {
    interface: 'wan',
    target: '',
    netmask: '',
    gateway: '',
    effective: ''
  }
}

// portMapping配置model
export const pmFn = () => {
  return {
    ruleName: '', //规则名称
    src: 'wan', //生效接口
    srcIp: '', //外部ip
    srcPort: '', //外部端口
    destIp: '', //内部服务器IP
    destPort: '', //内部端口
    proto: 'udp' //服务协议
  }
}

// lan口model
export const lanFn = () => {
  return {
    ignore: "0",
    ipaddr: "",
    ipstart: "",
    leasetime: "30",
    limit: "",
    netmask: "255.255.255.0",
    lastaddr: ""
  }
}

// ISP选路
export const wanIspFn = () => {
  return {
    func: 'set',
    enable: '1',
    wan: I18N.t('nei.other'),
    wan1: I18N.t('nei.other'),
    intf_cnt: '2',
    isp_list: [
      {
        ifname: 'wan',
        isp: I18N.t('nei.other')
      },
      {
        ifname: 'wan1',
        isp: I18N.t('nei.other')
      }
    ]
  }
}

// 负载均衡
export const wanWeightFn = () => {
  return {
    mode: 'weight',
    enable: '1',
    policy: 'session',
    intf_cnt: '2',
    wan: '1',
    wan1: '1',
    weight_list: [
      {
        ifname: 'wan',
        w: '1'
      },
      {
        ifname: 'wan1',
        w: '1'
      }
    ],
    master_list: [
      {
        ifname: 'wan',
        m: '1',
        w: '1'
      },
      {
        ifname: 'wan1',
        m: '0',
        w: '1'
      }
    ]
  }
}
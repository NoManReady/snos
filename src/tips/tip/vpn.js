// IP地址池
export const vpnPoolJson = {
  title: 'IP 地址池列表',
  desc: '您可以通过本页面设置地址池条目，进行地址池的管理。',
  items: [
    {
      title: '地址池名称',
      content: '标识地址池的名称。'
    },
    {
      title: 'IP地址范围',
      content: '地址范围格式如：1.1.1.1-1.1.1.100，结束地址必须大于起始地址，不同的地址池，配置的地址范围不能重叠。'
    }
  ]
}

// 用户管理
export const vpnUserJson = {
  title: 'VPN用户管理',
  desc: '您可以配置L2TP/PPTP服务器的用户信息。',
  items: [
    {
      title: '用户名/密码',
      content: '允许拨入的用户名称和密码。'
    },
    {
      title: '服务类型',
      content: '根据不同的VPN类型选择。'
    },
    {
      title: '本地地址',
      content: 'VPN隧道的本地虚拟IP地址。此地址可以任意设置，对端拨通后可通过此IP管理路由器。'
    },
    {
      title: '地址池',
      content: 'L2TP/PPTP服务器分配给客户端的IP地址从地址池内获取。'
    },
    {
      title: 'DNS地址',
      content: 'L2TP/PPTP服务器分配给客户端的DNS地址，如1.1.1.1。'
    },
    {
      title: '组网模式',
      frags: [
        'PC到站点：拨入的客户端是个人用户，往往由单个计算机拨入实现远端计算机与本地局域网的通信。',
        '站点到站点：拨入的客户端是一个网段的用户，往往通过一个路由器拨入，实现隧道两端局域网的通信。'
      ]
    },
    {
      title: '最大会话数',
      content: '每个用户允许接入的最大客户端数量。注意：用户类型为自动的用户，意味着L2TP和PPTP的最大接入客户端数量均为最大会话数。'
    },
    {
      title: '对端子网',
      content: 'L2TP/PPTP隧道对端局域网使用的IP地址范围（一般可以填隧道对端设备LAN口的IP地址范围），由IP和子网掩码组成。'
    }
  ]
}

// IPSec安全策略
export const vpnSecurityJson = {
  title: 'IPSec安全策略设置',
  desc: '您可以通过本页面设置IPSec安全策略，安全策略规定了对什么样的数据流采用什么样的安全提议。安全策略设置分为必要设置和高级设置两个部分，其中高级设置是可选部分。',
  items: [
    {
      title: '策略类型',
      content: '分为客户端和服务端，不通类型策略，设置选项会有差异。'
    },
    {
      title: '策略名称',
      content: '设置IPSec安全策略的名称，名称最多支持28个字符。'
    },
    {
      title: '对端网关',
      content: '设置对端网关，可以填写对端的IP地址或域名，作为响应者的时候可以将对端网关设为“0.0.0.0”,表示对端地址可以任意。'
    },
    {
      title: '绑定接口',
      content: '从下拉列表中指定本地使用的WAN口；对端网关设置的"对端网关地址"必须与该WAN口的IP地址相同。'
    },
    {
      title: '本地子网范围',
      content: '设置受保护的数据流的本地子网范围，由IP地址和子网掩码来确定。'
    },
    {
      title: '对端子网范围',
      content: '设置受保护的数据流的对端子网范围，由IP地址和子网掩码来确定。'
    },
    {
      title: '预共享密钥',
      content: '对于每对<绑定接口，对端网关>，都必须指定唯一的预共享密钥作为它们之间相互认证的凭证。'
    }
  ]
}

// IPSec连接
export const vpnUnionJson = {
  title: 'IPSec连接列表',
  desc: '您可以通过本页面查看当前建立的IPSec连接。',
  items: [
    {
      title: '名称',
      content: '显示IPSec连接的名称，一般地，该名称和安全策略名称相同。'
    },
    {
      title: 'SPI',
      content: '显示IPSec连接的SPI（Security Parameter Index，安全性参数索引），注意每一个IPSec连接的SPI都不相同。'
    },
    {
      title: '方向',
      content: '显示IPSec连接的方向（in:流入/out:流出）。'
    },
    {
      title: '隧道两端',
      content: '显示IPSec连接的两端的网关地址。'
    },
    {
      title: '数据流',
      content: '显示IPSec连接的两端的子网范围。'
    },
    {
      title: '安全协议',
      content: '显示IPSec连接使用的安全协议。'
    },
    {
      title: 'AH验证算法',
      content: '显示IPSec连接使用的AH验证算法。'
    },
    {
      title: 'ESP验证算法',
      content: '显示IPSec连接使用的ESP验证算法。'
    },
    {
      title: 'ESP加密算法',
      content: '显示IPSec连接使用的ESP加密算法。'
    }
  ]
}

// L2TP服务器
export const vpnL2tpSerJson = {
  title: 'L2TP服务器',
  items: [
    {
      title: 'L2TP链路维护时间间隔',
      content: 'VPN拨通成功后，发送L2TP链路维护检测报文的时间间隔。'
    },
    {
      title: 'PPP链路维护时间间隔',
      content: 'VPN拨通成功后，发送PPP链路维护检测报文的时间间隔。'
    },
    {
      title: '服务接口',
      content: 'L2TP服务器监听的接口，只有来自服务接口的报文才会被处理。'
    },
    {
      title: 'IPSec加密',
      content: '是否对隧道进行加密。若加密，则使用IPSec对L2TP隧道加密。若可选加密，则L2TP隧道按客户端的需求决定是否进行IPSec加密。'
    },
    {
      title: '预共享密钥',
      content: 'IPSec设置为加密或可选加密后，需设置IPSec的预共享密钥。'
    }
  ]
}

// L2TP客户端
export const vpnL2tpCliJson = {
  title: 'L2TP客户端',
  items: [
    {
      title: '隧道名称',
      content: 'L2TP隧道的名称，用于区分不同的隧道。'
    },
    {
      title: '用户名/密码',
      content: 'L2TP隧道用户身份认证的用户名密码。'
    },
    {
      title: '服务器地址',
      content: 'L2TP服务器的地址，可以为IP或域名。'
    },
    {
      title: 'IPSec加密',
      content: '是否对隧道进行加密。若启用，则使用IPSec对L2TP隧道加密。'
    },
    {
      title: '预共享密钥',
      content: 'IPSec设置为加密后，需设置IPSec加密时的预共享密钥。'
    },
    {
      title: '对端子网',
      content: 'L2TP隧道对端局域网使用的IP地址范围（一般可以填隧道对端设备LAN口的IP地址范围），由IP和子网掩码组成。'
    },
    {
      title: '工作模式',
      frags: [
        'NAT：对经过此L2TP隧道的数据包进行NAT转换（数据包的源IP替换为L2TP隧道的本地虚拟IP）。',
        '路由：对经过此L2TP隧道的数据包只进行路由转发。'
      ]
    },
    {
      title: '状态',
      content: '滑块为灰色表示禁用，滑块为蓝色表示启用。'
    },
  ]
}

// L2TP隧道
export const vpnL2tpTunnelJson = {
  title: '隧道信息列表',
  content: '您可以获得L2TP隧道的信息。',
  items: [
    {
      title: '用户名',
      content: 'L2TP隧道建立时用于认证身份使用的用户名称。'
    },
    {
      title: '服务器/客户端',
      content: '建立隧道时，本端是作为服务器还是客户端。'
    },
    {
      title: '隧道名称',
      content: 'L2TP隧道的名称，用于区分不同的隧道。'
    },
    {
      title: '虚拟本地IP',
      content: '隧道的本地虚拟IP地址。'
    },
    {
      title: '接入服务IP',
      content: '隧道的对端实际IP地址。'
    },
    {
      title: '对端虚拟IP',
      content: '隧道的对端虚拟IP地址。'
    },
    {
      title: 'DNS',
      content: '隧道的DNS地址。'
    }
  ]
}

// PPTP服务器
export const vpnPptpSerJson = {
  title: 'PPTP服务器',
  items: [
    {
      title: 'PPTP链路维护时间间隔',
      content: 'VPN拨通成功后，发送PPTP链路维护检测报文的时间间隔。'
    },
    {
      title: 'PPP链路维护时间间隔',
      content: 'VPN拨通成功后，发送PPP链路维护检测报文的时间间隔。'
    },
    {
      title: '服务接口',
      content: 'L2TP服务器监听的接口，只有来自服务接口的报文才会被处理。'
    },
    {
      title: 'MPPE加密',
      content: '是否对隧道进行加密。若启用，则使用MPPE对PPTP隧道加密。'
    }
  ]
}

// PPTP客户端
export const vpnPptpCliJson = {
  title: 'PPTP客户端',
  items: [
    {
      title: 'PPTP链路维护时间间隔',
      content: 'VPN拨通成功后，发送PPTP链路维护检测报文的时间间隔。'
    },
    {
      title: 'PPP链路维护时间间隔',
      content: 'VPN拨通成功后，发送PPP链路维护检测报文的时间间隔。'
    },
    {
      title: '隧道名称',
      content: 'PPTP隧道的名称，用于区分不同的隧道。'
    },
    {
      title: '用户名/密码',
      content: 'PPTP隧道用户身份认证的用户名密码。'
    },
    {
      title: '出接口',
      content: 'PPTP报文收发的接口。'
    },
    {
      title: '服务器地址',
      content: 'PPTP服务器的地址，可以为IP或域名。'
    },
    {
      title: 'MPPE加密',
      content: '是否对隧道进行加密。若启用，则使用MPPE对PPTP隧道加密。'
    },
    {
      title: '对端子网',
      content: 'PPTP隧道对端局域网使用的IP地址范围（一般可以填隧道对端设备LAN口的IP地址范围），由IP和子网掩码组成。'
    },
    {
      title: '上行/下行带宽',
      content: '路由器会根据上下行带宽进行流量均衡的计算。'
    },
    {
      title: '工作模式',
      frags: [
        'NAT：对经过此PPTP隧道对端局域网使用的IP地址范围（一般可以填隧道对端设备LAN口的IP地址范围），由IP和子网掩码组成。隧道的数据包进行NAT转换（数据包的源IP替换为PPTP隧道对端局域网使用的IP地址范围（一般可以填隧道对端设备LAN口的IP地址范围），由IP和子网掩码组成。隧道的本地虚拟IP）。',
        '路由：对经过此PPTP隧道对端局域网使用的IP地址范围（一般可以填隧道对端设备LAN口的IP地址范围），由IP和子网掩码组成。隧道的数据包只进行路由转发。'
      ]
    },
    {
      title: '在线检测模式',
      content: '在线检测是通过PING和DNS检测接口是否在线：',
      frags: [
        '自动：PING检测选择网关指定互联网地址作为目的地址，DNS检测选择接口的DNS服务器作为目的地址。',
        '永远在线：不对接口进行任何在线检测，接口状态一直在线',
        '手动：手动指定PING检测和DNS检测的地址，判断接口是否在线。'
      ]
    }
  ]
}

// PPTP隧道
export const vpnPptpTunnelJson = {
  title: '隧道信息列表',
  content: '您可以获得PPTP隧道的信息。',
  items: [
    {
      title: '用户名',
      content: 'PPTP隧道建立时用于认证身份使用的用户名称。'
    },
    {
      title: '服务器/客户端',
      content: '建立隧道时，本端是作为服务器还是客户端。'
    },
    {
      title: '隧道名称',
      content: 'PPTP隧道的名称，用于区分不同的隧道。'
    },
    {
      title: '虚拟本地IP',
      content: '隧道的本地虚拟IP地址。'
    },
    {
      title: '接入服务IP',
      content: '隧道的对端实际IP地址。'
    },
    {
      title: '对端虚拟IP',
      content: '隧道的对端虚拟IP地址。'
    },
    {
      title: 'DNS',
      content: '隧道的DNS地址。'
    }
  ]
}
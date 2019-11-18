// 时间设置
export const dateJson = {
  title: '时间设置',
  desc: '您可以通过本页面来查看和设置系统时间。',
  items: [{
    title: '当前时间',
    content: '设备的系统时间，如未曾设置或联网同步，则该时间为设备出厂时间。'
  },
  {
    title: '设置时间',
    content: '设置系统时间的方式，分为通过网络获取系统时间和手动设置系统时间，其中手动设置系统时间也可以通过获取管理主机时间的方式进行设置。'
  },
  {
    title: '时间',
    content: '选中<手动设置时间>，选择用户需要设置的设备时间（获取主机时间：当前登录设备的系统时间）'
  }
  ]
}

// 恢复出厂设置
export const recoverJson = {
  title: '恢复出厂设置',
  desc: '您可以通过恢复出厂配置，将设备的所有配置重置为出厂时的默认配置。',
  items: [{
    title: '恢复出厂配置',
    content: '点击<恢复出厂配置>来进行设备恢复出厂配置。'
  }]
}

// 备份与导出
export const backupJson = {
  title: '备份与导入',
  desc: '您可以通过本页面保存或恢复您的配置。',
  items: [{
    title: '备份配置信息',
    content: '您可以通过点击<导出>按钮来保存您当前的配置信息。设备将以文件的形式保存您的设置，建议您在进行软件升级前进行备份。'
  },
  {
    title: '导入配置信息',
    content: '您可以通过浏览选择配置文件后点击<导入>按钮，导入配置文件来恢复您的配置信息。'
  }
  ]
}

// 重启设备
export const reloadJson = {
  title: '系统重启',
  desc: '系统的部分配置修改需要重启设备才能生效，您可以通过本页面来重启设备。',
  items: [{
    title: '重启系统',
    content: '点击<重启系统>按钮来完成系统的重启。'
  }]
}

// 抓包诊断
export const packageJson = {
  title: '抓包诊断',
  desc: '您可以通过本页面来抓包下载诊断文件进行查看。',
  items: [{
    title: '接口',
    content: '可选择不同接口进行抓包'
  }, {
    title: '协议名',
    content: '抓取特定协议的请求包'
  },
  {
    title: '主机IP',
    content: '抓取该主机IP请求包'
  },
  {
    title: '限制文件大小',
    content: '抓取包的最大限制（单位M），当包大小达到设定值将停止抓包并生成诊断包下载链接。'
  },
  {
    title: '限制报文个数',
    content: '抓取报文最大限制，当报文数达到设定值将停止抓包并生成诊断包下载链接。'
  },
  {
    title: '运行',
    content: '按以上配置进行抓包。'
  },
  {
    title: '停止',
    content: '用户手动停止抓包并生成诊断包下载链接。'
  }
  ]
}

// WAN设置
export const wanJson = {
  title: 'WAN设置',
  desc: '您可以通过本页面设置WAN接口。',
  items: [{
    title: '联网类型',
    content: '联网类型有如下三种：',
    frags: [
      'PPPoE：使用运营商提供的宽带帐号和密码进行上网的方式。',
      '动态IP：使用运营商动态分配的临时IP地址进行上网的方式。',
      '静态IP：使用运营商提供的固定IP进行上网的方式。'
    ]
  },
  {
    title: 'IP地址、子网掩码、网关、DNS服务器',
    content: '运营商分配的上网参数或用户设置的上网参数。联网类型为静态IP时配置'
  },
  {
    title: '宽带账号/宽带密码',
    content: '运营商提供的宽带账号和密码。联网类型为PPPoE时配置。'
  },
  {
    title: 'MTU',
    content: '数据包的最大传输单元，动静态IP可设置范围为576 ~ 1500，PPPoE可设置的最大范围是576~1492。'
  },
  {
    title: 'MAC地址',
    content: '设置设备对广域网的MAC地址，一般情况下不需要更改此地址。某些地区的运营商会将线路与MAC地址进行绑定，同时提供一个“有效的MAC地址”，此时只有将WAN口的MAC地址设置为该“有效的MAC地址”才可以正常共享上网。'
  },
  {
    title: '多线路选择',
    content: '支持多线路的设备才有此配置项。选择“多线路”后，页面会出现多个WAN口的配置。还可以配置运营商和负载均衡，详见页面说明。'
  }
  ]
}

// WAN(Msw)设置
export const wanMswJson = {
  title: '管理IP设置',
  desc: '您可以通过本页面设置管理IP。',
  items: [{
    title: '联网类型',
    content: '联网类型有如下三种：',
    frags: [
      '动态IP：使用运营商动态分配的临时IP地址进行上网的方式。',
      '静态IP：使用运营商提供的固定IP进行上网的方式。'
    ]
  },
  {
    title: 'IP地址、子网掩码、网关、DNS服务器',
    content: '运营商分配的上网参数或用户设置的上网参数。联网类型为静态IP时配置'
  },
  ]
}

// LAN设置
export const vlanJson = {
  title: 'LAN设置',
  desc: '您可以通过本页面设置LAN接口。',
  items: [{
    title: 'IP地址',
    content: '通过此局域网上网的设备的默认网关应设置为该IP地址。'
  },
  {
    title: '子网掩码',
    content: '局域网中中的设备的子网掩码应与此处设置相同。'
  },
  {
    title: 'VLAN ID',
    content: '局域网可以划分多个VLAN，VLAN与上联配置有关联，请注意配置。'
  },
  {
    title: 'DHCP服务',
    content: '开启后局域网内的设备才能自动获取到IP。'
  },
  {
    title: '开始地址',
    content: 'DHCP服务器自动分配的IP的开始地址。开始地址的范围是在由IP地址和子网掩码计算出的网段内。'
  },
  {
    title: '分配IP数',
    content: '可分配的IP数范围由局域网网段大小和开始地址决定。'
  },
  {
    title: '地址租期',
    content: '自动分配的IP的有效时间，超过该时间后局域网内的设备将重新获取IP。'
  }
  ]
}
// 端口VLAN
export const vlanPortJson = {
  title: '端口VLAN',
  items: [
    {
      title: 'UNTAG',
      content: '假设【VLAN 10】在【端口2】这列中设置为【UNTAG】，相当于VLAN 10是端口2的Native Vlan。那么从端口2发送的报文将不携带VLAN 10标识，并且没有携带VLAN ID的报文通过端口2都会当做VLAN 10的报文。',
      frags: [
        '每个端口只有一个VLAN可以设置为UNTAG。',
        '端口1 的Native Vlan固定是默认VLAN，所以端口1不能把其他VLAN设置为UNTAG。'
      ]
    },
    {
      title: 'TAG',
      content: '假设【VLAN 10和VLAN 20】在【端口2】这列中都设置了【TAG】，相当于端口2是TRUNK口，从端口 2 转发VLAN 10和VLAN 20的报文都会携带上对应VLAN的TAG。'
    },
    {
      title: '不加入',
      content: '假设【VLAN 10和VLAN 20】在【端口2】这列中都设置为【不加入】，相当于端口2是不收发VLAN 10和VLAN 20的报文。'
    }
  ]
}

// ARP列表
export const arpJson = {
  title: 'ARP列表',
  desc: '设备学习连接在设备各接口上的网络设备IP与MAC对应表。',
  items: [{
    title: 'IP地址',
    content: '连接在设备各接口上的网络设备IP'
  }, {
    title: 'MAC地址',
    content: '连接在设备各接口上的网络设备MAC'
  },
  {
    title: '状态',
    content: '显示这条ARP表项的MAC绑定和MAC过滤状态，也可以修改绑定和过滤状态。',
    frags: [
      'MAC绑定：点击添加到“MAC绑定列表”中。',
      'MAC过滤：点击添加到“MAC过滤规则”中。',
      '已绑定：已经添加到“MAC绑定列表”中。',
      '已过滤：已经添加到“MAC绑定列表”中。'
    ]
  },
  {
    title: '批量绑定',
    content: '可以选择多条ARP列表项，一次性添加到“MAC绑定列表”中。您可以在“MAC绑定”页面进行批量解绑操作。'
  },
  {
    title: '批量过滤',
    content: '可以选择多条ARP列表项，一次性添加到“MAC过滤规则列表”中。您可以在“MAC过滤”页面进行批量删除操作。'
  }
  ]
}
// ARP列表（去掉MAC过滤的说明）
export const arpJsonLite = {
  title: 'ARP列表',
  desc: '设备学习连接在设备各接口上的网络设备IP与MAC对应表。',
  items: [{
    title: 'IP地址',
    content: '连接在设备各接口上的网络设备IP'
  }, {
    title: 'MAC地址',
    content: '连接在设备各接口上的网络设备MAC'
  },
  {
    title: '状态',
    content: '显示这条ARP表项的MAC绑定状态，也可以修改绑定状态。',
    frags: [
      'MAC绑定：点击添加到“MAC绑定列表”中。',
      '已绑定：已经添加到“MAC绑定列表”中。',
    ]
  },
  {
    title: '批量绑定',
    content: '可以选择多条ARP列表项，一次性添加到“MAC绑定列表”中。您可以在“MAC绑定”页面进行批量解绑操作。'
  }
  ]
}

// MAC绑定
export const arpbindJson = {
  title: 'IP-MAC绑定',
  items: [{
    title: 'MAC地址',
    content: '您可以输入待绑定的MAC地址，格式为00:11:22:33:44:55:66 。'
  },
  {
    title: 'IP地址',
    content: '您可以输入待绑定的IP地址。'
  },
  {
    title: '解绑MAC',
    content: '可以将该IP-MAC绑定条目解绑，从“IP-MAC绑定列表”删除。'
  },
  {
    title: '批量解绑MAC',
    content: '选择多条IP-MAC绑定列表中的条目，点击<批量解绑ARP>按钮，可将多个条目一次性从“IP-MAC绑定列表”中删除。'
  }
  ]
}

// 客户端列表
export const dhcpClientJson = {
  title: '客户端列表',
  desc: '本页显示当前DHCP服务器动态分配的IP,您可以将指定MAC添加到静态地址,为该MAC预留IP地址。',
  items: [{
    title: '主机名',
    content: '由DHCP服务器分配IP的客户端主机名。'
  },
  {
    title: 'MAC地址',
    content: '分配到IP地址的客户端主机的MAC地址。'
  },
  {
    title: 'IP地址',
    content: 'DHCP服务器分配给客户端主机的IP地址。'
  },
  {
    title: '剩余地址租期',
    content: 'DHCP服务器所分配IP地址的剩余有效使用时间，超时将重新分配。'
  },
  {
    title: '刷新',
    content: '点击刷新将刷新显示目前已分配的DHCP客户端。'
  },
  {
    title: '添加到静态地址',
    content: '点击“添加”按钮，路由自动将目前已经学习到的IP与MAC条目添加到静态地址分配列表中。'
  }
  ]
}

// 静态地址分配
export const staticJson = {
  title: '静态地址分配',
  desc: '您可以在本页面为指定的MAC地址预留IP地址。当该主机向DHCP服务器请求分配IP时，服务器将为其分配预留的IP地址。',
  items: [{
    title: 'IP地址',
    content: '为指定主机预留的IP地址。'
  },
  {
    title: 'MAC地址',
    content: '预留IP地址的主机MAC地址。'
  }
  ]
}
// 本地升级
export const localUpdateJson = {
  title: '系统升级',
  desc: '您可以通过本页面来进行软件升级。建议您进行软件升级前，先备份您的配置信息。',
  items: [{
    title: '当前版本',
    content: '设备当前的软件版本号和硬件版本号。'
  },
  {
    title: '保留配置',
    content: '保留现版本的所有用户配置信息<如果版本差异太大，建议不保留配置升级>。'
  },
  {
    title: '安装包路径',
    content: '所要升级的版本包，后缀名以.gz结尾。'
  }
  ]
}

// 设备密码
export const passwordJson = {
  title: '设备密码',
  desc: '修改设备密码。',
  items: [{
    title: '原设备密码',
    content: '修改前的设备密码。'
  },
  {
    title: '新设备密码/确认新密码',
    content: '将要设置的新设备密码（密码长度至少6位）。'
  }
  ]
}

// WEB会话超时时间
export const sessionJson = {
  title: 'WEB会话超时时间',
  desc: '修改WEB会话session超时时间。',
  items: [{
    title: '登录超时时间',
    content: '登录账号session的过期时间（单位为秒）。'
  }
  ]
}

// 端口映射
export const natJson = {
  title: '端口映射',
  desc: '您可以查看规则条目，还可以通过表格按钮对条目进行操作。',
  items: [{
    title: '规则名称',
    content: '您可以设置服务条目名称。'
  },
  {
    title: '服务协议',
    content: '触发条目生效的协议类型。选择ALL表示所有协议均生效。'
  },
  {
    title: '外部服务器IP',
    content: '外部服务的主机地址。同一外部服务器IP不能配置相同的外部端口号。'
  },
  {
    title: '外部端口',
    content: '设备提供给广域网的服务端口号。同一端口号不能配置相同的外部服务器IP。'
  },
  {
    title: '内部服务器IP',
    content: '局域网中建立服务的主机地址。'
  },
  {
    title: '内部端口',
    content: '局域网主机的服务端口。'
  }
  ]
}

// 网络体检
export const networkCheckJson = {
  title: '网络体检',
  desc: '当您的设备出现网络问题时，请执行“网络体检”功能，并根据检测结果配置您的设备。',
  items: [{
    title: '开始检测',
    content: '点击开始检测按钮并确定，开始进行检测。'
  },
  {
    title: '网口配置',
    content: '检测网口是否插网线，是否有配置ip地址或者是否获取到IP地址。'
  },
  {
    title: '路由配置',
    content: '检测路由配置是否正常，配置的路由是否能与外网相通。'
  },
  {
    title: '下一跳连通性',
    content: '检测默认路由下一跳链路是否是相通。'
  },
  {
    title: 'DNS配置',
    content: '检测是否有配置DNS服务器或者DNS服务器链路是否相通。'
  },
  {
    title: '云服务配置',
    content: '检测设备是否连接上MACC服务器。'
  },
  {
    title: '网络运行状态',
    content: '检测设备的IP连接数以及DHCP服务器可分配地址容量检测。'
  }
    // {
    //   title: 'IP会话数',
    //   content: '检测IP连接会话数是否超过总数的80%。'
    // }
  ]
}

// 网络工具
export const networkTool = {
  title: '网络工具',
  desc: '您可以通过本页的网络工具来检测和诊断当前的网络状况。',
  items: [{
    title: 'PING通信检测',
    content: '用于检测到达网络中的某节点是否连通。'
  },
  {
    title: '路由跟踪检测',
    content: '用于检测到达联络中的某节点经过节点的个数以及节点地址。'
  },
  {
    title: '域名查询检测',
    content: '用于查询网络域名信息或诊断DNS服务器问题。'
  }
  ]
}

export const smartJson = {
  title: '智能流控',
  desc: '根据用户数智能的调整每个用户的带宽，保证每个用户公平共享带宽。',
  items: [{
    title: '开启流控',
    content: '开启智能流控并保存配置后，才可以进行“自定义策略”等设置。'
  },
  {
    title: '线路带宽',
    content: '为了保证流控效果，请根据运营商实际分配的带宽进行设置。',
    frags: ['上行：上传速度', '下行：下载速度']
  }
  ]
}

// 自定义策略策略
export const strategyJson = {
  title: '自定义策略',
  desc: '为IP地址组分配带宽，保证上网速度，合理利用带宽资源。',
  items: [{
    title: '策略名称',
    content: '您可以给配置的策略取一个名字，方便记忆和管理策略。'
  },
  {
    title: 'IP地址范围',
    content: '自定义策略对这个范围内的IP生效。'
  },
  {
    title: '带宽模式',
    content: '共享表示地址组内IP共用设定的上下行带宽；独立表示地址组内所有IP均独占设定的上下行带宽。'
  },
  {
    title: '上行带宽',
    frags: [
      '保证：带宽紧张时保障的带宽。',
      '最大：带宽宽松时允许占用的最大带宽。'
    ]
  },
  {
    title: '下行带宽',
    frags: [
      '保证：带宽紧张时保障的带宽。',
      '最大：带宽宽松时允许占用的最大带宽。'
    ]
  },
  {
    title: '应用接口',
    content: '表示这条策略在哪个WAN口上生效。',
    frags: [
      '所有WAN口：每个WAN口分别应用此策略。'
    ]
  },
  {
    title: '状态',
    content: '表示这条策略规则是否启用。如果设置为“关闭”，此条策略将不生效。'
  },
  {
    title: '生效状态',
    content: '表示这条策略规则在当前系统中是否已经生效。如果显示为“未生效”，请检查IP范围是否在已有LAN的网段中。'

  },
  {
    title: '匹配顺序',
    content: '匹配顺序从上至下，新增的策略排在最前面优先匹配。可以上下调整策略的匹配顺序。'
  }
  ]
}

// 应用流控
export const flowAppJson = {
  title: '应用流控',
  desc: '为IP地址组分配带宽，保证上网速度，合理利用带宽资源。',
  items: [{
    title: '流控名称',
    content: '您可以给配置的流控取一个名字，方便记忆和管理策略。'
  },
  {
    title: '应用名称',
    content: '选择要流控的的应用，一条规则只能选择一类应用。'
  },
  {
    title: '上行带宽',
    frags: [
      '保证：带宽紧张时保障的带宽。',
      '最大：带宽宽松时允许占用的最大带宽。'
    ]
  },
  {
    title: '下行带宽',
    frags: [
      '保证：带宽紧张时保障的带宽。',
      '最大：带宽宽松时允许占用的最大带宽。'
    ]
  },
  {
    title: '状态',
    content: '表示这条策略规则是否启用。如果设置为“关闭”，此条策略将不生效。'
  },
  {
    title: '匹配顺序',
    content: '匹配顺序从上至下，新增的策略排在最前面优先匹配。可以上下调整策略的匹配顺序。'
  }
  ]
}

// 设备列表
export const deviceListJson = {
  title: '设备列表',
  desc: '查看当前网络下的所有设备信息。',
  items: [{
    title: '设备名称',
    content: '设备名称可以修改成易于标识的名字。比如：设备所在位置或者设备特征等。'
  },
  {
    title: 'IP地址',
    content: '点击IP地址可以跳转到设备的管理页面。'
  },
  {
    title: '在线状态',
    content: '',
    frags: [
      '在线：设备已连通本地网络。',
      '离线：设备没有上电，或者WAN设置错误。',
      '从未上线：手动添加的设备，还未在该网络上线。'
    ]
  },
  {
    title: '高级搜索',
    content: '根据设备序列号、型号、版本、MAC、在线状态来搜索所有网络设备，并显示在列表中。'
  },
  {
    title: '列表筛选',
    content: '列表表项较多时，您可筛选您关注的表项在列表中显示。'
  }
  ]
}
// 整网管理
export const managerJson = {
  title: '整网管理',
  desc: '本页面可以帮您对整个网络中的设备进行重启、恢复出厂或回复配置操作。',
  items: [{
    title: '操作',
    content: '选择对整网设备要进行的操作类型',
    frags: [
      '重启: 整网或指定设备重启。',
      '恢复出厂：整网设备恢复出厂设置状态。还可以通过选项设置是否解除设备绑定信息。'
    ]
  },
  {
    title: '选择',
    content: '选择操作的对象，可指定设备或选择整网设备。',
    frags: [
      '指定设备：需从“可操作设备”列表中选择要操作的设备，点击"添加>"到右侧“已选设备”列表。',
      '整网设备：对整网所有设备操作，无需再选择设备。'
    ]
  },
  {
    title: '选项',
    content: '选择是否解除设备用户账号绑定'
  }
    // {
    //   title: '恢复出厂后',
    //   content: '只有选择恢复出厂操作才有此选项。',
    //   frags: [
    //     '不重启：设备恢复出厂后不会马上重启生效。此场景适用于您指定设备恢复出厂后手动下电，实现从当前网络移出空配置的设备。',
    //     '马上重启：设备出厂后马上重启。注意！恢复出厂后的设备重启后会自动重新加入当前网络。'
    //   ]
    // }
  ]
}
// 整网管理
export const neighborJson = {
  title: '网络列表',
  desc: '易网络设备具备自组网（即插即用）功能',
  items: [{
    title: '网络说明',
    frags: [
      '在二层网络下，所有易网络设备能够自动发现，并且组成一个逻辑网络，用户可以对整个逻辑网络的所有设备进行统一配置，不用一台台配置。',
      '当网络中添加未配置过的新设备，新设备会自动加入该网络中，并与网络的其他设备配置一致。',
      '当网络中添加已配置过的设备,该设备的配置与现有网络设备的配置不一致：',
      '1) 正常状态下，该设备也会自动加入该网络中，该设备的配置将自动被修改为网络中其他设备的配置，最终与网络的其他设备配置一致。',
      '2) 在某些特殊情况下，该设备无法自动加入当前网络，该设备的配置保持不变，这种状态下会存在配置不同的多个逻辑网络',
      '当二层网络下存在多个逻辑网络时：',
      '1）新设备加入到该二层网络下，新设备无法自动加入到任何一个逻辑网络中，新设备保持未配置状态。',
      '2）用户可以指定将某些设备添加到“我的网络”，这些设备配置将被修改成“我的网络”的对应配置。'
    ]
  },
  {
    title: '我的网络',
    content: '显示设备当前所在网络信息以及我的网络里的设备列表。'
  },
  {
    title: '展开/收起',
    content: '点击展开/收起归属该网络的设备列表信息'
  },
  {
    title: '添加到我的网络',
    frags: [
      '允许把其他网络的设备添加到我的网络。',
      '设备被添加后，配置将被修改成我的网络对应的配置。',
      '我的网络配置修改时，这些设备的配置也会被同步修改。'
    ]
  },
  {
    title: '新设备列表',
    content: '是指未配置的但无法自动加入到“我的网络”的设备，一般在存在多个网络的时候才会出现，此时需要您手动把新设备添加到我的网络。',
    frags: [
      '正常情况下，在二层网络里，新设备能够自动组网形成一个网络。',
      '已配置过的设备一般也会自动加入到我的网络，并最终与我的网络配置保持一致。',
      '在某些特殊情况下，已配置的设备无法自动加入我的网络，此时会导致网络中存在多个配置不同的网络。',
      '当存在多个网络时，新设备可能无法自动加入我的网络。此时设备就会显示在“其他网络”列表中，您可以把它手动添加到我的网络。'
    ]
  },
  {
    title: '其他网络',
    content: '当环境中存在多个网络时，这里会显示其他网络的信息及设备。其他网络的设备可以被添加到我的网络。'
  }
  ]
}

// wdsWifi配置
export const wdsWifiJson = {
  title: '无线桥接',
  desc: '配置无线桥接参数',
  items: [
    {
      title: '信道',
      content: '设备支持自动信道和指定信道，配置自动信道时，设备会扫描周围信号情况，并自动选择最优信道。'
    },
    {
      title: '频宽',
      content: '设置用于桥接的Wi-Fi信号频宽。在桥接信号范围内，如果Wi-Fi信号干扰较少，设置较大的频宽可以获得更高的传输速率；如果Wi-Fi信号干扰较大，设置较小的频宽可以获得更好的传输稳定性。'
    },
    {
      title: '功率',
      content: '设备支持自动功率和指定功率，配置自动功率时，设备可根据部署环境及干扰情况，随时进行功率调整，以保证最佳信噪比和传输效果。'
    },
    {
      title: '距离',
      content: '根据AP与CPE之间的实际距离设置，采用进一法计算，如实际距离1.3KM，请选择2KM。'
    }
  ]
}
// wdsWifi配置
export const dhcpOptionJson = {
  title: 'DCHP选项',
  desc: '配置无线桥接参数',
  items: [
    {
      title: 'DNS服务器',
      content: '可选填，如果运营商有提供DNS服务器地址，请在此填写。'
    },
    {
      title: 'Option43',
      content: '可选填，最大长度128（中文占3个字符），可输入如下三种格式：',
      frags: [
        'IP地址，多个用空格分割。',
        '16进制格式，用冒号分割，比如：01:C0:A8:01:01。',
        '任意字符串'
      ]
    },
    {
      title: 'Option138',
      content: '可选填，请填入AC（无线控制器）IP地址。'
    }
  ]
}

// 静态路由
export const routeStaticJson = {
  title: '静态路由列表',
  desc: '当数据包与静态路由匹配成功时，将按照指定的转发方式进行转发。',
  items: [
    {
      title: '目的地址/子网掩码',
      content: '数据要到达的目的网络和目的网络的子网掩码。'
    },
    {
      title: '出接口',
      content: '数据包进行转发的接口。'
    },
    {
      title: '下一跳',
      content: '数据包将发往的下一个路由点。如果出接口是PPPoE拨号上网，就无下一跳配置。'
    },
    {
      title: '是否可达',
      content: '检测下一跳是否可达，以此判断路由是否能够正常生效。'
    }
  ]
}
// 策略路由
export const routePolicyJson = {
  title: '策略路由列表',
  desc: '策略路由是一种比基于目标网络进行路由更加灵活的数据包路由转发机制。',
  items: [{
    title: '规则名称',
    content: '为添加的规则命名，字符数限制在28个字符以内，且任意两条规则不能重名。'
  },
  {
    title: '协议类型',
    content: '选择策略路由生效的特定协议，可根据需要自定义协议类型。'
  },
  {
    title: '协议号',
    content: '协议类型为“自定义”时可配置。'
  },
  {
    title: '源端口范围',
    content: '协议类型为“TCP”或“UDP”才有此配置项，配置策略路由匹配的报文源端口范围。'
  },
  {
    title: '目的端口范围',
    content: '协议类型为“TCP”或“UDP”才有此配置项，配置策略路由匹配的报文目的端口范围。'
  },
  {
    title: '源IP地址/范围',
    content: '配置策略路由条目匹配的源IP地址/范围，默认为所有IP地址。'
  },
  {
    title: '目的IP地址/范围',
    content: '配置策略路由条目匹配的目的IP地址/范围，默认为所有IP地址。'
  },
  {
    title: '出接口',
    content: '选择策略路由条目数据包转发的接口。'
  },
  {
    title: '状态',
    content: '表示这条策略路由是否启用。如果设置为“关闭”，此条策略将不生效。'
  },
  {
    title: '匹配顺序',
    content: '匹配顺序从上至下，新增的策略排在最前面优先匹配。可以上下调整策略的匹配顺序。'
  }
  ]
}
// MAC地址过滤
export const macFilterJson = {
  title: 'MAC地址过滤',
  desc: '您可以进行MAC地址过滤功能设置。',
  items: [{
    title: 'MAC过滤开关',
    content: '开启过滤开关后，以下的规则列表才会生效。'
  },
  {
    title: '过滤类型',
    content: '设置过滤类型，有如下两种：',
    frags: [
      '白名单（允许设备访问外网）：将只允许MAC地址在过滤规则列表中的主机通过。',
      '黑名单（不允许设备访问外网）：将禁止MAC地址在过滤规则列表中的主机通过。',
    ]
  },
  {
    title: 'MAC地址',
    content: '根据“过滤类型”禁止或通过在列表中的此MAC地址的主机。'
  },
  {
    title: '备注',
    content: '为添加的MAC地址备注信息，备注不能超过32个字符(单个中文占3个字符)。'
  }
  ]
}
// DNS代理
export const dnsProxyJson = {
  title: 'DNS服务器代理',
  desc: '您可以进行DNS代理功能设置。',
  items: [{
    title: 'DNS代理开关',
    content: '开启开关后，需要配置DNS服务器。'
  }, {
    title: 'DNS服务器',
    content: '请填写正确的DNS服务器，若DNS服务器填写错误，会导致设备域名解析失败。'
  }
  ]
}
// 连接数限制
export const ipConnJson = {
  title: 'IP连接数限制',
  desc: '您可以进行IP连接数限制设置。',
  items: [{
    title: '规则名称',
    content: '为添加的规则命名，字符数限制在28个字符以内，且任意两条规则不能重名。'
  }, {
    title: 'IP地址范围',
    content: '设置要限制的的IP地址范围。'
  }, {
    title: '最大连接数',
    content: '设置受限IP的最大连接数。'
  }, {
    title: '状态',
    content: '开启后配置才会生效'
  }
  ]
}
// 整机映射
export const natdmzJson = {
  title: 'NAT-DMZ规则类表',
  desc: '您可以整机映射规则设置。',
  items: [{
    title: '规则名称',
    content: '为添加的规则命名，字符数限制在28个字符以内，且任意两条规则不能重名。'
  }, {
    title: '出接口',
    content: '您可以选择规则生效的出接口。一个出接口只能配置一条整机映射规则。'
  }, {
    title: '主机地址',
    content: 'NAT DMZ服务指向的主机地址。'
  }, {
    title: '状态',
    content: '开启后配置才会生效'
  }
  ]
}
// 在线用户
export const userOnlineJson = {
  title: '在线用户',
  desc: '用户离线状态需要三分钟的延迟时间，即用户离线后可能还会在此列表中显示三分钟。',
  items: [{
    title: '接入类型',
    content: '客户端主机是无线接入，还是有线接入，可能存在未知情况。'
  }, {
    title: '无线信息',
    content: '接入类型是无线的用户才有此无线信息。无线信息包含信道、信号强度、在线时间、协商速率。'
  }, {
    title: '访问控制',
    content: '控制此主机/终端的上网行为，联网时段等。'
  }
  ]
}

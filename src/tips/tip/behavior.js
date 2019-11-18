// 时间管理
export const behaviorDateManageJson = {
  title: '时间列表',
  desc: '您可以通过本页面设置时间，进行时间的管理。',
  items: [{
    title: '时间名称',
    content: '标志时间的名称。'
  },
  {
    title: '时间设置（日历）',
    content: '用于设置时间所包含的时间段，有两种设置方式。',
    frags: [
      '日历：通过在日历上划分矩形覆盖对应的时间区域来设置包含的时间段，只能精确到小时。',
      '手动设置：通过手动输入生效时间段并勾选生效星期来设置一个时间段，精确到分钟，但一个对象最多只能设置12个时间段。'
    ]
  }
  ]
}

// 地址管理
export const behaviorAddrManageJson = {
  title: '地址组列表',
  desc: '您可以通过本页面进行地址管理。',
  items: [{
    title: '组名称',
    content: '自定义地址组的名称。'
  },
  {
    title: 'IP地址段',
    content: '设置一个起始地址和一个结束地址，引用包含该地址对象地址组的规则在该地址段内均会生效。点击右边的加号可以添加多个地址段。'
  }
  ]
}

// 应用控制
export const behaviorAppControlJson = {
  title: '应用控制规则列表',
  desc: '您可以通过本页面添加应用控制条目。',
  items: [{
    title: '受管理IP地址组',
    content: '设置欲管控IP地址组。'
  },
  {
    title: '受管理时间段',
    content: '设置管控时间段，在受控时间内，IP地址组内的客户端无法访问禁用列表中勾选的应用'
  },
  {
    title: '禁用列表',
    content: '设置需要禁止的应用。'
  },
  {
    title: '备注',
    content: '设置备注信息，方便查看（64字符以内）。'
  },
  {
    title: '状态',
    content: '是否启用控制规则'
  }
  ]
}

// QQ黑白名单
export const behaviorQqbwListJson = {
  title: '规则列表',
  desc: '您可以通过本页面设置QQ黑白名单或则关闭黑白名单。',
  items: [{
    title: '受管理IP地址组',
    content: '设置欲管控IP地址组。'
  },
  {
    title: '受管理时间段',
    content: '设置管控时间段。'
  },
  {
    title: 'QQ号码',
    content: '设置相应的QQ信息。'
  },
  {
    title: '备注',
    content: '设置备注信息，方便查看（64字符以内）。'
  },
  {
    title: '状态',
    content: '是否启用控制规则'
  }
  ]
}

// 网站分组
export const behaviorSiteGroupJson = {
  title: '网站分组',
  desc: '您可以查看网站分组条目，还可以通过表格按钮对条目进行操作。',
  items: [{
    title: '组名称',
    content: '为网站分组添加名称，字符限制在64个字符以内，且两个分组不能重名。'
  },
  {
    title: '组成员',
    content: '网站分组成员，您可以同时输入多个网站进行批量添加。组成员可以为域名，如www.baidu.com,也可以在域名前面加通配符“*”，如*.baidu.com。但是”*“只允许输入在最前面，而不能夹杂在域名中间或后面。'
  }
  ]
}

// 网站分组访问
export const behaviorSiteVisiterJson = {
  title: '规则列表',
  desc: '您可以查看网站访问条目，还可以通过表格按钮对条目进行操作。',
  items: [{
    title: '受管理IP地址组',
    content: '设置欲管控IP地址组。'
  },
  {
    title: '受管理时间段',
    content: '设置管控时间段。'
  },
  {
    title: '规则类型（只开放禁止）',
    content: '对符合规则的网站放行或禁止。'
  },
  {
    title: '禁用网站类型',
    content: '选择网站分组对象（规则生效的网站）'
  },
  {
    title: '备注',
    content: '您可以为该规则添加备注（64字符以内）。'
  }
  ]
}

// 访问控制
export const accessCtrlJson = {
  title: '访问控制列表',
  desc: '对经过设备的数据包进行规则匹配，并设置在某一时间范围内，放行或丢弃数据包。',
  items: [
  {
    title: '匹配规则',
    content: '根据MAC地址或者IP地址进行报文匹配设置。',
    frags: [
      '【MAC】匹配数据包的源MAC地址。常用于在线用户或等特定终端进行访问控制的设置。',
      '【源IP】匹配数据包的源地址和端口，为空表示所有地址/所有端口。',
      '【目的】匹配数据包的目的地址和端口，为空表示所有地址/所有端口。',
      '【协议】匹配数据包的协议类型。'
    ]
  },
  {
    title: '规则类型',
    content: '指明这条规则对符合条件的数据包放行还是丢弃。',
    frags: [
      '允许：放行符合条件的数据包。',
      '阻塞：丢弃符合条件的数据包。'
    ]
  },
  {
    title: '生效时间',
    content: '选择规则生效的时间段，也可以设置为自定义并选择自定义时间。'
  },
  {
    title: '生效接口域',
    content: '选择该规则对应生效的接口。基于MAC地址的匹配规则，默认是对外网口生效。'
  },
  {
    title: '生效状态',
    content: '显示规则的生效状态，根据系统时间和生效时间关系确定。',
    frags: [
      '生效中：系统的当前时间处在规则的生效时段中。',
      '生效中：系统的当前时间不在规则的生效时段时。'
    ]
  },
  {
    title: '备注',
    content: '为规则标识用途，字符数限制在28个字符以内。'
  },
  {
    title: '匹配顺序',
    content: '排在前面的规则先匹配，若匹配成功后，后续规则将不再执行。可以在列表中对规则执行上移/下移操作。'
  }
  ]
}

// 上网时间控制
export const timeLimitJson = {
  title: '上网时间控制',
  desc: '您可以查看访问控制条目，还可以通过表格按钮对条目进行操作。',
  items: [{
    title: 'MAC地址',
    content: '受控制的终端MAC地址。'
  },
  {
    title: '用户名称',
    content: '根据MAC地址，查找在线用户列表中相匹配的MAC地址的用户名称。'
  },
  {
    title: '禁止时段',
    content: '禁止终端用户上网的时段。'
  },
  {
    title: '状态',
    content: '标识当前规则是否在禁止上网的时段中。'
  }
  ]
}
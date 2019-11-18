// 认证设置
// 微信/短信认证
export const authTabJson = {
  title: '微信/短信/一键认证',
  items: [
    {
      title: '服务器类型',
      content: '诺客MACC平台做相应配置后认证才生效。',
      frags: [
        '微信连wifi：连上wifi->去关注某个公众号后->点击上网。',
        '短信认证：连上wifi->portal弹出来点击点此免费上网->输入手机号获取短信验证码->输入验证码->上网。',
        '一键登入：连上wifi->potal出来点下确认->上网。'
      ]
    },
    {
      title: '用户逃生功能',
      content: '认证服务器异常的时候可以跳过认证正常上网。'
    }
  ]
}
// 账号认证
export const accountJson = {
  title: '账号认证',
  items: [
    {
      title: '账号数',
      content: '当前已配置的认证账号数量'
    },
    {
      title: '认证IP/范围',
      content: '此IP网段的终端需要认证通过才能上网'
    },
    {
      title: '账号管理',
      content: '多个设备端可使用同一个账号密码认证上网',
      frags: [
        'mac地址：每个账号最多记录最新使用的 5 个设备的mac地址。这些设备离线后再次接入此认证网络可直接上网，不需要重新认证。'
      ]

    }
  ]
}
// 授权访客上网
export const guestAuthJson = {
  title: '授权访客上网',
  items: [
    {
      title: '扫码信息提示',
      content: '此文字会在弹出的二维码页面上显示'
    },
    {
      title: '认证IP/范围',
      content: '此IP网段的终端需要认证通过才能上网'
    },
    {
      title: '允许上网时长',
      content: '用户授权上线后超过对应的时间会自动下线，需要重新授权'
    },
    {
      title: '授权IP/范围',
      content: '此IP网段的终端拥有授权的功能'
    }
  ]
}
// 访客扫码上网
export const guestScanJson = {
  title: '访客扫码上网',
  items: [
    {
      title: '认证IP/范围',
      content: '此IP网段的终端需要认证通过才能上网'
    },
    {
      title: '允许上网时长',
      content: '用户授权上线后超过对应的时间会自动下线，需要重新扫码二维码'
    },
    {
      title: '二维码动态码',
      content: '修改此项配置后，之前的二维码图会失效'
    },
    {
      title: '二维码信息',
      content: '此文字会在用户弹出的认证页面显示'
    }
  ]
}
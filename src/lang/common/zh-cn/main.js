export default {
  main_header: {
    logout: '退出',
    macc_dev: '诺客云端运维',
    app_download: "下载APP",
    network_cfg: '全网配置',
    quick_cfg: '快速配置',
    network_check: '网络体检',
    warn_view: '查看告警详情',
    warn: '告警',
    def_pass_login: '默认密码免登录',
    logout_safe: '安全退出到登录页',
    def_pass: '默认密码',
    shink:  '收起',
    web_manage:  'EWEB管理系统'
  },
  admin: {
    master_source_err_tip: '您当前登录的是从设备，由于主设备异常，无法查看整网信息，将为您展示从设备（本机）的信息。',
    master_source_err: '检测到主设备文件资源加载异常',
    master_ping_err_tip: '您当前登录的是从设备，由于主设备无法连通，无法查看整网信息，将为您展示从设备（本机）的信息。',
    master_ping_err: '检测到主设备无法连通',
    view_slave_only: '只看从设备',
    master_old_err_tip: '您当前登录的是从设备，由于主设备的版本较旧，无法查看整网信息，将为您展示从设备（本机）的信息。',
    master_old_err: '检测到主设备版本较旧',
    upgrade_master: '去升级主设备',
    master_unknow_err_tip: '您当前登录的是从设备，由于主设备异常，无法查看整网信息，将为您展示从设备（本机）的信息。',
    master_unknow_err: '检测到主设备异常'
  },
  devtool: {
    reboot: '重启',
    reboot_confirm: '重启设备需要重新登录，是否确认重启？',
    reboot_success: '设备重启完成',
    rebooting: '设备重启中...',
    refresh_page: '刷新页面',
    reset_confirm: '确认要删除所有配置吗？此动作可能导致无法访问web页面！'
  },
  nbr: {
    gateway_info: '网关信息',
    gateway_manage: '管理网关'
  },
  quickset: {
    re_discover: '重新发现',
    begin_cfg: '开始配置',
    prev: '上一步',
    next: '下一步',
    discover_dev: '发现设备',
    create_network: '创建网络项目',
    scan_cloud: '扫码上云',
    whole_new_cfg: '全网配置',
    check_cloud_status: '检测连云状态',
    create_and_connection: '创建项目并连通网络',
    complete_cfg: '完成配置',
    exit_tip: '退出后，当前页面所做的配置将丢失，请谨慎操作！',
    cfg_nocomplete: '您有配置尚未完成',
    exit_confirm: '确定退出',
    continue_cfg: '继续配置',
    dev_cfg_tip1: '1、您可以在EWEB平台对每台设备进行单独配置。',
    dev_cfg_tip2: '2、在需要的时候，你可以点击页面顶部的<span class="c-success">【诺客云端运维】</span>或<span class="c-success">【下载APP】</span>开启远程运维',
    dev_cfg_tip3: '2、在需要的时候，你可以点击页面顶部的<span class="c-success">【诺客云端运维】</span>开启远程运维',
    tips: '小贴士',
    enter_eweb: '进入EWEB首页',
    dev_no_join_tip: '检测到设备未自组网，完成配置后，如果要与其他设备组网使用需输入管理密码合并。如果您只想单机使用，可忽略此提示。',
    no_cfg_now: '暂不配置',
    cfg_ok: '知道了，下发配置吧',
    cfg_no_change: '检测到配置未修改，是否继续此配置。',
    skip_cfg: '跳过配置',
    override_cfg: '是的，覆盖配置',
    cfging: '正在下发配置...',
    cfg_action: '下发配置',
    cfg_effecting: '配置生效中...',
    data_invalid: '请检查数据合法性',
    check_connect: '检测网络连通性...',
    re_connect_wifi: '若通过Wi-Fi访问，请重新连接无线（{ssid}）。',
    ip_change_tip: '若修改上网方式导致设备IP地址变化，{msg}。',
    ip_change_msg1: '请输入新的IP地址访问',
    ip_change_msg2: '稍后请刷新本页面'
  },
  slave_eg: {
    gateway_err_tip: '网关管理页面异常，无法查看，请检查网关设备软件版本是否出现故障，可以尝试重启、恢复出厂或升级版本。',
    page_err: '检测到页面异常',
    source_err: '检测到文件资源加载异常'
  }
}

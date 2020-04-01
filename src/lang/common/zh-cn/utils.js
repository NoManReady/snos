export default {
  rules: {
    exist_ip_range_or_addr: "IP地址或范围重复",
    ip_is_exist: "IP地址已配置过",
    mac_is_exist: "MAC地址已配置过",
    invalid_ip_range_or_addr: "请输入正确的IP地址或范围",
    empty_ip_range_or_addr: "请输入IP地址或范围",
    ip_mask_diffrent_network: "IP地址和子网掩码不在同一个网段",
    net_example: "子网格式：192.168.110.0/24",
    len_min_max: "字符长度{min}-{max}（单个中文占{size}个字符）",
    len_max: "名称不能超过{max}个字符（单个中文占{size}个字符）",
    mtu_range: "MTU介于576~1500",
    comm_pass_format: "仅限字母、数字和<=>[]!@#$*().符号",
    web_pass_format: "不能包含中文、全角字符、问号和空格",
    web_pass_alldigit: "不能全数字",
    web_pass_allletter: "不能全字母",
    web_pass_def: "不能包含admin",
    hostname_format: "限中文,英文字母，数字，下划线，-，#或@",
    comm_range: "取值范围 ：{min}~{max}",
    require_int: "请输入整数",
    require_valid_hex: "请输入正确的十六进制数",
    hex_range: "取值范围 0x{min}~0x{max}",
    invalid_mac_addr: "无效的MAC地址（不能为全0或则全f）",
    no_multil_mac: "MAC地址不能为组播地址",
    vlan_range_m: "VLAN范围如（3-5,100）",
    vlan_range_s: "VLAN ID的范围为1~4094",
    invalid_ip_format: "IP格式不对",
    require_vlanid: "请输入VLAN",
    vlan_err_m: "格式错误，VLAN ID范围如（3-5,100）",
    digit_err_format: "格式错误，请输入正整数",
    invalid_url: "请输入有效的网址",
    netmask_invalid_value: [
      "子网掩码不能为0.0.0.0",
      "子网掩码不能为255.255.255.255 或 255.255.255.254"
    ],
    vlan_step_range: "VLAN ID的范围为2~232和234~4090",
    max_addr_limit: "最多支持{max}个地址",
    addr_exist: "输入的地址存在重复",
    invalid_ip_domain: "请输入有效的域名或IP地址",
    invalid_net: "请输入有效的网段",
    value_range1: "数值必须在2~254之间",
    port_no_empty: "请输入有效的端口号（1-65535）",
    name_rule_quote: "名称不可包含英文单引号，双引号",
    wifi_name_rule: "字母、数字、下划线、中划线、@、&、空格、中文",
    name_no_china: "名称不可包含中文",
    and_china_flag: "（包含中文字符）",
    name_no_china_flag: "名称不可包含中文标点符号"
  },
  fetch: {
    loading: "加载中...",
    req_timeout: "请求超时",
    req_err_check: "请求失败，请检查网络连通性！",
    req_err_404: "404，错误请求",
    req_forbid: "禁止访问",
    req_err_inner: "服务器内部错误",
    function_no_ok: "功能未实现",
    server_is_nouse: "服务不可用",
    gateway_err: "网关错误",
    unknow_err: "未知错误"
  },
  index: {
    waitting: "请耐心等待...",
    check_online_tip: "网络访问超时，请检查网络是否可连通或尝试刷新页面。",
    no_desc: "暂无描述",
    is_newest_ver: "（当前已是最新版本）",
    online_upgrade_tip:
      '1、在线升级会保留当前配置<br/><span class="c-danger">2、升级过程中会重启设备</span><br/>3、升级时请不要刷新或关闭浏览器，升级成功会自动跳转到登录页。',
    online_upgrade_confirm: "确认升级提示",
    cancel_upgrade: "取消升级",
    confirm_upgrade: "知道了，升级吧",
    fetch_no_version: "未获取到最新版本，请重新获取",
    upgradeing: "正在升级设备...",
    upgrade_suggest: "建议升级到最新版本！",
    newest_version_f: "新版本号：",
    version_desc_f: "版本说明：",
    newversion_found: "发现有新版本",
    no_upgrade: "暂不升级",
    upgrade_now: "马上升级（推荐）",
    newdev_found: "发现新设备，",
    newdev_diff_found: "发现不属于本网络管理的设备，",
    click_to_handle: "点击去处理",
    backup_tip:
      '检测到设备上存有备份文件，是否进行恢复？<div class="c-danger">（注意：恢复过程会重启）</div>',
    delete_backup: "删除备份",
    restore_backup: "恢复备份",
    cfg_restoreing: "配置恢复中...",
    backup_cfg_no_support: "备份文件不支持当前设备，请检查备份文件是否损坏。",
    no_handle_now: "暂不处理",
    delete_backup_success: "删除备份成功",
    pppoe_deal_time_tip: "每天系统会监测一次账号信息，过期账号会被禁用。"
  }
};
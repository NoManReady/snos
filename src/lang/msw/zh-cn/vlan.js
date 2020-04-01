export default {
  vlan: {
    // vlan
    list: 'VLAN列表',
    desc_cnt: '描述最多{cnt}个字符',
    access: 'Access口',
    trunk: 'Trunk口',
    toggle_list: '点击{action}列表',
    get_list_failed: 'VLAN列表获取出错',
    cfg_err: 'VLAN配置出错',
    patch_add: '批量添加VLAN',
    patch_example: '如3-5,20',
    warning_tip: '默认vlan、管理vlan、native vlan及access vlan不允许被删除。',

    // 验证tip
    id_exist: '该VLAN ID已存在',
    desc_not_empty: 'VLAN描述不能为空',
    desc_exist: '该VLAN描述已存在',
    desc_no_use: '该VLAN描述不可使用',
    id_required: '请输入VLAN ID',

    // port vlan
    create_vlan:'请先创建VLAN',
    allow_vlan:'允许通过的VLAN',
    allow_vlan_f:'@:msw.vlan.allow_vlan：',
    rang_example:'VLAN范围如(3-5,100)',

    // 验证
    untag_contain:'Untag VLAN必须包含Native VLAN',
    vlan_is_required:'请选择VLAN',
    tag_is_required:'请输入Untag VLAN'
  }
}

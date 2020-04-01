export default {
  vlan: {
    // vlan
    list: 'VLAN List',
    desc_cnt: 'Max: {cnt} characters.',
    access: 'Access Port',
    trunk: 'Trunk Port',
    toggle_list: 'Click to {action} the list.',
    get_list_failed: 'Failed to fetch the VLAN list.',
    cfg_err: 'VLAN configuration error.',
    patch_add: 'Batch Add',
    patch_example: 'Example: 3-5 and 20.',
    warning_tip: 'The default VLAN, management VLAN, native VLAN and access VLAN cannot be deleted.',

    // 验证tip
    id_exist: 'The VLAN ID is already taken.',
    desc_not_empty: 'Please enter a description.',
    desc_exist: 'The description already exists.',
    desc_no_use: 'The description cannot be used.',
    id_required: 'Please enter a VLAN ID.',

    // port vlan
    create_vlan:'Please create at least one VLAN.',
    allow_vlan:'Permitted VLAN',
    allow_vlan_f:'@:msw.vlan.allow_vlan:',
    rang_example:'Example: 3-5 and100.',

    // 验证
    untag_contain:'The untagged VLAN must contain the native VLAN.',
    vlan_is_required:'Please select a VLAN.',
    tag_is_required:'Please enter an untagged VLAN ID.'
  }
}
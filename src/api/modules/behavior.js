import * as api from './api'
/**
 * 设置时间管理
 * opt[add,update,del]
 */
export const setDateManage = (params, opt) => {
    return api.cmd(
        `acConfig.${opt}`,
        { module: 'tmngt', data: params }
    )
}

/**
 * 获取时间管理
 */
export const getDateManage = (isSilence = false) => {
    return api.cmd(
        'acConfig.get',
        { module: 'tmngt' },
        { isSilence }
    ).then(d => {
        const _map = {
            everytime: I18N.t('api.everytime'),
            workday: I18N.t('api.workday'),
            weekend: I18N.t('api.weekend')
        }
        return d.list.filter(lis => lis.type !== 'auto').map(t => {
            if (t.type === 'system') {
                t.name = _map[t.tmngtName] || t.tmngtName
            } else {
                t.name = t.tmngtName
            }
            return t
        })
    })
}

/**
 * 设置地址管理
 */
export const setAddrManage = (params, async = false) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', async, data: { func: 'ca_set_ip_range', ...params } }
    )
}

/**
 * 删除地址管理
 */
export const delAddrManage = (params) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', data: { func: 'ca_del_ip_range', ...params } }
    )
}

/**
 * 获取地址管理
 */
export const getAddrManage = (isSilence = false) => {
    return api.cmd(
        'devSta.get',
        { module: 'content_audit', data: { func: 'ca_get_ip_range' } },
        { isSilence }
    )
}

/**
 * 获取应用列表
 */
export const getApplicationList = () => {
    return api.cmd(
        'devSta.get',
        { module: 'content_audit', data: { func: 'ca_get_app_policy' } }
    )
}

/**
 * 设置应用列表
 */
export const setApplicationList = (params, async = false) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', async, data: { func: 'ca_set_app_policy', ...params } }
    )
}

/**
 * 删除应用列表
 */
export const delApplicationList = (params) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', data: { func: 'ca_del_app_policy', ...params } }
    )
}


/**
 * 获取应用树
 */
export const getApplicationTree = () => {
    return api.cmd(
        'devSta.get',
        { module: 'content_audit', data: { func: 'app_idy_get_app_tree' } },
        { isSilence: true }
    )
}


/**
 * 获取QQ阻断列表
 */
export const getQqBwList = () => {
    return api.cmd(
        'devSta.get',
        { module: 'content_audit', data: { func: 'ca_get_im_policy' } }
    )
}

/**
 * 设置QQ阻断列表
 */
export const setQqBwList = (params, async = false) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', async, data: { func: 'ca_set_im_policy', ...params } }
    )
}

/**
 * 删除QQ阻断列表
 */
export const delQqBwList = (params) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', data: { func: 'ca_del_im_policy', ...params } }
    )
}

/**
 * 设置QQ阻断模式（黑白none模式）
 */
export const setQqBwMode = (params, async = true) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', async, data: { func: 'ca_set_im_model', ...params } }
    )
}


/**
 * 获取网站分组列表
 */
export const getSiteGroupList = (isSilence = false) => {
    return api.cmd(
        'devSta.get',
        { module: 'content_audit', data: { func: 'ca_get_url_list' } },
        { isSilence }
    )
}

/**
 * 设置网站分组
 */
export const setSiteGroup = (params, async = false) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', async, data: { func: 'ca_set_url_list', ...params } }
    )
}

/**
 * 删除网站分组
 */
export const delSiteGroup = (params) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', data: { func: 'ca_del_url_list', ...params } }
    )
}

/**
 * 获取网站策略列表
 */
export const getSiteRuleList = () => {
    return api.cmd(
        'devSta.get',
        { module: 'content_audit', data: { func: 'ca_get_url_policy' } }
    )
}

/**
 * 设置网站策略
 */
export const setSiteRule = (params, async = false) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', async, data: { func: 'ca_set_url_policy', ...params } }
    )
}

/**
 * 删除网站策略
 */
export const delSiteRule = (params) => {
    return api.cmd(
        'devSta.set',
        { module: 'content_audit', data: { func: 'ca_del_url_policy', ...params } }
    )
}

/**
 * 获取访问控制生效状态
 */
export const getAccessCtrlListSta = () => {
    return api.cmd(
        'devSta.get',
        { module: 'access_ctrl_status' }
    )
}

/**
 * 获取访问控制列表
 */
export const getAccessCtrlList = () => {
    return api.cmd(
        'devConfig.get',
        { module: 'access_ctrl' }
    )
}

/**
 * 增删改访问控制
 */
export const setAccessCtrl = (params, opt = 'set', async = false) => {
    return api.cmd(
        `devConfig.${opt}`,
        { module: 'access_ctrl', async, data: params }
    )
}

/**
 * 上移/下移访问控制
 */
export const setAccessCtrlSort = (data) => {
    return api.cmd(
        'devConfig.update',
        { module: 'access_ctrl', data }
    )
}

/**
 * 上网控制列表
 */
export const getTimeLimit = () => {
    return api.cmd(
        'devConfig.get',
        { module: 'terminal_surf_ctrl' }
    )
}

/**
 * 增加上网控制
 */
export const addTimeLimit = (data, isSilence) => {
    return api.cmd(
        'devConfig.add',
        { module: 'terminal_surf_ctrl', data: { list: [data] } },
        { isSilence }
    )
}

/**
 * 编辑上网控制
 */
export const updateTimeLimit = (data) => {
    return api.cmd(
        'devConfig.update',
        { module: 'terminal_surf_ctrl', data }
    )
}

/**
 * 删除上网控制
 */
export const delTimeLimit = (uuid) => {
    return api.cmd(
        'devConfig.del',
        { module: 'terminal_surf_ctrl', data: { uuid } }
    )
}

/**
 * 上网控制状态
 */
export const getTimeLimitStatus = () => {
    return api.cmd(
        'devSta.get',
        { module: 'terminal_surf_ctrl_status' }
    )
}
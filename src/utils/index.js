import { Loading, MessageBox } from 'element-ui';
import timer from './timer';
import router from '@/router';
import store from '@/store';
import { objIsSame } from '@/utils/utils'
import {
  getVersion,
  hasBackupFile,
  restoreConfig,
  delRestoreConfig,
  getPppoeTimeout
} from '../api/modules/system';
import { system } from '../api/modules/api';
import { getNetworkNeighbor } from '../api/modules/network';
import { hasContainUplink } from '@/utils/lag';
import Axios from 'axios';
import Vue from 'vue';
const vueInstance = new Vue();
/**
 * 去中心化
 * @param {上下文} requireContext
 * @param {排除文件} exinclude
 */
export const deCentralization = (
  requireContext,
  exinclude = /index/,
  fn = argv => argv
) => {
  const sourceMap = {};
  const paths = requireContext.keys().filter(p => {
    return !exinclude.test(p);
  });
  for (let p of paths) {
    const ss = fn(requireContext(p));
    for (let s in ss) {
      sourceMap[s] = ss[s];
    }
  }
  return sourceMap;
};

/**
 * 去中心化(export default形式)
 * @param {上下文} requireContext
 */
export const deCentralizationUmd = (
  requireContext,
  fn = (a, b) => ({
    ...a,
    ...b
  })
) => {
  const sourceMap = (r => {
    return requireContext.keys().map(k => {
      return r(k).default;
    });
  })(requireContext);
  return sourceMap.reduce(fn);
};

/**
 * 开发输出log
 * @param {消息} msg
 */
export const log = (...msg) => {
  if (process.env.NODE_ENV === 'development' && console && console.log) {
    console.log(...msg);
  }
};

/**
 * 获取style样式
 */
export const getStyle = (element, attr) => {
  let target;
  // scrollTop 获取方式不同，不属于style，而且只有document.body才能用
  if (attr === 'scrollTop') {
    target = element.scrollTop;
  } else if (element.currentStyle) {
    target = element.currentStyle[attr];
  } else {
    target = document.defaultView.getComputedStyle(element, null)[attr];
  }
  return target;
};

/**
 * 重启模块
 * @param {重启模块} modules
 * @param {查询间隔} delay
 */
export const restart_modules = async (modules, delay = 3000) => {
  // let _loading = Loading.service({ text: '开始重启模块' })
  // await restart(modules)
  // let _module = await checkRestartStatus()
  // while (_module.status !== 'finish') {
  //   _module = _module.status.split('/').slice(-1)[0]
  //   _loading.text = `重启${_module}模块`
  //   await new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve()
  //     }, delay)
  //   })
  //   _module = await checkRestartStatus()
  // }
  // _loading.close()
};

/**
 * 检测是否可访问
 */
export const isLanOnline = host => {
  let _protocol = window.location.protocol;
  if (host && host.indexOf(_protocol) !== 0) {
    host = _protocol + '//' + host;
  }
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.src = `${host || process.env.PING}/luci-static/${
      process.env.THEME
      }/favicon.ico`;
    img.onload = () => resolve(1);
    img.onerror = () => resolve(0);
  });
};

/**
 * 检测网络是否可用
 */
export const isNetEnable = (host, time = 10000) => {
  var instance = Axios.create();
  instance.defaults.timeout = time;
  let _protocol = window.location.protocol;
  if (host && host.indexOf(_protocol) !== 0) {
    host = _protocol + '//' + host;
  }
  return instance
    .post(`${host || ''}${window.BASE_URI}/api/auth`, {
      method: 'checkNet'
    })
    .then(
      res => ({
        code: 1,
        res
      }),
      res => {
        if (res.code === "ECONNABORTED") {
          return { // 超时不通
            code: 0,
            res
          }
        }
        return { // 跨域算通
          code: 1,
          res
        }
      }
    )
    .catch(res => {
      return {
        code: 0,
        res
      };
    });
};

/**
 * 延迟指定时间
 * @param {延迟时间} delay
 */
export const sleep = (delay = 3000, text, p) => {
  let _loading;
  if (text) {
    _loading = Loading.service({
      text
    });
  }
  return new Promise(resolve => {
    setTimeout(() => {
      _loading && _loading.close();
      resolve(p && p.cancel());
    }, delay);
  });
};

/**
 * 等待上线
 */
export const awaitOnLine = (
  time = 5000,
  text = I18N.t('index.waitting'),
  host,
  maxTry = 30
) => {
  let _loading = null;
  if (text !== 0) {
    _loading = Loading.service({
      text,
      background: 'rgba(255, 255, 255, .5)'
    });
  }
  timer.clean();
  return new Promise(async (resolve, reject) => {
    await sleep(time);
    let _res = await isNetEnable(host);
    maxTry--;
    while (_res.code === 0 && maxTry) {
      await sleep();
      _res = await isNetEnable(host);
      maxTry--;
    }
    _loading && _loading.close();
    if (!maxTry) {
      vueInstance.$msgbox({
        title: I18N.t('phrase.tip'),
        message: I18N.t('index.check_online_tip'),
        type: 'error'
      });
      reject();
    } else {
      resolve();
    }
  });
};

/**
 * 等待上线
 */
export const awaitOnLine_plus = ({
  time = 5000,
  text = I18N.t('index.waitting'),
  host,
  maxTry = 30
}) => {
  return awaitOnLine(time, text, host, maxTry);
};

/**
 * 检测是否有在线版本
 */
export const isOnlineVers = () => {
  return new Promise(async (resolve, reject) => {
    let data = await getVersion({
      deviceType: 'self'
    });

    if (typeof data.new === 'object') {
      if (data.new.totalCount) {
        let newVerData =
          (data.new.firmwareList && data.new.firmwareList[0]) || {};
        let newVersion = newVerData.versionCode;

        if (newVersion.trim() != data.cur.trim()) {
          resolve(true);
        }
      }
    }
    resolve(false);
  });
};

export const getOnlineVers = async () => {
  let form = {
    curVersion: '',
    newVersion: '',
    versionDesc: '',
    // '1、增加双WAN口工功能，支持负载均衡和运营商选路<br />2、增加营销认证功能，支持微信连WiFi、短信认证、一键认证<br />3、支持流控<br/>4、休息休息<br/>5、很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长<br/>6、aaaaaaaaaaaa',
    hasNewVersion: false,
    downloadPath: ''
  };
  let data = await getVersion({ deviceType: 'self' });

  form.curVersion = data.cur || '';
  if (typeof data.new === 'object') {
    if (data.new.totalCount) {
      let newVerData =
        (data.new.firmwareList && data.new.firmwareList[0]) || {};

      let newVersion = newVerData.versionCode;

      if (newVersion.trim() != form.curVersion.trim()) {
        form.newVersion = newVersion;
        form.versionDesc = newVerData.releaseNotes || I18N.t('index.no_desc');
        form.downloadPath = newVerData.downloadUrlTar;
        form.hasNewVersion = true;
      } else {
        form.curVersion += I18N.t('index.is_newest_ver');
      }
    } else {
      form.curVersion += I18N.t('index.is_newest_ver');
    }
  }
  return form;
};

export const upgradeOnlineVers = async _vers => {
  await vueInstance.$confirm(
    I18N.t('index.online_upgrade_tip'),
    I18N.t('index.online_upgrade_confirm'),
    {
      // type: 'warning',
      showClose: false,
      cancelButtonText: I18N.t('index.cancel_upgrade'),
      confirmButtonText: I18N.t('index.confirm_upgrade'),
      closeOnClickModal: false,
      dangerouslyUseHTMLString: true
    }
  );
  if (!_vers.downloadPath) {
    return vueInstance.$alert(I18N.t('index.fetch_no_version'));
  }

  system('upgradeConfirm', {
    path: _vers.downloadPath,
    isPersist: true
  }).then(d => {
    awaitOnLine(60000, I18N.t('index.upgradeing'), null, 50).then(() => {
      window.top.location.reload();
    });
  });
};

let NOTICE = null;
// 跳转在线升级页面
const _onOnlineUpgrade = () => {
  router.push({
    name: 'admin/alone/systool_upgrade',
    query: {
      tab: '0'
    }
  });
  NOTICE.close();
};
// 检测是否有在线版本
export const loadOnlineVers = async () => {
  let _vers = await getOnlineVers();

  if (_vers.hasNewVersion) {
    let _htmlArr = [
      `<div class="c-danger fs16">${I18N.t('index.upgrade_suggest')}</div>`,
      `<div class="mt5"><label class="fl">${I18N.t(
        'index.newest_version_f'
      )}</label><div style="margin-left: 70px;">${_vers.newVersion}</div>`,
      `<div class="mt5"><label class="fl">${I18N.t(
        'index.version_desc_f'
      )}</label><pre style="margin-left: 70px; font-family: inherit;">${
      _vers.versionDesc
      }</pre>`
    ];
    vueInstance.$confirm(
      _htmlArr.join(''),
      I18N.t('index.newversion_found'),
      {
        // type: 'warning',
        showClose: false,
        cancelButtonText: I18N.t('index.no_upgrade'),
        confirmButtonText: I18N.t('index.upgrade_now'),
        closeOnClickModal: false,
        dangerouslyUseHTMLString: true,
        customClass: 'w500'
      }
    ).then(ok => {
      upgradeOnlineVers(_vers);
    }, cancel => { });
  }
};
let MESSAGE = null;
// 跳转编辑冲突页
const _onEditConflict = () => {
  router.push({
    name: 'admin/network_neighbor'
  });
  MESSAGE.close();
};
// 网络组信息
export const loadNetworkNeighbor = async () => {
  //       1. 只有新设备：提示发现新设备，点击去处理。
  //       2. 有别的网络：提示发现不属于本网络管理的设备，点击去处理
  if (MESSAGE && MESSAGE.close) {
    MESSAGE.close();
  }
  getNetworkNeighbor(true).then(d => {
    if (d.conflict) {
      let _jsx = null,
        msg = '';
      if (d.curNetwork.networkId !== '0' && !!d.networkIds['0']) {
        msg = I18N.t('index.newdev_found');
      } else {
        msg = I18N.t('index.newdev_diff_found');
      }
      _jsx = new Vue({
        functional: true,
        render(h) {
          return (
            <p>
              {msg}
              <a
                class="f-theme fs15"
                href="javascript:void(0);"
                onClick={_onEditConflict}
              >
                {I18N.t('index.click_to_handle')}
              </a>
            </p>
          );
        }
      }).$mount();
      MESSAGE = vueInstance.$notify({
        duration: 0,
        title: I18N.t('phrase.tip'),
        type: 'warning',
        dangerouslyUseHTMLString: true,
        showClose: true,
        onClose: () => (MESSAGE = null),
        message: _jsx._vnode
      });
    }
  });
};
export const checkBackupFile = async () => {
  if (!store.getters.roles.includes('egw')) {
    // EGW才检测是否有备份文件
    return false;
  }
  let d = await hasBackupFile();
  if (d.hasfile) {
    vueInstance
      .$confirm(I18N.t('index.backup_tip'), I18N.t('phrase.tip'), {
        type: 'info',
        showClose: false,
        cancelButtonText: I18N.t('index.delete_backup'),
        confirmButtonText: I18N.t('index.restore_backup'),
        closeOnClickModal: false,
        dangerouslyUseHTMLString: true
      })
      .then(
        async () => {
          let res = await restoreConfig(d.path);
          if (res.addr) {
            awaitOnLine(10000, I18N.t('index.cfg_restoreing')).then(() => {
              window.top.location.reload();
            });
          } else if (res.msg.includes('not supports')) {
            vueInstance
              .$confirm(
                I18N.t('index.backup_cfg_no_support'),
                I18N.t('phrase.tip'),
                {
                  type: 'warning',
                  showClose: false,
                  cancelButtonText: I18N.t('index.no_handle_now'),
                  confirmButtonText: I18N.t('index.delete_backup'),
                  closeOnClickModal: false,
                  dangerouslyUseHTMLString: true
                }
              )
              .then(() => {
                delRestoreConfig(d.path);
                vueInstance.$message.success(
                  I18N.t('index.delete_backup_success')
                );
              });
          }
        },
        () => {
          delRestoreConfig(d.path);
          vueInstance.$message.success(I18N.t('index.delete_backup_success'));
        }
      )
      .catch(() => { });
  }
};

// 判断编辑端口是否具有上联口并等待用户选择返回
export const waitForActionIfHasUplink = async (portids, i18n_key) => {
  let _hasUplink = hasContainUplink(portids);
  if (_hasUplink) {
    let _uplink = store.getters['switcher/uplink'];
    try {
      await MessageBox.confirm(
        I18N.t(i18n_key, { uplink: _uplink.interface }),
        {
          confirmButtonText: I18N.t('action.confirm'),
          cancelButtonText: I18N.t('action.cancel'),
          type: 'warning'
        }
      );
      return _hasUplink;
    } catch (error) {
      return Promise.reject('User cancel.');
    }
  }
  return _hasUplink;
};
let PPPOEMESSAGE = null
// pppoe到期时间显示
export const showPppoeTimeout = async () => {
  let data = await getPppoeTimeout();
  let _jsx = null,
    mess = '';
  Object.keys(data).forEach((key) => {
    mess = mess + key + ' ' + I18N.t('egw.pppoe.deal_time_f') + data[key] + '\n'
  });
  if (mess != '') {
    _jsx = new Vue({
      functional: true,
      render(h) {
        return (
          <div>
            {I18N.t('egw.pppoe.pppoe_server')}
            <div class="c-warning">
              {I18N.t('index.pppoe_deal_time_tip')}
              <a
                class="f-theme fs15"
                href="javascript:void(0);"
                onClick={_onEditPppoe}
              >
                {I18N.t('index.click_to_handle')}
              </a>
            </div>
            <div style="white-space: pre-wrap;">
              {mess}
            </div>
          </div>
        );
      }
    }).$mount();
    PPPOEMESSAGE = vueInstance.$notify({
      duration: 0,
      title: I18N.t('phrase.tip'),
      type: 'warning',
      dangerouslyUseHTMLString: true,
      showClose: true,
      onClose: () => (PPPOEMESSAGE = null),
      message: _jsx._vnode
    });
  }
};
const _onEditPppoe = () => {
  router.push({
    name: 'admin/alone/advanced/advanced_pppoe'
  });
  PPPOEMESSAGE.close();
};

// 配置是否相同，提示是否覆盖返回true; 跳过返回false
export const doSameConfig = async (d1, d2, cancelText = I18N.t('quickset.no_cfg_now')) => {
  if (!objIsSame(d1, d2)) {
    return true
  }
  let _doConfirm = true
  try {
    _doConfirm =
      (await vueInstance.$confirm(
        I18N.t('quickset.cfg_no_change'),
        I18N.t('phrase.tip'),
        {
          distinguishCancelAndClose: true,
          showCancelButton: !!cancelText,
          cancelButtonText: cancelText,
          confirmButtonText: I18N.t('quickset.override_cfg'),
          closeOnClickModal: false
        }
      )) === 'confirm'
  } catch (error) {
    if (error === 'close') {
      return 'close'
    }
    _doConfirm = false
  }
  return _doConfirm
}
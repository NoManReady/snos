import modifyPassword from '@/utils/modifyPassword';
import bus from '@/utils/bus';
import store from '@/store';
import router from '@/router';
import { MessageBox } from 'element-ui';
const CONTEXT = 'AUTH_CONTEXT';

const _checkAuth = () => {
  return new Promise((resolve, reject) => {
    if (store.state.system.networkId.networkId === '0' && !APP_ROLES.includes('slave') && !store.getters.isIndustry) {
      let _isAlone = APP_ROLES.includes('alone');
      let _quickTxt = _isAlone
        ? I18N.t('main_header.quick_cfg')
        : I18N.t('main_header.network_cfg');
      let _confirm = MessageBox.confirm('', {
        message: I18N.t('quickmacc.require_quick', { quick: _quickTxt }),
        confirmButtonText: I18N.t('quickmacc.goto_quick', { quick: _quickTxt }),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      });
      _confirm.then(
        () => {
          // resolve()
          if (window.PROXY.hideHead === 'true') {
            top.location.href = top.location.origin;
          } else {
            router.push({ name: 'quickmacc' });
            // router.push({ name: _isAlone ? 'quickset' : 'quickmacc' })
          }
        },
        _ => {
          reject(store.state.system.networkId.networkId);
        }
      );
    } else {
      resolve();
    }
  });
};

const _checkParams = fn => {
  let _value = fn;
  let _fn = null;
  let _params = [];
  if (typeof _value === 'function') {
    _fn = _value;
  } else if (typeof fn === 'object') {
    _fn = fn.fn || (() => null);
    _params = fn.params;
  }
  if (!Array.isArray(_params)) {
    _params = [_params];
  }
  return [_fn, _params];
};

export default {
  bind(el, binding, vnode) {
    let _isEhr = APP_ROLES.includes('ehr')
    let [_fn, _params] = _checkParams(binding.value);
    const eventHandler = e => {
      if (_isEhr) {
        if (store.state.authority.isDefaultPass) {
          modifyPassword({ el: e.currentTarget })
        } else {
          el[CONTEXT].fn(...el[CONTEXT].params);
        }
      } else {
        _checkAuth(e).then(() => {
          el[CONTEXT].fn(...el[CONTEXT].params);
        });
      }
    };
    el.addEventListener('click', eventHandler);
    el[CONTEXT] = {
      eventHandler,
      fn: _fn,
      params: _params
    };
    if (_isEhr) {
      bus.$on('auth-callback', ({ isOk }) => {
        bus.$off('auth-callback');
        if (isOk) {
          let _context = el[CONTEXT]
          _context.fn(..._context.params)
        }
      });
    }
  },
  inserted(el, binding) { },
  update(el, binding) {
    let [_fn, _params] = _checkParams(binding.value);
    el[CONTEXT].params = _params;
    el[CONTEXT].fn = _fn;
  },
  componentUpdated(el, binding) { },
  unbind(el, binding) {
    el.removeEventListener('click', el[CONTEXT].eventHandler);
  }
};

export const isAuth = (fn = () => { }) => {
  return new Promise((resolve, reject) => {
    _checkAuth().then(
      () => {
        resolve(fn());
      },
      () => {
        reject();
      }
    );
  });
};

export const isAuthOld = (fn = () => { }) => {
  return new Promise((resolve, reject) => {
    if (
      store.state.system.networkId.networkId === '0' &&
      !APP_ROLES.includes('slave')
    ) {
      bus.$on('auth-callback', ({ isOk }) => {
        bus.$off('auth-callback');
        if (isOk) {
          resolve(fn());
        } else {
          reject();
        }
      });
      modifyPassword();
    } else {
      resolve(fn());
    }
  });
};

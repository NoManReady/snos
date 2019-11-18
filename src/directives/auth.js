import modifyPassword from '@/utils/modifyPassword'
import bus from '@/utils/bus'
import store from '@/store'
const CONTEXT = 'AUTH_CONTEXT'

export default {
  bind(el, binding, vnode) {
    let _value = binding.value
    let _fn = null
    let _params = []
    if (typeof _value === 'function') {
      _fn = _value
    } else if (typeof binding.value === 'object') {
      _fn = binding.value.fn || (() => null)
      _params = binding.value.params
    }
    if (!Array.isArray(_params)) {
      _params = [_params]
    }
    const eventHandler = (e) => {
      if (store.state.authority.isDefaultPass) {
        modifyPassword({ el: e.currentTarget })
        return
      }
      el[CONTEXT].fn(...el[CONTEXT].params)
    }
    bus.$on('auth-callback', ({ isOk, el }) => {
      bus.$off('auth-callback')
      if (isOk) {
        let _context = el[CONTEXT]
        _context.fn(..._context.params)
      }
    })
    el.addEventListener('click', eventHandler)
    el[CONTEXT] = {
      eventHandler,
      fn: _fn,
      params: _params
    }
  },
  inserted(el, binding) { },
  update(el, binding) {
    let _value = binding.value
    let _fn = null
    let _params = []
    if (typeof _value === 'function') {
      _fn = _value
    } else if (typeof binding.value === 'object') {
      _fn = binding.value.fn || (() => null)
      _params = binding.value.params
    }
    if (!Array.isArray(_params)) {
      _params = [_params]
    }
    el[CONTEXT].params = _params
    el[CONTEXT].fn = _fn
  },
  componentUpdated(el, binding) { },
  unbind(el, binding) {
    el.removeEventListener('click', el[CONTEXT].eventHandler)
  }
}

export const isAuth = (fn = () => { }) => {
  return new Promise((resolve, reject) => {
    if (store.state.authority.isDefaultPass) {
      bus.$on('auth-callback', ({ isOk }) => {
        bus.$off('auth-callback')
        if (isOk) {
          resolve(fn())
        } else {
          reject()
        }
      })
      modifyPassword()
    } else {
      resolve(fn())
    }
  })
}

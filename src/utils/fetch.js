import axios from 'axios'
import router from '@/router'
import { Loading, Message } from 'element-ui'
import { log, sleep } from '@/utils'
import { saveToSession } from '@/utils/localStorage'
import errorMap from './errMap'
// 加载最小时间
const MINI_TIME = 300
// 超时时间
let TIME_OUT_MAX = 30000
// 环境value
let _dev = process.env.NODE_ENV !== 'production'
// 请求接口host
let _apiHost = process.env.PROXY
// 请求组（判断当前请求数）
let _requests = []

window.$$json = (window.APP_ROLES || []).includes('msw')

let LOADING = null

/**
 * 添加请求，显示loading
 * @param {请求配置} config
 */
function pushRequest(config) {
  log(`${config.url}--begin`)
  _requests.push(config)
  if (!LOADING) {
    LOADING = Loading.service({
      lock: true,
      text: config.text || '加载中...',
      customClass: 'eweb-loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, .1)'
    })
  }
}

/**
 * 移除请求，无请求时关闭loading
 * @param {请求配置} config
 */
function popRequest(config) {
  log(`${config.url}--end`)
  let _index = _requests.findIndex(r => {
    return r === config
  })
  if (_index > -1) {
    _requests.splice(_index, 1)
  }
  if (!_requests.length) {
    if (LOADING) {
      LOADING.close()
      LOADING = null
    }
  }
}

const switchMsgMap = {
  1007: 'IP不可达(设备可能已下线)',
  1008: '401认证失败',
  1009: '连接超时',
  7510: 'VLAN ID已被使用，不可删除'
}

// 无Token请求
const noToken = []
// 全局设置axios
axios.defaults.headers.common['Content-Type'] = 'application/json'
// 开发环境使用 /proxy
axios.defaults.baseURL = _apiHost

  /**
   * 全局变量 -- 路由/资源获取（代理访问）/iframe嵌套传参 处理
   *  PROXY - 代理传参数据
   *  INITPATH - 初始化路由
   *  BASE_URI - 资源都是基于这个路径（代理使用）
   **/
  ; (function (w) {
    let _url = location.search; //获取url中"?"符后的字串
    let _params = {};
    if (_url.indexOf("?") != -1) {
      let str = _url.substr(1);
      let strs = str.split("&");
      for (var i = 0; i < strs.length; i++) {
        let _tmp = strs[i].split("=") || []
        _params[_tmp[0]] = decodeURIComponent(_tmp[1]);
      }
    }
    w.PROXY = _params
    w.INITPATH = _params.initpath || "";
    w.BASE_URI = w.BASE_URI || location.pathname.split(/\/;stok/)[0] || process.env.BASE_PATH

    log("fetch _params === ", _params)
    log("fetch pathname", location.pathname)
    log("fetch BASE_URI", w.BASE_URI)
  })(window)

/**
 * 请求地址，请求数据，是否静默，请求方法
 */
export default (url, data = {}, setting = {}) => {
  if (setting.timeout === 0) {
    setting.timeout = Infinity
  }
  let _noParse = window.$$json
  if (setting.hasOwnProperty('noParse')) {
    _noParse = setting.noParse
  }
  setting = Object.assign(
    { isSilence: false, timeout: TIME_OUT_MAX, method: 'POST', noParse: _noParse, showError: true },
    setting
  )

  // 根据地址设置接口路径
  url = window.BASE_URI + url

  let _webauth = window.Cookie.get(window.sn)
  if (_webauth) {
    url = url + '?auth=' + _webauth
  }
  log("fetch url : ", url)

  let _opts = { method: setting.method, url }
  let _data = Object.assign({}, data)
  for (let _key in _data.params || {}) {
    if (_data.params.hasOwnProperty(_key)) {
      typeof _data.params[_key] === 'string'
        ? _data.params[_key].trim()
        : _data.params[_key]
    }
  }

  // 配置是否解析数据
  if (setting.noParse) {
    if (_data.params) {
      _data.params.noParse = true
    } else {
      _data.params = { noParse: true }
    }
  }

  let _timer = null
  if (setting.method.toLocaleUpperCase() === 'POST') {
    _opts.data = _data
  } else {
    _opts.params = _data
  }

  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  const _promise = new Promise((resolve, reject) => {
    const _instance = axios.create({
      timeout: setting.timeout,
      cancelToken: source.token
    })
    let _random = {
      stamp: (new Date()).getTime(),
      url: `${_apiHost + url}--${data.method}`,
      text: setting.text || (['set', 'add', 'del', 'update'].includes(data.method.split('.')[1]) ? '配置中...' : null)
    }
    if (!setting.isSilence) {
      _timer = setTimeout(() => {
        pushRequest(_random)
      }, MINI_TIME)
    }
    _instance(_opts)
      .then(res => {
        // 清除定时器
        clearTimeout(_timer)
        if (!setting.isSilence) {
          popRequest(_random)
        }
        // axios获取data并解析数据是否parse
        let responseData = res.data || {}
        if (responseData.data) {
          try {
            if (_data.method === 'cmdArr') {
              responseData.data = responseData.data.map(d => {
                if (typeof (d) === 'string') {
                  return JSON.parse(d)
                } else {
                  return d
                }
              })
            } else if (typeof (responseData.data) === 'string') {
              responseData.data = JSON.parse(responseData.data)
            }
          } catch (error) {
            log('返回非json字符串', responseData.data)
          }
        }
        // rpc获取data
        let _responseData = responseData.data
        // esw数据解析
        if (_responseData && _responseData['dev_type'] === 'esw') {
          let _code = _responseData.code
          if (_code !== 0) {
            responseData.error = {
              message: errorMap['msw'][_code] || _responseData.result
            }
          } else {
            responseData.data = _responseData.result
          }
        }
        // msw错误数据解析
        else if (_responseData && Object.keys(_responseData).length > 0) {
          if (_responseData.code !== undefined && _responseData.code != 0) {
            let _isObject = typeof (_responseData.err) === 'object'
            let _isString = typeof (_responseData.err) === 'string'
            let _error = null
            if (_isObject) {
              _error = {
                message: _responseData.err.msg,
                code: _responseData.err.code
              }
            } else if (_isString) {
              if (/^\d+;.+$/.test(_responseData.err)) {
                let [code, msg] = _responseData.err.split(';')
                code = +code
                if (code !== 0) {
                  _error = {
                    message: errorMap['msw'][code] || msg,
                    code: code
                  }
                }
              } else {
                _error = {
                  message: _responseData.err,
                  code: _responseData.code
                }
              }
            }
            responseData.error = _error
          }
        }
        if (!responseData.error) {
          resolve(responseData.data)
        } else {
          setting.showError && responseData.error.message &&
            Message({
              duration: 5000,
              showClose: true,
              type: 'error',
              message: responseData.error.message
            })
          reject(responseData)
        }
      })
      .catch(res => {
        // 用户取消请求
        res.isCancel = axios.isCancel(res)
        let _response = res.response
        let _message = null
        clearTimeout(_timer)
        if (!setting.isSilence) {
          popRequest(_random)
        }
        if (!_response) {
          if (!res.isCancel) {
            try {
              if (res.message.indexOf('timeout') > -1) {
                _message = '请求超时'
              } else {
                _message = '请求失败，请检查网络连通性！'
              }
            } catch (e) {

            }
          } else {
            _message = res.message
          }
        } else {
          switch (_response && _response.status) {
            case 404:
              _message = '404,错误请求'
              break
            case 403:
            case 401:
              saveToSession(
                'APP_DEFAULT_PATH',
                router.currentRoute.fullPath.indexOf('/admin') > -1
                  ? router.currentRoute.fullPath
                  : ''
              )
              window.Cookie.expire(window.sn, {
                path: window.BASE_URI || '/cgi-bin/luci'
              })
              window.top.location.reload()
              _message = '禁止访问'
              break
            case 408:
              _message = '请求超时'
              break
            case 500:
              _message = '服务器内部错误'
              break
            case 501:
              _message = '功能未实现'
              break
            case 503:
              _message = '服务不可用'
              break
            case 504:
              _message = '网关错误'
              break
            default:
              _message = _response.message || '未知错误'
          }
        }
        if (_dev && _message) {
          // 错误提示
          Message({
            type: 'error',
            message: _message
          })
        }
        res.localError = _message
        reject(res)
      })
  })
  _promise.cancel = (fn = null) => {
    return Promise.resolve(typeof (fn) === 'function' ? fn() : fn).then(d => {
      return source.cancel(d) || d
    })
  }
  if (setting.timeoutOk) {
    return Promise.race([_promise, sleep(setting.timeoutOk, null, _promise)])
  }
  return _promise
}

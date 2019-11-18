import * as types from './constant'
import { common } from '@/api/modules/api'
import router from '@/router'
import { loadFromLocal, saveToLocal } from '@/utils/localStorage'
import langMap from '@/lang/langMap'
const browserLanguage = (navigator.language || navigator.browserLanguage).toLowerCase() || 'zh-cn'
/**
 * 全局布局状态相关
 */
export default {
  state: {
    // 路由title
    title: 'EWEB管理系统',
    // 动画效果
    direction: 'forward',
    // 全局loading
    loading: false,
    // 语言
    lang: window.LANG || loadFromLocal(types.APP_LANG) || langMap[browserLanguage],
    // 侧边栏是否打开
    collapse: Boolean(loadFromLocal(types.APP_ASIDE_CLOSE))
  },
  actions: {
    title({ commit }, title) {
      document.title = title
      commit(types.APP_TITLE, title)
    },
    direction({ commit }, direction) {
      commit(types.APP_DIRECTION, direction)
    },
    loading({ commit }, loading = true) {
      commit(types.APP_LOADING, loading)
    },
    setLang({ commit }, lang = 'zh') {
      window.I18N.locale = lang
      saveToLocal(types.APP_LANG, lang)
      commit(types.APP_LANG, lang)
    },
    setCollapse({ commit }, collpse = true) {
      saveToLocal(types.APP_ASIDE_CLOSE, collpse)
      commit(types.APP_ASIDE_CLOSE, collpse)
    }
  },
  mutations: {
    [types.APP_TITLE](state, payload) {
      state.title = payload
    },
    [types.APP_DIRECTION](state, payload) {
      state.direction = payload
    },
    [types.APP_LOADING](state, payload) {
      state.loading = payload
    },
    [types.APP_LANG](state, payload) {
      state.lang = payload
    },
    [types.APP_ASIDE_CLOSE](state, payload) {
      state.collapse = payload
    }
  },
  getters: {
    loading(state) {
      return state.loading
    },
    direction(state) {
      return state.direction
    },
    lang(state) {
      return state.lang
    },
    collapse(state) {
      return state.collapse
    }
  }
}

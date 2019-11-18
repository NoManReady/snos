import Vuex from 'vuex'
import Vue from 'vue'

import app from './modules/app'
import authority from './modules/authority'
import system from './modules/system'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {},
  actions: {},
  mutations: {},
  modules: {
    app,
    authority,
    system
  }
})

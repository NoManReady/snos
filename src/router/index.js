import Vue from 'vue'
import Router from 'vue-router'
import { routes } from './common'
Vue.use(Router)

export default new Router({
  base: `${window.BASE_URI}/;stok=${window.stok || 'debug'}`, // base
  mode: 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

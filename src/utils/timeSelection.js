import Vue from 'vue'
import bus from '@/utils/bus'
import Instance from '@/common/TimeSelectionDialog'

let instance = null
let TimeSelectionConstructor = Vue.extend(Instance)

const TimeSelection = function (options) {
  if (!instance) {
    instance = new TimeSelectionConstructor({
      data: options,
      i18n:I18N
    })
    instance.vm = instance.$mount()
    document.body.appendChild(instance.vm.$el)
    instance.dom = instance.vm.$el
  }
  instance.vm.visible = true
  let _unwatch = instance.$watch(() => instance.vm.visible, (v) => {
    if (!v) {
      instance.dom.parentElement.removeChild(instance.dom)
      _unwatch()
      instance.$destroy()
      instance = null
    }
  })
  return new Promise((resolve, reject) => {
    bus.$on('time-selection-dialog-cancel', d => reject(d.params))
    bus.$on('time-selection-dialog-confirm', d => resolve(d.params))
  })
}

export default TimeSelection

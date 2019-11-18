import Vue from 'vue'
import Instance from '@/common/ModifyPassword'

let instance = null
let ModifyPasswordConstructor = Vue.extend(Instance)

const ModifyPassword = function (options) {
  if (instance) {
    instance.$destroy()
    instance = null
  }

  instance = new ModifyPasswordConstructor({
    data: options
  })
  instance.vm = instance.$mount()
  document.body.appendChild(instance.vm.$el)
  instance.dom = instance.vm.$el
  instance.vm.visible = true
  return instance.vm
}

ModifyPassword.close = function () {
  instance.vm.visible = true
  instance.$destroy()
  instance = null
}

export default ModifyPassword

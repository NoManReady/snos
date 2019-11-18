import Vue from 'vue'
import Instance from '@/views/egw/components/Steps'

let instance = null
let StepsConstructor = Vue.extend(Instance)

const Steps = function (options) {
  if (!instance) {
    instance = new StepsConstructor({
      data: options
    })
    instance.vm = instance.$mount()
    document.body.appendChild(instance.vm.$el)
    instance.dom = instance.vm.$el
  }
  instance.vm.visible = true
  return instance.vm
}

export default Steps

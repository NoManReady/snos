<script>
import First from '#/Wan'
import Wifi from '@/views/common/wireless/components/Wifi'
const _moduleMap = {
  network: First,
  wireless: Wifi
}
export default {
  functional: true,
  render(h, context) {
    let _step = context.props.module
    let _comp = _moduleMap[_step]
    return h(_comp, context.data, context.children)
  }
}
</script>

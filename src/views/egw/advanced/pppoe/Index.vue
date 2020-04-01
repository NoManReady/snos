<script>
import Global from './Global'
import Ippool from './Ippool'
import Manage from './Manage'
import Ipctrl from './Ipctrl'
import Userinfo from './Userinfo'
let _compMap = {
  '0': Global,
  '1': Ippool,
  '2': Manage,
  '3': Ipctrl,
  '4': Userinfo
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>

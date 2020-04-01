<script>
import pptpServer from './Server'
import Client from './Client'
import Tunnel from './Tunnel'
let _compMap = {
  '0': pptpServer,
  '1': Client,
  '2': Tunnel
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>

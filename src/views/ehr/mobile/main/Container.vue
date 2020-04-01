<script>
import MNetStatus from './MNetStatus'
// import MUser from './MUser'
// import MNetwork from './MNetwork'
// import MWifi from './MWifi'
import More from './More'
let _compMap = {
  '0': MNetStatus,
  // '1': MUser,
  // '2': MNetwork,
  // '3': MWifi,
  '4': More
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.idx
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>

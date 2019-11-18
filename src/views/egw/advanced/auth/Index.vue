<script>
import Macc from './Macc'
import Account from './Account'
import GuestAuth from './GuestAuth'
import GuestQrcode from './GuestQrcode'
import Whitelist from './Whitelist'
import AuthUser from './AuthUser'
let _compMap = {
  '0': Macc,
  '1': Account,
  '2': GuestAuth,
  '3': GuestQrcode,
  '4': Whitelist,
  '5': AuthUser
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>

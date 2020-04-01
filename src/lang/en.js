import { deCentralizationUmd } from '@/utils'

const en_common = deCentralizationUmd(require.context('@/lang/common/en', false, /\w+\.js/))
const en_device = deCentralizationUmd(require.context(`@/lang/${process.env.LANG_DIR}/en`, false, /\w+\.js/))

const lang = {
  ...en_common,
  [process.env.LANG_DIR]: {
    ...en_device
  }
}
if (process.env.LANG_DIR === 'ehr') {
  lang.egw = lang.ehr
}
export default lang

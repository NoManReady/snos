import { deCentralizationUmd } from '@/utils'
const zh_cn_common = deCentralizationUmd(require.context('@/lang/common/zh-cn', false, /\w+\.js/))
const zh_cn_device = deCentralizationUmd(require.context(`@/lang/${process.env.LANG_DIR}/zh-cn`, false, /\w+\.js/))

const lang = {
  ...zh_cn_common,
  [process.env.LANG_DIR]: {
    ...zh_cn_device
  }
}
if (process.env.LANG_DIR === 'ehr') {
  lang.egw = lang.ehr
}
export default lang
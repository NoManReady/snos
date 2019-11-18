import { deCentralization } from '@/utils'

const tips = deCentralization(require.context('./', true, /\.\/\w+\/\w+\.js/))
export default tips
<script>
// import MUser from './MUser'
import MNetwork from '../quick/MNetwork'
import MWifi from '../quick/MWifi'
import NotFound from '../NotFound'

export const menus = [
  {
    id: 'mQuick',
    icon: 'rjucd-rocket',
    name: '配置向导',
    tips: '凌晨升级/上网方式/无线/扫码',
    icon2: 'rjucd-sys'
  },
  {
    id: 'user',
    icon: 'rjucd-user',
    name: '终端管理',
    tips: '管理设备及无线/有线用户，终端数：',
    data: '3'
  },
  {
    id: 'wifi',
    // icon: 'rjucd-wifi',
    icon: 'rjucd-ap',
    name: '无线设置',
    tips: '配置所有设备的Wi-Fi',
    vue: MWifi
  },
  {
    id: 'network',
    icon: 'rjucd-network',
    name: '上网设置',
    tips: '联网方式：',
    data: '动态获取（DHCP)',
    vue: MNetwork
  },
  {
    id: 'devmode',
    icon: 'rjucd-gateway',
    name: '工作模式',
    vue: false
  },
  {
    id: 'clock',
    icon: 'el-icon-alarm-clock',
    name: '定时设置',
    tips: '定时重启/定时升级/定时开关无线'
  },
  {
    id: 'test',
    icon: 'rjucd-diagnosis',
    name: '一键优化',
    tips: '智能优化无线网络',
    icon3: 'el-icon-s-flag'
  },
  {
    id: 'led',
    icon: 'el-icon-s-opportunity',
    name: '指示灯',
    tips: '控制所有设备的指示灯',
    icon2: 'custom',
    icon3: 'switch'
  },
  {
    id: 'pcWeb',
    icon: 'rjucd-monitor',
    name: '高级管理',
    tips: '提供更多配置，推荐横屏查看哦～',
    icon2: 'rjucd-systemset'
  }
]
export default {
  functional: true,
  render(h, context) {
    const _menu = menus.find(m => m.id === context.props.id)

    return h((_menu && _menu.vue) || NotFound, context.data, context.children)
  }
}
</script>

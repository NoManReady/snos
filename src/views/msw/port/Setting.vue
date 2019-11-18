<template>
  <div class="port-setting">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import { Base, Phy } from './setting/index'
export default {
  name: 'port-setting',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: Object.freeze([
        {
          label: '基本配置',
          value: '0',
          comp: Base
        },
        {
          label: '物理配置',
          value: '1',
          comp: Phy
        }
        // {
        //   label: '端口保护',
        //   value: '2',
        //   comp: setting.Protect
        // }
      ])
    }
  }
}
</script>

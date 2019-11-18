<template>
  <div class="monitor-pdmanage">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import * as pdmanage from './pdmanage/index'
export default {
  name: 'monitor-pdmanage',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: Object.freeze([
        {
          label: 'MAC地址表',
          value: '0',
          comp: pdmanage.List
        },
        {
          label: '静态MAC地址',
          value: '1',
          comp: pdmanage.Static
        },
        {
          label: '动态MAC地址',
          value: '2',
          comp: pdmanage.Dynamic
        },
        {
          label: '过滤MAC地址',
          value: '3',
          comp: pdmanage.Filter
        },
        {
          label: 'MAC基础配置',
          value: '4',
          comp: pdmanage.Base
        },
        {
          label: 'ARP列表',
          value: '5',
          comp: pdmanage.Arpstatic
        }
      ])
    }
  }
}
</script>

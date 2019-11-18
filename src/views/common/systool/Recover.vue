<template>
  <div class="systool-recover">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import * as recover from './recover/index'
export default {
  name: 'systool-recover',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: Object.freeze([
        {
          label: '备份与导入',
          value: '0',
          comp: recover.BackupTab
        },
        {
          label: '恢复出厂',
          value: '1',
          comp: recover.RecoverTab
        }
      ])
    }
  }
}
</script>


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
      menus: [
        {
          label: I18N.t('systool.back_and_import'),
          value: '0',
          comp: recover.BackupTab
        },
        {
          label: I18N.t('systool.reset'),
          value: '1',
          comp: recover.RecoverTab
        }
      ]
    }
  },
  computed: {
    isEhr() {
      return this.$roles().includes('ehr')
    },
    tabs() {
      if (this.isEhr) {
        this.menus.push(
          {
            label: '整网重启/恢复',
            value: '2',
            comp: recover.ManagerTab
          },
          {
            label: 'LED灯设置',
            value: '3',
            comp: recover.LedTab
          }
        )
      }
      return this.menus
    }
  }
}
</script>


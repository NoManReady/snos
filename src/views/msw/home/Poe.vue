<template>
  <div class="home-poe">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import * as poe from './poe/index'
export default {
  name: 'home-poe',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: Object.freeze([
        {
          label: 'POE端口设置',
          value: '0',
          comp: poe.Port
        }
      ])
    }
  }
}
</script>

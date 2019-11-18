<template>
  <el-popover placement="bottom" ref="appPopover" trigger="hover" width="260">
    <div @click="onToAppUrl" class="pd10 pointer">
      <qrcode-vue :value="url" level="L" size="220"></qrcode-vue>
      <p class="tc mt10 c-info">扫码下载APP，全面享受易网络！</p>
      <ul class="ml20 tl qrcode-tip c-info">
        <li>整网配置，简单！</li>
        <li>远程管理，方便！</li>
        <li>故障诊断，智能！</li>
      </ul>
    </div>
    <slot slot="reference"></slot>
  </el-popover>
</template>
<script>
import QrcodeVue from 'qrcode.vue'
export default {
  name: 'Qrcode',
  data() {
    return {}
  },
  components: {
    QrcodeVue
  },
  created() {},
  computed: {
    sysinfo() {
      return this.$store.getters.sysinfo || {}
    },
    url() {
      if (Object.keys(this.sysinfo).length === 0) {
        return ''
      }
      return `http://rj.link/e?s=${this.sysinfo.serial_num}&d=${
        this.sysinfo.product_class
      }&m=${this.sysinfo.sys_mac.replace(/:/g, '')}&l=90`
    }
  },
  methods: {
    // 跳转到APP下载页
    onToAppUrl() {
      window.open(this.url, '_blank')
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

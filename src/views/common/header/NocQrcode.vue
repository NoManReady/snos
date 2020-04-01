<template>
  <el-popover placement="bottom" ref="appPopover" trigger="hover" width="320">
    <div class="pd10 tc">
      <strong>
        <span class="vm">{{ $t("header.has_noc_confirm") }}</span>
        <el-button @click="_onToNoc" class="vm" size="medium" type="text">{{ $t("header.enter_noc") }}</el-button>
      </strong>
      <strong class="vm mt10 mb20">{{ $t("header.scan_enter_noc_f") }}</strong>
      <qrcode-vue :value="nocUrl" level="L" size="180"></qrcode-vue>
      <label class="c-info w200 mt10 vm">{{ $t("header.weixin_manage") }}</label>
    </div>
    <slot slot="reference"></slot>
  </el-popover>
</template>
<script>
import QrcodeVue from 'qrcode.vue'
import NocMixins from '@/mixins/NocMixins'
export default {
  name: 'NocQrcode',
  components: {
    QrcodeVue
  },
  mixins: [NocMixins],
  methods: {
    // 跳转到诺客登录页
    _onToNoc() {
      let _url =
        this.$store.getters.lang === 'en'
          ? 'https://cloud.ruijienetworks.com/'
          : 'https://noc.ruijie.com.cn/sso/login'
      window.open(_url, '_blank')
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

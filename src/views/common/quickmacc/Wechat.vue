<template>
  <div class="wechat tc">
    <strong class="fs20">{{ $t("quickmacc.scan_complete") }}</strong>
    <p class="mtb20" type="primary" v-if="isEhr">微信扫码，使用小程序管理网络</p>
    <p class="mtb20" type="primary" v-else>{{ $t("quickmacc.scan_and_macc") }}</p>
    <qrcode-vue :value="url" level="L" size="200"></qrcode-vue>
    <el-button @click="onComplete" class="mt20" type="primary">{{ $t("quickmacc.goto_eweb") }}</el-button>
  </div>
</template>
<script>
import QrcodeVue from 'qrcode.vue'
import NocMixins from '@/mixins/NocMixins'
export default {
  name: 'Wechat',
  props: {
    pwd: {
      type: String,
      require: true
    }
  },
  components: {
    QrcodeVue
  },
  computed: {
    isEhr() {
      return this.$roles().includes('ehr')
    },
    url() {
      if (this.isEhr) {
        return this.ehrUrl
      }
      return this.nocUrl
    }
  },
  mixins: [NocMixins],
  methods: {
    onComplete() {
      // 返回eweb首页
      this.$emit('toHomepage')
    }
  }
}
</script>
<style lang="scss">
.wechat {
  width: 300px;
  margin: 0 auto;
}
</style>

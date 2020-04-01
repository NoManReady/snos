<template>
  <el-popover placement="bottom" ref="appPopover" trigger="hover" width="280">
    <div @click="onToAppUrl" class="pd10 pointer tc">
      <qrcode-vue :value="url" level="L" size="180"></qrcode-vue>
      <p class="tc mt10 c-info">{{ $t("header.app_tip") }}</p>
      <ul class="ml50 tl qrcode-tip c-info">
        <li>{{ $t("header.app_easy") }}</li>
        <li>{{ $t("header.app_convenient") }}</li>
        <li>{{ $t("header.app_intelligent") }}</li>
      </ul>
    </div>
    <slot slot="reference"></slot>
  </el-popover>
</template>
<script>
import QrcodeVue from "qrcode.vue";
export default {
  name: "Qrcode",
  data() {
    return {};
  },
  components: {
    QrcodeVue
  },
  created() {},
  computed: {
    sysinfo() {
      return this.$store.getters.sysinfo || {};
    },
    url() {
      if (Object.keys(this.sysinfo).length === 0) {
        return "";
      }
      return `http://rj.link/e?s=${this.sysinfo.serial_num}&d=${
        this.sysinfo.product_class
      }&m=${this.sysinfo.sys_mac.replace(/:/g, "")}&l=90`;
    }
  },
  methods: {
    // 跳转到APP下载页
    onToAppUrl() {
      window.open(this.url, "_blank");
    }
  }
};
</script>
<style lang="scss" scoped>
.qrcode-tip li {
  margin-top: 5px;
  list-style: disc;
}
</style>

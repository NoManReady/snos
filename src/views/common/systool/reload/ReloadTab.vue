<template>
  <div class="system-reload">
    <help-alert json-key="reloadJson" :title="$t('systool.reboot')">
      <div slot="content">{{ $t("systool.reboot_tip") }}</div>
      <div slot="collapseFoot">
        <h3>{{$t('phrase.notice')}}</h3>
        <p>{{ $t("systool.reboot_tip") }}</p>
      </div>
    </help-alert>
    <el-button
      @click.native="onReload"
      class="w160"
      size="medium"
      type="primary"
      >{{ $t("systool.reboot_sys") }}</el-button
    >
  </div>
</template>
<script>
import { awaitOnLine } from "@/utils";
export default {
  name: "SystemReload",
  data() {
    return {};
  },
  methods: {
    // 重启操作
    onReload() {
      this.$confirm(I18N.t("systool.reboot_confirm"), {
        confirmButtonText: I18N.t("action.confirm"),
        cancelButtonText: I18N.t("action.cancel"),
        type: "warning"
      }).then(() => {
        this.$api.reboot().then(d => {
          awaitOnLine(30000, I18N.t("systool.dev_rebooting")).then(() => {
            window.top.location.reload();
          });
        });
      });
    }
  }
};
</script>
<style lang="scss" scoped></style>

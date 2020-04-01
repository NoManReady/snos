<template>
  <!-- <el-button-group> -->
  <el-button
    @click.native="_onReload"
    icon="rjucd-reload fs18 vm"
    plain
    round
    size="small"
    type="primary"
  >
    <span class="pl5 fs14 vm">{{ $t("devtool.reboot") }}</span>
  </el-button>
  <!-- <el-button @click.native="_onReset" plain size="mini" type="danger">恢复出厂配置</el-button> -->
  <!-- </el-button-group> -->
</template>
<script>
// import { ButtonGroup } from 'element-ui'
import { awaitOnLine_plus } from "@/utils";
export default {
  name: "device-tool",
  // components: {
  //   [ButtonGroup.name]: ButtonGroup
  // },
  data() {
    return {};
  },
  methods: {
    async _onReload() {
      try {
        await this.$confirm(I18N.t("devtool.reboot_confirm"), {
          confirmButtonText: I18N.t("action.confirm"),
          cancelButtonText: I18N.t("action.cancel"),
          type: "warning"
        });
        await this.$api.reboot();
        await awaitOnLine_plus({
          time: 30000,
          text: I18N.t("devtool.rebooting")
        });
        this.$alert(I18N.t("devtool.reboot_success"), I18N.t("phrase.tip"), {
          confirmButtonText: I18N.t("devtool.refresh_page"),
          callback: action => {
            window.top.location.reload();
          }
        });
      } catch (error) {}
    },
    async _onReset() {
      try {
        await this.$confirm(
          I18N.t("devtool.reset_confirm"),
          I18N.t("phrase.tip"),
          {
            confirmButtonText: I18N.t("action.confirm"),
            cancelButtonText: I18N.t("action.cancel"),
            type: "warning"
          }
        );
        await this.$api.system("restoreConfiguration");
        await awaitOnLine_plus({ text: I18N.t("devtool.rebooting") });
        window.top.location.reload();
      } catch (error) {}
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

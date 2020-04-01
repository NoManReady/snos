<template>
  <div class="recover-tab">
    <help-alert json-key="recoverJson" :title="$t('systool.reset_cfg')">
      <div slot="content">
        <i18n path="systool.reset_tip_f" tag="p">
          <a
            @click="onBackup"
            class="c-success pointer"
            href="javascript:void();"
            >{{ $t("systool.export_cur_cfg") }}</a
          >
        </i18n>
      </div>
    </help-alert>
    <el-button
      @click.native="onRecover"
      class="w160"
      size="medium"
      type="primary"
      >{{ $t("systool.reset_cfg") }}</el-button
    >
  </div>
</template>
<script>
import { awaitOnLine } from "@/utils";
import { formSubmit } from "@/utils/utils";
export default {
  name: "RecoverTab",
  data() {
    return {
      loading: false,
      allConf: "",
      searchConfig: "",
      loadingText: I18N.t("systool.dev_rebooting")
    };
  },
  methods: {
    // 生成备份
    onBackup() {
      let _backupUrl = `${process.env.PROXY}${window.BASE_URI ||
        process.env.BASE_PATH}/api/download?auth=${window.Cookie.get(
        window.sn
      )}`;
      formSubmit(_backupUrl, { method: "backupConfig" });
    },
    // 恢复出厂配置
    onRecover() {
      this.$confirm(I18N.t("systool.reset_confirm"), I18N.t("phrase.tip"), {
        confirmButtonText: I18N.t("action.confirm"),
        cancelButtonText: I18N.t("action.cancel"),
        type: "warning"
      }).then(() => {
        this.$api.system("restoreConfiguration").then(d => {
          awaitOnLine(20000, I18N.t("systool.reset_and_reboot")).then(() => {
            window.location.reload();
          });
        });
      });
    },
    // 查看当前配置
    onViewConf(isClear) {
      this.searchConfig = this.searchConfig.trim();
      isClear && (this.searchConfig = "");
      this.$api.common("allConf", { search: this.searchConfig }).then(d => {
        this.allConf = d.conf;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.el-input {
  width: 200px;
}
</style>

<template>
  <div class="diagnose-tech">
    <help-alert :title="$t('diagnose.tech_collect')">
      <div slot="content">{{ $t("diagnose.tech_collect_tip") }}</div>
    </help-alert>
    <el-button
      @click.native="onCollect"
      class="w160"
      size="medium"
      type="primary"
      >{{ $t("diagnose.one_collect") }}</el-button
    >
  </div>
</template>
<script>
import { formSubmit } from "@/utils/utils";
export default {
  name: "DiagnoseTech",
  data() {
    return {};
  },
  methods: {
    // 收集操作
    onCollect() {
      let _backupUrl = `${process.env.PROXY}${window.BASE_URI ||
        process.env.BASE_PATH}/api/download?auth=${window.Cookie.get(
        window.sn
      )}`;
      formSubmit(_backupUrl, { method: "techSupport" });
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

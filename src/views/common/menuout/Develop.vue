<template>
  <div class="diagnose-develop">
    <el-form
      :model="baseModel"
      label-width="120px"
      size="medium"
      v-show="baseModel.developMode === '1'"
    >
      <el-form-item :label="$t('header.dev_mode')">
        <el-switch
          active-value="1"
          inactive-value="0"
          v-model="baseModel.developMode"
        ></el-switch>
        <span class="c-warning">{{ $t("header.dev_mode_open_tip") }}</span>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "MenuoutDevelop",
  data() {
    return {
      baseModel: { developMode: "0" }
    };
  },
  created() {
    this._loadData();
  },
  watch: {
    "baseModel.developMode"(v, o) {
      if (v === "0") {
        this.baseModel.developMode = "0";
        this.onSubmit();
      }
    }
  },
  methods: {
    onShowDevelop() {
      if (this.baseModel.developMode === "0") {
        this.$confirm(
          `${I18N.t("header.dev_mode_tip")}
        <ol class="ml20 ol-num">
          <li class="mt5 c-warning">${I18N.t("header.dev_mode_warn1")}</li>
          <li class="mt5">${I18N.t("header.dev_mode_warn2")}</li>
        </ol>`,
          I18N.t("header.enable_dev_mode"),
          {
            showClose: false,
            dangerouslyUseHTMLString: true,
            cancelButtonText: I18N.t("action.cancel"),
            confirmButtonText: I18N.t("action.confirm"),
            closeOnClickModal: false
          }
        ).then(
          _ => {
            this.baseModel.developMode = "1";
            this.showDevelop = true;
            this.onSubmit();
          },
          _ => {
            this.$emit("cancel");
          }
        );
      } else {
        this.$alert(I18N.t("header.dev_mode_ok"));
      }
    },
    async _loadData() {
      let _res = await this.$api.cmd("devSta.get", {
        module: "develop_mode"
      });
      this.baseModel.developMode = _res.developMode || "0";
    },
    async onSubmit() {
      let _res = await this.$api.cmd("devSta.set", {
        module: "develop_mode",
        data: this.baseModel
      });
      if (_res.result === "success") {
        this.$message.success(
          I18N.t("header.dev_mode_status", {
            status:
              this.baseModel.developMode === "1"
                ? I18N.t("phrase.enable")
                : I18N.t("phrase.disable")
          })
        );
      } else {
        this.$message.error(
          `${I18N.t("header.dev_mode_fail_f")}${_res.result ||
            I18N.t("phrase.unknow")}`
        );
      }
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

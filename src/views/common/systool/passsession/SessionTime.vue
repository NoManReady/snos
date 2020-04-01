<template>
  <div class="session-tab">
    <help-alert
      json-key="sessionJson"
      :title="$t('systool.session_time')"
    ></help-alert>
    <el-form
      :model="baseModel"
      :rules="baseRules"
      class="w500"
      label-width="160px"
      ref="baseForm"
      size="medium"
    >
      <el-form-item :label="$t('systool.session_timeout')" prop="sessiontime">
        <el-input type="text" v-model="baseModel.sessiontime"></el-input>
        <span class="web-form--tip">{{ $t("time.second") }}</span>
      </el-form-item>
      <el-form-item>
        <el-button
          :loading="isLoading"
          @click.native="onSubmit"
          class="w160"
          type="primary"
          >{{ $t("action.save") }}</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { intValidator } from "@/utils/rules";
export default {
  name: "SessionTime",
  data() {
    const sessionBetween = (rule, value, cb) => {
      let _value = +value || 0;
      if (_value < 600 || _value > 7200) {
        cb(new Error(rule.message));
      } else {
        cb();
      }
    };
    return {
      isLoading: false,
      baseModel: {
        sessiontime: ""
      },
      baseRules: {
        sessiontime: [
          {
            required: true,
            message: I18N.t("systool.session_no_empty")
          },
          { validator: intValidator, message: I18N.t("rules.require_int") },
          {
            validator: sessionBetween,
            message: I18N.t("systool.session_range")
          }
        ]
      }
    };
  },
  created() {
    this.getSessionTime();
  },
  methods: {
    // 加载sessionTime
    getSessionTime() {
      this.$api.getSessiontime().then(sessiontime => {
        this.baseModel.sessiontime = sessiontime;
      });
    },
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isLoading = true;
          this.$api
            .setSessionTime(this.baseModel.sessiontime)
            .then(d => {
              this.$message({
                type: "success",
                message: I18N.t("tip.edit_success"),
                duration: 2000
              });
            })
            .finally(() => {
              this.isLoading = false;
            });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped></style>

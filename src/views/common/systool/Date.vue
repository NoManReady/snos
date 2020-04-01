<template>
  <div class="system-date">
    <help-alert json-key="dateJson" :title="$t('systool.date_cfg')">
      <div slot="content">
        {{$t('systool.date_view_cfg')}}
        <span class="c-warning">{{$t('systool.date_cfg_tip')}}</span>
      </div>
    </help-alert>
    <el-form
      :model="baseModel"
      :rules="baseRules"
      class="w550"
      label-width="160px"
      ref="baseForm"
      size="medium"
    >
      <el-form-item :label="$t('systool.cur_time')" prop="time">
        <span v-show="baseModel.time">{{baseModel.time|formatDay}}</span>
      </el-form-item>
      <el-form-item :label="$t('systool.set_time')" prop="timeType">
        <el-radio-group v-model="baseModel.timeType">
          <el-radio label="auto">{{$t('systool.time_by_internet')}}</el-radio>
          <el-radio label="self">{{$t('systool.time_by_manual')}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="$t('systool.date')"
        prop="selfTime"
        v-show="baseModel.timeType==='self'"
      >
        <el-date-picker
          :placeholder="$t('systool.select_date')"
          type="datetime"
          v-model="baseModel.selfTime"
        ></el-date-picker>
        <el-button
          @click.native="getPcTime"
          class="ml10"
          plain
          size="medium"
          type="primary"
        >{{$t('systool.get_host_time')}}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          :loading="asyncLoading"
          class="w160"
          type="primary"
          v-auth="onSetTime"
        >{{$t('action.save')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import timer from "@/utils/timer";
import { formatDay } from "@/filters/time";
import { DatePicker } from "element-ui";
export default {
  name: "SystemDate",
  data() {
    const selfValidator = (rule, value, cb) => {
      if (this.baseModel.timeType === "self" && !value) {
        cb(new Error(rule.message));
      }
      cb();
    };
    return {
      asyncLoading: false,
      baseModel: {
        time: "",
        timeType: "auto",
        selfTime: ""
      },
      baseRules: {
        selfTime: [
          { validator: selfValidator, message: I18N.t("systool.date_no_empty") }
        ]
      }
    };
  },
  mounted() {
    this.onAsyncTime();
  },
  beforeDestroy() {
    timer.clean();
  },
  components: {
    [DatePicker.name]: DatePicker
  },
  filters: {
    formatDay
  },
  methods: {
    // 同步当前pc时间
    getPcTime() {
      this.baseModel.selfTime = new Date();
    },
    // 保存同步时间
    onSetTime() {
      let _date = new Date().getTime();
      this.asyncLoading = true;
      if (this.baseModel.timeType === "self") {
        _date = new Date(this.baseModel.selfTime || null).getTime();
      }
      _date = parseInt(_date / 1000);
      let _jsx = <p class="c-danger">{I18N.t("systool.date_cfg_confirm")}</p>;
      this.$msgbox({
        dangerouslyUseHTMLString: true,
        message: _jsx,
        showCancelButton: true,
        title: I18N.t("phrase.tip")
      }).then(
        () => {
          this.$api.setSysTime({ time: _date, force: "true" }).then(
            () => {
              this.$message.success(I18N.t("tip.edit1_success"));
              setTimeout(() => {
                this.asyncLoading = false;
                this.onAsyncTime();
              }, 1000);
            },
            () => {
              this.asyncLoading = false;
            }
          );
        },
        () => {
          this.asyncLoading = false;
        }
      );
    },
    // 同步时间
    onAsyncTime(type) {
      timer.clean();
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$api.asyncTime().then(d => {
            this.baseModel.time = d * 1000;
            timer.setInterval(() => {
              this.baseModel.time += 1000;
            }, 1000);
          });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

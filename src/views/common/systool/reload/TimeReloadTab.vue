<template>
  <div class="system-time-reload">
    <help-alert json-key="autoRreloadJson" :title="$t('systool.reboot_time')">
      <div slot="content">
        <div>{{ $t("systool.time_reboot_tip") }}</div>
        <div class="mt5" v-if="!$roles().includes('alone')">
          {{ $t("systool.time_reboot_pd") }}
        </div>
      </div>
      <div slot="collapseFoot">
        <h3>{{ $t("phrase.notice_f") }}</h3>
        <p>{{ $t("systool.time_reboot_help") }}</p>
      </div>
    </help-alert>
    <el-form label-width="160px" ref="baseForm" size="medium">
      <el-form-item :label="$t('systool.reboot_function')">
        <el-switch
          active-value="1"
          inactive-value="0"
          v-model="enable"
        ></el-switch>
      </el-form-item>
      <template v-if="enable === '1'">
        <el-form-item :label="$t('systool.week')" prop="week">
          <el-checkbox-group v-model="week">
            <el-checkbox
              :key="index"
              :label="key"
              v-for="(value, key, index) in weekMap"
              >{{ value }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('systool.date')">
          <el-select class="w100" v-model="time[0]">
            <el-option
              :key="hour"
              :label="(hour - 1) | formatNum"
              :value="(hour - 1) | formatNum"
              v-for="hour in 24"
            ></el-option>
          </el-select>
          <b class="mlr5">:</b>
          <el-select class="w100" v-model="time[1]">
            <el-option
              :key="min"
              :label="(min - 1) | formatNum"
              :value="(min - 1) | formatNum"
              v-for="min in 60"
            ></el-option>
          </el-select>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button class="w160" type="primary" v-auth="onSave">{{
          $t("action.save")
        }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { TimePicker } from "element-ui";
import { awaitOnLine } from "@/utils";
const WEEKMAP = {
  mon: I18N.t("systool.weekday[0]"),
  tue: I18N.t("systool.weekday[1]"),
  wed: I18N.t("systool.weekday[2]"),
  thu: I18N.t("systool.weekday[3]"),
  fri: I18N.t("systool.weekday[4]"),
  sat: I18N.t("systool.weekday[5]"),
  sun: I18N.t("systool.weekday[6]")
};
export default {
  name: "SystemTimeReload",
  data() {
    return {
      enable: "0",
      week: [],
      time: ["00", "00"],
      orginData: {},
      weekMap: WEEKMAP
    };
  },
  filters: {
    formatNum(v) {
      return v.toString().padStart(2, 0);
    }
  },
  computed: {},
  components: {
    [TimePicker.name]: TimePicker
  },
  created() {
    this._initPage();
  },
  methods: {
    async _initPage() {
      let _d = await this.$api.getTimeReboot();
      this.orginData = _d;
      this.enable = _d.enable || "0";
      this.week = Object.keys(_d.time || {});
      if (this.week.length > 0) {
        let _every_day = _d.time[this.week[0]][0][0];
        this.time = _every_day.split(":");
      }
    },
    onSave() {
      if (this.enable === "1" && this.week.length === 0) {
        this.$alert(I18N.t("systool.select_week"), { type: "warning" });
        return;
      }
      let _time = {};
      let _t = [...this.time];
      let _st = _t.join(":");
      _t[1] = (+_t[1] + 1).toString().padStart(2, 0);
      let _et = _t.join(":");
      let _tRange = [_st, _et];
      this.week.forEach(day => {
        _time[day] = [_tRange];
      });
      this.orginData.time = _time;
      Object.assign(this.orginData, {
        enable: this.enable,
        time: _time
      });
      this.$api.setTimeReboot(this.orginData);
      this.$message({
        type: "success",
        message: I18N.t("tip.edit1_success")
      });
    }
  }
};
</script>
<style lang="scss" scoped></style>

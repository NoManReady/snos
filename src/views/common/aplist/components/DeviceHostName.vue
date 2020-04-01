<template>
  <div class="device-hostname">
    <el-input ref="hostNameInput" size="mini" v-model="value"></el-input>
    <el-button @click="onSave()" size="mini" type="text">{{
      $t("action.save")
    }}</el-button>
    <el-button @click="$emit('cancel')" size="mini" type="text">{{
      $t("action.cancel")
    }}</el-button>
  </div>
</template>
<script>
import { hostnameRegexp, lengthValidate } from "@/utils/rulesUtils";
export default {
  name: "DeviceHostname",
  props: {
    row: {
      default: {},
      type: Object
    },
    maxLen: {
      default: 64,
      type: Number
    }
  },
  data() {
    return {
      value: "",
      sn: ""
    };
  },
  created() {
    this.value = this.row.hostName;
    this.sn = this.row.serialNumber;
  },
  methods: {
    onSave() {
      if (!hostnameRegexp.test(this.value)) {
        return this.message(I18N.t("devlist.hostname_rule"));
      } else if (!lengthValidate(this.value, 0, this.maxLen)) {
        return this.message(
          I18N.t("devlist.hostname_len_rule", { len: this.maxLen })
        );
      }
      this.$emit("save", this.row, {
        name: this.value,
        sn: [this.sn]
      });
    },
    message(text) {
      this.$message({
        message: text,
        type: "warning"
      });
    }
  }
};
</script>
<style lang="scss">
</style>

<template>
  <div class="gateway-nbr">
    <help-alert :title="$t('nbr.gateway_info')"></help-alert>
    <el-form :model="egInfo" class="w500" label-width="160px" size="small">
      <el-form-item :label="$t('sysinfo.dev_type_f')">
        <span>{{ egInfo.deviceType }}</span>
      </el-form-item>
      <el-form-item :label="$t('wan.ip_addr_f')">
        <el-button @click="_onToGw" size="medium" type="text">{{
          egInfo.ip
        }}</el-button>
      </el-form-item>
      <el-form-item :label="$t('sysinfo.sn_num_f')">
        <span>{{ egInfo.devSN }}</span>
      </el-form-item>
      <el-form-item :label="$t('wan.mac_addr_f')">
        <span>{{ egInfo.devMac }}</span>
      </el-form-item>
      <el-form-item :label="$t('sysinfo.soft_version_f')">
        <span>{{ egInfo.software }}</span>
      </el-form-item>
      <el-form-item>
        <el-button @click="_onToGw" class="w160" size="medium" type="primary">{{
          $t("nbr.gateway_manage")
        }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "Nbr",
  data() {
    return {
      egInfo: {
        deviceType: "",
        ip: "",
        devSN: "",
        devMac: "",
        software: ""
      }
    };
  },
  created() {
    this._loadData();
  },
  methods: {
    async _loadData() {
      let _res = await this.$api.cmd("devSta.get", {
        module: "neighbor",
        data: {
          product: "GW_RGOS"
        }
      });
      this.egInfo = (_res.neighbor && _res.neighbor[0]) || {};
    },
    _onToGw() {
      window.open(`http://${this.egInfo.ip}`, "_blank"); // 使用http访问，nbr会重定向
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

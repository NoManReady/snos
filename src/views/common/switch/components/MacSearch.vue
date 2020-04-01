<template>
  <div class="switch-macsearch">
    <el-form :model="baseModel" :rules="baseRules" label-width="100px" ref="baseForm" size="mini">
      <el-row :gutter="0">
        <el-col :span="10">
          <el-form-item :label="$t('sysinfo.mac_addr')" prop="mac">
            <el-input
              :title="baseModel.mac"
              class="vm w150"
              placeholder="00:00:00:00:00:00"
              v-model="baseModel.mac"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="10" v-if="vmode==='1'">
          <el-form-item label="VLAN ID" prop="vlan">
            <el-input
              :title="baseModel.vlan"
              class="vm w120"
              placeholder="1-4094"
              v-model="baseModel.vlan"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-button
            :loading="isLoading"
            @click.native="_onSearch"
            class="ml10"
            size="mini"
            style="margin-top:2px;"
            type="primary"
          >{{isLoading?$t('phrase.searching'):$t('phrase.search')}}</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-table
      :data="macList"
      :max-height="200"
      align="center"
      border
      header-align="center"
      ref="vlanTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" :label="$t('sysinfo.mac_addr')" prop="mac"></el-table-column>
      <el-table-column align="center" label="VLAN ID" prop="vid" v-if="vmode==='1'" width="100"></el-table-column>
      <el-table-column align="center" :label="$t('phrase.type')" prop="type" width="100"></el-table-column>
      <el-table-column align="center" :label="$t('esw.port')" prop="port" width="100"></el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col } from "element-ui";
import { macValidator } from "@/utils/rules";
import { isBetween, intValidate } from "@/utils/rulesUtils";
import { mapGetters } from "vuex";
export default {
  name: "switch-macsearch",
  components: {
    [Row.name]: Row,
    [Col.name]: Col
  },
  data() {
    const vlanValidate = (r, v, cb) => {
      if (!v) {
        cb();
      }
      if (!intValidate(v)) return cb(new Error(I18N.t("esw.base.require_int")));
      if (!isBetween(v, 1, 4094))
        return cb(new Error(I18N.t("esw.vlan_range")));
      cb();
    };
    return {
      macList: [],
      isLoading: false,
      baseModel: {
        mac: "",
        vlan: ""
      },
      baseRules: {
        vlan: [{ validator: vlanValidate }]
      }
    };
  },
  mounted() {
    this._onSearch();
  },
  computed: {
    ...mapGetters("switch", ["item", "vmode"])
  },
  methods: {
    // 添加MAC
    _onSearch() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let _postData = {
            vlan: this.baseModel.vlan,
            mac: this.baseModel.mac.toUpperCase()
          };
          if (this.vmode === "0") {
            delete _postData.vlan;
          }
          this.isLoading = true;
          try {
            let _result = await this.$api.switchApi(
              "doSwitchApi",
              {
                ip: this.item.ip,
                sn: this.item.devSN,
                method: "post",
                data: _postData,
                url: "mac.cgi?cmd=search"
              },
              {
                isSilence: true
              }
            );
            this.macList = _result;
            this.$refs.baseForm.resetFields();
          } catch (error) {}
          this.isLoading = false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.switch-macsearch {
  min-height: 200px;
}
</style>

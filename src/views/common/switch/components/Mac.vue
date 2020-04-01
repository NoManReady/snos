<template>
  <div class="switch-mac" v-loading="isLoading">
    <el-form :model="baseModel" :rules="baseRules" label-width="100px" ref="baseForm" size="mini">
      <el-row :gutter="0">
        <el-col :span="12">
          <el-form-item :label="$t('sysinfo.mac_addr')" prop="mac">
            <el-input
              :title="baseModel.mac"
              class="vm w150"
              placeholder="00:00:00:00:00:00"
              v-model="baseModel.mac"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="VLAN ID" prop="vlan" v-if="vmode==='1'">
            <el-input
              :title="baseModel.vlan"
              class="vm w120"
              placeholder="1-4094"
              v-model="baseModel.vlan"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('esw.port')" prop="src">
            <el-select class="w150" v-model="baseModel.src">
              <el-option
                :key="port.id"
                :label="port.label"
                :value="port.id"
                v-for="port in easyPortList"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button @click.native="_onSubmit" type="primary">{{$t('action.save_edit')}}</el-button>
      </el-form-item>
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
      <el-table-column align="center" :label="$t('phrase.serial')" width="80">
        <template slot-scope="{$index}">{{$index+1}}</template>
      </el-table-column>
      <el-table-column align="center" :label="$t('esw.port')" prop="port" width="100">
        <template slot-scope="{row}">{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column align="center" :label="$t('sysinfo.mac_addr')" prop="mac"></el-table-column>
      <el-table-column align="center" label="VLAN ID" prop="vid" v-if="vmode==='1'" width="100"></el-table-column>
      <el-table-column align="center" :label="$t('action.ope')" width="80">
        <template slot-scope="{row}">
          <el-button @click.native="_onDelMac([row])" size="mini" type="text">
            <small>{{$t('action.delete')}}</small>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col } from "element-ui";
import { macValidator } from "@/utils/rules";
import { isBetween, intValidate } from "@/utils/rulesUtils";
import Treeselect from "@riophae/vue-treeselect";
import { mapGetters } from "vuex";
export default {
  name: "switch-mac",
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    Treeselect
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
    const macCheckValidate = (r, v, cb) => {
      if (!v) {
        cb();
      }
      if (v === "00:00:00:00:00:00")
        return cb(new Error(I18N.t("wan.invalid_mac_addr")));
      if (/[0-9a-f]1(:[0-9a-f]{2}){5}/.test(v))
        return cb(new Error(I18N.t("esw.mac.no_group_mac")));
      cb();
    };
    return {
      macList: [],
      baseModel: {
        mac: "00:00:00:00:00:00",
        vlan: "",
        src: 0
      },
      baseRules: {
        mac: [
          { required: true, message: I18N.t("wan.mac_no_empty") },
          { validator: macValidator, message: I18N.t("wan.invalid_mac_addr") },
          { validator: macCheckValidate }
        ],
        vlan: [
          { required: true, message: I18N.t("wan.vid_no_empty") },
          { validator: vlanValidate }
        ]
      },
      isLoading: false
    };
  },
  created() {
    this._load();
  },
  computed: {
    ...mapGetters("switch", ["item", "easyPortList", "vmode"])
  },
  methods: {
    // 加载MAC列表
    async _load() {
      this.isLoading = true;
      let _result = await this.$api.switchApi(
        "doSwitchApi",
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: "get",
          url: "rest_get_static_mac.cgi"
        },
        { isSilence: true }
      );
      this.isLoading = false;
      this.macList = _result;
    },
    // 删除MAC
    async _onDelMac(items) {
      let data = { del: items.map(item => `${item.mac}_${item.vid}`) };
      await this.$api.switchApi("doSwitchApi", {
        ip: this.item.ip,
        sn: this.item.devSN,
        method: "post",
        url: "mac.cgi?cmd=staticdel",
        data
      });
      this.$message({
        type: "success",
        message: I18N.t("tip.del_success")
      });
      this._load();
    },
    // 添加MAC
    _onSubmit() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let _postData = {
            ...this.baseModel
          };
          if (this.vmode === "0") {
            delete _postData.vlan;
          }
          await this.$api.switchApi("doSwitchApi", {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "post",
            data: _postData,
            url: "mac.cgi?cmd=static"
          });
          this.$refs.baseForm.resetFields();
          this.$message({
            type: "success",
            message: I18N.t("tip.add_success")
          });
          this._load();
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.switch-mac {
  min-height: 200px;
}
</style>

<template>
  <div class="switch-portsetting" v-loading="isLoading">
    <el-form
      :model="baseModel"
      :rules="baseRules"
      class="mb10"
      label-width="80px"
      ref="baseForm"
      size="mini"
    >
      <el-row :gutter="0">
        <el-col :span="12">
          <el-form-item :label="$t('esw.port')" prop="portid">
            <treeselect
              :default-expand-level="1"
              :max-height="250"
              :multiple="true"
              :options="portTreeList"
              @click.native="_onTreeSelectClick"
              class="w170"
              :placeholder="$t('esw.select')"
              v-model="baseModel.portid"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('phrase.status')" prop="state">
            <el-select class="w100" v-model="baseModel.state">
              <el-option :label="$t('phrase.disable')" value="0"></el-option>
              <el-option :label="$t('phrase.enable')" value="1"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="12">
          <el-form-item :label="$t('esw.base.dup_speed')" prop="speed_duplex">
            <el-select class="w170" ref="speedRef" v-model="baseModel.speed_duplex">
              <el-option :label="$t('esw.base.auto_do')" value="0"></el-option>
              <el-option
                :disabled="selectHasFiber"
                :label="`10M/${$t('esw.base.dup_half')}`"
                value="1"
              ></el-option>
              <el-option
                :disabled="selectHasFiber"
                :label="`10M/${$t('esw.base.dup_full')}`"
                value="2"
              ></el-option>
              <el-option
                :disabled="selectHasFiber"
                :label="`100M/${$t('esw.base.dup_half')}`"
                value="3"
              ></el-option>
              <el-option
                :disabled="selectHasFiber"
                :label="`100M/${$t('esw.base.dup_full')}`"
                value="4"
              ></el-option>
              <el-option
                :disabled="dev_9cIsDisabled"
                :label="`1000M/${$t('esw.base.dup_full')}`"
                v-if="hasGillionPort"
                value="5"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('esw.base.flow_ctrl')" prop="flow">
            <el-select class="w100" v-model="baseModel.flow">
              <el-option :label="$t('phrase.close')" value="0"></el-option>
              <el-option :label="$t('phrase.open')" value="1"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="tc">
        <el-button @click.native="_onSubmit" size="mini" type="primary">{{$t('action.save_edit')}}</el-button>
        <el-button @click.native="_refresh" size="mini" type="primary">{{$t('action.refresh')}}</el-button>
      </div>
    </el-form>
    <el-table
      :data="portinfo"
      :max-height="250"
      align="center"
      border
      header-align="center"
      ref="vlanTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" :label="$t('esw.port')" width="80">
        <template slot-scope="{row}">{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column align="center" :label="$t('phrase.status')" width="60">
        <template slot-scope="{row}">
          <span class="c-info" v-if="row.enable===0">{{$t('phrase.disable')}}</span>
          <span class="c-success" v-else>{{$t('phrase.enable')}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('esw.base.dup_speed')">
        <el-table-column align="center" :label="$t('esw.base.cfg_status')">
          <template slot-scope="{row}">
            <span>{{dupMap[row.dup_c]}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('esw.base.actual_status')">
          <template slot-scope="{row}">
            <span class="c-info" v-if="row.dup_r===0">{{dupMap[row.dup_r]}}</span>
            <span class="c-success" v-else>{{dupMap[row.dup_r]}}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column align="center" :label="$t('esw.base.flow_ctrl')">
        <el-table-column align="center" :label="$t('esw.base.cfg_status')" width="70">
          <template slot-scope="{row}">
            <span>{{row.fc_c===0?$t('phrase.disable'):$t('phrase.enable')}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('esw.base.actual_status')" width="70">
          <template slot-scope="{row}">
            <span class="c-info" v-if="row.fc_r===0">{{$t('phrase.disable')}}</span>
            <span class="c-success" v-else>{{$t('phrase.enable')}}</span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col } from "element-ui";
import Treeselect from "@riophae/vue-treeselect";
import { sleep } from "@/utils";
import { mapGetters } from "vuex";
export default {
  name: "switch-portsetting",
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    Treeselect
  },
  data() {
    return {
      dupMap: Object.freeze({
        0: I18N.t("esw.base.open"),
        1: `10M/${I18N.t("esw.base.dup_half")}`,
        2: `10M/${I18N.t("esw.base.dup_full")}`,
        3: `100M/${I18N.t("esw.base.dup_half")}`,
        4: `100M/${I18N.t("esw.base.dup_full")}`,
        5: `1000M/${I18N.t("esw.base.dup_full")}`,
        6: I18N.t("esw.base.auto_do"),
        7: `${I18N.t("phrase.unknow")}/${I18N.t("esw.base.dup_half")}`,
        8: `${I18N.t("phrase.unknow")}/${I18N.t("esw.base.dup_full")}`
      }),
      baseModel: {
        portid: [],
        speed_duplex: "0",
        flow: "0",
        state: "1"
      },
      baseRules: {
        portid: [{ required: true, message: I18N.t("esw.port_no_empty") }]
      },
      isLoading: false
    };
  },
  computed: {
    ...mapGetters("switch", [
      "item",
      "portinfo",
      "portTreeList",
      "hasGillionPort"
    ]),
    selectPorts() {
      return this.baseModel.portid.includes("all")
        ? this.portinfo.map(info => info.port)
        : this.baseModel.portid;
    },
    // 是否存在光口选中
    selectHasFiber() {
      if (this.hasGillionPort && this.item.deviceType !== "RG-ES209C-P") {
        let _selectPortid = this.selectPorts;
        return _selectPortid.some(
          port => port >= this.portinfo.slice(-2)[0].port
        );
      }
      return false;
    },
    // 9c设备第九口判断
    dev_9cIsDisabled() {
      if (this.item.deviceType === "RG-ES209C-P") {
        let _selectPortid = this.selectPorts;
        return (
          (_selectPortid.length === 1 &&
            _selectPortid[0] !== this.portinfo.slice(-1)[0].port) ||
          _selectPortid.length > 1
        );
      }
      return false;
    }
  },
  watch: {
    selectPorts() {
      // 有光口判断
      if (this.selectHasFiber) {
        if (
          this.baseModel.speed_duplex !== "0" ||
          this.baseModel.speed_duplex !== "5"
        ) {
          this.baseModel.speed_duplex = "0";
        }
      }
      // 9c设备判断是否禁用
      if (this.dev_9cIsDisabled) {
        if (this.baseModel.speed_duplex === "5") {
          this.baseModel.speed_duplex = "0";
        }
      }
    }
  },
  methods: {
    _onTreeSelectClick(e) {
      this.$refs.speedRef.blur();
    },
    // 刷新
    _refresh() {
      this.isLoading = true;
      this.$bus.$emit("PORT_LIST_UPDATE", {
        from: this.$options.name || "anonymous"
      });
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    },
    // poe使能
    _onSubmit() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true;
          let _postData = {
            ...this.baseModel,
            portid: this.selectPorts
          };
          let _result = await this.$api.switchApi(
            "doSwitchApi",
            {
              ip: this.item.ip,
              sn: this.item.devSN,
              method: "post",
              data: _postData,
              url: "port.cgi"
            },
            {
              timeoutOk: 10000,
              isSilence: true
            }
          );
          this.$refs.baseForm.resetFields();
          this.$message({
            type: "success",
            message: I18N.t("tip.edit1_success")
          });
          this.$bus.$emit("PORT_LIST_UPDATE", {
            from: this.$options.name || "anonymous"
          });
          this.isLoading = false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.switch-portsetting {
  min-height: 250px;
}
</style>

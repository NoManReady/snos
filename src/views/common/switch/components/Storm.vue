<template>
  <div class="switch-storm" v-loading="isLoading">
    <el-form :model="baseModel" :rules="baseRules" label-width="100px" ref="baseForm" size="mini">
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
          <el-form-item :label="$t('phrase.type')" prop="storm_filter">
            <el-select class="w120" v-model="baseModel.storm_filter">
              <el-option :value="4" :label="$t('esw.base.broadcast')"></el-option>
              <el-option :value="1" :label="$t('esw.base.unknow_unicast')"></el-option>
              <el-option :value="3" :label="$t('esw.base.unknow_mutilcast')"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('phrase.status')" prop="action">
            <el-select class="w170" ref="stateRef" v-model="baseModel.action">
              <el-option :value="0" :label="$t('phrase.disable')"></el-option>
              <el-option :value="1" :label="$t('phrase.enable')"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('esw.base.rate')" prop="rate">
            <el-input
              :disabled="baseModel.action===0"
              :placeholder="baseModel.action===0?$t('esw.base.no_limit'):$t('esw.base.rate_no_empty')"
              class="w120"
              v-model="baseModel.rate"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button @click.native="_onSubmit" type="primary">{{$t('action.save')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="stormList"
      :max-height="200"
      align="center"
      border
      header-align="center"
      ref="rateTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" :label="$t('esw.port')" prop="port" width="100">
        <template slot-scope="{row}">{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column align="center" :label="`${$t('esw.base.broadcast')} (Mbit/sec)`">
        <template slot-scope="{row}">
          <span v-if="row.bc==='off'">{{$t('phrase.disable')}}</span>
          <span v-else>{{+row.bc/1000}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="`${$t('esw.base.unknow_unicast')} (Mbit/sec)`">
        <template slot-scope="{row}">
          <span v-if="row.uuc==='off'">{{$t('phrase.disable')}}</span>
          <span v-else>{{+row.uuc/1000}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="`${$t('esw.base.unknow_mutilcast')} (Mbit/sec)`">
        <template slot-scope="{row}">
          <span v-if="row.umc==='off'">{{$t('phrase.disable')}}</span>
          <span v-else>{{+row.umc/1000}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col } from "element-ui";
import Treeselect from "@riophae/vue-treeselect";
import { isBetween, intValidate } from "@/utils/rulesUtils";
import { mapGetters } from "vuex";
export default {
  name: "switch-storm",
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    Treeselect
  },
  data() {
    const rateValidator = (r, v, cb) => {
      if (this.baseModel.action === 0) {
        cb();
      }
      if (!intValidate(v)) return cb(new Error(I18N.t("esw.base.require_int")));
      let _random = this.hasGillionPort ? 1000 : 100;
      if (!isBetween(v, 1, _random)) {
        return cb(new Error(I18N.t("esw.base.rate_range", { rate: _random })));
      }
      cb();
    };
    return {
      stormList: [],
      baseModel: {
        rate: "",
        storm_filter: 4,
        portid: [],
        action: 0
      },
      baseRules: {
        portid: [{ required: true, message: I18N.t("esw.port_no_empty") }],
        rate: [{ validator: rateValidator }]
      },
      isLoading: false
    };
  },
  computed: {
    ...mapGetters("switch", [
      "item",
      "hasGillionPort",
      "easyPortList",
      "portTreeList"
    ])
  },
  watch: {
    "baseModel.action"(v) {
      if (v === 1) {
        this.baseModel.rate = this.hasGillionPort ? 1000 : 100;
      } else {
        this.baseModel.rate = "";
      }
    }
  },
  created() {
    this._load();
  },
  methods: {
    _onTreeSelectClick(e) {
      this.$refs.stateRef.blur();
    },
    // 加载storm配置信息数据
    async _load() {
      this.isLoading = true;
      let _result = await this.$api.switchApi(
        "doSwitchApi",
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: "get",
          url: "rest_get_port_storm.cgi"
        },
        { isSilence: true }
      );
      this.isLoading = false;
      this.stormList = _result;
    },
    // 修改speed
    _onSubmit() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let _postData = {
            ...this.baseModel,
            portid: this.baseModel.portid.includes("all")
              ? this.easyPortList.map(port => port.id)
              : [...this.baseModel.portid]
          };
          if (this.baseModel.action === 0) {
            delete _postData.rate;
          }
          await this.$api.switchApi("doSwitchApi", {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "post",
            data: _postData,
            url: "fwd.cgi?cmd=storm"
          });
          this.$refs.baseForm.resetFields();
          this.$message({
            type: "success",
            message: I18N.t("tip.edit1_success")
          });
          this._load();
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.switch-storm {
  min-height: 200px;
}
</style>

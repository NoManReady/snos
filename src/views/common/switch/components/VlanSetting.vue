<template>
  <div class="switch-vlansetting" v-loading="isLoading">
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
          <el-form-item :label="$t('esw.port')" prop="port">
            <treeselect
              :default-expand-level="1"
              :max-height="250"
              :multiple="true"
              :options="portTreeList"
              class="w170"
              :placeholder="$t('esw.select')"
              v-model="baseModel.port"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('phrase.type')" prop="vlanType">
            <el-select class="w100" v-model="baseModel.vlanType">
              <el-option label="Access" value="access"></el-option>
              <el-option label="Trunk" value="trunk"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="12">
          <el-form-item label="Permit" prop="permit">
            <treeselect
              :default-expand-level="1"
              :disabled="baseModel.vlanType==='access'"
              :multiple="true"
              :options="vlanTreeList"
              class="w170"
              :placeholder="$t('esw.select')"
              v-model="baseModel.permit"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Native" prop="native">
            <el-select class="w100" v-model="baseModel.native">
              <el-option
                :key="vlan .vid"
                :label="`VLAN ${vlan .vid}`"
                :value="vlan .vid"
                v-for="vlan in vlanMembers"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="tc">
        <el-button @click.native="_onSubmit" size="mini" type="primary">{{$t('action.save_edit')}}</el-button>
      </div>
    </el-form>
    <el-table
      :data="portinfo"
      :max-height="200"
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
      <el-table-column align="center" :label="$t('esw.base.vlan_type')" width="100">
        <template slot-scope="{row}">
          <span>{{row.vid.length>1?'Trunk':'Access'}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Permit VLAN">
        <template slot-scope="{row}">
          <span>{{_getVlanStr(row.vid)}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Native Vlan" prop="pvid" width="100"></el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col } from "element-ui";
import Treeselect from "@riophae/vue-treeselect";
import { mapGetters } from "vuex";
export default {
  name: "switch-vlansetting",
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    Treeselect
  },
  data() {
    const permitValidator = (r, v, cb) => {
      if (this.baseModel.vlanType === "trunk" && v.length === 0) {
        return cb(new Error(I18N.t("esw.base.pormit_no_empty")));
      }
      cb();
    };
    return {
      vlanMembers: [],
      baseModel: {
        port: [],
        permit: [],
        native: "",
        vlanType: "access"
      },
      baseRules: {
        port: [{ required: true, message: I18N.t("esw.port_no_empty") }],
        permit: [{ validator: permitValidator }],
        native: [
          { required: true, message: I18N.t("esw.base.native_no_empty") }
        ]
      },
      isLoading: false
    };
  },
  beforeCreate() {
    this.$bus.$emit("PORT_LIST_UPDATE", { from: this.$options.name });
  },
  computed: {
    ...mapGetters("switch", ["item", "portinfo", "portTreeList"]),
    vlanTreeList() {
      return Object.freeze([
        {
          id: "all",
          children: this.vlanMembers.map(vlan => {
            return {
              id: vlan.vid,
              label: vlan.vid
            };
          }),
          label: I18N.t("phrase.all")
        }
      ]);
    }
  },
  created() {
    this._loadMember();
  },
  methods: {
    // 加载vlan成员数据
    async _loadMember() {
      this.isLoading = true;
      let _result = await this.$api.switchApi(
        "doSwitchApi",
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: "get",
          url: "rest_get_vlan_list.cgi"
        },
        { isSilence: true }
      );
      this.isLoading = false;
      this.vlanMembers = Object.freeze(_result);
    },
    // 获取vlan字符串
    _getVlanStr(vids) {
      let _vidArr = [];
      let _vids = [...vids];
      _vids.reduce((prev, next) => {
        let _last = prev[prev.length - 1];
        if (_last && _last[_last.length - 1] + 1 === next) {
          _last.push(next);
        } else {
          prev.push([next]);
        }
        return prev;
      }, _vidArr);
      return _vidArr
        .reduce((strArr, next) => {
          if (next.length >= 3) {
            strArr.push(`${next[0]}-${next[next.length - 1]}`);
          } else {
            strArr.push(next.join(","));
          }
          return strArr;
        }, [])
        .join(",");
    },
    // poe使能
    _onSubmit() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let _postData = {
            port: this.baseModel.port.includes("all")
              ? Array.from({ length: this.portinfo.length }).map(
                  (_, index) => index
                )
              : [...this.baseModel.port],
            native: this.baseModel.native
          };
          if (this.baseModel.vlanType === "trunk") {
            _postData.permit = this.baseModel.permit.includes("all")
              ? this.vlanMembers.map(vlan => vlan.vid)
              : this.baseModel.permit;
          }
          await this.$api.switchApi("doSwitchApi", {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "post",
            data: _postData,
            url: "vlan_p.cgi?cmd=vlan_setting_add"
          });
          this.$refs.baseForm.resetFields();
          this.$message({
            type: "success",
            message: I18N.t("tip.add_success")
          });
          this.$bus.$emit("PORT_LIST_UPDATE", {
            from: this.$options.name || "anonymous"
          });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.switch-vlansetting {
  min-height: 250px;
}
</style>

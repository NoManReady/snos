<template>
  <div class="switch-mirror" v-loading="isLoading">
    <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="mini">
      <el-form-item :label="$t('esw.mirror.source')" prop="mirrored_port">
        <treeselect
          :default-expand-level="1"
          :max-height="250"
          :multiple="true"
          :options="portTreeList"
          @click.native="_onTreeSelectClick"
          class="w170"
          :placeholder="$t('esw.select')"
          v-model="baseModel.mirrored_port"
        />
      </el-form-item>
      <el-form-item :label="$t('esw.mirror.direction')" prop="mirror_direction">
        <el-select class="w100" ref="directRef" v-model="baseModel.mirror_direction">
          <!-- <el-option :value="0" label="关闭"></el-option> -->
          <el-option :value="1" :label="$t('esw.mirror.in')"></el-option>
          <el-option :value="2" :label="$t('esw.mirror.out')"></el-option>
          <el-option :value="3" :label="$t('phrase.all')"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('esw.mirror.dest')" prop="mirroring_port">
        <el-select class="w100" ref="mirrorRef" v-model="baseModel.mirroring_port">
          <el-option
            :key="port.id"
            :label="port.label"
            :value="port.id"
            v-for="port in easyPortList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click.native="_onSubmit" type="primary">{{$t('action.save_edit')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="mirrorList"
      :max-height="200"
      align="center"
      border
      header-align="center"
      ref="vlanTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" :label="$t('esw.mirror.source')" prop="mirrored"></el-table-column>
      <el-table-column align="center" :label="$t('esw.mirror.direction')">
        <template slot-scope="{row}">
          <span v-show="row.mode==='1'">{{$t('esw.mirror.in')}}</span>
          <span v-show="row.mode==='2'">{{$t('esw.mirror.out')}}</span>
          <span v-show="row.mode==='3'">{{$t('phrase.all')}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('esw.mirror.dest')" prop="mirroring">
        <template slot-scope="{row}">{{+row.mirroring+1}}</template>
      </el-table-column>
      <el-table-column align="center" :label="$t('action.ope')" width="100">
        <template slot-scope="{row}">
          <el-button @click.native="_onDelMirror(row)" size="mini" type="text">
            <small>{{$t('action.delete')}}</small>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col } from "element-ui";
import Treeselect from "@riophae/vue-treeselect";
import { mapGetters } from "vuex";
export default {
  name: "switch-mirror",
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    Treeselect
  },
  data() {
    return {
      mirrorList: [],
      baseModel: {
        mirroring_port: "",
        mirror_direction: 1,
        mirrored_port: []
      },
      baseRules: {
        mirrored_port: [
          { required: true, message: I18N.t("esw.mirror.source_no_empty") }
        ],
        mirroring_port: [
          { required: true, message: I18N.t("esw.mirror.dest_no_empty") }
        ]
      },
      isLoading: false
    };
  },
  computed: {
    ...mapGetters("switch", ["item", "easyPortList", "portTreeList"])
  },
  created() {
    this._load();
  },
  methods: {
    _onTreeSelectClick(e) {
      this.$refs.directRef.blur();
      this.$refs.mirrorRef.blur();
    },
    // 加载mirror配置信息数据
    async _load() {
      this.isLoading = true;
      try {
        let _result = await this.$api.switchApi(
          "doSwitchApi",
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "get",
            url: "rest_get_port_mirror.cgi"
          },
          { isSilence: true }
        );
        if (_result instanceof Array) {
          this.mirrorList = _result;
        } else {
          this.mirrorList = [_result];
        }
      } catch (error) {}
      this.isLoading = false;
    },
    // 删除mirror
    async _onDelMirror() {
      try {
        await this.$api.switchApi("doSwitchApi", {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: "post",
          url: "port.cgi?cmd=delete_mirror"
        });
        this.$message({
          type: "success",
          message: I18N.t("tip.del_success")
        });
      } catch (error) {}
      this._load();
    },
    // 添加修改mirror
    _onSubmit() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let _postData = {
            ...this.baseModel,
            mirrored_port: this.baseModel.mirrored_port.includes("all")
              ? this.easyPortList.map(port => port.id)
              : [...this.baseModel.mirrored_port]
          };
          await this.$api.switchApi("doSwitchApi", {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "post",
            data: _postData,
            url: "port.cgi?cmd=mirroring"
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

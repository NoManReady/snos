<template>
  <div class="switch-portstatistics" v-loading="isLoading">
    <div class="clearfix mb10 fr">
      <el-button @click.native="_onFresh" size="mini" type="primary">{{$t('action.refresh')}}</el-button>
      <el-button @click.native="_onClear" size="mini" type="danger">{{$t('action.clear')}}</el-button>
    </div>
    <el-table
      :data="portinfo"
      :max-height="250"
      align="center"
      border
      header-align="center"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" fixed :label="$t('esw.port')" width="80">
        <template slot-scope="{row}">{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column
        align="center"
        fixed
        :label="$t('esw.base.connect_status')"
        prop="status"
        sortable
        width="100"
      >
        <template slot-scope="{row}">
          <span class="c-info" v-if="row.status===0">{{$t('esw.base.open')}}</span>
          <span class="c-success" v-else>{{$t('esw.base.connection')}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('phrase.status')" prop="enable" width="80">
        <template slot-scope="{row}">
          <span class="c-info" v-if="row.enable===0">{{$t('phrase.disable')}}</span>
          <span class="c-success" v-else>{{$t('phrase.enable')}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('esw.base.inout_speed')" width="160">
        <template slot-scope="{row}">
          <span class="c-info">{{row.rxSpeed}}/{{row.txSpeed}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('esw.base.inout_byte')" width="160">
        <template slot-scope="{row}">
          <span class="c-info">{{row.rxBytes}}/{{row.txBytes}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('esw.base.inout_pack_success')" width="160">
        <template slot-scope="{row}">
          <span class="c-info">{{row.rxGood}}/{{row.txGood}}</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="$t('esw.base.inout_pack_fail')"
        prop="status"
        width="100"
      >
        <template slot-scope="{row}">
          <span class="c-info">{{row.rxBad}}/{{row.txBad}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "switch-portstatistics",
  data() {
    return {
      isLoading: false
    };
  },
  computed: {
    ...mapGetters("switch", ["portinfo", "item"])
  },
  methods: {
    ...mapActions("switch", ["fetchPortInfo"]),
    // 清除流量数据
    async _onClear() {
      this.isLoading = true;
      try {
        await this.$api.switchApi(
          "doSwitchApi",
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "post",
            url: "port.cgi?cmd=clear"
          },
          { isSilence: true }
        );
        await this.fetchPortInfo();
        this.$message({
          message: I18N.t("tip.remove_success"),
          type: "success"
        });
      } catch (error) {}
      this.isLoading = false;
    },
    // 刷新数据
    async _onFresh() {
      this.isLoading = true;
      try {
        await this.fetchPortInfo();
      } catch (error) {}
      this.isLoading = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.switch-portstatistics {
  min-height: 250px;
}
</style>

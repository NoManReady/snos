<template>
  <div class="switch-mactable" v-loading="isLoading">
    <div class="clearfix mb10">
      <span class="c-warning">{{$t('esw.mac.show_mac_tip')}}</span>
      <div class="fr">
        <el-button @click.native="_load" size="mini" type="primary">{{$t('action.refresh')}}</el-button>
        <el-button @click.native="_clear" size="mini" type="danger">{{$t('action.clear')}}</el-button>
      </div>
    </div>
    <el-table
      :data="macList"
      :max-height="250"
      align="center"
      border
      header-align="center"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" :label="$t('phrase.serial')" width="80">
        <template slot-scope="{$index}">{{$index+1}}</template>
      </el-table-column>
      <el-table-column align="center" :label="$t('sysinfo.mac_addr')" prop="mac"></el-table-column>
      <el-table-column align="center" label="VLAN ID" prop="vid" v-if="vmode==='1'"></el-table-column>
      <el-table-column align="center" :label="$t('esw.port')">
        <template slot-scope="{row}">{{row.port}}</template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  name: "switch-mactable",
  data() {
    return {
      macList: [],
      isLoading: false
    };
  },
  computed: {
    ...mapGetters("switch", ["item", "vmode"])
  },
  created() {
    this._load();
  },
  methods: {
    // 加载mac table数据
    async _load() {
      this.isLoading = true;
      let _result = await this.$api.switchApi(
        "doSwitchApi",
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: "get",
          url: "mac.cgi?page=fwd_tbl_json"
        },
        { isSilence: true }
      );
      this.isLoading = false;
      this.macList = _result;
    },
    // 清除
    async _clear() {
      this.isLoading = true;
      await this.$api.switchApi(
        "doSwitchApi",
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: "post",
          url: "mac.cgi?cmd=macclear"
        },
        { isSilence: true }
      );
      await this._load();
      this.isLoading = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.switch-mactable {
  min-height: 100px;
  /deep/ .el-card__body {
    padding: 5px;
  }
}
</style>

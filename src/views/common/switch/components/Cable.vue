<template>
  <div class="switch-cable" v-loading="isLoading">
    <div class="clearfix mb10">
      <el-button
        @click.native="_reCheck"
        class="fr mr20"
        size="mini"
        type="primary"
      >{{$t('esw.cable.begin_test')}}</el-button>
    </div>
    <el-table
      :data="cableList"
      :max-height="250"
      align="center"
      border
      header-align="center"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" :label="$t('esw.port')" width="80">
        <template slot-scope="{row}">{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column align="center" :label="$t('esw.cable.test_result')" width="100">
        <template slot-scope="{row}">
          <span class="c-danger" v-if="row.result==='open'">{{$t('esw.cable.open')}}</span>
          <span class="c-success" v-else-if="row.result==='normal'">{{$t('esw.cable.normal')}}</span>
          <!-- <span class="c-danger" v-else-if="row.result==='error'">断开</span> -->
          <span class="c-warning" v-else-if="row.result==='short'">{{$t('esw.cable.short')}}</span>
          <span class="c-info" v-else-if="row.result==='nosupport'">{{$t('esw.cable.unsupport')}}</span>
          <span class="c-warning" v-else-if="row.result==='mismatch'">{{$t('esw.cable.mismatch')}}</span>
          <span class="c-info" v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('esw.cable.desc')">
        <template slot-scope="{row,$index}">
          <span class="c-danger" v-if="row.result==='open'">{{$t('esw.cable.desc_open')}}</span>
          <span class="c-success" v-else-if="row.result==='normal'">{{$t('esw.cable.desc_normal')}}</span>
          <span
            class="c-danger"
            v-else-if="row.result==='error'&&portinfo[$index].enable===0"
          >{{$t('esw.cable.desc_port_disable')}}</span>
          <span class="c-warning" v-else-if="row.result==='short'">{{$t('esw.cable.short')}}</span>
          <span class="c-info" v-else-if="row.result==='nosupport'">{{$t('esw.cable.unsupport')}}</span>
          <span
            class="c-warning"
            v-else-if="row.result==='mismatch'"
          >{{$t('esw.cable.desc_dismatch')}}</span>
          <span class="c-info" v-else>--</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { sleep } from "@/utils";
import fetch from "@/utils/fetch";
export default {
  name: "switch-cable",
  data() {
    return {
      cableList: [],
      isLoading: false
    };
  },
  computed: {
    ...mapGetters("switch", ["item", "devBelongType", "portinfo"])
  },
  methods: {
    // 加载cable数据
    async _load() {
      this.isLoading = true;
      let _result = await this.$api.switchApi(
        "doSwitchApi",
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: "get",
          url: "rest_get_port_cable.cgi"
        },
        { isSilence: true }
      );
      this.isLoading = false;
      if (this.devBelongType === "big") {
        _result = _result.slice(0, _result.length - 2);
      }
      this.cableList = _result;
    },
    // 检测是否在线
    async _checkOnline() {
      let _result = { isReach: false };
      try {
        _result = await fetch(
          `/api/switch`,
          {
            method: "ipIsReach",
            params: { ip: this.item.ip }
          },
          { isSilence: true }
        );
      } catch (error) {}
      return _result.isReach;
    },
    // 重新检测
    async _reCheck() {
      this.isLoading = true;
      try {
        await this.$api.switchApi(
          "doSwitchApi",
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: "post",
            url: "home.cgi?cmd=check_all_cable"
          },
          { isSilence: true, showError: false, timeout: 15000 }
        );
      } catch (error) {}
      let _isReach = await this._checkOnline();
      while (!_isReach) {
        await sleep(2000);
        _isReach = await this._checkOnline();
      }
      this._load();
    }
  }
};
</script>
<style lang="scss" scoped>
.switch-cable {
  min-height: 250px;
}
</style>

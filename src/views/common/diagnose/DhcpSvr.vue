<template>
  <div class="diagnose-dhcp-svr">
    <help-alert
      json-key="estDhcpClientJson"
      :title="$t('diagnose.addr_server')"
    >
      <div slot="content">{{ $t("diagnose.addr_server_tip") }}</div>
    </help-alert>
    <div class="box">
      <el-form label-width="160px" size="medium">
        <el-form-item :label="$t('diagnose.dhcp_ser_status')">
          <el-switch
            :value="status"
            @change="onChange"
            active-value="on"
            inactive-value="off"
          ></el-switch>
        </el-form-item>
      </el-form>
      <template v-if="status === 'on'">
        <div class="box-header">
          <span class="box-header-tit">
            {{ $t("diagnose.addr_list") }}
            <small></small>
          </span>
          <div class="fr">
            <el-button
              @click.native="_initPage"
              icon="el-icon-refresh"
              size="medium"
              type="primary"
              >{{ $t("action.refresh") }}</el-button
            >
          </div>
        </div>
        <el-table :data="pageList" ref="multipleTable" size="medium" stripe>
          <!-- <el-table-column prop="hostname" label="主机名" align="center">
          </el-table-column>-->
          <el-table-column
            align="center"
            :label="$t('sysinfo.ip_addr')"
            prop="ip"
          ></el-table-column>
          <el-table-column
            align="center"
            :label="$t('sysinfo.mac_addr')"
            prop="mac"
          ></el-table-column>
          <el-table-column
            align="center"
            :label="$t('diagnose.remain_lease', {type:$t('time.minute')})"
            prop="leasetime"
          ></el-table-column>
        </el-table>
        <el-pagination
          :current-page.sync="pageModel.pageIndex"
          :page-size="pageModel.pageSize"
          :page-sizes="pageModel.pageSizes"
          :total="pageTotal"
          @current-change="onCurrentChange"
          @size-change="_onSizeChange"
          background
          class="mt20"
          layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
      </template>
    </div>
  </div>
</template>
<script>
import pageMixins from "@/mixins/pageMixins";
let time = null;
export default {
  name: "DiagnoseDhcpSvr",
  data() {
    return {
      status: "off"
    };
  },
  mixins: [pageMixins],
  beforeDestroy() {
    clearTimeout(time);
    time = null;
  },
  async created() {
    await this._loadStatus(true);
    this._initPage();
  },
  methods: {
    _loadList() {
      if (this.status === "on") {
        return this._loadDhcpLease();
      }
      return [];
    },
    async _loadStatus(isInit = false, isSilence = false) {
      let _svr = await this.$api.cmd(
        "devSta.get",
        { module: "dhcp_svr" },
        { isSilence }
      );
      this.status = _svr.status;

      if (isInit || time) {
        time = setTimeout(() => {
          this._loadStatus(false, true);
        }, 30000);
      }
    },
    async _loadDhcpLease() {
      let _result = await this.$api.cmd("devSta.get", { module: "dhcp_lease" });
      return _result.List || [];
    },
    async onChange(v) {
      await this.$confirm(
        I18N.t("diagnose.dhcp_serv_confirm", {
          status:
            v === "on" ? I18N.t("phrase.enable") : I18N.t("phrase.disable")
        })
      );
      let _res = await this.$api.cmd(
        "devSta.set",
        {
          module: "dhcp_svr",
          async: true,
          data: {
            status: v
          }
        },
        {
          timeout: 60000
        }
      );
      if (_res.code === "0") {
        this.status = v;
      } else if (_res.code === "2") {
        this.$message.error(I18N.t("diagnose.enable_err"));
      }
      if (this.status === "on") {
        this._initPage();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

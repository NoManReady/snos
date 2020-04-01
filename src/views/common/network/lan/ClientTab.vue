<template>
  <div class="network-client">
    <help-alert :title="$t('network.client_list')" json-key="dhcpClientJson">
      <div slot="content">{{ $t("network.client_info_tip") }}</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{ $t("network.client_list") }}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            @click.native="_initPage"
            icon="el-icon-refresh"
            plain
            size="medium"
            type="primary"
          >{{ $t("action.refresh") }}</el-button>
          <el-button
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="onAddToStatic"
          >{{ $t("action.patch_convert") }}</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="multipleTable" size="medium" stripe>
        <el-table-column :selectable="isSelectable" align="center" type="selection" width="50"></el-table-column>
        <el-table-column :label="$t('phrase.serial')" align="center" type="index"></el-table-column>
        <el-table-column :label="$t('network.hostname')" align="center" prop="hostname"></el-table-column>
        <el-table-column :label="$t('sysinfo.mac_addr')" align="center" prop="mac">
          <template slot-scope="scope">{{ scope.row.mac }}</template>
        </el-table-column>
        <el-table-column :label="$t('sysinfo.ip_addr')" align="center" prop="ip"></el-table-column>
        <el-table-column :label="$t('diagnose.remain_lease', {type:$t('time.day')})" align="center" prop="leasetime"></el-table-column>
        <el-table-column :label="$t('phrase.status')" align="center">
          <template slot-scope="scope">
            <el-button :loading="true" size="medium" type="text" v-if="onLoadingStatus"></el-button>
            <el-button
              size="medium"
              type="text"
              v-auth="{ fn: onAddToStatic, params: scope.row }"
              v-else-if="!isStaticDhcp(scope.row)"
            >{{ $t("network.addto_static") }}</el-button>
            <el-button
              :disabled="true"
              size="medium"
              type="text"
              v-else
            >{{$t("network.static_areadly")}}</el-button>
          </template>
        </el-table-column>
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
    </div>
  </div>
</template>
<script>
import pageMixins from "@/mixins/pageMixins";
export default {
  name: "NetworkClient",
  data() {
    return {
      MAX_NUM: 300, // 静态地址最大支持数
      dhcpStatic: [],
      onLoadingStatus: true
    };
  },
  mixins: [pageMixins],
  computed: {
    staticDhcpMap() {
      let _staticDhcpMap = {};
      this.dhcpStatic.forEach(item => {
        let m = item.ipaddr + "&&" + item.macaddr.toLocaleLowerCase();
        if (!_staticDhcpMap[m]) _staticDhcpMap[m] = true;
      });
      return _staticDhcpMap;
    },
    hasConfig() {
      let _hasConfig = [];
      this.dhcpStatic.forEach(o => _hasConfig.push(o.ipaddr, o.macaddr));
      return _hasConfig;
    }
  },
  methods: {
    async _loadList() {
      let _result = await this.$api.cmd("devSta.get", { module: "dhcp_lease" });
      this.getStaticDhcp();
      return _result.List || [];
    },
    // 获取dhcp静态绑定
    getStaticDhcp() {
      return new Promise((res, rej) => {
        this.$api
          .getStaticDhcpTable()
          .then(data => {
            this.dhcpStatic = data.dhcp_static || [];
            this.onLoadingStatus = false;
            res();
          })
          .catch(() => {
            this.onLoadingStatus = false;
            res();
          });
      });
    },
    // 添加至静态绑定
    onAddToStatic(row) {
      let d = [];
      if (row) {
        d.push(this._getMacIp(row));
      } else {
        let selection = this.$refs.multipleTable.selection;
        if (!selection.length) {
          return this.$message.warning(I18N.t("network.item_static_no_empty"));
        }
        selection.forEach(item => {
          d.push(this._getMacIp(item));
        });
      }
      // 校验容量
      if (this.dhcpStatic.length + d.length > this.MAX_NUM) {
        return this.$message.warning(
          I18N.t("network.static_add_limit", { cnt: this.MAX_NUM })
        );
      }
      // 校验已配置的IP MAC
      if (this.checkHasConfig(d)) {
        this._onAdd(d);
      }
    },
    checkHasConfig(rows) {
      let _invaliteArr = [];
      for (let i = 0; i < rows.length; i++) {
        if (this.hasConfig.includes(rows[i].ipaddr)) {
          _invaliteArr.push(rows[i].ipaddr);
        }
        if (this.hasConfig.includes(rows[i].macaddr)) {
          _invaliteArr.push(rows[i].macaddr);
        }
      }
      if (_invaliteArr.length > 0) {
        let _htmlArr = [
          `<div class="mt5"><span class="c-warning mlr5">${_invaliteArr.join(',')}</span>${I18N.t('network.static_areadly')}</div>`,
          `<div class="mt5 mlr5">${I18N.t('network.jump_to_info')}</div>`
        ];
        this.$confirm(_htmlArr.join(""), I18N.t("phrase.tip"), {
            type: 'warning',
            showClose: false,
            cancelButtonText: I18N.t('devlist.no_see'),
            confirmButtonText: I18N.t('devlist.to_see'),
            closeOnClickModal: false,
            dangerouslyUseHTMLString: true,
            customClass: "w500"
          })
          .then(ok => {
            this.$router.push({ query: { tab: '2' } })
          }, cancel => {});
        return false;
      }
      return true;
    },
    // 添加至静态绑定
    _onAdd(list) {
      this.$confirm(I18N.t("network.static_add_confirm")).then(() => {
        this.$api
          .addStaticDhcpTable(list)
          .then(() => {
            this.dhcpStatic.push(...list);
            this.$message({
              message: I18N.t("tip.edit1_success"),
              type: "success"
            });
          })
          .finally(() => {
            this.$refs.multipleTable.clearSelection();
          });
      });
    },
    // 获取mac-ip数据对象数组
    _getMacIp(item) {
      return {
        macaddr: item.mac,
        ipaddr: item.ip
      };
    },
    // 判断是否已经绑定至静态dhcp
    isStaticDhcp(row) {
      let m = row.ip + "&&" + row.mac.toLocaleLowerCase();
      if (this.staticDhcpMap[m]) return true;
      return false;
    },
    // 是否可勾选
    isSelectable(row) {
      return !this.isStaticDhcp(row);
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

<template>
  <div class="vpn-l2tp-tunnel">
    <help-alert :title="$t('egw.l2tp.tunnel_information_tab')" json-key="vpnPptpTunnelJson"></help-alert>
    <div class="fr">
          <el-button :disabled="isLoading" icon="el-icon-delete" plain size="medium" type="primary" v-auth="onOffline">{{$t('action.patch_delete')}}</el-button>
        </div>
    <el-table :data="list" ref="baseTable" size="medium" stripe>
      <el-table-column :selectable="isSelectable" type="selection" width="55"></el-table-column>
      <el-table-column :label="$t('egw.user_name')" align="center" prop="username"></el-table-column>
      <el-table-column :label="$t('egw.l2tp.service_initiator')" align="center" prop="type">
        <template slot-scope="scope">{{scope.row.type === 'client' ? $t('egw.ipsec.initiator') : $t('egw.ipsec.master')}}</template>
      </el-table-column>
      <el-table-column :label="$t('egw.l2tp.tunnel_name')" align="center" prop="tunnelname"></el-table-column>
      <el-table-column :label="$t('egw.l2tp.virtual_local_ip')" align="center" prop="localIp"></el-table-column>
      <el-table-column :label="$t('egw.l2tp.link_service_ip')" align="center" prop="lns"></el-table-column>
      <el-table-column :label="$t('egw.l2tp.peer_virtual_ip')" align="center" prop="remoteIp"></el-table-column>
      <el-table-column align="center" label="DNS" prop="DNS"></el-table-column>
      <el-table-column :label="$t('action.ope')" align="center">
        <template slot-scope="scope">
          <el-button :disabled="scope.row.type === 'client'" size="medium" type="text" v-auth="{fn:onOffline,params:scope.row}">{{$t('action.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'vpn-pptp-tunnel',
  data() {
    return {
      isLoading: false,
      list: []
    }
  },
  created() {
    this._initPage()
  },
  methods: {
    async _initPage() {
      let _res = await this.$api.getPptpChannel()
      this.list = _res.list || []
    },
    onOffline(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert( this.$t('tip.select_del_item'), {
          type: 'warning'
        })
        return
      }
      this.$confirm(this.$t('tip.confirm_delete'), this.$t('phrase.tip'), {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.$api.delPptpChannel({list: _items})
          .then(d => {
            _items.forEach(ite => {
              let _index = this.list.findIndex(d => d === ite)
              this.list.splice(_index, 1)
            })
            this.$message({
              message: this.$t('tip.edit1_success'),
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // 判断是否是客户端
    isClient(row) {
      if (row.type === 'client') return true;
      return false;
    },
    // 是否可勾选
    isSelectable(row) {
      return !this.isClient(row);
    }
  }
}
</script>
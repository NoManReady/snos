<template>
  <div class="vpn-l2tp-tunnel">
    <help-alert :title="$t('egw.online_user')" json-key="pppoeUserinfoJson"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.pppoe.user_info_list')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="isLoading"
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="_onDel"
          >{{$t('egw.pppoe.block_link')}}</el-button>
          <el-button
            :disabled="isLoading"
            icon="el-icon-refresh"
            plain
            size="medium"
            type="primary"
            v-auth="_initPage"
          >{{$t('action.refresh')}}</el-button>
        </div>
      </div>
      <div class="box-content">
        <help-alert :show-icon="false" title>
          <div slot="content">
            {{$t('overview.online_user_cnt') + ' '}}<b class="c-warning mlr5">{{userNum}}</b>
          </div>
        </help-alert>
        <el-table :data="list" ref="baseTable" size="medium" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column :label="$t('egw.username')" align="center" prop="peername"></el-table-column>
          <!-- <el-table-column label="状态" align="center" prop="enable"></el-table-column> -->
          <el-table-column :label="$t('egw.ip')" align="center" prop="ipremote"></el-table-column>
          <el-table-column :label="$t('egw.mac')" align="center" prop="macremote"></el-table-column>
          <el-table-column :label="$t('egw.auth.inline_time')" align="center" prop="date"></el-table-column>
          <!-- <el-table-column label="备注" align="center" prop="note"></el-table-column> -->
          <el-table-column :label="$t('action.ope')" align="center">
                <template slot-scope="scope">
                  <el-button
                    size="medium"
                    type="text"
                    v-auth="{fn:_onDel,params:scope.row}"
                  >{{$t('port_panel.opened')}}</el-button>
                </template>
              </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import modelFn from '@/model'
export default {
  name: 'pppoe-userinfo',
  data() {
    return {
      userNum: 0,
      list: [],
      isLoading: false,
    }
  },
  created() {
    this._initPage()
  },
  computed: {
  },
  methods: {
    async _initPage() {
      let _res = await this.$api.getPppoeUserInfo()
      this.list = _res.list || []
      this.userNum = _res.count || 0
    },
    // 断开连接
    _onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert(I18N.t('tip.select_del_item'), {
          type: 'warning'
        })
        return
      }
      this.$confirm(I18N.t('egw.pppoe.block_link_confirm'), I18N.t('phrase.tip'), {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        let _infoList = []
        _items.forEach(ite => {
          _infoList.push({ ifname: ite.ifname, pppd_pid: ite.pppd_pid})
        })
        this.$api
          .delPppoeUserInfo({ list: _infoList })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.list.findIndex(d => d === ite)
              this.list.splice(_index, 1)
            })
            this.$message({
              message: I18N.t('egw.pppoe.link_is_block'),
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    }
  }
}
</script>
<template>
  <div class="wifi-sta">
    <el-popover placement="bottom-end" ref="searchPopover" trigger="click" v-model="showSearch" width="300">
      <el-form :model="query" label-width="90px" ref="form" size="medium">
        <el-form-item :label="$t('sysinfo.mac_addr')" class="mt20">
          <el-input v-model="query.mac"></el-input>
        </el-form-item>
        <!-- <el-form-item label="IP地址">
          <el-input v-model="query.ip"></el-input>
        </el-form-item>-->
        <el-form-item :label="$t('devlist.sn')" v-if="!isAp">
          <el-input v-model="query.sn"></el-input>
        </el-form-item>
        <!-- <el-form-item label="接入设备">
          <el-input v-model="query.deviceAliasName"></el-input>
        </el-form-item>-->
        <el-form-item>
          <el-button @click="onSearchStaList" type="primary">{{$t('phrase.search')}}</el-button>
          <el-button @click="showSearch=false">{{$t('action.cancel')}}</el-button>
        </el-form-item>
      </el-form>
    </el-popover>
    <help-alert :title="$t('overview.wireless_user')" json-key="exampleJson"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('wifi_comm.wireless_user')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            @click.native="onCurrentChange(1)"
            icon="el-icon-refresh"
            plain
            size="medium"
            type="primary"
          >{{$t('action.refresh')}}</el-button>
          <el-button
            icon="el-icon-find"
            plain
            size="medium"
            type="primary"
            v-popover:searchPopover
          >{{$t('wifi_comm.advanced_search')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="multipleTable" size="medium" stripe>
        <el-table-column :label="$t('wifi_comm.user_name')" align="center" prop="hostName">
          <template slot-scope="scope">
            <span>{{scope.row.hostName === 'Unknown' ? '-' : (scope.row.hostName || '-')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('sysinfo.mac_addr')" align="center" prop="mac"></el-table-column>
        <el-table-column :label="$t('sysinfo.ip_addr')" align="center" prop="userIp"></el-table-column>
        <el-table-column :label="$t('devlist.sn')" align="center" prop="sn"></el-table-column>
        <el-table-column :label="$t('wifi_comm.link_time')" align="center" prop="onlineTime"></el-table-column>
        <el-table-column :label="$t('wifi_comm.rssi')" align="center" prop="rssi"></el-table-column>
        <el-table-column :label="$t('wifi_comm.rate')" align="center" prop="rxrate"></el-table-column>
        <el-table-column :label="$t('wifi_comm.band')" align="center" prop="band"></el-table-column>
        <el-table-column :label="$t('wifi_comm.belond_net')" align="center" prop="ssid"></el-table-column>
        <el-table-column :label="$t('wifi_comm.channel')" align="center" prop="channel" width="100"></el-table-column>
        <el-table-column :label="$t('phrase.status')" align="center" v-if="hasBwlist" width="120">
          <template slot-scope="scope">
            <el-button :loading="true" size="medium" type="text" v-if="onLoadingStatus"></el-button>
            <el-button :disabled="true" size="medium" type="text" v-else-if="isOffline(scope.row)">{{isOffline(scope.row, true)}}</el-button>
            <el-button size="medium" type="text" v-auth="{fn:onOffline,params:scope.row}" v-else>{{$t('wifi_comm.to_offline')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.pageIndex"
        :page-size="pageModel.pageSize"
        :page-sizes="pageModel.pageSizes"
        :total="pageModel.pageTotal"
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
import reqPageMixins from '@/mixins/reqPageMixins'
import model from '@/model'
export default {
  name: 'WifiSta',
  data() {
    return {
      MAX_NUM: 30,
      staList: {
        list: []
      },
      query: {
        mac: '',
        ip: '',
        devName: '',
        sn: ''
      },
      showSearch: false,
      onLoadingStatus: true,
      bwData: { type: 'deny', macList: [] }
    }
  },
  mixins: [reqPageMixins],
  computed: {
    isAloneOrSlave() {
      let roles = this.$roles()
      if (roles.includes('alone') || roles.includes('slave')) return true
      return false
    },
    isAp() {
      return this.$dev().indexOf('ap') > -1
    },
    macBwMap() {
      return this.bwData.macList.map(item => item.mac.toLocaleUpperCase())
    },
    hasBwlist() {
      let roles = this.$roles()
      return (
        roles.includes('egw') ||
        roles.includes('master') ||
        roles.includes('alone')
      )
    }
  },
  created() {
    setTimeout(() => {
      this.getMacBwList()
    }, 600)
  },
  methods: {
    async loadPageList(query) {
      let staListData = await this.$api.getStaList(query)
      this.staList = staListData || { list: [] }
      if (!this.staList.list || !Array.isArray(this.staList.list))
        this.staList.list = []
      return this.staList
    },
    async getMacBwList() {
      let data = await this.$api.getMacBwList(true)
      this.bwData = { ...this.bwData, ...data } // data可能没有macList项问题
      this.onLoadingStatus = false
    },
    onSearchStaList() {
      this.showSearch = false
      this.onCurrentChange(1)
    },
    onOffline(row) {
      let _isAllow = this.bwData.type === 'allow'
      let msg = _isAllow
        ? I18N.t('wifi_comm.off_white_list', { mac: row.mac })
        : I18N.t('wifi_comm.off_white_list', { mac: row.mac })
      this.$confirm(msg).then(async () => {
        let _promise = null
        if (_isAllow) {
          _promise = this.$api.delMacBwList({
            type: this.bwData.type,
            macList: [row.mac]
          })
        } else {
          if (this.bwData.macList.length >= this.MAX_NUM) {
            return this.$message.warning(
              I18N.t('wifi_comm.offline_err', { max: this.MAX_NUM })
            )
          }
          _promise = this.$api.addMacBwList({
            type: this.bwData.type,
            mac: row.mac,
            name: row.hostName
          })
        }
        await _promise
        this.getMacBwList()
      })
    },
    isOffline(row, showText) {
      let _stat, _text
      if (this.bwData.type === 'allow') {
        _stat = !this.macBwMap.includes(row.mac.toLocaleUpperCase()) // 不在白名单中
        _text = _stat && I18N.t('wifi_comm.no_in_white')
      } else {
        // deny
        _stat = this.macBwMap.includes(row.mac.toLocaleUpperCase()) // 在黑名单中
        _text = _stat && I18N.t('wifi_comm.has_in_black')
      }
      _text = _text || I18N.t('wifi_comm.no_offline')
      return showText ? _text : _stat
    }
  }
}
</script>
<style lang="scss" scoped>
.wifi-sta {
  .table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
    float: left;
  }
}
</style>

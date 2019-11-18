<template>
  <div class="wifi-sta">
    <el-popover placement="bottom-end" ref="searchPopover" trigger="click" v-model="showSearch" width="400">
      <el-form :model="query" label-width="90px" ref="form">
        <el-form-item class="mt20" label="MAC地址" size="small">
          <el-input v-model="query.mac"></el-input>
        </el-form-item>
        <!-- <el-form-item label="IP地址" size="small">
          <el-input v-model="query.ip"></el-input>
        </el-form-item>-->
        <el-form-item label="序列号" size="small" v-if="!isAp">
          <el-input v-model="query.sn"></el-input>
        </el-form-item>
        <!-- <el-form-item label="接入设备" size="small">
          <el-input v-model="query.deviceAliasName"></el-input>
        </el-form-item>-->
        <el-form-item>
          <el-button @click="onSearchStaList()" type="primary">搜索</el-button>
          <el-button @click="showSearch=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-popover>
    <help-alert json-key="exampleJson" title="无线用户"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          无线用户列表
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="onCurrentChange(1)" size="small" type="primary">
            <i class="el-icon-refresh"></i>
            <span>刷新</span>
          </el-button>
          <el-button size="small" type="primary" v-popover:searchPopover>
            <span>高级搜索</span>
          </el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="multipleTable" size="small" stripe>
        <!-- <el-table-column v-if="!isAloneOrSlave" type="expand" label="更多" width="100px">
          <template slot-scope="props">
            <el-form label-position="right" inline class="table-expand" size="mini" label-width="100px">
              <el-form-item label="所属网络名称">
                <span>{{ props.row.ssid }}</span>
              </el-form-item>
              <el-form-item label="信道">
                <span>{{ props.row.channel }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>-->
        <el-table-column align="center" label="用户名称" prop="hostName">
          <template slot-scope="scope">
            <span>{{scope.row.hostName === 'Unknown' ? '-' : (scope.row.hostName || '-')}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="MAC地址" prop="mac"></el-table-column>
        <el-table-column align="center" label="IP地址" prop="userIp"></el-table-column>
        <el-table-column align="center" label="序列号" prop="sn"></el-table-column>
        <el-table-column align="center" label="关联时间" prop="onlineTime"></el-table-column>
        <el-table-column align="center" label="信号强度" prop="rssi"></el-table-column>
        <el-table-column align="center" label="速率" prop="rxrate"></el-table-column>
        <el-table-column align="center" label="频段" prop="band"></el-table-column>
        <el-table-column align="center" label="所属网络" prop="ssid"></el-table-column>
        <el-table-column align="center" label="信道" prop="channel" width="60"></el-table-column>
        <el-table-column align="center" label="状态" v-if="hasBwlist" width="120">
          <template slot-scope="scope">
            <el-button :loading="true" type="text" v-if="onLoadingStatus"></el-button>
            <el-button :disabled="true" type="text" v-else-if="isOffline(scope.row)">{{isOffline(scope.row, true)}}</el-button>
            <el-button type="text" v-auth="{fn:onOffline,params:scope.row}" v-else>踢下线</el-button>
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
        ? `当前是“白名单模式”，是否将 ${row.mac} 从白名单中移除？`
        : `当前是“黑名单模式”，是否将 ${row.mac} 添加到黑名单中？`
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
              `无法踢下线，最多支持配置 ${this.MAX_NUM} 个黑名单`
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
        _text = _stat && '已不在白名单中'
      } else {
        // deny
        _stat = this.macBwMap.includes(row.mac.toLocaleUpperCase()) // 在黑名单中
        _text = _stat && '已添加到黑名单'
      }
      _text = _text || '未被踢下线'
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

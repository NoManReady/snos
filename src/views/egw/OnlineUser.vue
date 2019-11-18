<template>
  <div class="home-userflow">
    <el-popover placement="bottom-end" ref="searchPopover" trigger="click" v-model="showSearch" width="400">
      <el-form :model="query" label-width="90px" ref="form">
        <el-form-item label="IP地址" size="small">
          <el-input class="w260" v-model="query.userIp"></el-input>
        </el-form-item>
        <el-form-item label="MAC地址" size="small">
          <el-input class="w260" v-model="query.mac"></el-input>
        </el-form-item>
        <el-form-item label="名称" size="small">
          <el-input class="w260" v-model="query.hostName"></el-input>
        </el-form-item>
        <el-form-item label="接入类型" size="small">
          <el-select class="w260" v-model="query.connectType">
            <el-option label="所有类型" value></el-option>
            <el-option label="有线" value="wire"></el-option>
            <el-option label="无线" value="wireless"></el-option>
            <el-option label="未知" value="unknow"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="onSearchList()" type="primary">搜索</el-button>
          <el-button @click="showSearch=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-popover>
    <help-alert json-key="userOnlineJson" title="在线用户">
      <div slot="content">
        <p>
          查看接入到本设备的终端（或主机）的连接信息，接入类型包含
          <span class="c-warning">有线</span>、
          <span class="c-warning">无线</span> 和
          <span class="c-warning">未知</span>。
        </p>
        <p>有线：可以识别出自组网里的EAP设备。</p>
        <p>无线：可以识别出关联在自组网里EAP下的无线终端。</p>
        <p>未知：除以上类型外其他终端都属于未知，可能是关联在其他AP的无线设备或是直连在内网的有线设备。</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          在线用户
          <small></small>
        </span>
        <div class="fr">
          <el-form size="small">
            <!-- <el-input size="small" class="w220" clearable v-model="filter" placeholder="根据IP地址查找用户">
              <el-button slot="append" icon="el-icon-search" @click.native="_initPage" size="small"></el-button>
            </el-input>-->
            <el-button @click="onRefresh" size="small" type="primary">
              <i class="el-icon-refresh"></i>
              <span>刷新</span>
            </el-button>
            <el-button size="small" type="primary" v-popover:searchPopover>
              <span>高级搜索</span>
            </el-button>
          </el-form>
        </div>
      </div>
      <el-table :data="pageList" class="has-banner" size="small" stripe>
        <el-table-column align="center" label="IP地址" prop="userIp" width="130">
          <template slot-scope="{row}">
            <div class="banner-wrap">
              {{ row.userIp }}
              <div class="banner" v-if="currentIp===row.userIp">
                <span>自己</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="MAC地址" prop="mac"></el-table-column>
        <el-table-column label="名称" prop="hostName"></el-table-column>
        <el-table-column label="接入类型">
          <template slot-scope="{row}">
            <!-- <el-tag size="mini" v-if="row.userIp===currentIp">我</el-tag> -->
            <el-tag size="mini" type="success" v-if="row.connectType==='wire'">有线</el-tag>
            <el-tag size="mini" type="success" v-else-if="row.connectType==='wireless'">无线</el-tag>
            <el-tag size="mini" type="info" v-else-if="row.connectType==='unknow'">未知</el-tag>
            <el-tag size="mini" type="warning" v-else>未知</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="实时流量">
          <template slot-scope="{row}">
            <div v-if="row.connectType==='wireless'">
              <p>上行:{{ scope.row.up||0 | rateTrans }}B</p>
              <p>下行:{{ scope.row.down||0 | rateTrans }}B</p>
            </div>
            <span v-else title="无线接入的用户才有此信息">--</span>
          </template>
        </el-table-column>-->
        <el-table-column label="当前速率" min-width="110">
          <div slot-scope="scope">
            <p>上行:{{ (scope.row.flowUp||0) | rateTrans }}bps</p>
            <p>下行:{{ (scope.row.flowDown||0) | rateTrans }}bps</p>
          </div>
        </el-table-column>
        <el-table-column label="无线信息">
          <template slot-scope="{row}">
            <div v-if="row.connectType==='wireless'">
              <p>信道：{{row.channel}}</p>
              <p>信号强度：{{row.rssi}}</p>
              <p>在线时间：{{ row.activeTime|formatTime }}</p>
              <p>协商速率：{{ row.rxrate }}</p>
            </div>
            <span title="无线接入的用户才有此信息" v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="访问控制" width="80">
          <template slot-scope="scope">
            <el-button @click.native="_onGoTimeLimit(scope.row)" type="text">前往</el-button>
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
import { Tag } from 'element-ui'
import pageMixins from '@/mixins/pageMixins'
import { rateTrans } from '@/utils/utils'
import { formatTime } from '@/filters/time'
let timeInterval = null
export default {
  name: 'UserFlow',
  data() {
    return {
      filter: '',
      query: {
        userIp: '',
        mac: '',
        hostName: '',
        connectType: ''
      },
      showSearch: false,
      currentIp: APP_CURRENT_IP
    }
  },
  components: {
    [Tag.name]: Tag
  },
  mixins: [pageMixins],
  filters: {
    rateTrans,
    formatTime
  },
  methods: {
    // 加载用户流量
    async _loadList(isSilence) {
      let d = await this.$api.userList(isSilence)
      let list = Array.isArray(d.list) ? d.list : []
      return list
    },
    onSearchList() {
      this.searchList(this.query)
    },
    // 刷新
    onRefresh() {
      this.filter = ''
      this._initPage()
    },
    // 跳转至行为时间控制tab
    _onGoTimeLimit(item) {
      this.$router.push({
        name: 'admin/alone/behavior/behavior_acl',
        query: { tab: '0', mac: item.mac, hostName: item.hostName || '' }
      })
    },
    sortFlowUp(a, b) {
      return parseInt(a.up) > parseInt(b.up)
    },
    sortFlowDown(a, b) {
      return parseInt(a.down) > parseInt(b.down)
    },
    sortFlowNum(a, b) {
      return parseInt(a.flowNum) > parseInt(b.flowNum)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

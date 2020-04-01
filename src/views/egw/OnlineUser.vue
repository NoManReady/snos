<template>
  <div class="home-userflow">
    <el-popover placement="bottom-end" ref="searchPopover" trigger="click" v-model="showSearch" width="400">
      <el-form :model="query" label-width="90px" ref="form" size="medium">
        <el-form-item :label="$t('egw.ip')">
          <el-input class="w260" v-model="query.userIp"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.mac')">
          <el-input class="w260" v-model="query.mac"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.account')">
          <el-input class="w260" v-model="query.hostName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.enter_type')">
          <el-select class="w260" v-model="query.connectType">
            <el-option :label="$t('egw.all_type')" value></el-option>
            <el-option :label="$t('egw.wire')" value="wire"></el-option>
            <el-option :label="$t('egw.wireless')" value="wireless"></el-option>
            <el-option :label="$t('egw.unknow')" value="unknow"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="onSearchList" class="w120" type="primary">{{$t('phrase.search')}}</el-button>
          <el-button @click="showSearch=false" class="w120">{{$t('action.cancel')}}</el-button>
        </el-form-item>
      </el-form>
    </el-popover>
    <help-alert :title="$t('egw.online_user')" json-key="userOnlineJson">
      <div slot="content">
        <p>
          {{$t('egw.read_link_info_tip')}}
          <span class="c-warning">{{$t('egw.wire')}}</span>{{$t('symbol.comma')}}
          <span class="c-warning">{{$t('egw.wireless')}}</span>
          {{$t('egw.and')}}
          <span class="c-warning">{{$t('egw.unknow')}}</span>{{$t('symbol.period')}}
        </p>
        <p>{{$t('egw.wire_tip')}}</p>
        <p>{{$t('egw.wireless_tip')}}</p>
        <p>{{$t('egw.unknow_tip')}}</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.online_user')}}
          <small></small>
        </span>
        <div class="fr">
          <!-- <el-input size="medium" class="w220" clearable v-model="filter" placeholder="根据IP地址查找用户">
              <el-button slot="append" icon="el-icon-search" @click.native="_initPage"></el-button>
          </el-input>-->
          <el-button @click="onRefresh" icon="el-icon-refresh" plain size="medium" type="primary">{{$t('action.refresh')}}</el-button>
          <el-button icon="el-icon-search" plain size="medium" type="primary" v-popover:searchPopover>{{$t('egw.search_advance')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" class="has-banner" size="medium" stripe>
        <el-table-column :label="$t('egw.account')" align="center" prop="hostName">
          <template slot-scope="{row}">
            <div class="banner-wrap">
              {{ row.hostName || '--'}}
              <div class="banner" v-if="currentIp===row.userIp">
                <span>{{$t('egw.self')}}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('egw.ip')" align="center" prop="userIp" width="130"></el-table-column>
        <el-table-column :label="$t('egw.mac')" align="center" prop="mac"></el-table-column>
        <el-table-column :label="$t('egw.enter_type')" align="center">
          <template slot-scope="{row}">
            <!-- <el-tag size="mini" v-if="row.userIp===currentIp">我</el-tag> -->
            <el-tag size="mini" type="success" v-if="row.connectType==='wire'">{{$t('egw.wire')}}</el-tag>
            <el-tag size="mini" type="success" v-else-if="row.connectType==='wireless'">{{$t('egw.wireless')}}</el-tag>
            <el-tag size="mini" type="info" v-else-if="row.connectType==='unknow'">{{$t('egw.unknow')}}</el-tag>
            <el-tag size="mini" type="warning" v-else>{[{{$t('egw.unknow')}}]}</el-tag>
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
        <el-table-column :label="$t('egw.speed_now')" align="left" min-width="110" v-if="!isEhr">
          <div slot-scope="scope">
            <p>{{$t('egw.up')}}{{ (scope.row.flowUp||0) | rateTrans }}bps</p>
            <p>{{$t('egw.down')}}{{ (scope.row.flowDown||0) | rateTrans }}bps</p>
          </div>
        </el-table-column>
        <el-table-column :label="$t('egw.wireless_info')">
          <template slot-scope="{row}">
            <div v-if="row.connectType==='wireless'">
              <p>{{$t('egw.channel')}}{{row.channel}}</p>
              <p>{{$t('egw.rscp')}}{{row.rssi}}</p>
              <p>{{$t('egw.online_times')}}{{ row.activeTime|formatTime }}</p>
              <p>{{$t('egw.negotiation_rate')}}{{ row.rxrate }}</p>
            </div>
            <span :title="$t('egw.info_by_link')" v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('egw.acl')" align="center" width="80">
          <template slot-scope="scope">
            <el-button @click.native="_onGoTimeLimit(scope.row)" size="medium" type="text">{{$t('egw.item')}}</el-button>
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
  computed: {
    isEhr() {
      return this.$roles().includes('ehr')
    }
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

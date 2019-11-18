<template>
  <div class="pdmanage-arp">
    <help-alert>
      <div slot="content">
        <p class="mt10">设备学习连接在设备各接口上的网络设备IP与MAC对应表。</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          ARP列表
          <small></small>
        </span>
        <div class="fr">
          <el-input class="w220 mr10" clearable placeholder="根据IP/MAC地址查找" size="small" v-model="filter">
            <el-button @click.native="_initPage()" icon="el-icon-search" size="small" slot="append"></el-button>
          </el-input>
          <el-button @click.native="_onRefresh" size="small" type="primary">
            <i class="el-icon-refresh"></i>
            <span>刷新</span>
          </el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" row-key="`${ip}_${mac}`" size="small" stripe>
        <el-table-column align="center" label="序号" width="60">
          <template slot-scope="{$index}">{{$index+1+(pageModel.page-1)*pageModel.size}}</template>
        </el-table-column>
        <el-table-column align="center" label="IP地址" min-width="120px" prop="ip"></el-table-column>
        <el-table-column align="center" label="MAC地址" min-width="120px" prop="mac"></el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.page"
        :page-size="pageModel.size"
        :page-sizes="pageModel.sizes"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        background
        class="mt20"
        hide-on-single-page
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/msw/pageMixins'
export default {
  name: 'arp-static',
  data() {
    return {
      filter: ''
    }
  },
  mixins: [pageMixins],
  methods: {
    async _loadList() {
      let _result = await this.$api.getArpTable()
      let _filterList = _result.filter(arp => {
        return (
          arp.ip.indexOf(this.filter) > -1 || arp.mac.indexOf(this.filter) > -1
        )
      })
      return _filterList
    },
    _onRefresh() {
      this.filter = ''
      this._initPage()
    }
  }
}
</script>
<style lang="scss" scoped>
.pdmanage-arp {
  .inline {
    display: inline-block;
  }
}
</style>

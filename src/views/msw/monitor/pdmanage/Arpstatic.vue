<template>
  <div class="pdmanage-arp">
    <help-alert :title="$t('msw.mac.arp_addr_list')">
      <div slot="content">
        <i18n path="msw.mac.arp_notice_tip">
          <b>{{$t('phrase.explain_f')}}</b>
        </i18n>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('msw.mac.arp_addr_list')}}
          <small></small>
        </span>
        <div class="fr">
          <el-form class="fr inline-tip view-form" inline inline-message size="medium">
            <el-form-item>
              <el-input :placeholder="$t('msw.mac.search_by_ipmac')" class="w280" clearable v-model="filter">
                <el-button @click.native="_initPage()" icon="el-icon-search" slot="append"></el-button>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click.native="_onRefresh" icon="el-icon-refresh" plain type="primary">{{$t('action.refresh')}}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" row-key="`${ip}_${mac}`" size="medium" stripe>
        <el-table-column :label="$t('phrase.serial')" align="center" width="60">
          <template slot-scope="{$index}">{{$index+1+(pageModel.page-1)*pageModel.size}}</template>
        </el-table-column>
        <el-table-column :label="$t('msw.mac.ip_addr')" align="center" min-width="120px" prop="ip"></el-table-column>
        <el-table-column :label="$t('msw.mac.mac_addr')" align="center" min-width="120px" prop="mac"></el-table-column>
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

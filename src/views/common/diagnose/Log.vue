<template>
  <div class="diagnose-log">
    <help-alert json-key="exampleJson" title="日志说明">
      <div slot="content">查看系统日志。</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          日志列表
          <small></small>
        </span>
        <div class="fr">
          <el-autocomplete :fetch-suggestions="querySearch" placeholder="查找相关配置" size="small" v-model="filter">
            <template slot-scope="props">
              <div class="name">{{ props.item.value }}</div>
            </template>
            <el-button @click.native="onFilterLog()" icon="el-icon-search" size="small" slot="append"></el-button>
          </el-autocomplete>
        </div>
      </div>
      <el-table :data="pageList" size="small" stripe>
        <el-table-column :sortable="true" align="center" label="时间" prop="date" width="160px"></el-table-column>
        <el-table-column :sortable="true" align="center" label="debug级别" prop="debug"></el-table-column>
        <el-table-column :sortable="true" align="center" label="模块" prop="model"></el-table-column>
        <el-table-column header-align="center" label="详细" min-width="350px" prop="info"></el-table-column>
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
import pageMixins from '@/mixins/pageMixins'
export default {
  name: 'DiagnoseLog',
  data() {
    return {
      filter: '',
      query: [],
      allLogData: []
    }
  },
  mixins: [pageMixins],
  methods: {
    async _loadList() {
      this.allLogData = await this.$api.getSysLog()
      this.allLogData = this.allLogData != '' ? this.allLogData.split('\n') : []
      return this.formatData(this.allLogData, true)
    },
    formatData(data = [], isGetQuery) {
      let splitData = []

      const clip = (end, space) => splitData.splice(0, end).join(space || '')

      return data.map(item => {
        splitData = item.split(/\s+/)
        let date = clip(3, ' '),
          rj = clip(1),
          debug = clip(1),
          model = clip(1),
          info = splitData.join(' ')

        if (isGetQuery) this.getQuery(debug)

        return {
          info: info,
          date: date,
          debug: debug,
          model: model.replace(':', '')
        }
      })
    },
    getQuery(debug) {
      let hasDebug = this.query.find(d => d.value === debug)
      if (!hasDebug) this.query.push({ value: debug })
    },
    onFilterLog() {
      let filterData = this.allLogData.filter(d => d.search(this.filter) >= 0)
      this.pageModel.allItem = this.formatData(filterData)
      this.onCurrentChange(1)
    },
    querySearch(string, cb) {
      cb(this.query)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

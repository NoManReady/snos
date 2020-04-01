<template>
  <div class="menuout-conntrace">
    <help-alert :title="$t('egw.flow_table_num_page')" json-key>
      <div slot="content"></div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.flow_table_num_page')}}
          <small></small>
        </span>
        <div class="fr">
          <el-input :placeholder="$t('egw.search_by_dport')" class="w300" clearable size="medium" v-model="filter">
            <el-button @click.native="_onSearch" icon="el-icon-search" slot="append">{{$t('phrase.search')}}</el-button>
          </el-input>
          <!-- <el-button @click="onRefresh" clearable icon="el-icon-refresh" size="medium" type="primary">刷新</el-button> -->
          <el-button size="medium" type="primary" v-popover:propsPopover>
            <span>{{$t('egw.filter')}}</span>
          </el-button>
          <el-popover placement="bottom-end" ref="propsPopover" trigger="click" v-model="showProp" width="140">
            <el-row class="pl20">
              <el-col :key="col.key" :span="24" class="mt10" v-for="col in cols">
                <el-checkbox :disabled="col.key === 'in_ip'" :label="col.label" v-model="col.show"></el-checkbox>
              </el-col>
            </el-row>
          </el-popover>
        </div>
      </div>
      <el-table :data="pageList" ref="multipleTable" row-key="macaddr" size="medium" stripe>
        <el-table-column :key="col.key" :label="col.label" :prop="col.key" v-for="col in showCols">
          <template slot-scope="scope">
            <div>{{scope.row[col.key]}}</div>
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
import pageMixins from '@/mixins/pageMixins'
export default {
  name: 'MenuOutAudit',
  data() {
    return {
      showProp: false,
      appNameDetail: '',
      filter: '',
      mover: null,
      cols: [
        {
          label: 'protocol',
          key: 'protocol',
          show: true
        },
        {
          label: 'aging_time',
          key: 'aging_time',
          show: true
        },
        {
          label: 'state1',
          key: 'state1',
          show: true
        },
        {
          label: 'src',
          key: 'src',
          show: true
        },
        {
          label: 'dst',
          key: 'dst',
          show: true
        },
        {
          label: 'sport',
          key: 'sport',
          show: true
        },
        {
          label: 'dport',
          key: 'dport',
          show: true
        },
        {
          label: 'packets',
          key: 'packets',
          show: true
        },
        {
          label: 'bytes',
          key: 'bytes',
          show: true
        },
        {
          label: 'state2',
          key: 'state2',
          show: true
        },
        {
          label: 'src_down',
          key: 'src_down',
          show: true
        },
        {
          label: 'dst_down',
          key: 'dst_down',
          show: true
        },
        {
          label: 'sport_down',
          key: 'sport_down',
          show: true
        },
        {
          label: 'dport_down',
          key: 'dport_down',
          show: true
        },
        {
          label: 'packets_down',
          key: 'packets_down',
          show: true
        },
        {
          label: 'bytes_down',
          key: 'bytes_down',
          show: true
        },
        {
          label: 'mark',
          key: 'mark',
          show: true
        },
        {
          label: 'use',
          key: 'use',
          show: true
        }
      ]
    }
  },
  computed: {
    showCols() {
      return this.cols.filter(o => o.show)
    }
  },
  mixins: [pageMixins],
  methods: {
    async _loadList() {
      let data = await this.$api.cmd(
        'devSta.get',
        {
          module: 'content_audit',
          data: { func: 'ca_get_nf_conntrace' }
        },
        { timeout: 0 }
      ) // 流表信息可能很多，设置最大超时
      if (data === null) {
        this.$message.info(I18N.t('egw.flow_response_error'))
        setTimeout(() => {
          this._initPage()
        }, 100)
        return []
      }
      let list = typeof data === 'string' ? JSON.parse(data) : data // 流表信息很大时，后端返回的数据可能无法转成json格式
      let _f = this.filter || ''
      const _includes = v => {
        if (v) {
          return v.includes(_f)
        }
        return false
      }
      return list.filter(o => {
        return (
          _includes(o.src) ||
          _includes(o.dst) ||
          _includes(o.sport) ||
          _includes(o.dport)
        )
      })
    },
    _onSearch() {
      // this.searchListFuzzy(this.filter, 'src')
      this._initPage()
    },
    async onRefresh() {
      await this._initPage()
      this.filter = ''
      this.searchListFuzzy('', '')
    }
  }
}
</script>
<style lang="scss" scoped>
.menuout-conntrace {
  .new-tip {
    color: white;
    width: 50px;
    height: 10px;
    background: #ee2e02;
    -moz-border-radius: 100px/50px;
    -webkit-border-radius: 100px/50px;
    border-radius: 100px/50px;
    padding: 0 5px;
  }
  .inblock {
    display: inline-block;
  }
}
</style>

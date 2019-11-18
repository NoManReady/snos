<template>
  <div class="menuout-audit">
    <help-alert json-key title="流表信息页面">
      <div slot="content"></div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          流表信息列表
          <small></small>
        </span>
        <div class="fr">
          <el-form size="small">
            <el-input class="w300" clearable placeholder="根据内网IP查找，为空查询所有" size="small" v-model="filter">
              <el-button @click.native="_onSearch()" icon="el-icon-search" size="small" slot="append">刷新</el-button>
            </el-input>
            <!-- <el-button size="small" type="primary" @click="onRefresh" clearable>
              <i class="el-icon-refresh"></i>
              <span>刷新</span>
            </el-button>-->
            <el-button size="small" type="primary" v-popover:propsPopover>
              <span>列表筛选</span>
            </el-button>
          </el-form>
          <el-popover placement="bottom-end" ref="propsPopover" trigger="click" v-model="showProp" width="140">
            <el-form ref="filterForm">
              <el-row class="pl20">
                <el-col :key="col.key" :span="24" class="mt10" v-for="col in cols">
                  <el-checkbox :disabled="col.key === 'in_ip'" :label="col.label" v-model="col.show"></el-checkbox>
                </el-col>
              </el-row>
            </el-form>
          </el-popover>
        </div>
      </div>
      <el-table :data="pageList" ref="multipleTable" row-key="macaddr" size="small" stripe>
        <el-table-column align="center" label="序号" type="index"></el-table-column>
        <el-table-column
          :align="col.key === 'app_index' ? 'right' : 'center'"
          :key="col.key"
          :label="col.label"
          :label-class-name="col.key === 'app_index' ? 'pr15' : ''"
          :prop="col.key"
          v-for="col in cols"
          v-if="col.show"
        >
          <template slot-scope="scope">
            <!-- <el-popover placement="top" min-width="300px" @show="_onGetAppname(scope.row[col.key])" @hide="appNameDetail = ''" trigger="click" title="" v-if="col.key === 'app_index'">
              <el-button type="text" v-if="appNameDetail === ''" :loading="true">正在获取应用名称</el-button>
              <div v-else>
                {{appNameDetail}}
              </div>
              <a class="c-success pointer" slot="reference">{{scope.row[col.key]}}
                <i class="inblock">
                  <sup class="new-tip">详细</sup>
                </i>
              </a>
            </el-popover>-->
            <el-tooltip :open-delay="800" placement="left" v-if="col.key === 'app_index'">
              <div slot="content">
                <div v-if="appNameDetail === ''">
                  <i class="el-icon-loading"></i>正在获取应用名称
                </div>
                <div v-else>{{appNameDetail}}</div>
              </div>
              <a
                @click="_onGetAppname(scope.row[col.key], true)"
                @mouseenter="_onGetAppname(scope.row[col.key])"
                @mouseleave="_stopGetAppname()"
                class="c-success pointer"
              >
                {{scope.row[col.key]}}
                <i class="inblock">
                  <sup class="new-tip">详细</sup>
                </i>
              </a>
            </el-tooltip>
            <div v-else>{{scope.row[col.key]}}</div>
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
import { Col, Row, Tree } from 'element-ui'
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
          label: '内网IP',
          key: 'in_ip',
          show: true
        },
        {
          label: '内网端口',
          key: 'in_port',
          show: true
        },
        {
          label: '外网IP',
          key: 'out_ip',
          show: true
        },
        {
          label: '外网端口',
          key: 'out_port',
          show: true
        },
        {
          label: '应用索引',
          key: 'app_index',
          show: true
        },
        {
          label: '是否阻断',
          key: 'is_deny',
          show: true
        },
        {
          label: 'app_id',
          key: 'app_id',
          show: false
        },
        {
          label: 'app_type',
          key: 'app_type',
          show: false
        },
        {
          label: 'url_audit',
          key: 'url_audit',
          show: false
        },
        {
          label: 'flow_flag',
          key: 'flow_flag',
          show: false
        },
        {
          label: 'fastpath',
          key: 'fastpath',
          show: false
        }
      ]
    }
  },
  mixins: [pageMixins],
  components: {
    [Col.name]: Col,
    [Row.name]: Row
  },
  methods: {
    async _loadList() {
      let data = await this.$api.cmd(
        'devSta.get',
        {
          module: 'content_audit',
          data: { func: 'ca_get_flow_info', ip: this.filter }
        },
        { timeout: 0 }
      ) // 流表信息可能很多，设置最大超时
      if (data === null) {
        this.$message.info(
          '流表返回异常，可能是流表信息过大，正在尝试重新获取信息...'
        )
        setTimeout(() => {
          this._initPage()
        }, 100)
        return []
      }
      return typeof data === 'string' ? JSON.parse(data) : data // 流表信息很大时，后端返回的数据可能无法转成json格式
    },
    _onSearch() {
      // this.searchListFuzzy(this.filter, 'in_ip')
      this._initPage()
    },
    async onRefresh() {
      await this._initPage()
      this.filter = ''
      this.searchListFuzzy('', '')
    },
    _onGetAppname(index, isClick = false) {
      this.mover && clearTimeout(this.mover)

      this.appNameDetail = ''
      this.mover = setTimeout(
        async () => {
          let appName = await this.$api.cmd(
            'devSta.get',
            {
              module: 'content_audit',
              data: { func: 'ca_get_app_name', app_index: index }
            },
            { timeout: 0, isSilence: true }
          )

          this.appNameDetail = appName.join(' ▶ ') //'社交软件 -> 即时通讯软件 -> 腾讯QQ  -> QQ-登录|聊天'
        },
        isClick ? 0 : 300
      )
    },
    _stopGetAppname() {
      clearTimeout(this.mover)
      this.mover = null
    }
  }
}
</script>
<style lang="scss" scoped>
.menuout-audit {
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

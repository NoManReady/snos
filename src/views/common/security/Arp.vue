<template>
  <div class="security-arp">
    <help-alert :json-key="showMacFilter ? 'arpJson' : 'arpJsonLite'" title="ARP列表页面">
      <div slot="content">
        <p class="mt10">设备学习连接在设备各接口上的网络设备IP与MAC对应表。可以对ARP列表表项进行绑定和过滤操作。</p>
        <p class="mt10">
          您可以在
          <a @click="onToPag('admin/alone/security/security_arpbind')" class="c-success pointer">“MAC绑定”</a>页面进行批量删除解绑操作。
          <span v-if="showMacFilter">
            您可以在
            <a @click="onToPag('admin/alone/security/security_macfilter')" class="c-success pointer">“MAC过滤”</a>页面进行批量删除规则操作。
          </span>
        </p>
      </div>
      <div slot="collapseFoot">
        <h3>注意：</h3>
        <p v-if="showMacFilter">ARP列表中，已绑定或者已过滤的表项，无法被选中进行批量绑定或者批量过滤的操作。</p>
        <p v-else>ARP列表中，已绑定的表项，无法被选中进行批量绑定操作。</p>
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
          <el-button size="small" type="primary" v-auth="onAdd">
            <span>批量绑定</span>
          </el-button>
          <el-button size="small" type="primary" v-auth="onAddFilter" v-if="showMacFilter">
            <span>批量过滤</span>
          </el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" row-key="`${ip}_${mac}`" size="small" stripe>
        <el-table-column :selectable="isSelectable" align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="序号" type="index"></el-table-column>
        <el-table-column align="center" label="IP地址" min-width="120px" prop="ip"></el-table-column>
        <el-table-column align="center" label="MAC地址" min-width="120px" prop="mac"></el-table-column>
        <el-table-column align="center" label="状态" min-width="160px">
          <template slot-scope="scope">
            <div class="w70 inline">
              <el-button :loading="true" type="text" v-if="isLoadMacBind"></el-button>
              <el-button
                title="添加到MAC绑定列表"
                type="text"
                v-auth="{fn:onAdd,params:scope.row}"
                v-else-if="!isStaticArp(scope.row)"
              >MAC绑定</el-button>
              <el-button :disabled="true" type="text" v-else>已绑定</el-button>
            </div>
            <div class="w70 inline" v-if="showMacFilter">
              <el-button :loading="true" type="text" v-if="isLoadMacFilter"></el-button>
              <el-button
                title="添加到MAC过滤规则"
                type="text"
                v-auth="{fn:onAddFilter,params:scope.row}"
                v-else-if="!isMacFilter(scope.row)"
              >MAC过滤</el-button>
              <el-button :disabled="true" type="text" v-else>已过滤</el-button>
            </div>
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
  name: 'SecurityArp',
  data() {
    return {
      arpStaticList: [],
      arpStaticMax: 256,
      arpFilterList: [],
      arpFilterMax: 80,
      isLoadMacBind: true,
      isLoadMacFilter: true,
      filter: ''
    }
  },
  mixins: [pageMixins],
  computed: {
    arpStaticMap() {
      return (
        this.arpStaticList.map(item => item.macaddr.toLocaleUpperCase()) || []
      )
    },
    macFilterMap() {
      return this.arpFilterList.map(item => item.mac.toLocaleUpperCase()) || []
    },
    showMacFilter() {
      return this.$store.getters.roles.includes('egEnable')
    }
  },
  methods: {
    async _loadList() {
      let _result = await this.$api.getArpTable()
      if (!this.filter) {
        this.getArpStatic()
        if (this.showMacFilter) {
          this.getMacFilter()
        }
      }
      return _result.filter(arp => {
        return (
          arp.ip.indexOf(this.filter) > -1 || arp.mac.indexOf(this.filter) > -1
        )
      })
    },
    _onRefresh() {
      this.filter = ''
      this._initPage()
    },
    getArpStatic() {
      return new Promise(async (res, rej) => {
        let _data = await this.$api.getStaticArpTable()
        this.arpStaticList = _data.arp_static || []
        this.arpStaticMax = +(_data.maxLen || 256)
        this.isLoadMacBind = false
      })
    },
    getMacFilter() {
      return new Promise(async (res, rej) => {
        let _data = await this.$api.getMacFilter()
        this.arpFilterList = _data.list || []
        this.arpFilterMax = +(_data.maxLen || 80)
        this.isLoadMacFilter = false
      })
    },
    onAdd(item) {
      let _items = []
      if (item) {
        _items = [item]
      } else {
        _items = this.$refs.baseTable.selection
        if (_items.length === 0) {
          return this.$message.warning('请选择要执行IP-MAC绑定的列表项')
        }
      }
      _items = _items.filter(ite => !this.isStaticArp(ite))
      if (_items.length === 0) {
        return this.$message.warning('IP-MAC已绑定')
      }
      let _leftNum = this.arpStaticMax - this.arpStaticList.length
      if (_items.length > _leftNum) {
        return this.$message.warning(
          `最大支持绑定${this.arpStaticMax}个，已绑定${this.arpStaticList.length}，可再绑定${_leftNum}个`
        )
      }
      this.$confirm('确认添加到MAC绑定列表中?').then(() => {
        let _addList = _items.map(item => ({
          macaddr: item.mac,
          ipaddr: item.ip
        }))
        this.$api.addStaticArpTable({ arp_list: _addList }).then(d => {
          this.arpStaticList.push(..._addList)
          this.$refs.baseTable.clearSelection()
        })
      })
    },
    onAddFilter(item) {
      let _items = []
      if (item) {
        _items = [item]
      } else {
        _items = this.$refs.baseTable.selection
        if (_items.length === 0) {
          return this.$message.warning('请选择要添加到MAC过滤规则的列表项')
        }
      }
      _items = _items.filter(ite => !this.isMacFilter(ite))
      if (_items.length === 0) {
        return this.$message.warning('MAC已过滤')
      }
      let _leftNum = this.arpFilterMax - this.arpFilterList.length
      if (_items.length > _leftNum) {
        return this.$message.warning(
          `最大支持绑定${this.arpFilterMax}个，已绑定${this.arpFilterList.length}，可再绑定${_leftNum}个`
        )
      }
      this.$confirm('确认添加到MAC过滤规则中?').then(() => {
        let _addList = _items.map(item => ({
          mac: item.mac,
          comment: item.ip
        }))
        this.$api.addMacFilter(_addList).then(d => {
          this.arpFilterList.push(..._addList)
          this.$refs.baseTable.clearSelection()
        })
      })
    },
    isStaticArp(row) {
      return this.arpStaticMap.includes(row.mac.toLocaleUpperCase())
    },
    isMacFilter(row) {
      return this.macFilterMap.includes(row.mac.toLocaleUpperCase())
    },
    isSelectable(row) {
      let _isUnBind = !this.isStaticArp(row)
      return this.showMacFilter
        ? _isUnBind || !this.isMacFilter(row)
        : _isUnBind
    },
    onToPag(name) {
      this.$router.push({ name: name })
    }
  }
}
</script>
<style lang="scss" scoped>
.security-arp {
  .inline {
    display: inline-block;
  }
}
</style>

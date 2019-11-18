<template>
  <div class="network-client">
    <help-alert json-key="dhcpClientJson" title="客户端列表">
      <div slot="content">您可以在本页面查看DHCP的客户端相关信息。</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          客户端列表
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="_initPage" size="small" type="primary">
            <i class="el-icon-refresh"></i>
            <span>刷新</span>
          </el-button>
          <el-button @click="onAddToStatic()" size="small" type="primary">
            <i class="el-icon-plus"></i>
            <span>批量添加静态地址</span>
          </el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="multipleTable" size="small" stripe>
        <el-table-column :selectable="isSelectable" align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="序号" type="index"></el-table-column>
        <el-table-column align="center" label="主机名" prop="hostname"></el-table-column>
        <el-table-column align="center" label="MAC地址" prop="mac">
          <template slot-scope="scope">{{scope.row.mac}}</template>
        </el-table-column>
        <el-table-column align="center" label="IP地址" prop="ip"></el-table-column>
        <el-table-column align="center" label="剩余租期" prop="leasetime"></el-table-column>
        <el-table-column align="center" label="状态">
          <template slot-scope="scope">
            <el-button :loading="true" type="text" v-if="onLoadingStatus"></el-button>
            <el-button @click="onAddToStatic(scope.row)" type="text" v-else-if="!isStaticDhcp(scope.row)">添加到静态地址</el-button>
            <el-button :disabled="true" type="text" v-else>已添加到静态地址</el-button>
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
  name: 'NetworkClient',
  data() {
    return {
      MAX_NUM: 300, // 静态地址最大支持数
      dhcpStatic: [],
      onLoadingStatus: true
    }
  },
  mixins: [pageMixins],
  computed: {
    staticDhcpMap() {
      let _staticDhcpMap = {}
      this.dhcpStatic.forEach(item => {
        let m = item.ipaddr + '&&' + item.macaddr.toLocaleLowerCase()
        if (!_staticDhcpMap[m]) _staticDhcpMap[m] = true
      })
      return _staticDhcpMap
    }
  },
  methods: {
    async _loadList() {
      let _result = await this.$api.cmd('devSta.get', { module: 'dhcp_lease' })
      this.getStaticDhcp()
      return _result.List || []
    },
    // 获取dhcp静态绑定
    getStaticDhcp() {
      return new Promise((res, rej) => {
        this.$api
          .getStaticDhcpTable()
          .then(data => {
            this.dhcpStatic = data.dhcp_static || []
            this.onLoadingStatus = false
            res()
          })
          .catch(() => {
            this.onLoadingStatus = false
            res()
          })
      })
    },
    // 添加至静态绑定
    onAddToStatic(row) {
      let d = []
      if (row) {
        d.push(this._getMacIp(row))
      } else {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning('请选择要添加到静态地址的表项')
        }

        selection.forEach(item => {
          d.push(this._getMacIp(item))
        })
      }
      if (this.dhcpStatic.length + d.length > this.MAX_NUM) {
        return this.$message.warning(`最多支持配置 ${this.MAX_NUM} 条静态绑定`)
      }
      this._onAdd(d)
    },
    // 添加至静态绑定
    _onAdd(list) {
      this.$confirm('确认添加到静态地址分配列表中?').then(() => {
        this.$api
          .addStaticDhcpTable(list)
          .then(() => {
            this.dhcpStatic.push(...list)
          })
          .finally(() => {
            this.$refs.multipleTable.clearSelection()
          })
      })
    },
    // 获取mac-ip数据对象数组
    _getMacIp(item) {
      return {
        macaddr: item.mac,
        ipaddr: item.ip
      }
    },
    // 判断是否已经绑定至静态dhcp
    isStaticDhcp(row) {
      let m = row.ip + '&&' + row.mac.toLocaleLowerCase()
      if (this.staticDhcpMap[m]) return true
      return false
    },
    // 是否可勾选
    isSelectable(row) {
      return !this.isStaticDhcp(row)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

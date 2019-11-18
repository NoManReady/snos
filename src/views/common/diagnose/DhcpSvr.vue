<template>
  <div class="diagnose-dhcp-svr">
    <help-alert json-key="estDhcpClientJson" title="地址服务器">
      <div slot="content">开启DHCP服务器后，可以为网络中的设备分配IP地址，方便登录不同的设备。该功能主要用于临时调试，因此开启30分钟后会自动关闭服务器。</div>
    </help-alert>
    <div class="box">
      <el-form label-width="160px">
        <el-form-item label="DHCP服务器开关">
          <el-switch :value="status" @change="onChange" active-value="on" inactive-value="off"></el-switch>
        </el-form-item>
      </el-form>
      <template v-if="status==='on'">
        <div class="box-header">
          <span class="box-header-tit">
            地址列表
            <small></small>
          </span>
          <div class="fr">
            <el-button @click.native="_initPage" size="small" type="primary">
              <i class="el-icon-refresh"></i>
              <span>刷新</span>
            </el-button>
          </div>
        </div>
        <el-table :data="pageList" ref="multipleTable" size="small" stripe>
          <!-- <el-table-column prop="hostname" label="主机名" align="center">
          </el-table-column>-->
          <el-table-column align="center" label="IP地址" prop="ip"></el-table-column>
          <el-table-column align="center" label="MAC地址" prop="mac"></el-table-column>
          <el-table-column align="center" label="剩余租期" prop="leasetime"></el-table-column>
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
      </template>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/pageMixins'
let time = null
export default {
  name: 'DiagnoseDhcpSvr',
  data() {
    return {
      status: 'off'
    }
  },
  mixins: [pageMixins],
  beforeDestroy() {
    clearTimeout(time)
    time = null
  },
  async created() {
    await this._loadStatus(true)
    this._initPage()
  },
  methods: {
    _loadList() {
      if (this.status === 'on') {
        return this._loadDhcpLease()
      }
      return []
    },
    async _loadStatus(isInit = false, isSilence = false) {
      let _svr = await this.$api.cmd(
        'devSta.get',
        { module: 'dhcp_svr' },
        { isSilence }
      )
      this.status = _svr.status

      if (isInit || time) {
        time = setTimeout(() => {
          this._loadStatus(false, true)
        }, 30000)
      }
    },
    async _loadDhcpLease() {
      let _result = await this.$api.cmd('devSta.get', { module: 'dhcp_lease' })
      return _result.List || []
    },
    async onChange(v) {
      await this.$confirm(`确认${v === 'on' ? '开启' : '关闭'}DHCP服务器?`)
      let _res = await this.$api.cmd(
        'devSta.set',
        {
          module: 'dhcp_svr',
          async: true,
          data: {
            status: v
          }
        },
        {
          timeout: 60000
        }
      )
      if (_res.code === '0') {
        this.status = v
      } else if (_res.code === '2') {
        this.$message.error('开启失败，网络中已存在DHCP服务器')
      }
      if (this.status === 'on') {
        this._initPage()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

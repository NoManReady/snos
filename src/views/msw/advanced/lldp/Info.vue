<template>
  <div class="advanced-lldp-info">
    <!-- <help-alert title="生成树协议全局设置"></help-alert> -->
    <div class="box dev-info">
      <div class="box-header">
        <span class="box-header-tit">设备信息</span>
      </div>
      <el-form label-width="160px" ref="baseForm" size="mini" class="view-form">
        <el-row>
          <el-col :span="12" :xs="24">
            <el-form-item label="设备类型：" prop="cha_type">
              <span>{{lldpInfo.cha_type}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="设备ID：" prop="cha_id">
              <span>{{lldpInfo.cha_id}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="系统名称：" prop="sys_name">
              <span>{{lldpInfo.sys_name}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="系统描述：" prop="sys_desc">
              <span>{{lldpInfo.sys_desc}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="支持的系统功能：" prop="sys_cap_support">
              <span>{{lldpInfo.sys_cap_support}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="启用系统功能：" prop="sys_cap_enabled">
              <span>{{lldpInfo.sys_cap_enabled}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="网络管理地址：" prop="manage_addr">
              <p :key="addr" v-for="addr in lldpInfo.manage_addr">{{addr}}</p>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="box dev-neighbor">
      <div class="box-header">
        <span class="box-header-tit">邻居信息</span>
      </div>
      <el-table :data="neighbors" :span-method="_spanMethods" border ref="baseTable" size="small">
        <el-table-column align="center" label="端口名称">
          <template slot-scope="{row}">
            <el-tooltip content="点击查看邻居信息" placement="top">
              <el-button @click.native="_onViewDetail(row)" type="text">{{row.local_intf}}</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备ID类型" prop="cha_type">
          <template slot-scope="{row}">
            <span>{{row.cha_type}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备ID" prop="cha_id">
          <template slot-scope="{row}">
            <span>{{row.cha_id}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="端口ID类型" prop="intf_type">
          <template slot-scope="{row}">
            <span>{{row.intf_type}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="端口ID" prop="intf">
          <template slot-scope="{row}">
            <span>{{row.intf}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="邻居系统" prop="sys_name">
          <template slot-scope="{row}">
            <span>{{row.sys_name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Time To Live(s)" prop="ttl">
          <template slot-scope="{row}">
            <span>{{row.ttl}}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-drawer
      :title="`【${viewItem.local_intf}】邻居详情`"
      :visible.sync="neiModalShow"
      :wrapperClosable="false"
      append-to-body
      direction="rtl"
      size="700px"
    >
      <div class="drawer-container">
        <div :key="info.cha_id" class="box" v-for="info in viewPortsInfo">
          <div class="box-header">
            <span class="box-header-tit">{{info.intf}}</span>
          </div>
          <el-form class="view-form" label-width="120px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="设备ID类型：">
                  <label>{{info.cha_type}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备ID：">
                  <label>{{info.cha_id}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="端口ID类型：">
                  <label>{{info.intf_type}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="端口ID：">
                  <label>{{info.intf}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系统名称：">
                  <label>{{info.sys_name||'--'}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="PVID：">
                  <label>{{info.pvid||'--'}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="VLAN 名称：">
                  <label>{{info.pvid_name||'--'}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Time To Live：">
                  <label>{{info.ttl||'--'}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="管理地址：">
                  <label>{{info.manage_addr.join(',')||'--'}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="系统描述：">
                  <label>{{info.sys_desc||'--'}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="支持的功能：">
                  <label>{{info.sys_cap_support||'--'}}</label>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="已启用功能：">
                  <label>{{info.sys_cap_enabled||'--'}}</label>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { Row, Col, Drawer } from 'element-ui'
export default {
  name: 'advanced-lldp-info',
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [Drawer.name]: Drawer
  },
  data() {
    return {
      lldpInfo: {
        cha_type: '',
        cha_id: '',
        sys_name: '',
        sys_desc: '',
        sys_cap_support: '',
        sys_cap_enabled: '',
        manage_addr: []
      },
      neighbors: [],
      neiModalShow: false,
      viewPortid: -1
    }
  },
  created() {
    this._loadNeighborConf()
    // this._loadNeighbors()
  },
  computed: {
    viewPortsInfo() {
      return this.neighbors.filter(nei => nei.lpid === this.viewPortid)
    },
    viewItem() {
      return this.neighbors.find(nei => nei.lpid === this.viewPortid) || {}
    }
  },
  methods: {
    // 加载配置
    async _loadNeighborConf() {
      let params = [
        { method: 'devSta.get', params: { module: 'lldp_local' } },
        { method: 'devSta.get', params: { module: 'lldp_nghbr' } }
      ]
      try {
        let [localInfo, neighbors] = await this.$api.cmd(
          'cmdArr',
          { params },
          { noParse: false }
        )
        this.lldpInfo = localInfo
        this.neighbors = this._setSpanConf(neighbors.list)
      } catch (error) {}
    },
    // 配置合并参数
    _setSpanConf(list) {
      let _cursor = 0
      return list.map((lis, i) => {
        let _newBegin = _cursor === i
        if (_newBegin) {
          _cursor += lis.num
        }
        return {
          ...lis,
          _newBegin
        }
      })
    },
    // 合并策略方法
    _spanMethods({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 && row.num > 1) {
        if (row._newBegin) {
          return {
            rowspan: row.num,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },
    // 查看详情
    _onViewDetail(row) {
      this.viewPortid = row.lpid
      this.neiModalShow = true
    }
  }
}
</script>

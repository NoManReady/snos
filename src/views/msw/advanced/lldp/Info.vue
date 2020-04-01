<template>
  <div class="advanced-lldp-info">
    <!-- <help-alert title="生成树协议全局设置"></help-alert> -->
    <div class="box dev-info">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.lldp.dev_info')}}</span>
      </div>
      <el-form class="view-form" label-width="160px" ref="baseForm" size="medium">
        <el-row>
          <el-col :span="12" :xs="24">
            <el-form-item :label="$t('msw.lldp.dev_type_f')" prop="cha_type">{{lldpInfo.cha_type}}</el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item :label="$t('msw.lldp.dev_id_f')" prop="cha_id">{{lldpInfo.cha_id}}</el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item :label="$t('msw.lldp.dev_name_f')" prop="sys_name">{{lldpInfo.sys_name}}</el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item :label="$t('msw.lldp.dev_desc_f')" prop="sys_desc">{{lldpInfo.sys_desc}}</el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item :label="$t('msw.lldp.supported_function_f')" prop="sys_cap_support">{{lldpInfo.sys_cap_support}}</el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item :label="$t('msw.lldp.enabled_function_f')" prop="sys_cap_enabled">{{lldpInfo.sys_cap_enabled}}</el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item :label="$t('msw.lldp.net_manage_addr_f')" prop="manage_addr">
              <p :key="addr" v-for="addr in lldpInfo.manage_addr">{{addr}}</p>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="box dev-neighbor">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.lldp.nei_info')}}</span>
      </div>
      <el-table :data="neighbors" :span-method="_spanMethods" border ref="baseTable">
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <el-tooltip :content="$t('msw.lldp.view_nei_info')" placement="top">
              <el-button @click.native="_onViewDetail(row)" type="text">{{row.local_intf}}</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.lldp.dev_id_type')" align="center" prop="cha_type">
          <template slot-scope="{row}">
            <span>{{row.cha_type}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.lldp.dev_id')" align="center" prop="cha_id">
          <template slot-scope="{row}">
            <span>{{row.cha_id}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.lldp.port_id_type')" align="center" prop="intf_type">
          <template slot-scope="{row}">
            <span>{{row.intf_type}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.lldp.port_id')" align="center" prop="intf">
          <template slot-scope="{row}">
            <span>{{row.intf}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.lldp.nei_sys')" align="center" prop="sys_name">
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
      :title="`【${viewItem.local_intf}】${$t('msw.lldp.nei_desc')}`"
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
          <el-form class="view-form" label-width="160px">
            <el-row>
              <el-col :span="12">
                <el-form-item :label="$t('msw.lldp.dev_id_type_f')">{{info.cha_type}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('msw.lldp.dev_id_f')">{{info.cha_id}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('msw.lldp.port_id_type_f')">{{info.intf_type}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('msw.lldp.port_id_f')">{{info.intf}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('msw.lldp.dev_name_f')">{{info.sys_name||'--'}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="PVID：">{{info.pvid||'--'}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('msw.lldp.vlan_name_f')">{{info.pvid_name||'--'}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Time To Live：">{{info.ttl||'--'}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('msw.lldp.manage_addr_f')">{{info.manage_addr.join(',')||'--'}}</el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item :label="$t('msw.lldp.dev_desc_f')">{{info.sys_desc||'--'}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('msw.lldp.supported_function_f')">{{info.sys_cap_support||'--'}}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('msw.lldp.enabled_function_f')">{{info.sys_cap_enabled||'--'}}</el-form-item>
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

<template>
  <div class="vlan-port">
    <div class="box">
      <div class="clearfix mb5">
        <span class="box-header-tit hide">端口列表</span>
        <div class="fr">
          <el-button icon="el-icon-edit" size="small" type="primary" v-auth="_onPatchEdit">批量设置端口VLAN</el-button>
        </div>
      </div>
      <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="small" stripe>
        <el-table-column align="center" label="端口">
          <template slot-scope="{row}">
            <span>{{row.interface}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="端口类型">
          <template slot-scope="{row}">
            <span v-if="row.mode===0">HYBRID</span>
            <span v-if="row.mode===1">ACCESS</span>
            <span v-if="row.mode===2">TRUNK</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Access VLAN">
          <template slot-scope="{row}">
            <span v-if="row.mode===1">{{row.pvid}}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Native VLAN">
          <template slot-scope="{row}">
            <span v-if="row.mode!==1">{{row.pvid}}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Permit VLAN">
          <template slot-scope="{row}">
            <span>{{row.permitvlan||'--'}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center" label="Untag VLAN">
          <template slot-scope="{row}">
            <span>{{row.untagvlan||'--'}}</span>
          </template>
        </el-table-column>-->
        <el-table-column align="center" label="操作">
          <template slot-scope="{row,$index}">
            <span class="c-info" v-if="row.aggregate_port>0">当前口属于lag{{row.aggregate_port}},不可配置</span>
            <el-button size="mini" type="text" v-auth="{fn:_onEdit,params:$index}" v-else>修改</el-button>
          </template>
        </el-table-column>
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
      <!-- baseModal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="650px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="small">
          <el-form-item label="端口模式：" prop="mode">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.mode">
              <!-- <el-option :value="0" label="Hybrid口"></el-option> -->
              <el-option :value="1" label="Access口"></el-option>
              <el-option :value="2" label="Trunk口"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="baseModel.mode===1?'Access VLAN：':'Native VLAN：'" prop="pvid">
            <el-select class="w200" filterable placeholder="请选择" v-model="baseModel.pvid">
              <el-option :key="v.v" :label="v.v" :value="v.v" v-for="v in vlanList"></el-option>
            </el-select>
            <el-button @click.native="_onCreateVlan" class="fs12" type="text" v-if="vlanList.length===0">请先创建VLAN</el-button>
          </el-form-item>
          <template v-if="baseModel.mode!==1">
            <el-form-item label="允许通过的VLAN：" prop="permitvlan">
              <el-input class="w200" placeholder="VLAN范围如(3-5,100)" v-model="baseModel.permitvlan"></el-input>
            </el-form-item>
            <!-- <el-form-item label="Untag VALN：" prop="untagvlan" v-if="baseModel.mode===0">
              <el-input class="w200" placeholder="VLAN范围如(3-5,100)" v-model="baseModel.untagvlan"></el-input>
            </el-form-item>-->
          </template>
          <template v-if="editIndex===-1">
            <el-form-item class="inline-message" inline-message label="选择端口：" prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />
          </template>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false" size="small">取 消</el-button>
          <el-button :loading="isLoading" @click="_onModalConfirm" size="small" type="primary">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { getArrayStr } from '@/utils/utils'
import { portVlan } from '@/model/msw/port'
import { vlanidValidator } from '@/utils/rules'
import { mapGetters } from 'vuex'
import bus from '@/utils/bus'
export default {
  name: 'vlan-port',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    const untagValidator = (r, v, cb) => {
      if (!this.baseModel.untagvlan) {
        return cb()
      }
      let _vlans = getArrayStr(this.baseModel.untagvlan)
      if (!_vlans.includes(this.baseModel.pvid)) {
        return cb(new Error(`Untag VLAN必须包含Native VLAN`))
      }
      cb()
    }
    return {
      baseModel: portVlan(),
      baseRules: {
        portid: [{ required: true, message: '请选择需要配置的端口' }],
        pvid: [
          { required: true, message: '请选择VLAN' },
          { validator: vlanidValidator }
        ],
        permitvlan: [{ validator: vlanidValidator, m: true }],
        untagvlan: [
          { required: true, message: '请输入Untag VLAN' },
          { validator: vlanidValidator, m: true },
          { validator: untagValidator }
        ]
      },
      baseModalShow: false,
      editIndex: -1,
      vlanList: [],
      isLoading: false
    }
  },
  created() {
    bus.$on('vlanComplete', list => {
      this.vlanList = Object.freeze(list)
    })
  },
  computed: {
    ...mapGetters('switcher', ['piMap', 'lagPort', 'portinfo', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item ? `端口：${_item.interface}` : '批量配置'
    }
  },
  watch: {
    'baseModel.portid'() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    }
  },
  methods: {
    // 加载port列表
    async _loadList() {
      // await sleep(300)
      let _result = await this.$api.cmd('devConfig.get', {
        module: 'port_vlan'
      })
      return _result.list
        .map((lis, i) => {
          return {
            ...lis,
            ...this.portinfo.find(p => p.lpid === lis.lpid)
          }
        })
        .filter(port => {
          return (
            port.aggregate_port !== undefined ||
            this.lagPort.find(p => p.lpid === port.lpid)
          )
        })
    },
    // 切换框
    _onCreateVlan() {
      // this.baseModalShow=false
      bus.$emit('create-vlan', { from: 'port-vlan' })
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = portVlan()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.getItem(index)
      this.editIndex = index
      this.baseModalShow = true
      let _model = { ..._item, portid: [_item.lpid] }
      if (_model.mode === 1) {
        _model.permitvlan = '1-4094'
      }
      this.baseModel = _model
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isLoading = true
          let { portid, ...model } = this.baseModel
          let _confirmData = portid.map(p => {
            return {
              ...model,
              lpid: p
            }
          })
          this.$api
            .cmd(
              'devConfig.update',
              {
                module: 'port_vlan',
                data: {
                  list: _confirmData
                }
              },
              { timeout: 0 }
            )
            .then(() => {
              this.$message.success('配置成功')
              this.refresh()
              bus.$emit('portVlanUpdate')
            })
            .finally(() => {
              this.baseModalShow = false
              this.isLoading = false
            })
        }
      })
    },
    // 合并策略方法
    _spanMethods({ row, column, rowIndex, columnIndex }) {
      if (row.aggregate_port > 0) {
        if (columnIndex > 0) {
          if (columnIndex === 5) {
            return {
              rowspan: 1,
              colspan: 5
            }
          } else {
            return {
              rowspan: 0,
              colspan: 0
            }
          }
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.vlan-port {
}
</style>


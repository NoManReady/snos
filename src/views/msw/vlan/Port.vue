<template>
  <div class="vlan-port">
    <div class="box">
      <div class="box-header">
        <div class="box-header-tit">
          <span class="vm w100">{{$t('msw.port_list')}}</span>
          <el-tooltip
            :content="$t('msw.vlan.toggle_list',{action:$t(show?'action.shrink':'action.expand')})"
            class="item"
            effect="dark"
            placement="top"
          >
            <el-button
              :icon="show?'el-icon-minus':'el-icon-plus'"
              @click.native="show=!show"
              circle
              class="vm"
              size="mini"
              type="primary"
            ></el-button>
          </el-tooltip>
        </div>
        <div class="fr" v-show="show">
          <el-button icon="el-icon-edit" plain size="medium" type="primary" v-auth="_onPatchEdit">{{$t('action.patch_edit')}}</el-button>
        </div>
      </div>
      <el-collapse-transition>
        <div class="box-body" v-show="show">
          <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="medium" stripe>
            <el-table-column :label="$t('msw.port')" align="center">
              <template slot-scope="{row}">
                <span>{{row.ifname}}</span>
                <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
              </template>
            </el-table-column>
            <el-table-column :label="$t('msw.port_mode')" align="center">
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
            <el-table-column :label="$t('action.ope')" align="center">
              <template slot-scope="{row,$index}">
                <span class="c-info" v-if="row.aggregate_port>0">{{$t('msw.agg_port_tip',{id:row.aggregate_port})}}</span>
                <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}" v-else>{{$t('action.edit')}}</el-button>
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
        </div>
      </el-collapse-transition>
      <!-- baseModal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('msw.port_mode_f')" prop="mode">
            <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.mode">
              <!-- <el-option :value="0" label="Hybrid口"></el-option> -->
              <el-option :label="$t('msw.vlan.access')" :value="1"></el-option>
              <el-option :label="$t('msw.vlan.trunk')" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="(baseModel.mode===1?'Access VLAN':'Native VLAN')+$t('symbol.semic')" prop="pvid">
            <el-select :placeholder="$t('msw.select')" class="w300" filterable v-model="baseModel.pvid">
              <el-option :key="v.v" :label="v.v" :value="v.v" v-for="v in vlanList"></el-option>
            </el-select>
            <el-button
              @click.native="_onCreateVlan"
              class="fs12"
              type="text"
              v-if="vlanList.length===0"
            >{{$t('msw.vlan.create_vlan')}}</el-button>
          </el-form-item>
          <template v-if="baseModel.mode!==1">
            <el-form-item :label="$t('msw.vlan.allow_vlan_f')" prop="permitvlan">
              <el-input :placeholder="$t('msw.vlan.rang_example')" class="w300" v-model="baseModel.permitvlan"></el-input>
            </el-form-item>
            <!-- <el-form-item label="Untag VALN：" prop="untagvlan" v-if="baseModel.mode===0">
              <el-input class="w200" placeholder="VLAN范围如(3-5,100)" v-model="baseModel.untagvlan"></el-input>
            </el-form-item>-->
          </template>
          <template v-if="editIndex===-1">
            <el-form-item :label="$t('msw.port_select_f')" class="inline-message" inline-message prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />
          </template>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false" class="w120" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button
            :loading="isLoading"
            @click="_onModalConfirm "
            class="w120"
            size="medium"
            type="primary"
          >{{isLoading?$t('action.editing'):$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'
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
    [PortPanel.name]: PortPanel,
    [CollapseTransition.name]: CollapseTransition
  },
  data() {
    const untagValidator = (r, v, cb) => {
      if (!this.baseModel.untagvlan) {
        return cb()
      }
      let _vlans = getArrayStr(this.baseModel.untagvlan)
      if (!_vlans.includes(this.baseModel.pvid)) {
        return cb(new Error(I18N.t('msw.vlan.untag_contain')))
      }
      cb()
    }
    return {
      show: true,
      baseModel: portVlan(),
      baseRules: {
        portid: [{ required: true, message: I18N.t('msw.port_is_required') }],
        pvid: [
          { required: true, message: I18N.t('msw.vlan.vlan_is_required') },
          { validator: vlanidValidator }
        ],
        permitvlan: [{ validator: vlanidValidator, m: true }],
        untagvlan: [
          { required: true, message: I18N.t('msw.vlan.tag_is_required') },
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
      this.vlanList = Object.freeze(list.slice(0))
    })
  },
  computed: {
    ...mapGetters('switcher', ['piMap', 'lagPort', 'portinfo', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item
        ? `${I18N.t('msw.port_f')}${_item.ifname}`
        : I18N.t('action.patch_edit')
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
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          let { portid, ...model } = this.baseModel
          let _confirmData = portid.map(p => {
            return {
              mode: model.mode,
              lpid: p,
              pvid: model.pvid,
              permitvlan: model.mode === 1 ? '' : model.permitvlan
            }
          })
          try {
            await this.$api.cmd(
              'devConfig.update',
              {
                module: 'port_vlan',
                data: {
                  list: _confirmData
                }
              },
              { timeout: 0 }
            )
            this.$message.success(I18N.t('tip.edit1_success'))
            for (let _port of _confirmData) {
              let _index = this.pageModel.allItem.findIndex(
                item => item.lpid === _port.lpid
              )
              if (_index > -1) {
                this.pageModel.allItem.splice(_index, 1, {
                  ...this.pageModel.allItem[_index],
                  ..._port
                })
              }
            }
            // this.refresh()
            this.baseModalShow = false
            bus.$emit('portVlanUpdate')
          } catch (error) {}
          this.isLoading = false
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


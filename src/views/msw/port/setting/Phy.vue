<template>
  <div class="port-setting-phy">
    <help-alert :title="$t('msw.base.phy_cfg')">
      <div slot="content">
        <i18n path="msw.base.phy_cfg_tip">
          <span class="c-warning">{{$t('msw.base.phy_cfg_help')}}</span>
        </i18n>
      </div>
    </help-alert>
    <div class="box" v-if="globalMtu">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.base.mtu_cfg')}}</span>
      </div>
      <el-form :model="mtuModel" :rules="baseRules" label-width="160px" ref="mtuForm" size="medium">
        <el-form-item :label="`MTU${$t('symbol.semic')}`" prop="mtu">
          <el-input
            :placeholder="$t('msw.range_digit',{range:`${portMtuRange[0]}-${portMtuRange[1]}`})"
            class="w300"
            v-model.number="mtuModel.mtu"
          ></el-input>
          <span class="c-info">{{$t('msw.range_digit',{range:`${portMtuRange[0]}-${portMtuRange[1]}`})}}</span>
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="isLoading"
            class="w160"
            type="primary"
            v-auth="_onSaveConf"
          >{{isLoading?$t('action.editing'):$t('action.save_edit')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
          <el-button icon="el-icon-edit" plain size="medium" type="primary" v-auth="_onPatchEdit">{{$t('action.patch_edit')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="medium" stripe>
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="EEE" prop="eee">
          <template slot-scope="{row}">
            <span v-if="row.eee===1">{{$t('phrase.enable')}}</span>
            <span v-else>{{$t('phrase.disable')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.base.port_mode')" align="center" prop="media_type">
          <template slot-scope="{row}">
            <span v-if="row.media_type===1">{{$t('msw.base.copper_mode')}}</span>
            <span v-if="row.media_type===2">{{$t('msw.base.fiber_mode')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.desc')" align="center" prop="description">
          <template #default="{row}">
            <span class="break-word">{{row.description}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="MTU" prop="mtu" v-if="!globalMtu"></el-table-column>
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
      <!--basemodal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('msw.base.eee_status_f')" prop="eee">
            <el-select
              :disabled="enableEeeAndType.eee.length===1"
              :placeholder="$t('msw.select')"
              class="w300"
              v-model="baseModel.eee"
            >
              <el-option :key="eee.v" :label="eee.l" :value="eee.v" v-for="eee in enableEeeAndType.eee"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('msw.base.port_mode_f')" prop="media_type">
            <el-select
              :disabled="enableEeeAndType.type.length===1"
              :placeholder="$t('msw.select')"
              class="w300"
              v-model="baseModel.media_type"
            >
              <el-option :key="type.v" :label="type.l" :value="type.v" v-for="type in enableEeeAndType.type"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('msw.desc_f')" prop="description">
            <el-input class="w300" v-model="baseModel.description"></el-input>
          </el-form-item>
          <el-form-item :label="`MTU${$t('symbol.semic')}`" prop="mtu" v-if="!globalMtu">
            <el-input
              :placeholder="$t('msw.range_digit',{range:`${portMtuRange[0]}-${portMtuRange[1]}`})"
              class="w300"
              v-model.number="baseModel.mtu"
            ></el-input>
            <span class="c-info">{{$t('msw.range_digit',{range:`${portMtuRange[0]}-${portMtuRange[1]}`})}}</span>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item :label="$t('msw.port_select_f')" class="inline-message" prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />
          </template>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" class="w120" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button
            :loading="isLoading"
            @click.native="_onModalConfirm"
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
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { intValidator, nameLengthValidator } from '@/utils/rules'
import { isBetween } from '@/utils/rulesUtils'
import {
  judgePortAttrMutil,
  getLogicportBySelect,
  hasHybridPort,
  isPhyPort,
  hasLagmemberByLpid
} from '@/utils/lag'
import { getIntersectionAll } from '@/utils/utils'
import { phy } from '@/model/msw/port'
import { mapGetters, mapActions } from 'vuex'
import { waitForActionIfHasUplink } from '@/utils'
export default {
  name: 'port-setting-phy',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    const mtuValidator = (rule, value, cb) => {
      if (value === '') {
        return cb()
      }
      let _valid = isBetween(value, this.portMtuRange[0], this.portMtuRange[1])
      if (_valid) {
        return cb()
      } else {
        return cb(
          new Error(
            I18N.t('msw.base.range_valid', {
              range: `${this.portMtuRange[0]}~${this.portMtuRange[1]}`
            })
          )
        )
      }
    }
    const portValidator = (rule, value, cb) => {
      if (value === '') {
        return cb()
      }
      let _portid = this.baseModel.portid
      let _attr = judgePortAttrMutil(_portid)
      if (_attr.mutilType) {
        return cb(new Error(I18N.t('msw.base.patch_edit_rule')))
      }
      cb()
    }
    return {
      isLoading: false,
      mtuModel: {
        mtu: 1500
      },
      baseModel: phy(),
      baseRules: {
        portid: [
          { required: true, message: I18N.t('msw.port_is_required') },
          { validator: portValidator }
        ],
        mtu: [
          { required: true, message: I18N.t('msw.base.mtu_no_empty') },
          { validator: intValidator },
          { validator: mtuValidator }
        ],
        description: [{ validator: nameLengthValidator, max: 36 }]
      },
      baseModalShow: false,
      editIndex: -1,
      globalMtu: window.APP_CAPACITY_SW.mtu.global_mtu === 1
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item
        ? `${I18N.t('msw.port_f')}${_item.ifname}`
        : I18N.t('action.patch_edit')
    },
    // 获取eee及端口模式的使能值
    enableEeeAndType() {
      let _portid = getLogicportBySelect(this.baseModel.portid)
      let _eee = []
      let _type = []
      _type.push([
        { v: 1, l: I18N.t('msw.base.copper_mode') },
        { v: 2, l: I18N.t('msw.base.fiber_mode') }
      ])
      _eee.push([
        { v: 0, l: I18N.t('phrase.disable') },
        { v: 1, l: I18N.t('phrase.enable') }
      ])

      if (_portid.length > 0) {
        let _attr = judgePortAttrMutil(_portid, false)
        // 光口只支持关闭eee配置
        if (this.baseModel.media_type === 2) {
          _eee.push([{ v: 0, l: I18N.t('phrase.disable') }])
        }
        // 判断是否全部为复合口
        if (_attr.electricAndFiber) {
          // 全部为复合口
          // 聚合口不支持配置模式（配置成当前聚合口模式）
          for (let _lpid of this.baseModel.portid) {
            let _port = this.pageModel.allItem.find(port => port.lpid === _lpid)
            if (isPhyPort(_lpid)) {
              continue
            }
            _type.push([
              {
                v: _port.media_type,
                l:
                  _port.media_type === 1
                    ? I18N.t('msw.base.copper_mode')
                    : I18N.t('msw.base.fiber_mode')
              }
            ])
          }
        } else {
          // 非全部为复合口
          if (_attr.fiber) {
            _type.push([{ v: 2, l: I18N.t('msw.base.fiber_mode') }])
          }
          if (_attr.electric) {
            _type.push([{ v: 1, l: I18N.t('msw.base.copper_mode') }])
          }
        }
      }
      let _eeeValues = getIntersectionAll(a => a.v, ..._eee)
      let _typeValues = getIntersectionAll(a => a.v, ..._type)
      return Object.freeze({ eee: _eeeValues, type: _typeValues })
    },
    // mtu选择范围
    portMtuRange() {
      if (window.APP_CAPACITY_SW.mtu.global_mtu === 1) {
        return [
          window.APP_CAPACITY_SW.mtu.mtu_min,
          window.APP_CAPACITY_SW.mtu.mtu_max
        ]
      } else {
        let _portid = getLogicportBySelect(this.baseModel.portid)
        let _maxMinMtu = 64
        let _minMaxMtu = 9216
        _portid.forEach(lpid => {
          let _capacityPort = window.APP_CAPACITY_SW.port.port_list.find(
            port => port.lpid === lpid
          )
          if (_maxMinMtu < _capacityPort.mtu_min) {
            _maxMinMtu = _capacityPort.mtu_min
          }
          if (_minMaxMtu > _capacityPort.mtu_max) {
            _minMaxMtu = _capacityPort.mtu_max
          }
        })
        return [_maxMinMtu, _minMaxMtu]
      }
    },
    // 表格合并列数
    colSpan() {
      return this.globalMtu ? 4 : 5
    }
  },
  watch: {
    'baseModel.portid'(v) {
      // let _portid = getLogicportBySelect(this.baseModel.portid)
      // if (_portid.length > 0) {
      //   let _attr = judgePortAttrMutil(_portid, false)
      //   if (_attr.electricAndFiber) {
      //     let _lpid = _portid[0]
      //     if (isPhyPort(_lpid)) {
      //       let _port = this.pageModel.allItem.find(port => port.lpid === _lpid)
      //       this.baseModel.media_type = _port.media_type
      //     }
      //   }
      // }
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    },
    // eee及端口模式的使能值变化联动赋值
    enableEeeAndType({ eee, type }) {
      let _isExistEee = eee.find(sp => sp.v === this.baseModel.eee)
      let _isExistType = type.find(sp => sp.v === this.baseModel.media_type)
      if (!_isExistEee) {
        this.baseModel.eee = eee[0].v
      }
      if (!_isExistType) {
        this.baseModel.media_type = type[0].v
      }
    }
  },
  methods: {
    ...mapActions('switcher', ['fetchPortinfo']),
    // 加载port列表
    async _loadList() {
      try {
        let _result = await this.$api.cmd('devConfig.get', {
          module: 'port_phy'
        })
        this.mtuModel.mtu = _result.mtu
        let _list = _result.data
          .sort((a, b) => a.lpid - b.lpid)
          .map((port, index) => {
            return {
              ...port,
              ...this.portinfo.find(p => p.lpid === port.lpid)
            }
          })
          // 过滤逻辑口和具有成员口的聚合口
          .filter(port => {
            return isPhyPort(port.lpid) || hasLagmemberByLpid(port.lpid)
          })
        return _list
      } catch (error) {}
      return []
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = phy()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.getItem(index)
      this.editIndex = index
      this.baseModalShow = true
      let _baseModel = {
        ...phy(),
        ..._item,
        portid: [_item.lpid]
      }
      this.baseModel = _baseModel
    },
    // 保存mtu配置
    _onSaveConf() {
      this.$refs.mtuForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          try {
            await this.$api.cmd('devConfig.update', {
              module: 'port_phy',
              data: this.mtuModel
            })
            this.$message.success(I18N.t('tip.edit1_success'))
          } catch (error) {}
          this.isLoading = false
        }
      })
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let { portid, ...model } = this.baseModel
          let _willUpdatePortinfo = hasHybridPort(portid)
          let _confirmData = portid.map(p => {
            let _data = {
              lpid: p,
              enable: model.enable,
              description: model.description,
              eee: model.eee,
              media_type: model.media_type
            }
            if (!this.globalMtu) {
              _data.mtu = model.mtu
            }
            return _data
          })
          try {
            let _hasUplink = await waitForActionIfHasUplink(
              portid,
              'msw.base.port_uplink_tip'
            )
            this.isLoading = true
            await this.$api.cmd(
              'devConfig.update',
              {
                module: 'port_phy',
                data: { data: _confirmData }
              },
              { isSilence: true, timeout: 0 }
            )
            if (_willUpdatePortinfo) {
              await this.fetchPortinfo()
            }
            this.$message.success(I18N.t('tip.edit1_success'))
            this.baseModalShow = false
            // this.refresh()
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
          } catch (error) {}
          this.isLoading = false
        }
      })
    },
    // 合并策略方法
    _spanMethods({ row, column, rowIndex, columnIndex }) {
      if (row.aggregate_port > 0) {
        if (columnIndex > 0) {
          if (columnIndex === this.colSpan) {
            return {
              rowspan: 1,
              colspan: this.colSpan
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


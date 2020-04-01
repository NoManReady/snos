<template>
  <div class="vlan-setting">
    <div class="box">
      <div class="box-header">
        <div class="box-header-tit">
          <span class="vm w100">{{$t('msw.vlan.list')}}</span>
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
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="_onPatchAdd">{{$t('action.patch_add')}}</el-button>
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="_onAdd">{{$t('action.add')}}</el-button>
          <el-button
            :disabled="!!vlanPortLoading"
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="_onPatchRemove"
          >{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <el-collapse-transition>
        <div class="box-body" v-show="show">
          <help-alert :show-icon="false" title>
            <div slot="content">
              <i18n path="msw.limit_tip" tag="span">
                <b class="c-warning mlr5">{{maxLimit}}</b>
              </i18n>（
              <span class="c-warning">{{$t('msw.vlan.warning_tip')}}</span>）
            </div>
          </help-alert>
          <el-table :data="pageList" :row-key="row=>row.n+row.v" ref="baseTable" size="medium" stripe>
            <el-table-column :selectable="_onSelectable" type="selection" width="55"></el-table-column>
            <el-table-column align="center" label="VLAN ID" prop="v" sortable></el-table-column>
            <el-table-column :label="$t('msw.desc')" align="center" prop="n"></el-table-column>
            <el-table-column :label="$t('msw.port')" align="center">
              <template slot-scope="{$index}">
                <i class="el-icon-loading" v-if="!!vlanPortLoading"></i>
                <span v-else>{{vlanPortList[$index]?(vlanPortList[$index].p||'--'):'--'}}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('action.ope')" align="center">
              <template slot-scope="{row,$index}">
                <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}">{{$t('action.edit')}}</el-button>
                <el-button
                  :class="{'c-danger':!(!!vlanPortLoading||(vlanPortList[$index]&&vlanPortList[$index].f===1)||row.v===wanVlanid)}"
                  :disabled="!!vlanPortLoading||(vlanPortList[$index]&&vlanPortList[$index].f===1)||row.v===wanVlanid"
                  size="medium"
                  type="text"
                  v-auth="{fn:_onPatchRemove,params:row.v}"
                >{{$t('action.delete')}}</el-button>
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
    </div>
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
        <el-form-item :label="`VLAN ID${$t('symbol.semic')}`" prop="v">
          <el-input
            :disabled="editIndex>-1"
            :placeholder="$t('msw.range_digit',{range:'1-4094'})"
            class="w300"
            clearable
            v-model="baseModel.v"
          ></el-input>
          <span class="c-info">{{$t('msw.range_digit',{range:'1-4094'})}}</span>
        </el-form-item>
        <el-form-item :label="$t('msw.desc_f')" prop="n">
          <el-input :placeholder="$t('msw.desc')" class="w300" clearable v-model="baseModel.n"></el-input>
          <span class="c-info">{{$t('msw.vlan.desc_cnt',{cnt:32})}}</span>
        </el-form-item>
        <!-- <el-form-item class="inline-message" inline-message label="选择端口：" prop="portid" />
        <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />-->
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="baseModalShow = false" class="w120" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button
          :loading="isLoading"
          @click="_onModalConfirm"
          class="w120"
          size="medium"
          type="primary"
        >{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { vlanValidate, isBetween } from '@/utils/rulesUtils'
import { vlanidValidator, nameLengthValidator } from '@/utils/rules'
import { base } from '@/model/msw/vlan'
import bus from '@/utils/bus'
export default {
  name: 'vlan-setting',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel,
    [CollapseTransition.name]: CollapseTransition
  },
  data() {
    const sameVlanValidate = (r, v, cb) => {
      if (v != this.curVlan.v && this.vlanids.indexOf(v) >= 0)
        return cb(new Error(I18N.t('msw.vlan.id_exist')))
      cb()
    }
    const nameRequiredValidator = (r, v, cb) => {
      if (this.editIndex !== -1 && !v) {
        return cb(new Error(I18N.t('msw.vlan.desc_not_empty')))
      }
      if (v != this.curVlan.n && this.vlanNames.indexOf(v) >= 0)
        return cb(new Error(I18N.t('msw.vlan.desc_exist')))
      // 名称和vlan不匹配时判断vlan描述是否占用其他合法名称
      if (`VLAN${this.baseModel.v.padLeft(4, 0)}` !== v) {
        let match = v.match(/^VLAN(\d{4})$/)
        if (match) {
          let _vlan = Number(match[1])
          if (isBetween(_vlan, 1, 4094)) {
            return cb(new Error(I18N.t('msw.vlan.desc_no_use')))
          }
        }
      }
      cb()
    }
    return {
      show: true,
      baseModel: base(),
      baseRules: {
        v: [
          { required: true, message: I18N.t('msw.vlan.id_required') },
          { validator: vlanidValidator },
          { validator: sameVlanValidate }
        ],
        n: [
          { validator: nameLengthValidator },
          { validator: nameRequiredValidator }
        ]
      },
      baseModalShow: false,
      editIndex: -1,
      isLoading: false,
      vlanPortList: [],
      vlanPortLoading: 0,
      wanVlanid: '',
      maxLimit: window.APP_CAPACITY_SW.vlan
    }
  },
  created() {
    bus.$on('create-vlan', () => {
      this._onAdd()
    })
    bus.$on('portVlanUpdate', () => {
      this._loadVlanPort({ length: 99 })
    })
    this._loadNetworkWan()
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1
        ? I18N.t('action.edit1')
        : I18N.t('action.add')
    },
    vlanids() {
      return Object.freeze(this.pageModel.allItem.map(vlan => vlan.v))
    },
    vlanNames() {
      return Object.freeze(this.pageModel.allItem.map(vlan => vlan.n))
    },
    curVlan() {
      return this.getItem(this.editIndex) || {}
    }
  },
  watch: {
    pageList: '_loadVlanPort',
    'pageModel.allItem'(v) {
      bus.$emit('vlanComplete', v)
    }
  },
  methods: {
    // 加载wan口信息（获取管理vlan）
    async _loadNetworkWan() {
      try {
        let _wan = await this.$api.getNetworkByType('wan', { isSilence: true })
        this.wanVlanid = _wan[0].vlanid
      } catch (error) {}
    },
    // 加载port列表
    async _loadList() {
      try {
        let _result = await this.$api.cmd(
          'devConfig.get',
          { module: 'vlan' },
          { timeout: 0 }
        )
        bus.$emit('vlanComplete', _result.list)
        return _result.list
      } catch (error) {}
    },
    // 加载vlan-port接口
    async _loadVlanPort(v) {
      if (v.length === 0) {
        return
      }
      this.vlanPortLoading++
      try {
        let vlanPort = await this.$api.cmd(
          'devSta.get',
          {
            module: 'vlan_port',
            data: {
              index: this.pageModel.page,
              size: this.pageModel.size
            }
          },
          { isSilence: true }
        )
        this.vlanPortList = Object.freeze(vlanPort.list)
      } catch (error) {}
      this.vlanPortLoading--
      let _baseTable = this.$refs.baseTable
      if (_baseTable) {
        _baseTable.clearSelection()
      }
    },
    // 判断是否可选择
    _onSelectable(row, index) {
      let _vPort = this.vlanPortList[index]
      let _selectAble = Boolean(
        _vPort && _vPort.f !== 1 && row.v !== this.wanVlanid
      )
      return _selectAble && !this.vlanPortLoading
    },
    // 批量添加
    _onPatchAdd() {
      this.$prompt('', I18N.t('msw.vlan.patch_add'), {
        inputPlaceholder: I18N.t('msw.vlan.patch_example'),
        inputValidator: v => {
          return vlanValidate(v, true)
        }
      }).then(d => {
        this._saveData(
          { n: '', v: d.value },
          'devConfig.add',
          I18N.t('tip.add_success')
        ).then(() => {
          let _vlans = this._getPatchVlan(d.value)
          this._insertDataLocal(_vlans.map(v => ({ v, n: '' })))
          // this.refresh()
        })
      })
    },
    // 获取批量创建的vlan
    _getPatchVlan(val) {
      let _vlans = new Set()
      let _splits = val.replace(/\s*/, '').split(',')
      _splits.forEach(sp => {
        let _match = sp.match(/(\d+)-(\d+)/)
        if (_match) {
          let _v1 = +_match[1]
          let _v2 = +_match[2]
          if (_v1 > _v2) {
            ;[_v2, _v1] = [_v1, _v2]
          }
          while (_v1 <= _v2) {
            _vlans.add(_v1.toString())
            _v1++
          }
        } else {
          _vlans.add(sp)
        }
      })
      return [..._vlans]
    },
    // 添加
    _onAdd() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = base()
    },
    // 批量删除
    async _onPatchRemove(vid) {
      let _vids = vid ? [vid] : this.$refs.baseTable.selection.map(s => s.v)
      if (!_vids.length) {
        return this.$message.warning(I18N.t('tip.select_del_item'))
      }
      await this.$confirm(I18N.t('tip.confirm_delete'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      this._saveData(
        { v: _vids.join(',') },
        'devConfig.del',
        I18N.t('tip.del_success')
      ).then(() => {
        this.pageModel.allItem = this.pageModel.allItem.filter(
          vlan => !_vids.includes(vlan.v)
        )
        // this.refresh()
      })
    },
    // 编辑
    _onEdit(index) {
      let _item = this.pageList[index]
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = { ..._item }
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isLoading = true
          let _promise = null
          let _isEdit = this.editIndex >= 0
          if (!_isEdit) {
            _promise = this._saveData(
              this.baseModel,
              'devConfig.add',
              I18N.t('tip.add_success')
            )
          } else {
            _promise = this._saveData(
              this.baseModel,
              'devConfig.update',
              I18N.t('tip.edit_success')
            )
          }
          _promise
            .then(isUpdate => {
              if (isUpdate) {
                let _model = { ...this.baseModel }
                if (_isEdit) {
                  this.editList(this.editIndex, _model)
                } else {
                  this._insertDataLocal([_model])
                }
              }
            })
            .finally(() => {
              this.isLoading = false
            })
          this.baseModalShow = false
        }
      })
    },
    // 本地插入数据
    _insertDataLocal(models) {
      let _datas = []
      // 创建数据本地数据更新
      for (let m of models) {
        let _isExist = this.pageModel.allItem.find(ite => ite.v === m.v)
        if (!_isExist) {
          if (!m.n) {
            m.n = `VLAN${m.v.padLeft(4, 0)}`
          }
          _datas.push(m)
        }
      }
      let _temp = [...this.pageModel.allItem, ..._datas]
      this.pageModel.allItem = _temp.sort((a, b) => {
        let _diff = +a.v - +b.v
        if (_diff === 0) {
          return 0
        }
        let _diffAbs = Math.abs(_diff)
        return _diff / _diffAbs
      })
    },
    // 提交port数据
    _saveData(model, method, message = I18N.t('tip.ope_success')) {
      return new Promise(async (resolve, reject) => {
        if (this.curVlan.v === model.v && this.curVlan.n === model.n) {
          resolve(false)
        }
        try {
          await this.$api.cmd(
            method,
            {
              module: 'vlan',
              data: model
            },
            { timeout: 0 }
          )
          this.$message.success(message)
          resolve(true)
        } catch (error) {
          reject()
        }
      })
    }
  }
}
</script>


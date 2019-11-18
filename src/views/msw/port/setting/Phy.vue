<template>
  <div class="port-setting-phy">
    <help-alert title="物理配置">
      <div slot="content">配置交换机端口物理信息</div>
    </help-alert>
    <div class="box" v-if="globalMtu">
      <div class="box-header">
        <span class="box-header-tit">MTU配置</span>
      </div>
      <el-form :model="mtuModel" :rules="baseRules" label-width="120px" ref="mtuForm" size="small">
        <el-form-item label="MTU：" prop="mtu">
          <el-input :placeholder="`范围：（${mtuMin}~${mtuMax}）`" class="w260" v-model.number="mtuModel.mtu"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoading" size="small" type="primary" v-auth="_onSaveConf">保存配置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">列表</span>
        <div class="fr">
          <el-button icon="el-icon-edit" size="small" type="primary" v-auth="_onPatchEdit">批量编辑</el-button>
        </div>
      </div>
      <el-table :data="pageList" :span-method="_spanMethods" ref="baseTable" size="small" stripe>
        <el-table-column align="center" label="端口">
          <template slot-scope="{row}">
            <span>{{row.interface}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column align="center" label="EEE" prop="eee">
          <template slot-scope="{row}">
            <span v-if="row.eee===1">开启</span>
            <span v-else>关闭</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="模式" prop="media_type">
          <template slot-scope="{row}">
            <span v-if="row.media_type===1">copper模式</span>
            <span v-if="row.media_type===2">fiber模式</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="描述" prop="description"></el-table-column>
        <el-table-column align="center" label="MTU" prop="mtu" v-if="!globalMtu"></el-table-column>
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
      <!--basemodal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="650px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="small">
          <el-form-item label="EEE开关：" prop="eee">
            <el-select class="w260" placeholder="请选择" v-model="baseModel.eee">
              <el-option :key="eee.v" :label="eee.l" :value="eee.v" v-for="eee in enableEeeAndType.eee"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="端口模式：" prop="media_type">
            <el-select :disabled="editIndex===-1" class="w260" placeholder="请选择" v-model="baseModel.media_type">
              <el-option :key="type.v" :label="type.l" :value="type.v" v-for="type in enableEeeAndType.type"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="端口描述：" prop="description">
            <el-input class="w260" v-model="baseModel.description"></el-input>
          </el-form-item>
          <el-form-item label="MTU：" prop="mtu" v-if="!globalMtu">
            <el-input :placeholder="'范围：（576~'+mtuMax+'）'" class="w260" v-model.number="baseModel.mtu"></el-input>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item class="inline-message" label="选择端口：" prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />
          </template>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" size="small">取 消</el-button>
          <el-button :loading="isLoading" @click.native="_onModalConfirm" size="small" type="primary">确定</el-button>
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
import { judgePortAttrMutil, getLogicportBySelect } from '@/utils/lag'
import { getIntersectionAll } from '@/utils/utils'
import { phy } from '@/model/msw/port'
import { mapGetters } from 'vuex'
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
      let _valid = isBetween(value, this.mtuMin, this.mtuMax)
      if (_valid) {
        return cb()
      } else {
        return cb(`请输入有效的数值（范围${this.mtuMin}~${this.mtuMax}）`)
      }
    }
    const portValidator = (rule, value, cb) => {
      if (value === '') {
        return cb()
      }
      let _portid = this.baseModel.portid
      let _portAttr = judgePortAttrMutil(_portid)
      if (_portAttr.mutil) {
        return cb(new Error(`批量配置不支持不同端口模式（光、电模式）配置`))
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
          { required: true, message: '请选择需要配置的端口' },
          { validator: portValidator }
        ],
        mtu: [
          { required: true, message: '请输入MTU' },
          { validator: intValidator },
          { validator: mtuValidator }
        ],
        description: [{ validator: nameLengthValidator, max: 36 }]
      },
      baseModalShow: false,
      editIndex: -1,
      mtuMax: window.APP_CAPACITY_SW.mtu.mtu_max,
      mtuMin: window.APP_CAPACITY_SW.mtu.mtu_min,
      globalMtu: window.APP_CAPACITY_SW.mtu.global_mtu === 1
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo', 'lagPort', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item ? `端口：${_item.interface}` : '批量配置'
    },
    // 获取eee及端口模式的使能值
    enableEeeAndType() {
      let _portid = getLogicportBySelect(this.baseModel.portid)
      let _eee = []
      let _type = []
      let _attr = judgePortAttrMutil(_portid, false)
      _type.push([{ v: 1, l: 'copper模式' }, { v: 2, l: 'fiber模式' }])
      _eee.push([{ v: 0, l: '关闭' }, { v: 1, l: '开启' }])

      if (_portid.length > 0) {
        let _portNames = _portid.map(id => {
          let _port = this.portinfo.find(p => p.lpid === id)
          return _port ? _port.interface : null
        })
        // 是否具有fa口
        let _hasFa = _portNames.find(pn => /^fa\d+/.test(pn))
        let _hasGi = _portNames.find(pn => /^gi\d+/.test(pn))
        let _hasTGi = _portNames.find(pn => /^tgi\d+/.test(pn))

        if (_attr.hasFiber) {
          _eee.push([{ v: 0, l: '关闭' }])
        }
        if (_attr.fiber) {
          _type.push([{ v: 2, l: 'fiber模式' }])
        }
        if (_attr.electric) {
          _type.push([{ v: 1, l: 'copper模式' }])
        }
      }
      let _eeeValues = getIntersectionAll(a => a.v, ..._eee)
      let _typeValues = getIntersectionAll(a => a.v, ..._type)
      return Object.freeze({ eee: _eeeValues, type: _typeValues })
    }
  },
  watch: {
    'baseModel.portid'() {
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
            return (
              port.aggregate_port !== undefined ||
              this.lagPort.find(p => p.lpid === port.lpid)
            )
          })
        return Object.freeze(_list)
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
            this.$message.success('配置成功')
          } catch (error) {}
          this.isLoading = false
        }
      })
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          let { portid, ...model } = this.baseModel
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
            await this.$api.cmd('devConfig.update', {
              module: 'port_phy',
              data: { data: _confirmData }
            })
            this.$message.success('配置成功')
            this.baseModalShow = false
            this.refresh()
          } catch (error) {}
          this.isLoading = false
        }
      })
    },
    // 合并策略方法
    _spanMethods({ row, column, rowIndex, columnIndex }) {
      if (row.aggregate_port > 0) {
        if (columnIndex > 0) {
          if (columnIndex === 4) {
            return {
              rowspan: 1,
              colspan: 4
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
.port-setting-phy {
}
</style>


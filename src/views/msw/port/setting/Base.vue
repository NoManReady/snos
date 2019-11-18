<template>
  <div class="port-setting-base">
    <help-alert title="端口设置">
      <div slot="content">配置交换机端口基础信息（开关、双工、速率）</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">端口列表</span>
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
        <el-table-column align="center" label="端口开关" prop="enable">
          <template slot-scope="{row}">
            <span v-if="row.enable===1">开启</span>
            <span v-else>关闭</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="双工/速率">
          <el-table-column align="center" label="配置状态">
            <template slot-scope="{row}">
              <span>{{enumMap['duplex'][row.c_duplex]}}/{{enumMap['speed'][row.c_speed]}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="实际状态">
            <template slot-scope="{row}">
              <span>{{enumMap['duplex'][row.r_duplex]}}/{{enumMap['speed'][row.r_speed]}}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="流控">
          <el-table-column align="center" label="配置状态">
            <template slot-scope="{row}">
              <span v-if="row.c_flowcontrol===1">开启</span>
              <span v-else>关闭</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="实际状态">
            <template slot-scope="{row}">
              <span v-if="row.r_flowcontrol===1">开启</span>
              <span v-else>关闭</span>
            </template>
          </el-table-column>
        </el-table-column>
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
          <el-form-item label="端口开关：" prop="enable">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.enable">
              <el-option :value="0" label="关闭"></el-option>
              <el-option :value="1" label="开启"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="端口速率：" prop="c_speed">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.c_speed">
              <el-option :key="sp.v" :label="sp.l" :value="sp.v" v-for="sp in enableSpeedAndDuplex.speed"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工作模式：" prop="c_duplex">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.c_duplex">
              <el-option :key="sp.v" :label="sp.l" :value="sp.v" v-for="sp in enableSpeedAndDuplex.duplex"></el-option>
            </el-select>
            <!-- <el-tooltip content="端口速率配置1000M，只能配置全双工" placement="top">
              <i class="el-icon-warning c-warning fs15 pointer" v-show="baseModel.c_speed===2"></i>
            </el-tooltip>-->
          </el-form-item>
          <el-form-item label="端口流控：" prop="c_flowcontrol">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.c_flowcontrol">
              <el-option :value="0" label="关闭"></el-option>
              <el-option :value="1" label="开启"></el-option>
            </el-select>
          </el-form-item>
          <div v-if="editIndex===-1">
            <el-form-item class="inline-message" inline-message label="选择端口：" prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />
          </div>
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
import { judgePortAttrMutil, getLogicportBySelect } from '@/utils/lag'
import { getIntersectionAll } from '@/utils/utils'
import { base } from '@/model/msw/port'
import { mapGetters } from 'vuex'
import { awaitOnLine_plus } from '@/utils'
export default {
  name: 'port-setting-base',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      enumMap: Object.freeze({
        speed: {
          '-1': '未知',
          '0': '10M',
          '1': '100M',
          '2': '1000M',
          '4': '自动'
        },
        duplex: {
          '-1': '未知',
          '0': '自动',
          '1': '全双工',
          '2': '半双工'
        }
      }),
      baseModel: base(),
      baseRules: {
        portid: [{ required: true, message: '请选择需要配置的端口' }]
      },
      baseModalShow: false,
      editIndex: -1,
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('switcher', [
      'piMap',
      'portinfo',
      'lagPort',
      'lagPortsMap',
      'uplink'
    ]),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item ? `端口：${_item.interface}` : '批量配置'
    },
    // 获取速率及双工的使能值
    enableSpeedAndDuplex() {
      let _portid = getLogicportBySelect(this.baseModel.portid)
      let _speed = []
      let _duplex = []
      let _attr = judgePortAttrMutil(_portid, false)
      _duplex.push([{ v: 2, l: '半双工' }, { v: 1, l: '全双工' }])
      _speed.push([
        { v: 0, l: '10M' },
        { v: 1, l: '100M' },
        { v: 2, l: '1000M' }
      ])
      if (_portid) {
        let _portNames = _portid.map(id => {
          let _port = this.portinfo.find(p => p.lpid === id)
          return _port ? _port.interface : null
        })
        // 是否具有fa口
        let _hasFa = _portNames.find(pn => /^fa\d+/.test(pn))
        let _hasGi = _portNames.find(pn => /^gi\d+/.test(pn))
        let _hasTGi = _portNames.find(pn => /^tgi\d+/.test(pn))
        if (_hasFa) {
          _speed.push([{ v: 0, l: '10M' }, { v: 1, l: '100M' }])
        }
        if (_hasGi) {
          if (_attr.hasFiber) {
            //光口支持全双工
            _duplex.push([{ v: 1, l: '全双工' }])
            _speed.push([{ v: 1, l: '100M' }, { v: 2, l: '1000M' }])
          }
        }
        if (_hasTGi) {
          _duplex.push([{ v: 1, l: '全双工' }])
          _speed = [{ v: 2, l: '1000M' }, { v: 3, l: '10G' }]
        }
      }

      // 千兆下只能配置全双工
      if (this.baseModel.c_speed === 2) {
        _duplex.push([{ v: 1, l: '全双工' }])
      }
      // 全双工光口只能配置千兆
      // if (this.baseModel.c_duplex === 1 && _attr.hasFiber) {
      //   _speed.push([{ v: 2, l: '1000M' }])
      // }

      let _spValues = getIntersectionAll(a => a.v, ..._speed)
      let _dpValues = getIntersectionAll(a => a.v, ..._duplex)
      _spValues.unshift({ v: 4, l: '自动' })
      _dpValues.unshift({ v: 0, l: '自动' })
      return Object.freeze({ speed: _spValues, duplex: _dpValues })
    }
  },
  watch: {
    'baseModel.portid'() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    },
    'baseModel.c_speed'(v) {
      if (this.$refs.baseForm && this.editIndex === -1) {
        this.$refs.baseForm.validateField('portid')
      }
    },
    // 速率及双工的使能值变化联动赋值
    enableSpeedAndDuplex({ speed, duplex }) {
      let _isExistsp = speed.find(sp => sp.v === this.baseModel.c_speed)
      let _isExistdp = duplex.find(sp => sp.v === this.baseModel.c_duplex)
      if (!_isExistsp) {
        this.baseModel.c_speed = speed[0].v
      }
      if (!_isExistdp) {
        this.baseModel.c_duplex = duplex[0].v
      }
    }
  },
  methods: {
    // 加载port列表
    async _loadList() {
      try {
        let _result = await this.$api.cmd('devSta.get', { module: 'port_base' })
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
      this.baseModel = base()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.getItem(index)
      this.editIndex = index
      this.baseModalShow = true
      let _baseModel = {
        portid: [_item.lpid],
        c_flowcontrol: _item.c_flowcontrol,
        c_speed: _item.c_speed,
        enable: _item.enable,
        c_duplex: _item.c_duplex
      }
      this.baseModel = _baseModel
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let { portid, ...model } = this.baseModel
          let _confirmData = portid.map(p => {
            return {
              ...model,
              lpid: p
            }
          })
          let _hasUplink = portid.includes(this.uplink.lpid)
          if (_hasUplink) {
            await this.$confirm(
              `当前配置端口包含上联口【${this.uplink.interface}】，会出现网络连通闪断，是否确认配置？`,
              {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }
            )
          }
          this.isLoading = true
          try {
            let _promise = this.$api.cmd(
              'devConfig.update',
              {
                module: 'port_base',
                data: { data: _confirmData }
              },
              { isSilence: true, timeout: 0 }
            )
            if (_hasUplink) {
              await awaitOnLine_plus({
                time: 2000,
                text: '配置下发中...',
                maxTry: 10
              })
              _promise.cancel()
            } else {
              await _promise
            }
            this.$message.success('配置成功')
            this.refresh()
          } catch (error) {}
          this.baseModalShow = false
          this.isLoading = false
        }
      })
    },
    // 合并策略方法
    _spanMethods({ row, column, rowIndex, columnIndex }) {
      if (row.aggregate_port > 0) {
        if (columnIndex > 0) {
          if (columnIndex === 6) {
            return {
              rowspan: 1,
              colspan: 6
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
.port-setting-base {
}
</style>


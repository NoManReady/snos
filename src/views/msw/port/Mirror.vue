<template>
  <div class="port-mirror">
    <help-alert :title="$t('msw.mirror.mirror')">
      <div slot="content">
        <i18n path="msw.mirror.mirror_explain" tag="p">
          <b>{{$t('phrase.explain_f')}}</b>
        </i18n>
        <p class="c-warning">
          <i18n path="msw.mirror.mirror_notice">
            <b>{{$t('phrase.notice_f')}}</b>
          </i18n>
        </p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.mirror.mirror_list')}}</span>
      </div>
      <el-table :data="mirrorList" ref="baseTable" size="medium" stripe>
        <el-table-column type="index" width="55"></el-table-column>
        <el-table-column :label="$t('msw.mirror.source_port')" align="center" prop="src_port">
          <template slot-scope="{row}">
            <span v-if="row.src_port">{{row.src_port.map(p=>piMap[p]).join(',')}}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.mirror.dest_port')" align="center" prop="dst_port">
          <template slot-scope="{row}">
            <span v-if="row.dst_port!==undefined">{{piMap[row.dst_port]}}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.mirror.monitor_pack')" align="center" prop="mirror_direction">
          <template slot-scope="{row}">
            <span v-if="row.mirror_direction===0">{{$t('msw.mirror.all_pack')}}</span>
            <span v-else-if="row.mirror_direction===1">{{$t('msw.mirror.in_pack')}}</span>
            <span v-else-if="row.mirror_direction===2">{{$t('msw.mirror.out_pack')}}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.mirror.reciver_diff_pack')" align="center" prop="switch">
          <template slot-scope="{row}">
            <span v-if="row.switch===1">{{$t('phrase.yes')}}</span>
            <span v-else-if="row.switch===0">{{$t('phrase.no')}}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{row,$index}">
            <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}">{{$t('msw.mirror.edit')}}</el-button>
            <el-button
              :class="{'c-danger':row.src_port}"
              :disabled="!row.src_port"
              size="medium"
              type="text"
              v-auth="{fn:_onRemove,params:$index}"
            >{{$t('msw.mirror.clear')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--basemodal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="195px" ref="baseForm" size="medium">
          <el-form-item :label="$t('msw.mirror.monitor_pack_f')" prop="mirror_direction">
            <el-select :placeholder="$t('msw.select')" class="w300" v-model="baseModel.mirror_direction">
              <el-option :label="$t('msw.mirror.all_pack')" :value="0"></el-option>
              <el-option :label="$t('msw.mirror.in_pack')" :value="1"></el-option>
              <el-option :label="$t('msw.mirror.out_pack')" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('msw.mirror.reciver_diff_pack_f')" prop="switch">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.switch"></el-switch>
          </el-form-item>
          <el-form-item :label="$t('msw.mirror.source_port_f')" class="inline-message" inline-message prop="src_port"></el-form-item>
          <port-panel :disableds="disabledPorts" :selecteds.sync="baseModel.src_port" has-agg mutilple />
          <el-form-item :label="$t('msw.mirror.dest_port_f')" class="inline-message" inline-message prop="dst_port"></el-form-item>
          <port-panel :disableds="[...disabledPorts,...lagPorts]" :selecteds.sync="baseModel.dst_port" :show-lag="false" />
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
import PortPanel from '@/common/PortPanel'
import { getConnectStr } from '@/utils/utils'
import formMixins from '@/mixins/formMixins'
import { mirror } from '@/model/msw/port'
import { mapGetters } from 'vuex'
export default {
  name: 'port-mirror',
  components: {
    [PortPanel.name]: PortPanel
  },
  mixins: [formMixins],
  data() {
    const portIncludeValidator = (r, v, cb) => {
      if (
        !this.baseModel.src_port.length ||
        (!this.baseModel.dst_port && this.baseModel.dst_port !== 0)
      ) {
        return cb()
      }
      if (this.baseModel.src_port.includes(this.baseModel.dst_port)) {
        return cb(new Error(r.message))
      }
      cb()
    }
    return {
      isLoading: false,
      baseModalShow: false,
      editIndex: -1,
      baseModel: mirror(),
      mirrorList: [],
      baseRules: {
        src_port: [
          { required: true, message: I18N.t('msw.mirror.source_no_empty') },
          {
            validator: portIncludeValidator,
            message: I18N.t('msw.mirror.source_dest_is_same')
          }
        ],
        dst_port: [
          { required: true, message: I18N.t('msw.mirror.dest_no_empty') },
          {
            validator: portIncludeValidator,
            message: I18N.t('msw.mirror.source_dest_is_same')
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('switcher', ['piMap', 'lagPortsMap']),
    // modal名称
    modalTitle() {
      return this.editIndex > -1 ? I18N.t('action.edit1') : I18N.t('action.add')
    },
    // 被使用过的port
    disabledPorts() {
      let _disabledPorts = []
      this.mirrorList.forEach((mirror, index) => {
        if (this.editIndex !== index && mirror.src_port) {
          _disabledPorts.push(...mirror.src_port, mirror.dst_port)
        }
      })
      return _disabledPorts
    },
    // 聚合口
    lagPorts() {
      let _lag = []
      for (let k in this.lagPortsMap) {
        _lag.push(...this.lagPortsMap[k])
      }
      return _lag
    }
  },
  watch: {
    'baseModel.src_port'() {
      this._portTriggerValidate()
    },
    'baseModel.dst_port'() {
      this._portTriggerValidate()
    }
  },
  created() {
    this._loadMirrorList()
  },
  methods: {
    // 端口校验
    _portTriggerValidate() {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('dst_port')
        this.$refs.baseForm.validateField('src_port')
      }
    },
    // 加载镜像列表
    async _loadMirrorList() {
      try {
        let _result = await this.$api.cmd('devConfig.get', { module: 'mirror' })
        this.mirrorList = _result.list
      } catch (error) {}
    },
    // 删除(不做批量删除)
    async _onRemove(index) {
      this.editIndex = index
      await this.$confirm(I18N.t('msw.mirror.clear_mirror_confirm'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      await this._saveData({
        session: this.mirrorList[index].session
      })
      this.$message.success(I18N.t('tip.remove_success'))
      // this._loadMirrorList()
    },
    // 编辑镜像
    _onEdit(index) {
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = { ...mirror(), ...this.mirrorList[index] }
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          await this._saveData(this.baseModel)
          this.$message.success(I18N.t('tip.edit1_success'))
          this.baseModalShow = false
          this.editIndex = -1
          // this._loadMirrorList()
        }
      })
    },
    // 保存配置
    async _saveData(data) {
      this.isLoading = true
      try {
        await this.$api.cmd('devConfig.update', {
          module: 'mirror',
          data
        })
        this.mirrorList.splice(this.editIndex, 1, { ...data })
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>

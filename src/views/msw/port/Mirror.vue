<template>
  <div class="port-mirror">
    <help-alert title="端口镜像">
      <div slot="content">
        <p>
          <b>说明：开启端口镜像功能，源端口上的所有报文都会被复制一份转发给目的端口，目的端口上通常连接一个报文分析器分析源端口的报文情况，可以将多个端口镜像到一个目的端口。</b>
        </p>
        <p class="c-warning">
          <b>提示：目的端口和源端口不能为同一个。</b>
        </p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">镜像列表</span>
      </div>
      <el-table :data="mirrorList" ref="baseTable" size="small" stripe>
        <el-table-column type="index" width="55"></el-table-column>
        <el-table-column align="center" label="镜像源端口" prop="src_port">
          <template slot-scope="{row}">
            <span v-if="row.src_port">{{row.src_port.map(p=>piMap[p]).join(',')}}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="镜像目的端口" prop="dst_port">
          <template slot-scope="{row}">
            <span v-if="row.dst_port!==undefined">{{piMap[row.dst_port]}}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="监控报文" prop="mirror_direction">
          <template slot-scope="{row}">
            <span v-if="row.mirror_direction===0">所有报文</span>
            <span v-else-if="row.mirror_direction===1">输入报文</span>
            <span v-else-if="row.mirror_direction===2">输出报文</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="是否接收非镜像源端口报文" prop="switch">
          <template slot-scope="{row}">
            <span v-if="row.switch===1">是</span>
            <span v-else-if="row.switch===0">否</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row,$index}">
            <el-button size="mini" type="text" v-auth="{fn:_onEdit,params:$index}">配置</el-button>
            <el-button
              :class="{'c-danger':row.src_port}"
              :disabled="!row.src_port"
              size="mini"
              type="text"
              v-auth="{fn:_onPatchRemove,params:row.session}"
            >清空</el-button>
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
        width="650px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="small">
          <el-form-item label="监控报文：" prop="mirror_direction">
            <el-select class="w200" placeholder="请选择" v-model="baseModel.mirror_direction">
              <el-option :value="0" label="所有报文"></el-option>
              <el-option :value="1" label="输入报文"></el-option>
              <el-option :value="2" label="输出报文"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否接收非镜像源端口报文" prop="switch">
            <el-switch :active-value="1" :inactive-value="0" v-model="baseModel.switch"></el-switch>
          </el-form-item>
          <el-form-item class="inline-message" inline-message label="选择源端口：" prop="src_port"></el-form-item>
          <port-panel :disableds="disabledPorts" :selecteds.sync="baseModel.src_port" has-agg mutilple />
          <el-form-item class="inline-message" inline-message label="选择目的端口：" prop="dst_port"></el-form-item>
          <port-panel :disableds="[...disabledPorts,...lagPorts]" :selecteds.sync="baseModel.dst_port" :show-lag="false" />
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
          { required: true, message: '请选择镜像源端口' },
          {
            validator: portIncludeValidator,
            message: '源端口不能同时作为目的端口'
          }
        ],
        dst_port: [
          { required: true, message: '请选择镜像目的端口' },
          {
            validator: portIncludeValidator,
            message: '源端口不能同时作为目的端口'
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('switcher', ['piMap', 'lagPortsMap']),
    // modal名称
    modalTitle() {
      return this.editIndex > -1 ? '编辑端口镜像' : `添加端口镜像`
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
    // 批量删除
    async _onPatchRemove(sess) {
      let _sess = sess
        ? [sess]
        : this.$refs.baseTable.selection.map(s => s.session)
      if (!_sess.length) {
        return this.$message.warning('请选择要清除的列表项')
      }
      await this.$confirm(`是否确认清除镜像口？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await this._saveData({
        session: sess
      })
      this.$message.success('清除成功')
      this._loadMirrorList()
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
          this.$message.success('配置成功')
          this.baseModalShow = false
          this.editIndex = -1
          this._loadMirrorList()
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
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.port-mirror {
}
</style>

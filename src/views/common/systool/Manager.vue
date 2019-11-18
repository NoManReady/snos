<template>
  <div class="systool-manager">
    <help-alert json-key="managerJson" title="整网管理"></help-alert>
    <help-alert title="注意！整网管理的操作会影响整个网络的配置！配置下发后页面可能会无响应，请尝试重新获取地址登录。" type="warning"></help-alert>
    <div class="box-header mt15">
      <span class="box-header-tit">整网管理</span>
    </div>
    <el-form :model="form" label-width="100px" ref="form">
      <el-form-item label="操作">
        <el-radio-group v-model="form.op">
          <el-radio-button label="reboot">系统重启</el-radio-button>
          <el-radio-button label="reset">恢复出厂</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <template v-if="form.op != 'reset'">
        <el-form-item label="选择">
          <el-radio-group v-model="form.dev">
            <el-radio-button label="batch">指定设备</el-radio-button>
            <el-radio-button label="all">整网设备</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label v-if="!isAllManage">
          <template>
            <el-transfer
              :button-texts="['移除', '添加']"
              :data="form.devList"
              :titles="['可操作设备','已选设备']"
              class="systool-manager__transfer"
              filter-placeholder="搜索SN/设备型号"
              filterable
              v-model="form.choosedDevList"
            ></el-transfer>
          </template>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item label="选项">
          <el-switch active-text="解除用户账号绑定" v-model="form.reset"></el-switch>
          <small class="c-info">（当前账号不再拥有这些设备，云端自动删除该账号下的设备）</small>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button @click="onSubmit" class="w200" type="primary">确认</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'SystoolManager',
  data() {
    return {
      form: {
        op: 'reboot',
        reset: false,
        dev: 'batch',
        reboot: 'true',
        devList: [],
        choosedDevList: []
      }
    }
  },
  computed: {
    isAllManage() {
      return this.form.dev === 'all'
    }
  },
  created() {
    this._getDevList()
  },
  methods: {
    // 获取所有设备列表
    _getDevList() {
      Promise.all([this._getApList(), this._getSwitchList()]).then(
        ([ap, esw]) => {
          this.form.devList = [...ap, ...esw].map(ite => ({
            label: `${ite.sn} - ${ite.dt}`,
            sn: ite.sn,
            key: `${ite.sn}-${ite.type}`
          }))
        }
      )
    },
    // 获取ap列表
    _getApList() {
      return this.$api.getAplistLite({ status: 'ON' }).then(d => {
        let devList = d || { list: [] }
        if (!devList.list || !Array.isArray(devList.list)) devList.list = []
        return devList.list.map(lis => ({ ...lis, type: 'ap' }))
      })
    },
    // 获取交换机设备
    async _getSwitchList() {
      let _curNetwork = await this.$api.getNetworkId()
      let _list = await this.$api.getNeighborListByType(['esw'])
      return _list
        .filter(l => l.networkId === _curNetwork.networkId)
        .map(ite => ({
          sn: ite.devSN,
          dt: ite.deviceType,
          nm: ite.hostName,
          type: 'esw'
        }))
    },
    // 获取配置下发接口函数
    _getFetchMethod(...argv) {
      let _method = () => {}
      if (this.form.op === 'reboot') {
        _method = this.$api.setReboot
      } else if (this.form.op === 'reset') {
        if (this.form.reset) {
          _method = this.$api.setReset
        } else {
          _method = this.$api.setResetConfig
        }
      }
      return _method.apply(this, argv)
    },
    // 提交数据
    onSubmit() {
      let data = { sn: [], reboot: this.form.reboot }
      // 重启且不是全部设备
      if (!this.isAllManage && this.form.op !== 'reset') {
        if (this.form.choosedDevList.length == 0) {
          return this.$message.warning('请选择要操作的设备')
        }
        // data.types = []
        this.form.choosedDevList.forEach(key => {
          let [sn, type] = key.split('-')
          data.sn.push(sn)
          // data.types.push(type)
        })
      }
      this.$confirm(
        '整网管理操作会影响整个网络的配置，配置下发后页面可能会无响应，需重新获取地址登录。确认继续操作？'
      )
        .then(() => {
          this._getFetchMethod(data).then(d => {
            this.$message('操作指令下发成功。')
          })
        })
        .catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
.systool-manager {
  /deep/ &__transfer {
    .el-transfer-panel__header {
      .el-checkbox__label {
        font-size: 12px !important;
      }
    }
    .el-transfer-panel {
      width: 300px;
      margin-top: 10px;
    }
  }
}
</style>

<template>
  <div class="systool-manager">
    <help-alert json-key="managerJson" :title="$t('systool.whole_manage')"></help-alert>
    <help-alert :title="$t('systool.manage_tip')" type="warning"></help-alert>
    <div class="box-header mt15">
      <span class="box-header-tit">{{$t('systool.whole_manage')}}</span>
    </div>
    <el-form :model="form" label-width="100px" ref="form" size="medium">
      <el-form-item :label="$t('action.ope')">
        <el-radio-group v-model="form.op">
          <el-radio-button label="reboot">{{$t('systool.reboot')}}</el-radio-button>
          <el-radio-button label="reset">{{$t('systool.reset')}}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <template v-if="form.op != 'reset'">
        <el-form-item :label="$t('systool.select')">
          <el-radio-group v-model="form.dev">
            <el-radio-button label="batch">{{$t('systool.define_dev')}}</el-radio-button>
            <el-radio-button label="all">{{$t('systool.whole_dev')}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label v-if="!isAllManage">
          <template>
            <el-transfer
              :button-texts="[$t('action.delete'), $t('action.add')]"
              :data="form.devList"
              :titles="[$t('systool.ope_able'),$t('systool.select_dev')]"
              class="systool-manager__transfer"
              :filter-placeholder="$t('systool.search_sn')"
              filterable
              v-model="form.choosedDevList"
            ></el-transfer>
          </template>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item :label="$t('systool.item')">
          <el-switch :active-text="$t('systool.unbind_account')" v-model="form.reset"></el-switch>
          <small class="c-info">{{$t('systool.delete_macc')}}</small>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button @click="onSubmit" class="w200" type="primary">{{$t('action.confirm')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "SystoolManager",
  data() {
    return {
      form: {
        op: "reboot",
        reset: false,
        dev: "batch",
        reboot: "true",
        devList: [],
        choosedDevList: []
      }
    };
  },
  computed: {
    isAllManage() {
      return this.form.dev === "all";
    }
  },
  created() {
    this._getDevList();
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
          }));
        }
      );
    },
    // 获取ap列表
    _getApList() {
      return this.$api.getAplistLite({ status: "ON" }).then(d => {
        let devList = d || { list: [] };
        if (!devList.list || !Array.isArray(devList.list)) devList.list = [];
        return devList.list.map(lis => ({ ...lis, type: "ap" }));
      });
    },
    // 获取交换机设备
    async _getSwitchList() {
      let _curNetwork = await this.$api.getNetworkId();
      let _list = await this.$api.getNeighborListByType(["esw"]);
      return _list
        .filter(l => l.networkId === _curNetwork.networkId)
        .map(ite => ({
          sn: ite.devSN,
          dt: ite.deviceType,
          nm: ite.hostName,
          type: "esw"
        }));
    },
    // 获取配置下发接口函数
    _getFetchMethod(...argv) {
      let _method = () => {};
      if (this.form.op === "reboot") {
        _method = this.$api.setReboot;
      } else if (this.form.op === "reset") {
        if (this.form.reset) {
          _method = this.$api.setReset;
        } else {
          _method = this.$api.setResetConfig;
        }
      }
      return _method.apply(this, argv);
    },
    // 提交数据
    onSubmit() {
      let data = { sn: [], reboot: this.form.reboot };
      // 重启且不是全部设备
      if (!this.isAllManage && this.form.op !== "reset") {
        if (this.form.choosedDevList.length == 0) {
          return this.$message.warning(I18N.t("systool.select_dev_ope"));
        }
        // data.types = []
        this.form.choosedDevList.forEach(key => {
          let [sn, type] = key.split("-");
          data.sn.push(sn);
          // data.types.push(type)
        });
      }
      this.$confirm(I18N.t("systool.whole_cfg_tip"))
        .then(() => {
          this._getFetchMethod(data).then(d => {
            this.$message(I18N.t("systool.ope_cfg_success"));
          });
        })
        .catch(() => {});
    }
  }
};
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

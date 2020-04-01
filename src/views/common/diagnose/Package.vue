<template>
  <div class="diagnose-package">
    <help-alert
      json-key="packageJson"
      :title="$t('diagnose.pack_check')"
    ></help-alert>
    <el-form
      :model="baseModel"
      :rules="baseRules"
      class="w500"
      label-width="160px"
      ref="baseForm"
      size="medium"
    >
      <el-form-item :label="$t('diagnose.interface')" prop="iface">
        <el-select style="width:340px;" v-model="baseModel.iface">
          <el-option key="iface_eth0" label="ALL" value="eth0"></el-option>
          <el-option
            :key="iface.v"
            :label="iface.l"
            :value="iface.v"
            v-for="iface in ifaces"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('diagnose.protocol')" prop="protocal">
        <el-select style="width:340px;" v-model="baseModel.protocal">
          <el-option key="protocal_all" label="ALL" value></el-option>
          <el-option
            :key="proto.v"
            :label="proto.k"
            :value="proto.v"
            v-for="proto in protocol"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('diagnose.master_ip')" prop="ip">
        <el-input v-model="baseModel.ip"></el-input>
      </el-form-item>
      <el-form-item :label="$t('diagnose.file_size_limit')" prop="size">
        <el-select style="width:340px;" v-model="baseModel.size">
          <el-option
            :key="free"
            :label="free + 'M'"
            :value="free"
            v-for="free in Math.min(Math.floor(freeMem), 8)"
          ></el-option>
        </el-select>
        <span class="web-form--tip">
          {{ $t("diagnose.rom_remain") }}
          <i class="el-icon-loading f-theme" v-if="!freeMem"></i>
          <b class="f-theme" v-else>{{ freeMem.toFixed(2) }}</b> M
        </span>
      </el-form-item>
      <el-form-item :label="$t('diagnose.pack_limit')" prop="package">
        <el-select style="width:340px;" v-model="baseModel.package">
          <el-option :value="500" label="500个"></el-option>
          <el-option :value="1000" label="1000个"></el-option>
          <el-option :value="1500" label="1500个"></el-option>
          <el-option :value="2000" label="2000个"></el-option>
          <el-option :label="$t('diagnose.no_limit')" value></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('diagnose.download_link')"
        v-show="status.hasPackage"
      >
        <el-button
          :disabled="status.isRunning"
          @click.native="downloadPackDiagnose"
          type="text"
          >{{ $t("diagnose.pcap_link") }}</el-button
        >
        <el-tooltip placement="top">
          <div slot="content">
            <div class="mb5">
              {{ $t("diagnose.file_size_f") }}
              <b>{{ status.packageInfo.size | rateTrans }}</b>
              <a
                @click="deletePackage"
                class="c-success pointer"
                v-if="!status.isRunning"
                >{{ $t("diagnose.click_delete_file") }}</a
              >
              <span class="c-success ml5" v-else>{{
                $t("diagnose.realtime_pack")
              }}</span>
            </div>
            <div>
              {{ $t("diagnose.pack_time_f") }}
              <b>{{ (status.packageInfo.mtime * 1000) | formatDay }}</b>
            </div>
          </div>
          <i class="el-icon-info c-info"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <template v-if="freeMem && freeMem < 1">
          <p class="c-warning">{{ $t("diagnose.lack_rom") }}</p>
        </template>
        <template v-else>
          <el-button
            :loading="status.isRunning"
            @click.native="runPackDiagnose"
            class="w160"
            type="primary"
            >{{
              status.isRunning
                ? $t("diagnose.pack_captual")
                : $t("diagnose.pack_begin")
            }}</el-button
          >
          <el-button
            :disabled="!status.isRunning"
            @click.native="stopPackDiagnose"
            class="w160"
            plain
            type="primary"
            >{{ $t("diagnose.pack_stop") }}</el-button
          >
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { ipValidator } from "@/utils/rules";
import { formSubmit, rateTrans } from "@/utils/utils";
import { protocol } from "@/enum";
import { formatDay } from "@/filters/time";
import model from "@/model";
export default {
  name: "DiagnosePackage",
  data() {
    return {
      freeMem: 0,
      protocol: protocol,
      ifaces: [
        {
          l: "WAN",
          v: "eth0.1"
        },
        {
          l: "LAN",
          v: "eth0.233"
        }
      ],
      baseModel: model.packageFn(),
      baseRules: {
        ip: [
          {
            validator: ipValidator,
            message: I18N.t("diagnose.invalid_ip_addr")
          }
        ]
      },
      interval: false,
      status: {
        isRunning: false,
        hasPackage: false,
        packageInfo: {}
      }
    };
  },
  async created() {
    await this._getMemAndIfaces();
    this.getPackDiagnoseStatus();
  },
  beforeDestroy() {
    this.stopInterval();
  },
  filters: {
    rateTrans,
    formatDay
  },
  methods: {
    // 加载可用内存数
    async _getMemAndIfaces() {
      const _result = await this.$api.diagnose("getMemAndIfaces");
      this.freeMem = _result.freeMem;
      this.ifaces = _result.ifaces;
    },
    // 开始抓包
    runPackDiagnose() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.status.isRunning = true;
          await this.$api.diagnose("runPackDiagnose", this.baseModel, {
            isSilence: true
          });
          this.getPackDiagnoseStatus();
        }
      });
    },
    // 获取抓包状态
    async getPackDiagnoseStatus() {
      this.status = await this.$api.diagnose("getPackDiagnoseStatus", null, {
        isSilence: true
      });
      if (this.status.isRunning) {
        // 正在抓包时轮询
        this.interval = setTimeout(() => {
          this.getPackDiagnoseStatus();
        }, 3000);
      } else {
        this.stopInterval();
      }
    },
    // 停止抓包
    stopPackDiagnose() {
      this.$api.diagnose("stopPackDiagnose").then(d => {
        this.getPackDiagnoseStatus();
      });
    },
    stopInterval() {
      this.interval && clearTimeout(this.interval);
    },
    // 下载抓包信息
    downloadPackDiagnose() {
      let _backupUrl = `${process.env.PROXY}${window.BASE_URI ||
        process.env.BASE_PATH}/api/download?auth=${window.Cookie.get(
        window.sn
      )}`;
      formSubmit(_backupUrl, { method: "downloadPackDiagnose" });
    },
    // 删除包
    deletePackage() {
      this.$confirm(I18N.t("diagnose.del_pack_confirm"))
        .then(() => {
          this.$api.diagnose("deletePackDiagnose").then(d => {
            this.$message({
              message: I18N.t("tip.del_success"),
              type: "success"
            });
            this.getPackDiagnoseStatus();
          });
        })
        .catch(() => {});
    }
  }
};
</script>
<style lang="scss" scoped>
</style>

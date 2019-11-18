<template>
  <div class="diagnose-package">
    <help-alert json-key="packageJson" title="抓包诊断"></help-alert>
    <el-form :model="baseModel" :rules="baseRules" class="w500 web-form" label-width="160px" ref="baseForm" size="small">
      <el-form-item label="接口" prop="iface">
        <el-select style="width:340px;" v-model="baseModel.iface">
          <el-option key="iface_eth0" label="ALL" value="eth0"></el-option>
          <el-option :key="iface.v" :label="iface.l" :value="iface.v" v-for="iface in ifaces"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="协议名" prop="protocal">
        <el-select style="width:340px;" v-model="baseModel.protocal">
          <el-option key="protocal_all" label="ALL" value></el-option>
          <el-option :key="proto.v" :label="proto.k" :value="proto.v" v-for="proto in protocol"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="主机IP" prop="ip">
        <el-input v-model="baseModel.ip"></el-input>
      </el-form-item>
      <el-form-item label="限制文件大小" prop="size">
        <el-select style="width:340px;" v-model="baseModel.size">
          <el-option :key="free" :label="free+'M'" :value="free" v-for="free in Math.min(Math.floor(freeMem),8)"></el-option>
        </el-select>
        <span class="web-form--tip">
          当前内存剩余
          <i class="el-icon-loading f-theme" v-if="!freeMem"></i>
          <b class="f-theme" v-else>{{freeMem.toFixed(2)}}</b> M
        </span>
      </el-form-item>
      <el-form-item label="限制报文个数" prop="package">
        <el-select style="width:340px;" v-model="baseModel.package">
          <el-option :value="500" label="500个"></el-option>
          <el-option :value="1000" label="1000个"></el-option>
          <el-option :value="1500" label="1500个"></el-option>
          <el-option :value="2000" label="2000个"></el-option>
          <el-option label="不限制" value></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="下载链接" v-show="status.hasPackage">
        <el-button :disabled="status.isRunning" @click.native="downloadPackDiagnose" type="text">点击这里下载pcap文件</el-button>
        <el-tooltip placement="top">
          <div slot="content">
            <div class="mb5">
              文件大小：
              <b>{{status.packageInfo.size|rateTrans}}</b>
              <a @click="deletePackage" class="c-success pointer" v-if="!status.isRunning">点击删除文件</a>
              <span class="c-success ml5" v-else>实时抓包中...</span>
            </div>
            <div>
              抓包时间：
              <b>{{status.packageInfo.mtime*1000|formatDay}}</b>
            </div>
          </div>
          <i class="el-icon-info c-info"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <template v-if="freeMem && freeMem<1">
          <p class="c-warning">剩余内存小于1M，无法执行抓包</p>
        </template>
        <template v-else>
          <el-button
            :loading="status.isRunning"
            @click.native="runPackDiagnose"
            class="w160"
            type="primary"
          >{{status.isRunning ? "正在抓包" : "开始抓包"}}</el-button>
          <el-button :disabled="!status.isRunning" @click.native="stopPackDiagnose" class="w160" type="primary">停止抓包</el-button>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { ipValidator } from '@/utils/rules'
import { formSubmit, rateTrans } from '@/utils/utils'
import { protocol } from '@/enum'
import { formatDay } from '@/filters/time'
import model from '@/model'
export default {
  name: 'DiagnosePackage',
  data() {
    return {
      freeMem: 0,
      protocol: protocol,
      ifaces: [
        {
          l: 'WAN',
          v: 'eth0.1'
        },
        {
          l: 'LAN',
          v: 'eth0.233'
        }
      ],
      baseModel: model.packageFn(),
      baseRules: {
        ip: [{ validator: ipValidator, message: '无效IP地址' }]
      },
      interval: false,
      status: {
        isRunning: false,
        hasPackage: false,
        packageInfo: {}
      }
    }
  },
  async created() {
    await this._getMemAndIfaces()
    this.getPackDiagnoseStatus()
  },
  beforeDestroy() {
    this.stopInterval()
  },
  filters: {
    rateTrans,
    formatDay
  },
  methods: {
    // 加载可用内存数
    async _getMemAndIfaces() {
      const _result = await this.$api.diagnose('getMemAndIfaces')
      this.freeMem = _result.freeMem
      this.ifaces = _result.ifaces
    },
    // 开始抓包
    runPackDiagnose() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.status.isRunning = true
          await this.$api.diagnose('runPackDiagnose', this.baseModel, {
            isSilence: true
          })
          this.getPackDiagnoseStatus()
        }
      })
    },
    // 获取抓包状态
    async getPackDiagnoseStatus() {
      this.status = await this.$api.diagnose('getPackDiagnoseStatus', null, {
        isSilence: true
      })
      if (this.status.isRunning) {
        // 正在抓包时轮询
        this.interval = setTimeout(() => {
          this.getPackDiagnoseStatus()
        }, 3000)
      } else {
        this.stopInterval()
      }
    },
    // 停止抓包
    stopPackDiagnose() {
      this.$api.diagnose('stopPackDiagnose').then(d => {
        this.getPackDiagnoseStatus()
      })
    },
    stopInterval() {
      this.interval && clearTimeout(this.interval)
    },
    // 下载抓包信息
    downloadPackDiagnose() {
      let _backupUrl = `${process.env.PROXY}${
        window.BASE_URI || process.env.BASE_PATH
      }/api/download?auth=${window.Cookie.get(window.sn)}`
      formSubmit(_backupUrl, { method: 'downloadPackDiagnose' })
    },
    // 删除包
    deletePackage() {
      this.$confirm('确认删除包？')
        .then(() => {
          this.$api.diagnose('deletePackDiagnose').then(d => {
            this.$message({
              message: '删除成功！',
              type: 'success'
            })
            this.getPackDiagnoseStatus()
          })
        })
        .catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

<template>
  <div class="advanced-macc-auth">
    <help-alert title="微信/短信/一键认证" json-key="authTabJson">
      <template slot="content">
        <div class="c-warning">
          <div class="mt10"><b>微信连Wi-Fi：需在微信公众平台、诺客MACC平台做相应配置后认证方可生效。（操作指南请查看《实施一本通》->快速配置->微信连WIFI认证
              <el-button class="pd0" type="text" @click="onMoveToHelp">【点击查看】</el-button>）</b></div>
          <div class="mt10"><b>短信认证：需在诺客MACC平台做相应配置后认证方可生效。（操作指南请查看《实施一本通》->快速配置->短信认证
              <el-button class="pd0" type="text" @click="onMoveToHelp">【点击查看】</el-button>）</b></div>
          <div class="mt10"><b>如果EAP的IP在认证范围内，请将EAP的MAC添加到<a class="c-success pointer" @click="$parent.tabValue='4'">“免认证”</a>的MAC白名单中。</b></div>
        </div>
      </template>
    </help-alert>
    <el-form ref="authForm" label-width="160px" :model="maccAuthData" :rules="baseRules">
      <el-form-item label="认证上网开关">
        <el-switch v-model="maccAuthData.enable" inactive-value="0" active-value="1"></el-switch>
      </el-form-item>
      <template v-if="maccAuthData.enable === '1'">
        <el-form-item label="服务器类型" prop="authType">
          <el-select class="w300" v-model="maccAuthData.authType" placeholder="选择服务器类型">
            <el-option label="微信连Wi-Fi" value="wx2"></el-option>
            <el-option label="短信认证/一键认证" value="wifidog"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="wifiName" v-if="maccAuthData.authType !== 'wifidog'" label="WiFi网络名称">
          <el-autocomplete class="w300" v-model="maccAuthData.wifiName" :fetch-suggestions="querySearch">
            <template slot-scope="props">
              <div class="name">{{ props.item.value }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <!-- <el-form-item label="无感知上线">
          <el-checkbox-group v-model="maccAuthData.macByPass">
            <el-checkbox label="开启" true-label="1" false-label="0"></el-checkbox>
          </el-checkbox-group>
        </el-form-item> -->
        <el-form-item label="用户逃生功能">
          <el-checkbox-group v-model="maccAuthData.portalCheck">
            <el-checkbox label="开启" true-label="1" false-label="0"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <!-- <el-form-item label="下线检测模式">
          <el-checkbox-group v-model="maccAuthData.flowDetectEn">
            <el-checkbox label="开启" true-label="1" false-label="0"></el-checkbox>
          </el-checkbox-group>
          <div class="flow-detect">
            <el-form-item prop="flowDetectTime" label="" v-if="maccAuthData.flowDetectEn != '0'">
              <el-input size="mini" class="w50 mr5 ml5" v-model="maccAuthData.flowDetectTime"></el-input>
              <span>(1-65535)分钟内无流量，用户将被强制下线</span>
            </el-form-item>
          </div>
        </el-form-item> -->
        <el-form-item label="认证IP地址/范围" prop="authIpList" class="ip-list mb0 is-required">
          <template v-for="(item,idx) in maccAuthData.authIpList">
            <el-form-item :prop="`authIpList[${idx}]`" :key="idx" :rules="ipValidate(maccAuthData.authIpList.concat(allAuthList),idx)">
              <el-input class="w300" v-model="maccAuthData.authIpList[idx]" placeholder="范围格式：1.1.1.1-1.1.1.100"></el-input>
              <el-button type="text" size="medium" @click="onDelAuthIpList(idx)" v-if="maccAuthData.authIpList.length > 1">
                <i class="el-icon-close"></i>
              </el-button>
              <el-button type="text" size="medium" @click="onAddAuthIpList()" v-if="idx === maccAuthData.authIpList.length - 1 && maccAuthData.authIpList.length < 5">
                <i class="el-icon-plus"></i>
              </el-button>
            </el-form-item>
          </template>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button type="primary" class="w200" v-auth="onSave" :loading="isSaveLoading">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import { intValidate, isBetween } from '@/utils/rulesUtils'
import { judgeIpRangeRules } from '@/utils/commonValidates'
export default {
  name: 'AuthTab',
  data() {
    const detectTimeValidate = (r, v, cb) => {
      if (!intValidate(v)) return cb(new Error('请输入整数'))
      if (!isBetween(v, 1, 65535)) return cb(new Error('范围为1-65535'))
      return cb()
    }
    return {
      allAuthList: [],
      maccAuthData: { authIpList: [] },
      isSaveLoading: false,
      originDataStr: '',
      baseRules: {
        wifiName: [
          { required: true, message: '请输入WiFi网络名称' },
          {
            validator: nameLengthValidator,
            size: 64,
            message: 'wifi名称不能超过64个字符(单个中文占3个字符)'
          }
        ],
        authType: [{ required: true, message: '请选择服务器类型' }],
        flowDetectTime: [
          { required: true, message: '请输入分钟数' },
          { validator: detectTimeValidate }
        ]
      },
      wifiNames: null
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$api.getMaccAuth().then(d => {
        if (d.authIpList.length === 0) d.authIpList = ['']
        this.maccAuthData = d
        this.allAuthList = d.allAuthList
        this.originDataStr = JSON.stringify(this.maccAuthData)
      })
    },
    onMoveToHelp() {
      window.open('http://www.ruijie.com.cn/fw/qdwd/59789', '_blank')
    },
    ipValidate(list = [], index) {
      return judgeIpRangeRules(list, index)
    },
    async querySearch(queryString, cb) {
      if (!this.wifiNames) {
        let wifiInfo = await this.$api.getWireless()
        this.wifiNames = wifiInfo.ssidList.map(item => {
          return { value: item.ssidName }
        })
      }
      cb(this.wifiNames)
    },
    onAddAuthIpList() {
      this.maccAuthData.authIpList.push('')
    },
    onDelAuthIpList(idx) {
      this.maccAuthData.authIpList.splice(idx, 1)
    },
    onSave() {
      this.$refs.authForm.validate(ok => {
        if (ok) {
          if (this.originDataStr === JSON.stringify(this.maccAuthData))
            return this.$message('配置未修改')
          this.isSaveLoading = true
          this.$api
            .setMaccAuth(this.maccAuthData, true)
            .then(d => {
              if (d.code != '0') return this.$message('配置失败，请重新操作')
              this.$message({
                message: '配置成功',
                type: 'success'
              })
              this.originDataStr = JSON.stringify(this.maccAuthData)
            })
            .finally(() => {
              this.isSaveLoading = false
            })
        }
      })
    }
  }
}
</script>
<style lang="scss">
.advanced-macc-auth {
  .el-input__inner {
    padding: 5px;
  }
  .flow-detect {
    position: absolute;
    left: 80px;
    top: 0;
  }
  .ip-list {
    .el-form-item {
      margin-bottom: 22px;
    }
  }
}
</style>

<template>
  <div class="auth-guest-qrcode">
    <help-alert json-key="guestScanJson" title="访客扫描上网">
      <template slot="content">
        <div class="mt10">认证用户扫码指定的二维码即可上网。</div>
        <div class="c-warning">
          <div class="mt10">
            <b>设备能够联通互联网的情况下终端才会弹出认证界面。</b>
          </div>
          <div class="mt10">
            <b>
              如果EAP的IP在认证范围内，请将EAP的MAC添加到
              <a @click="$parent.tabValue='4'" class="c-success pointer">“免认证”</a>的MAC白名单中。
            </b>
          </div>
        </div>
      </template>
    </help-alert>
    <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm">
      <el-form-item label="扫描认证">
        <el-switch active-value="1" inactive-value="0" v-model="baseModel.en"></el-switch>
      </el-form-item>
      <template v-if="baseModel.en === '1'">
        <el-form-item class="is-required" label="认证IP/范围" prop="authList">
          <el-form-item
            :class="{mb20:index!==baseModel.authList.length-1}"
            :key="index"
            :prop="`authList[${index}]`"
            :rules="ipValidate(baseModel.authList.concat(allAuthList),index)"
            v-for="(item,index) in baseModel.authList"
          >
            <el-input class="w300" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="baseModel.authList[index]"></el-input>
            <el-button @click="onDelAuthIpList(index)" size="medium" type="text" v-if="baseModel.authList.length > 1">
              <i class="el-icon-close"></i>
            </el-button>
            <el-button
              @click="onAddAuthIpList"
              size="medium"
              type="text"
              v-if="index === baseModel.authList.length - 1 && baseModel.authList.length < 5"
            >
              <i class="el-icon-plus"></i>
            </el-button>
          </el-form-item>
        </el-form-item>
        <el-form-item label="允许上网时长" prop="time">
          <el-input class="w300" placeholder="允许上网时长" v-model="baseModel.time">
            <label slot="append">分钟</label>
          </el-input>
        </el-form-item>
        <el-form-item label="生成二维码">
          <div class="scan-box w600 pos-r">
            <el-form-item class="mb20" label="二维码IP" label-width="110px" prop="ip" v-if="false">
              <!-- <el-input class="w220" v-model="baseModel.ip" placeholder="例：192.168.1.2"></el-input> -->
              <label>{{baseModel.ip}}</label>
            </el-form-item>
            <el-form-item class="mb20" label="二维码动态码" label-width="110px" prop="qrcodeindex">
              <el-input class="w220" placeholder="二维码动态码" v-model="baseModel.qrcodeindex"></el-input>
            </el-form-item>
            <el-form-item class="mb20" label="二维码信息" label-width="110px" prop="displayacttext">
              <el-input :rows="4" class="w220" placeholder="二维码信息" type="textarea" v-model="baseModel.displayacttext"></el-input>
            </el-form-item>
            <div class="c-warning">可将右侧的二维码打印粘贴，访客可扫描此二维码上网</div>
            <template v-if="qrcodeUrl">
              <el-tooltip content="可右键另存为" placement="top">
                <qrcode-vue :size="140" :value="qrcodeUrl" class="pos-a scan-box--qr" level="L"></qrcode-vue>
              </el-tooltip>
            </template>
            <div class="pos-a scan-box--qr tc scan-box--bordered" v-else>
              <div class="scan-box--qrinfo">
                <p>二维码</p>
                <p>（可右键另存为）</p>
              </div>
            </div>
            <el-form-item v-if="false">
              <el-button :disabled="!qrEnable" size="small" type="primary" v-auth="onMakeQrCode">生成二维码</el-button>
            </el-form-item>
          </div>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button :loading="isSaveLoading" class="w200" type="primary" v-auth="onSubmit">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import QrcodeVue from 'qrcode.vue'
import { nameLengthValidator, ipValidator, quoteValidator } from '@/utils/rules'
import { intValidate, isBetween, isIp } from '@/utils/rulesUtils'
import { judgeIpRangeRules } from '@/utils/commonValidates'
export default {
  name: 'GuestQrcode',
  data() {
    const detectTimeValidate = (r, v, cb) => {
      if (!intValidate(v)) return cb(new Error('请输入整数'))
      if (!isBetween(v, 1, 65535)) return cb(new Error('范围为1-65535'))
      return cb()
    }
    const codeValidator = (r, v, cb) => {
      if (!/^[a-zA-Z0-9]+$/.test(v)) {
        return cb(new Error(r.message))
      }
      return cb()
    }
    return {
      qrcodeUrl: '',
      allAuthList: [],
      isSaveLoading: false,
      baseModel: {
        authList: [''],
        en: '0',
        time: '140',
        ip: '',
        qrcodeindex: '',
        displayacttext: ''
      },
      baseRules: {
        time: [
          { required: true, message: '请输入分钟数' },
          { validator: detectTimeValidate }
        ],
        ip: [
          { required: true, message: '请输入二维码IP' },
          { validator: ipValidator }
        ],
        qrcodeindex: [
          { required: true, message: '请输入二维动态码' },
          { validator: codeValidator, message: '只允许输入数字、英文、字母' }
        ],
        displayacttext: [
          { validator: quoteValidator, message: '不允许输入英文单双引号' },
          { validator: nameLengthValidator, size: 108 }
        ]
      }
    }
  },
  computed: {
    qrEnable() {
      return isIp(this.baseModel.ip) && this.baseModel.qrcodeindex.trim()
    }
  },
  watch: {
    qrEnable(v) {
      if (v) {
        this.onMakeQrCode()
      } else {
        this.qrcodeUrl = ''
      }
    }
  },
  components: {
    QrcodeVue
  },
  created() {
    this._loadGuestScanAuth()
  },
  methods: {
    // 加载账户认证信息
    _loadGuestScanAuth() {
      this.$api.getGuestScanAuth().then(d => {
        if (d.authList.length === 0) {
          d.authList = ['']
        }
        this.baseModel = d
        this.allAuthList = d.allAuthList || []
      })
    },
    // IP范围验证数组
    ipValidate(list = [], index) {
      return judgeIpRangeRules(list, index)
    },
    // 添加IP范围
    onAddAuthIpList() {
      this.baseModel.authList.push('')
    },
    // 删除IP范围
    onDelAuthIpList(index) {
      this.baseModel.authList.splice(index, 1)
    },
    // 生成二维码http://10.44.77.253/guest_auth/qrcode_active_auth.lua?code=xxxx
    onMakeQrCode() {
      this.qrcodeUrl = `http://${this.baseModel.ip}/${this.baseModel.scriptpath}?code=${this.baseModel.qrcodeindex}`
    },
    // 提交数据
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isSaveLoading = true
          this.$api
            .setGuestScanAuth(this.baseModel)
            .then(d => {
              this.$message({
                message: '配置成功',
                type: 'success'
              })
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
<style lang="scss" scoped>
@import '../../../../style/utils/variable';
.auth-guest-qrcode {
  .scan-box {
    border: $--border-base;
    border-style: dashed;
    padding: 20px;
    &--qr {
      top: 50%;
      transform: translateY(-50%);
      right: 25px;
      width: 140px;
      height: 140px;
      overflow: hidden;
    }
    &--bordered {
      border: $--border-base;
      border-radius: $--border-radius-small;
    }
    &--qrinfo {
      margin-top: 52px;
      p {
        font-size: 12px;
        line-height: 1.5;
      }
    }
  }
}
</style>


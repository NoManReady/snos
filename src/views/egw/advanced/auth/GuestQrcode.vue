<template>
  <div class="auth-guest-qrcode">
    <help-alert json-key="guestScanJson" :title="$t('egw.auth.custom_code_scanning')">
      <template slot="content">
        <div class="mt10">{{$t('egw.auth.auth_user_code_scanning')}}</div>
        <div class="c-warning">
          <div class="mt10">
            <b>{{$t('egw.auth.show_auth_by_net')}}</b>
          </div>
          <div class="mt10">
           <b>
              <i18n path="egw.auth.erp_mac_to_white">
                <a @click="$parent.tabValue='4'" class="c-success pointer">{{$t('egw.auth.certification_free')}}</a>
              </i18n>
            </b>
          </div>
        </div>
      </template>
    </help-alert>
    <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
      <el-form-item :label="$t('egw.auth.auth_code_scanning')">
        <el-switch active-value="1" inactive-value="0" v-model="baseModel.en"></el-switch>
      </el-form-item>
      <template v-if="baseModel.en === '1'">
        <el-form-item class="is-required" :label="$t('egw.auth.access_range_by_ip')" prop="authList">
          <el-form-item
            :class="{mb20:index!==baseModel.authList.length-1}"
            :key="index"
            :prop="`authList[${index}]`"
            :rules="ipValidate(baseModel.authList.concat(allAuthList),index)"
            v-for="(item,index) in baseModel.authList"
          >
            <el-input class="w300" :placeholder="$t('wan.ip_range_example')" v-model="baseModel.authList[index]"></el-input>
            <el-button @click="onDelAuthIpList(index)" type="text" v-if="baseModel.authList.length > 1">
              <i class="el-icon-close"></i>
            </el-button>
            <el-button
              @click="onAddAuthIpList"
              type="text"
              v-if="index === baseModel.authList.length - 1 && baseModel.authList.length < 5"
            >
              <i class="el-icon-plus"></i>
            </el-button>
          </el-form-item>
        </el-form-item>
        <el-form-item :label="$t('egw.auth.access_online_times')" prop="time">
          <el-input class="w300" :placeholder="$t('egw.auth.access_online_times')" v-model="baseModel.time">
            <label slot="append">{{$t('time.minute')}}</label>
          </el-input>
        </el-form-item>
        <el-form-item  :label="$t('egw.auth.generate_code')">
          <div class="scan-box w600 pos-r">
            <el-form-item class="mb20" :label="$t('egw.auth.ip_code')" label-width="110px" prop="ip" v-if="false">
              <!-- <el-input class="w220" v-model="baseModel.ip" placeholder="例：192.168.1.2"></el-input> -->
              <label>{{baseModel.ip}}</label>
            </el-form-item>
            <el-form-item class="mb20" :label="$t('egw.auth.dynamic_code')"  label-width="110px" prop="qrcodeindex">
              <el-input class="w220" :placeholder="$t('egw.auth.dynamic_code')" v-model="baseModel.qrcodeindex"></el-input>
            </el-form-item>
            <el-form-item class="mb20" :label="$t('egw.auth.information_code')" label-width="110px" prop="displayacttext">
              <el-input :rows="4" class="w220" :placeholder="$t('egw.auth.information_code')" type="textarea" v-model="baseModel.displayacttext"></el-input>
            </el-form-item>
            <div class="c-warning">{{$t('egw.auth.print_code_to_scanning_tip')}}</div>
            <template v-if="qrcodeUrl">
              <el-tooltip :content="$t('egw.auth.Right_click_to_save')" placement="top">
                <qrcode-vue :size="140" :value="qrcodeUrl" class="pos-a scan-box--qr" level="L"></qrcode-vue>
              </el-tooltip>
            </template>
            <div class="pos-a scan-box--qr tc scan-box--bordered" v-else>
              <div class="scan-box--qrinfo">
                <p>{{$t('egw.auth.two_bar_codes')}}</p>
                <p>{{$t('egw.auth.Right_click_to_save')}}</p>
              </div>
            </div>
            <el-form-item v-if="false">
              <el-button :disabled="!qrEnable" type="primary" v-auth="onMakeQrCode">{{$t('egw.auth.ip_code_is_required')}}</el-button>
            </el-form-item>
          </div>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button :loading="isSaveLoading" class="w160" type="primary" v-auth="onSubmit">{{$t('action.save')}}</el-button>
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
      if (!intValidate(v)) return cb(new Error(this.$t('egw.auth.enter_integer_required')))
      if (!isBetween(v, 1, 65535)) return cb(new Error(this.$t('egw.port_limit_tip')))
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
          { required: true, message: this.$t('egw.auth.enter_minutes_required') },
          { validator: detectTimeValidate }
        ],
        ip: [
          { required: true, message: this.$t('egw.auth.ip_code_is_required')},
          { validator: ipValidator }
        ],
        qrcodeindex: [
          { required: true, message: this.$t('egw.auth.generate_code_is_required') },
          { validator: codeValidator, message: this.$t('egw.auth.access_number_letters_english_any') }
        ],
        displayacttext: [
          { validator: quoteValidator, message: this.$t('egw.auth.marks_no_allow_tip') },
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
                message: this.$t('tip.edit1_success'),
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


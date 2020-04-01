<template>
  <div class="auth-guest-auth">
    <help-alert json-key="guestAuthJson" :title="$t('egw.auth.access_custom_net')">
      <template slot="content">
        <div class="mt10">{{$t('egw.auth.access_by_code_tip')}}</div>
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
      <el-form-item :label="$t('egw.auth.access_custom_net')">
        <el-switch active-value="1" inactive-value="0" v-model="baseModel.en"></el-switch>
      </el-form-item>
      <template v-if="baseModel.en === '1'">
        <el-form-item :label="$t('egw.auth.code_scanning_tip')" prop="displaypastext">
          <el-input :rows="4" class="w300" :placeholder="$t('egw.auth.code_scanning_tip')" type="textarea" v-model="baseModel.displaypastext"></el-input>
        </el-form-item>
        <el-form-item class="is-required" :label="$t('egw.auth.auth_ip_or_range')" prop="authList">
          <el-form-item
            :class="{mb20:index!==baseModel.authList.length-1}"
            :key="index"
            :prop="`authList[${index}]`"
            :rules="ipValidate(baseModel.authList.concat(allAuthList,baseModel.activeAuthIpRange),index)"
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
        <el-form-item class="is-required" :label="$t('egw.auth.access_range_by_ip')" prop="activeAuthIpRange">
          <el-form-item
            :key="index"
            :prop="`activeAuthIpRange[${index}]`"
            :rules="ipValidate(baseModel.activeAuthIpRange.concat(baseModel.authList),index)"
            v-for="(item,index) in baseModel.activeAuthIpRange"
          >
            <el-input class="w300" :placeholder="$t('wan.ip_range_example')" v-model="baseModel.activeAuthIpRange[index]"></el-input>
          </el-form-item>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button :loading="isSaveLoading" class="w160" type="primary" v-auth="onSubmit">{{$t('action.save_edit')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { nameLengthValidator, quoteValidator } from '@/utils/rules'
import { intValidate, isBetween } from '@/utils/rulesUtils'
import { judgeIpRangeRules } from '@/utils/commonValidates'
export default {
  name: 'GuestAuth',
  data() {
    const detectTimeValidate = (r, v, cb) => {
      if (!intValidate(v)) return cb(new Error(this.$t('egw.auth.enter_integer_required')))
      if (!isBetween(v, 1, 65535)) return cb(new Error(this.$t('egw.port_limit_tip')))
      return cb()
    }
    return {
      allAuthList: [],
      isSaveLoading: false,
      baseModel: {
        authList: [''],
        en: '0',
        time: '',
        activeAuthIpRange: [''],
        displaypastext: ''
      },
      baseRules: {
        time: [
          { required: true, message: this.$t('egw.auth.enter_minutes_required')  },
          { validator: detectTimeValidate }
        ],
        displaypastext: [
          { validator: quoteValidator, message: this.$t('egw.auth.marks_no_allow_tip') },
          { validator: nameLengthValidator, size: 108 }
        ]
      }
    }
  },
  created() {
    this._loadGuestAuth()
  },
  methods: {
    // 加载账户认证信息
    _loadGuestAuth() {
      this.$api.getGuestAuth().then(d => {
        if (d.authList.length === 0) {
          d.authList = ['']
        }
        if (d.activeAuthIpRange.length === 0) {
          d.activeAuthIpRange = ['']
        }
        this.baseModel = d
        this.allAuthList = d.allAuthList || []
      })
    },
    // IP范围验证数组
    ipValidate(list, index) {
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
    // 提交数据
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isSaveLoading = true
          this.$api
            .setGuestAuth(this.baseModel)
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

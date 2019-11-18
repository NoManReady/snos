<template>
  <div class="auth-guest-auth">
    <help-alert json-key="guestAuthJson" title="授权访客上网">
      <template slot="content">
        <div class="mt10">指定的授权IP用户或者账号密码认证用户使用浏览器或者微信扫描对应访客认证弹出的二维码即可上网。</div>
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
      <el-form-item label="授权访客上网">
        <el-switch active-value="1" inactive-value="0" v-model="baseModel.en"></el-switch>
      </el-form-item>
      <template v-if="baseModel.en === '1'">
        <el-form-item label="扫码信息提示" prop="displaypastext">
          <el-input :rows="4" class="w300" placeholder="扫码信息提示" type="textarea" v-model="baseModel.displaypastext"></el-input>
        </el-form-item>
        <el-form-item class="is-required" label="认证IP/范围" prop="authList">
          <el-form-item
            :class="{mb20:index!==baseModel.authList.length-1}"
            :key="index"
            :prop="`authList[${index}]`"
            :rules="ipValidate(baseModel.authList.concat(allAuthList,baseModel.activeAuthIpRange),index)"
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
        <el-form-item class="is-required" label="授权IP/范围" prop="activeAuthIpRange">
          <el-form-item
            :key="index"
            :prop="`activeAuthIpRange[${index}]`"
            :rules="ipValidate(baseModel.activeAuthIpRange.concat(baseModel.authList),index)"
            v-for="(item,index) in baseModel.activeAuthIpRange"
          >
            <el-input class="w300" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="baseModel.activeAuthIpRange[index]"></el-input>
          </el-form-item>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button :loading="isSaveLoading" class="w200" type="primary" v-auth="onSubmit">保存配置</el-button>
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
      if (!intValidate(v)) return cb(new Error('请输入整数'))
      if (!isBetween(v, 1, 65535)) return cb(new Error('范围为1-65535'))
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
          { required: true, message: '请输入分钟数' },
          { validator: detectTimeValidate }
        ],
        displaypastext: [
          { validator: quoteValidator, message: '不允许输入英文单双引号' },
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

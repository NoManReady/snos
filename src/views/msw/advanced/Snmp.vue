<template>
  <div class="advanced-snmp">
    <help-alert title="SNMP">
      <div slot="content"></div>
    </help-alert>
    <div class="box">
      <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="small">
        <el-form-item label="SNMP开关：" prop="enable">
          <el-switch @change="_onEnableChange" active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
        </el-form-item>
        <template v-if="baseModel.enable==='1'">
          <el-form-item label="版本号：" prop="version">
            <el-select class="w260" v-model="baseModel.version">
              <el-option label="v1/v2c" value="0"></el-option>
              <el-option label="v3" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="识别码：" prop="community" v-if="baseModel.version==='0'">
            <el-input :placeholder="'字符：（1~20）'" class="w260" v-model="baseModel.community"></el-input>
          </el-form-item>
          <template v-else>
            <el-form-item label="用户名：" prop="user">
              <el-input :placeholder="'字符：（1~30）'" class="w260" v-model="baseModel.user"></el-input>
            </el-form-item>
            <el-form-item label="认证密码：" prop="authpasswd">
              <el-input :placeholder="'字符：（8~32）'" class="w260" v-model="baseModel.authpasswd"></el-input>
            </el-form-item>
            <el-form-item label="加密密码：" prop="encpasswd">
              <el-input :placeholder="'字符：（8~64）'" class="w260" v-model="baseModel.encpasswd"></el-input>
            </el-form-item>
          </template>
          <el-form-item label="主机IP集：" prop="hostips">
            <template v-for="(item,idx) in baseModel.hostips">
              <el-form-item :key="idx" :prop="`hostips[${idx}]`" :rules="_ipValidateMethod(idx)">
                <el-input class="w260" placeholder="范围格式：1.1.1.100" v-model="baseModel.hostips[idx]"></el-input>
                <el-button @click="_onRemoveHostip(idx)" size="medium" type="text" v-if="baseModel.hostips.length > 1">
                  <i class="el-icon-close"></i>
                </el-button>
                <el-button @click="_onAddHostip()" size="medium" type="text" v-if="idx === baseModel.hostips.length - 1">
                  <i class="el-icon-plus"></i>
                </el-button>
              </el-form-item>
            </template>
          </el-form-item>
          <el-form-item class="mt20">
            <el-button @click.native="_onSaveConf" size="small" type="primary">保存配置</el-button>
          </el-form-item>
        </template>
      </el-form>
    </div>
  </div>
</template>
<script>
import PortPanel from '@/common/PortPanel'
import { nameLengthValidator, ipValidator } from '@/utils/rules'
import { snmp } from '@/model/msw/sec'
import { mapGetters } from 'vuex'
export default {
  name: 'advanced-snmp',
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      baseModel: snmp(),
      originEnable: '0',
      baseRules: {
        community: [{ validator: nameLengthValidator, max: 20 }],
        user: [{ validator: nameLengthValidator, max: 30 }],
        authpasswd: [{ validator: nameLengthValidator, min: 8, max: 32 }],
        encpasswd: [{ validator: nameLengthValidator, min: 8, max: 64 }]
      }
    }
  },
  computed: {
    ...mapGetters('switcher', ['portinfo']),
    // port面板展示port
    panelPorts() {
      return this.portinfo
    }
  },
  created() {
    this._loadConf()
  },
  methods: {
    _ipValidateMethod(index) {
      const isExistIp = (r, v, cb) => {
        let _ip = this.baseModel.hostips[index]
        let _find = this.baseModel.hostips.findIndex(ip => ip === _ip)
        if (_find !== index) {
          return cb(new Error('IP重复'))
        }
        cb()
      }
      return [
        { required: true, message: '请输入IP地址或范围' },
        { validator: ipValidator },
        { validator: isExistIp }
      ]
    },
    // 添加hostip
    _onAddHostip() {
      this.baseModel.hostips.splice(this.baseModel.hostips.length, 0, '')
    },
    // 移除hostip
    _onRemoveHostip(index) {
      this.baseModel.hostips.splice(index, 1)
    },
    // 开关change
    _onEnableChange(enable) {
      if (enable === '0' && this.originEnable === '1') {
        this.$confirm(`是否确认关闭功能？`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(
          () => {
            // 提交数据
          },
          () => {
            this.baseModel.enable = '1'
          }
        )
      }
    },
    // 加载配置
    _loadConf() {},
    // 保存配置
    _onSaveConf() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          // console.log(this.baseModel)
        }
      })
    }
  }
}
</script>

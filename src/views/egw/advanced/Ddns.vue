<template>
  <div class="network-neighbor">
    <help-alert json-key="exampleJson" title="花生壳动态域名">
      <div slot="content">查看花生壳动态域名。</div>
    </help-alert>
    <div class="box-header">
      <span class="box-header-tit">
        花生壳动态域名
        <small></small>
      </span>
    </div>
    <el-form :model="dnsData" :rules="baseRules" class="w560" label-width="160px" ref="baseForm" status-icon>
      <el-form-item label="服务接口" prop="wan">
        <el-select class="w260" placeholder="请选择" v-model="dnsData.wan">
          <el-option :key="item" :label="item" :value="item" v-for="item in ifaceTypes"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户名" prop="user">
        <el-input class="w260" v-model="dnsData.user"></el-input>
        <el-button @click="onReg" type="text">没有账户，注册一个</el-button>
      </el-form-item>
      <el-form-item label="密码" prop="pass">
        <el-input class="w260" type="password" v-model="dnsData.pass"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="w120" type="primary" v-auth="onLogin">登录</el-button>
        <el-button class="w120 ml15" v-auth="onDel">删除</el-button>
      </el-form-item>
      <template>
        <el-form-item label="连接状态">
          <span>{{ status }}</span>
          <i class="el-icon-loading f-theme" v-if="dnsData.szStatus === 'get'"></i>
        </el-form-item>
        <el-form-item label="域名">
          <div v-if="!dnsData.szHost || dnsData.szHost.length == 0">-</div>
          <div :key="item" v-else v-for="item in dnsData.szHost">{{ item }}</div>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
import { quoteValidator } from '@/utils/rules'
import formMixins from '@/mixins/formMixins'
export default {
  name: 'Ddns',
  data() {
    return {
      dnsData: {},
      ifaceTypes: [],
      baseRules: {
        wan: [{ required: true, message: '请选择服务接口' }],
        user: [
          { required: true, message: '请输入用户名' },
          { validator: quoteValidator }
        ],
        pass: [
          { required: true, message: '请输入密码' },
          {
            validator: quoteValidator,
            message: '密码不可包含英文单引号和双引号'
          }
        ]
      }
    }
  },
  computed: {
    status() {
      let status = {
        passerror: '用户名或密码错误',
        neterror: '网络错误',
        s: '连接成功',
        get: '正在连接',
        f: '连接失败'
      }
      return status[this.dnsData.szStatus] || '-'
    }
  },
  mixins: [formMixins],
  async created() {
    await this.loadIfaceTypes()
    await this.init()
  },
  methods: {
    async init() {
      let dataByConfig = await this.$api.getPhdDns()
      let dataBySta = await this.$api.getPhdDnsSta()
      this.dnsData = Object.assign({}, dataBySta, dataByConfig)
      if (!this.dnsData.wan) this.dnsData.wan = this.ifaceTypes[0]
      this._clearValidate()
      if (dataBySta.szStatus === 'get') {
        setTimeout(() => {
          this.init()
        }, 5000)
      }
    },
    async loadIfaceTypes() {
      const result = await this.$api.getIfaceTypes()
      this.ifaceTypes = Object.freeze(Array.isArray(result) ? result : [])
    },
    onSetDns(data) {
      this.$api.setPhdDns(data).then(d => {
        this.init()
      })
    },
    onReg() {
      window.open(
        'https://login.oray.com/login/?tplname=qrcode&s_url=http%3A%2F%2Fwww.oray.com%2Fpeanuthull%2Fembed_apply.php',
        'blank'
      )
    },
    onDel() {
      this.$confirm('是否确认删除？')
        .then(() => {
          let setData = {
            user: '',
            pass: '',
            wan: ''
          }
          this.onSetDns(setData)
        })
        .catch(() => {})
    },
    onLogin() {
      this.$refs.baseForm.validate(ok => {
        if (ok) {
          let setData = {
            user: this.dnsData.user,
            pass: this.dnsData.pass,
            wan: this.dnsData.wan
          }
          this.onSetDns(setData)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

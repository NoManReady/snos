<template>
  <div class="network-neighbor">
    <help-alert json-key="exampleJson" :title="$t('egw.ddns.dynamic_domain_name')">
      <div slot="content">{{$t('egw.ddns.search_dynamic_domain_name')}}</div>
    </help-alert>
    <div class="box-header">
      <span class="box-header-tit">
        {{$t('egw.ddns.dynamic_domain_name')}}
        <small></small>
      </span>
    </div>
    <el-form :model="dnsData" :rules="baseRules" class="w560" label-width="160px" ref="baseForm" size="medium" status-icon>
      <el-form-item :label="$t('egw.ddns.service_interface')" prop="wan">
        <el-select class="w260" :placeholder="$t('action.select')" v-model="dnsData.wan">
          <el-option :key="item" :label="item.toUpperCase()" :value="item" v-for="item in ifaceTypes"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('egw.user_name')" prop="user">
        <el-input class="w260" v-model="dnsData.user"></el-input>
        <el-button v-if="$store.state.app.lang!=='en'" @click="onReg" type="text">{{$t('egw.ddns.register_new_user')}}</el-button>
      </el-form-item>
      <el-form-item :label="$t('egw.password')" prop="pass">
        <el-input class="w260" type="password" v-model="dnsData.pass"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="w120" type="primary" v-auth="onLogin">{{$t('egw.login')}}</el-button>
        <el-button class="w120 ml15" v-auth="onDel">{{$t('action.delete')}}</el-button>
      </el-form-item>
      <template>
        <el-form-item :label="$t('egw.link_status')">
          <span>{{ status }}</span>
          <i class="el-icon-loading f-theme" v-if="dnsData.szStatus === 'get'"></i>
        </el-form-item>
        <el-form-item :label="$t('egw.domain')">
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
        wan: [{ required: true, message: this.$t('egw.ddns.select_service_interface') }],
        user: [
          { required: true, message:  this.$t('egw.username_is_required') },
          { validator: quoteValidator }
        ],
        pass: [
          { required: true, message: this.$t('egw.password_is_required')},
          {
            validator: quoteValidator,
            message: this.$t('egw.ddns.password_no_allow_tip')
          }
        ]
      }
    }
  },
  computed: {
    status() {
      let status = {
        passerror: this.$t('egw.ddns.pass_error'),
        neterror: this.$t('egw.ddns.net_error'),
        s: this.$t('egw.ddns.link_success'),
        get: this.$t('egw.ddns.linking'),
        f: this.$t('egw.ddns.link_fail')
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
      this.$confirm( this.$t('tip.confirm_delete'))
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

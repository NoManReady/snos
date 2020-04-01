<template>
  <div class="whitelist">
    <help-alert :title="$t('egw.attack.anti_attack')" json-key="attackJson">
      <div slot="content">
        <label class="c-warning">{{$t('egw.attack.anti_attack_tip')}}</label>
      </div>
    </help-alert>
    <el-form :model="globalModel" :rules="globalModelRules" class="w460" label-width="160px" ref="globalForm" size="medium">
      <el-form-item :label="$t('egw.attack.record_max_count')" prop="record_max_count">
        <el-input class="w300" v-model="globalModel.record_max_count"></el-input>
        <span class="web-form--tip">{{$t('egw.attack.record_max_count_tip')}}</span>
      </el-form-item>
      <el-form-item :label="$t('egw.attack.classify_enable')">
        <el-switch active-value="1" inactive-value="0" v-model="globalModel.classify_enable"></el-switch>
      </el-form-item>
      <el-form-item
        :label="$t('egw.attack.white_ip_list')"
        :rules="[{validator: ipValidate}]"
        prop="white_ip_obj_list[0]"
        v-show="globalModel.classify_enable=='1'"
      >
        <el-input :placeholder="$t('wan.ip_example')" class="w300" v-model="globalModel.white_ip_obj_list[0]"></el-input>
        <el-button class="web-form--tip"  @click="addWhiteIp" size="medium" type="text" v-show="globalModel.white_ip_obj_list.length<5">
          <i class="el-icon-plus"></i>
        </el-button>
      </el-form-item>
      <el-form-item
        :key="index"
        :rules="[{validator: ipValidate}]"
        prop="item"
        v-for="(item,index) in globalModel.white_ip_obj_list"
        v-show="globalModel.classify_enable=='1'"
      >
        <el-input :placeholder="$t('wan.ip_example')" class="w300" v-if="index!=0" v-model="globalModel.white_ip_obj_list[index]"></el-input>
        <el-button class="web-form--tip" @click="delWhiteIp(index)" type="text" v-if="index!=0">
          <i class="el-icon-close"></i>
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="_setDhcpSnoop" class="w160" type="primary">{{$t('action.save')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { rangeValidator } from '@/utils/rules'
import { isIp } from '@/utils/rulesUtils'
export default {
  name: 'Attack',
  data() {
    return {
      globalModel: {
        record_max_count: '',
        classify_enable: '0',
        white_ip_obj_list: [''],
        white_ip_list: [],
        conntrack_enable: '0'
      },
      globalModelRules: {
        record_max_count: [
          {
            required: true,
            message: this.$t('egw.attack.record_max_count_is_required')
          },
          {
            validator: rangeValidator,
            min: 0,
            max: 1000,
            message: this.$t('egw.attack.record_max_count_range')
          }
        ]
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    ipValidate(r, v, cb) {
      if (v && !isIp(v)) return cb(new Error(this.$t('wan.invalid_ip_addr')))
      cb()
    },
    // 获取DHCP SNOOPING
    async init() {
      let _res = await this.$api.getAttack()
      this.globalModel = Object.assign({}, this.globalModel, _res)
      this.globalModel.white_ip_obj_list = []
      if (this.globalModel.white_ip_list.length > 0) {
        this.globalModel.white_ip_list.forEach((item, idx) => {
          this.globalModel.white_ip_obj_list.push(item.ip)
        })
      } else {
        this.globalModel.white_ip_obj_list = ['']
      }
    },
    //设置DHCP SNOOPING
    _setDhcpSnoop() {
      this.$refs.globalForm.validate(ok => {
        if (ok) {
          this.globalModel.white_ip_list = []
          this.globalModel.white_ip_obj_list.forEach((item, idx) => {
            if (item != '') {
              this.globalModel.white_ip_list.push({ ip: item })
            }
          })
          // delete this.globalModel.white_ip_obj_list
          this.globalModel.conntrack_enable =
            this.globalModel.record_max_count == '0' ? '0' : '1'
          this.$api.setAttack(this.globalModel).then(d => {
            this.$message({
              message: this.$t('tip.edit1_success'),
              type: 'success'
            })
          })
        }
      })
    },
    addWhiteIp() {
      this.globalModel.white_ip_obj_list.push('')
    },
    delWhiteIp(idx) {
      this.globalModel.white_ip_obj_list.splice(idx, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

<template>
  <div class="vpn-l2tp-server">
    <help-alert json-key="vpnL2tpSerJson0" title="L2TP服务器"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          L2TP服务器设置
          <small></small>
        </span>
      </div>
      <el-form
        :model="baseModel"
        :rules="baseRules"
        :validate-on-rule-change="false"
        class="web-form w460"
        label-width="180px"
        ref="baseForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="baseModel.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <!-- <el-input v-model="baseModel.password"></el-input> -->
          <eweb-input-password type="password" v-model="baseModel.password"></eweb-input-password>
        </el-form-item>
        <el-form-item label="本地地址" prop="localip">
          <el-input v-model="baseModel.localip"></el-input>
        </el-form-item>
        <el-form-item label="地址池" prop="ippool_name">
          <el-select @change="_onChangePool" class="w280" v-model="baseModel.ippool_name">
            <el-option :key="o.ippool_name" :label="o.ippool_name" :value="o.ippool_name" v-for="o in poolList"></el-option>
            <el-option
              :disabled="isPoolMax"
              :label="`自定义${isPoolMax ? '【地址池数量已达上限】' : ''}`"
              key="SELF_DEFINED"
              value="SELF_DEFINED"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form
          :model="poolModel"
          :rules="getPoolRules(isAddPool, isAddPool)"
          :validate-on-rule-change="false"
          class="web-form w460"
          label-width="180px"
          ref="poolForm"
        >
          <el-form-item label="自定义地址池名称" prop="ippool_name" v-if="isAddPool">
            <el-input placeholder="名称为1-28个字符" v-model="poolModel.ippool_name"></el-input>
          </el-form-item>
          <el-form-item label="地址池IP范围" prop="ipRange">
            <el-input :disabled="!isAddPool" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="poolModel.ipRange"></el-input>
          </el-form-item>
        </el-form>
        <el-form-item label="DNS地址" prop="DNS">
          <el-input v-model="baseModel.DNS"></el-input>
        </el-form-item>
        <el-form-item label="组网模式" prop="netmode">
          <el-select class="w280" v-model="baseModel.netmode">
            <el-option key="client2lan" label="电脑拨入路由器" value="client2lan"></el-option>
            <el-option key="lan2lan" label="路由器对路由器" value="lan2lan"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="对端子网范围" prop="remotesubnet" v-if="baseModel.netmode === 'lan2lan'">
          <el-input placeholder="格式：192.168.110.0/24" v-model="baseModel.remotesubnet"></el-input>
        </el-form-item>
        <el-form-item label="IpSec加密" prop="ipsecenc">
          <el-select class="w280" v-model="baseModel.ipsecenc">
            <el-option label="加密" value="yes">加密</el-option>
            <el-option label="不加密" value="no">不加密</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预共享密钥" prop="Presharekey" v-if="baseModel.ipsecenc === 'yes'">
          <el-input v-model="baseModel.Presharekey"></el-input>
        </el-form-item>
        <el-form-item label="L2TP链路维护时间间隔" prop="l2tphellointerval">
          <el-input placeholder="60~1000" v-model="baseModel.l2tphellointerval"></el-input>
          <span class="web-form--tip">秒</span>
        </el-form-item>
        <el-form-item label="状态" prop="enable">
          <el-switch active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button class="w200" type="primary" v-auth="_onSave">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import {
  ipValidator,
  strictIpValidator,
  intValidator,
  rangeValidator
} from '@/utils/rules'
import InputPassword from '@/common/InputPassword'
import { isIpInNet, ipNetValidate } from '@/utils/commonValidates'
import { quoteValidator } from '@/utils/rules'
import modelFn from '@/model'
import poolMixins from '../poolMixins'
export default {
  name: 'vpn-l2tp-server',
  components: {
    [InputPassword.name]: InputPassword
  },
  mixins: [poolMixins],
  data() {
    const localIpValidate = (r, v, cb) => {
      if (isIpInNet(v, [this.poolModel.ipRange])) {
        //this.ipRangeList)) {
        return cb(new Error('与地址池IP范围冲突'))
      }
      cb()
    }
    const subnetValidate = (r, v, cb) => {
      if (isIpInNet(v, this.networkLan)) {
        return cb(new Error('与LAN口IP网段冲突'))
      }
      cb()
    }
    return {
      isLoading: false,
      editIndex: -1,
      networkLan: [],
      baseModel: modelFn.vpnL2tpSerFn(),
      poolModel: modelFn.vpnPoolFn(),
      baseRules: {
        username: [{ required: true, message: '请输入用户名' }],
        password: [{ required: true, message: '请输入密码' }],
        localip: [
          { required: true, message: '请输本地地址' },
          { validator: ipValidator },
          { validator: localIpValidate }
        ],
        ippool_name: [{ required: true, message: '请选择地址池' }],
        DNS: [
          { required: true, message: '请输入DNS地址' },
          { validator: strictIpValidator }
        ],
        remotesubnet: [
          { required: true, message: '请输入对端子网范围' },
          { validator: ipNetValidate },
          { validator: subnetValidate }
        ],
        l2tphellointerval: [
          { required: true, message: '请输入时间间隔' },
          { validator: intValidator, message: '时间必须为正整数' },
          {
            validator: rangeValidator,
            min: 60,
            max: 1000,
            message: '时间范围：60~1000'
          }
        ]
      }
    }
  },
  watch: {
    'poolModel.ipRange'(v, o) {
      this.$refs.baseForm.validateField('localip')
    }
  },
  async created() {
    this._initPage()
  },
  computed: {
    isPoolMax() {
      return this.poolList.length >= this.MAX_NUM
    },
    isAddPool() {
      return this.baseModel.ippool_name === 'SELF_DEFINED'
    }
  },
  methods: {
    async _initPage() {
      await this.loadIpPool()
      let _res = await this.$api.getL2tpSer()
      this.baseModel = Object.assign({}, this.baseModel, _res)
      this._onChangePool(_res.ippool_name)
      this.loadNetwork()
    },
    async loadNetwork() {
      let _res = await this.$api.getNetwork()
      this.networkLan = _res.lan || []
    },
    // 保存
    _onSave() {
      Promise.all([this._validPoolForm(), this._validBaseForm()])
        .then(async _ => {
          if (this.isAddPool) {
            await this._addPool()
            this.baseModel.ippool_name = this.poolModel.ippool_name
          }
          this.$api.setL2tpSer(this.baseModel).then(_ => {
            this.$message.success('配置成功')
          })
        })
        .catch(e => {
          // this.$message.warning('校验不通过')
        })
    },
    // 地址池表单验证
    _validPoolForm() {
      return new Promise((res, rej) => {
        this.$refs.poolForm.validate(async valid => {
          valid ? res() : rej()
        })
      })
    },
    // 地址池表单验证
    _validBaseForm() {
      return new Promise((res, rej) => {
        this.$refs.baseForm.validate(async valid => {
          valid ? res() : rej()
        })
      })
    },
    async _addPool() {
      let _poolData = { ...this.poolModel }
      let _ipArr = _poolData.ipRange.split(/\s*-\s*/)
      Object.assign(_poolData, {
        first_addr: _ipArr[0],
        end_addr: _ipArr[1]
      })
      delete _poolData.ipRange

      await this.$api.setIpPool(_poolData, true)
      this.poolList.push(_poolData)
    },
    _onChangePool(poolName) {
      let _pool = this.poolList.find(o => o.ippool_name === poolName)
      if (_pool) {
        // this.poolModel.ippool_name = poolName
        this.poolModel.ipRange = `${_pool.first_addr}-${_pool.end_addr}`
      } else {
        this.poolModel.ippool_name = this._generatorPoolName()
        this.poolModel.ipRange = ''
      }
    },
    // _onIpRangeChange() {
    //   this.$refs.baseForm.validateField('localip')
    // },
    // 生成可用的地址池名字
    _generatorPoolName() {
      const _preName = 'vpn_ippool_'
      let _poolNames =
        this.poolList
          .filter(o => o.ippool_name.indexOf(_preName) === 0)
          .map(o => o.ippool_name) || []

      let _num = 1
      let poolName = `${_preName}${_num}`
      while (_poolNames.indexOf(poolName) > -1) {
        poolName = `${_preName}${++_num}`
      }
      return poolName
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

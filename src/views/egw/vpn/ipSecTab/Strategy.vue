<template>
  <div class="vpn-security-strategy">
    <help-alert json-key="vpnSecurityJson" title="IPSec安全策略">
      <div slot="content">
        <p>
          <strong>说明：</strong>子网范围格式：IP地址/掩码位数。一般设置24位掩码数，即255.255.255.0。
        </p>
        <p>
          <strong>举例：</strong>如果设置为 192.168.110.x/24，那么此子网范围是 192.168.110.1-192.168.110.254。
        </p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          策略列表
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="list.length>=TOTAL_NUM||isLoading"
            icon="el-icon-plus"
            size="small"
            type="primary"
            v-auth="{fn:_onEdit,params:-1}"
          >新增</el-button>
        </div>
      </div>
      <div class="box-content">
        <help-alert :show-icon="false" title>
          <div slot="content">
            支持配置
            <b class="c-warning mlr5">1</b>条策略。
            <template v-if="hasByOthers">不可编辑的策略为L2TP生成的策略（不计入支持配置的条数）。</template>
          </div>
        </help-alert>
        <el-table :data="list" ref="baseTable" row-ke="name" size="mini" stripe>
          <el-table-column align="center" label="策略类型" prop="connection_type">
            <template slot-scope="{row}">
              <el-tag color="#409eff1a" v-if="row.connection_type === 'initiator'">客户端</el-tag>
              <el-tag color="#67c23a1a" v-else>服务端</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="策略名称" prop="name"></el-table-column>
          <el-table-column align="center" label="对端网关" min-width="120" prop="remote_gateway"></el-table-column>
          <el-table-column align="center" label="本地子网范围" min-width="135" prop="local_network">
            <template slot-scope="{row}">
              <div :key="ip" v-for="ip in row.local_network">{{ip}}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="对端子网范围" min-width="135" prop="remote_network">
            <template slot-scope="{row}">
              <div :key="ip" v-for="ip in row.remote_network">{{ip}}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="状态" prop="status">
            <template slot-scope="{row, $index}">
              <el-button
                :class="row.status === 'enable' ? 'success' : 'c-warning'"
                :disabled="row.create_by!=='web'"
                @click="toggleStatus(row,$index)"
                type="text"
              >
                {{row.status === 'enable' ? '开启' : '关闭'}}
                <i
                  :class="row.status === 'enable' ? 'el-icon-circle-check' : 'el-icon-remove'"
                ></i>
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="100">
            <template slot-scope="{row, $index}">
              <el-button :disabled="isLoading || row.create_by!=='web'" type="text" v-auth="{fn:_onEdit,params:$index}">修改</el-button>
              <el-button :disabled="isLoading || row.create_by!=='web'" type="text" v-auth="{fn:_onDel,params:row}">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 用户管理编辑modal -->
    <el-dialog :close-on-click-modal="false" :title="modalTitle" :visible.sync="baseModalShow" width="520px">
      <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm">
        <el-form-item label="策略类型" prop="connection_type">
          <el-radio-group v-model="baseModel.connection_type">
            <el-radio label="initiator">客户端</el-radio>
            <el-radio label="responder">服务端</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="策略名称" prop="name">
          <el-input :disabled="editIndex > -1" class="w300" placeholder="1-28个字符" v-model="baseModel.name"></el-input>
        </el-form-item>
        <el-form-item label="对端网关" prop="remote_gateway" v-if="isClient">
          <el-input class="w300" placeholder="域名或IP地址" v-model="baseModel.remote_gateway"></el-input>
          <el-button @click="showOhterGateway=!showOhterGateway" size="medium" type="text" v-show="!showOhterGateway">
            <i :class="showOhterGateway ? 'el-icon-close' : 'el-icon-plus'"></i>
          </el-button>
        </el-form-item>
        <el-form-item prop="remote_gateway1" v-if="isClient && showOhterGateway">
          <el-input class="w300" placeholder="备选网关" v-model="baseModel.remote_gateway1"></el-input>
          <el-button @click="showOhterGateway=false" size="medium" type="text">
            <i class="el-icon-close"></i>
          </el-button>
        </el-form-item>
        <el-form-item label="绑定接口" prop="intf_binding">
          <el-select class="w300" v-model="baseModel.intf_binding">
            <el-option key="AUTO" label="自动" value="AUTO"></el-option>
            <el-option
              :key="`WAN${n-1}`"
              :label="`WAN${n === 1 ? '' : n-1}`"
              :value="`WAN${n === 1 ? '' : n-1}`"
              v-for="n in wanNum"
            ></el-option>
          </el-select>
          <el-tooltip content="多线路情况下，推荐设置为“自动”" effect="light" placement="right">
            <el-button type="text">
              <i class="rjucd-help fs22"></i>
            </el-button>
          </el-tooltip>
        </el-form-item>
        <el-form-item class="is-required" label="本地子网范围" prop="local_network">
          <!-- <el-input
            class="w300"
            v-model="baseModel.local_network"
            placeholder="格式：192.168.110.0/24"
          ></el-input>-->
          <el-form-item
            :class="{mb20:index!==baseModel.local_network.length-1}"
            :key="index"
            :prop="`local_network[${index}]`"
            :rules="ipValidate(item,index, true)"
            v-for="(item,index) in baseModel.local_network"
          >
            <el-input class="w300" placeholder="格式：192.168.110.0/24" v-model="baseModel.local_network[index]"></el-input>
            <!-- <el-button type="text" size="medium" @click="onDelAuthIpList(index, true)" v-if="baseModel.local_network.length > 1">
              <i class="el-icon-close"></i>
            </el-button>
            <el-button type="text" size="medium" @click="onAddAuthIpList(true)" v-if="index === baseModel.local_network.length - 1 && baseModel.local_network.length < 2">
              <i class="el-icon-plus"></i>
            </el-button>-->
          </el-form-item>
        </el-form-item>
        <el-form-item class="is-required" label="对端子网范围" prop="remote_network" v-if="isClient">
          <el-form-item
            :class="{mb20:index!==baseModel.remote_network.length-1}"
            :key="index"
            :prop="`remote_network[${index}]`"
            :rules="ipValidate(item,index)"
            v-for="(item,index) in baseModel.remote_network"
          >
            <el-input class="w300" placeholder="格式：192.168.110.0/24" v-model="baseModel.remote_network[index]"></el-input>
            <el-button @click="onDelAuthIpList(index)" size="medium" type="text" v-if="baseModel.remote_network.length > 1">
              <i class="el-icon-close"></i>
            </el-button>
            <el-button
              @click="onAddAuthIpList(false)"
              size="medium"
              type="text"
              v-if="index === baseModel.remote_network.length - 1 && baseModel.remote_network.length < 2"
            >
              <i class="el-icon-plus"></i>
            </el-button>
          </el-form-item>
        </el-form-item>
        <el-form-item label="预共享密钥" prop="psk">
          <el-input @change="_onChangePsk" class="w300" placeholder="1-128个字符" v-model="baseModel.psk"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch active-value="enable" inactive-value="disable" v-model="baseModel.status"></el-switch>
        </el-form-item>
        <p @click="showPartOneConf=!showPartOneConf" class="tc more-conf">
          <el-button size="mini" type="text">阶段一设置（IKE策略）</el-button>
        </p>
        <div class="mt20" v-show="showPartOneConf">
          <el-form-item
            :key="i"
            :label="`IKE策略${i}`"
            :prop="`ike_proposal_${i}`"
            :rules="getIkeRules()"
            ref="ike_proposal"
            v-for="i in 5"
          >
            <el-select @change="_onIkeChange" class="w300" v-model="baseModel[`ike_proposal_${i}`]">
              <el-option :key="item.val" :label="item.name" :value="item.val" v-for="item in proposal1"></el-option>
              <!-- :disabled="_isDisabled('ike_proposal_', item.val)" -->
            </el-select>
          </el-form-item>
          <el-form-item label="协商模式" prop="exchange_mode">
            <el-radio-group v-model="baseModel.exchange_mode">
              <el-radio label="main">主模式</el-radio>
              <el-radio label="aggressive">野蛮模式</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="本地ID类型" prop="local_id_type">
            <el-radio-group v-model="baseModel.local_id_type">
              <el-radio label="IP_ADDRESS">IP地址</el-radio>
              <el-radio label="NAME">NAME</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="本地ID" prop="local_id_value" v-if="baseModel.local_id_type === 'NAME'">
            <el-input
              :disabled="baseModel.local_id_type === 'IP_ADDRESS'"
              class="w300"
              placeholder="1-28个非空字符"
              v-model="baseModel.local_id_value"
            ></el-input>
          </el-form-item>
          <el-form-item label="对端ID类型" prop="remote_id_type">
            <el-radio-group v-model="baseModel.remote_id_type">
              <el-radio label="IP_ADDRESS">IP地址</el-radio>
              <el-radio label="NAME">NAME</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="对端ID" prop="remote_id_value" v-if="baseModel.remote_id_type === 'NAME'">
            <el-input
              :disabled="baseModel.remote_id_type === 'IP_ADDRESS'"
              class="w300"
              placeholder="1-28个非空字符"
              v-model="baseModel.remote_id_value"
            ></el-input>
          </el-form-item>
          <el-form-item label="生存时间" prop="ikelifetime">
            <el-input class="w300" placeholder="秒(60-604800)" v-model="baseModel.ikelifetime"></el-input>
          </el-form-item>
          <el-form-item label="DPD检测开启" prop="dpd_enable">
            <el-radio-group v-model="baseModel.dpd_enable">
              <el-radio label="enable">启用</el-radio>
              <el-radio label="disable">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="DPD检测周期" prop="dpd_interval">
            <el-input class="w300" placeholder="秒(1-300)" v-model="baseModel.dpd_interval"></el-input>
          </el-form-item>
        </div>
        <p @click="showPartTwoConf=!showPartTwoConf" class="tc more-conf">
          <el-button size="mini" type="text">阶段二设置（建立连接策略）</el-button>
        </p>
        <div class="mt20" v-show="showPartTwoConf">
          <!-- <el-form-item label="封装模式" prop="mode">
            <el-radio-group v-model="baseModel.mode">
              <el-radio label="tunnel">隧道模式</el-radio>
              <el-radio label="transport">传输模式</el-radio>
            </el-radio-group>
          </el-form-item>-->
          <el-form-item
            :key="i"
            :label="`转换集${i}`"
            :prop="`ph2_proposal_${i}`"
            :rules="getPh2Rules()"
            ref="ph2_proposal"
            v-for="i in 2"
          >
            <el-select @change="_onPh2Change" class="w300" v-model="baseModel[`ph2_proposal_${i}`]">
              <el-option :key="item.val" :label="item.name" :value="item.val" v-for="item in proposal2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="完美向前加密" prop="pfs">
            <el-select class="w300" v-model="baseModel.pfs">
              <el-option :key="item.val" :label="item.name" :value="item.val" v-for="item in pfs"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="生存时间" prop="lifetime">
            <el-input class="w300" placeholder="秒(120-604800)" v-model="baseModel.lifetime"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="baseModalShow = false">取 消</el-button>
        <el-button @click="_onModalConfirm" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { Tag } from 'element-ui'
import { quoteValidator, domainValidator, rangeValidator } from '@/utils/rules'
import { isIpInNet, ipNetValidate } from '@/utils/commonValidates'
import modelFn from '@/model'
import formMixins from '@/mixins/formMixins'
export default {
  name: 'vpn-security-strategy',
  mixins: [formMixins],
  data() {
    const _sameNameValidate = (r, v, cb) => {
      if (this.editIndex === -1 && this.nameMap.includes(v))
        return cb(new Error('策略名称已存在'))
      cb()
    }
    return {
      MAX_NUM: 1,
      showOhterGateway: false,
      baseModalShow: false,
      isLoading: false,
      editIndex: -1,
      list: [],
      proposal1: modelFn.proposal1(),
      proposal2: modelFn.proposal2(),
      pfs: [
        { name: 'none', val: 'none' },
        { name: 'd1', val: 'd1' },
        { name: 'd2', val: 'd2' },
        { name: 'd5', val: 'd5' }
      ],
      baseModel: modelFn.vpnSecurityFn(),
      showPartOneConf: false,
      showPartTwoConf: false,
      wanNum: 1,
      commonPsk: '',
      baseRules: {
        name: [
          { required: true, message: '请输入策略名称' },
          { range: true, min: 1, max: 28, message: '名称为1-28个字符' },
          { validator: _sameNameValidate },
          { validator: quoteValidator }
        ],
        remote_gateway: [
          { required: true, message: '请输入网关' },
          { validator: domainValidator, message: '请输入有效的域名或IP地址' }
        ],
        remote_gateway1: [
          { validator: domainValidator, message: '请输入有效的域名IP地址' }
        ],
        psk: [
          { required: true, message: '请输入预共享密钥' },
          { range: true, min: 1, max: 128, message: '1-128个字符' }
        ],
        // ike_proposal_1: [{ required: true, message: '请输入' }],
        local_id_value: [
          { required: true, message: '请输入本地ID' },
          { range: true, min: 1, max: 28, message: '1-28个字符' }
        ],
        remote_id_value: [
          { required: true, message: '请输入对端ID' },
          { range: true, min: 1, max: 28, message: '1-28个字符' }
        ],
        ikelifetime: [
          { required: true, message: '请输入生存时间' },
          {
            validator: rangeValidator,
            min: 60,
            max: 604800
          }
        ],
        dpd_interval: [
          { required: true, message: '请输入DPD检测周期' },
          {
            validator: rangeValidator,
            min: 1,
            max: 300
          }
        ],
        // ph2_proposal_1: [{ required: true, message: '请输入' }],
        lifetime: [
          { required: true, message: '请输入生存时间' },
          {
            validator: rangeValidator,
            min: 120,
            max: 604800
          }
        ]
      }
    }
  },
  computed: {
    hasByOthers() {
      return this.list.some(o => o.create_by !== 'web')
    },
    TOTAL_NUM() {
      return this.MAX_NUM + this.list.filter(o => o.create_by !== 'web').length
    },
    isClient() {
      return this.baseModel.connection_type === 'initiator'
    },
    modalTitle() {
      return this.editIndex !== -1 ? '编辑用户' : '添加用户'
    },
    nameMap() {
      return this.list.map(o => o.name) || []
    },
    coverPsk() {
      return !!this.commonPsk && this.commonPsk !== this.baseModel.psk
    }
  },
  watch: {
    'baseModel.connection_type'(v) {
      if (v === 'initiator') {
        if (this.baseModel.remote_gateway === '0.0.0.0') {
          this.baseModel.remote_gateway = ''
        }
        if (this.baseModel.remote_network[0] === '0.0.0.0/0') {
          this.baseModel.remote_network = ['']
        }
      }
    }
    // 'baseModel.remote_gateway'(v) {
    //   // 增改客户端时，若存在配置过的对端网关，设置已配置过的 预共享密钥
    //   if (this.baseModel.connection_type === 'initiator') {
    //     let _ipsec = this.list.find(o => v === o.remote_gateway)
    //     this.commonPsk = this.baseModel.psk = _ipsec ? _ipsec.psk || '' : ''
    //   }
    // }
  },
  components: {
    [Tag.name]: Tag
  },
  created() {
    this._initPage()
  },
  methods: {
    async _initPage() {
      const _res = await this.$api.getIpSec()
      const _net = await this.$api.getNetwork()
      this.wanNum = +_net.wanNum || 1
      this.list = _res.data || []
    },
    // 添加/编辑
    _onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index

      if (index === -1) {
        // Add
        this.baseModel = modelFn.vpnSecurityFn()
        this.showOhterGateway = false
      } else {
        this.baseModel = Object.assign(
          modelFn.vpnSecurityFn(),
          {
            ...this.list[index]
          },
          {
            remote_network: [...this.list[index].remote_network] // 拷贝数组
          }
        )
        this.showOhterGateway =
          this.baseModel.remote_gateway1 && this.baseModel.remote_gateway1 != ''
      }
      this.showPartOneConf = false
      this.showPartTwoConf = false
      this._clearValidate()
    },
    // 删除
    _onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert('请选择要删除的项目', {
          type: 'warning'
        })
        return
      }
      this.$confirm('是否确认删除?', '提示', {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.$api
          .setIpSec('delete', _items)
          .then(d => {
            _items.forEach(ite => {
              let _index = this.list.findIndex(d => d === ite)
              this.list.splice(_index, 1)
            })
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // 切换状态
    toggleStatus(item, index) {
      item.status = item.status === 'enable' ? 'disable' : 'enable'
      this.editIndex = index
      this._onSubmit(item)
    },
    // confirm确认
    _onModalConfirm() {
      this.$refs.baseForm.validate((valid, errors) => {
        if (valid) {
          this._onSubmit()
        } else {
          let partOneKey = [
            'local_id_value',
            'remote_id_value',
            'ikelifetime',
            'dpd_interval'
          ]
          let partTwoKey = ['lifetime']

          Object.keys(errors).forEach(k => {
            if (partOneKey.includes(k)) {
              this.showPartOneConf = true
            } else if (partTwoKey.includes(k)) {
              this.showPartTwoConf = true
            }
          })
        }
      })
    },
    // 判断是否存在相同对端网关并且共享密钥不同
    _onChangePsk(psk) {
      if (this.coverPsk) {
        this.$confirm(
          `检测到对端网关${this.baseModel.remote_gateway}已配置过预共享密钥，与此密钥不一致，是否覆盖旧的密钥?`,
          '是否覆盖旧密钥',
          {
            type: 'warning'
          }
        ).then(
          _ => {},
          () => {
            this.baseModel.psk = this.commonPsk
          }
        )
      }
    },
    // 提交数据
    _onSubmit(data) {
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _isnew = this.editIndex === -1

      let _data = data
      if (!_data) {
        _data = { ...this.baseModel }

        if (this.coverPsk) {
          // console.log('覆盖相同对端网关的PSK')
        }
        if (!this.isClient) {
          // 服务端
          Object.assign(_data, {
            remote_gateway: '0.0.0.0',
            remote_gateway1: '',
            remote_network: ['0.0.0.0/0']
          })
        } else {
          // 客户端
          if (!this.showOhterGateway) {
            _data.remote_gateway1 = ''
          }
        }
      }

      _data.create_by = 'web' // 标识为web添加，l2tp可能也会自动添加
      this.$api
        .setIpSec(_isnew ? 'add' : 'modify', _data, _isnew)
        .then(_ => {
          if (_isnew) {
            this.list.push(_data)
          } else {
            this.list.splice(this.editIndex, 1, _data)
          }
          this.$message.success('配置成功')
        })
        .finally(() => {
          this.baseModalShow = false
          setTimeout(() => {
            this.isLoading = false
          }, 300)
        })
    },
    // IP范围验证数组
    ipValidate(_, index, isLocal = false) {
      // return judgeIpRangeRules(
      //   this.baseModel.remote_network,
      //   index
      // )
      let _compareArr = isLocal
        ? [...this.baseModel.local_network]
        : [...this.baseModel.remote_network]
      _compareArr.splice(index, 1)
      const subnetValidate = (r, v, cb) => {
        if (isIpInNet(v, _compareArr)) {
          return cb(new Error('子网范围重叠'))
        }
        cb()
      }
      let rules = [
        { required: true, message: '请输入子网范围' },
        { validator: ipNetValidate },
        { validator: subnetValidate }
      ]
      if (!isLocal) {
        const remoteSubValidate = (r, v, cb) => {
          if (isIpInNet(v, [...this.baseModel.local_network])) {
            return cb(new Error('子网范围冲突，本地子网范围包含了此网段'))
          }
          cb()
        }
        rules.push({ validator: remoteSubValidate })
      }
      return rules
    },
    // 添加IP范围
    onAddAuthIpList(isLocal = false) {
      isLocal
        ? this.baseModel.local_network.push('')
        : this.baseModel.remote_network.push('')
    },
    // 删除IP范围
    onDelAuthIpList(index, isLocal = false) {
      isLocal
        ? this.baseModel.local_network.splice(index, 1)
        : this.baseModel.remote_network.splice(index, 1)
    },
    _isDisabled(preKey, curValue) {
      return (
        '12345'
          .split('')
          .findIndex(idx => this.baseModel[`${preKey}${idx}`] === curValue) !==
        -1
      )
    },
    getIkeRules() {
      const _proposalValidate = (r, v, cb) => {
        if (v === '---') return cb()

        const preKey = 'ike_proposal_',
          _repeatArr = '12345'.split('')
        const _same = _repeatArr.filter(
          idx => this.baseModel[`${preKey}${idx}`] === v
        )
        if (_same.length > 1) return cb(new Error('算法不能重复'))

        cb()
      }
      return [{ validator: _proposalValidate }]
    },
    getPh2Rules() {
      const _proposalValidate = (r, v, cb) => {
        if (v === '---') return cb()

        const preKey = 'ph2_proposal_',
          _repeatArr = '12345'.split('')
        const _proposal = _repeatArr
          .map(idx => this.baseModel[`${preKey}${idx}`].split('-')[0])
          .filter(v => !!v)

        if (new Set(_proposal).size > 1) {
          return cb(new Error('ah和esp算法不能混用'))
        }

        const _same = _repeatArr.filter(
          idx => this.baseModel[`${preKey}${idx}`] === v
        )
        if (_same.length > 1) return cb(new Error('算法不能重复'))

        cb()
      }
      return [{ validator: _proposalValidate }]
    },
    _onIkeChange() {
      this.$refs.ike_proposal.forEach($rf => $rf.validate())
    },
    _onPh2Change() {
      this.$refs.ph2_proposal.forEach($rf => $rf.validate())
    }
  }
}
</script>
<style lang="scss" scoped>
.vpn-security-strategy {
  .more-conf {
    position: relative;
    &:before {
      content: '';
      display: block;
      border: 1px #ccc dashed;
      position: absolute;
      width: 100%;
      top: 50%;
      z-index: 0;
    }
    .el-button--text {
      z-index: 1;
      background: #fff;
      position: relative;
      padding: 7px 8px;
    }
  }
}
</style>

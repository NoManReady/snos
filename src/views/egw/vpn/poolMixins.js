import { ipRangeRegxp, ipToLong } from '@/utils/rulesUtils'
import { isIpInNet, isExistIpRange } from '@/utils/commonValidates'
import { quoteValidator } from '@/utils/rules'

export default {
  data() {
    return {
      MAX_NUM: 5,
      poolList: []
    }
  },
  computed: {
    nameMap() {
      let _map = {}
      this.poolList.forEach(p => (_map[p.ippool_name] = true))
      return _map
    },
    ipRangeList() {
      return this.poolList.map(o => o.first_addr + '-' + o.end_addr)
    }
  },
  methods: {
    // 获取地址池
    async loadIpPool() {
      let _res = await this.$api.getIpPool()
      this.poolList = (_res.list || []).map(o => Object.assign(o, { ipRange: `${o.first_addr}-${o.end_addr}` }))
    },
    getPoolRules(isAddPool = false, checkIpRange = true) {
      const _sameNameValidate = (r, v, cb) => {
        if (isAddPool && this.nameMap[v])
          return cb(new Error('地址池名称已存在'))
        cb()
      }
      const isLegalIp = (r, v, cb) => {
        if (!ipRangeRegxp.test(v)) {
          return cb(new Error('范围格式：1.1.1.1-1.1.1.100'))
        } else {
          let _sIp = v.split(/\s*-\s*/)[0]
          let _eIp = v.split(/\s*-\s*/)[1]
          let _ipNum = ipToLong(_eIp) - ipToLong(_sIp)
          if (_ipNum < 0) {
            return cb(new Error('结束地址要大于开始地址'))
          } else if (_ipNum > 1000) {
            return cb(new Error(`包含了 ${_ipNum} 个地址，限制最大 1000 个`))
          }
        }
        if (checkIpRange) {
          if (isExistIpRange(v, this.editIndex, this.ipRangeList)) {
            return cb(new Error('地址范围与已有地址池发生重叠，请重新输入！'))
          }
          let _ipList = this.baseModel.used_ip_list
          if (_ipList && _ipList.length > 0) {
            let _usedIp = _ipList.find(ip => isIpInNet(ip, [this.baseModel.ipRange]))
            if (_usedIp) {
              return cb(new Error(`包含已被服务端使用的地址：${_usedIp}`))
            }
          }
        }
        cb()
      }
      return {
        ippool_name: [
          { required: true, message: '请输入地址池名称' },
          { range: true, min: 1, max: 28, message: '名称为1-28个字符' },
          { validator: _sameNameValidate },
          { validator: quoteValidator }
        ],
        ipRange: [
          { required: true, message: '请输入IP范围' },
          { validator: isLegalIp }
        ]
      }
    }
  }
}
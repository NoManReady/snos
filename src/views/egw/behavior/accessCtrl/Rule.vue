<template>
  <div class="behavior-accessctrl-rule">
    <help-alert :title="title" json-key="accessCtrlJson">
      <div slot="content"></div>
    </help-alert>
    <div class="box-header mt15">
      <span class="box-header-tit">
        访问控制规则列表
        <small></small>
      </span>
      <div class="fr">
        <el-button @click.native="onEdit(-1)" size="small" type="primary">
          <i class="el-icon-plus"></i>
          <span>新增</span>
        </el-button>
        <el-button @click.native="onDel()" size="small" type="primary">
          <i class="el-icon-delete"></i>
          <span>批量删除</span>
        </el-button>
      </div>
    </div>
    <help-alert :show-icon="false" title>
      <div slot="content">
        最大支持配置
        <b class="c-warning mlr5">{{MAX_NUM}}</b>条。
      </div>
    </help-alert>
    <el-table :data="pageList" ref="multipleTable" row-key="ruleName" size="small" stripe>
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <el-table-column align="center" label="MAC地址" min-width="120" prop="mac">
        <template slot-scope="{row}">{{row.mac || '-'}}</template>
      </el-table-column>
      <el-table-column align="center" label="源IP地址:端口" min-width="175" prop="srcIP">
        <template slot-scope="{row}">{{row.by === 'ip' ? `${row.srcIP || '所有IP'}:${row.srcPort || '所有端口'}` : "-" }}</template>
      </el-table-column>
      <el-table-column align="center" label="目的IP地址:端口" min-width="175" prop="destIP">
        <template slot-scope="{row}">{{row.by === 'ip' ? `${row.destIP || '所有IP'}:${row.destPort || '所有端口'}` : "-" }}</template>
      </el-table-column>
      <el-table-column align="center" label="协议类型" prop="proto">
        <template slot-scope="{row}">{{row.by === 'ip' ? (row.proto.toLocaleUpperCase()) : "-" }}</template>
      </el-table-column>
      <el-table-column align="center" label="策略类型" prop="target">
        <template slot-scope="scope">{{scope.row.target === 'ACCEPT' ? '允许' : '阻塞'}}</template>
      </el-table-column>
      <el-table-column align="center" label="生效时间" prop="tmngtName">
        <template slot-scope="scope">
          <span v-if="scope.row.tmngtName !== 'SELF_DEFINED'">{{scope.row.tmngtName}}</span>
          <template v-else>
            <i @click="onOpenTimeSelection(scope.row.time,false)" class="el-icon-date f-theme pointer"></i>
          </template>
        </template>
      </el-table-column>
      <el-table-column align="center" label="生效接口域" prop="dest">
        <template slot-scope="scope">{{scope.row.dest === 'lan' ? '内网' : '外网'}}</template>
      </el-table-column>
      <el-table-column align="center" label="生效状态" prop="tmngtName">
        <template slot-scope="scope">
          <i class="el-icon-loading fs18" v-if="isActive(scope.row) === null"></i>
          <span class="c-success" type="text" v-else-if="isActive(scope.row) === 'ACTIVE'">生效中</span>
          <span class="c-warning" type="text" v-else>
            未生效
            <el-tooltip class="item" effect="dark" placement="top-start">
              <div slot="content">当前时间不在生效时间内</div>
              <span>
                <i class="el-icon-question"></i>
              </span>
            </el-tooltip>
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" min-width="100" prop="ruleName"></el-table-column>
      <el-table-column align="center" label="匹配顺序" v-if="aclList.length > 1" width="100px">
        <template slot-scope="scope">
          <el-button
            @click="onSetAclSort(scope.$index, scope.row.uuid, 'up')"
            title="上移，优先匹配"
            type="text"
            v-if="getRealIndex(scope.$index) > 0"
          >
            <i class="el-icon-sort-up"></i>
          </el-button>
          <el-button
            @click="onSetAclSort(scope.$index, scope.row.uuid, 'down')"
            title="下移"
            type="text"
            v-if="getRealIndex(scope.$index) < aclList.length - 1"
          >
            <i class="el-icon-sort-down"></i>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" min-width="95">
        <template slot-scope="scope">
          <el-button @click="onEdit(scope.$index,scope.row)" type="text">修改</el-button>
          <el-button @click="onDel([scope.row.uuid])" type="text">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page.sync="pageModel.pageIndex"
      :page-size="pageModel.pageSize"
      :page-sizes="pageModel.pageSizes"
      :total="pageTotal"
      @current-change="onCurrentChange"
      @size-change="_onSizeChange"
      background
      class="mt20"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
    <el-dialog :close-on-click-modal="false" :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="550px">
      <el-form :inline="true" :model="modelData" :rules="baseRules" label-width="160px" ref="baseForm">
        <el-form-item label="基于" prop="by">
          <el-radio-group v-model="modelData.by">
            <el-radio label="mac">MAC地址</el-radio>
            <el-radio label="ip">IP地址</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="modelData.by === 'mac'">
          <el-form-item key="mac" label="MAC地址" prop="mac">
            <el-input class="w300" placeholder="选择在线用户MAC" v-model="modelData.mac"></el-input>
          </el-form-item>
        </template>
        <template v-if="modelData.by === 'ip'">
          <el-form-item>
            <el-form-item label="源IP/网段:端口" prop="srcIP">
              <el-input class="w180" placeholder="网段：192.168.1.1/24" v-model="modelData.srcIP"></el-input>
            </el-form-item>
            <span class="mr10">:</span>
            <el-form-item label prop="srcPort">
              <el-input class="w90" placeholder="1~65535" v-model="modelData.srcPort"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item>
            <el-form-item label="目的IP/网段:端口" prop="destIP">
              <el-input class="w180" placeholder="网段：192.168.1.1/24" v-model="modelData.destIP"></el-input>
            </el-form-item>
            <span class="mr10">:</span>
            <el-form-item label prop="destPort">
              <el-input class="w90" placeholder="1~65535" v-model="modelData.destPort"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item label="协议类型" prop="proto">
            <el-select class="w300" placeholder="请选择协议类型" v-model="modelData.proto">
              <el-option label="ALL" value="all"></el-option>
              <el-option label="TCP" value="tcp"></el-option>
              <el-option label="UDP" value="udp"></el-option>
              <el-option label="ICMP" value="icmp"></el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="策略类型" prop="target">
          <el-select class="w300" placeholder="请选择策略类型" v-model="modelData.target">
            <el-option label="允许" value="ACCEPT"></el-option>
            <el-option label="阻塞" value="REJECT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生效时间" prop="tmngtName">
          <el-select class="w300" placeholder="请选择" v-model="modelData.tmngtName">
            <el-option :key="item.tmngtName" :label="item.tmngtName" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
            <el-option label="自定义" value="SELF_DEFINED"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="modelData.tmngtName === 'SELF_DEFINED'">
          <el-form-item class="is-required" label="自定义时间" prop="time">
            <a @click="onOpenTimeSelection(modelData.time,true)" class="f-theme pointer">
              <i class="el-icon-date mr5"></i>选择时间
            </a>
          </el-form-item>
        </template>
        <el-form-item label="生效接口域" prop="dest" v-if="modelData.by === 'ip'">
          <el-select class="w300" placeholder="请选择生效接口域" v-model="modelData.dest">
            <el-option label="内网" value="lan"></el-option>
            <el-option label="外网" value="wan"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="ruleName">
          <el-input class="w300" placeholder="标识规则用途" v-model="modelData.ruleName"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="isModalShow = false">取 消</el-button>
        <el-button @click="onClickFormBtn()" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { macValidator } from '@/utils/rules'
import formMixins from '@/mixins/formMixins'
import timeSelection from '@/utils/timeSelection'
import pageMixins from '@/mixins/pageMixins'
import model from '@/model'
import { isNetSeg, isBetween, isStrictIP } from '@/utils/rulesUtils'
const SELF_DEFINED = 'SELF_DEFINED'
export default {
  name: 'BehaviorAccessctrlRule',
  data() {
    const ipValidate = (r, v, cb) => {
      if (v && v !== '0.0.0.0/0' && !isStrictIP(v) && !isNetSeg(v))
        return cb(new Error('请输入有效的IP或网段'))
      cb()
    }
    const portValidate = (r, v, cb) => {
      if (v && !isBetween(v, 1, 65535))
        return cb(new Error('端口的范围为 1~65535'))
      cb()
    }
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    return {
      MAX_NUM: 50,
      title: '访问控制',
      aclList: [],
      timeGroups: [],
      defaultTimeGroup: '',
      modalTitle: '',
      isAdd: true,
      isModalShow: false,
      modelData: model.behaviorAccessCtrlFn(),
      aclStatus: [],
      baseRules: {
        mac: [
          { required: true, message: '请输入MAC地址' },
          { validator: macValidator, message: '请输入有效的MAC地址' }
        ],
        srcIP: [{ validator: ipValidate }],
        destIP: [{ validator: ipValidate }],
        srcPort: [{ validator: portValidate, message: '范围 1~65535' }],
        destPort: [{ validator: portValidate, message: '范围 1~65535' }],
        time: [{ validator: timeValidator, message: '请选择时间范围' }],
        ruleName: [
          { range: true, min: 1, max: 28, message: '备注为1-28个字符' }
        ]
      }
    }
  },
  mixins: [pageMixins, formMixins],
  watch: {
    'modelData.tmngtName'(v) {
      if (v !== SELF_DEFINED) {
        delete this.modelData.time
      } else if (
        !this.modelData.time ||
        !typeof this.modelData.time === 'object'
      ) {
        this.modelData.time = {}
      }
    }
  },
  created() {
    setTimeout(() => {
      this._loadTimeGroupList()
    }, 1000)
  },
  methods: {
    async _loadList() {
      let _d = await this.$api.getAccessCtrlList()
      this.getAclStatus()
      this.aclList = _d.list || []
      return _d.list || []
    },
    // 加载时间对象列表
    async _loadTimeGroupList() {
      this.timeGroups = await this.$api.getDateManage(true)
      this.defaultTimeGroup = this.timeGroups[0]
        ? this.timeGroups[0].tmngtName
        : ''
    },
    // 打开时间范围控件
    onOpenTimeSelection(selections, enable) {
      timeSelection({
        selections,
        enable
      }).then(d => {
        this.modelData.time = d
        this.$refs.baseForm.validateField('time')
      })
    },
    async getAclStatus() {
      let _res = await this.$api.getAccessCtrlListSta()
      this.aclStatus = _res.list || []
    },
    isActive(row) {
      let effective = null
      this.aclStatus.some(item => {
        if (item.uuid === row.uuid) {
          effective = item.status
        }
      })
      return effective
    },
    onEdit(idx, row = {}) {
      this.isAdd = idx < 0
      if (this.isAdd && this.aclList.length >= this.MAX_NUM) {
        return this.$message.warning(
          `${this.title}最多只能添加 ${this.MAX_NUM} 条规则`
        )
      }
      this.modalTitle = this.isAdd ? '添加访问规则' : '编辑访问规则'
      if (row.time && Object.keys(row.time).length > 0) {
        row.tmngtName = SELF_DEFINED
      }
      this.modelData = Object.assign(
        model.behaviorAccessCtrlFn(this.defaultTimeGroup),
        row
      )
      this.isModalShow = true
    },
    async onDel(uuidArr) {
      if (!uuidArr) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning('请选择要删除的列表项')
        }
        uuidArr = selection.map(item => item.uuid)
      }
      await this.$confirm('是否确认删除？')
      this.$api.setAccessCtrl({ uuid: uuidArr }, 'del', true).then(_ => {
        this._initPage()
        this.$message.success('删除成功')
      })
    },
    onClickFormBtn() {
      this.$refs.baseForm.validate(async ok => {
        if (ok) {
          let _data = this.modelData
          if (
            _data.srcIP === '' &&
            _data.destIP === '' &&
            _data.target === 'REJECT'
          ) {
            await this.$confirm('此配置会禁止所有IP访问外网，是否确认配置？')
          }
          this.onSave(_data)
          this.isModalShow = false
        }
      })
    },
    onSave(rule) {
      let _setData = {
        list: [rule || this.modelData]
      }
      this.$api
        .setAccessCtrl(_setData, this.isAdd ? 'add' : 'update', true)
        .then(d => {
          this._initPage()
          this.$message.success('配置成功')
        })
    },
    onSetAcl(idx, data) {
      if (data) {
        if (idx < 0) {
          this.aclList.unshift(data)
        } else {
          this.aclList.splice(idx, 1, data)
        }
      } else {
        this.aclList.splice(idx, 1)
      }
    },
    onSort(idx, type) {
      let data = this.aclList.splice(idx, 1)[0]
      idx = type == 'up' ? idx - 1 : idx + 1
      this.aclList.splice(idx, 0, data)
    },
    onSetAclSort(idx, name, type) {
      this.$api.setAccessCtrlSort(name, type).then(d => {
        let _realIdx = this.getRealIndex(idx)
        this.onSort(_realIdx, type)
        this.$message.success(type === 'up' ? '上移成功' : '下移成功')
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

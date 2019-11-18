<template>
  <div class="behavior-accessctrl-timelimit">
    <help-alert json-key="timeLimitJson" title="上网时间控制">
      <div slot="content"></div>
    </help-alert>
    <div class="box-header mt15">
      <span class="box-header-tit">
        上网时间控制
        <small></small>
      </span>
      <div class="fr">
        <el-button :disabled="loading" @click.native="_onEdit(-1)" size="small" type="primary">
          <i class="el-icon-plus"></i>
          <span>新增</span>
        </el-button>
        <el-button :disabled="loading" @click.native="_onDel()" size="small" type="primary">
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
    <el-table :data="pageList" ref="multipleTable" row-key="uuid" size="small" stripe>
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <el-table-column align="center" label="MAC地址" prop="mac"></el-table-column>
      <el-table-column align="center" label="用户名称" prop="hostname">
        <span slot-scope="{row}">{{_getHostName(row)}}</span>
      </el-table-column>
      <el-table-column align="center" label="禁止时段" prop="tmngtName">
        <template slot-scope="{row}">
          <span v-if="row.tmngtName !== SELF_DEFINED">{{row.tmngtName}}</span>
          <template v-else>
            <i @click="onOpenTimeSelection(row.time,false)" class="el-icon-date f-theme pointer"></i>
          </template>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="hostname">
        <div slot-scope="{row}">
          <i class="el-icon-loading fs14" v-if="loadingStatus"></i>
          <span class="c-success" v-else-if="row.status==='ACTIVE'">生效中</span>
          <span class="c-info" v-else>未生效</span>
        </div>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100px">
        <template slot-scope="scope">
          <el-button :disabled="loading" @click="_onEdit(scope.$index,scope.row)" type="text">修改</el-button>
          <el-button :disabled="loading" @click="_onDel([scope.row.uuid])" type="text">删除</el-button>
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
    <el-dialog
      :closable="!loading"
      :close-on-click-modal="false"
      :title="modalTitle"
      :visible.sync="isModalShow"
      @open="_clearValidate"
      width="500px"
    >
      <el-form :model="baseModel" :rules="baseRules" label-width="120px" ref="baseForm">
        <el-form-item label="MAC地址" prop="mac">
          <auto-complete
            :data-source="userList"
            class="w280"
            label="hostName"
            placeholder="请选择用户"
            v-model="baseModel.mac"
            value-key="mac"
          >
            <div slot-scope="{item}">
              <span class="strong">{{ item.hostName||'未知' }}</span>
              <span>({{ item.mac||'--' }})</span>
            </div>
          </auto-complete>
        </el-form-item>
        <el-form-item label="禁止时段" prop="tmngtName">
          <el-select class="w280" placeholder="请选择" v-model="baseModel.tmngtName">
            <el-option :key="item.tmngtName" :label="item.tmngtName" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
            <el-option :value="SELF_DEFINED" label="自定义"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="baseModel.tmngtName === SELF_DEFINED">
          <el-form-item class="is-required" label="自定义时间" prop="time">
            <a @click="onOpenTimeSelection(baseModel.time,true)" class="f-theme pointer">
              <i class="el-icon-date mr5"></i>选择时间
            </a>
          </el-form-item>
        </template>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button :disabled="loading" @click="isModalShow = false">取 消</el-button>
        <el-button :loading="loading" @click="_onSubmit" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import AutoComplete from '@/common/AutoComplete'
import formMixins from '@/mixins/formMixins'
import timeSelection from '@/utils/timeSelection'
import pageMixins from '@/mixins/pageMixins'
import { macValidator } from '@/utils/rules'
export default {
  name: 'BehaviorAccessctrlTimeLimit',
  data() {
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    const checkMacUnit = (rule, value, cb) => {
      let _index = this.pageModel.allItem.findIndex(item => {
        return item.mac.toLocaleLowerCase() === value.toLocaleLowerCase()
      })
      let _isExit = false
      if (_index > -1) {
        if (this.editIndex > -1) {
          _isExit = _index !== this.getRealIndex(this.editIndex)
        } else {
          _isExit = true
        }
      }
      if (_isExit) {
        cb(new Error('MAC地址已配置过'))
      }
      cb()
    }
    return {
      MAX_NUM: 50,
      SELF_DEFINED: 'SELF_DEFINED',
      timeGroups: [],
      userList: [],
      defaultTimeGroup: '',
      editIndex: -1,
      isModalShow: false,
      loading: false,
      loadingStatus: true,
      isFirst: true,
      baseModel: {
        mac: '',
        tmngtName: '',
        time: {}
      },
      baseRules: {
        mac: [
          { required: true, message: '请选择用户或输入MAC地址' },
          { validator: macValidator },
          { validator: checkMacUnit }
        ],
        time: [{ validator: timeValidator, message: '请选择时间范围' }]
      }
    }
  },
  mixins: [pageMixins, formMixins],
  components: {
    AutoComplete
  },
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? '添加' : '编辑'
    }
  },
  watch: {
    'baseModel.tmngtName'(v) {
      if (v !== this.SELF_DEFINED) {
        delete this.baseModel.time
      } else if (
        !this.baseModel.time ||
        !typeof this.baseModel.time === 'object'
      ) {
        this.baseModel.time = {}
      }
    }
  },
  async created() {
    this.loading = true
    try {
      await this._loadTimeGroupList()
      await this._loadUserList()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async _loadList() {
      this.loading = true
      try {
        let _d = await this.$api.getTimeLimit()
        this.isFirst && this._loadStatusList()
        return _d.list || []
      } finally {
        this.loading = false
        this.isFirst = false
      }
    },
    async _loadStatusList() {
      try {
        this.loadingStatus = true
        let _result = await this.$api.getTimeLimitStatus()
        let _list = _result.list || []
        _list.forEach(lis => {
          let _index = this.pageModel.allItem.findIndex(
            ite => ite.uuid === lis.uuid
          )
          if (_index > -1) {
            this.pageModel.allItem.splice(_index, 1, {
              ...this.pageModel.allItem[_index],
              status: lis.status
            })
          }
        })
      } finally {
        this.loading = false
        this.loadingStatus = false
      }
    },
    // 加载用户列表
    async _loadUserList() {
      let _result = await this.$api.userList(true)
      this.userList = (_result.list || []).filter(lis => !!lis.mac)
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
        this.baseModel.time = d
        this.$refs.baseForm.validateField('time')
      })
    },
    // 获取用户hostName
    _getHostName(item) {
      let _item = this.userList.find(user => user.mac === item.mac)
      return _item ? _item.hostName : '-'
    },
    // 编辑
    _onEdit(idx, row = {}) {
      this.editIndex = idx
      if (
        this.editIndex === -1 &&
        this.pageModel.allItem.length >= this.MAX_NUM
      ) {
        return this.$message.warning(
          `上网时间控制最多只能添加 ${this.MAX_NUM} 条规则`
        )
      }
      this.baseModel = Object.assign(
        {
          tmngtName: this.defaultTimeGroup,
          mac: ''
        },
        row
      )
      this.isModalShow = true
    },
    // 删除
    async _onDel(uuids) {
      if (!uuids) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning('请选择要删除的列表项')
        }
        uuids = selection.map(item => item.uuid)
      }
      await this.$confirm('是否确认删除？')
      try {
        await this.$api.delTimeLimit(uuids, 'del', true)
        uuids.forEach(uuid => {
          let _index = this.pageList.findIndex(item => item.uuid === uuid)
          this.removeList(_index)
        })
        this.$message.success('删除成功')
      } finally {
      }
    },
    // 确定提交
    _onSubmit() {
      this.$refs.baseForm.validate(async ok => {
        if (ok) {
          this.loading = true
          let _data = { ...this.baseModel }
          let _promise = null
          if (this.editIndex > -1) {
            _promise = this.$api.updateTimeLimit(_data).then(d => {
              this.editList(this.editIndex, _data)
            })
          } else {
            _promise = this.$api.addTimeLimit(_data, true).then(d => {
              this._initPage(false)
            })
          }
          _promise
            .then(d => {
              setTimeout(this._loadStatusList, 1000)
              this.$message('配置成功')
            })
            .finally(() => {
              this.isModalShow = false
              this.loading = false
            })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

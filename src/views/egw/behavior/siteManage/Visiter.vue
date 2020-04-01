<template>
  <div class="component_sitevisiter-tab">
    <help-alert json-key="behaviorSiteVisiterJson" :title="$t('egw.SiteManage.web_filter')"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.SiteManage.web_filter')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="visiterList.length>=maxLimit||isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="onAdd"
          >{{$t('action.add')}}</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDel">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
        <i18n path="egw.limit_num_tip">
            <b class="c-warning mlr5">{{maxLimit}}</b>
        </i18n>
      </div>
      </help-alert>
      <el-table :data="visiterList" ref="baseTable" size="medium" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" :label="$t('egw.ip_group_manager')" prop="ip_group">
          <template slot-scope="{row}">
            <ip-detail :ipGroups="ipGroups" :row="row" v-if="ipGroups.length"></ip-detail>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('egw.rule_type')" prop="action">
          <template slot-scope="scope">
            <span class="c-success" v-if="scope.row.action==='permit'">{{$t('egw.SiteManage.allow_ask')}}</span>
            <span class="c-warning" v-else>{{$t('egw.SiteManage.no_allow_ask')}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('egw.SiteManage.no_allow_url_type')" prop="url_class">
          <template slot-scope="scope">
            <template v-if="Object.keys(siteMap).length">
              <span v-if="scope.row.url_class.length<=1">{{siteMap[scope.row.url_class[0]]}}</span>
              <div v-else v-show="siteMap[scope.row.url_class[0]]">
                <span>{{siteMap[scope.row.url_class[0]]}}...</span>
                <el-popover :title="$t('egw.SiteManage.url_type') + `（${scope.row.url_class.length}）`" placement="right" trigger="click">
                  <div class="max-w300 popover-container">
                    <el-tag :key="url" class="mr10 mb10" type="success" v-for="url of scope.row.url_class">{{siteMap[url]}}</el-tag>
                  </div>
                  <a class="pointer f-theme" href="javascript:;" slot="reference">{{$t('egw.more')}}</a>
                </el-popover>
              </div>
            </template>
            <i class="el-icon-loading fs14 f-theme" v-else></i>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('egw.times_manager')	" prop="tr_group">
          <template slot-scope="{row}">
            <time-detail :row="row" :timeGroups="timeGroups" v-if="timeGroups.length"></time-detail>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('phrase.status')	" prop="enable">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.enable==='1'?$t('egw.close_by_click'):$t('egw.open_by_click')" effect="dark" placement="right">
              <div @click="_toggleEnable(scope.row.enable,scope.$index)" class="vm">
                <span class="c-success pointer" v-if="scope.row.enable==='1'">
                  {{$t('egw.start_using')}}
                  <i class="el-icon-circle-check"></i>
                </span>
                <span class="c-warning pointer" v-else>
                  {{$t('egw.no_start_using')}}
                  <i class="el-icon-circle-close"></i>
                </span>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('phrase.remark')" prop="comment"></el-table-column>
        <el-table-column align="center" :label="$t('action.ope')">
          <template slot-scope="scope">
            <el-button :disabled="isLoading" size="medium" type="text" v-auth="{fn:onEdit,params:scope.$index}">{{$t('action.edit')}}</el-button>
            <el-button :disabled="isLoading" size="medium" type="text" v-auth="{fn:onDel,params:scope.row}">{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑modal -->
      <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="550px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('egw.ip_group_manager')" prop="ip_group">
            <el-select class="w260" :placeholder="$t('action.select')" v-model="baseModel.ip_group">
              <el-option :key="item.ip_group" :label="item.name" :value="item.ip_group" v-for="item in ipGroups"></el-option>
              <el-option :label="$t('egw.custom')" value></el-option>
            </el-select>
          </el-form-item>
          <template v-if="baseModel.ip_group === ''">
            <el-form-item class="is-required" :label="$t('egw.custom')" prop="ip_slots">
              <el-form-item
                :class="{mb20:index!==baseModel.ip_slots.length-1}"
                :key="index"
                :prop="`ip_slots[${index}]`"
                :rules="ipValidate(baseModel.ip_slots,index)"
                v-for="(item,index) in baseModel.ip_slots"
              >
                <el-input class="w260" :placeholder="$t('wan.ip_range_example')" v-model="baseModel.ip_slots[index]"></el-input>
                <el-button @click="onDelIpList(index)" type="text" v-if="baseModel.ip_slots.length > 1">
                  <i class="el-icon-close"></i>
                </el-button>
                <el-button
                  @click="onAddIpList"
                  type="text"
                  v-if="index === baseModel.ip_slots.length - 1 && baseModel.ip_slots.length < 5"
                >
                  <i class="el-icon-plus"></i>
                </el-button>
              </el-form-item>
            </el-form-item>
          </template>
          <el-form-item :label="$t('egw.times_manager')" prop="tr_group">
            <el-select class="w260" :placeholder="$t('action.select')" v-model="baseModel.tr_group">
              <el-option :key="item.tmngtName" :label="item.name" :value="item.tmngtName" v-for="item in timeGroups"></el-option>
              <el-option :label="$t('egw.custom')" value></el-option>
            </el-select>
          </el-form-item>
          <template v-if="baseModel.tr_group === ''">
            <el-form-item class="hide" :label="$t('egw.SiteManage.set_time')" prop="time_mode">
              <el-radio-group v-model="baseModel.time_mode">
                <el-radio label="calendar">{{$t('egw.calendar')}}</el-radio>
                <el-radio label="input">{{$t('egw.SiteManage.set_manual')}}</el-radio>
              </el-radio-group>
            </el-form-item>
            <template v-if="baseModel.time_mode==='calendar'">
              <el-form-item class="is-required" :label="$t('egw.calendar')" prop="tr_slots">
                <span @click="onOpenTimeSelection(baseModel.tr_slots,true)" class="f-theme pointer">
                  <i class="el-icon-date"></i>
                  {{$t('egw.accessCtrl.select_time')}}
                </span>
              </el-form-item>
            </template>
            <template v-else></template>
          </template>
          <el-form-item :label="$t('egw.SiteManage.no_allow_url_type')" prop="url_class">
            <treeselect
              :default-expand-level="1"
              :multiple="true"
              :options="websiteGroups"
              class="w260"
              v-model="baseModel.url_class"
            />
            <!-- <el-select class="w260" v-model="baseModel.url_class" placeholder="请选择" multiple>
              <el-option v-for="item in websiteGroups" :key="item.entry_name" :label="item.alias_name" :value="item.entry_name">
              </el-option>
            </el-select>-->
          </el-form-item>
          <el-form-item class="hide" :label="$t('egw.rule_type')" prop="action">
            <el-radio-group v-model="baseModel.action">
              <el-radio label="permit">{{$t('egw.SiteManage.allow_ask')}}</el-radio>
              <el-radio label="deny">{{$t('egw.SiteManage.no_allow_ask')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('phrase.remark')" prop="comment">
            <el-input class="w260" v-model="baseModel.comment"></el-input>
          </el-form-item>
          <el-form-item :label="$t('phrase.status')" prop="enable">
            <el-switch active-value="1" inactive-value="0" v-model="baseModel.enable"></el-switch>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button @click="onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import IpDetail from '@/common/IpDetail'
import TimeDetail from '@/common/TimeDetail'
import { nameLengthValidator } from '@/utils/rules'
import timeSelection from '@/utils/timeSelection'
import { judgeIpRangeRules } from '@/utils/commonValidates'
import formMixins from '@/mixins/formMixins'
import Treeselect from '@riophae/vue-treeselect'
import model from '@/model'
import { Tag } from 'element-ui'
export default {
  name: 'SiteGroupTab',
  data() {
    const timeValidator = (rule, value, cb) => {
      if (!value || Object.keys(value).length === 0) {
        cb(new Error(rule.message))
      }
      cb()
    }
    return {
      baseModel: model.behaviorSiteVisiterManageFn(),
      baseRules: {
        url_class: [{ required: true, message: this.$t('egw.ApplicationControl.more_then_one_url_manager') }],
        tr_slots: [{ validator: timeValidator, message: this.$t('egw.select_time_range')}],
        comment: [
          {
            validator: nameLengthValidator,
            size: 64,
            message: this.$t('egw.invalid_group_name')
          }
        ]
      },
      maxLimit: 20,
      editIndex: -1,
      isLoading: true,
      baseModalShow: false,
      visiterList: [],
      ipGroups: [],
      defaultIpGroup: '',
      timeGroups: [],
      defaultTimeGroup: '',
      websiteGroups: [],
      siteMap: {},
      indend: 0
    }
  },
  mixins: [formMixins],
  components: {
    IpDetail,
    TimeDetail,
    [Tag.name]: Tag,
    Treeselect
  },
  async created() {
    await this._loadVisiterList()
    await this._loadIpGroupList()
    await this._loadTimeGroupList()
    this._loadWebSiteList()
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1 ? this.$t('egw.SiteManage.web_filter_edit') : this.$t('egw.SiteManage.web_filter_add')
    }
  },
  methods: {
    // 加载网站过滤列表
    async _loadVisiterList() {
      try {
        this.isLoading = true
        let _result = await this.$api.getSiteRuleList()
        this.indend++
        this.visiterList = (_result || []).map(a => {
          return {
            ...a,
            ip_slots: a.ip_slots.length === 0 ? [''] : a.ip_slots,
            tr_slots: a.tr_slots.length === 0 ? {} : a.tr_slots
          }
        })
      } finally {
        this.isLoading = false
      }
    },
    // 加载ip地址列表
    async _loadIpGroupList() {
      this.ipGroups = await this.$api.getAddrManage(true)
      this.defaultIpGroup = this.ipGroups[0] ? this.ipGroups[0].ip_group : ''
    },
    // 获取ipGroup名称
    _getIpgroupName(group) {
      let _ip = this.ipGroups.find(ip => ip.ip_group === group)
      return _ip ? _ip.name : group || '--'
    },
    // 加载时间对象列表
    async _loadTimeGroupList() {
      this.timeGroups = await this.$api.getDateManage(true)
      this.indend++
      this.defaultTimeGroup = this.timeGroups[0]
        ? this.timeGroups[0].tmngtName
        : ''
    },
    // 加载网站分组列表
    async _loadWebSiteList() {
      let _siteGroupList = await this.$api.getSiteGroupList(true)
      this.indend++
      let _siteMap = {}
      _siteGroupList.forEach(site => {
        _siteMap[site.entry_name] = site.alias_name
      })
      this.websiteGroups = [
        {
          id: 'all',
          children: _siteGroupList.map(site => {
            return {
              id: site.entry_name,
              label: site.alias_name
            }
          }),
          label: this.$t('egw.all')
        }
      ]
      this.siteMap = _siteMap
    },
    // 获取timeGroup名称
    _getTimegroupName(group) {
      let _time = this.timeGroups.find(time => time.tmngtName === group)
      return _time ? _time.tmngtName : group || '--'
    },
    // IP范围验证数组
    ipValidate(list, index) {
      return judgeIpRangeRules(list, index)
    },
    // 打开时间范围控件
    onOpenTimeSelection(selections, enable) {
      timeSelection({
        selections,
        enable
      }).then(d => {
        this.baseModel.tr_slots = d
        this.$refs.baseForm.validateField('tr_slots')
      })
    },
    // 添加IP范围
    onAddIpList() {
      this.baseModel.ip_slots.push('')
    },
    // 删除IP范围
    onDelhIpList(index) {
      this.baseModel.ip_slots.splice(index, 1)
    },
    // 新网站过滤
    onAdd() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = model.behaviorSiteVisiterManageFn(
        this.defaultIpGroup,
        this.defaultTimeGroup
      )
      this._clearValidate()
    },
    // 编网站过滤
    onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index
      this.baseModel = {
        ...model.behaviorSiteVisiterManageFn(
          this.defaultIpGroup,
          this.defaultTimeGroup
        ),
        ...this.visiterList[index]
      }
      this._clearValidate()
    },
    //删网站过滤
    onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        return this.$message.warning(this.$t('tip.select_del_item'))
      }
      this.$confirm(this.$t('tip.confirm_delete')).then(() => {
        this.isLoading = true
        this.$api
          .delSiteRule({ names: _items.map(ite => ite.policy) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.visiterList.findIndex(d => d === ite)
              this.visiterList.splice(_index, 1)
            })
            this.$message({
              message:this.$t('tip.del_success'),
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // 切换策略状态
    _toggleEnable(enable, index) {
      this.editIndex = index
      this.baseModel = {
        ...model.behaviorSiteVisiterManageFn(),
        ...this.visiterList[index],
        enable: enable === '1' ? '0' : '1'
      }
      this._onSubmit()
    },
    // 编网站过滤确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    // 提交数据
    _onSubmit() {
      let _isAll = this.baseModel.url_class.includes('all')
      let url_class = this.baseModel.url_class
      if (_isAll) {
        url_class = this.websiteGroups[0].children.map(site => site.id)
      }
      if (
        JSON.stringify({ ...this.baseModel, url_class }) ===
        JSON.stringify(this.visiterList[this.editIndex])
      ) {
        this.baseModalShow = false
        return
      }
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _isnew = this.editIndex === -1
      this.$api
        .setSiteRule({ ...this.baseModel, url_class }, _isnew)
        .then(d => {
          if (_isnew) {
            this.visiterList.push({
              ...this.baseModel,
              url_class,
              policy: d.policy
            })
          } else {
            this.visiterList.splice(this.editIndex, 1, {
              ...this.baseModel,
              url_class
            })
          }
          this.$message({
            message: this.$t('tip.edit1_success'),
            type: 'success'
          })
        })
        .finally(() => {
          this.baseModalShow = false
          setTimeout(() => {
            this.isLoading = false
          }, 300)
        })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

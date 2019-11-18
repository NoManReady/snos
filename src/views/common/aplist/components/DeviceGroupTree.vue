<template>
  <div class="ap-group-tree">
    <el-popover placement="right" ref="editPopover" trigger="click" v-model="showPopover" width="250">
      <el-form :model="nodeData" :rules="baseRules" @submit.native.prevent label-width="80px" ref="baseForm">
        <el-form-item label="分组名称" prop="groupName" size="mini">
          <el-input @keydown.enter.native="onConfirm" v-model="nodeData.groupName"></el-input>
        </el-form-item>
        <div style="margin:30px 0 0 80px">
          <el-button :disabled="isAdding" @click="onConfirm" size="mini" type="primary">确定</el-button>
          <el-button @click="showPopover=false" size="mini">取消</el-button>
        </div>
      </el-form>
    </el-popover>
    <el-input class="mb10" placeholder="搜索分组" size="mini" v-model="filterText"></el-input>
    <el-tree
      :data="groupTreeData"
      :expand-on-click-node="false"
      :filter-node-method="onFilterNode"
      :indent="0"
      :render-content="getGroupTree"
      class="tree-over-scroll"
      default-expand-all
      empty-text="暂无分组"
      node-key="groupId"
      ref="apGroupTree"
      v-popover:editPopover
    ></el-tree>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import formMixins from '@/mixins/formMixins'
import { deepClone } from '@/utils/utils'
import { isAuth } from '@/directives/auth'
import { Tree } from 'element-ui'
export default {
  name: 'ApGroupTree',
  data() {
    const isExistsGroup = (r, v, cb) => {
      if (v != this.curGroup[r.field] && this.getGroupIdx(v, r.field) > -1)
        return cb(new Error())
      return cb()
    }
    return {
      MAX_NUM: 8,
      isAdding: false,
      groupTreeData: [
        {
          groupName: '所有分组',
          groupId: '',
          children: []
        }
      ],
      originData: {},
      nodeData: {},
      curGroup: { groupId: '' },
      filterText: '',
      showPopover: false,
      baseRules: {
        groupName: [
          { required: true, message: '请输入分组名称' },
          {
            validator: nameLengthValidator,
            size: 31,
            message: '分组名称不能超过31个字符(单个中文占3个字符)'
          },
          { validator: isExistsGroup, message: '分组名称已存在' }
        ]
      }
    }
  },
  components: {
    'el-tree': Tree
  },
  mixins: [formMixins],
  async created() {
    await this.init()
  },
  watch: {
    filterText(val) {
      this.$refs.apGroupTree.filter(val)
    },
    groupTreeData: {
      handler(val) {
        this.$emit('getGroupTree', this.originData)
      },
      deep: true
    }
  },
  methods: {
    async init() {
      let groupsData = await this.$api.getNetworkGroup()
      if (!groupsData || !Array.isArray(groupsData.groupInfo)) {
        groupsData = {
          groupInfo: [
            {
              groupId: '0',
              groupName: 'default',
              isDefault: 'true',
              deviceList: []
            }
          ]
        }
      }
      // 把默认组放在第一个位置
      if (groupsData.groupInfo[0].isDefault !== 'true') {
        let _defGroupIdx = groupsData.groupInfo.findIndex(group => {
          return group.isDefault === 'true'
        })
        let _defGroups = groupsData.groupInfo.splice(_defGroupIdx, 1)
        groupsData.groupInfo.splice(0, 0, _defGroups[0])
      }
      this.originData = groupsData
      this.groupTreeData[0].children = deepClone(this.originData.groupInfo)
    },
    onFilterNode(value, data, node) {
      if (!value || node.level === 1) return true
      return data.groupName.indexOf(value) !== -1
    },
    onClickDelete(data) {
      this.$confirm('该分组下的设备将会迁移至默认分组，是否确认删除？')
        .then(async () => {
          await this.setGroupTree(this.getGroupIdx(data.groupId))
          this.$emit('delete', data)
        })
        .catch(() => {})
    },
    getNewGroupId() {
      let groupId = 0
      for (var i = 0; i < this.MAX_NUM + 1; i++) {
        if (this.getGroupIdx(String(i)) > -1) {
          groupId++
        } else {
          return groupId
        }
      }
    },
    onClickEdit(data) {
      let isEdit = data && data.groupName
      if (!isEdit && this.groupTreeData[0].children.length >= this.MAX_NUM) {
        return this.$message.warning(`最多支持添加 ${this.MAX_NUM} 个分组`)
      }
      let groupId = this.getNewGroupId()
      this.curGroup = data
      this.nodeData = Object.assign(
        {
          groupName: '',
          groupId: String(groupId),
          isDefault: 'false'
        },
        data
      )
      this._clearValidate()
      this.showPopover = true
    },
    onConfirm() {
      this.isAdding = true
      this.$refs.baseForm.validate(async ok => {
        if (ok) {
          let idx = this.getGroupIdx(this.nodeData.groupId)
          await this.setGroupTree(idx, this.nodeData)
          this.$emit('edit', this.nodeData)
        }
        this.isAdding = false
      })
    },
    setGroupTree(idx, data) {
      return new Promise((res, rej) => {
        let info = this.originData.groupInfo
        if (data) {
          if (idx < 0) idx = info.length + 1
          info.splice(idx, 1, data)
        } else {
          info.splice(idx, 1)
        }

        if (this.originData.networkId === '0') {
          this.$api
            .setQuickStatus({
              groupInfo: info
            })
            .then(d => {
              this.originData = Object.assign(this.originData, d.networkGroup)
              this.groupTreeData[0].children = deepClone(
                this.originData.groupInfo
              )
              this.showPopover = false
              res()
            })
        } else {
          this.$api.setNetworkGroup(this.originData, true).then(d => {
            this.groupTreeData[0].children = deepClone(
              this.originData.groupInfo
            )
            this.showPopover = false
            res()
          })
        }
      })
    },
    getGroupIdx(param, type) {
      return this.groupTreeData[0].children.findIndex(
        item => param === item[type || 'groupId']
      )
    },
    onClickItem(data) {
      this.$emit('choose', data)
    },
    _onClickItem(data, isFirst, e) {
      // if (isFirst) {
      //   return
      // }
      this.curGroup = data
      e.stopPropagation()
      this.onClickItem(data || {})
    },
    _onEdit(data, disabled, e) {
      this.showPopover = false
      e.stopPropagation()
      if (!disabled) {
        isAuth().then(() => {
          this.onClickEdit(data)
        })
      }
    },
    _onDel(data, disabled, e) {
      this.showPopover = false
      e.stopPropagation()
      if (!disabled) {
        isAuth().then(() => {
          this.onClickDelete(data)
        })
      }
    },
    getGroupTree(h, { data, node, store }) {
      let isDefault = data.isDefault == 'true'
      let isFirstLevel = node.level === 1
      let _class =
        data.groupId === this.curGroup.groupId
          ? 'tree-item-left tree-item-selected'
          : 'tree-item-left'
      return (
        <div class="group-tree" style="width: calc(100% - 24px)">
          <div onClick={this._onClickItem.bind(this, data, isFirstLevel)}>
            <el-tooltip
              effect="dark"
              content={isDefault ? '默认组' : data.groupName}
              placement="right">
              <div class={_class} title={data.groupName}>
                {isFirstLevel ? (
                  <i class="eweb-favorites" style="padding-right:5px" />
                ) : (
                  ''
                )}
                {isDefault ? '默认组' : data.groupName}
              </div>
            </el-tooltip>
            <div class="tree-item-right">
              <el-button
                type="primary"
                class={isDefault ? 'is-disabled' : ''}
                size="mini"
                onClick={this._onEdit.bind(
                  this,
                  isFirstLevel ? {} : data,
                  isDefault
                )}>
                {isFirstLevel ? (
                  <i class="el-icon-plus" />
                ) : (
                  <i class="el-icon-edit" />
                )}
              </el-button>
              {!isFirstLevel ? (
                <el-button
                  type="primary"
                  class={isDefault ? 'is-disabled' : ''}
                  size="mini"
                  onClick={this._onDel.bind(this, data, isDefault)}>
                  <i class="el-icon-delete" />
                </el-button>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      )
    }
  }
}
</script>
<style lang="scss">
.ap-group-tree {
  overflow: hidden;
  .tree-item-selected {
    background-color: #f1f1f2;
  }
  .tree-item-left {
    display: inline-block;
    width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tree-item-right {
    display: inline-block;
    text-align: right;
    width: 40%;
    overflow: hidden;
  }
  .el-button--mini {
    padding: 2px 5px;
    font-size: 12px;
    border-radius: 3px;
  }
  .tree-over-scroll {
    max-height: 400px;
    overflow: scroll;
    margin-right: 5px;
  }
}
</style>

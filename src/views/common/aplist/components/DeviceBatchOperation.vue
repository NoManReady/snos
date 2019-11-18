<template>
  <div class="device-batch-operatation" style="display:inline-block">
    <el-dropdown trigger="click">
      <el-button :disabled="isApEmpty" class="el-dropdown-link fs12" plain size="small" type="primary">
        批量操作
        <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu class="fs12" slot="dropdown">
        <el-dropdown-item v-auth="onUpdate">升级设备</el-dropdown-item>
        <el-dropdown-item v-auth="onDelete">删除设备</el-dropdown-item>
        <el-dropdown-item v-auth="onTransfer">迁移分组</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog :visible.sync="isModalShow" @open="select.selecedGroup=''" title="迁移设备分组" width="500px">
      <el-form :model="select" :rules="baseRules" label-width="68px" ref="form">
        <el-form-item label="选择分组" prop="selecedGroup">
          <el-select no-data-text="暂无其他分组" placeholder="请选择" v-model="select.selecedGroup">
            <el-option
              :key="item.groupId"
              :label="item.isDefault === 'true' ? '默认组' : item.groupName"
              :value="item.groupId"
              v-for="item in tree.groupInfo"
            ></el-option>
          </el-select>
        </el-form-item>
        <div class="tc">
          <el-button @click="onGroupTransfer()" plain type="primary">确定</el-button>
          <el-button @click="isModalShow=false">取消</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { Dropdown, DropdownMenu, DropdownItem } from 'element-ui'
export default {
  props: {
    isApEmpty: true,
    // 获取父组件列表数据
    faterRefs: {
      type: Object,
      default: {}
    },
    // 获取分组数组
    tree: {
      default: {},
      type: Object
    }
  },
  name: 'DeviceBatchOperation',
  data() {
    const isGroupUnSelected = (r, v, cb) => {
      if (!v) return cb(new Error())
      return cb()
    }
    return {
      isModalShow: false,
      select: {
        selecedGroup: ''
      },
      selectionForTransfer: [],
      baseRules: {
        selecedGroup: [{ validator: isGroupUnSelected, message: '未选中分组' }]
      }
    }
  },
  components: {
    [Dropdown.name]: Dropdown,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem
  },
  methods: {
    onUpdate() {
      let selection = this.faterRefs.multipleTable.selection
      if (!selection.length) {
        return this.$message.warning('请选择要升级的设备')
      }

      let msgList = []
      selection.forEach(item => {
        if (item.hasNewVersion && item.status === 'ON') {
          msgList.push(this.getMsgList(item))
        }
      })
      if (msgList.length == 0)
        return this.$alert('当前选中的设备已是最新版本或是离线状态，不可升级。')
      this.$confirm(
        `<div>当前选中 <span class="f-theme">${
          selection.length
        }</span> 台设备，其中已是最新版本和处于离线状态的设备有<span class="f-theme">${selection.length -
          msgList.length} </span>台，将不执行升级，是否确认升级 <span class="f-red">${
          msgList.length
        }</span> 台设备？</div>`,
        '',
        {
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        this.$emit('update', {
          msgList: msgList,
          totalCount: msgList.length
        })
      })
    },
    onDelete() {
      let selection = this.faterRefs.multipleTable.selection
      if (!selection.length) {
        return this.$message.warning('请选择要删除的设备')
      }

      let data = { snList: [] }
      let deleteSelection = []
      selection.forEach(item => {
        if (item.status != 'ON') {
          data.snList.push(item.serialNumber)
          deleteSelection.push(item)
        }
      })
      if (!data.snList.length)
        return this.$alert('当前选中的设备均为在线设备，不可删除')
      this.$confirm(
        `<div>当前选中 <span class="f-theme">${
          selection.length
        }</span> 台设备，其中 <span class="f-theme">${selection.length -
          data.snList
            .length} </span>台是在线设备不会删除，将删除 <span class="f-red">${
          data.snList.length
        }</span> 台非在线设备，是否确认删除？</div>`,
        '',
        {
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        // 删除设备
        this.$api.deleteDevice(data).then(() => {
          this.$emit('delete', data)
        })
        // 手动从分组数据中删除选中的设备
        this.clearGroupDev(deleteSelection)
        this.$api.setNetworkGroup(this.tree, true).then(d => {})
      })
    },
    onTransfer() {
      this.selectionForTransfer = []
      let selection = this.faterRefs.multipleTable.selection
      if (!selection.length) {
        return this.$message.warning('请选择要迁移的设备')
      }

      this.selectionForTransfer = selection
      this.isModalShow = true
    },
    onGroupTransfer() {
      this.$refs.form.validate(ok => {
        if (ok) {
          this.isModalShow = false
          let idx = this.getGroupTreeIdx(this.select.selecedGroup)

          this.clearGroupDev(this.selectionForTransfer)
          if (!this.tree.groupInfo[idx].deviceList)
            this.tree.groupInfo[idx].deviceList = []

          let data = this.selectionForTransfer.map(d => {
            return {
              devSN: d.serialNumber,
              devName: d.hostName
            }
          })
          this.tree.groupInfo[idx].deviceList = [
            ...this.tree.groupInfo[idx].deviceList,
            ...data
          ]
          this.$api.setNetworkGroup(this.tree, true).then(d => {
            this.$emit('transfer', null)
          })
        }
      })
    },
    clearGroupDev(data) {
      // 删除和迁移操作时，先将分组信息deviceList里面的设备删除
      let map = {}
      data.forEach(d => {
        map[d.serialNumber] = true
      })
      this.tree.groupInfo.forEach(v => {
        if (v.deviceList && Array.isArray(v.deviceList)) {
          v.deviceList = v.deviceList.filter(d => !map[d.devSN])
        }
      })
    },
    getGroupTreeIdx(id) {
      return this.tree.groupInfo.findIndex(d => d.groupId === id)
    },
    getMsgList(msgListData) {
      return {
        deviceSn: msgListData.serialNumber,
        devType: msgListData.deviceType,
        devHversion: msgListData.hardware,
        devSversion: msgListData.software,
        downloadUrlTar: msgListData.downloadUrlTar,
        fileSize: msgListData.fileSize,
        fileName: msgListData.fileName,
        md5: msgListData.md5
      }
    }
  }
}
</script>
<style lang="scss">
.device-batch-operatation {
  .el-select {
    width: 100%;
  }
}
</style>

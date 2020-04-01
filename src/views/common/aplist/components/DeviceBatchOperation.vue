{{ $t("devlist.patch_ope")
}}<template>
  <div class="device-batch-operatation" style="display:inline-block">
    <el-dropdown trigger="click">
      <el-button :disabled="isApEmpty" class="el-dropdown-link" plain size="medium" type="primary">
        {{ $t("devlist.patch_ope") }}
        <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu class="w120" slot="dropdown">
        <el-dropdown-item v-auth="onUpdate">{{ $t("devlist.dev_upgrade") }}</el-dropdown-item>
        <el-dropdown-item v-auth="onDelete">{{ $t("devlist.dev_delete") }}</el-dropdown-item>
        <el-dropdown-item v-auth="onTransfer" v-if="!$roles().includes('ehr')">{{ $t("devlist.group_move") }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog :title="$t('devlist.dev_group_move')" :visible.sync="isModalShow" @open="select.selecedGroup = ''" width="450px">
      <el-form :model="select" :rules="baseRules" label-width="120px" ref="form" size="medium">
        <el-form-item :label="$t('devlist.select_group')" prop="selecedGroup">
          <el-select
            :no-data-text="$t('devlist.no_other_group')"
            :placeholder="$t('action.select')"
            class="w260"
            v-model="select.selecedGroup"
          >
            <el-option
              :key="item.groupId"
              :label="item.isDefault === 'true' ? $t('devlist.def_group') : item.groupName"
              :value="item.groupId"
              v-for="item in tree.groupInfo"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="onGroupTransfer()" size="medium" type="primary">{{ $t("action.confirm") }}</el-button>
        <el-button @click="isModalShow = false" size="medium">{{ $t("action.cancel") }}</el-button>
      </span>
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
        selecedGroup: [
          {
            validator: isGroupUnSelected,
            message: I18N.t('devlist.group_no_empty')
          }
        ]
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
        return this.$message.warning(I18N.t('devlist.dev_upgrade_no_empty'))
      }

      let msgList = []
      selection.forEach(item => {
        if (item.hasNewVersion && item.status === 'ON') {
          msgList.push(this.getMsgList(item))
        }
      })
      if (msgList.length == 0) return this.$alert(I18N.t('devlist.upgrade_tip'))
      this.$confirm(
        I18N.t('devlist.upgrade_confirm_tip', {
          cnt: selection.length,
          off_cnt: selection.length - msgList.length,
          on_cnt: msgList.length
        }),
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
        return this.$message.warning(I18N.t('devlist.delete_dev_item'))
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
        return this.$alert(I18N.t('devlist.online_dev_tip'))
      this.$confirm(
        I18N.t('devlist.delete_confirm_tip', {
          cnt: selection.length,
          off_cnt: data.snList.length,
          on_cnt: selection.length - data.snList.length
        }),
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
        return this.$message.warning(I18N.t('devlist.move_dev_item'))
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

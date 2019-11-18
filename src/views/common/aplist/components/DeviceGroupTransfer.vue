<template>
  <div class="ap-list-popover" style="display:inline-block">
    <el-popover ref="searchPopover" v-model="showPopover" placement="left-start" width="200" trigger="click" @show="select.selecedGroup=''">
      <el-form ref="form" label-width="68px" :model="select" :rules="baseRules">
        <div class="tc mb20">迁移设备分组</div>
        <el-form-item label="所属分组" size="small">
          <span>{{ row.groupName }}</span>
        </el-form-item>
        <el-form-item label="选择分组" size="small" prop="selecedGroup">
          <el-select v-model="select.selecedGroup" placeholder="请选择" no-data-text="暂无其他分组">
            <el-option
              v-for="item in tree.groupInfo"
              v-if="item.groupName != row.groupName"
              :key="item.groupId"
              :label="item.groupName"
              :value="item.groupId">
            </el-option>
          </el-select>
        </el-form-item>
        <div class="tc mt30">
          <el-button size="mini" type="primary" @click="onGroupTransfer()">确定</el-button>
          <el-button size="mini" @click="showPopover=false">取消</el-button>
        </div>
      </el-form>
    </el-popover>
    <el-button type="primary" size="small" v-popover:searchPopover>
      <span>迁移</span>
    </el-button>
  </div>
</template>
<script>
export default {
  props: {
    tree: {
      default: {},
      type: Object
    },
    row: {
      default: {},
      type: Object
    }
  },
  name:"ApGroupTransfer",
  data() {
    const isGroupUnSelected = (r,v,cb) => {
      if (!v) return cb(new Error())
      return cb()
    }
    return {
      showPopover: false,
      select:{
        selecedGroup:""
      },
      baseRules:{
        selecedGroup: [
          { validator: isGroupUnSelected, message: '未选中分组'}
        ]
      }
    }
  },
  methods: {
    onGroupTransfer(){
      this.$refs.form.validate(ok=>{
        if (ok) {
          this.showPopover = false
          let idx = this.getGroupTreeIdx(this.select.selecedGroup)

          this.clearCurDevGroup()
          if ( !this.tree.groupInfo[idx].deviceList )  this.tree.groupInfo[idx].deviceList = []
          this.tree.groupInfo[idx].deviceList.push({
            devSN:this.row.serialNumber,
            devName:this.row.hostName
          })

          this.$api.setNetworkGroup(this.tree,true).then(d => {
            this.$emit("transfer",null)
          })
        }
      })
    },
    getGroupTreeIdx(id){
      return this.tree.groupInfo.findIndex( d => d.groupId === id )
    },
    clearCurDevGroup(){
      this.tree.groupInfo.forEach( v => {
        if ( v.deviceList && Array.isArray(v.deviceList)) {
          v.deviceList = v.deviceList.filter( d => d.devSN != this.row.serialNumber )
        }
      })
    }
  }
}

</script>
<style lang="scss">
</style>

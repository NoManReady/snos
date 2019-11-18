<template>
  <div class="switch-vmode">
    <!-- vlan模式改变 -->
    <el-popover placement="top" ref="vmodePopover" trigger="click" v-model="vmodePopover" width="240">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        <span v-show="vmode==='1'">设备将切换成透传（傻瓜）模式，端口相关的VLAN配置将被清除，MAC表被清除，其他配置不变。</span>
        <span v-show="vmode==='0'">本机所有端口都将切换成ACCESS口，MAC表被清除，其他配置不变。</span>
      </p>
      <div class="tr">
        <el-button @click.native="vmodePopover = false" class="c-info" size="mini" type="text">取消</el-button>
        <el-button @click.native="_handleVlanMode" size="mini" type="text">确定</el-button>
      </div>
    </el-popover>
    <el-switch :value="vmode" active-value="1" class="fr" inactive-value="0" v-popover:vmodePopover v-show="vmode&&vmode!=='-1'"></el-switch>
    <div class="fr" v-show="vmode===''">
      <i class="el-icon-loading fs14" v-if="vmode!=='-1'"></i>
      <el-button @click.native="fetchVMode" class="c-danger" size="mini" type="text" v-else>重新加载</el-button>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'switch-vmode',
  data() {
    return {
      vmodePopover: false
    }
  },
  computed: {
    ...mapGetters('switch', ['vmode'])
  },
  methods: {
    ...mapActions('switch', ['patchVMode', 'fetchVMode']),
    // vmode模式切换
    async _handleVlanMode() {
      this.vmodePopover = false
      await this.patchVMode(this.vmode === '0' ? '1' : '0')
      this.$message({
        type: 'success',
        message: 'VLAN模式切换成功'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

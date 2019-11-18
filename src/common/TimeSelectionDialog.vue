<template>
  <el-dialog class="hide-dialog-header small-dialog" :visible.sync="visible" center width="550px">
    <time-selection ref="timeSelectionRef" v-bind="$data" />
    <span slot="footer" class="dialog-footer">
      <template v-if="enable">
        <el-button @click="onModalCancel">取 消</el-button>
        <el-button type="primary" @click="onModalClear">清 除</el-button>
        <el-button type="primary" @click="onModalConfirm">确 定</el-button>
      </template>
      <template v-else>
        <el-button type="primary" @click="visible=false">关 闭</el-button>
      </template>
    </span>
  </el-dialog>
</template>
<script>
import TimeSelection from './TimeSelection'
import bus from '@/utils/bus'
export default {
  name: 'CommonTimeSelectionDialog',
  data() {
    return {
      visible: false,
      enable: true,
      selections: [],
      showHeader: false,
      showFooter: false
    }
  },
  mounted() {
    if (!this.enable && this.selections.length === 0) {
      this.$nextTick().then(() => {
        this.$refs.timeSelectionRef.setAllSelected()
      })
    }
  },
  // watch: {
  //   visible(v) {
  //     if (v && !this.enable && this.selections.length === 0) {
  //       this.$nextTick().then(() => {
  //         this.$refs.timeSelectionRef.setAllSelected()
  //       })
  //     }
  //   }
  // },
  components: {
    TimeSelection
  },
  methods: {
    onModalCancel() {
      this.visible = false
      bus.$emit('time-selection-dialog-cancel', {
        from: 'CommonTimeSelectionDialog',
        params: false
      })
    },
    onModalConfirm() {
      this.visible = false
      let _selectedData = this.$refs.timeSelectionRef.getMergeSelected()
      bus.$emit('time-selection-dialog-confirm', {
        from: 'CommonTimeSelectionDialog',
        params: _selectedData
      })
    },
    onModalClear() {
      this.selections = Array.isArray(this.selections) ? [] : {}
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
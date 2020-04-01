<template>
  <el-dialog :visible.sync="visible" center class="hide-dialog-header small-dialog" width="550px">
    <time-selection ref="timeSelectionRef" v-bind="$data" />
    <span class="dialog-footer" slot="footer">
      <template v-if="enable">
        <el-button @click="onModalCancel" size="medium">
          {{
          $t("action.cancel")
          }}
        </el-button>
        <el-button @click="onModalClear" size="medium" type="primary">
          {{
          $t("action.clear")
          }}
        </el-button>
        <el-button @click="onModalConfirm" size="medium" type="primary">
          {{
          $t("action.confirm")
          }}
        </el-button>
      </template>
      <template v-else>
        <el-button @click="visible = false" type="primary">
          {{
          $t("phrase.close_btn")
          }}
        </el-button>
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

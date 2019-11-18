<template>
  <div class="session-tab">
    <help-alert json-key="sessionJson" title="WEB会话超时时间"></help-alert>
    <el-form :model="baseModel" :rules="baseRules" size="small" class="plr20 web-form w500" label-width="120px" ref="baseForm">
      <el-form-item label="登录超时时间" prop="sessiontime">
        <el-input type="text" v-model="baseModel.sessiontime"></el-input>
        <span class="web-form--tip">（秒）</span>
      </el-form-item>
      <el-form-item>
        <el-button :loading="isLoading" @click.native="onSubmit" class="w100" size="small" type="primary">修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { intValidator } from '@/utils/rules'
export default {
  name: 'SessionTime',
  data() {
    const sessionBetween = (rule, value, cb) => {
      let _value = +value || 0
      if (_value < 600 || _value > 7200) {
        cb(new Error(rule.message))
      } else {
        cb()
      }
    }
    return {
      isLoading: false,
      baseModel: {
        sessiontime: ''
      },
      baseRules: {
        sessiontime: [
          {
            required: true,
            message: '请输入web登录超时时间'
          },
          { validator: intValidator, message: '请输入整数' },
          {
            validator: sessionBetween,
            message: '超时时间10分钟~120分钟（600~7200）'
          }
        ]
      }
    }
  },
  created() {
    this.getSessionTime()
  },
  methods: {
    // 加载sessionTime
    getSessionTime() {
      this.$api.getSessiontime().then(sessiontime => {
        this.baseModel.sessiontime = sessiontime
      })
    },
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isLoading = true
          this.$api
            .setSessionTime(this.baseModel.sessiontime)
            .then(d => {
              this.$message({
                type: 'success',
                message: '修改成功',
                duration: 2000
              })
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
